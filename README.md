# Snake Fever

Browser edition of Snake Fever. Open the GitHub Pages URL and click to load the game.

Arrow keys / WASD: steer. F: 10-second fever, once per round. Escape: pause.
Space / Enter: start or resume. R: restart after a round or while paused.
PC keyboard play. Scores and settings are saved locally in the browser.

The game uses Pygame CE through Pygbag 0.9.3 (WebAssembly). The first visit downloads
the Python runtime from the pygame-web CDN. Hosting is static; there is no backend.
The archive includes only game code and runtime assets, not desktop builds or user saves.

## Credits

- Music: 8-Bit Cave Loop and 8-Bit Battle Loop by Theodore Kerr / Wolfgang_, CC0.
  https://opengameart.org/content/8-bit-cave-loop
  https://opengameart.org/content/8-bit-battle-loop
- Eat sound: Kenney Impact Sounds, CC0. https://kenney.nl/assets/impact-sounds
- Font: Press Start 2P, SIL Open Font License. License included in the game archive.
- Original pixel assets: AI-generated for this game. Sound cues are synthesized.
- Web loader adapted from Pygbag's default template: https://github.com/pygame-web/pygbag
