import { App, Modal, TextComponent } from 'obsidian';
import { BaseParams, Klipy } from './klipy';
import GIFsPlugin from './main';

export class GIFModal extends Modal {
	constructor(app: App, plugin: GIFsPlugin, onSubmit: (result: string) => void) {
		super(app);
		const { modalEl } = this;

		this.setTitle('Choose a GIF');
		new TextComponent(modalEl) //
			.setPlaceholder('Search GIFs') //
			.onChange(async (query) => {
				const args: BaseParams = {
					customerId: plugin.settings.userId,
					width: modalEl.innerWidth,
				};

				const response = await Klipy.search({
					...args,
					query,
				});

				gifContainer.replaceChildren();

				for (const gif of response.data.data) {
					if (gif.type === 'ad') {
						const iframe = gifContainer.createEl('iframe', {
							attr: {
								sandbox: 'allow-scripts allow-same-origin',
								frameborder: '0',
								style: 'width: 100%; height: auto; border: none;',
							},
						});

						const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
						if (iframeDoc) {
							iframeDoc.open();
							iframeDoc.write(gif.content!);
							iframeDoc.close();
						}
					} else {
						gifContainer.createEl('img', {
							attr: {
								src: gif.file.xs.gif.url,
							},
						});
					}
				}
			});

		const gifContainer = modalEl.createDiv({ cls: 'gif-container' });
	}
}
