async function boot(method, url, option) {
	const xhr = new XMLHttpRequest();
	return await new Promise((resolve, reject) => {
		xhr.open(method, url);
		xhr.onreadystatechange = (e) => {
			if (xhr.readyState === 4) {
				const { response } = xhr;
				const getResponseHeader = (...args) =>
					xhr.getResponseHeader(...args);
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
	get: async (url, option) => await boot("get", url, option),
	post: async (url, option) => await boot("post", url, option),
	put: async (url, option) => await boot("put", url, option),
});
