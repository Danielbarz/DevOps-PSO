import { useRouter } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import type { SortBy } from "../../types/paper";

const YEAR_MIN = 2000;
const YEAR_MAX = new Date().getFullYear();

function parseStringArray(value: unknown): string[] {
	if (!value) {
		return [];
	}
	if (Array.isArray(value)) {
		return value as string[];
	}
	return [value as string];
}

export function useFilters<T extends Record<string, unknown>>(search: T) {
	const router = useRouter();

	const authorFilter = (search.author as string) ?? "";
	const journalFilter = useMemo(
		() => parseStringArray(search.journal),
		[search.journal]
	);
	const keywordFilter = useMemo(
		() => parseStringArray(search.keyword),
		[search.keyword]
	);
	const yearFrom = search.yearFrom
		? Number.parseInt(String(search.yearFrom), 10)
		: YEAR_MIN;
	const yearTo = search.yearTo
		? Number.parseInt(String(search.yearTo), 10)
		: YEAR_MAX;
	const sortBy = ((search.sortBy as SortBy) ?? "relevance") as SortBy;

	const activeFilterCount = [
		authorFilter ? 1 : 0,
		journalFilter.length > 0 ? 1 : 0,
		keywordFilter.length > 0 ? 1 : 0,
		yearFrom !== YEAR_MIN || yearTo !== YEAR_MAX ? 1 : 0,
	].reduce((a, b) => a + b, 0);

	const updateSearch = useCallback(
		(updates: Record<string, unknown>) => {
			const newSearch = { ...search, ...updates, page: 1 };
			router.navigate({ to: window.location.pathname, search: newSearch });
		},
		[router, search]
	);

	const setAuthorFilter = useCallback(
		(value: string) => updateSearch({ author: value || undefined }),
		[updateSearch]
	);

	const setJournalFilter = useCallback(
		(values: string[]) =>
			updateSearch({ journal: values.length > 0 ? values : undefined }),
		[updateSearch]
	);

	const setKeywordFilter = useCallback(
		(values: string[]) =>
			updateSearch({ keyword: values.length > 0 ? values : undefined }),
		[updateSearch]
	);

	const setYearRange = useCallback(
		(from: number, to: number) => {
			updateSearch({
				yearFrom: from === YEAR_MIN ? undefined : from,
				yearTo: to === YEAR_MAX ? undefined : to,
			});
		},
		[updateSearch]
	);

	const setSortBy = useCallback(
		(value: SortBy) =>
			updateSearch({ sortBy: value === "relevance" ? undefined : value }),
		[updateSearch]
	);

	const clearAllFilters = useCallback(() => {
		const newSearch = { q: search.q, page: 1 };
		router.navigate({ to: window.location.pathname, search: newSearch });
	}, [router, search]);

	return {
		authorFilter,
		journalFilter,
		keywordFilter,
		yearFrom,
		yearTo,
		sortBy,
		activeFilterCount,
		setAuthorFilter,
		setJournalFilter,
		setKeywordFilter,
		setYearRange,
		setSortBy,
		clearAllFilters,
		YEAR_MIN,
		YEAR_MAX,
	};
}
