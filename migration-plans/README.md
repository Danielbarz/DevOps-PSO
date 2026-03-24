# Migration Plan: Next.js → TanStack Start

## Overview

**Source**: `example_apps/web` (Next.js16 App Router)
**Target**: `apps/web` (TanStack Start)

## Project Context

### Current Stack (example_apps/web)
- **Framework**: Next.js 16App Router
- **Routing**: `app/` directory with `page.tsx`, `layout.tsx`, `loading.tsx`
- **Navigation**: `next/link` and `next/navigation`
- **API**: Eden Treaty client connecting to ElysiaJS backend
- **State**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova style)
- **Theme**: OKLCH color system with violet/indigo primary

### Target Stack (apps/web)
- **Framework**: TanStack Start
- **Routing**: `routes/` directory with `__root.tsx`, `index.tsx`, `$param.tsx`
- **Navigation**: `@tanstack/react-router`
- **API**: Mock data (no server)
- **State**: TanStack Query (already configured)
- **Styling**: Tailwind CSS v4 + `@scholar-seek/ui`

## Key Migration Patterns

### 1. Routing Conventions

| Next.js | TanStack Start |
|---------|----------------|
| `app/page.tsx` | `routes/index.tsx` |
| `app/layout.tsx` | `routes/__root.tsx` |
| `app/search/page.tsx` | `routes/search/index.tsx` |
| `app/journal/[id]/page.tsx` | `routes/paper/$id.tsx` |
| `export default function Page()` | `export const Route = createFileRoute("/")({...})` |

### 2. Navigation

```tsx
// Next.js
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
<Link href="/search?q=test">Search</Link>
router.push(`/search?${params.toString()}`);

// TanStack Start
import { Link, useRouter, useSearch } from "@tanstack/react-router";
<Link to="/search" search={{ q: "test" }}>Search</Link>
router.navigate({ to: "/search", search: { q: "test" } });
```

### 3. Search Params (URL Query)

```tsx
// Next.js
import { useSearchParams } from "next/navigation";
const searchParams = useSearchParams();
const q = searchParams.get("q");
const page = searchParams.get("page");

// TanStack Start (with Zod schema)
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
	q: z.string().optional(),
	page: z.number().optional().default(1),
});

export const Route = createFileRoute("/search")({
	validateSearch: searchSchema,
	component: SearchPage,
});
// In component:
const { q, page } = Route.useSearch();
```

### 4. Dynamic Routes

```tsx
// Next.js: app/journal/[id]/page.tsx
interface JournalPageProps {
	params: Promise<{ id: string }>;
}
export default async function JournalPage({ params }: JournalPageProps) {
	const { id } = await params;
	// ...
}

// TanStack Start: routes/paper/$id.tsx
export const Route = createFileRoute("/paper/$id")({
	component: PaperPage,
});

function PaperPage() {
	const { id } = Route.useParams();
	// ...
}
```

### 5. Metadata (Head)

```tsx
// Next.js
export async function generateMetadata({ params }) {
	return { title: "Page Title" };
}

// TanStack Start
export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{ title: "Page Title" }],
	}),
});
```

### 6. Client vs Server Components

```tsx
// Next.js
"use client"; // Required for interactive components

// TanStack Start
// No "use client" directive needed
// All route components can use hooks directly
```

### 7. ImportsConvention

Follow the AGENTS.md import order:
1. External imports first
2. Workspace imports (`@scholar-seek/*`)
3. Relative imports

```tsx
// ✅ Correct
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@scholar-seek/ui/components/button";
import { cn } from "@scholar-seek/ui/lib/utils";
import Header from "../components/header";

// ✅ Type imports with `type` keyword
import type { Paper } from "../types/paper";
```

## File Structure

### Target Structure After Migration

```
apps/web/src/
├── components/
│   ├── layout/
│   │   ├── header.tsx      # Site header with nav & theme toggle
│   │   ├── footer.tsx      # Site footer
│   │   └── theme-toggle.tsx# Dark/light mode toggle
│   ├── search/
│   │   ├── search-bar.tsx
│   │   ├── result-card.tsx
│   │   ├── filter-panel.tsx
│   │   ├── active-filters.tsx
│   │   ├── sort-dropdown.tsx
│   │   ├── page-size-selector.tsx
│   │   ├── pagination.tsx
│   │   ├── search-results.tsx
│   │   ├── facets/
│   │   │   ├── facet-list.tsx
│   │   │   └── facet-item.tsx
│   │   └── filters/
│   │       ├── author-filter.tsx
│   │       └── date-range-filter.tsx
│   ├── paper/
│   │   └── paper-detail.tsx
│   ├── loader.tsx          # (keep existing)
│   └── header.tsx          # (delete, replaced)
├── lib/
│   ├── mock-data.ts        # Mock papers data
│   ├── utils.ts            # Utility functions
│   └── hooks/
│       ├── use-filters.ts  # URL-based filter state
│       └── use-papers.ts   # React Query hooks
├── types/
│   └── paper.ts            # Type definitions
├── routes/
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Home page
│   ├── search/
│   │   └── index.tsx       # Search results page
│   └── paper/
│       └── $id.tsx         # Paper detail page
├── index.css               # CSS imports
└── router.tsx              # Router config
```

## Execution Order

Run phases in order:
1. **Phase 1**: Setup (theme, UI components, types)
2. **Phase 2**: Mock data & hooks
3. **Phase 3**: Layout components
4. **Phase 4**: Search components
5. **Phase 5**: Routes
6. **Phase 6**: Testing & polish

## Commands Reference

```bash
# Add shadcn components
bun x shadcn@latest add badge -c packages/ui
bun x shadcn@latest add separator -c packages/ui

# Type check
bun run check-types

# Lint & format
bun x ultracite fix

# Run dev server
bun run dev
```

## Type Definitions Summary

```typescript
// types/paper.ts

export interface Paper {
	id: string;
	title: string;
	authors: string[];
	abstract?: string;
	journal: string;
	publishedAt: string; // ISO date string
	sourceUrl: string;
	doi?: string;
	keywords?: string[];
}

export type SortBy =
	| "relevance"
	| "date_desc"
	| "date_asc"
	| "title_asc"
	| "author_asc";

export interface SearchParams {
	q?: string;
	page?: number;
	pageSize?: number;
	sortBy?: SortBy;
	authorFilter?: string;
	journalFilter?: string[];
	keywordFilter?: string[];
	yearFrom?: number;
	yearTo?: number;
}

export interface FacetItem {
	value: string;
	count: number;
}

export interface Facets {
	journals: FacetItem[];
	keywords: FacetItem[];
	authors: FacetItem[];
	years: FacetItem[];
}

export interface SearchResult {
	papers: Paper[];
	total: number;
	page: number;
	pageSize: number;
	facets: Facets;
}
```

## Mock Data Strategy

Since we're not using the API:
- Create ~20-30 realistic mock papers
- Implement search/filter logic in mock functions
- Support pagination, sorting, and faceted search
- Generate realistic facets from paper metadata