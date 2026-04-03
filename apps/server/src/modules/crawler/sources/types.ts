import type { NewPaper } from "@scholar-seek/db/schema/papers";

export type { NewPaper } from "@scholar-seek/db/schema/papers";

export interface CrawlOptions {
	categories?: string[]; // e.g. ["cs", "cs.AI"]
	maxRecords?: number; // safety cap
	since?: string; // ISO date YYYY-MM-DD
	until?: string; // ISO date YYYY-MM-DD
}

export interface SourceAdapter {
	crawl(options: CrawlOptions): AsyncGenerator<NewPaper[]>;
	readonly name: string;
}
