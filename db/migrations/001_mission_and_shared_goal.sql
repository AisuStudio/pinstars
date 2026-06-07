-- Pinstars — Migration 001: Team-Mission + gemeinsames Ziel
--
-- WICHTIG: Dieses SQL einmalig im Supabase SQL-Editor ausführen,
-- BEVOR die neue App-Version deployed wird (sonst schlägt das Laden
-- eines Spiels fehl, weil die neuen Spalten fehlen).
--
-- Alles ist additiv und idempotent (IF NOT EXISTS) — gefahrlos mehrfach
-- ausführbar.

-- 1) Mission pro Team -------------------------------------------------------
alter table team
  add column if not exists mission text;

-- 2) Gemeinsames Ziel (ein Pin für ALLE Teams am Ende) ----------------------
--    Der finale Pin wird direkt am Spiel gespeichert (ein Ziel pro Spiel),
--    inklusive optionaler Aufgabe (Frage + 3 Antworten + richtige Antwort).
alter table game
  add column if not exists goal_lat         double precision,
  add column if not exists goal_lng         double precision,
  add column if not exists goal_radius_m    integer default 18,
  add column if not exists goal_hint        text,
  add column if not exists goal_question    text,
  add column if not exists goal_answers     jsonb,
  add column if not exists goal_correct_idx integer;
