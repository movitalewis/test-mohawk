import { externalUrlPattern, htmlTagRegex } from '@shared/constants';

export const urlIsExternal = (url: string, flag: string = 'gi'): boolean => {
	const pattern = new RegExp(externalUrlPattern, flag);
	return pattern.test(url);
};

export const stripTagsFromHTML = (
	string: string,
	flag: string = 'gi'
): string => {
	return !!string ? string.replace(htmlTagRegex + flag, '') : '';
};

export const generateHtml5TelString = (string: string): string => {
	const stripped = !!string ? string.replace(/\D/g, '') : null;
	return !stripped
		? ''
		: `+${stripped.charAt(0) === '1' ? stripped : `1${stripped}`}`;
};
