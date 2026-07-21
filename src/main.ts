import { Editor, Plugin } from 'obsidian';
import { GIFModal } from './gifModal';
import { DEFAULT_SETTINGS, GIFsPluginSettings, GIFSPluginSettingTab } from './settings';
import { FileType } from './klipy';

export default class GIFsPlugin extends Plugin {
	settings!: GIFsPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'insert-gif-modal',
			name: 'Insert GIF',
			editorCallback: (editor: Editor) => {
				new GIFModal(this.app, this, (file: FileType) => this.onGIFSelection(editor, file)).open();
			},
		});

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				menu.addItem((item) => {
					item.setTitle('Insert GIF')
						.setIcon('film')
						.onClick(async () => {
							new GIFModal(this.app, this, (file: FileType) => this.onGIFSelection(editor, file)).open();
						});
				});
			}),
		);

		this.addSettingTab(new GIFSPluginSettingTab(this.app, this));
	}

	onGIFSelection(editor: Editor, file: FileType) {
		const gif = `![](${file.hd.gif.url})\n`;
		editor.replaceRange(gif, editor.getCursor());
		editor.setCursor(editor.getCursor().ch + gif.length);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<GIFsPluginSettings>);
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
