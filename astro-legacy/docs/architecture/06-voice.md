# 06 · Voce

_Actualizat în: PR0_

![Voce](diagrams/voice.svg)

Audio-ul este **dezactivat**: `audiobook.js` și `initAudioPlayer()` din `platform.js` ies imediat cu `return`. Codul rămas folosește Web Speech API, StreamElements (API neoficial, voce „Ioana”) și un format JSON de audiobook cu timestamps.

Planificat (PR10):
- Furnizori interschimbabili: OmniVoice prin Hugging Face Space (acum), fișiere pre-generate (mai târziu), Web Speech (rezervă).
- Voce automată cu seed fix; text normalizat în română; o cerere per secțiune, cu evidențiere.
- Circuit breaker în browser (3 eșecuri → Web Speech pentru o oră); comutator global din `/admin` (vezi [07](07-admin-config-health.md)).
- StreamElements, `audiobook.js` și audio-ul din `platform.js` se șterg.
