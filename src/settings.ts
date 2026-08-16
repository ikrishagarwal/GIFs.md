import { App, Modal, Notice, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
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
				desc: 'Your custom maintained user ID',
				control: {
					type: 'text',
					key: 'userId',
					disabled: true,
					defaultValue: this.plugin.settings.userId,
				},
			},
			{
				name: 'Per page',
				desc: 'Number of items per page',
				control: {
					type: 'number',
					key: 'perPage',
					min: 8,
					max: 24,
					validate: (num) => {
						if (num < 8) {
							return 'Must be greater than 8';
						} else if (num > 24) {
							return 'Must be lesser than 50';
						}
						return;
					},
					defaultValue: this.plugin.settings.perPage,
				},
			},
{
			name: 'Locale',
			desc: 'Must be in format `xx_YY` where xx is language and YY is country code eg. en_US',
			control: {
				type: 'text',
				key: 'locale',
				validate: (value) => {
					const reg = /^[a-z]{2}_[A-Z]{2}$/;
					if (!reg.test(value)) return "Value doesn't follow the format of xx_YY";
					return;
				},
				defaultValue: this.plugin.settings.locale,
			},
		},
		{
			name: 'Reset favorites',
			desc: 'Permanently remove all your saved favorite gifs from this device.',
			render: (setting) => {
				this.addResetButton(setting);
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
						new Notice('The value should be a number');
						return;
					} else if (num < 8) {
						new Notice('The value should be more than 8');
						return;
					} else if (num > 50) {
						new Notice('The value should be lesser than 50');
						return;
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

		this.addResetButton(
			new Setting(containerEl).setName('Reset favorites').setDesc('Permanently remove all your saved favorite gifs from this device.'),
		);
	}

	addResetButton(setting: Setting) {
		setting.addButton((button) => {
			button.setButtonText('Reset');
			button.setDisabled(this.plugin.favoriteSlugs.length === 0);
			button.buttonEl.addClass('mod-warning');
			button.onClick(() => {
				new ResetFavoritesModal(this.app, () => {
					void this.resetFavorites();
				}).open();
			});
		});
	}

	private async resetFavorites() {
		const removed = await this.plugin.resetFavorites();
		new Notice(`Removed ${removed} favorite gifs.`);
	}
}

class ResetFavoritesModal extends Modal {
	constructor(app: App, onConfirm: () => void) {
		super(app);
		this.setTitle('Reset all favorites');

		new Setting(this.contentEl)
			.setName('This will permanently remove all your favorite gifs from this device. This cannot be undone.')
			.addButton((button) => button.setButtonText('Cancel').onClick(() => this.close()))
			.addButton((button) => {
				button.setButtonText('Reset');
				button.buttonEl.addClass('mod-warning');
				button.onClick(() => {
					this.close();
					onConfirm();
				});
			});
	}
}
