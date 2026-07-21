# GIFs.md

Browse, search, and insert GIFs directly into your Obsidian notes.

## Features

- Search for GIFs by keyword using the Klipy API.
- Browse trending GIFs and explore curated categories.
- Insert any GIF as a standard Markdown image at your cursor position.
- Access the GIF picker via the command palette or the right-click editor menu.

## How to use

Open the GIF picker in any editor using one of these methods:

- **Command palette** — Open the Command Palette (`Cmd/Ctrl + P`) and run `GIFs.md: Insert GIF`.
- **Right-click menu** — Right-click anywhere in an active note and select **Insert GIF**.
- **Custom hotkey** — Assign a shortcut under **Settings -> Hotkeys** by searching for `GIFs.md`.

The modal displays trending categories by default. Click a category to view matching GIFs, or type a query into the search bar. Click any GIF to instantly insert it into your note.

## Installation

### Manual installation

You can install the plugin automatically via terminal scripts or by downloading the release files manually. **Run these commands from the root directory of your Obsidian vault.**

#### Option 1: macOS / Linux (Bash)

Download and run the installation script directly via terminal:

```bash
bash <(curl -sL https://raw.githubusercontent.com/ikrishagarwal/GIFs.md/main/install.sh)

```

#### Option 2: Windows (PowerShell)

Download and run the installation script directly via PowerShell:

```powershell
irm https://raw.githubusercontent.com/ikrishagarwal/GIFs.md/main/install.ps1 | iex

```

#### Option 3: File download

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest GitHub Release](https://www.google.com/search?q=https://github.com/ikrishagarwal/GIFs.md/releases/latest).
2. Create a folder named `gifs-md` inside your vault's plugin directory (`.obsidian/plugins/gifs-md/`).
3. Move the downloaded files into that folder and reload Obsidian.

## Settings

| Setting  | Description                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Per page | Number of GIF results shown per search (8 to 24).                                                                            |
| Locale   | Language code for API search requests (e.g., `en_US`, `fr_FR`).                                                              |
| User ID  | An auto-generated unique ID used to personalize search results, store favorite GIFs, and filter hidden GIFs across sessions. |

## Network & Privacy Disclosure

This plugin connects to the **Klipy API** (`api.klipy.com`) to retrieve search results, trending categories, and media preview URLs.

- **Data sent:** Search queries typed into the GIF picker, locale settings, and an auto-generated **User ID**.
- **Purpose of User ID:** The User ID is passed to Klipy to deliver personalized GIF recommendations, remember favorited media, and exclude blocked GIFs from showing up in future search results.
- **Privacy:** No vault content, note data, file names, or personal hardware identifiers are collected or transmitted.

## License

[MIT](/LICENSE) © Krish
