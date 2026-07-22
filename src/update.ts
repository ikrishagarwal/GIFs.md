import { Plugin, Notice, requestUrl, normalizePath } from 'obsidian';
import { REPO } from './config';

export async function update(plugin: Plugin) {
	try {
		new Notice('Checking for updates...');

		const response = await requestUrl({
			url: `https://api.github.com/repos/${REPO}/releases/latest`,
			headers: { Accept: 'application/vnd.github.v3+json' },
		});

		const release = response.json as GitHubApiResponse;
		const tagName = release.tag_name;
		const currentVersion = `v${plugin.manifest.version}`;

		if (tagName === currentVersion) {
			new Notice('GIFs.md is already up to date');
			return;
		}

		const files = ['main.js', 'manifest.json', 'styles.css'];
		const adapter = plugin.app.vault.adapter;
		const pluginDir = normalizePath(`.obsidian/plugins/${plugin.manifest.id}/test`);

		await adapter.mkdir(normalizePath(pluginDir));

		for (const file of files) {
			const asset = release.assets.find((a) => a.name === file);
			if (!asset) continue;

			const fileResponse = await requestUrl({ url: asset.browser_download_url });
			await adapter.write(normalizePath(`${pluginDir}/${file}`), fileResponse.text);
		}

		new Notice(`GIFs.md updated to ${tagName}. Please reload Obsidian.`);
	} catch (e) {
		new Notice(`Update failed: ${(e as Error).message}`);
	}
}

export interface GitHubApiResponse {
	assets_url: string;
	tag_name: string;
	name: string;
	assets: {
		url: string;
		name: string;
		browser_download_url: string;
	}[];
}
