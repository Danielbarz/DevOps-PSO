# Phase 4: Search Components

## Objective
Create all search-related components: search bar, filters, facets, results display, and pagination.

## Prerequisites
- Phase 3 completed (layout components exist)
- Mock data and hooks available
- UI components (Badge, Separator) added

---

## Steps

### Step 4.1: Create Search Bar Component

**File**: `apps/web/src/components/search/search-bar.tsx` (create new)

```typescript
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@scholar-seek/ui/components/button";
import { Input } from "@scholar-seek/ui/components/input";

interface SearchBarProps {
	defaultValue?: string;
	onSearch: (query: string) => void;
}

export function SearchBar({ defaultValue = "", onSearch }: SearchBarProps) {
	const [query, setQuery] = useState(defaultValue);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "/"&&
				document.activeElement?.tagName !== "INPUT" &&
				document.activeElement?.tagName !== "TEXTAREA"
			) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			onSearch(query.trim());
		}
	};

	return (
		<form className="relative flex w-full items-center" onSubmit={handleSubmit}>
			<Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
			<Input
				className="h-14 w-full rounded-lg border-0 bg-transparent pr-40 pl-12 text-lg shadow-none focus-visible:ring-0"
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search for articles, authors, or topics..."
				ref={inputRef}
				type="search"
				value={query}
			/>
			<div className="absolute right-2 flex items-center gap-2">
				<div className="pointer-events-none mr-2 hidden items-center gap-1 rounded border bg-muted/50 px-2 py-1 font-medium text-muted-foreground text-xs sm:flex">
					<span>/</span>
				</div>
				<Button className="h-10 rounded-md px-6" size="lg" type="submit">
					Search
				</Button>
			</div>
		</form>
	);
}
```

---

### Step 4.2: Create Result Card Component

**File**: `apps/web/src/components/search/result-card.tsx` (create new)

```typescript
import { Link } from "@tanstack/react-router";
import type { Paper } from "../../types/paper";
import { Badge } from "@scholar-seek/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@scholar-seek/ui/components/card";
import { formatDate } from "../../lib/utils";

interface ResultCardProps {
	paper: Paper;
}

export function ResultCard({ paper }: ResultCardProps) {
	return (
		<Card className="transition-colors hover:border-primary">
			<CardHeader>
				<Link to="/paper/$id" params={{ id: paper.id }}>
					<CardTitle className="line-clamp-2 cursor-pointer text-lg hover:text-primary">
						{paper.title}
					</CardTitle>
				</Link>
			</CardHeader>
			<CardContent className="space-y-2">
				<Link className="block" to="/paper/$id" params={{ id: paper.id }}>
					<p className="line-clamp-2 text-muted-foreground text-sm">
						{paper.abstract}
					</p>
					<div className="mt-2 flex flex-wrap gap-1">
						{paper.authors.slice(0, 3).map((author) => (
							<Badge key={author} variant="secondary">
								{author}
							</Badge>
						))}
						{paper.authors.length > 3 && (
							<Badge variant="outline">+{paper.authors.length - 3}</Badge>
						)}
					</div>
				</Link>
				<div className="flex items-center justify-between pt-2 text-muted-foreground text-xs">
					<span>
						{paper.journal} • {formatDate(paper.publishedAt)}
					</span>
					<a
						className="text-primary hover:underline"
						href={paper.sourceUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						View source
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
```

---

### Step 4.3: Create Facet Item Component

**File**: `apps/web/src/components/search/facets/facet-item.tsx` (create new)

```typescript
interface FacetItemProps {
	checked: boolean;
	count: number;
	onToggle: (value: string) => void;
	value: string;
}

export function FacetItem({ value, count, checked, onToggle }: FacetItemProps) {
	return (
		<label className="group flex cursor-pointer items-center justify-between gap-2 py-0.5">
			<div className="flex min-w-0 items-center gap-2">
				<input
					checked={checked}
					className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-input accent-foreground"
					onChange={() => onToggle(value)}
					type="checkbox"
				/>
				<span className="truncate text-muted-foreground text-sm leading-tight group-hover:text-foreground">
					{value}
				</span>
			</div>
			<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
				{count}
			</span>
		</label>
	);
}
```

---

### Step 4.4: Create Facet List Component

**File**: `apps/web/src/components/search/facets/facet-list.tsx` (create new)

```typescript
import type { FacetItem as FacetItemType } from "../../../types/paper";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { FacetItem } from "./facet-item";

const DEFAULT_VISIBLE = 5;

interface FacetListProps {
	items: FacetItemType[];
	onToggle: (value: string) => void;
	searchable?: boolean;
	selectedValues: string[];
	title: string;
}

export function FacetList({
	title,
	items,
	selectedValues,
	onToggle,
	searchable = false,
}: FacetListProps) {
	const [expanded, setExpanded] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	if (items.length === 0) {
		return null;
	}

	const filteredItems =
		searchable && searchTerm
			? items.filter((item) =>
					item.value.toLowerCase().includes(searchTerm.toLowerCase())
				)
			: items;

	const visible = expanded
		? filteredItems
		: filteredItems.slice(0, DEFAULT_VISIBLE);
	const hasMore = filteredItems.length > DEFAULT_VISIBLE;

	return (
		<div className="space-y-1">
			<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
				{title}
			</p>

			{searchable && (
				<div className="relative mb-2">
					<Search className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
					<input
						className="h-7 w-full rounded border border-input bg-background pr-2 pl-6 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search..."
						type="text"
						value={searchTerm}
					/>
				</div>
			)}

			{filteredItems.length === 0 && searchTerm ? (
				<p className="py-1 text-muted-foreground text-xs">No matches found</p>
			) : (
				<>
					<div className="space-y-0.5">
						{visible.map((item) => (
							<FacetItem
								checked={selectedValues.includes(item.value)}
								count={item.count}
								key={item.value}
								onToggle={onToggle}
								value={item.value}
							/>
						))}
					</div>
					{hasMore && (
						<button
							className="mt-1 flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
							onClick={() => setExpanded((prev) => !prev)}
							type="button"
						>
							{expanded ? (
								<>
									<ChevronUp className="h-3 w-3" />
									Show less
								</>
							) : (
								<>
									<ChevronDown className="h-3 w-3" />
									Show {filteredItems.length - DEFAULT_VISIBLE} more
								</>
							)}
						</button>
					)}
				</>
			)}
		</div>
	);
}
```

---

### Step 4.5: Create Author Filter Component

**File**: `apps/web/src/components/search/filters/author-filter.tsx` (create new)

```typescript
import { useEffect, useState } from "react";
import { Input } from "@scholar-seek/ui/components/input";

interface AuthorFilterProps {
	onChange: (value: string) => void;
	value: string;
}

export function AuthorFilter({ value, onChange }: AuthorFilterProps) {
	const [local, setLocal] = useState(value);

	useEffect(() => {
		setLocal(value);
	}, [value]);

	function handleBlur() {
		if (local !== value) {
			onChange(local);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			onChange(local);
		}
	}

	return (
		<Input
			className="h-8 text-sm"
			onBlur={handleBlur}
			onChange={(e) => setLocal(e.target.value)}
			onKeyDown={handleKeyDown}
			placeholder="Search by author..."
			value={local}
		/>
	);
}
```

---

### Step 4.6: Create DateRange Filter Component

**File**: `apps/web/src/components/search/filters/date-range-filter.tsx` (create new)

```typescript
import { useEffect, useRef, useState } from "react";

interface DateRangeFilterProps {
	onYearRangeChange: (from: number, to: number) => void;
	yearFrom: number;
	yearMax: number;
	yearMin: number;
	yearTo: number;
}

const DEBOUNCE_MS = 500;

export function DateRangeFilter({
	yearFrom,
	yearTo,
	yearMin,
	yearMax,
	onYearRangeChange,
}: DateRangeFilterProps) {
	const [localFrom, setLocalFrom] = useState(yearFrom);
	const [localTo, setLocalTo] = useState(yearTo);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setLocalFrom(yearFrom);
		setLocalTo(yearTo);
	}, [yearFrom, yearTo]);

	const callbackRef = useRef(onYearRangeChange);
	useEffect(() => {
		callbackRef.current = onYearRangeChange;
	}, [onYearRangeChange]);

	useEffect(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			if (localFrom !== yearFrom || localTo !== yearTo) {
				callbackRef.current(localFrom, localTo);
			}
		}, DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [localFrom, localTo, yearFrom, yearTo]);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between text-muted-foreground text-xs">
				<span>{localFrom}</span>
				<span>{localTo}</span>
			</div>

			<div className="space-y-1">
				<label className="text-muted-foreground text-xs">From</label>
				<input
					className="w-full cursor-pointer"
					max={yearMax}
					min={yearMin}
					onChange={(e) => {
						const val = Number.parseInt(e.target.value, 10);
						setLocalFrom(Math.min(val, localTo));
					}}
					type="range"
					value={localFrom}
				/>
			</div>

			<div className="space-y-1">
				<label className="text-muted-foreground text-xs">To</label>
				<input
					className="w-full cursor-pointer"
					max={yearMax}
					min={yearMin}
					onChange={(e) => {
						const val = Number.parseInt(e.target.value, 10);
						setLocalTo(Math.max(val, localFrom));
					}}
					type="range"
					value={localTo}
				/>
			</div>
		</div>
	);
}
```

---

### Step 4.7: Create Filter Panel Component

**File**: `apps/web/src/components/search/filter-panel.tsx` (create new)

```typescript
import type { Facets } from "../../types/paper";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@scholar-seek/ui/components/button";
import { Separator } from "@scholar-seek/ui/components/separator";
import { FacetList } from "./facets/facet-list";
import { AuthorFilter } from "./filters/author-filter";
import { DateRangeFilter } from "./filters/date-range-filter";

interface FilterPanelProps {
	facets?: Facets;
}

function FilterContent({ facets }: FilterPanelProps) {
	const {
		authorFilter,
		journalFilter,
		keywordFilter,
		yearFrom,
		yearTo,
		activeFilterCount,
		setAuthorFilter,
		setJournalFilter,
		setKeywordFilter,
		setYearRange,
		clearAllFilters,
		YEAR_MIN,
		YEAR_MAX,
	} = useFilterContext();

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<span className="font-semibold text-sm">Filters</span>
				{activeFilterCount > 0 && (
					<button
						className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
						onClick={clearAllFilters}
						type="button"
					>
						<X className="h-3 w-3" />
						Clear all ({activeFilterCount})
					</button>
				)}
			</div>

			<Separator />

			<div className="space-y-2">
				<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Publication Year
				</p>
				<DateRangeFilter
					onYearRangeChange={setYearRange}
					yearFrom={yearFrom}
					yearMax={YEAR_MAX}
					yearMin={YEAR_MIN}
					yearTo={yearTo}
				/>
			</div>

			<Separator />

			<div className="space-y-2">
				<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Author
				</p>
				<AuthorFilter onChange={setAuthorFilter} value={authorFilter} />
			</div>

			<Separator />

			{facets && facets.journals.length > 0 ? (
				<FacetList
					items={facets.journals}
					onToggle={(value) => {
						if (journalFilter.includes(value)) {
							setJournalFilter(journalFilter.filter((j) => j !== value));
						} else {
							setJournalFilter([...journalFilter, value]);
						}
					}}
					searchable
					selectedValues={journalFilter}
					title="Journal"
				/>
			) : null}

			{facets &&facets.keywords.length > 0 && (
				<>
					<Separator />
					<FacetList
						items={facets.keywords}
						onToggle={(value) => {
							if (keywordFilter.includes(value)) {
								setKeywordFilter(keywordFilter.filter((k) => k !== value));
							} else {
								setKeywordFilter([...keywordFilter, value]);
							}
						}}
						searchable
						selectedValues={keywordFilter}
						title="Keywords"
					/>
				</>
			)}
		</div>
	);
}
```

**Note**: This component requires a context provider. We'll add it in Step 4.12.

---

### Step 4.8: Create Active Filters Component

**File**: `apps/web/src/components/search/active-filters.tsx` (create new)

```typescript
import { X } from "lucide-react";

interface FilterContextValue {
	authorFilter: string;
	journalFilter: string[];
	keywordFilter: string[];
	yearFrom: number;
	yearTo: number;
	setAuthorFilter: (value: string) => void;
	setJournalFilter: (values: string[]) => void;
	setKeywordFilter: (values: string[]) => void;
	setYearRange: (from: number, to: number) => void;
	clearAllFilters: () => void;
	YEAR_MIN: number;
	YEAR_MAX: number;
	activeFilterCount: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilterContext() {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilterContext must be used within FilterProvider");
	}
	return context;
}

export { FilterProvider, FilterContext };
```

Update `apps/web/src/components/search/filter-panel.tsx` to import from context:

```typescript
// Add at top of file
import { useFilterContext } from "./active-filters";

// Remove the local useFilterContext definition
```

---

### Step 4.9: Create Sort Dropdown Component

**File**: `apps/web/src/components/search/sort-dropdown.tsx` (create new)

```typescript
import type { SortBy } from "../../types/paper";
import { useFilterContext } from "./active-filters";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
	{ value: "relevance", label: "Relevance" },
	{ value: "date_desc", label: "Date: Newest first" },
	{ value: "date_asc", label: "Date: Oldest first" },
	{ value: "title_asc", label: "Title: A–Z" },
	{ value: "author_asc", label: "Author: A–Z" },
];

export function SortDropdown() {
	const { sortBy, setSortBy } = useFilterContext();

	return (
		<div className="flex items-center gap-2 text-muted-foreground text-sm">
			<label className="shrink-0" htmlFor="sort-dropdown">
				Sort by
			</label>
			<select
				aria-label="Sort results"
				className="h-8 rounded-md border border-input bg-background px-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
				id="sort-dropdown"
				onChange={(e) => setSortBy(e.target.value as SortBy)}
				value={sortBy}
			>
				{SORT_OPTIONS.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	);
}
```

---

### Step 4.10: Create Page Size Selector Component

**File**: `apps/web/src/components/search/page-size-selector.tsx` (create new)

```typescript
const PAGE_SIZES = [10, 25, 50];

interface PageSizeSelectorProps {
	onPageSizeChange: (size: number) => void;
	pageSize: number;
}

export function PageSizeSelector({
	pageSize,
	onPageSizeChange,
}: PageSizeSelectorProps) {
	return (
		<div className="flex items-center gap-2 text-muted-foreground text-sm">
			<label htmlFor="page-size-selector">Show</label>
			<select
				aria-label="Results per page"
				className="h-8 rounded-md border border-input bg-background px-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
				id="page-size-selector"
				onChange={(e) => onPageSizeChange(Number(e.target.value))}
				value={pageSize}
			>
				{PAGE_SIZES.map((size) => (
					<option key={size} value={size}>
						{size}
					</option>
				))}
			</select>
			<span>per page</span>
		</div>
	);
}
```

---

### Step 4.11: Create Pagination Component

**File**: `apps/web/src/components/search/pagination.tsx` (create new)

```typescript
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "@scholar-seek/ui/components/button";

interface PaginationProps {
	onPageChange: (page: number) => void;
	page: number;
	pageSize: number;
	total: number;
}

function getPageSlots(page: number, totalPages: number): (number | "ellipsis")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const slots: (number | "ellipsis")[] = [1];

	if (page <= 4) {
		slots.push(2, 3, 4, 5, "ellipsis", totalPages);
	} else if (page >= totalPages - 3) {
		slots.push(
			"ellipsis",
			totalPages -4,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages
		);
	} else {
		slots.push("ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
	}

	return slots;
}

export function Pagination({
	page,
	pageSize,
	total,
	onPageChange,
}: PaginationProps) {
	const totalPages = Math.ceil(total / pageSize);

	if (totalPages <= 1) {
		return null;
	}

	const slots = getPageSlots(page, totalPages);

	return (
		<div className="flex items-center justify-center gap-1">
			<Button
				aria-label="First page"
				className="h-8 w-8"
				disabled={page === 1}
				onClick={() => onPageChange(1)}
				size="icon"
				type="button"
				variant="outline"
			>
				<ChevronsLeft className="h-4 w-4" />
			</Button>

			<Button
				aria-label="Previous page"
				className="h-8 w-8"
				disabled={page === 1}
				onClick={() => onPageChange(page - 1)}
				size="icon"
				type="button"
				variant="outline"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{slots.map((slot, i) =>
				slot === "ellipsis" ? (
					<span
						className="select-none px-1 text-muted-foreground"
						key={`ellipsis-${i}`}
					>
						&hellip;
					</span>
				) : (
					<Button
						aria-current={slot === page ? "page" : undefined}
						aria-label={`Page ${slot}`}
						className="h-8 w-8"
						key={slot}
						onClick={() => onPageChange(slot)}
						size="icon"
						type="button"
						variant={slot === page ? "default" : "outline"}
					>
						{slot}
					</Button>
				)
			)}

			<Button
				aria-label="Next page"
				className="h-8 w-8"
				disabled={page === totalPages}
				onClick={() => onPageChange(page + 1)}
				size="icon"
				type="button"
				variant="outline"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>

			<Button
				aria-label="Last page"
				className="h-8 w-8"
				disabled={page === totalPages}
				onClick={() => onPageChange(totalPages)}
				size="icon"
				type="button"
				variant="outline"
			>
				<ChevronsRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
```

---

### Step 4.12: Create Search Results Component

**File**: `apps/web/src/components/search/search-results.tsx` (create new)

This is the main component that orchestrates the search results display.

```typescript
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { Facets } from "../../types/paper";
import { X } from "lucide-react";
import { Skeleton } from "@scholar-seek/ui/components/skeleton";
import { useAvailableJournals, useSearchPapers } from "../../lib/hooks/use-papers";
import { FilterProvider, useFilterContext } from "./active-filters";
import { FilterPanel } from "./filter-panel";
import { PageSizeSelector } from "./page-size-selector";
import { Pagination } from "./pagination";
import { ResultCard } from "./result-card";
import { SortDropdown } from "./sort-dropdown";

function ActiveFilters() {
	const {
		authorFilter,
		journalFilter,
		keywordFilter,
		yearFrom,
		yearTo,
		setAuthorFilter,
		setJournalFilter,
		setKeywordFilter,
		setYearRange,
		YEAR_MIN,
		YEAR_MAX,
	} = useFilterContext();

	const hasYearFilter = yearFrom !== YEAR_MIN || yearTo !== YEAR_MAX;
	const chips: { label: string; onRemove: () => void }[] = [];

	if (authorFilter) {
		chips.push({
			label: `Author: ${authorFilter}`,
			onRemove: () => setAuthorFilter(""),
		});
	}

	if (hasYearFilter) {
		chips.push({
			label: `Years: ${yearFrom}–${yearTo}`,
			onRemove: () => setYearRange(YEAR_MIN, YEAR_MAX),
		});
	}

	for (const journal of journalFilter) {
		chips.push({
			label: journal,
			onRemove: () =>
				setJournalFilter(journalFilter.filter((j) => j !== journal)),
		});
	}

	for (const keyword of keywordFilter) {
		chips.push({
			label: keyword,
			onRemove: () =>
				setKeywordFilter(keywordFilter.filter((k) => k !== keyword)),
		});
	}

	if (chips.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{chips.map((chip) => (
				<span
					className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-muted-foreground text-xs"
					key={chip.label}
				>
					{chip.label}
					<button
						aria-label={`Remove filter: ${chip.label}`}
						className="ml-0.5 transition-colors hover:text-foreground"
						onClick={chip.onRemove}
						type="button"
					>
						<X className="h-3 w-3" />
					</button>
				</span>
			))}
		</div>
	);
}

interface SearchResultsContentProps {
	query: string;
	page: number;
	pageSize: number;
}

function SearchResultsContent({ query, page, pageSize }: SearchResultsContentProps) {
	const navigate = useNavigate();
	const search = useSearch({ from: "/search/" });
	const {
		authorFilter,
		journalFilter,
		keywordFilter,
		yearFrom,
		yearTo,
		sortBy,
		activeFilterCount,
		clearAllFilters,
		YEAR_MIN,
		YEAR_MAX,
	} = useFilterContext();

	const hasYearFilter = yearFrom !== YEAR_MIN || yearTo !== YEAR_MAX;

	const { data: availableJournalsData } = useAvailableJournals();
	const availableJournals = availableJournalsData ?? [];

	const { data, isLoading, error } = useSearchPapers({
		q: query,
		page,
		pageSize,
		authorFilter: authorFilter || undefined,
		journalFilter: journalFilter.length > 0 ? journalFilter : undefined,
		keywordFilter: keywordFilter.length > 0 ? keywordFilter : undefined,
		yearFrom: hasYearFilter ? yearFrom : undefined,
		yearTo: hasYearFilter ? yearTo : undefined,
		sortBy,
	});

	function updateParam(key: string, value: string) {
		navigate({
			to: "/search",
			search: { ...search, [key]: value, page: 1 },
		});
	}

	function handlePageChange(newPage: number) {
		updateParam("page", String(newPage));
	}

	function handlePageSizeChange(newSize: number) {
		navigate({
			to: "/search",
			search: { ...search, pageSize: newSize, page: 1 },
		});
	}

	if (!query) {
		return (
			<p className="text-center text-muted-foreground">
				Enter a search term to find papers
			</p>
		);
	}

	if (isLoading) {
		return (
			<div className="grid gap-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<div className="space-y-3 rounded-lg border p-4" key={i}>
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<p className="text-center text-destructive">
				Error loading results. Please try again.
			</p>
		);
	}

	if (!data?.papers.length) {
		const hasActiveFilters = activeFilterCount > 0;
		return (
			<div className="space-y-4">
				<ActiveFilters />
				<div className="space-y-2 text-center text-muted-foreground">
					<p>No results found for "{query}"</p>
					{hasActiveFilters && (
						<p className="text-sm">
							Try{" "}
							<button
								className="text-primary hover:underline"
								onClick={clearAllFilters}
								type="button"
							>
								clearing your filters
							</button>
							.
						</p>
					)}
				</div>
			</div>
		);
	}

	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, data.total);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-muted-foreground text-sm">
					Showing {start}–{end} of {data.total} results
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<PageSizeSelector
						onPageSizeChange={handlePageSizeChange}
						pageSize={pageSize}
					/>
					<SortDropdown />
				</div>
			</div>

			<ActiveFilters />

			<div className="grid gap-4">
				{data.papers.map((paper) => (
					<ResultCard key={paper.id} paper={paper} />
				))}
			</div>

			<div className="pt-2">
				<Pagination
					onPageChange={handlePageChange}
					page={page}
					pageSize={pageSize}
					total={data.total}
				/>
			</div>
		</div>
	);
}

interface SearchResultsProps {
	query: string;
	page: number;
	pageSize: number;
	facets?: Facets;
}

export function SearchResults({ query, page, pageSize }: SearchResultsProps) {
	const search = useSearch({ from: "/search/" });

	return (
		<FilterProvider search={search}>
			<div className="flex gap-6">
				<FilterPanel facets={undefined} />

				<div className="min-w-0 flex-1">
					<SearchResultsContent
						page={page}
						pageSize={pageSize}
						query={query}
					/>
				</div>
			</div>
		</FilterProvider>
	);
}
```

---

### Step 4.13: Create Search Components Index

**File**: `apps/web/src/components/search/index.ts` (create new)

```typescript
export { SearchBar } from "./search-bar";
export { ResultCard } from "./result-card";
export { FilterPanel } from "./filter-panel";
export { ActiveFilters, FilterProvider, useFilterContext } from "./active-filters";
export { SortDropdown } from "./sort-dropdown";
export { PageSizeSelector } from "./page-size-selector";
export { Pagination } from "./pagination";
export { SearchResults } from "./search-results";
```

---

## Verification Checklist

- [ ] `apps/web/src/components/search/search-bar.tsx` created
- [ ] `apps/web/src/components/search/result-card.tsx` created
- [ ] `apps/web/src/components/search/facets/facet-item.tsx` created
- [ ] `apps/web/src/components/search/facets/facet-list.tsx` created
- [ ] `apps/web/src/components/search/filters/author-filter.tsx` created
- [ ] `apps/web/src/components/search/filters/date-range-filter.tsx` created
- [ ] `apps/web/src/components/search/filter-panel.tsx` created
- [ ] `apps/web/src/components/search/active-filters.tsx` created (with FilterProvider)
- [ ] `apps/web/src/components/search/sort-dropdown.tsx` created
- [ ] `apps/web/src/components/search/page-size-selector.tsx` created
- [ ] `apps/web/src/components/search/pagination.tsx` created
- [ ] `apps/web/src/components/search/search-results.tsx` created
- [ ] `apps/web/src/components/search/index.ts` created

## Next Phase
Proceed to [Phase 5: Routes](./05-routes.md)