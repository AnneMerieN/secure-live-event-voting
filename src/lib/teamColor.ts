// Stable mapping from team id → distinct palette color for the /results bars.
// Using a hash (not list index) means a given team always renders the same
// color, even as the leaderboard reorders by vote count.

const TEAM_BAR_PALETTE = [
  "#15AD70", // green
  "#73BDE7", // light blue
  "#BF9FF1", // purple
  "#F78D2C", // orange
  "#FFC700", // yellow
  "#68D0CA", // turquoise
  "#EB546F", // wine red
  "#82D25D", // light green
  "#7193ED", // blue
  "#F9C3D6", // pink
];

export function colorForTeam(teamId: string): string {
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = (hash * 31 + teamId.charCodeAt(i)) >>> 0;
  }
  return TEAM_BAR_PALETTE[hash % TEAM_BAR_PALETTE.length];
}
