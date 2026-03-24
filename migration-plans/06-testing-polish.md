# Phase 6: Testing & Polish

## Objective
Finalize the migration by running type checks, linting, and verifying all components work correctly.

## Prerequisites
- All previous phases completed
- All files created and in place

---

## Steps

### Step 6.1: Run Type Check

**Command**:
```bash
bun run check-types
```

**Expected**: No type errors. If there are errors, fix them.

**Common Issues**:
- Missing imports - add missing import statements
- Type mismatches - ensure types align with definitions
- Unused variables - remove or use them

---

### Step 6.2: Run Lint & Format

**Command**:
```bash
bun x ultracite fix apps/web packages
```

**Expected**: All code formatted correctly. Fix any remaining issues.

---

### Step 6.3: Run Lint Check Only

**Command**:
```bash
bun x ultracite check apps/web packages
```

**Expected**: No lint errors. Address any remaining issues.

---

### Step 6.4: Start Development Server

**Command**:
```bash
bun run dev
```

**Expected**: Development server starts on port 3001 for web.

---

### Step 6.5: Manual Testing Checklist

Run through the following manual tests:

#### Home Page Tests
- [x] Home page loads correctly
- [x] Hero section displays with glassmorphic search bar
- [x] Featured topics grid shows 4 items
- [x] Clicking a topic navigates to search with correct query
- [x] "/" keyboard shortcut focuses search input
- [x] Search button navigates to search page

#### Search Page Tests
- [x] Search page loads with URL query parameter
- [x] Search bar shows default value from URL
- [x] Results display correctly (or empty state shown)
- [x] Pagination works (next, previous, page numbers)
- [x] Page size selector changes results per page
- [x] Sort dropdown changes sort order
- [x] Filters panel shows on desktop (sidebar)
- [x] Filter panel collapsible on mobile
- [x] Author filter works (input + blur/enter)
- [x] Date range filter works (sliders)
- [ ] Journal facet filtering works
- [ ] Keyword facet filtering works
- [x] Active filters show as chips
- [x] Clear all filters button works
- [x] Individual filter removal works

#### Paper Detail Page Tests
- [x] Paper detail page loads with correct ID
- [ ] Back to search link works
- [x] Paper metadata displays correctly
- [x] DOI link opens correctly
- [x] Source link opens correctly
- [x] Keywords display as badges
- [x] Related papers section shows (if available)
- [x] Clicking related paper navigates correctly

#### Theme Tests
- [x] Theme toggle switches between light/dark
- [x] Theme persists on page reload (localStorage)
- [x] System preference respected on first load

#### Responsive Tests
- [ ] Mobile layout (< 768px) works correctly
- [ ] Tablet layout (768px - 1024px) works correctly
- [ ] Desktop layout (> 1024px) works correctly
- [ ] Filter panel collapses on mobile

---

### Step 6.6: Fix Filter Panel Implementation

The `filter-panel.tsx` component needs the `useFilterContext` hook. Ensure it's properly connected:

**File**: `apps/web/src/components/search/filter-panel.tsx`

Make sure the import is correct and the component receives facets from search results:

The filter panel needs to receive `facets` data from the search results. Update `SearchResults` component to pass facets to `FilterPanel`:

```typescript
// In search-results.tsx, update the SearchResultsContent component
// to pass facets to FilterPanel

// After data loads:
<FilterPanel facets={data?.facets} />
```

---

### Step 6.7: Fix Active Filters Implementation

Ensure `active-filters.tsx` includes the FilterProvider context:

**File**: `apps/web/src/components/search/active-filters.tsx`

```typescript
import { createContext, useContext, type ReactNode } from "react";
import type { SortBy } from "../../types/paper";

interface FilterContextValue {
	authorFilter: string;
	journalFilter: string[];
	keywordFilter: string[];
	yearFrom: number;
	yearTo: number;
	sortBy: SortBy;
	setAuthorFilter: (value: string) => void;
	setJournalFilter: (values: string[]) => void;
	setKeywordFilter: (values: string[]) => void;
	setYearRange: (from: number, to: number) => void;
	setSortBy: (value: SortBy) => void;
	clearAllFilters: () => void;
	YEAR_MIN: number;
	YEAR_MAX: number;
	activeFilterCount: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
	children: ReactNode;
	search: Record<string, unknown>;
}

export function FilterProvider({ children, search }: FilterProviderProps) {
	const navigate = useNavigate();
	const YEAR_MIN = 2000;
	const YEAR_MAX = new Date().getFullYear();

	const authorFilter = (search.author as string) ?? "";
	const journalFilter = search.journal
		? Array.isArray(search.journal)
			? (search.journal as string[])
			: [search.journal as string]
		: [];
	const keywordFilter = search.keyword
		? Array.isArray(search.keyword)
			? (search.keyword as string[])
			: [search.keyword as string]
		: [];
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

	const updateSearch = (updates: Record<string, string | string[] | undefined>) => {
		const newSearch = { ...search, ...updates, page: 1 };
		navigate({ to: "/search", search: newSearch });
	};

	const setAuthorFilter = (value: string) =>
		updateSearch({ author: value || undefined });

	const setJournalFilter = (values: string[]) =>
		updateSearch({ journal: values.length > 0 ? values : undefined });

	const setKeywordFilter = (values: string[]) =>
		updateSearch({ keyword: values.length > 0 ? values : undefined });

	const setYearRange = (from: number, to: number) => {
		updateSearch({
			yearFrom: from === YEAR_MIN ? undefined : from,
			yearTo: to === YEAR_MAX ? undefined : to,
		});
	};

	const setSortBy = (value: SortBy) =>
		updateSearch({ sortBy: value === "relevance" ? undefined : value });

	const clearAllFilters = () => {
		navigate({
			to: "/search",
			search: { q: search.q, page: 1 },
		});
	};

	return (
		<FilterContext.Provider
			value={{
				authorFilter,
				journalFilter,
				keywordFilter,
				yearFrom,
				yearTo,
				sortBy,
				setAuthorFilter,
				setJournalFilter,
				setKeywordFilter,
				setYearRange,
				setSortBy,
				clearAllFilters,
				YEAR_MIN,
				YEAR_MAX,
				activeFilterCount,
			}}
		>
			{children}
		</FilterContext.Provider>
	);
}

export function useFilterContext() {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilterContext must be used within FilterProvider");
	}
	return context;
}
```

---

### Step 6.8: Clean Up Unused Files

Remove any unused or old files:

```bash
# Remove old components that are no longer needed
rm -f apps/web/src/components/header.tsx
rm -f apps/web/src/components/loader.tsx
```

---

### Step 6.9: Final Type Check

**Command**:
```bash
bun run check-types
```

---

### Step 6.10: Final Lint Fix

**Command**:
```bash
bun x ultracite fix apps/web packages
```

---

## Post-Migration Verification

### File Structure Check

Verify the final structure:

```
apps/web/src/
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── theme-toggle.tsx
│   │   └── index.ts
│   ├── search/
│   │   ├── search-bar.tsx
│   │   ├── result-card.tsx
│   │   ├── filter-panel.tsx
│   │   ├── active-filters.tsx
│   │   ├── sort-dropdown.tsx
│   │   ├── page-size-selector.tsx
│   │   ├── pagination.tsx
│   │   ├── search-results.tsx
│   │   ├── index.ts
│   │   ├── facets/
│   │   │   ├── facet-list.tsx
│   │   │   └── facet-item.tsx
│   │   └── filters/
│   │       ├── author-filter.tsx
│   │       └── date-range-filter.tsx
│   └── paper/
│       └── paper-detail.tsx (optional, if separated)
├── lib/
│   ├── mock-data.ts
│   ├── utils.ts
│   └── hooks/
│       ├── use-filters.ts
│       └── use-papers.ts
├── types/
│   └── paper.ts
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── search/
│   │   └── index.tsx
│   └── paper/
│       └── $id.tsx
├── index.css
└── router.tsx
```

### UV Package Exports Check

Ensure `packages/ui/src/styles/globals.css` has correct imports.

### Dependencies Check

Ensure `apps/web/package.json` has all required dependencies:
- `@tanstack/react-router`
- `@tanstack/react-query`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `zod`

---

## Success Criteria

- [ ] `bun run check-types` passes with no errors
- [ ] `bun x ultracite check apps/web packages` passes with no errors
- [ ] `bun run dev` starts successfully
- [ ] All pages render correctly
- [ ] Navigation works between pages
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Theme toggle works
- [ ] Responsive design works

## Next Steps

After successful migration:

1. Consider adding loading states for better UX
2. Add error boundaries for graceful error handling
3. Implement proper SEO metadata
4. Add analytics tracking
5. Consider implementing infinite scroll for results
6. Add keyboard navigation support
7. Implement accessibility improvements (ARIA labels, focus management)
