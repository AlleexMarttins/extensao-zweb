# AdminBlock - Administrative Actions Blocker

Chrome/Edge extension that blocks administrative actions (create, edit, delete) on Zweb pages (https://zweb.com.br/).

## Features

- Blocks create button (`botaoCadastrar`)
- Hides edit and delete buttons
- Prevents double-click on rows (which opens edit)
- Prevents right-click context menu for blocked actions
- Control popup to enable/disable blocking
- Works exclusively on `https://zweb.com.br/*`

## Installation (Chrome/Edge)

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable `Developer mode`
3. Click `Load unpacked` and select the `extension` folder
4. The extension is configured to run exclusively on `https://zweb.com.br/*`, but can be changed to work on any page (see end of this file)

## Behavior

- The extension searches for elements with id `botaoCadastrar`, text like `Cadastrar produto`, `aria-label` of actions ("Excluir", "Editar", "Abrir"), and common icons (`fa-pencil`, `fa-times`, `fa-trash`)
- Delete/edit actions are hidden (`display: none`) when detected; the create button is disabled and neutralized
- Also blocks `dblclick` and right-click context menu (`contextmenu`) on rows/cells that may trigger edit/delete actions

## Control (Enable/Disable)

- Open the extension popup (click the extension icon in your browser toolbar). There's a checkbox to enable/disable blocking and a button to reload the active tab
- When disabling, the extension reloads the active page (if you use the `Reload active page` button) to restore the original state

## Change to work on any page

- Open `manifest.json` and locate:
  ```json
  "host_permissions": ["https://zweb.com.br/*"],
  ...
  "content_scripts": [
    {
      "matches": ["https://zweb.com.br/*"],
  ```
- Replace `"https://zweb.com.br/*"` with `"<all_urls>"` in both fields:
  ```json
  "host_permissions": ["<all_urls>"],
  ...
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
  ```
- Save and reload the extension in `chrome://extensions/`

## File Structure

```
extension/
├── manifest.json       # Extension configuration
├── content.js          # Script that runs on pages
├── popup.html          # Control interface
├── popup.js            # Popup logic
└── background.js       # Service Worker
```

## License

MIT - Free for use and modification