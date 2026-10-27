# Pocket Guitar 1.5

A self-hosted guitar practice room for following chord changes and building musical phrases. Standard tuning, 4/4, no external audio downloads or paid APIs.

## Update an existing installation

**Portainer with bind mounts:** copy the entire new `public` folder into `/opt/guitar-practice/public`, replacing existing files. Refresh the browser (Ctrl+F5 if necessary). No stack changes are required. Copy the whole folder: this release adds several JavaScript modules.

**Built Docker image:** replace the source files, then run from the extracted folder:

```sh
docker compose up -d --build
```

The header should display version **1.5**. Settings, saved setups, colours and practice notes remain in the same browser when using the same address. Existing lick completion marks are preserved.

## First installation

Extract the ZIP and open a terminal in the `guitar-practice` folder:

```sh
docker compose up -d --build
```

Open `http://YOUR-SERVER-IP:8088` (or `http://localhost:8088` on the same machine). Change `8088:80` in the compose file if necessary.

For Portainer, extract the folder on the Docker host so `/opt/guitar-practice/public/index.html` and `/opt/guitar-practice/nginx.conf` exist. Add a Stack using the Web editor and paste `portainer-stack.yaml`. Change both host paths if you use a different folder. Use Docker Standalone; with Swarm, bind-mounted files must exist on each relevant node.

The image needs to be pulled initially. The running app then serves local files, with no external fonts or audio services. To stop a Compose installation, run `docker compose down`.

## New in 1.5

### Your data stays on your device

Saved setups, practice notes, learning progress and preferences are stored in the browser's local storage, never on the Docker volume. This was already the case in 1.4; Settings now states it explicitly. Docker serves only static app files. Each phone/computer and browser has separate data. Existing notes and setups remain when you use the same browser and address. Clearing site data removes them. Switching from HTTP to HTTPS creates a different browser storage origin, so existing HTTP saves will not automatically appear at the HTTPS address.

### Scale boxes throughout the app

- Minor pentatonic: five familiar two-note-per-string patterns, **Box 1–5**. A minor Box 1 is the standard pattern at frets 5–8.
- Major scale and major pentatonic: five named **CAGED shapes** (E, D, C, A, G, ordered along the neck). A shape name describes the fingering family, not the key: G major can use an E shape.
- Natural minor: the five corresponding minor boxes, with the extra scale notes included.
- Blues: the minor boxes plus the flat fifth as a passing note.

Choose a key and box; the fingering transposes automatically. Fret numbers remain as location references. The background outline marks the actual notes of the shape rather than filling an arbitrary six-fret rectangle. Numbering conventions can differ between books; this app uses the familiar minor-pentatonic order for minor/blues and CAGED names for major.

Scales Trainer now plays the whole box across six strings, low to high, high to low or both. The first/last note need not be a root. Square markers identify the roots: practise resolving your own phrases to those. Hide note names to test recall, or show neighbouring notes for context. Use in Jam room carries over the same key, scale and box.

Jam room uses the same shapes. Current/upcoming chord targets can extend beyond a box's outlined notes, helping you resolve as the progression changes. Practice Path loads named boxes. Lick Lab shows the closest reference box around the phrase; bends, passing notes and adapted endings can fall outside it. You can turn that background box off without changing the lick.

Existing saved setups retain their musical settings; old fret-window selections open in the first box for their scale family until you choose a box and save again.

### Chord diagrams in the Jam room

Use **Jam room view** to choose:

- **Chord tones / scale box:** the soloing map.
- **Chord diagrams:** current and next chord fingerings, useful for practising changes.
- **Chords + chord tones:** both views.

Open in Jam room from Chords automatically selects the combined view. Diagrams prefer open shapes where available and follow the playing chord, including the last-to-first loop transition. Diagrams show standard low E → high e orientation even if the horizontal solo map is left-handed. Diminished and minor-7-flat-5 shapes cover the remaining diatonic chords. The backing uses arranged voicings; Hear this voicing in Chords plays the exact displayed fingering.

### Prevent mobile screen timeout

**Settings → Keep screen awake during playback and timed practice** starts enabled. The app requests a screen wake lock during Jam, scale, chord or lick playback and while the practice timer runs. It releases the lock when those activities stop/pause, or the option is disabled. A status line shows whether the lock is active; Retry is available after a device release or denial.

On a phone, this requires the app to be served over **HTTPS** and a browser supporting screen wake lock. A plain `http://SERVER-IP:8088` connection will not qualify. Use your HTTPS reverse proxy address; Docker can continue serving port 8088 behind it. There are no required stack changes for an existing HTTPS proxy.

If the browser/device refuses the request (for example with power-saving settings), the app reports it rather than claiming the screen is protected. Increase your phone's screen timeout for the session if wake lock is unavailable. This prevents automatic timeout while the app is visible; it does not enable playback with the phone manually locked or another app in front. Timed sessions reacquire the lock when returning to the app, while audio still requires Play after leaving it.

## Learning tools and backing sound

Scales Trainer, Chord Library, seven practice progressions and Beginner/Improver/Intermediate 20-minute paths remain available. The Practice Path dock follows navigation; exercises load without automatically starting audio. Theme choices are Forest, Midnight, Warm studio and Daylight, independent of fretboard colours.

In Jam room, **Band sound & layers** provides Acoustic practice, Studio band, Blues trio and Soft ambient presets. Toggle plucked strings, electric piano, soft pad, bass and percussion, with individual levels and room ambience. Chord practice uses the same mix; Lick Lab keeps percussion off. Instruments are synthesised locally, not recorded musicians; no sample downloads or audio service are required.

## Jam room: see where to go next

Choose a key, progression, tempo and accompaniment. Generate a variation or edit up to 16 chord slots. Folk, country, major, natural minor and dominant 12-bar blues are included. Blues uses one-bar slots; other styles allow one, two or four bars per chord.

Above the fretboard, tick **Show upcoming chord targets** and choose:

- **All chord tones:** see every tone of the next chord, including sevenths if enabled.
- **Root only:** a simple arrival point.
- **Third only:** aim for the note that gives the next chord its major/minor character.

The overlay updates with the current chord and includes the last-to-first loop transition. It always refers to the **next chord slot**, even when the current slot spans multiple bars or repeats the same chord. It is visible throughout the slot so you have time to plan. It also works while stopped: click a chord card to inspect it and the next chord.

**N** marks a next-chord target. A note belonging only to the next chord uses the upcoming colour. A shared current/next chord tone keeps its current fill and gains an upcoming-colour ring. The current root and chord tones therefore remain visible. Target notes appear even if outside the selected scale overlay. In interval-label mode, shared-note labels describe the current chord; next-only labels have an arrow and describe the next chord. Hover/tap accessibility labels give both roles.

The overlay starts off by default and saves with your musical setup. You can change its checkbox/mode during playback without stopping the backing. The separate Connect the changes tab has been removed; the exercise now lives in the Jam room.

Try G–C–D–G at 65 BPM, Upcoming → Third only. The next targets are E, F♯, B, B. Play a short phrase and arrive on the relevant third at the next chord’s beat 1. Shared tones can be held rather than moved.

## Fretboard colours and readability

Open **Settings → Fretboard colours & readability**. Choose a high-contrast, warm/purple, light or original palette, or customise:

- Board background and fret/string lines
- Roots/targets, chord/phrase notes and scale notes
- **Upcoming targets** (pink in the default high-contrast preset)

Note labels choose black or white automatically for readable contrast. Standard/large note sizes are available. Root/target squares, scale-note dashed borders and the next-chord N badge provide cues beyond colour. Focus notes gain an outline instead of making all other notes disappear. Choosing similar custom colours can still make categories hard to distinguish; Reset restores the high-contrast defaults.

Preferences save separately from musical setups. Older colour settings are preserved, with a default upcoming colour added.

## Lick Lab: listen → copy → adapt

Six original one-bar phrases now include actual pitch gestures, articulation and genre-specific feel:

| Phrase | Main features |
| --- | --- |
| A rolling folk answer | Hammer-on, pull-off, space and a settled third |
| Pedal-steel country answer | Bend one note against a held double-stop, pull-off and vibrato |
| Chicken-pickin’ snap | Bright, clipped accents and chromatic hammer-on |
| Minor blues bend & reply | Shuffle, whole-tone bend/release, pull-off and vibrato |
| Blues bite, major landing | Shuffle, minor-to-major third hammer-on, slide and bend/release |
| Sliding folk descent | Slide, pull-off and a spacious ending |

Start at 55–65 BPM. Key selection transposes the tab, gesture endpoints and audio together. Shapes generally move up the neck; where a gesture would exceed fret 22, the phrase moves down an octave if possible. Explanations refer to the original key; the tab and target callout show the selected key.

### Playback modes

1. **Listen:** hear the phrase over its home chord after a four-beat count-in. Uncheck Loop practice to hear it once.
2. **Listen, then copy:** a demo bar, then an answer bar over the same chord. The lead guide is silent during your turn, but timing highlights continue.
3. **Adapt to the changes:** each chord gets a demo and copy bar. Only the final note changes to the current chord’s third. Bends and other gestures in the opening stay intact; they can create tension over the new chord, which you resolve with the final target.

Blues phrases use long–short shuffle eighths; country and folk phrases use straight eighths. The count labels remain 1 & 2 & 3 & 4 &, with each shuffle & occurring later. Each tab column is a rhythmic subdivision; the column width is not a proportional time axis for shuffle.

### Reading expressive tab

- **3h5:** pick fret 3, then hammer onto fret 5 on the same string without picking again.
- **8p5:** fret both positions, pick fret 8, then pull off to fret 5.
- **5/8:** pick and slide from fret 5 to fret 8.
- **10b12:** fret 10 and bend until it sounds like fret 12. Do not move your finger to fret 12.
- **7b9r7:** bend fret 7 to the pitch of fret 9, then release to the original pitch.
- **~:** vibrato.

On the fretboard, numbered dots show phrase order. A dashed dot with **b** is the bend’s pitch destination, not a second finger position. An arrow identifies a slide/legato destination. A square marks the final target. Tap a dot to hear its reference pitch. The full demo plays the gestures; hammer-ons/pull-offs use one picked attack, slides/bends change pitch, and vibrato modulates the held note.

The sound is still a synthesised guide, not a recorded guitar or exact simulation of guitar mechanics. The country voice is brighter and shorter; the blues voice has more sustain and harmonic weight. “Comfortable with this phrase” is self-assessment, not microphone scoring.

## Other features and controls

- Six focused solo lessons, a guided 20-minute timer and a practice journal.
- Ear Trainer has been removed.
- Named scale boxes, chord/scale overlays, root/third focus and left-handed horizontal Jam room view.
- The Jam room volume controls all playback. Only one backing player runs at a time.
- Space starts/stops Jam room playback when focus is outside form controls and buttons.
- Musical setting changes stop the backing; display options and volume can change live.
- Playback stops when the browser tab is hidden to avoid background timer drift.
- The practice timer continues between app sections; page reload resets it.
- Audio begins only after a click/tap. Check browser/system volume if silent.

## Data and access

The browser stores settings, up to 50 setups and 100 practice notes (the latest 20 are displayed), appearance preferences and lick completion marks. Nothing is stored in a server database or synced across devices. Clearing site data removes it; changing address/domain uses a different storage area.

The app has no authentication. It is designed for a home network; use an authenticated reverse proxy if exposing it externally.

## Development and checks

No npm packages are needed to run the app. For local development:

```sh
python3 -m http.server 8088 --directory public
```

Do not open index.html as a file: JavaScript modules need an HTTP server. Automated tests use Node’s built-in runner:

```sh
node --test tests/*.test.js
```

See `VERIFICATION.md` for the tests performed and remaining limitations.

## v1.6.0 — Personal Tutor

The default landing screen is **Today**, with guided routines in **Learn**, a consolidated **Practice** studio, and **Jam** for creative application. Existing tools, local storage keys and settings are preserved. Guided routine completion counts use a new browser-local key `pocket-guitar-tutor-sessions-v1`. Chord diagrams now use horizontal strings with high E at the top; their fret positions and finger numbers are rendered directly in that orientation. This release does not include audio-based performance assessment or automatically personalised lesson selection.
