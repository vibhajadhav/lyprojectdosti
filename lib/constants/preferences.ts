/**
 * Shared constants for user preferences
 * Used across onboarding and profile editing screens
 */

export const GENDERS = [
  { value: "woman", label: "Woman", icon: "♀" },
  { value: "man", label: "Man", icon: "♂" },
] as const;

export const LOOKING_FOR_OPTIONS = [
  { value: "woman", label: "Women", icon: "♀" },
  { value: "man", label: "Men", icon: "♂" },
  { value: "everyone", label: "Everyone", icon: "💫" },
] as const;

export type Gender = (typeof GENDERS)[number]["value"];
export type LookingForOption = (typeof LOOKING_FOR_OPTIONS)[number]["value"];

/**
 * Convert lookingFor selection to array format for storage
 * "everyone" becomes ["woman", "man"]
 */
export function lookingForToArray(value: LookingForOption): string[] {
  if (value === "everyone") {
    return ["woman", "man"];
  }
  return [value];
}

/**
 * Convert stored lookingFor array to selection value
 * ["woman", "man"] becomes "everyone"
 */
export function arrayToLookingFor(arr: string[]): LookingForOption {
  if (arr.length === 2 && arr.includes("woman") && arr.includes("man")) {
    return "everyone";
  }
  if (arr.includes("woman")) return "woman";
  if (arr.includes("man")) return "man";
  return "everyone"; // fallback
}
