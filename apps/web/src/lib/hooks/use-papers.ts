import { useQuery } from "@tanstack/react-query";
import type { SearchParams } from "../../types/paper";
import {
	getAvailableJournals,
	getPaper,
	getRelatedPapers,
	searchPapers,
} from "../mock-data";

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
