# API Implementation Specification

This document describes all endpoints, data structures, and implementation code for the Scholar-Seek backend API using ElysiaJS best practices and Eden Treaty for end-to-end type safety.

---

## Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/papers` | GET | Search papers with pagination, filters, and facets |
| `GET /api/papers/:id` | GET | Get a single paper by ID |
| `GET /api/papers/:id/related` | GET | Get related papers (shared keywords) |
| `GET /api/journals` | GET | List unique journals for facets |

**Base URL**: `http://localhost:3000` (configurable via `VITE_SERVER_URL`)

---

## File Structure

Following ElysiaJS recommended feature-based folder structure:

```
apps/server/src/
├── index.ts                    # Main entry point (exports App type)
├── modules/
│   └── papers/
│       ├── index.ts           # Elysia controller (routes)
│       ├── service.ts         # Business logic (Drizzle queries)
│       └── model.ts           # TypeBox schemas (validation types)
apps/web/src/lib/
└── api/
    └── treaty.ts              # Eden Treaty client
```

---

## Eden Treaty Setup

Eden Treaty provides end-to-end type safety between backend and frontend without code generation.

### Step1: Export App Type from Server

The server must export its Elysia instance type for Eden Treaty to consume.

### Step 2: Create Treaty Client

Frontend uses the exported type to create a type-safe client.

### Step 3: Use in Components

React Query hooks call the Treaty client directly.

---

## Data Types

### Database Schema (existing)

Location: `packages/db/src/schema/papers.ts`

```typescript
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const papers = pgTable(
	"papers",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		abstract: text("abstract"),
		authors: jsonb("authors").$type<string[]>().notNull().default([]),
		published_at: timestamp("published_at", { withTimezone: true }),
		journal: varchar("journal", { length:255 }),
		doi: varchar("doi", { length: 255 }).unique(),
		keywords: jsonb("keywords").$type<string[]>(),
		source_url: text("source_url").notNull(),
		source: varchar("source", { length: 100 }),
		source_id: varchar("source_id", { length: 255 }),
		citation_count: integer("citation_count").default(0).notNull(),
		embedding_stored: boolean("embedding_stored").default(false).notNull(),
		created_at: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("papers_journal_idx").on(table.journal),
		index("papers_published_at_idx").on(table.published_at),
		index("papers_source_idx").on(table.source),
		index("papers_embedding_stored_idx").on(table.embedding_stored),
	]
);

export type Paper = typeof papers.$inferSelect;
export type NewPaper = typeof papers.$inferInsert;
```

---

## Implementation Files

### File: `apps/server/src/modules/papers/model.ts`

TypeBox schemas for request/response validation. Using Elysia's `.model()` pattern for type registration.

```typescript
import { t } from "elysia";

export const PaperResponse = t.Object({
	id: t.String(),
	title: t.String(),
	abstract: t.Union([t.String(), t.Null()]),
	authors: t.Array(t.String()),
	publishedAt: t.Union([t.String(), t.Null()]),
	journal: t.Union([t.String(), t.Null()]),
	doi: t.Union([t.String(), t.Null()]),
	keywords: t.Union([t.Array(t.String()), t.Null()]),
	sourceUrl: t.String(),
});

export const FacetItem = t.Object({
	value: t.String(),
	count: t.Number(),
});

export const Facets = t.Object({
	journals: t.Array(FacetItem),
	keywords: t.Array(FacetItem),
	authors: t.Array(FacetItem),
	years: t.Array(FacetItem),
});

export const SearchResult = t.Object({
	papers: t.Array(PaperResponse),
	total: t.Number(),
	page: t.Number(),
	pageSize: t.Number(),
	facets: Facets,
});

export const ErrorResponse = t.Object({
	error: t.String(),
});

export const SortBy = t.Union([
	t.Literal("relevance"),
	t.Literal("date_desc"),
	t.Literal("date_asc"),
	t.Literal("title_asc"),
	t.Literal("author_asc"),
]);

export const SearchQuery = t.Object({
	q: t.Optional(t.String()),
	page: t.Optional(t.Numeric()),
	pageSize: t.Optional(t.Numeric()),
	sortBy: t.Optional(SortBy),
	author: t.Optional(t.String()),
	journal: t.Optional(t.Union([t.String(), t.Array(t.String())])),
	keyword: t.Optional(t.Union([t.String(), t.Array(t.String())])),
	yearFrom: t.Optional(t.Numeric()),
	yearTo: t.Optional(t.Numeric()),
});

export const RelatedQuery = t.Object({
	limit: t.Optional(t.Numeric()),
});

export const PaperParams = t.Object({
	id: t.String(),
});

export const JournalsResponse = t.Array(t.String());

export type PaperResponseType = typeof PaperResponse.static;
export type FacetsType = typeof Facets.static;
export type SearchResultType = typeof SearchResult.static;
export type SortByType = typeof SortBy.static;
```

---

### File: `apps/server/src/modules/papers/service.ts`

Service layer handles business logic, decoupled from Elysia controller. Uses `status` from Elysia for error responses.

```typescript
import { status } from "elysia";
import { db } from "@scholar-seek/db";
import type { Paper } from "@scholar-seek/db";
import { papers } from "@scholar-seek/db";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type {
	FacetItem,
	FacetsType,
	PaperResponseType,
	SearchResultType,
	SortByType,
} from "./model";

function toPaperResponse(paper: Paper): PaperResponseType {
	return {
		id: paper.id,
		title: paper.title,
		abstract: paper.abstract,
		authors: paper.authors,
		publishedAt: paper.publishedAt?.toISOString() ?? null,
		journal: paper.journal,
		doi: paper.doi,
		keywords: paper.keywords,
		sourceUrl: paper.sourceUrl,
	};
}

function parseArrayParam(
	param: string | string[] | undefined
): string[] | undefined {
	if (!param) return undefined;
	if (Array.isArray(param)) return param;
	return [param];
}

function buildFacets(papersList: Paper[]): FacetsType {
	const journalCounts = new Map<string, number>();
	const keywordCounts = new Map<string, number>();
	const authorCounts = new Map<string, number>();
	const yearCounts = new Map<string, number>();

	for (const paper of papersList) {
		if (paper.journal) {
			journalCounts.set(paper.journal, (journalCounts.get(paper.journal) ?? 0) + 1);
		}

		if (paper.keywords) {
			for (const keyword of paper.keywords) {
				keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) +1);
			}
		}

		for (const author of paper.authors) {
			authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
		}

		if (paper.publishedAt) {
			const year = paper.publishedAt.getFullYear().toString();
			yearCounts.set(year, (yearCounts.get(year) ??0) + 1);
		}
	}

	const toFacetItems = (map: Map<string, number>): FacetItem[] =>
		Array.from(map.entries())
			.map(([value, count]) => ({ value, count }))
			.sort((a, b) => b.count - a.count);

	return {
		journals: toFacetItems(journalCounts),
		keywords: toFacetItems(keywordCounts),
		authors: toFacetItems(authorCounts),
		years: toFacetItems(yearCounts),
	};
}

function sortPapers(papersList: Paper[], sortBy: SortByType): Paper[] {
	const sorted = [...papersList];

	switch (sortBy) {
		case "date_desc":
			return sorted.sort(
				(a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ??0)
			);
		case "date_asc":
			return sorted.sort(
				(a, b) => (a.publishedAt?.getTime() ?? 0) - (b.publishedAt?.getTime() ?? 0)
			);
		case "title_asc":
			return sorted.sort((a, b) => a.title.localeCompare(b.title));
		case "author_asc":
			return sorted.sort((a, b) =>
				(a.authors[0] ?? "").localeCompare(b.authors[0] ?? "")
			);
		default:
			return sorted;
	}
}

export async function searchPapers(params: {
	q?: string;
	page?: number;
	pageSize?: number;
	sortBy?: SortByType;
	author?: string;
	journal?: string | string[];
	keyword?: string | string[];
	yearFrom?: number;
	yearTo?: number;
}): Promise<SearchResultType> {
	const page = Math.max(1, params.page ?? 1);
	const pageSize = [10, 20, 50].includes(params.pageSize ?? 20)
		? (params.pageSize ?? 20)
		: 20;
	const sortBy: SortByType = params.sortBy ?? "relevance";

	const conditions = [];

	if (params.q) {
		const searchPattern = `%${params.q.toLowerCase()}%`;
		conditions.push(
			or(
				ilike(papers.title, searchPattern),
				ilike(papers.abstract, searchPattern),
				sql`${papers.authors}::text ilike ${searchPattern}`,
				sql`${papers.keywords}::text ilike ${searchPattern}`,
				ilike(papers.journal, searchPattern)
			)
		);
	}

	if (params.author) {
		conditions.push(sql`${papers.authors}::text ilike ${`%"${params.author}%"`}`);
	}

	const journals = parseArrayParam(params.journal);
	if (journals && journals.length > 0) {
		conditions.push(inArray(papers.journal, journals));
	}

	const keywords = parseArrayParam(params.keyword);
	if (keywords && keywords.length > 0) {
		conditions.push(
			sql`${papers.keywords}::jsonb ?| ${JSON.stringify(keywords)}`
		)
		;
	}

	if (params.yearFrom !== undefined) {
		conditions.push(
			sql`extract(year from ${papers.published_at}) >= ${params.yearFrom}`
		);
	}

	if (params.yearTo !== undefined) {
		conditions.push(
			sql`extract(year from ${papers.published_at}) <= ${params.yearTo}`
		);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const allMatchingPapers = await db.select().from(papers).where(whereClause);

	const facets = buildFacets(allMatchingPapers);

	const sortedPapers =
		sortBy !== "relevance" ? sortPapers(allMatchingPapers, sortBy) : allMatchingPapers;

	const total = sortedPapers.length;
	const offset = (page -1) * pageSize;
	const paginatedPapers = sortedPapers.slice(offset, offset + pageSize);

	return {
		papers: paginatedPapers.map(toPaperResponse),
		total,
		page,
		pageSize,
		facets,
	};
}

export async function getPaper(id: string): Promise<PaperResponseType> {
	const [paper] = await db.select().from(papers).where(eq(papers.id, id));

	if (!paper) {
		throw status(404, "Paper not found");
	}

	return toPaperResponse(paper);
}

export async function getRelatedPapers(
	id: string,
	limit = 5
): Promise<PaperResponseType[]> {
	const [sourcePaper] = await db.select().from(papers).where(eq(papers.id, id));

	if (!sourcePaper || !sourcePaper.keywords || sourcePaper.keywords.length === 0) {
		return [];
	}

	const keywords = sourcePaper.keywords;

	const relatedPapers = await db
		.select()
		.from(papers)
		.where(
			and(
				sql`${papers.id} != ${id}`,
				sql`${papers.keywords}::jsonb ?| ${keywords}`
			)
		)
		.limit(limit);

	return relatedPapers.map(toPaperResponse);
}

export async function getJournals(): Promise<string[]> {
	const result = await db
		.selectDistinct({ journal: papers.journal })
		.from(papers)
		.where(sql`${papers.journal} IS NOT NULL`)
		.orderBy(asc(papers.journal));

	return result
		.map((r) => r.journal)
		.filter((j): j is string => j !== null);
}
```

---

### File: `apps/server/src/modules/papers/index.ts`

Elysia controller (routes). Uses `status` for error responses and `.model()` for type registration.

```typescript
import { Elysia, t } from "elysia";
import { status } from "elysia";
import {
	ErrorResponse,
	JournalsResponse,
	PaperParams,
	PaperResponse,
	RelatedQuery,
	SearchQuery,
	SearchResult,
} from "./model";
import {
	getJournals,
	getPaper,
	getRelatedPapers,
	searchPapers,
} from "./service";

export const papersModule = new Elysia({ name: "module.papers", prefix: "/api" })
	.model({
		paper: PaperResponse,
		searchResult: SearchResult,
		searchQuery: SearchQuery,
		error: ErrorResponse,
		journals: JournalsResponse,
		relatedQuery: RelatedQuery,
		paperParams: PaperParams,
	})
	.get(
		"/papers",
		async ({ query }) => {
			const params = {
				q: query.q,
				page: query.page ? Number(query.page) : undefined,
				pageSize: query.pageSize ? Number(query.pageSize) : undefined,
				sortBy: query.sortBy,
				author: query.author,
				journal: query.journal,
				keyword: query.keyword,
				yearFrom: query.yearFrom ? Number(query.yearFrom) : undefined,
				yearTo: query.yearTo ? Number(query.yearTo) : undefined,
			};

			return searchPapers(params);
		},
		{
			query: "searchQuery",
			response: {
				200: "searchResult",
				500: "error",
			},
			detail: {
				summary: "Search papers",
				description: "Search papers with full-text search, filters, pagination, and facets",
				tags: ["papers"],
			},
		}
	)
	.get(
		"/papers/:id",
		async ({ params }) => getPaper(params.id),
		{
			params: "paperParams",
			response: {
				200: "paper",
				404: "error",
			},
			detail: {
				summary: "Get paper by ID",
				description: "Retrieve a single paper by its UUID",
				tags: ["papers"],
			},
		}
	)
	.get(
		"/papers/:id/related",
		async ({ params, query }) => {
			const limit = query.limit ? Number(query.limit) : 5;
			return getRelatedPapers(params.id, limit);
		},
		{
			params: "paperParams",
			query: "relatedQuery",
			response: {
				200: t.Array(PaperResponse),
			},
			detail: {
				summary: "Get related papers",
				description: "Find papers related to the specified paper by shared keywords",
				tags: ["papers"],
			},
		}
	)
	.get("/journals", () => getJournals(), {
		response: {
			200: "journals",
		},
		detail: {
			summary: "Get all journals",
			description: "Get a list of all unique journal names for facet filtering",
			tags: ["journals"],
		},
	});
```

---

### File: `apps/server/src/index.ts`

Main entry point. Exports `App` type for Eden Treaty.

```typescript
import { cors } from "@elysiajs/cors";
import { env } from "@scholar-seek/env/server";
import { Elysia } from "elysia";
import { papersModule } from "./modules/papers";

const app = new Elysia()
	.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "OPTIONS"],
		})
	)
	.use(papersModule)
	.get("/", () => "OK", {
		detail: {
			summary: "Health check",
			tags: ["health"],
		},
	})
	.listen(3000, () => {
		console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
	});

export type App = typeof app;
```

---

### File: `apps/web/src/lib/api/treaty.ts`

Eden Treaty client for type-safe API calls. This replaces the fetch-based API client.

```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "@scholar-seek/server";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export const api = treaty<App>(SERVER_URL);

export type Api = typeof api;
```

---

### File: `apps/web/src/lib/hooks/use-papers.ts` (updated with Eden Treaty)

Hooks now use Eden Treaty for type-safe API calls.

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/treaty";
import type { SearchParams } from "../../types/paper";

export function useSearchPapers(params: SearchParams) {
	return useQuery({
		queryKey: ["papers", "search", params],
		queryFn: async () => {
			const { data, error } = await api.api.papers.get({
				query: {
					q: params.q,
					page: params.page?.toString(),
					pageSize: params.pageSize?.toString(),
					sortBy: params.sortBy,
					author: params.author,
					journal: params.journalFilter,
					keyword: params.keywordFilter,
					yearFrom: params.yearFrom?.toString(),
					yearTo: params.yearTo?.toString(),
				},
			});

			if (error) {
				throw new Error(error.value?.error ?? "Failed to search papers");
			}

			return {
				papers: data.papers.map((p) => ({
					...p,
					publishedAt: p.publishedAt ?? "",
				})),
				total: data.total,
				page: data.page,
				pageSize: data.pageSize,
				facets: data.facets,
			};
		},
		enabled: !!params.q,
	});
}

export function usePaper(id: string) {
	return useQuery({
		queryKey: ["paper", id],
		queryFn: async () => {
			const { data, error } = await api.api.papers({ id }).get();

			if (error) {
				if (error.status === 404) {
					return null;
				}
				throw new Error(error.value?.error ?? "Failed to get paper");
			}

			return {
				...data,
				publishedAt: data.publishedAt ?? "",
			};
		},
		enabled: !!id,
	});
}

export function useRelatedPapers(id: string, limit = 5) {
	return useQuery({
		queryKey: ["papers", "related", id, limit],
		queryFn: async () => {
			const { data, error } = await api.api
				.papers({ id })
				.related.get({
					query: { limit: limit.toString() },
				});

			if (error) {
				throw new Error(error.value?.error ?? "Failed to get related papers");
			}

			return data.map((p) => ({
				...p,
				publishedAt: p.publishedAt ?? "",
			}));
		},
		enabled: !!id,
	});
}

export function useAvailableJournals() {
	return useQuery({
		queryKey: ["journals", "available"],
		queryFn: async () => {
			const { data, error } = await api.api.journals.get();

			if (error) {
				throw new Error(error.value?.error ?? "Failed to get journals");
			}

			return data;
		},
	});
}
```

---

## Shared Types Package (Optional Enhancement)

For better type sharing between frontend and backend, create a shared types package:

### File: `packages/types/src/index.ts`

```typescript
import type { App } from "@scholar-seek/server";

export type { App };
export type { 
	PaperResponseType as Paper,
	SearchResultType as SearchResult,
	FacetsType as Facets,
	SortByType as SortBy,
} from "@scholar-seek/server/src/modules/papers/model";
```

---

## Endpoints

### 1. GET /api/papers

Search papers with full-text search, filters, pagination, and facets.

**Request**

```
GET /api/papers?q=machine+learning&page=1&pageSize=20&sortBy=date_desc&author=Smith&journal=Nature&keyword=AI&yearFrom=2020&yearTo=2024
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | - | Full-text search query (searches title, abstract, authors, keywords, journal) |
| `page` | number | 1 | Page number (1-indexed) |
| `pageSize` | number | 20 | Items per page (valid: 10, 20, 50) |
| `sortBy` | enum | "relevance" | Sort order: `relevance`, `date_desc`, `date_asc`, `title_asc`, `author_asc` |
| `author` | string | - | Filter by author name (partial match, case-insensitive) |
| `journal` | string \| string[] | - | Filter by journal(s) (exact match) |
| `keyword` | string \| string[] | - | Filter by keyword(s) (exact match) |
| `yearFrom` | number | - | Minimum publication year |
| `yearTo` | number | - | Maximum publication year |

**Response** (200 OK)

```json
{
	"papers": [
		{
			"id": "uuid-string",
			"title": "Paper Title",
			"abstract": "Abstract text...",
			"authors": ["Author One", "Author Two"],
			"publishedAt": "2024-01-15T00:00:00.000Z",
			"journal": "Nature Machine Intelligence",
			"doi": "10.1234/example",
			"keywords": ["deep learning", "NLP"],
			"sourceUrl": "https://arxiv.org/abs/..."
		}
	],
	"total": 150,
	"page": 1,
	"pageSize": 20,
	"facets": {
		"journals": [
			{ "value": "Nature Machine Intelligence", "count": 45 },
			{ "value": "Science Advances", "count": 32 }
		],
		"keywords": [
			{ "value": "machine learning", "count": 89 },
			{ "value": "deep learning", "count": 67 }
		],
		"authors": [
			{ "value": "John Smith", "count": 12 },
			{ "value": "Jane Doe", "count": 8 }
		],
		"years": [
			{ "value": "2024", "count": 56 },
			{ "value": "2023", "count": 44 }
		]
	}
}
```

**Response** (500 Internal Server Error)

```json
{
	"error": "Failed to search papers"
}
```

---

### 2. GET /api/papers/:id

Get a single paper by its UUID.

**Request**

```
GET /api/papers/550e8400-e29b-41d4-a716-446655440000
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Paper ID |

**Response** (200 OK)

```json
{
	"id": "550e8400-e29b-41d4-a716-446655440000",
	"title": "Paper Title",
	"abstract": "Abstract text...",
	"authors": ["Author One", "Author Two"],
	"publishedAt": "2024-01-15T00:00:00.000Z",
	"journal": "Nature Machine Intelligence",
	"doi": "10.1234/example",
	"keywords": ["deep learning", "NLP"],
	"sourceUrl": "https://arxiv.org/abs/..."
}
```

**Response** (404 Not Found)

```json
{
	"error": "Paper not found"
}
```

---

### 3. GET /api/papers/:id/related

Get papers related to the specified paper by shared keywords.

**Request**

```
GET /api/papers/550e8400-e29b-41d4-a716-446655440000/related?limit=5
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Paper ID |

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number |5 | Maximum number of related papers to return |

**Response** (200 OK)

```json
[
	{
		"id": "660e8400-e29b-41d4-a716-446655440001",
		"title": "Related Paper Title",
		"abstract": "...",
		"authors": ["Author Three"],
		"publishedAt": "2024-02-20T00:00:00.000Z",
		"journal": "Nature Machine Intelligence",
		"doi": "10.1234/related",
		"keywords": ["deep learning", "transformers"],
		"sourceUrl": "https://..."
	}
]
```

**Logic for Related Papers**

1. Get the source paper's keywords
2. Find papers that share at least one keyword with the source paper
3. Exclude the source paper from results
4. Sort by number of shared keywords (descending), then by publication date (descending)
5. Limit results to requested number

---

### 4. GET /api/journals

Get all unique journal names for facet filtering.

**Request**

```
GET /api/journals
```

**Response** (200 OK)

```json
[
	"AI Magazine",
	"ACM Computing Surveys",
	"Applied Energy",
	"Bioethics Quarterly",
	"Computational Linguistics",
	"Conservation Biology",
	"Energy & Environmental Science",
	"IEEE Security & Privacy",
	"IEEE Transactions on Robotics",
	"Journal of Machine Learning Research",
	"Journal of Medical Internet Research",
	"Journal of Medical Systems",
	"Marine Ecology Progress Series",
	"Nature Machine Intelligence",
	"Nature Medicine",
	"Nature Structural & Molecular Biology",
	"Political Science Quarterly",
	"Physical Review Letters",
	"Science Advances",
	"Social Networks",
	"The Lancet Infectious Diseases",
	"Transactions on Machine Learning Research",
	"Urban Climate"
]
```

---

## Implementation Order

1. **Create model file**: `apps/server/src/modules/papers/model.ts`
2. **Create service file**: `apps/server/src/modules/papers/service.ts`
3. **Create controller file**: `apps/server/src/modules/papers/index.ts`
4. **Update main entry**: `apps/server/src/index.ts` (export `App` type)
5. **Create Treaty client**: `apps/web/src/lib/api/treaty.ts`
6. **Update hooks**: `apps/web/src/lib/hooks/use-papers.ts`
7. **Seed database**: `bun run db:start && bun run db:push && bun run db:seed`
8. **Test endpoints**: Manual testing or automated tests

---

## ElysiaJS Best Practices Applied

### Method Chaining

All routes use method chaining, which is required for proper type inference:

```typescript
new Elysia()
	.model({ ... })
	.get("/papers", ...)
	.get("/papers/:id", ...)
	.listen(3000);
```

### Status Function

Use `status` from Elysia for error responses:

```typescript
import { status } from "elysia";

if (!paper) {
	throw status(404, "Paper not found");
}
```

### Model Registration

Register types with `.model()` and reference by name:

```typescript
.model({
	paper: PaperResponse,
	searchResult: SearchResult,
})
.get("/papers/:id", ..., {
	response: {
		200: "paper",
		404: "error",
	},
})
```

### Service Layer

Services are abstract classes with static methods, decoupled from Elysia:

```typescript
export abstract class PaperService {
	static async getPaper(id: string) {
		// ...
	}
}
```

### Eden Treaty for Type Safety

Frontend uses Eden Treaty for end-to-end type safety without code generation:

```typescript
// Server
export type App = typeof app;

// Client
import { treaty } from "@elysiajs/eden";
import type { App } from "@scholar-seek/server";

const api = treaty<App>("http://localhost:3000");
const { data, error } = await api.api.papers.get();
```

---

## Notes

- The `relevance` sort order is currently a no-op (returns results in database order). For true relevance ranking, consider adding full-text search capabilities (PostgreSQL `tsvector` or vector embeddings).
- The API uses JSONB operators for keyword/author matching which requires PostgreSQL.
- Eden Treaty provides full type safety from backend to frontend without any code generation step.
- The `publishedAt` field can be null in the database but the frontend expects a string - the transformation handles this with a fallback to empty string.
- OpenAPI documentation is automatically generated from the TypeBox schemas.

---

## TanStack Start Integration

Since this project uses TanStack Start, you can also use Eden Treaty with server-side rendering for optimal performance:

```typescript
// apps/web/src/routes/api.$.ts
import { createFileRoute } from "@tanstack/react-router";
import { Elysia } from "elysia";
import { treaty } from "@elysiajs/eden";
import { papersModule } from "@scholar-seek/server/src/modules/papers";

const app = new Elysia({ prefix: "/api" }).use(papersModule);

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/api/$")({
	server: {
		handlers: {
			GET: handle,
			POST: handle,
		},
	},
});

// Server-side Treaty client (no HTTP overhead during SSR)
export const getTreaty = createIsomorphicFn()
	.server(() => treaty(app).api)
	.client(() => treaty<typeof app>("http://localhost:3000").api);
```

This pattern allows:
1. Direct function calls during SSR (no HTTP overhead)
2. HTTP calls during client navigation
3. Full type safety in both contexts