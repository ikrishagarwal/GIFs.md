import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { GIFModal } from './gifModal';
import { DEFAULT_SETTINGS, GIFsPluginSettings, GIFSPluginSettingTab } from './settings';
import { FileType, normalizeSlug } from './klipy';

export default class GIFsPlugin extends Plugin {
	settings!: GIFsPluginSettings;
	favoriteSlugs: string[] = [];

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'insert-gif-modal',
			name: 'Insert GIF',
			editorCallback: (editor: Editor) => {
				new GIFModal(this.app, this, (file: FileType) => this.onGIFSelection(editor, file)).open();
			},
		});

		this.addRibbonIcon('film', 'Insert GIF', () => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				const editor = activeView.editor;
				new GIFModal(this.app, this, (file: FileType) => this.onGIFSelection(editor, file)).open();
			} else {
				new Notice('Please open a note first to insert a GIF.');
			}
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
		const gif = `![](${file[this.settings.gifQuality][this.settings.gifType].url})\n`;
		editor.replaceRange(gif, editor.getCursor());
		editor.setCursor(editor.getCursor().ch + gif.length);
	}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<GIFsPluginSettings> & { favoriteSlugs?: string[] };
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		this.favoriteSlugs = Array.isArray(data.favoriteSlugs)
			? [...new Set(data.favoriteSlugs.map(normalizeSlug))]
			: [];
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData({ ...this.settings, favoriteSlugs: this.favoriteSlugs });
	}

	isFavorite(slug: string): boolean {
		return this.favoriteSlugs.includes(normalizeSlug(slug));
	}

	async toggleFavorite(slug: string): Promise<boolean> {
		const normalized = normalizeSlug(slug);
		const index = this.favoriteSlugs.indexOf(normalized);
		if (index >= 0) {
			this.favoriteSlugs.splice(index, 1);
		} else {
			this.favoriteSlugs.push(normalized);
		}
		await this.saveSettings();
		return index < 0;
	}

	async resetFavorites(): Promise<number> {
		const removed = this.favoriteSlugs.length;
		this.favoriteSlugs = [];
		await this.saveSettings();
		return removed;
	}
}
