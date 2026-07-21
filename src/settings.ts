import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import { nanoid } from 'nanoid';
import GIFsPlugin from './main';

export interface GIFsPluginSettings {
	userId: string;
	perPage: number;
	locale: string;
}

export const DEFAULT_SETTINGS: GIFsPluginSettings = {
	userId: nanoid(26),
	perPage: 24,
	locale: 'en_US',
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
			{
				name: 'Per page',
				control: {
					type: 'number',
					key: 'perPage',
				},
			},
			{
				name: 'Locale',
				control: {
					type: 'text',
					key: 'locale',
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
			.addText((text) => {
				text.setValue(this.plugin.settings.userId).setDisabled(true);
			});

		new Setting(containerEl)
			.setName('Per page')
			.setDesc('Number of items per page')
			.addText((text) => {
				text.inputEl.type = 'number';

				text.inputEl.setAttr('min', '8');
				text.inputEl.setAttr('max', '50');
				text.inputEl.setAttr('step', '1');

				text.setValue(String(this.plugin.settings.perPage || 24));

				text.onChange(async (value) => {
					let num = parseInt(value, 10);

					if (isNaN(num)) {
						num = 8;
					} else if (num < 8) {
						num = 8;
					} else if (num > 24) {
						num = 24;
					}

					this.plugin.settings.perPage = num;
					text.setValue(String(num));
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Locale')
			.setDesc('Must be in format `xx_YY` where xx is language and YY is country code eg. en_US')
			.addText(async (text) => {
				text.setValue(this.plugin.settings.locale);

				text.onChange(async (value) => {
					const reg = /^[a-z]{2}_[A-Z]{2}$/;
					if (!reg.test(value)) {
						value = this.plugin.settings.locale;
					}
					this.plugin.settings.locale = value;
					await this.plugin.saveSettings();
				});
			});
	}
}
