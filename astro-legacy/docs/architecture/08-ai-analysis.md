# 08 · Analiză AI (`analiza-bac`)

_Actualizat în: PR0_

![Analiză AI](diagrams/ai-analysis.svg)

- Elevul încarcă un PDF sau o imagine; pdf.js (de pe cdnjs) extrage textul în browser.
- Textul e trimis cu `fetch` la `https://text.pollinations.ai/` (fără cheie, fără contract).
- Nu există acord explicit, previzualizare a textului trimis sau mențiune că evaluarea e orientativă.

Planificat:
- PR8: acord obligatoriu, previzualizare editabilă, stări clare, disclaimer; interfață comună pentru furnizori AI (Pollinations implicit).
- PR9: comutator în `/admin`.
- PR11 (opțional): Cloudflare Worker + Gemini Flash (imagini + barem oficial, rate limit, ștergere date personale) și opțiunea „Am cheia mea” pentru profesori.
