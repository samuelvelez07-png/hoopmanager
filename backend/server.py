#!/usr/bin/env python3
"""
HoopManager - Backend Server & PostgreSQL Integration API
Multi-Tournament, Dynamic Rosters (5-16), Roster Editing & Player Match Stats Support
"""

import http.server
import json
import os
import urllib.parse
import hashlib
import secrets
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

PORT = 8000
_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = _ROOT_DIR if os.path.exists(os.path.join(_ROOT_DIR, "index.html")) else os.path.join(_ROOT_DIR, "frontend")
DB_CONFIG = {
    "dbname": "hoopmanager_db",
    "user": "postgres",
    "password": "smserver_db",
    "host": "127.0.0.1",
    "port": 5432
}

# In-memory session token registry (token -> session dict)
ACTIVE_SESSIONS = {}

def get_db_connection():
    db_url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
    if db_url:
        try:
            if db_url.startswith("postgres://"):
                db_url = "postgresql://" + db_url[len("postgres://"):]
            if "sslmode=" not in db_url and "127.0.0.1" not in db_url and "localhost" not in db_url:
                db_url += ("&" if "?" in db_url else "?") + "sslmode=require"
            return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        except Exception as e:
            print(f"[DB Error] Cloud connection failed: {e}")
            return None
    try:
        return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    except Exception as e:
        print(f"[DB Error] Local connection failed: {e}")
        return None

def migrate_db():
    """Run lightweight migrations to add missing columns and auth tables without dropping data."""
    conn = get_db_connection()
    if not conn:
        print("[Migration] Skipped: no DB connection.")
        return
    try:
        with conn.cursor() as cur:
            # Add rebounds column if missing
            cur.execute("""
                ALTER TABLE match_player_stats
                ADD COLUMN IF NOT EXISTS rebounds INT DEFAULT 0;
            """)
            # Add assists column if missing
            cur.execute("""
                ALTER TABLE match_player_stats
                ADD COLUMN IF NOT EXISTS assists INT DEFAULT 0;
            """)
            # Add played column if missing
            cur.execute("""
                ALTER TABLE match_player_stats
                ADD COLUMN IF NOT EXISTS played BOOLEAN DEFAULT TRUE;
            """)
            # Create app_users table for administrator authentication
            cur.execute("""
                CREATE TABLE IF NOT EXISTS app_users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            # Create app_sessions table for serverless session persistence
            cur.execute("""
                CREATE TABLE IF NOT EXISTS app_sessions (
                    token VARCHAR(128) PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            admin_pwd_hash = hashlib.sha256("admin2026".encode("utf-8")).hexdigest()
            cur.execute("SELECT id FROM app_users WHERE username = 'admin';")
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO app_users (username, password_hash, role) VALUES (%s, %s, %s);",
                    ('admin', admin_pwd_hash, 'admin')
                )
        conn.commit()
        print("[Migration] match_player_stats, app_users & app_sessions verified/updated.")
    except Exception as e:
        print(f"[Migration Error] {e}")
    finally:
        conn.close()

class HoopManagerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def get_auth_token(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:].strip()
        if self.headers.get("X-Auth-Token"):
            return self.headers.get("X-Auth-Token").strip()
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if "token" in params:
            return params["token"][0]
        return None

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Auth-Token")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            self.handle_api_get()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            self.handle_api_post()
        else:
            self.send_error(404, "Not found")

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            self.handle_api_delete()
        else:
            self.send_error(404, "Not found")

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode("utf-8"))

    def handle_api_get(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        if path == "/api/auth/verify":
            token = self.get_auth_token()
            user = ACTIVE_SESSIONS.get(token) if token else None
            if not user and token:
                conn_auth = get_db_connection()
                if conn_auth:
                    try:
                        with conn_auth.cursor() as cur:
                            cur.execute("SELECT username, role FROM app_sessions WHERE token = %s;", (token,))
                            row = cur.fetchone()
                            if row:
                                user = {"username": row["username"], "role": row["role"]}
                                ACTIVE_SESSIONS[token] = user
                    except Exception:
                        pass
                    finally:
                        conn_auth.close()

            if user:
                self.send_json({"authenticated": True, "user": user})
            else:
                self.send_json({"authenticated": False, "error": "Sesión inválida o no iniciada"}, 401)
            return

        conn = get_db_connection()
        if not conn:
            self.send_json({"error": "No database connection"}, 500)
            return

        try:
            with conn.cursor() as cur:
                if path == "/api/status":
                    cur.execute("SELECT version();")
                    ver = cur.fetchone()
                    self.send_json({"status": "ok", "db": "PostgreSQL", "version": ver["version"]})

                elif path == "/api/tournaments":
                    cur.execute("SELECT * FROM tournaments ORDER BY id ASC;")
                    tournaments = cur.fetchall()
                    self.send_json({"tournaments": tournaments})

                elif path == "/api/teams":
                    t_id = params.get("tournament_id", [None])[0]
                    if t_id:
                        cur.execute("SELECT * FROM teams WHERE tournament_id = %s ORDER BY id ASC;", (t_id,))
                    else:
                        cur.execute("SELECT * FROM teams ORDER BY id ASC;")
                    teams = cur.fetchall()

                    team_ids = [t["id"] for t in teams]
                    if team_ids:
                        cur.execute("SELECT * FROM players WHERE team_id = ANY(%s) ORDER BY id ASC;", (team_ids,))
                        players = cur.fetchall()
                    else:
                        players = []

                    self.send_json({"teams": teams, "players": players})

                elif path == "/api/matches":
                    t_id = params.get("tournament_id", [None])[0]
                    if t_id:
                        cur.execute("SELECT * FROM matches WHERE tournament_id = %s ORDER BY round ASC, id ASC;", (t_id,))
                    else:
                        cur.execute("SELECT * FROM matches ORDER BY round ASC, id ASC;")
                    matches = cur.fetchall()
                    self.send_json({"matches": matches})

                elif path == "/api/matches/player-stats":
                    match_id = params.get("match_id", [None])[0]
                    if not match_id:
                        self.send_json({"error": "Falta match_id"}, 400)
                        return
                    cur.execute(
                        """SELECT mps.*, p.name AS player_name, p.number, p.position, p.team_id
                           FROM match_player_stats mps
                           JOIN players p ON p.id = mps.player_id
                           WHERE mps.match_id = %s
                           ORDER BY p.team_id ASC, p.id ASC;""",
                        (match_id,)
                    )
                    stats = cur.fetchall()
                    self.send_json({"stats": stats})

                else:
                    self.send_json({"error": "Endpoint not found"}, 404)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_post(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        payload = json.loads(body) if body else {}

        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        conn = get_db_connection()
        if not conn:
            self.send_json({"error": "No database connection"}, 500)
            return

        try:
            with conn.cursor() as cur:
                # 0. Autenticación (Login / Logout)
                if path == "/api/login":
                    username = str(payload.get("username", "")).strip()
                    password = str(payload.get("password", "")).strip()

                    is_valid = False
                    user_role = "admin"

                    # Validación de credenciales: admin / admin2026
                    if username == "admin" and password == "admin2026":
                        is_valid = True
                    else:
                        # Respaldo contra base de datos PostgreSQL
                        pwd_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
                        cur.execute("SELECT * FROM app_users WHERE username = %s AND password_hash = %s;", (username, pwd_hash))
                        user_row = cur.fetchone()
                        if user_row:
                            is_valid = True
                            user_role = user_row.get("role", "admin")

                    if is_valid:
                        token = secrets.token_hex(24)
                        session_data = {
                            "username": username,
                            "role": user_role,
                            "login_at": datetime.datetime.now().isoformat()
                        }
                        ACTIVE_SESSIONS[token] = session_data
                        cur.execute(
                            "INSERT INTO app_sessions (token, username, role) VALUES (%s, %s, %s) ON CONFLICT (token) DO NOTHING;",
                            (token, username, user_role)
                        )
                        conn.commit()
                        self.send_json({
                            "success": True,
                            "token": token,
                            "username": username,
                            "role": user_role
                        })
                    else:
                        self.send_json({
                            "error": "Usuario o contraseña incorrectos"
                        }, 401)
                    return

                elif path == "/api/logout":
                    token = self.get_auth_token() or payload.get("token")
                    if token:
                        ACTIVE_SESSIONS.pop(token, None)
                        cur.execute("DELETE FROM app_sessions WHERE token = %s;", (token,))
                        conn.commit()
                    self.send_json({"success": True})
                    return

                # 1. Crear nuevo torneo
                elif path == "/api/tournaments":
                    cur.execute(
                        """INSERT INTO tournaments (name, category, season, tie_breaker_type, win_points, loss_points)
                           VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;""",
                        (
                            payload["name"],
                            payload.get("category", "Masculino Mayor"),
                            payload.get("season", "2026"),
                            payload.get("tie_breaker_type", "diff"),
                            payload.get("win_points", 2),
                            payload.get("loss_points", 1)
                        )
                    )
                    new_id = cur.fetchone()["id"]
                    conn.commit()
                    self.send_json({"success": True, "id": new_id})

                # 2. Crear equipo (con validación de 5 a 16 jugadores)
                elif path == "/api/teams":
                    players = payload.get("players", [])
                    if len(players) < 5 or len(players) > 16:
                        self.send_json({
                            "error": f"La nómina debe tener entre 5 y 16 jugadores. Se recibieron {len(players)}."
                        }, 400)
                        return

                    tournament_id = payload.get("tournament_id", 1)
                    cur.execute(
                        """INSERT INTO teams (tournament_id, name, short_name, color, logo)
                           VALUES (%s, %s, %s, %s, %s) RETURNING id;""",
                        (tournament_id, payload["name"], payload["short_name"], payload.get("color", "#f97316"), payload.get("logo", "🏀"))
                    )
                    team_id = cur.fetchone()["id"]

                    inserted_players = []
                    for p in players:
                        cur.execute(
                            """INSERT INTO players (team_id, name, number, position, height)
                               VALUES (%s, %s, %s, %s, %s) RETURNING id;""",
                            (team_id, p["name"], str(p.get("number", "0")), p.get("position", "PG"), p.get("height", "1.90m"))
                        )
                        inserted_players.append(cur.fetchone()["id"])

                    conn.commit()
                    self.send_json({"success": True, "team_id": team_id, "players_count": len(inserted_players)})

                # 3. Modificar y actualizar plantilla completa de un equipo ya creado
                elif path == "/api/teams/update-roster":
                    team_id = payload.get("team_id") or payload.get("id")
                    if not team_id:
                        self.send_json({"error": "Falta team_id"}, 400)
                        return

                    players = payload.get("players", [])
                    if len(players) < 5 or len(players) > 16:
                        self.send_json({
                            "error": f"La nómina debe tener entre 5 y 16 jugadores. Se recibieron {len(players)}."
                        }, 400)
                        return

                    # Actualizar datos del club
                    if "name" in payload and "short_name" in payload:
                        cur.execute(
                            """UPDATE teams 
                               SET name = %s, short_name = %s, color = %s, logo = %s 
                               WHERE id = %s;""",
                            (payload["name"], payload["short_name"], payload.get("color", "#f97316"), payload.get("logo", "🏀"), team_id)
                        )

                    # Sincronizar jugadores de forma transaccional preservando IDs si aplican
                    saved_player_ids = []
                    for p in players:
                        raw_id = p.get("dbId") or p.get("id")
                        p_id = None
                        if isinstance(raw_id, int):
                            p_id = raw_id
                        elif isinstance(raw_id, str) and raw_id.isdigit():
                            p_id = int(raw_id)

                        if p_id:
                            cur.execute(
                                """UPDATE players 
                                   SET name = %s, number = %s, position = %s, height = %s 
                                   WHERE id = %s AND team_id = %s RETURNING id;""",
                                (p["name"], str(p.get("number", "0")), p.get("position", "PG"), p.get("height", "1.90m"), p_id, team_id)
                            )
                            updated = cur.fetchone()
                            if updated:
                                saved_player_ids.append(updated["id"])
                            else:
                                cur.execute(
                                    """INSERT INTO players (team_id, name, number, position, height)
                                       VALUES (%s, %s, %s, %s, %s) RETURNING id;""",
                                    (team_id, p["name"], str(p.get("number", "0")), p.get("position", "PG"), p.get("height", "1.90m"))
                                )
                                saved_player_ids.append(cur.fetchone()["id"])
                        else:
                            cur.execute(
                                """INSERT INTO players (team_id, name, number, position, height)
                                   VALUES (%s, %s, %s, %s, %s) RETURNING id;""",
                                (team_id, p["name"], str(p.get("number", "0")), p.get("position", "PG"), p.get("height", "1.90m"))
                            )
                            saved_player_ids.append(cur.fetchone()["id"])

                    # Eliminar jugadores que fueron dados de baja en la nómina
                    if saved_player_ids:
                        cur.execute(
                            "DELETE FROM players WHERE team_id = %s AND NOT (id = ANY(%s));",
                            (team_id, saved_player_ids)
                        )

                    conn.commit()
                    self.send_json({"success": True, "team_id": team_id, "updated_players_count": len(saved_player_ids)})

                # 4. Programar partido
                elif path == "/api/matches":
                    cur.execute(
                        """INSERT INTO matches (tournament_id, round, home_team_id, away_team_id, home_score, away_score, quarters, status, match_date, match_time, venue)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;""",
                        (
                            payload.get("tournament_id", 1),
                            payload.get("round", 1),
                            payload["home_team_id"],
                            payload["away_team_id"],
                            0,
                            0,
                            json.dumps(payload.get("quarters", {"q1":{"home":0,"away":0},"q2":{"home":0,"away":0},"q3":{"home":0,"away":0},"q4":{"home":0,"away":0},"ot":{"home":0,"away":0}})),
                            payload.get("status", "SCHEDULED"),
                            payload.get("date", "2026-10-15"),
                            payload.get("time", "19:00"),
                            payload.get("venue", "Cancha Principal")
                        )
                    )
                    match_id = cur.fetchone()["id"]
                    conn.commit()
                    self.send_json({"success": True, "id": match_id})

                # 4.1 Modificar / Actualizar partido
                elif path == "/api/matches/update":
                    match_id = payload.get("id")
                    if not match_id:
                        self.send_json({"error": "Falta id del partido"}, 400)
                        return
                    cur.execute(
                        """UPDATE matches
                           SET round = %s,
                               home_team_id = %s,
                               away_team_id = %s,
                               match_date = %s,
                               match_time = %s,
                               venue = %s
                           WHERE id = %s
                           RETURNING id;""",
                        (
                            payload.get("round", 1),
                            payload["home_team_id"],
                            payload["away_team_id"],
                            payload.get("date", "2026-10-15"),
                            payload.get("time", "19:00"),
                            payload.get("venue", "Cancha Principal"),
                            match_id
                        )
                    )
                    updated = cur.fetchone()
                    if updated:
                        # Limpiar estadísticas de jugadores si los equipos cambiaron
                        cur.execute(
                            """DELETE FROM match_player_stats
                               WHERE match_id = %s
                                 AND player_id NOT IN (
                                   SELECT id FROM players WHERE team_id IN (%s, %s)
                                 );""",
                            (match_id, payload["home_team_id"], payload["away_team_id"])
                        )
                        conn.commit()
                        self.send_json({"success": True, "updated": updated["id"]})
                    else:
                        self.send_json({"error": "Partido no encontrado"}, 404)
                    return

                # 4.2 Eliminar partido via POST (compatibilidad fallback)
                elif path == "/api/matches/delete":
                    match_id = payload.get("id")
                    if not match_id:
                        self.send_json({"error": "Falta id del partido"}, 400)
                        return
                    cur.execute("DELETE FROM matches WHERE id = %s RETURNING id;", (match_id,))
                    deleted = cur.fetchone()
                    conn.commit()
                    self.send_json({"success": True, "deleted": deleted["id"] if deleted else None})
                    return

                # 5. Generar Fixture por lote para un torneo
                elif path == "/api/matches/batch":
                    tournament_id = payload.get("tournament_id")
                    matches = payload.get("matches", [])
                    if payload.get("replace", False):
                        cur.execute("DELETE FROM matches WHERE tournament_id = %s;", (tournament_id,))

                    inserted_ids = []
                    for m in matches:
                        cur.execute(
                            """INSERT INTO matches (tournament_id, round, home_team_id, away_team_id, home_score, away_score, quarters, status, match_date, match_time, venue)
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;""",
                            (
                                tournament_id,
                                m["round"],
                                m["home_team_id"],
                                m["away_team_id"],
                                m.get("home_score", 0),
                                m.get("away_score", 0),
                                json.dumps(m.get("quarters", {"q1":{"home":0,"away":0},"q2":{"home":0,"away":0},"q3":{"home":0,"away":0},"q4":{"home":0,"away":0},"ot":{"home":0,"away":0}})),
                                m.get("status", "SCHEDULED"),
                                m.get("date", "2026-10-15"),
                                m.get("time", "19:00"),
                                m.get("venue", "Cancha Principal")
                            )
                        )
                        inserted_ids.append(cur.fetchone()["id"])

                    conn.commit()
                    self.send_json({"success": True, "count": len(inserted_ids)})

                # 6. Actualizar marcador de partido
                elif path == "/api/matches/score":
                    cur.execute(
                        """UPDATE matches 
                           SET home_score = %s, away_score = %s, quarters = %s, status = 'FINISHED'
                           WHERE id = %s RETURNING id;""",
                        (payload["home_score"], payload["away_score"], json.dumps(payload["quarters"]), payload["match_id"])
                    )
                    conn.commit()
                    self.send_json({"success": True, "updated": payload["match_id"]})

                # 7. Guardar estadísticas individuales de jugadores por partido (upsert)
                elif path == "/api/matches/player-stats":
                    match_id = payload.get("match_id")
                    stats_list = payload.get("stats", [])
                    if not match_id:
                        self.send_json({"error": "Falta match_id"}, 400)
                        return

                    upserted = 0
                    for s in stats_list:
                        player_id = s.get("player_id")
                        if not player_id:
                            continue
                        played_val = s.get("played", True)
                        if isinstance(played_val, str):
                            played_val = played_val.lower() in ('true', '1', 't', 'yes', 'si')
                        played = bool(played_val)
                        cur.execute(
                            """INSERT INTO match_player_stats
                               (match_id, player_id, played, points, rebounds, assists, fouls)
                               VALUES (%s, %s, %s, %s, %s, %s, %s)
                               ON CONFLICT (match_id, player_id)
                               DO UPDATE SET
                                   played    = EXCLUDED.played,
                                   points    = EXCLUDED.points,
                                   rebounds  = EXCLUDED.rebounds,
                                   assists   = EXCLUDED.assists,
                                   fouls     = EXCLUDED.fouls;""",
                            (
                                match_id,
                                player_id,
                                played,
                                int(s.get("points", 0)),
                                int(s.get("rebounds", 0)),
                                int(s.get("assists", 0)),
                                int(s.get("fouls", 0))
                            )
                        )
                        upserted += 1

                    conn.commit()
                    self.send_json({"success": True, "upserted": upserted})

                else:
                    self.send_json({"error": "Endpoint not found"}, 404)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def handle_api_delete(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        conn = get_db_connection()
        if not conn:
            self.send_json({"error": "No database connection"}, 500)
            return

        try:
            with conn.cursor() as cur:
                if path == "/api/tournaments":
                    t_id = params.get("id", [None])[0]
                    if t_id:
                        cur.execute("DELETE FROM tournaments WHERE id = %s RETURNING id;", (t_id,))
                        deleted = cur.fetchone()
                        conn.commit()
                        self.send_json({"success": True, "deleted": deleted["id"] if deleted else None})
                    else:
                        self.send_json({"error": "Missing tournament id"}, 400)
                elif path == "/api/matches":
                    m_id = params.get("id", [None])[0]
                    if m_id:
                        cur.execute("DELETE FROM matches WHERE id = %s RETURNING id;", (m_id,))
                        deleted = cur.fetchone()
                        conn.commit()
                        self.send_json({"success": True, "deleted": deleted["id"] if deleted else None})
                    else:
                        self.send_json({"error": "Missing match id"}, 400)
                else:
                    self.send_json({"error": "Endpoint not found"}, 404)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)
        finally:
            conn.close()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    migrate_db()
    print(f"Iniciando servidor HoopManager con API PostgreSQL en http://localhost:{PORT} ...")
    server = http.server.HTTPServer(("0.0.0.0", PORT), HoopManagerHandler)
    server.serve_forever()
