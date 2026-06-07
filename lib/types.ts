// Shared data types — mirror the Supabase schema.

export type Game = {
  id: string;
  name: string;
  code: string;
  status: "setup" | "ready" | "playing" | "done";
  created_at: string;
  // Gemeinsames Ziel (finaler Pin für alle Teams) — optional.
  goal_lat: number | null;
  goal_lng: number | null;
  goal_radius_m: number | null;
  goal_hint: string | null;
  goal_question: string | null;
  goal_answers: string[] | null;
  goal_correct_idx: number | null;
};

export type Team = {
  id: string;
  game_id: string;
  name: string | null;
  member_count: number | null;
  current_index: number;
  current_player_idx: number;
  mission: string | null;
};

export type Player = {
  id: string;
  team_id: string;
  name: string | null;
  order_idx: number;
};

export type Station = {
  id: string;
  team_id: string;
  idx: number;
  lat: number | null;
  lng: number | null;
  radius_m: number;
  hint: string | null;
};

export type Task = {
  id: string;
  station_id: string;
  question: string | null;
  answers: string[] | null;
  correct_idx: number | null;
};

// ---- API payloads ----

export type CreateGamePayload = {
  name: string;
  code: string;
  teams: { name: string; players: string[] }[];
};
