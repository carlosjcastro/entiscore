const ADJECTIVES = [
  "blue", "calm", "fast", "bold", "cool", "deep", "fair", "gold",
  "keen", "lite", "neat", "pure", "safe", "soft", "warm", "wise",
  "dark", "free", "good", "high", "kind", "nice", "open", "rich",
  "true", "vast", "wild", "zero", "grey", "mint", "ruby", "jade",
];

const NOUNS = [
  "arc", "bay", "cap", "dew", "elm", "fox", "gem", "hub",
  "ivy", "jet", "key", "log", "map", "net", "oak", "pin",
  "ray", "sky", "sun", "top", "vue", "web", "zen", "bit",
  "dot", "fig", "ink", "lab", "nod", "orb", "rip", "tag",
];

function pickRandom<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
}

function generateRandomSuffix(): string {
  return Math.floor(Math.random() * 900 + 100).toString();
}

export function generateUniqueCode(): string {
  const adjective = pickRandom(ADJECTIVES);
  const noun = pickRandom(NOUNS);
  const suffix = generateRandomSuffix();
  return `${adjective}-${noun}-${suffix}`;
}
