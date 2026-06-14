export type Team = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type VotingCode = {
  code: string;
  is_used: boolean;
  used_at: string | null;
  used_for: string | null;
  created_at: string;
};

export type ResultRow = {
  team_id: string;
  team_name: string;
  team_description: string;
  vote_count: number;
};

export type CastVoteError =
  | "INVALID_CODE"
  | "CODE_NOT_FOUND"
  | "CODE_ALREADY_USED"
  | "TEAM_NOT_FOUND"
  | "UNKNOWN_ERROR";

export const CAST_VOTE_ERROR_MESSAGES: Record<CastVoteError, string> = {
  INVALID_CODE: "Please enter a voting code.",
  CODE_NOT_FOUND:
    "That code doesn't look right. Double-check the code on your wristband or check-in slip.",
  CODE_ALREADY_USED:
    "This code has already been used. Each attendee can only vote once.",
  TEAM_NOT_FOUND: "The selected team is no longer available. Please refresh and try again.",
  UNKNOWN_ERROR: "Something went wrong while submitting your vote. Please try again.",
};
