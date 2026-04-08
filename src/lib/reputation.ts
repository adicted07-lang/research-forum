export const LEVELS = [
  { level: 1, name: "Associate", minPoints: 0, color: "gray" },
  { level: 2, name: "Analyst", minPoints: 50, color: "blue" },
  { level: 3, name: "Strategist", minPoints: 200, color: "green" },
  { level: 4, name: "Director", minPoints: 500, color: "purple" },
  { level: 5, name: "Partner", minPoints: 1000, color: "orange" },
  { level: 6, name: "Fellow", minPoints: 2500, color: "red" },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export function getLevel(points: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(points: number): LevelInfo | null {
  const current = getLevel(points);
  const nextIdx = LEVELS.findIndex((l) => l.level === current.level) + 1;
  return nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;
}

export function getLevelProgress(points: number): number {
  const current = getLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.round((progress / range) * 100);
}

export type Privilege = "downvote" | "edit_suggest" | "set_bounty" | "close_vote" | "edit_direct" | "moderate";

const PRIVILEGE_LEVELS: Record<Privilege, number> = {
  downvote: 2,
  edit_suggest: 3,
  set_bounty: 3,
  close_vote: 4,
  edit_direct: 5,
  moderate: 6,
};

export function hasPrivilege(points: number, privilege: Privilege): boolean {
  const userLevel = getLevel(points);
  return userLevel.level >= PRIVILEGE_LEVELS[privilege];
}
