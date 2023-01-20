const IDEA_PATTERN = /(\w+-(?:I-)?\d+)/;

export function extractIdeaId(val: string): string | null {
	const matchArray = val.match(IDEA_PATTERN);
	return matchArray?.[1] ?? null;
}