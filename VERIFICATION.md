# Verification — 1.5.0

Completed:
- 40 Node tests passed. Added five box/diagram tests and six wake-lock lifecycle tests alongside the existing theory, playback, lick-articulation, appearance and progression checks.
- All five shapes for all five scale families in every key checked for six-string coverage, valid pitches, all scale degrees, root markers and playable fret bounds. All five A-minor pentatonic shapes checked against explicit standard fingerboard patterns; every pentatonic shape has two notes per string.
- Every diatonic triad/seventh chord in major and natural minor, in every key, has a matching diagram including diminished and half-diminished chords.
- Headless Chromium integration: old local notes/setups preserved; new notes survive reload; a separate browser context has no copies of them; no non-GET requests were sent while saving. Scales → Jam carries key and box; Practice Path loads named shapes; Lick Lab box overlays toggle correctly for all six phrases.
- Jam diagrams update on manual selection and during playback; diagrams-only and combined views work; upcoming-third overlays remain functional. Scale one-shot playback completes.
- Mobile (390px) checks across all six sections: no page-level horizontal overflow. Scale shape and Jam diagrams screenshots inspected. Mobile diagrams stack vertically so finger numbers remain readable.
- Wake lock: enabled setting persists; the headless browser reported native wake-lock rejection without breaking audio. A simulated supported wake-lock API verified successful acquisition through the real playback/timer UI, retry and pause/release. Unit tests cover stop, disable, hidden/visible transitions, device release, denied/unsupported/insecure contexts and delayed requests completing after stop.

Limits:
- A physical phone's screen timeout and OS battery restrictions cannot be tested here. Test on your mobile HTTPS address and look for “Screen awake: active”. HTTP server-IP addresses do not qualify on a phone.
- Deliberately locking the device or leaving the browser still stops playback. This release prevents automatic timeout when the browser grants a screen lock; it does not implement background audio.
- Docker is unavailable in this environment. The unchanged container configuration was not run; browser testing served the same static files over HTTP on localhost (a secure-context exception for testing).
- No microphone input, automatic assessment or cross-device sync. Saves remain local to the device/browser and website origin. HTTPS and HTTP addresses have different browser storage.

Quick checks after updating:
1. Confirm version 1.5. Existing saved setups and notes should still appear at the same address.
2. Scales: A minor pentatonic → Box 1. Verify the familiar 5–8 pattern, play it, and open it in Jam room.
3. Chords: open a progression in Jam room. Both current/next diagrams and the chord-tone map should appear; choose diagrams only if preferred.
4. Play a backing track on your mobile HTTPS address. Verify “Screen awake: active” and leave it beyond your usual timeout. Stop playback and check that the status returns to ready (unless the practice timer is still running).
5. If screen awake is unavailable, follow the displayed HTTPS/browser/timeout advice. If moving to a new address, keep the previous address available for its existing local saves.
