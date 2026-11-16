-- ==========================================================
-- HoopManager - Esquema de Base de Datos PostgreSQL
-- ==========================================================

-- Eliminar tablas si existen en orden inverso
DROP TABLE IF EXISTS match_player_stats CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- 1. Tabla de Torneos
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'Masculino Mayor',
    season VARCHAR(50) DEFAULT '2026',
    tie_breaker_type VARCHAR(20) DEFAULT 'diff', -- 'diff' (PF - PC) o 'ratio' (PF / PC)
    win_points INT DEFAULT 2,
    loss_points INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Equipos
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    tournament_id INT REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    color VARCHAR(20) DEFAULT '#f97316',
    logo VARCHAR(20) DEFAULT '🏀',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Jugadores
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    number VARCHAR(10) NOT NULL,
    position VARCHAR(10) DEFAULT 'PG', -- PG, SG, SF, PF, C
    height VARCHAR(20) DEFAULT '1.90m',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Partidos
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    tournament_id INT REFERENCES tournaments(id) ON DELETE CASCADE,
    round INT NOT NULL,
    home_team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    quarters JSONB DEFAULT '{"q1":{"home":0,"away":0},"q2":{"home":0,"away":0},"q3":{"home":0,"away":0},"q4":{"home":0,"away":0},"ot":{"home":0,"away":0}}'::jsonb,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'FINISHED'
    match_date DATE,
    match_time TIME,
    venue VARCHAR(120) DEFAULT 'Cancha Principal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Planilla de Estadísticas por Jugador (Box Score)
CREATE TABLE match_player_stats (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    player_id INT REFERENCES players(id) ON DELETE CASCADE,
    played BOOLEAN DEFAULT TRUE,
    points INT DEFAULT 0,
    three_pointers INT DEFAULT 0,
    two_pointers INT DEFAULT 0,
    free_throws INT DEFAULT 0,
    fouls INT DEFAULT 0,
    UNIQUE(match_id, player_id)
);

-- Índices para optimización de consultas
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_stats_match ON match_player_stats(match_id);
CREATE INDEX idx_stats_player ON match_player_stats(player_id);
