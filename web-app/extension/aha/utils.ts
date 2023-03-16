import { memoize } from "lodash-es";
import { ahaExtension } from "./AhaExtension";

// Aha does only return the existing score facts for an idea if they were saved before.
// In order to also support other ideas, we manually have to check which score fact names exist.
// If https://big.ideas.aha.io/ideas/A-I-14234 gets implemented, this should be replaced
export const loadScoreFactNames = memoize(async (productId: string): Promise<ReadonlyArray<string>> => {
	const ideasForProduct = await ahaExtension.getClient().then(c => c.getIdeasForProduct(productId, 1, 200, ["score_facts"]));
	const accumulatedScoreFactNames = ideasForProduct.ideas.flatMap(idea => idea.score_facts.map(scoreFact => scoreFact.name));
	return Array.from(new Set(accumulatedScoreFactNames)); // only return unique.
});