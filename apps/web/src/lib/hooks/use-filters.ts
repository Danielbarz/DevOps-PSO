import { useRouter } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import type { SortBy } from "../../types/paper";
import { YEAR_MAX, YEAR_MIN } from "../constants";
import { normalizeToArray } from "../utils";

export function useFilters<T extends Record<string, unknown>>(search: T) {
	const router = useRouter();

	const authorFilter = (search.author as string) ?? "";
	const journalFilter = useMemo(
		() =>
			normalizeToArray(search.journal as string | string[] | undefined) ?? [],
		[search.journal]
	);
	const keywordFilter = useMemo(
		() =>
			normalizeToArray(search.keyword as string | string[] | undefined) ?? [],
		[search.keyword]
	);
	const yearFrom =
		search.yearFrom === undefined
			? YEAR_MIN
			: Number.parseInt(String(search.yearFrom), 10);
	const yearTo =
		search.yearTo === undefined
			? YEAR_MAX
			: Number.parseInt(String(search.yearTo), 10);
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
		const newSearch = { q: search.q as string | undefined, page: 1 };
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
