import { Elysia, status, t } from "elysia";
import {
	CrawlHistoryQuery,
	CrawlJobParams,
	CrawlOptionsBody,
	CrawlStatusResponse,
	StartCrawlResponse,
} from "./model";
import { getCrawlHistory, getCrawlStatus, startCrawl } from "./service";

export const crawlerModule = new Elysia({
	name: "module.crawler",
	prefix: "/api",
})
	.model({
		crawlOptionsBody: CrawlOptionsBody,
		startCrawlResponse: StartCrawlResponse,
		crawlStatusResponse: CrawlStatusResponse,
		crawlJobParams: CrawlJobParams,
		crawlHistoryQuery: CrawlHistoryQuery,
	})
	.post(
		"/crawl/start",
		async ({ body }) => {
			const result = await startCrawl(body);
			return { ...result, message: "Crawl queued successfully" };
		},
		{
			body: "crawlOptionsBody",
			response: {
				200: "startCrawlResponse",
			},
			detail: {
				summary: "Start a crawl job",
				description:
					"Enqueue a crawl job for the given source. Returns a jobId for polling status.",
				tags: ["crawler"],
			},
		}
	)
	.get(
		"/crawl/status/:jobId",
		async ({ params }) => {
			const result = await getCrawlStatus(params.jobId);
			if (!result) {
				return status(404, { error: "Job not found" });
			}
			return result;
		},
		{
			params: "crawlJobParams",
			response: {
				200: "crawlStatusResponse",
				404: t.Object({ error: t.String() }),
			},
			detail: {
				summary: "Get crawl job status",
				description: "Poll the status of a crawl job by its jobId.",
				tags: ["crawler"],
			},
		}
	)
	.get(
		"/crawl/history",
		({ query }) => {
			const limit = query.limit ? Number(query.limit) : 20;
			return getCrawlHistory(limit);
		},
		{
			query: "crawlHistoryQuery",
			response: {
				200: t.Array(CrawlStatusResponse),
			},
			detail: {
				summary: "List crawl history",
				description: "Return recent crawl job history, newest first.",
				tags: ["crawler"],
			},
		}
	);
