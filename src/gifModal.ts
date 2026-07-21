import { App, Modal, TextComponent } from 'obsidian';
import { BaseParams, Klipy, ApiResponse, FileType } from './klipy';
import GIFsPlugin from './main';

export class GIFModal extends Modal {
	plugin: GIFsPlugin;
	searchInput: TextComponent;
	backBtn: HTMLButtonElement;
	gifContainer: HTMLDivElement;
	categoriesContainer: HTMLDivElement;
	paginationContainer: HTMLDivElement;
	onSubmit: (file: FileType) => void;
	klipyParameters: BaseParams;
	currentPage = 1;
	currentQuery = '';
	hasNextPage = false;

	constructor(app: App, plugin: GIFsPlugin, onSubmit: (file: FileType) => void) {
		super(app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
		const { modalEl } = this;

		this.setTitle('Choose a GIF');

		this.klipyParameters = {
			customerId: this.plugin.settings.userId,
			locale: this.plugin.settings.locale,
			perPage: this.plugin.settings.perPage,
			meta: {
				appVersion: plugin.manifest.version,
			},
		};

		const searchContainer = modalEl.createDiv({ cls: 'search-container' });

		this.backBtn = searchContainer.createEl('button', { cls: 'back-btn hidden' });
		this.backBtn.setText('←');
		this.backBtn.addEventListener('click', () => {
			this.searchInput.setValue('');
			this.backBtn.addClass('hidden');
			void this.showCategories();
		});

		this.searchInput = new TextComponent(searchContainer) //
			.setPlaceholder('Search gifs')
			.onChange(async (query) => {
				if (query.length === 0) {
					this.backBtn.addClass('hidden');
					void this.showCategories();
				} else {
					this.backBtn.removeClass('hidden');
					await this.searchGIFs(query);
				}
			});
		this.searchInput.inputEl.addClass('search-input');

		const contentWrapper = modalEl.createDiv({ cls: 'content-wrapper' });
		this.categoriesContainer = contentWrapper.createDiv({ cls: 'categories-container' });
		this.gifContainer = contentWrapper.createDiv({ cls: 'gif-container' });
		this.paginationContainer = contentWrapper.createDiv({ cls: 'pagination-container hidden' });

		void this.showCategories();
	}

	onOpen() {
		this.searchInput.inputEl.focus();
	}

	async showCategories() {
		this.gifContainer.empty();
		this.gifContainer.addClass('hidden');
		this.categoriesContainer.empty();
		this.categoriesContainer.removeClass('hidden');
		this.paginationContainer.addClass('hidden');

		const trendingCard = this.categoriesContainer.createDiv({ cls: 'category-item trending-card' });
		trendingCard.createDiv({ cls: 'category-label', text: 'Trending' });
		trendingCard.addEventListener('click', () => {
			this.searchInput.setValue('');
			this.backBtn.removeClass('hidden');
			void this.showTrending();
		});

		try {
			const response = await Klipy.categories('en_US');
			for (const cat of response.data.categories) {
				const card = this.categoriesContainer.createDiv({ cls: 'category-item' });
				card.setAttr('style', `background-image: url(${cat.preview_url})`);
				card.createDiv({ cls: 'category-label', text: cat.category });
				card.addEventListener('click', () => {
					this.searchInput.setValue(cat.query);
					this.backBtn.removeClass('hidden');
					void this.searchGIFs(cat.query);
				});
			}
		} catch (err) {
			console.error('ERROR: while fetching categories', err);
		}
	}

	async showTrending() {
		this.currentQuery = '';
		await this.fetchAndDisplayGIFs(1);
	}

	async searchGIFs(query: string) {
		this.currentQuery = query;
		await this.fetchAndDisplayGIFs(1);
	}

	async fetchAndDisplayGIFs(page: number) {
		this.gifContainer.empty();
		this.categoriesContainer.addClass('hidden');
		this.gifContainer.removeClass('hidden');

		try {
			const params = { ...this.klipyParameters, page };
			const response = this.currentQuery
				? await Klipy.search({ ...params, query: this.currentQuery })
				: await Klipy.trending(params);

			this.currentPage = response.data.current_page;
			this.hasNextPage = response.data.has_next;
			this.displayGIFs(response.data.data);
			this.updatePagination();
		} catch (err) {
			console.error('ERROR: while fetching GIFs', err);
		}
	}

	async goToPage(page: number) {
		await this.fetchAndDisplayGIFs(page);
	}

	updatePagination() {
		this.paginationContainer.empty();
		this.paginationContainer.removeClass('hidden');

		const prevBtn = this.paginationContainer.createEl('button', { cls: 'pagination-btn', text: 'Previous' });
		prevBtn.disabled = this.currentPage <= 1;
		prevBtn.addEventListener('click', () => void this.goToPage(this.currentPage - 1));

		this.paginationContainer.createDiv({ cls: 'pagination-indicator', text: String(this.currentPage) });

		const nextBtn = this.paginationContainer.createEl('button', { cls: 'pagination-btn', text: 'Next' });
		nextBtn.disabled = !this.hasNextPage;
		nextBtn.addEventListener('click', () => void this.goToPage(this.currentPage + 1));
	}

	displayGIFs(data: ApiResponse['data']['data']) {
		this.gifContainer.replaceChildren();
		const cols = [this.gifContainer.createDiv(), this.gifContainer.createDiv()];

		for (let i = 0; i < data.length; i++) {
			const gif = data[i]!;
			const col = cols[i % 2]!;
			const { onSubmit } = this;

			if (gif.type === 'ad') {
				col.createEl('iframe', {
					attr: {
						sandbox: 'allow-scripts allow-same-origin',
						frameborder: '0',
						src: gif.content!,
					},
				});
			} else {
				col.createEl('img', {
					attr: {
						src: gif.file.xs.gif.url,
					},
				}).onClickEvent(() => {
					this.close();
					onSubmit(gif.file);
				});
			}
		}
	}
}
