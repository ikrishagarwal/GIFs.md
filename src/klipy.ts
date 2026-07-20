import { requestUrl, RequestUrlParam } from 'obsidian';

const requestOptions: Partial<RequestUrlParam> = {
	method: 'GET',
	contentType: 'application/json',
};

export class Klipy {
	static API_KEY = 'RDI0EdI0rznQuzQnv2XTKcR2utfoLivl48a1em9XGTs4Bj5IHhM3cBCIR5OElr78';

	static async search({ query, page, contentFilter, customerId, locale, perPage, width }: SearchParams) {
		try {
			const url = new URL(`https://api.klipy.com/api/v1/${Klipy.API_KEY}/gifs/search`);

			url.searchParams.append('q', query);
			url.searchParams.append('customer_id', customerId);

			page && url.searchParams.append('page', String(page));
			perPage && url.searchParams.append('per_page', String(perPage));
			locale && url.searchParams.append('locale', locale);
			contentFilter && url.searchParams.append('content_filter', contentFilter);

			addAdParameters(url, width);

			const response = await requestUrl({
				...requestOptions,
				url: url.toString(),
			});

			return response.json as ApiResponse;
		} catch (err) {
			console.error('ERROR: while searching GIF', err);
			throw err;
		}
	}

	static async trending({ page, contentFilter, customerId, locale, perPage, width }: BaseParams) {
		try {
			const url = new URL(`https://api.klipy.com/api/v1/${Klipy.API_KEY}/gifs/trending`);

			url.searchParams.append('customer_id', customerId);

			page && url.searchParams.append('page', String(page));
			perPage && url.searchParams.append('per_page', String(perPage));
			locale && url.searchParams.append('locale', locale);
			contentFilter && url.searchParams.append('content_filter', contentFilter);

			addAdParameters(url, width);

			const response = await requestUrl({
				...requestOptions,
				url: url.toString(),
			});

			return response.json as ApiResponse;
		} catch (err) {
			console.error('ERROR: while fetching trending GIF', err);
			throw err;
		}
	}

	static async categories(locale: string) {
		try {
			const url = new URL(`https://api.klipy.com/api/v1/${Klipy.API_KEY}/gifs/categories`);

			locale && url.searchParams.append('locale', locale);

			const response = await requestUrl({
				...requestOptions,
				url: url.toString(),
			});

			return response.json as CategoriesResponse;
		} catch (err) {
			console.error('ERROR: while fetching categories', err);
			throw err;
		}
	}
}

function addAdParameters(url: URL, width: number) {
	url.searchParams.append('ad-min-width', '50');
	url.searchParams.append('ad-min-height', '50');
	url.searchParams.append('ad-max-height', '250');
	url.searchParams.append('ad-max-width', String(width));
}

export interface BaseParams {
	page?: number;
	perPage?: number;
	customerId: string;
	locale?: string;
	contentFilter?: string;
	width: number;
}

export interface SearchParams extends BaseParams {
	query: string;
}

export interface ApiResponse {
	result: boolean;
	data: {
		data: {
			id: number;
			slug: string;
			title: string;
			file: Record<
				'hd' | 'md' | 'sm' | 'xs',
				Record<
					'gif' | 'webp' | 'jpg' | 'mp4' | 'webm',
					{
						url: string;
						width: number;
						height: number;
						size: number;
					}
				>
			>;
			content?: string;
			height?: number;
			width?: number;
			type: string;
			blur_preview: string;
		}[];
		current_page: number;
		per_page: number;
		has_next: boolean;
	};
}

export interface CategoriesResponse {
	result: boolean;
	data: {
		locale: string;
		categories: {
			category: string;
			query: string;
			preview_url: string;
		}[];
	};
}
