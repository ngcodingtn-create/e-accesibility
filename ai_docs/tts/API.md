# TTS API (proposed v0.1)

This is the interface between the Derja LLM / web front end (Med Amine) and the speech synthesis service (Ayhem). **Status: proposed.** Ayhem confirms or changes it. After that, it only changes with both owners' agreement.

## Running the service

```bash
uvicorn tts.api:app --port 8002
```

It runs on a GPU with about 8 GB of VRAM or more. On smaller GPUs, set `TORCHDYNAMO_DISABLE=1`.

## Endpoints

### `GET /health`

```json
{ "status": "ok", "model": "Code-Quasar/voxcpm-tn", "sample_rate": 48000, "device": "cuda" }
```

### `POST /tts`

Request:

```json
{
  "text": "باش تعمل passeport لازمك 3 وثائق.",
  "style": "calm",
  "stream": false
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `text` | string | yes | Derja in Arabic script, with French/English words in Latin script, and no tag. The service adds the tag `(Tunisian Dialect)` or `(Tunisian Dialect, <style>)` itself. |
| `style` | one of `calm`, `cheerful`, `serious`, `measured`, `conversational`, or `null` | no | A style tag seen in training. Default: `null`, which means the plain tag. |
| `stream` | bool | no | `true` returns audio chunks as they are generated. |

**Response:**
- `stream: false`: `audio/wav`, 48 kHz mono.
- `stream: true`: a chunked stream of 16-bit PCM at 48 kHz.

**Done inside the service, before synthesis:**
1. Split long answers into sentences.
2. Write numbers, dates, dinar amounts and ID numbers out as Derja words.
3. Strip the U+FEFF character and add a space at every Arabic↔Latin boundary.

**Errors:** `{ "error": "<code>", "detail": "<message>" }`

| Status | Error code | When |
|---|---|---|
| 400 | `invalid_request` | The request is not valid. |
| 413 | `text_too_long` | The text is longer than 1,000 characters. Split it upstream. |
| 503 | `model_loading` | The model is still loading. |
