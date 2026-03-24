# Phase 2: Mock Data & Hooks

## Objective
Create mock paper data and React Query hooks for data fetching without a backend.

## Prerequisites
- Phase 1 completed (types exist)
- Directory structure created

---

## Steps

### Step 2.1: Create Mock Data File

**File**: `apps/web/src/lib/mock-data.ts` (create new)

This file contains:
- Mock paper dataset (~25 papers)
- Search function with filtering, sorting, pagination
- Facet generation from results
- Related papers function

<details>
<summary>Full mock-data.ts Content</summary>

```typescript
import type { Facets, Paper, SearchResult } from "../types/paper";

const MOCK_PAPERS: Paper[] = [
	{
		id: "paper-1",
		title: "Deep Learning for Natural Language Processing: A Comprehensive Survey",
		authors: ["Sarah Chen", "Michael Wang", "Emily Johnson"],
		abstract: "This paper presents a comprehensive survey of deep learning techniques applied to natural language processing tasks. We review transformer architectures, attention mechanisms, and their applications in machine translation, sentiment analysis, and named entity recognition. Our analysis covers both theoretical foundations and practical implementations.",
		journal: "Nature Machine Intelligence",
		publishedAt: "2024-01-15",
		sourceUrl: "https://example.com/paper1",
		doi: "10.1234/nmi.2024.001",
		keywords: ["deep learning", "NLP", "transformers", "attention"],
	},
	{
		id: "paper-2",
		title: "Climate Change Impact on Global Agricultural Productivity",
		authors: ["David Martinez", "Anna Kowalski", "James Wilson"],
		abstract: "We analyze the effects of climate change on agricultural productivity across different geographic regions, focusing on temperature anomalies and precipitation patterns between1990-2023.",
		journal: "Science Advances",
		publishedAt: "2024-02-20",
		sourceUrl: "https://example.com/paper2",
		doi: "10.5678/sciadv.2024.002",
		keywords: ["climate change", "agriculture", "productivity", "sustainability"],
	},
	{
		id: "paper-3",
		title: "Quantum Computing Algorithms for Optimization Problems",
		authors: ["Robert Zhang", "Lisa Thompson"],
		abstract: "An exploration of quantum computing approaches to solving NP-hard optimization problems, including traveling salesman and graph coloring. We present novel quantum annealing strategies that show promising results on small-scale instances.",
		journal: "Physical Review Letters",
		publishedAt: "2023-12-01",
		sourceUrl: "https://example.com/paper3",
		doi: "10.9012/prl.2023.003",
		keywords: ["quantum computing", "optimization", "algorithms"],
	},
	{
		id: "paper-4",
		title: "Machine Learning in Medical Imaging: From Diagnosis to Treatment Planning",
		authors: ["Jennifer Lee", "Ahmed Hassan", "Maria Garcia", "Thomas Brown"],
		abstract: "This review examines the state-of-the-art in machine learning applications for medical imaging, covering radiology, pathology, and dermatology. We discuss convolutional neural networks, vision transformers, and their clinical implementations.",
		journal: "Nature Medicine",
		publishedAt: "2024-03-10",
		sourceUrl: "https://example.com/paper4",
		keywords: ["machine learning", "medical imaging", "AI", "healthcare"],
	},
	{
		id: "paper-5",
		title: "Sustainable Energy Storage: Advances in Battery Technology",
		authors: ["Kevin O'Brien", "Yuki Tanaka"],
		abstract: "Recent advances in lithium-ion and solid-state battery technologies for renewable energy storage. We examine improvements in energy density, charging speed, and cycle life.",
		journal: "Energy & Environmental Science",
		publishedAt: "2024-01-28",
		sourceUrl: "https://example.com/paper5",
		keywords: ["energy storage", "batteries", "sustainability", "renewable energy"],
	},
	{
		id: "paper-6",
		title: "Social Media and Democratic Discourse: A Longitudinal Study",
		authors: ["Alexandra Petrov", "John Smith", "Emma Davis"],
		abstract: "We investigate the relationship between social media usage patterns and democratic engagement across 15 countries over a10-year period, revealing complex patterns of polarization and information diffusion.",
		journal: "Political Science Quarterly",
		publishedAt: "2023-11-15",
		sourceUrl: "https://example.com/paper6",
		keywords: ["social media", "democracy", "political science"],
	},
	{
		id: "paper-7",
		title: "Neural Architecture Search: Automating Deep Learning Model Design",
		authors: ["Wei Huang", "Priya Sharma"],
		abstract: "A comprehensive overview of neural architecture search (NAS) methods, including reinforcement learning-based approaches, evolutionary algorithms, and differentiable architecture search.",
		journal: "Journal of Machine Learning Research",
		publishedAt: "2024-02-05",
		sourceUrl: "https://example.com/paper7",
		keywords: ["neural architecture search", "AutoML", "deep learning"],
	},
	{
		id: "paper-8",
		title: "Biodiversity Loss in Tropical Rainforests: Causes and Conservation Strategies",
		authors: ["Carlos Mendez", "Isabelle Dubois", "Ravi Patel"],
		abstract: "This meta-analysis synthesizes findings from 50 years of tropical rainforest research, identifying key drivers of biodiversity loss and evaluating conservation interventions.",
		journal: "Conservation Biology",
		publishedAt: "2023-09-22",
		sourceUrl: "https://example.com/paper8",
		keywords: ["biodiversity", "rainforests", "conservation", "ecology"],
	},
	{
		id: "paper-9",
		title: "Blockchain Applications in Healthcare Data Management",
		authors: ["Nina Volkov", "Samuel Kim"],
		abstract: "We propose a novel blockchain-based framework for secure healthcare data management, addressing interoperability, privacy, and regulatory compliance challenges.",
		journal: "Journal of Medical Systems",
		publishedAt: "2024-01-08",
		sourceUrl: "https://example.com/paper9",
		keywords: ["blockchain", "healthcare", "data management", "security"],
	},
	{
		id: "paper-10",
		title: "Autonomous Vehicle Navigation in Urban Environments",
		authors: ["Mark Johnson", "Alice Wang", "Peter Mueller", "Sophie Laurent"],
		abstract: "This paper presents a multi-sensor fusion approach for autonomous vehicle navigation in complex urban environments, combining LiDAR, camera, and radar data with deep learning-based perception.",
		journal: "IEEE Transactions on Robotics",
		publishedAt: "2023-12-18",
		sourceUrl: "https://example.com/paper10",
		keywords: ["autonomous vehicles", "navigation", "sensor fusion", "robotics"],
	},
	{
		id: "paper-11",
		title: "CRISPR Technology: Ethical Implications and Regulatory Frameworks",
		authors: ["Rachel Green", "Daniel Park"],
		abstract: "An interdisciplinary analysis of ethical considerations surrounding CRISPR gene editing technology, proposing regulatory frameworks that balance scientific innovation with responsible use.",
		journal: "Bioethics Quarterly",
		publishedAt: "2024-03-01",
		sourceUrl: "https://example.com/paper11",
		keywords: ["CRISPR", "bioethics", "gene editing", "regulation"],
	},
	{
		id: "paper-12",
		title: "Natural Language Understanding for Conversational AI Systems",
		authors: ["Thomas Liu", "Grace Chen", "Benjamin Taylor"],
		abstract: "We present advances in natural language understanding for task-oriented dialogue systems, including intent classification, slot filling, and context modeling techniques.",
		journal: "Computational Linguistics",
		publishedAt: "2024-02-14",
		sourceUrl: "https://example.com/paper12",
		keywords: ["NLP", "conversational AI", "dialogue systems"],
	},
	{
		id: "paper-13",
		title: "Ocean Acidification and Marine Ecosystem Responses",
		authors: ["Marina Costa", "William Harper", "Hiroshi Watanabe"],
		abstract: "A review of ocean acidification impacts on marine ecosystems, from coral reefs to pelagic food webs, with projections under various climate scenarios.",
		journal: "Marine Ecology Progress Series",
		publishedAt: "2023-10-30",
		sourceUrl: "https://example.com/paper13",
		keywords: ["ocean acidification", "marine ecosystems", "climate change"],
	},
	{
		id: "paper-14",
		title: "Federated Learning: Privacy-Preserving Machine Learning",
		authors: ["Olivia Brown", "Marcus Schmidt"],
		abstract: "This survey covers federated learning methodologies, communication efficiency improvements, and privacy preservation techniques for distributed machine learning.",
		journal: "ACM Computing Surveys",
		publishedAt: "2024-01-22",
		sourceUrl: "https://example.com/paper14",
		keywords: ["federated learning", "privacy", "distributed ML"],
	},
	{
		id: "paper-15",
		title: "Urban Heat Island Effects and Mitigation Strategies",
		authors: ["Diana Roberts", "Ahmed Al-Hassan"],
		abstract: "Analysis of urban heat island phenomena in major cities worldwide, with proposed green infrastructure solutions for temperature reduction.",
		journal: "Urban Climate",
		publishedAt: "2023-08-15",
		sourceUrl: "https://example.com/paper15",
		keywords: ["urban heat island", "climate adaptation", "green infrastructure"],
	},
	{
		id: "paper-16",
		title: "Protein Folding Prediction with AlphaFold: Applicationsand Limitations",
		authors: ["Catherine Moore", "Vincent Zhang", "Laura Johnson"],
		abstract: "A critical evaluation of AlphaFold's protein structure prediction capabilities, discussing successes in biology and remaining challenges.",
		journal: "Nature Structural & Molecular Biology",
		publishedAt: "2024-02-28",
		sourceUrl: "https://example.com/paper16",
		keywords: ["protein folding", "AlphaFold", "structural biology"],
	},
	{
		id: "paper-17",
		title: "Cybersecurity Threats in IoT Infrastructure",
		authors: ["Nathan White", "Elena Popova"],
		abstract: "We analyze emerging cybersecurity threats in Internet of Things deployments, proposing defense mechanisms and secure architecture patterns.",
		journal: "IEEE Security & Privacy",
		publishedAt: "2023-11-28",
		sourceUrl: "https://example.com/paper17",
		keywords: ["cybersecurity", "IoT", "security", "threats"],
	},
	{
		id: "paper-18",
		title: "Explainable AI: Making Machine Learning Models Transparent",
		authors: ["Philip Anderson", "Mei Lin"],
		abstract: "Recent developments in explainable artificial intelligence, covering SHAP, LIME, and attention-based interpretability methods for deep learning models.",
		journal: "AI Magazine",
		publishedAt: "2024-03-15",
		sourceUrl: "https://example.com/paper18",
		keywords: ["explainable AI", "interpretability", "machine learning"],
	},
	{
		id: "paper-19",
		title: "Mental Health Interventions via Digital Platforms",
		authors: ["Sophia Turner", "Andrew Lewis", "Michelle Chang"],
		abstract: "Effectiveness evaluation of digital mental health interventions, including smartphone apps and online therapy platforms.",
		journal: "Journal of Medical Internet Research",
		publishedAt: "2024-01-30",
		sourceUrl: "https://example.com/paper19",
		keywords: ["mental health", "digital health", "interventions"],
	},
	{
		id: "paper-20",
		title: "Graph Neural Networks for Social Network Analysis",
		authors: ["Ryan Cooper", "Julia Martinez"],
		abstract: "Application of graph neural networks to social network analysis tasks including community detection, influence maximization, and link prediction.",
		journal: "Social Networks",
		publishedAt: "2023-12-05",
		sourceUrl: "https://example.com/paper20",
		keywords: ["graph neural networks", "social networks", "analysis"],
	},
	{
		id: "paper-21",
		title: "Renewable Energy Integration Challenges in Power Grids",
		authors: ["Gregory Adams", "Fatima Al-Rashid", "Chen Wei"],
		abstract: "Technical and economic challenges of integrating high shares of renewable energy into existing power grid infrastructure.",
		journal: "Applied Energy",
		publishedAt: "2024-02-12",
		sourceUrl: "https://example.com/paper21",
		keywords: ["renewable energy", "power grids", "integration"],
	},
	{
		id: "paper-22",
		title: "Language Model Reasoning: Chain-of-Thought and Beyond",
		authors: ["Michael Brown", "Sarah Johnson", "David Kim"],
		abstract: "Investigation of reasoning capabilities in large language models, examining chain-of-thought prompting and emergent reasoning behaviors.",
		journal: "Transactions on Machine Learning Research",
		publishedAt: "2024-03-08",
		sourceUrl: "https://example.com/paper22",
		keywords: ["language models", "reasoning", "chain-of-thought", "AI"],
	},
	{
		id: "paper-23",
		title: "Microplastics in Marine Environments: Distribution and Impact",
		authors: ["Hannah Scott", "Jean-Pierre Dubois"],
		abstract: "Comprehensive mapping of microplastic distribution in world oceans, analyzing ecological impacts and remediation strategies.",
		journal: "Environmental Science & Technology",
		publishedAt: "2023-09-10",
		sourceUrl: "https://example.com/paper23",
		keywords: ["microplastics", "marine pollution", "environment"],
	},
	{
		id: "paper-24",
		title: "Robotic Process Automation: Industry Adoption and Future Directions",
		authors: ["Andrew Taylor", "Nicole Fernandes"],
		abstract: "Survey of robotic process automation adoption across industries, identifying key success factors and future technological trajectories.",
		journal: "Business Process Management Journal",
		publishedAt: "2023-10-22",
		sourceUrl: "https://example.com/paper24",
		keywords: ["automation", "RPA", "industry", "business"],
	},
	{
		id: "paper-25",
		title: "Antimicrobial Resistance: Global Health Emergency",
		authors: ["Patricia Wright", "Kenji Yamamoto", "Anna Schmidt"],
		abstract: "This review addresses the growing crisis of antimicrobial resistance, examining mechanisms, surveillance systems, and novel therapeutic approaches.",
		journal: "The Lancet Infectious Diseases",
		publishedAt: "2024-01-05",
		sourceUrl: "https://example.com/paper25",
		keywords: ["antimicrobial resistance", "global health", "medicine"],
	},
];

function generateFacets(papers: Paper[]): Facets {
	const journalCounts = new Map<string, number>();
	const keywordCounts = new Map<string, number>();
	const authorCounts = new Map<string, number>();
	const yearCounts = new Map<string, number>();

	for (const paper of papers) {
		journalCounts.set(paper.journal, (journalCounts.get(paper.journal) ?? 0) + 1);

		for (const author of paper.authors) {
			authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
		}

		if (paper.keywords) {
			for (const keyword of paper.keywords) {
				keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
			}
		}

		const year = paper.publishedAt.split("-")[0];
		yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
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

function matchesFilters(paper: Paper, params: {
	authorFilter?: string;
	journalFilter?: string[];
	keywordFilter?: string[];
	yearFrom?: number;
	yearTo?: number;
}): boolean {
	if (params.authorFilter) {
		const authorLower = params.authorFilter.toLowerCase();
		const matches = paper.authors.some((a) =>
			a.toLowerCase().includes(authorLower)
		);
		if (!matches) return false;
	}

	if (params.journalFilter && params.journalFilter.length > 0) {
		if (!params.journalFilter.includes(paper.journal)) return false;
	}

	if (params.keywordFilter && params.keywordFilter.length > 0) {
		if (!paper.keywords) return false;
		const matches = params.keywordFilter.some((k) =>
			paper.keywords?.includes(k)
		);
		if (!matches) return false;
	}

	const paperYear = Number.parseInt(paper.publishedAt.split("-")[0], 10);
	if (params.yearFrom !== undefined && paperYear < params.yearFrom) return false;
	if (params.yearTo !== undefined && paperYear > params.yearTo) return false;

	return true;
}

function sortPapers(papers: Paper[], sortBy: string): Paper[] {
	const sorted = [...papers];

	switch (sortBy) {
		case "date_desc":
			return sorted.sort((a, b) =>
				b.publishedAt.localeCompare(a.publishedAt)
			);
		case "date_asc":
			return sorted.sort((a, b) =>
				a.publishedAt.localeCompare(b.publishedAt)
			);
		case "title_asc":
			return sorted.sort((a, b) => a.title.localeCompare(b.title));
		case "author_asc":
			return sorted.sort((a, b) => a.authors[0]?.localeCompare(b.authors[0] ?? "") ?? 0);
		case "relevance":
		default:
			return sorted;
	}
}

export async function searchPapers(params: {
	q?: string;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	authorFilter?: string;
	journalFilter?: string[];
	keywordFilter?: string[];
	yearFrom?: number;
	yearTo?: number;
}): Promise<SearchResult> {
	await new Promise((resolve) => setTimeout(resolve, 100));

	let results = [...MOCK_PAPERS];

	if (params.q) {
		const queryLower = params.q.toLowerCase();
		results = results.filter((paper) =>
			paper.title.toLowerCase().includes(queryLower) ||
			paper.abstract?.toLowerCase().includes(queryLower) ||
			paper.authors.some((a) => a.toLowerCase().includes(queryLower)) ||
			paper.keywords?.some((k) => k.toLowerCase().includes(queryLower)) ||
			paper.journal.toLowerCase().includes(queryLower)
		);
	}

	results = results.filter((paper) => matchesFilters(paper, params));

	if (params.sortBy) {
		results = sortPapers(results, params.sortBy);
	}

	const total = results.length;
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 10;
	const start = (page - 1) * pageSize;
	const end = start + pageSize;
	const paginatedResults = results.slice(start, end);

	const facets = generateFacets(results);

	return {
		papers: paginatedResults,
		total,
		page,
		pageSize,
		facets,
	};
}

export async function getPaper(id: string): Promise<Paper | null> {
	await new Promise((resolve) => setTimeout(resolve, 50));
	return MOCK_PAPERS.find((p) => p.id === id) ?? null;
}

export async function getRelatedPapers(id: string): Promise<Paper[]> {
	await new Promise((resolve) => setTimeout(resolve, 50));

	const paper = MOCK_PAPERS.find((p) => p.id === id);
	if (!paper) return [];

	const related = MOCK_PAPERS.filter((p) => {
		if (p.id === id) return false;

		if (paper.keywords && p.keywords) {
			const sharedKeywords = paper.keywords.filter((k) => p.keywords?.includes(k));
			if (sharedKeywords.length > 0) return true;
		}

		if (p.journal === paper.journal) return true;

		return false;
	});

	return related.slice(0, 5);
}

export function getAvailableJournals(): string[] {
	const journals = new Set<string>();
	for (const paper of MOCK_PAPERS) {
		journals.add(paper.journal);
	}
	return Array.from(journals).sort();
}
```
</details>

---

### Step 2.2: Create use-papers Hook

**File**: `apps/web/src/lib/hooks/use-papers.ts` (create new)

```typescript
import { useQuery } from "@tanstack/react-query";
import type { SearchParams } from "../../types/paper";
import {
	getPaper,
	getRelatedPapers,
	searchPapers,
} from "../mock-data";
import { getAvailableJournals } from "../mock-data";

export function useSearchPapers(params: SearchParams) {
	return useQuery({
		queryKey: ["papers", "search", params],
		queryFn: () => searchPapers(params),
		enabled: !!params.q,
	});
}

export function usePaper(id: string) {
	return useQuery({
		queryKey: ["paper", id],
		queryFn: () => getPaper(id),
		enabled: !!id,
	});
}

export function useRelatedPapers(id: string) {
	return useQuery({
		queryKey: ["papers", "related", id],
		queryFn: () => getRelatedPapers(id),
		enabled: !!id,
	});
}

export function useAvailableJournals() {
	return useQuery({
		queryKey: ["journals", "available"],
		queryFn: getAvailableJournals,
	});
}
```

---

### Step 2.3: Create use-filters Hook

**File**: `apps/web/src/lib/hooks/use-filters.ts` (create new)

This hook manages filter state using TanStack Router's search params.

```typescript
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import type { SortBy } from "../../types/paper";

export interface FilterState {
	authorFilter: string;
	journalFilter: string[];
	keywordFilter: string[];
	sortBy: SortBy;
	yearFrom: number;
	yearTo: number;
}

const YEAR_MIN = 2000;
const YEAR_MAX = new Date().getFullYear();

export function useFilters<T extends Record<string, unknown>>(search: T) {
	const router = useRouter();

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

	const updateSearch = useCallback(
		(updates: Record<string, string | string[] | undefined>) => {
			const newSearch = { ...search, ...updates, page: 1 };
			router.navigate({ to: window.location.pathname, search: newSearch });
		},
		[router, search]
	);

	const setAuthorFilter = useCallback(
		(value: string) => updateSearch({ author: value ||undefined }),
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
```

---

### Step 2.4: Create Utils File

**File**: `apps/web/src/lib/utils.ts` (create new)

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
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
```

---

## Verification Checklist

- [ ] `apps/web/src/lib/mock-data.ts` created with MOCK_PAPERS array
- [ ] `apps/web/src/lib/hooks/use-papers.ts` created with React Query hooks
- [ ] `apps/web/src/lib/hooks/use-filters.ts` created with filter state management
- [ ] `apps/web/src/lib/utils.ts` created with `cn` and `formatDate` functions
- [ ] Types import correctly from `../../types/paper`

## Next Phase
Proceed to [Phase 3: Layout Components](./03-layout-components.md)