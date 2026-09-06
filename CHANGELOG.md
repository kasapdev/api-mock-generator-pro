# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2026-09-06

### Fixed

- Pressing <kbd>Ctrl/⌘</kbd>+<kbd>Enter</kbd> while focused in the schema textarea ran `generate()` twice per keypress (once from a local `keydown` handler on the textarea, once from the global `mod+enter` shortcut in `assets/js/core.js`, which is intentionally allowed to fire while typing). This doubled the "Generated N records" toast and did redundant work on every generate keypress. Removed the redundant local handler in `js/app.js`; the global shortcut alone now handles it.
