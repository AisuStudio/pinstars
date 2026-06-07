# Pinstars

Geocaching-PWA für Kindergeburtstage. 1–2 Teams suchen nacheinander Pins auf einer
Karte; pro gefundenem Pin löst die nächste Person eine Multiple-Choice-Aufgabe, die den
nächsten Pin freischaltet. Genau 1 Pin pro mitspielender Person.

## Stack (geplant)
- Next.js (PWA) auf Vercel
- Supabase (ohne Login, Zugriff pro Spiel scoped)
- Leaflet + OpenTopoMap (Karte, eigene Position via Browser-Geolocation)

Spielkonzept: siehe `Pinstars Geburtstags Game.txt`.

## Datenbank-Migrationen

SQL in `db/migrations/` liegt bereit und muss **vor dem Deploy** einmal im
Supabase SQL-Editor ausgeführt werden (in Reihenfolge der Nummerierung). Die
Migrationen sind idempotent (`if not exists`), also gefahrlos mehrfach
ausführbar.

- `001_mission_and_shared_goal.sql` — Team-Mission + gemeinsames Ziel.
