# Speech synthesis (TTS): Ayhem's work

Owner: **Ayhem** (Hugging Face account `Code-Quasar`). Code will live in `services/tts/`.
Status: **in progress.** A fine-tuned Derja voice model is published and produces Tunisian speech. It has not been evaluated yet.

This file records everything that is public about the work, as checked on **30 Oct 2026** from the Hugging Face repositories:

| Thing | Link | Published |
|---|---|---|
| Model | https://huggingface.co/Code-Quasar/voxcpm-tn | 20 Sep 2026 |
| Dataset | https://huggingface.co/datasets/Code-Quasar/Tn-TTS | 19 Sep 2026 |
| Base model | https://huggingface.co/openbmb/VoxCPM2 | OpenBMB, Apache-2.0 |

Everything below was either read from those repositories or measured from them (marked *measured*). Where the information is not public, the text says **unknown (Ayhem to fill in)**.

---

## 1. Summary

| | |
|---|---|
| Base model | VoxCPM2: 2B parameters, tokenizer-free, diffusion + autoregressive, 30 languages including Arabic, 48 kHz output |
| Method | **Full fine-tuning** (all weights), **147 steps** |
| Training data | `Code-Quasar/Tn-TTS`: **4,730 clips ≈ 8.5 h** for training and 179 clips ≈ 0.2 h for validation, 16 kHz mono (*measured*) |
| Text format | Every transcript starts with a tag: `(Tunisian Dialect)` or `(Tunisian Dialect, <style>)` |
| Output | 48 kHz audio |
| License | Model: Apache-2.0. Dataset: **no license stated**; built from corpora with their own terms |
| Evaluation | **None published yet** |
| Downloads | Model 53, dataset 14 (on 30 Oct 2026) |

## 2. The model: `Code-Quasar/voxcpm-tn`

### Files

| File | Size | Notes |
|---|---|---|
| `model.safetensors` | 9.16 GB | 577 tensors, all **float32** (*measured*). The base model stores the same 577 tensors in bfloat16 (4.58 GB) |
| `audiovae.pth` | 377 MB | AudioVAE V2: turns sound into latents and back. Same size as the base model's file |
| `config.json` | 4.3 KB | **Identical to the base model's config** (*measured*); fine-tuning did not change the architecture |
| `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json` | | Same tokenizer as the base (`VoxCPM2Tokenizer`, vocabulary 73,448) |
| `README.md` | | The model card |

The base repository also has `tokenization_voxcpm2.py`, which is **missing here**. Loading through the `voxcpm` package works without it, but loading through `transformers` may need it.

Upload history: 8 commits on 20 Sep 2026 between 14:19 and 14:21 UTC (initial commit, model card, config, weights, AudioVAE, tokenizer files).

### Architecture

The architecture comes from `config.json`. The parameter counts were *measured* from the weights header.

```
Derja text ─► Text-Semantic LM ─► Residual Acoustic LM ─► Local diffusion decoder ─► AudioVAE decoder ─► 48 kHz audio
(+ optional reference clip ─► Local encoder ─┘          (each generated latent patch is fed back: autoregressive loop)
```

| Block | Weight prefix | Size | Details from config |
|---|---|---|---|
| Text-Semantic LM (TSLM) | `base_lm` | 1,471.7 M | MiniCPM-4 style. 28 layers, hidden size 2048, FFN 6144, 16 attention heads with 2 key/value heads (grouped-query attention), LongRoPE up to 32,768 positions, vocabulary 73,448 |
| Residual Acoustic LM (RALM) | `residual_lm` | 377.5 M | 8 layers, no RoPE |
| Local diffusion decoder (LocDiT) | `feat_decoder` | 212.0 M | 12 layers, hidden size 1024, 16 heads. Conditional flow matching with an Euler solver, log-normal time scheduler, classifier-free guidance 2.0 at inference |
| Local encoder (LocEnc) | `feat_encoder` | 207.7 M | 12 layers, hidden size 1024, 16 heads |
| Projections, quantizer, stop head | `fusion_concat_proj`, `stop_proj`, `fsq_layer`, `*_proj`, `stop_head` | ≈ 21 M | Scalar quantization: latent size 512, scale 9 |
| **Total (transformer weights)** | | **2,290 M** | Plus the AudioVAE in a separate file |

**Audio representation.**
- The AudioVAE encodes **16 kHz** input with strides 2·5·8·8 = 640, which gives **25 latent frames per second** of 64 dimensions each.
- It decodes with strides 8·6·5·2·2·2 = 1920 at **48 kHz**, which is also 25 frames per second. The upsampling to 48 kHz is built in.
- The language model works on patches of 4 frames, so it generates **6.25 patches per second of speech**.
- The maximum sequence length is 8192.

### The fine-tune really changed the weights (*measured*)

We compared a sample of tensors between the base model and this model, using byte-range reads of both weight files:

| Tensor | Relative change |
|---|---|
| `stop_head.weight` (decides when speech ends) | 1.3 % |
| `stop_proj.bias` | 0.65 % |
| `fsq_layer.in_proj.bias` | 0.40 % |
| `base_lm.layers.0.input_layernorm.weight` | 0.29 % |
| `base_lm.layers.10.input_layernorm.weight` | 0.014 % |
| `base_lm.norm.weight` | 0.006 % |

- Every block was updated, which confirms a full fine-tune.
- The changes are small. That is consistent with 147 steps.
- The end-of-speech head moved the most.

### Usage (from the model card)

```python
from voxcpm import VoxCPM
import soundfile as sf

model = VoxCPM.from_pretrained("Code-Quasar/voxcpm-tn", load_denoiser=False)
wav = model.generate(text="(Tunisian Dialect) عسلامة، شنوة أحوالك اليوم؟")
sf.write("out.wav", wav, 48000)
```

- **Always prefix the text with the tag.** Every training transcript had it, so untagged text is out of distribution.
- **Style tags.** The training data used five style tags (see §3), so these should work as style control: `(Tunisian Dialect, calm)`, `(Tunisian Dialect, cheerful)`, `(Tunisian Dialect, serious)`, `(Tunisian Dialect, measured)`, `(Tunisian Dialect, conversational)`. In the base model, text in parentheses is a voice and style instruction. *Not yet tested.*
- **GPUs with less than ~8 GB:** set `os.environ["TORCHDYNAMO_DISABLE"] = "1"` before loading.
- **Streaming:** `model.generate_streaming(text=...)` yields audio chunks. This is a base-model feature and is not yet tested on this fine-tune.
- **Speed (base model figures):** real-time factor about 0.30 on an RTX 4090, or about 0.13 with Nano-vLLM. Slower than real time on CPU.

## 3. The dataset: `Code-Quasar/Tn-TTS`

### Format

The dataset is 1.01 GB of Parquet files: 3 training shards and 1 validation shard. Each row has:

- `audio`: 16 kHz mono
- `text`: the transcript, starting with the dialect tag
- `ref_index`: the row of a reference clip from the same speaker, used for in-context voice cloning during training, or −1 if there is none

The card says it was prepared with a `data.py pull` script, which writes WAV files and training manifests. **That script is not in the dataset repository** (Ayhem to add it to `services/tts/`).

### Measured statistics

All rows were read through the Hugging Face datasets server. Durations were read from the WAV headers: every 10th training clip, and every validation clip.

| | Train | Validation |
|---|---|---|
| Clips | 4,730 | 179 |
| Estimated hours | **≈ 8.5 h** | ≈ 0.19 h |
| Clip length: mean / median | 6.5 s / 5.3 s | 3.8 s / 2.5 s |
| Clip length: min / max | 1.0 s / 19.8 s | 1.0 s / 12.0 s |
| Clips under 3 s | ≈ 12 % | ≈ 60 % |
| Clips over 30 s | 0 | 0 |
| Rows with a reference clip | 1,452 (31 %) | 58 (32 %) |
| Average transcript length | 72 characters | 55 characters |
| Rows containing Latin-script words (French or English) | 3,568 (75 %) | 27 (15 %) |
| Share of Latin characters | 31 % | 13 % |

**Style tags in training:**

| Tag | Rows |
|---|---|
| `(Tunisian Dialect)` (no style) | 2,649 |
| `cheerful` | 438 |
| `calm` | 436 |
| `measured` | 408 |
| `conversational` | 406 |
| `serious` | 393 |

How the style labels were assigned is unknown (Ayhem to fill in: by hand, by a model, or from source metadata).

**Sample training transcripts** (verbatim):

```
(Tunisian Dialect) واعين ناس كل خطوة نعملوها donc باش نحكي على
(Tunisian Dialect, measured) عنا des compétences في تونس
(Tunisian Dialect) people are building spaceships قاعدين يمشيوا للڨمرة لعباد
```

### Observations

- **Good:**
  - Real code-switched Derja: French and English stay in Latin script, which matches the project's text convention.
  - Clip lengths sit inside VoxCPM's recommended 3–30 s range for most rows.
  - About 31 % of rows have a reference clip, which matches VoxCPM's guidance of 30–50 %.
- **Spontaneous speech, not read speech.** The training text reads like spontaneous talks with a lot of French and English, while the model card says "read speech".
- **The validation set looks like a different source.** Its clips are shorter (median 2.5 s), with much less French (13 % vs 31 % Latin characters). So validation loss does not measure quality on the training domain or on government-service sentences.
- **Text cleaning needed:**
  - **86** training transcripts contain an invisible byte-order mark (U+FEFF).
  - **1,244** have Arabic and Latin letters glued together with no space, e.g. `absurdياسر`, `santéمعناهاet`.
  - Some French is misspelled, e.g. `scénes`.
- **Licence:**
  - The dataset has no licence. The card says it is "derived from corpora with their own licence terms; the voices belong to real speakers".
  - The source corpora are not named (Ayhem to fill in). Several public Tunisian speech corpora are non-commercial (CC BY-NC).
  - This must be clarified before any public or government deployment.

## 4. Training run

| | |
|---|---|
| Method | Full fine-tuning (not LoRA) |
| Steps | 147 |
| Audio input | 16 kHz; output 48 kHz |
| Text | Dialect tag + optional style tag + transcript |
| Batch size, learning rate, epochs | **unknown (Ayhem to fill in)** |
| GPU, training time | **unknown** |
| Training config file (`conf/voxcpm_v2/voxcpm_finetune_all.yaml` or a modified copy) | **unknown, please commit it** |
| Loss curves, chosen checkpoint | **unknown** |

147 steps is short. With a batch of 16 clips, it covers about 2,350 clips, roughly half of one pass over the 4,730 training clips. A full epoch at batch 16 is about 296 steps. The model card itself warns: "expect limited prosodic range and weaker long-form phrasing."

## 5. Evaluation status

Nothing is measured yet. Planned checks, in order of usefulness:

1. **ASR round-trip.** Synthesize a fixed list of sentences, transcribe them with a Tunisian ASR model, and compute the character error rate (CER).
   - First measure the ASR model's own CER on real recordings of the same sentences. That is the floor.
   - A ready baseline ASR model: `linagora/linto-asr-ar-tn-0.1` (runs on CPU).
2. **Listening test (MOS)** with 15–20 native Tunisian listeners, plus a side-by-side comparison against:
   - the base VoxCPM2 model with no fine-tune, given Arabic text
   - Habibi-TTS (an F5-TTS model with a Tunisian dialect ID; non-commercial, so a comparison baseline only)
3. **Test sentences from the project domain:**
   - administrative phrases (carte d'identité, extrait de naissance, passeport)
   - numbers, dates, amounts in dinars, ID numbers
   - questions and lists
4. **Style tags:** check that each of the five tags audibly changes the speaking style.

## 6. Next steps, ranked by impact for effort

1. **Document the run** (low effort): commit the training config, `data.py`, the batch size, learning rate, GPU and the loss curve. Fill the model card's "~? h" with "≈ 8.5 h".
2. **Clean the transcripts** (low effort, high impact): strip U+FEFF, add a space at every Arabic↔Latin boundary, fix French spelling, and use one spelling convention throughout.
3. **Text frontend before synthesis** (low effort, high impact): write numbers, dates, times, dinar amounts and ID numbers out in Derja words, and keep a lexicon of French administrative terms. This matters most for government answers.
4. **Train longer and pick checkpoints by measurement** (medium effort, high impact):
   - Run several epochs instead of 147 steps.
   - Hold out a validation set from the *same* domain as training.
   - Keep the checkpoint with the lowest ASR round-trip CER, not the lowest loss.
   - Compare with LoRA (r 32–64, DiT enabled), which VoxCPM recommends.
5. **Evaluate** (medium effort): the checks in §5, so that "kinda good" becomes a number.
6. **Domain data** (high effort, highest long-term impact): 2–10 h from one consenting voice talent reading real administrative answers, of which at least 20 % are numbers and dates.
7. **Shrink the release** (low effort): save the weights in bfloat16 (9.16 GB → about 4.6 GB, the same precision the config already declares) and add `tokenization_voxcpm2.py` from the base repository.
8. **Before going public** (required): name the source corpora and their licences, get consent for the voices used, add an audio watermark (VoxCPM has none built in; AudioSeal is an option), and turn off open voice cloning in the public service.

## 7. Integration

The proposed HTTP interface for the rest of the pipeline is in [API.md](API.md). Ayhem confirms it or changes it.
