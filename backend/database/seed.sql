-- ==========================================================
-- HoopManager - Datos Iniciales de Demostración (Seed Data)
-- ==========================================================

-- Insertar Torneo Inicial
INSERT INTO tournaments (id, name, category, season, tie_breaker_type, win_points, loss_points)
VALUES (1, 'Liga de Baloncesto Apertura 2026', 'Masculino Mayor', '2026', 'diff', 2, 1);

-- Insertar 6 Equipos
INSERT INTO teams (id, tournament_id, name, short_name, color, logo) VALUES
(1, 1, 'Halcones del Norte', 'HAL', '#f97316', '🦅'),
(2, 1, 'Relámpagos Capital', 'REL', '#06b6d4', '⚡'),
(3, 1, 'Gigantes del Este', 'GIG', '#8b5cf6', '🏀'),
(4, 1, 'Panteras Central', 'PAN', '#f59e0b', '🐆'),
(5, 1, 'Titanes del Sur', 'TIT', '#ef4444', '🛡️'),
(6, 1, 'Vikingos Costa', 'VIK', '#3b82f6', '⚓');

-- Insertar Jugadores de Halcones del Norte
INSERT INTO players (team_id, name, number, position, height) VALUES
(1, 'Carlos Mendoza', '7', 'PG', '1.85m'),
(1, 'Mateo Fernández', '11', 'SG', '1.92m'),
(1, 'Santiago Gómez', '23', 'SF', '1.98m'),
(1, 'Diego Ramírez', '34', 'PF', '2.03m'),
(1, 'Lucas Benítez', '15', 'C', '2.08m');

-- Insertar Jugadores de Relámpagos Capital
INSERT INTO players (team_id, name, number, position, height) VALUES
(2, 'Alejandro Silva', '4', 'PG', '1.82m'),
(2, 'Javier Morales', '9', 'SG', '1.90m'),
(2, 'Gabriel Torres', '12', 'SF', '1.96m'),
(2, 'Andrés Navarro', '21', 'PF', '2.01m'),
(2, 'Tomás Rivas', '33', 'C', '2.06m');

-- Insertar Jugadores de Gigantes del Este
INSERT INTO players (team_id, name, number, position, height) VALUES
(3, 'Nicolás Ibáñez', '1', 'PG', '1.86m'),
(3, 'Daniel Vega', '8', 'SG', '1.93m'),
(3, 'Emilio Castillo', '10', 'SF', '2.00m'),
(3, 'Sebastián Paredes', '14', 'PF', '2.05m'),
(3, 'Rodrigo Fuentes', '55', 'C', '2.11m');

-- Insertar Jugadores de Panteras Central
INSERT INTO players (team_id, name, number, position, height) VALUES
(4, 'Felipe Herrera', '3', 'PG', '1.84m'),
(4, 'Joaquín Suárez', '6', 'SG', '1.91m'),
(4, 'Esteban Delgado', '22', 'SF', '1.97m');

-- Insertar Jugadores de Titanes del Sur
INSERT INTO players (team_id, name, number, position, height) VALUES
(5, 'Hugo Aguirre', '2', 'PG', '1.83m'),
(5, 'Renato Ortega', '13', 'SG', '1.89m');

-- Insertar Jugadores de Vikingos Costa
INSERT INTO players (team_id, name, number, position, height) VALUES
(6, 'Adrián Bravo', '5', 'PG', '1.87m'),
(6, 'Bruno Villalobos', '30', 'C', '2.10m');

-- Insertar Partidos
INSERT INTO matches (tournament_id, round, home_team_id, away_team_id, home_score, away_score, quarters, status, match_date, match_time, venue) VALUES
(1, 1, 1, 2, 88, 82, '{"q1":{"home":22,"away":18},"q2":{"home":24,"away":20},"q3":{"home":20,"away":22},"q4":{"home":22,"away":22},"ot":{"home":0,"away":0}}'::jsonb, 'FINISHED', '2026-09-20', '18:00', 'Gimnasio Central'),
(1, 1, 3, 4, 94, 78, '{"q1":{"home":26,"away":16},"q2":{"home":22,"away":20},"q3":{"home":24,"away":22},"q4":{"home":22,"away":20},"ot":{"home":0,"away":0}}'::jsonb, 'FINISHED', '2026-09-21', '20:00', 'Arena Municipal'),
(1, 1, 5, 6, 76, 81, '{"q1":{"home":18,"away":20},"q2":{"home":20,"away":19},"q3":{"home":16,"away":22},"q4":{"home":22,"away":20},"ot":{"home":0,"away":0}}'::jsonb, 'FINISHED', '2026-09-22', '19:30', 'Polideportivo Sur'),
(1, 2, 1, 3, 0, 0, '{"q1":{"home":0,"away":0},"q2":{"home":0,"away":0},"q3":{"home":0,"away":0},"q4":{"home":0,"away":0},"ot":{"home":0,"away":0}}'::jsonb, 'SCHEDULED', '2026-10-02', '19:00', 'Gimnasio Central');

-- Insertar Estadísticas de Jugadores de los Partidos Finalizados
INSERT INTO match_player_stats (match_id, player_id, points, rebounds, assists, fouls) VALUES
(1, 1, 32, 9, 11, 2),
(1, 2, 26, 4, 6, 1),
(1, 3, 14, 3, 2, 3),
(1, 4, 8, 11, 1, 4),
(1, 5, 8, 8, 2, 2),
(1, 6, 24, 5, 8, 2),
(1, 7, 20, 3, 4, 1),
(1, 8, 16, 7, 3, 3),
(1, 9, 12, 10, 1, 4),
(1, 10, 10, 9, 0, 2),
(2, 11, 28, 4, 10, 1),
(2, 12, 24, 5, 4, 2),
(2, 13, 18, 6, 3, 2),
(2, 14, 14, 11, 1, 3),
(2, 15, 10, 13, 1, 2),
(2, 16, 30, 4, 7, 2),
(2, 17, 26, 6, 2, 3),
(2, 18, 22, 12, 1, 4),
(3, 19, 42, 6, 8, 2),
(3, 20, 34, 10, 4, 3),
(3, 21, 46, 5, 9, 1),
(3, 22, 35, 15, 2, 4)
ON CONFLICT (match_id, player_id) DO NOTHING;

-- Ajustar secuencias de ID
SELECT setval('tournaments_id_seq', (SELECT MAX(id) FROM tournaments));
SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));
SELECT setval('players_id_seq', (SELECT MAX(id) FROM players));
SELECT setval('matches_id_seq', (SELECT MAX(id) FROM matches));
SELECT setval('match_player_stats_id_seq', (SELECT COALESCE(MAX(id), 1) FROM match_player_stats));
