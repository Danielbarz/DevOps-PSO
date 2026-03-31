export function normalizeToArray(
	value: string | string[] | undefined
): string[] | undefined {
	if (!value) {
		return undefined;
	}
	return Array.isArray(value) ? value : [value];
}

export function formatDate(dateString: string) {
	try {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	} catch {
		return dateString;
	}
}
