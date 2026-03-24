# Phase 1: Setup

## Objective
Set up the foundation by updating the UI theme, adding missing shadcn components, and creating type definitions.

## Steps

### Step 1.1: Update GSTheme Colors

**File**: `packages/ui/src/styles/globals.css`

Replace the entire file content with the example app's OKLCH color theme (vibrant violet/indigo).

**Command**: None (direct file edit)

**Changes**: Replace the entirefile. The new theme uses:
- Violet/indigo primary colors (`oklch(0.45 0.16 280)` for light, `oklch(0.7 0.15 280)` for dark)
- OKLCH color space for perceptually uniform colors
- Custom CSS properties for all semantic colors

<details>
<summary>Full CSS Content</summary>

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@source "../../../apps/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(0.99 0.01 280);
	--foreground: oklch(0.15 0.02 280);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.15 0.02 280);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.15 0.02 280);

	/* Deep, vibrant Indigo/Violet for primary */
	--primary: oklch(0.45 0.16 280);
	--primary-foreground: oklch(0.98 0.01 280);

	--secondary: oklch(0.95 0.03 280);
	--secondary-foreground: oklch(0.25 0.05 280);

	--muted: oklch(0.95 0.02 280);
	--muted-foreground: oklch(0.55 0.03 280);

	--accent: oklch(0.95 0.03 280);
	--accent-foreground: oklch(0.25 0.05 280);

	--destructive: oklch(0.55 0.2 25);
	--border: oklch(0.9 0.02 280);
	--input: oklch(0.9 0.02 280);
	--ring: oklch(0.45 0.16 280 / 0.5);

	--chart-1: oklch(0.65 0.18 280);
	--chart-2: oklch(0.7 0.15 250);
	--chart-3: oklch(0.75 0.12 300);
	--chart-4: oklch(0.8 0.1 320);
	--chart-5: oklch(0.85 0.08 340);

	--radius: 0.75rem;
	--sidebar: oklch(0.98 0.01 280);
	--sidebar-foreground: oklch(0.15 0.02 280);
	--sidebar-primary: oklch(0.45 0.16 280);
	--sidebar-primary-foreground: oklch(0.98 0.01 280);
	--sidebar-accent: oklch(0.95 0.03 280);
	--sidebar-accent-foreground: oklch(0.25 0.05 280);
	--sidebar-border: oklch(0.9 0.02 280);
	--sidebar-ring: oklch(0.45 0.16 280 / 0.5);
}

.dark {
	--background: oklch(0.12 0.02 280);
	--foreground: oklch(0.98 0.01 280);
	--card: oklch(0.15 0.02 280);
	--card-foreground: oklch(0.98 0.01 280);
	--popover: oklch(0.15 0.02 280);
	--popover-foreground: oklch(0.98 0.01 280);

	/* Lighter, glowing Violet for primary in deep dark mode */
	--primary: oklch(0.7 0.15 280);
	--primary-foreground: oklch(0.12 0.02 280 ||--secondary: oklch(0.2 0.03 280);
	--secondary-foreground: oklch(0.98 0.01 280);

	--muted: oklch(0.2 0.03 280);
	--muted-foreground: oklch(0.65 0.03 280);

	--accent: oklch(0.2 0.03 280);
	--accent-foreground: oklch(0.98 0.01 280);

	--destructive: oklch(0.55 0.2 25);
	--border: oklch(0.25 0.03 280);
	--input: oklch(0.25 0.03 280);
	--ring: oklch(0.7 0.15 280 / 0.5);

	--chart-1: oklch(0.7 0.15 280);
	--chart-2: oklch(0.65 0.18 250);
	--chart-3: oklch(0.6 0.2 300);
	--chart-4: oklch(0.55 0.22 320);
	--chart-5: oklch(0.5 0.24 340);

	--sidebar: oklch(0.15 0.02 280);
	--sidebar-foreground: oklch(0.98 0.01 280);
	--sidebar-primary: oklch(0.7 0.15 280);
	--sidebar-primary-foreground: oklch(0.12 0.02 280);
	--sidebar-accent: oklch(0.2 0.03 280);
	--sidebar-accent-foreground: oklch(0.98 0.01 280);
	--sidebar-border: oklch(0.25 0.03 280);
	--sidebar-ring: oklch(0.7 0.15 280 / 0.5);
}

@theme inline {
	--font-sans: "Inter Variable", sans-serif;
	--color-sidebar-ring: var(--sidebar-ring);
	--color-sidebar-border: var(--sidebar-border);
	--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
	--color-sidebar-accent: var(--sidebar-accent);
	--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
	--color-sidebar-primary: var(--sidebar-primary);
	--color-sidebar-foreground: var(--sidebar-foreground);
	--color-sidebar: var(--sidebar);
	--color-chart-5: var(--chart-5);
	--color-chart-4: var(--chart-4);
	--color-chart-3: var(--chart-3);
	--color-chart-2: var(--chart-2);
	--color-chart-1: var(--chart-1);
	--color-ring: var(--ring);
	--color-input: var(--input);
	--color-border: var(--border);
	--color-destructive: var(--destructive);
	--color-accent-foreground: var(--accent-foreground);
	--color-accent: var(--accent);
	--color-muted-foreground: var(--muted-foreground);
	--color-muted: var(--muted);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-secondary: var(--secondary);
	--color-primary-foreground: var(--primary-foreground);
	--color-primary: var(--primary);
	--color-popover-foreground: var(--popover-foreground);
	--color-popover: var(--popover);
	--color-card-foreground: var(--card-foreground);
	--color-card: var(--card);
	--color-foreground: var(--foreground);
	--color-background: var(--background);
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);
	--radius-2xl: calc(var(--radius) + 8px);
	--radius-3xl: calc(var(--radius) + 12px);
	--radius-4xl: calc(var(--radius) + 16px);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
	body {
		@apply bg-background text-foreground;
	}
	html {
		@apply font-sans;
	}

	/* Range input (slider) track & thumb styling */
	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
	}

	input[type="range"]::-webkit-slider-runnable-track {
		height: 6px;
		background: var(--border);
		border-radius: 9999px;
	}

	input[type="range"]::-moz-range-track {
		height: 6px;
		background: var(--border);
		border-radius: 9999px;
	}

	input[type="range"]::-webkit-slider-thumb {
		width: 16px;
		height: 16px;
		margin-top: -5px;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		background: var(--foreground);
		border: 2px solid var(--background);
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	input[type="range"]::-moz-range-thumb {
		width: 16px;
		height: 16px;
		cursor: pointer;
		background: var(--foreground);
		border: 2px solid var(--background);
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
}
```
</details>

---

### Step 1.2: Add Badge Component

**Command**:
```bash
bunx shadcn@latest add badge -c packages/ui
```

**Expected Output**: Creates `packages/ui/src/components/badge.tsx`

---

### Step 1.3: Add Separator Component

**Command**:
```bash
bunx shadcn@latest add separator -c packages/ui
```

**Expected Output**: Creates `packages/ui/src/components/separator.tsx`

---

### Step 1.4: Verify UI Package Exports

**File**: `packages/ui/src/components/index.ts` (create if doesn't exist)

Ensure all components are exported:

```typescript
export { Button } from "./button";
export { Card, CardContent, CardHeader, CardTitle } from "./card";
export { Checkbox } from "./checkbox";
export { DropdownMenu } from "./dropdown-menu";
export { Input } from "./input";
export { Label } from "./label";
export { Separator } from "./separator";
export { Skeleton } from "./skeleton";
export { Badge } from "./badge";
export { Toaster } from "./sonner";
```

---

### Step 1.5: Create Type Definitions

**File**: `apps/web/src/types/paper.ts` (create new)

```typescript
export interface Paper {
	id: string;
	title: string;
	authors: string[];
	abstract?: string;
	journal: string;
	publishedAt: string;
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

---

### Step 1.6: Create Directory Structure

**Commands**:
```bash
mkdir -p apps/web/src/components/layout
mkdir -p apps/web/src/components/search/facets
mkdir -p apps/web/src/components/search/filters
mkdir -p apps/web/src/components/paper
mkdir -p apps/web/src/lib/hooks
mkdir -p apps/web/src/routes/search
mkdir -p apps/web/src/routes/paper
```

---

### Step 1.7: Run Type Check

**Command**:
```bash
bun run check-types
```

**Expected**: No type errors (yet - components will be missing)

---

## Verification Checklist

- [ ] `packages/ui/src/styles/globals.css` updated with violet theme
- [ ] `packages/ui/src/components/badge.tsx` exists
- [ ] `packages/ui/src/components/separator.tsx` exists
- [ ] `apps/web/src/types/paper.ts` created with all types
- [ ] Directory structure created under `apps/web/src/`

## Next Phase
Proceed to [Phase 2: Mock Data & Hooks](./02-mock-data-hooks.md)