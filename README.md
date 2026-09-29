# Tiny Desktop Pet 🐾

A real Electron desktop companion

## What it does

- Transparent, frameless, always-on-top pet window.
- Animated breathing/bobbing plus entering/leaving motion and walking-style motion hooks.
- Pet visits on a configurable interval (default 5 minutes).
- Water reminders are separate from normal check-ins.
- Small draggable summon button.
- System tray: Summon Pet, Chat, Settings, Pause Pet, Resume, Quit.
- Compact chat beside the pet.
- Basic offline responses for common messages.
- Optional AI chat through the OpenAI API.
- Personality and reminder messages live in editable JSON files.
- Settings persist locally.
- Quiet mode: 30 minutes, 1 hour, until tomorrow, or resume.
- Launch-at-login and always-on-top settings.
- "Bring Pet On Screen" helper resets the saved summon-button position.

## Requirements

Install Node.js LTS (includes npm) on Windows or macOS:
https://nodejs.org/

## Start

### Windows
Double-click **Start Tiny Pet.bat**.

### macOS
First allow Terminal to execute the launcher:
```bash
chmod +x "Start Tiny Pet.command"
```
Then double-click **Start Tiny Pet.command**.

The first launch installs Electron automatically.

## Validate

From a terminal in this folder:
```bash
npm run validate
```

Then:
```bash
npm start
```

## AI mode

Open Settings, enable **AI chat**, and enter your OpenAI API key. The app stores the key using Electron's `safeStorage` encryption when the operating system supports it. The key is not hard-coded into the source.

For privacy/cost control, Basic mode is the default.

## Customize personality/messages

Edit:
- `config/personality.json`
- `config/messages.json`

The current renderer contains matching fallback messages so the pet remains functional even if config files are edited.

## Replace the art / add sprite frames

Replace `assets/pet.png` or add transparent PNG sprite frames under `assets/`.

The animation logic is intentionally separated in `src/pet-renderer.js`, so later you can swap the single reference image for a sprite-sheet/frame system without rebuilding the app architecture.

## Bring the pet back

If the summon button is lost off-screen, close Tiny Pet and double-click:
**Bring Pet On Screen.bat**

Then start Tiny Pet again.

## Notes

This project is intentionally lightweight. The pet window stays alive but is hidden between visits, so repeated summons continue to work. There is no background animation loop while the pet is hidden.


## Moving the pet

You can now **click and drag the pet itself** anywhere on the visible desktop. Its position is clamped to the screen and saved locally, so the next summon returns to the place where you left it. A simple click without dragging still opens the pet chat.
