# I2ST UI

Focused React UI for selecting an I2ST roleplay scenario/persona and talking to the contained chatbot service.

## Run

Start the chatbot service first:

```bash
cd /datadrive/luis/projects/I2ST/chatbot
python3 app.py serve --host 0.0.0.0 --port 8787
```

Start the UI:

```bash
cd /datadrive/luis/projects/I2ST_UI
npm install
npm run dev -- --host 0.0.0.0 --port 5174
```

The Vite dev server proxies `/chatbot/*` to `http://127.0.0.1:8787`.

## Shareable demo build

The demo build keeps the same UI but replaces the local chatbot and authoring
services with dataset-backed scenarios and scripted responses.

```bash
npm run dev:demo
npm run build:demo
```

For Netlify, use this directory as the site root. The included `netlify.toml`
runs the demo build and publishes `dist`.
