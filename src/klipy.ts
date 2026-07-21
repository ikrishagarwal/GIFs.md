import { Platform, requestUrl, RequestUrlParam } from 'obsidian';

const requestOptions: Partial<RequestUrlParam> = {
	method: 'GET',
	contentType: 'application/json',
};

export class Klipy {
	static API_KEY = 'RDI0EdI0rznQuzQnv2XTKcR2utfoLivl48a1em9XGTs4Bj5IHhM3cBCIR5OElr78';

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

			addAdParameters(url, params);

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

			addAdParameters(url, params);

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

function addAdParameters(url: URL, params: BaseParams | SearchParams) {
	// Disabled ADs as per obsidian's policies
	return;

	// url.searchParams.append('ad-min-width', '100');
	// url.searchParams.append('ad-max-width', '250');
	// url.searchParams.append('ad-min-height', '100');
	// url.searchParams.append('ad-max-height', '250');

	// url.searchParams.append('ad-app-version', params.meta.appVersion);

	// url.searchParams.append('ad-device-h', String(Math.round(window.screen.height * window.devicePixelRatio)));
	// url.searchParams.append('ad-device-w', String(Math.round(window.screen.width * window.devicePixelRatio)));
	// url.searchParams.append('ad-pxratio', String(window.devicePixelRatio));
	// url.searchParams.append('ad-language', params.locale);
	// url.searchParams.append('ad-connection-type', navigator.onLine ? '2' : '0');
	// url.searchParams.append('ad-iframe', '1');
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

export interface ApiResponse {
	result: boolean;
	data: {
		data: {
			id: number;
			slug: string;
			title: string;
			file: FileType;
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
