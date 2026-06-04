export const parseJSONstring = (item: string) => {
	if (typeof item !== 'string') {
		return item;
	}
	try {
		return JSON.parse(item);
	} catch (e) {
		return item;
	}
};
