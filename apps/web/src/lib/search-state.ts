const STORAGE_KEY = "lastSearchState";

interface SearchState {
	page: number;
	pageSize: number;
	q: string;
	url: string;
}

export function saveSearchState(state: SearchState): void {
	if (typeof window !== "undefined") {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

export function getSearchState(): SearchState | null {
	if (typeof window !== "undefined") {
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				return JSON.parse(saved) as SearchState;
			} catch {
				return null;
			}
		}
	}
	return null;
}

export function clearSearchState(): void {
	if (typeof window !== "undefined") {
		sessionStorage.removeItem(STORAGE_KEY);
	}
}
