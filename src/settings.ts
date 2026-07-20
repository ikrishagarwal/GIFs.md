import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import { nanoid } from 'nanoid';
import GIFsPlugin from './main';

export interface GIFsPluginSettings {
	userId: string;
}

export const DEFAULT_SETTINGS: GIFsPluginSettings = {
	userId: nanoid(26),
};

export class GIFSPluginSettingTab extends PluginSettingTab {
	plugin: GIFsPlugin;

	constructor(app: App, plugin: GIFsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'User ID',
				control: {
					type: 'text',
					key: 'userid',
					disabled: true,
				},
			},
		];
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('User ID')
			.setDesc('Your custom maintained user ID')
			.setDisabled(true)
			.addText((text) => {
				text.setValue(this.plugin.settings.userId).setDisabled(true);
			});
	}
}
