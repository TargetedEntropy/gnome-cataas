# Cat GIF Viewer - GNOME Shell Extension

A GNOME Shell extension that displays random cat GIFs from [cataas.com](https://cataas.com) in your panel. Click the cat icon to get a random cat GIF!

## Features

- Cat icon in the GNOME Shell top panel
- Fetches random cat GIFs from cataas.com
- Opens GIFs in your default image viewer for full animation support
- Clean, simple interface with modal dialog
- Automatic temp file cleanup

## Requirements

- GNOME Shell 42.0 (or compatible version)
- Internet connection
- Default image viewer (Eye of GNOME, Image Viewer, etc.)

## Installation

### Method 1: Manual Installation

1. Clone or download this repository
2. Copy the extension to your extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/cataas@cataas.com
   cp -r * ~/.local/share/gnome-shell/extensions/cataas@cataas.com/
   ```
3. Enable the extension:
   ```bash
   gnome-extensions enable cataas@cataas.com
   ```
4. Restart GNOME Shell:
   - **X11**: Press `Alt+F2`, type `r`, and press `Enter`
   - **Wayland**: Log out and log back in

### Method 2: Install from ZIP

```bash
# Create ZIP file
zip -r cataas@cataas.com.zip * --exclude "*.git*"

# Install
gnome-extensions install cataas@cataas.com.zip

# Enable
gnome-extensions enable cataas@cataas.com

# Restart GNOME Shell (see above)
```

## Usage

1. After installation, look for the cat/smiley icon in your top panel (status bar)
2. Click the icon
3. Wait a moment while the cat GIF is downloaded
4. A dialog will appear with two options:
   - **View GIF**: Opens the GIF in your system's default image viewer
   - **Close**: Closes the dialog and cleans up the temp file

## Troubleshooting

### Extension doesn't appear after enabling

- Make sure you've restarted GNOME Shell
- Check if the extension is enabled:
  ```bash
  gnome-extensions list --enabled
  ```
- View logs for errors:
  ```bash
  journalctl -f -o cat /usr/bin/gnome-shell | grep -i cataas
  ```

### Can't fetch cat GIFs

- Check your internet connection
- Verify cataas.com is accessible:
  ```bash
  curl https://cataas.com/cat/gif -o test.gif
  ```
- Check GNOME Shell logs for network errors

### GIF won't open

- Verify your default image viewer is set:
  ```bash
  xdg-mime query default image/gif
  ```
- Test manually:
  ```bash
  xdg-open /tmp/cataas-test.gif
  ```

### Temp files accumulate in /tmp/

Temp files should be cleaned up automatically when you close the dialog. If they accumulate:
```bash
rm /tmp/cataas-*.gif
```

## Uninstallation

```bash
gnome-extensions disable cataas@cataas.com
gnome-extensions uninstall cataas@cataas.com
```

Then restart GNOME Shell.

## Development

### Project Structure

- `metadata.json` - Extension metadata and configuration
- `extension.js` - Main extension code
- `CLAUDE.md` - Development documentation
- `README.md` - This file

### Viewing Logs

```bash
# Real-time logs
journalctl -f -o cat /usr/bin/gnome-shell

# Filter for this extension
journalctl -f -o cat /usr/bin/gnome-shell | grep -i cataas
```

### Testing Changes

After modifying code:
1. Disable the extension: `gnome-extensions disable cataas@cataas.com`
2. Restart GNOME Shell
3. Enable the extension: `gnome-extensions enable cataas@cataas.com`

## How It Works

1. Clicking the panel icon triggers an HTTP GET request to `https://cataas.com/cat/gif`
2. The response (GIF bytes) is saved to `/tmp/cataas-[timestamp].gif`
3. A modal dialog appears with options to view or close
4. Clicking "View GIF" opens the file with `xdg-open` (system default viewer)
5. Clicking "Close" deletes the temp file and dismisses the dialog

**Why external viewer?** GNOME Shell's St toolkit doesn't support animated GIF rendering natively. Using the system image viewer ensures full animation support.

## Credits

- Cat images/GIFs provided by [cataas.com](https://cataas.com) (Cat as a Service)
- Built for GNOME Shell 42.0

## License

This extension is provided as-is for educational and entertainment purposes.

## Contributing

Issues and pull requests welcome! Please test on GNOME Shell 42.0 before submitting.
