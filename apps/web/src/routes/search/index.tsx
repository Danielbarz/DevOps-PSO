import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { SearchBar } from "../../components/search/search-bar";
import { SearchResults } from "../../components/search/search-results";
import { saveSearchState } from "../../lib/search-state";
import type { SortBy } from "../../types/paper";

const searchSchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().optional().default(1),
	pageSize: z.coerce.number().optional().default(10),
	author: z.string().optional(),
	journal: z.union([z.string(), z.array(z.string())]).optional(),
	keyword: z.union([z.string(), z.array(z.string())]).optional(),
	yearFrom: z.coerce.number().optional(),
	yearTo: z.coerce.number().optional(),
	sortBy: z
		.enum(["relevance", "date_desc", "date_asc", "title_asc", "author_asc"])
		.optional(),
});

export const Route = createFileRoute("/search/")({
	component: SearchPage,
	validateSearch: searchSchema,
});

function SearchPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/search/" });
	const {
		q = "",
		page = 1,
		pageSize = 10,
		author,
		journal,
		keyword,
		yearFrom,
		yearTo,
		sortBy,
	} = search;

	// Save search state for "Back to search" functionality
	useEffect(() => {
		if (typeof window !== "undefined") {
			saveSearchState({
				url: window.location.href,
				q,
				page,
				pageSize,
			});
		}
	}, [q, page, pageSize]);

	const handleSearch = (query: string) => {
		navigate({
			to: "/search",
			search: { ...search, q: query, page: 1 },
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/search",
			search: { ...search, page: newPage },
		});
	};

	const handlePageSizeChange = (newSize: number) => {
		navigate({
			to: "/search",
			search: { ...search, page: 1, pageSize: newSize },
		});
	};

	const normalizeToArray = (
		value: string | string[] | undefined
	): string[] | undefined => {
		if (!value) {
			return undefined;
		}
		return Array.isArray(value) ? value : [value];
	};

	const initialFilters = {
		authorFilter: author,
		journalFilter: normalizeToArray(journal),
		keywordFilter: normalizeToArray(keyword),
		yearFrom,
		yearTo,
		sortBy: sortBy as SortBy | undefined,
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<div className="relative rounded-lg border bg-background shadow-sm">
					<SearchBar defaultValue={q} onSearch={handleSearch} />
				</div>
			</div>
			<SearchResults
				initialFilters={initialFilters}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
				page={page}
				pageSize={pageSize}
				query={q}
			/>
		</div>
	);
}
