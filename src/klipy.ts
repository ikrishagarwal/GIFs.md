import { requestUrl, RequestUrlParam } from 'obsidian';

const requestOptions: Partial<RequestUrlParam> = {
	method: 'GET',
	contentType: 'application/json',
};

export class Klipy {
	static API_KEY = atob('UkRJMEVkSTByem5RdXpRbnYyWFRLY1IydXRmb0xpdmw0OGExZW05WEdUczRCajVJSGhNM2NCQ0lSNU9FbHI3OA==');

	static async search(params: SearchParams) {
		const { query, page, contentFilter, customerId, locale, perPage } = params;
		try {
			const url = new URL(`https://api.klipy.com/api/v1/${Klipy.API_KEY}/gifs/search`);

			url.searchParams.append('q', query);
			url.searchParams.append('customer_id', customerId);

			page && url.searchParams.append('page', String(page));
			perPage && url.searchParams.append('per_page', String(perPage));
			locale && url.searchParams.append('locale', locale);
			contentFilter && url.searchParams.append('content_filter', contentFilter);

			const response = await requestUrl({
				...requestOptions,
				url: url.toString(),
			});

			return response.json as ApiResponse;
		} catch (err) {
			console.error('Klipy search API error:', parseError(err));
			throw err;
		}
	}

	static async trending(params: BaseParams) {
		const { page, contentFilter, customerId, locale, perPage } = params;
		try {
			const url = new URL(`https://api.klipy.com/api/v1/${Klipy.API_KEY}/gifs/trending`);

			url.searchParams.append('customer_id', customerId);

			page && url.searchParams.append('page', String(page));
			perPage && url.searchParams.append('per_page', String(perPage));
			locale && url.searchParams.append('locale', locale);
			contentFilter && url.searchParams.append('content_filter', contentFilter);

			const response = await requestUrl({
				...requestOptions,
				url: url.toString(),
			});

			return response.json as ApiResponse;
		} catch (err) {
			console.error('Klipy trending API error:', parseError(err));
			throw err;
		}
	}

	static async items(params: ItemsParams) {
		const { slugs, customerId, locale } = params;
		try {
			const url = new URL(`https://api.klipy.com/api/v1/${Klipy.API_KEY}/gifs/items`);

			url.searchParams.append('slugs', slugs.join(','));
			url.searchParams.append('customer_id', customerId);
			locale && url.searchParams.append('locale', locale);

			const response = await requestUrl({
				...requestOptions,
				url: url.toString(),
			});

			return response.json as ItemsResponse;
		} catch (err) {
			console.error('Klipy items API error:', parseError(err));
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
			console.error('Klipy categories API error:', parseError(err));
			throw err;
		}
	}
}

export const normalizeSlug = (slug: string): string => slug.split('--')[0] ?? slug;

function parseError(err: unknown) {
	const reqErr = err as Record<string, unknown>;
	if (reqErr?.status) {
		return {
			status: reqErr.status,
			body: reqErr.text,
			json: reqErr.json,
			meta: reqErr,
		};
	}
	return String(err);
}

export interface BaseParams {
	page?: number;
	perPage?: number;
	customerId: string;
	locale: string;
	contentFilter?: string;
	meta: {
		appVersion: string;
	};
}

export interface SearchParams extends BaseParams {
	query: string;
}

export interface ItemsParams extends BaseParams {
	slugs: string[];
}

export interface GifItem {
	id: number;
	slug: string;
	title: string;
	file: FileType;
	content?: string;
	height?: number;
	width?: number;
	type: string;
	blur_preview: string;
}

export interface ApiResponse {
	result: boolean;
	data: {
		data: GifItem[];
		current_page: number;
		per_page: number;
		has_next: boolean;
	};
}

export interface ItemsResponse {
	result: boolean;
	data: {
		data: GifItem[];
		meta: Record<string, unknown>;
	};
}

export type FileType = Record<
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
