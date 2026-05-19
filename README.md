# Kinetic Portfolio

Motion-led portfolio prototype. Cursor reveals, page transitions, hover films.

## Stack

Vanilla HTML / CSS / JS. No build step.

- `index.html` — markup, sections, video tiles
- `styles.css` — layout, type, motion, theme bands
- `script.js` — cursor, page wipes, magnetic nav, reveals

## Run

Serve directory over HTTP (videos block on `file://`):

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Features

- Custom cursor with hover labels and video reel
- Slanted page-wipe transitions on nav clicks
- Masked word reveals, line-by-line text rhythm
- Hover-play project tiles (NeoLeaf, Holocene, Pulse Lab, Soft Circuit)
- Magnetic nav links, scrolling gallery strip
- Theme bands per section

## Assets

Project videos (`.mp4`) and Pexels-sourced stills sit at repo root. Replace freely.

## Deploy (Vercel)

Static site, no build step. Push to GitHub, import in Vercel dashboard, framework preset = "Other". `vercel.json` handles cache headers; `.vercelignore` skips unused media (~55MB saving).

CLI alt:

```bash
npm i -g vercel
vercel
```

## License

Prototype — no license. Ask before reuse.
