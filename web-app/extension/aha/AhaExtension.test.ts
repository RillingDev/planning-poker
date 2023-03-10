import { AhaExtension } from "./AhaExtension";

describe("AhaExtension", () => {
	it("extractIdeaId", () => {
		expect(AhaExtension.extractIdeaId("foo")).toBeNull();
		expect(AhaExtension.extractIdeaId("ABC-I-6790")).toBe("ABC-I-6790");
		expect(AhaExtension.extractIdeaId("A1-I-108")).toBe("A1-I-108");
		expect(AhaExtension.extractIdeaId("https://example.aha.io/ideas/ideas/ABC-I-645")).toBe("ABC-I-645");
		expect(AhaExtension.extractIdeaId("https://example.aha.io/reports/saved/all")).toBeNull();
	});
});
