/* extension.js
 *
 * Cat GIF Viewer - GNOME Shell Extension
 * Shows random cat GIFs from cataas.com in the panel
 */

const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Soup = imports.gi.Soup;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ModalDialog = imports.ui.modalDialog;

// HTTP Session must be at module scope to prevent GC crashes
let _httpSession = null;

function _ensureHttpSession() {
    if (_httpSession === null) {
        _httpSession = new Soup.SessionAsync();
        Soup.Session.prototype.add_feature.call(
            _httpSession,
            new Soup.ProxyResolverDefault()
        );
    }
    return _httpSession;
}

const CatGifDialog = class CatGifDialog extends ModalDialog.ModalDialog {
    constructor(gifPath) {
        super({
            styleClass: 'cataas-dialog',
            destroyOnClose: true
        });

        this._gifPath = gifPath;
        this._createContent();
    }

    _createContent() {
        // Create main container
        let box = new St.BoxLayout({
            vertical: true,
            style: 'padding: 20px;'
        });

        // Add title
        let title = new St.Label({
            text: 'Random Cat GIF',
            style_class: 'headline',
            style: 'font-size: 18px; font-weight: bold; margin-bottom: 15px;'
        });
        box.add_child(title);

        // Add info label
        let info = new St.Label({
            text: 'GIF downloaded! Click "View GIF" to open in your image viewer.',
            style: 'margin-bottom: 15px;'
        });
        box.add_child(info);

        // Show file path
        let pathLabel = new St.Label({
            text: `File: ${this._gifPath}`,
            style: 'font-size: 10px; color: #888; margin-bottom: 15px;'
        });
        box.add_child(pathLabel);

        this.contentLayout.add_child(box);

        // Add buttons
        this.setButtons([
            {
                label: 'View GIF',
                action: this._onViewGif.bind(this),
                default: true
            },
            {
                label: 'Close',
                action: this._onClose.bind(this),
                key: Clutter.KEY_Escape
            }
        ]);
    }

    _onViewGif() {
        try {
            // Open the GIF with the default system viewer
            GLib.spawn_command_line_async(`xdg-open "${this._gifPath}"`);
        } catch (e) {
            logError(e, 'Failed to open GIF viewer');
        }
        this.close(global.get_current_time());
    }

    _onClose() {
        // Clean up temp file
        try {
            let file = Gio.File.new_for_path(this._gifPath);
            file.delete(null);
        } catch (e) {
            log('Failed to delete temp file: ' + e.message);
        }
        this.close(global.get_current_time());
    }
};

const CatGifIndicator = class CatGifIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Cat GIF Viewer', false);

        // Create cat icon for panel
        let icon = new St.Icon({
            icon_name: 'face-laugh-symbolic', // Using built-in icon (looks friendly)
            style_class: 'system-status-icon'
        });

        this.add_child(icon);

        // Connect click event
        this.connect('button-press-event', this._onButtonPress.bind(this));

        this._currentDialog = null;
    }

    _onButtonPress() {
        // Fetch and show cat GIF
        this._fetchCatGif();
        return Clutter.EVENT_STOP;
    }

    _fetchCatGif() {
        let session = _ensureHttpSession();

        // Create request for random cat GIF
        let url = 'https://cataas.com/cat/gif';
        let message = Soup.Message.new('GET', url);

        log('Fetching cat GIF from: ' + url);

        // Queue async request
        session.queue_message(message, (session, msg) => {
            if (msg.status_code !== 200) {
                this._showError('Failed to fetch cat GIF. Status: ' + msg.status_code);
                return;
            }

            let bytes = msg.response_body.flatten().get_data();
            if (!bytes || bytes.length === 0) {
                this._showError('Received empty response from server');
                return;
            }

            log('Received cat GIF: ' + bytes.length + ' bytes');
            this._saveTempAndShow(bytes);
        });
    }

    _saveTempAndShow(bytes) {
        try {
            // Create temp file with timestamp
            let timestamp = GLib.DateTime.new_now_local().format('%Y%m%d-%H%M%S');
            let tempPath = `/tmp/cataas-${timestamp}.gif`;

            // Write bytes to file
            let file = Gio.File.new_for_path(tempPath);
            let outputStream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
            outputStream.write(bytes, null);
            outputStream.close(null);

            log('Saved GIF to: ' + tempPath);

            // Show dialog
            this._showDialog(tempPath);
        } catch (e) {
            logError(e, 'Failed to save temp file');
            this._showError('Failed to save GIF: ' + e.message);
        }
    }

    _showDialog(gifPath) {
        // Close existing dialog if any
        if (this._currentDialog) {
            this._currentDialog.close(global.get_current_time());
        }

        // Create and show new dialog
        this._currentDialog = new CatGifDialog(gifPath);
        this._currentDialog.open(global.get_current_time());
    }

    _showError(message) {
        Main.notify('Cat GIF Viewer', message);
    }

    destroy() {
        if (this._currentDialog) {
            this._currentDialog.close(global.get_current_time());
            this._currentDialog = null;
        }
        super.destroy();
    }
};

class Extension {
    constructor() {
        this._indicator = null;
    }

    enable() {
        log('Enabling Cat GIF Viewer extension');

        // Ensure HTTP session is initialized
        _ensureHttpSession();

        // Create and add indicator to panel
        this._indicator = new CatGifIndicator();
        Main.panel.addToStatusArea('cataas-indicator', this._indicator);
    }

    disable() {
        log('Disabling Cat GIF Viewer extension');

        // Remove indicator
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        // Clean up HTTP session
        if (_httpSession) {
            _httpSession.abort();
            _httpSession = null;
        }
    }
}

function init() {
    log('Initializing Cat GIF Viewer extension');
    return new Extension();
}
