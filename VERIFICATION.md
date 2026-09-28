# Verification — 1.2.0

Completed:
- 19 automated tests cover music theory, all original progression/key/accompaniment combinations, scheduling, stop behaviour, one-shot playback, lick transposition in all 12 keys, correct third targets, demo/copy plans and same-string chord connections.
- Automatic black/white label contrast tested against all palette colours and a 4,096-colour RGB grid: minimum 4.5:1.
- Headless Chromium integration checks: app startup; all six lick choices and 12 keys; single-play stopping; live Adapt target changing from G/B to C/E; colour persistence and reset; learnt-phrase persistence; saved setup persistence; G-to-C connection targets; player handoff; no JavaScript errors.
- Desktop and 390px mobile screenshots inspected. Wider fretboards and tabs scroll within their panels rather than overflowing the page; the trainer centres the relevant note positions when rendered.

Limitations:
- Docker is unavailable in this build environment, so the unchanged container configuration was not executed here.
- Real Web Audio calls run during browser tests, but perceived sound quality on your device was not assessed by listening.
- There is no microphone capture or automatic playing assessment. Phrase completion marks are your own self-assessment.

After updating:
1. Confirm version 1.2 in the header and the Lick Lab / Connect the changes tabs.
2. Open Fretboard colours & readability. Try a preset, then adjust a colour and refresh to confirm it persists.
3. In Lick Lab, start with A little folk answer at 65 BPM, Listen mode. Then try Listen, then copy, followed by Adapt to the changes.
4. In the Jam room choose Country in G, then open Connect the changes. The first G-to-C transition should show B moving to C.
