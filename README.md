# Business Card Maker (Khmer / English)
React + Vite + Tailwind 4 + Fabric.js 6 + Zustand + IndexedDB + qrcode + jsPDF.

## Run
npm install, then npm run dev. Production: npm run build (output dist), npm run preview.

## Deploy to Vercel
Import the repo, framework Vite, build command npm run build, output dist. vercel.json provides the SPA fallback. No environment variables.

## Features
30 editable templates, front and back, text/shapes/images, QR (url, phone, email, WhatsApp, vCard, text) with colours, gradient backgrounds,
copy/paste/duplicate/lock/centre, undo/redo, IndexedDB projects (rename, duplicate, delete, JSON import/export),
PNG/JPG export, PDF (front+back, 90x54 mm), A4 sheet of 10 cards with crop marks, safe-area guide.

## Known gaps / not yet verified
Never run in a browser by the author of this snapshot. Not implemented: other card sizes, portrait, true bleed, rulers, grid/snap, group, crop,
border/shadow, SVG upload, offline/PWA, self-hosted fonts, AdSense slots, automated tests. Several UI labels are English-only.
