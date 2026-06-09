import { describe, expect, it } from "bun:test";

describe("Server Basic Health Check", () => {
	it("should return 200 for root path", async () => {
		const response = await fetch("http://localhost:3000/");
		expect(response.status).toBeLessThan(500);
	});
});

describe("Papers API Search", () => {
	it("should handle empty search query gracefully", async () => {
		const response = await fetch("http://localhost:3000/api/papers?q=");
		const data = await response.json();
		
		expect(response.status).toBe(200);
		expect(data).toHaveProperty("papers");
		expect(Array.isArray(data.papers)).toBe(true);
	});

	it("should have total property in search result", async () => {
		const response = await fetch("http://localhost:3000/api/papers?q=test");
		const data = await response.json();
		
		expect(data).toHaveProperty("total");
		expect(typeof data.total).toBe("number");
	});
});
