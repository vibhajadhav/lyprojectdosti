/**
 * Plain-English match explanations generated locally — no external LLM call.
 * Mirrors the BERT prototype's explain_match(): highlight real shared
 * interests when they exist, otherwise credit BERT's semantic similarity
 * on bio text directly.
 */

function sharedInterests(interests1: string[], interests2: string[]): string[] {
  const set2 = new Set(interests2.map((i) => i.toLowerCase()));
  return interests1.filter((i) => set2.has(i.toLowerCase()));
}

/**
 * Longer explanation (2-3 sentences) for a confirmed match.
 */
export function explainMatch(
  user1: { name: string; interests: string[] },
  user2: { name: string; interests: string[] },
): string {
  const shared = sharedInterests(user1.interests, user2.interests);

  if (shared.length > 0) {
    const list = shared.slice(0, 4).join(", ");
    return `${user1.name} and ${user2.name} share an interest in ${list}. BERT also found strong overlap in how they each describe themselves, so this looks like a solid match worth exploring.`;
  }

  return `${user1.name} and ${user2.name} don't list the exact same interests, but BERT found their bios describe compatible personalities and similar energy — sometimes that overlap matters more than matching tags.`;
}

/**
 * Short explanation (~20 words) used for daily picks.
 */
export function explainPick(
  user: { name: string; interests: string[] },
  candidate: { name: string; interests: string[] },
): { explanation: string; sharedInterests: string[] } {
  const shared = sharedInterests(user.interests, candidate.interests);

  const explanation =
    shared.length > 0
      ? `You and ${candidate.name} both like ${shared.slice(0, 2).join(" and ")} — BERT rates this a strong match.`
      : `BERT found ${candidate.name}'s bio semantically close to yours, even without identical listed interests.`;

  return { explanation, sharedInterests: shared };
}
