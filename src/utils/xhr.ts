import { HTTPMethod, URLString } from "./constants";

async function boot(method: HTTPMethod, url: URLString, option) {
	const xhr = new XMLHttpRequest();
	return await new Promise((resolve, reject) => {
		xhr.open(method, url);
		xhr.onreadystatechange = (e) => {
			if (xhr.readyState === 4) {
				const { response } = xhr;
				const getResponseHeader = (name: string) =>
					xhr.getResponseHeader(name);
				resolve({ response, getResponseHeader, xhr });
			} else {
				// TODO:
				// reject(xhr);
			}
		};
		xhr.onerror = reject;
		xhr.send();
	});
}

export const xhr = Object.assign(boot, {
	get: async (url: string, option) => await boot("GET", url, option),
	post: async (url: string, option) => await boot("POST", url, option),
	put: async (url: string, option) => await boot("PUT", url, option),
});
