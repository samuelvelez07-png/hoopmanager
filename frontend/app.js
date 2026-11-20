/**
 * HoopManager - Basketball Tournament Admin & League Platform
 * Multi-Tournament Architecture, Dynamic Rosters & Roster Editing (5 to 16 Players)
 */

// Sample Fallback Seed Data
const INITIAL_TOURNAMENT = {
  id: 1,
  name: 'Liga de Baloncesto Apertura 2026',
  category: 'Masculino Mayor',
  season: '2026',
  tie_breaker_type: 'diff',
  win_points: 2,
  loss_points: 1
};

const INITIAL_TEAMS = [
  { id: 't1', dbId: 1, tournamentId: 1, name: 'Halcones del Norte', shortName: 'HAL', color: '#f97316', logo: '🦅' },
  { id: 't2', dbId: 2, tournamentId: 1, name: 'Relámpagos Capital', shortName: 'REL', color: '#06b6d4', logo: '⚡' },
  { id: 't3', dbId: 3, tournamentId: 1, name: 'Gigantes del Este', shortName: 'GIG', color: '#8b5cf6', logo: '🏀' },
  { id: 't4', dbId: 4, tournamentId: 1, name: 'Panteras Central', shortName: 'PAN', color: '#f59e0b', logo: '🐆' },
  { id: 't5', dbId: 5, tournamentId: 1, name: 'Titanes del Sur', shortName: 'TIT', color: '#ef4444', logo: '🛡️' },
  { id: 't6', dbId: 6, tournamentId: 1, name: 'Vikingos Costa', shortName: 'VIK', color: '#3b82f6', logo: '⚓' }
];

const INITIAL_PLAYERS = [
  { id: 'p101', teamId: 't1', name: 'Carlos Mendoza', number: '7', position: 'PG', height: '1.85m' },
  { id: 'p102', teamId: 't1', name: 'Mateo Fernández', number: '11', position: 'SG', height: '1.92m' },
  { id: 'p103', teamId: 't1', name: 'Santiago Gómez', number: '23', position: 'SF', height: '1.98m' },
  { id: 'p104', teamId: 't1', name: 'Diego Ramírez', number: '34', position: 'PF', height: '2.03m' },
  { id: 'p105', teamId: 't1', name: 'Lucas Benítez', number: '15', position: 'C', height: '2.08m' },
  { id: 'p201', teamId: 't2', name: 'Alejandro Silva', number: '4', position: 'PG', height: '1.82m' },
  { id: 'p202', teamId: 't2', name: 'Javier Morales', number: '9', position: 'SG', height: '1.90m' },
  { id: 'p301', teamId: 't3', name: 'Nicolás Ibáñez', number: '1', position: 'PG', height: '1.86m' },
  { id: 'p302', teamId: 't3', name: 'Daniel Vega', number: '8', position: 'SG', height: '1.93m' }
];

const INITIAL_MATCHES = [
  {
    id: 'm101',
    dbId: 1,
    tournamentId: 1,
    round: 1,
    homeTeamId: 't1',
    awayTeamId: 't2',
    homeScore: 88,
    awayScore: 82,
    quarters: { q1: { home: 22, away: 18 }, q2: { home: 24, away: 20 }, q3: { home: 20, away: 22 }, q4: { home: 22, away: 22 }, ot: { home: 0, away: 0 } },
    status: 'FINISHED',
    date: '2026-09-20',
    time: '18:00',
    venue: 'Gimnasio Central'
  },
  {
    id: 'm102',
    dbId: 2,
    tournamentId: 1,
    round: 1,
    homeTeamId: 't3',
    awayTeamId: 't4',
    homeScore: 94,
    awayScore: 78,
    quarters: { q1: { home: 26, away: 16 }, q2: { home: 22, away: 20 }, q3: { home: 24, away: 22 }, q4: { home: 22, away: 20 }, ot: { home: 0, away: 0 } },
    status: 'FINISHED',
    date: '2026-09-21',
    time: '20:00',
    venue: 'Arena Municipal'
  }
];

function generateRosterPreset(count = 5) {
  const firstNames = ['Carlos', 'Mateo', 'Santiago', 'Diego', 'Lucas', 'Andrés', 'Tomás', 'Nicolás', 'Daniel', 'Emilio', 'Sebastián', 'Rodrigo', 'Felipe', 'Joaquín', 'Esteban', 'Álvaro'];
  const lastNames = ['Mendoza', 'Fernández', 'Gómez', 'Ramírez', 'Benítez', 'Silva', 'Morales', 'Torres', 'Navarro', 'Rivas', 'Ibáñez', 'Vega', 'Castillo', 'Paredes', 'Herrera', 'Cruz'];
  
  const positionsCycle = ['PG', 'SG', 'SF', 'PF', 'C'];
  const heightsCycle = {
    'PG': '1.85m',
    'SG': '1.92m',
    'SF': '1.98m',
    'PF': '2.03m',
    'C':  '2.08m'
  };

  const numbers = [1, 3, 7, 10, 15, 21, 23, 24, 30, 33, 44, 55, 9, 11, 14, 0];
  const total = Math.min(16, Math.max(5, count));

  return Array.from({ length: total }, (_, i) => {
    const pos = positionsCycle[i % 5];
    return {
      name: `${firstNames[i]} ${lastNames[i]}`,
      number: numbers[i],
      position: pos,
      height: heightsCycle[pos]
    };
  });
}

class Store {
  constructor() {
    this.tournaments = this.load('hoop_tournaments', [INITIAL_TOURNAMENT]);
    this.activeTournamentId = this.load('hoop_activeTournamentId', 1);

    this.teams = this.load('hoop_teams', INITIAL_TEAMS);
    this.players = this.load('hoop_players', INITIAL_PLAYERS);
    this.matches = this.load('hoop_matches', INITIAL_MATCHES);
    this.dbConnected = false;
    this.listeners = [];

    this.syncWithPostgres();
  }

  load(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  saveLocal() {
    localStorage.setItem('hoop_tournaments', JSON.stringify(this.tournaments));
    localStorage.setItem('hoop_activeTournamentId', JSON.stringify(this.activeTournamentId));
    localStorage.setItem('hoop_teams', JSON.stringify(this.teams));
    localStorage.setItem('hoop_players', JSON.stringify(this.players));
    localStorage.setItem('hoop_matches', JSON.stringify(this.matches));
    this.listeners.forEach(fn => fn());
  }

  save() {
    this.saveLocal();
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  getActiveTournament() {
    return this.tournaments.find(t => t.id === this.activeTournamentId) || this.tournaments[0] || INITIAL_TOURNAMENT;
  }

  getActiveTeams() {
    return this.teams.filter(t => t.tournamentId === this.activeTournamentId);
  }

  getActiveMatches() {
    return this.matches.filter(m => m.tournamentId === this.activeTournamentId);
  }

  async syncWithPostgres() {
    try {
      const tourneyRes = await fetch('/api/tournaments');
      if (tourneyRes.ok) {
        const tData = await tourneyRes.json();
        if (tData.tournaments && tData.tournaments.length > 0) {
          this.tournaments = tData.tournaments;
          if (!this.tournaments.some(t => t.id === this.activeTournamentId)) {
            this.activeTournamentId = this.tournaments[0].id;
          }
          this.dbConnected = true;
        }
      }

      const teamsRes = await fetch('/api/teams');
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        if (data.teams && data.teams.length > 0) {
          this.teams = data.teams.map(t => ({
            id: 't' + t.id,
            dbId: t.id,
            tournamentId: t.tournament_id,
            name: t.name,
            shortName: t.short_name,
            color: t.color || '#f97316',
            logo: t.logo || '🏀'
          }));
          this.players = (data.players || []).map(p => ({
            id: 'p' + p.id,
            dbId: p.id,
            teamId: 't' + p.team_id,
            name: p.name,
            number: p.number,
            position: p.position,
            height: p.height
          }));
        }
      }

      const matchRes = await fetch('/api/matches');
      if (matchRes.ok) {
        const mData = await matchRes.json();
        if (mData.matches && mData.matches.length > 0) {
          this.matches = mData.matches.map(m => ({
            id: 'm' + m.id,
            dbId: m.id,
            tournamentId: m.tournament_id,
            round: m.round,
            homeTeamId: 't' + m.home_team_id,
            awayTeamId: 't' + m.away_team_id,
            homeScore: m.home_score,
            awayScore: m.away_score,
            quarters: typeof m.quarters === 'string' ? JSON.parse(m.quarters) : (m.quarters || { q1: { home: 0, away: 0 }, q2: { home: 0, away: 0 }, q3: { home: 0, away: 0 }, q4: { home: 0, away: 0 }, ot: { home: 0, away: 0 } }),
            status: m.status,
            date: m.match_date,
            time: m.match_time,
            venue: m.venue,
            playerStats: {}
          }));

          // Load player stats for each finished match
          const finishedMatches = this.matches.filter(m => m.status === 'FINISHED' && m.dbId);
          await Promise.all(finishedMatches.map(async m => {
            try {
              const sRes = await fetch(`/api/matches/player-stats?match_id=${m.dbId}`);
              if (sRes.ok) {
                const sData = await sRes.json();
                const statsMap = {};
                (sData.stats || []).forEach(s => {
                  statsMap['p' + s.player_id] = {
                    played:   s.played !== false,
                    points:   s.points   || 0,
                    rebounds: s.rebounds || 0,
                    assists:  s.assists  || 0,
                    fouls:    s.fouls    || 0,
                    dbPlayerId: s.player_id
                  };
                });
                m.playerStats = statsMap;
                // Keep boxScore compatible alias
                m.boxScore = statsMap;
              }
            } catch (_) { /* ignore per-match errors */ }
          }));
        }
      }

      this.saveLocal();
    } catch (e) {
      console.log('PostgreSQL API offline o usando fallback LocalStorage:', e);
    }
  }

  async createTournament(data) {
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        const newTourney = { ...data, id: json.id };
        this.tournaments.push(newTourney);
        this.activeTournamentId = newTourney.id;
        this.save();
        return newTourney;
      }
    } catch (e) {
      console.log('Error creating tournament in DB, saving local:', e);
    }

    const newTourney = { ...data, id: Date.now() };
    this.tournaments.push(newTourney);
    this.activeTournamentId = newTourney.id;
    this.save();
    return newTourney;
  }

  async createTeamWithRoster(teamData, playersList) {
    const tournamentId = this.activeTournamentId;
    let dbTeamId = null;

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournamentId,
          name: teamData.name,
          short_name: teamData.shortName,
          color: teamData.color,
          logo: teamData.logo,
          players: playersList
        })
      });
      if (res.ok) {
        const d = await res.json();
        dbTeamId = d.team_id;
      } else {
        const err = await res.json();
        alert('Error del servidor: ' + (err.error || 'No se pudo guardar el equipo.'));
        return;
      }
    } catch (e) {
      console.log('Error saving team with roster in DB:', e);
    }

    const localTeamId = `team_${Date.now()}`;
    const newTeam = {
      id: localTeamId,
      dbId: dbTeamId,
      tournamentId,
      name: teamData.name,
      shortName: teamData.shortName,
      color: teamData.color,
      logo: teamData.logo
    };
    this.teams.push(newTeam);

    playersList.forEach((p, i) => {
      this.players.push({
        id: `player_${Date.now()}_${i}`,
        teamId: localTeamId,
        name: p.name,
        number: p.number,
        position: p.position,
        height: p.height
      });
    });

    this.save();
  }

  // Update existing team and roster in PostgreSQL & Local
  async updateTeamAndRoster(teamId, updatedTeamData, updatedPlayersList) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;

    // Persist to PostgreSQL if connected
    if (team.dbId) {
      try {
        const res = await fetch('/api/teams/update-roster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: team.dbId,
            name: updatedTeamData.name,
            short_name: updatedTeamData.shortName,
            color: updatedTeamData.color,
            logo: updatedTeamData.logo,
            players: updatedPlayersList
          })
        });
        if (!res.ok) {
          const err = await res.json();
          alert('Error actualizando en base de datos: ' + (err.error || ''));
          return;
        }
      } catch (e) {
        console.log('Error updating team roster in PostgreSQL:', e);
      }
    }

    // Update local team object
    team.name = updatedTeamData.name;
    team.shortName = updatedTeamData.shortName;
    team.color = updatedTeamData.color;
    team.logo = updatedTeamData.logo;

    // Replace team players in local state
    this.players = this.players.filter(p => p.teamId !== teamId);
    updatedPlayersList.forEach((p, idx) => {
      this.players.push({
        id: p.id || `player_${Date.now()}_${idx}`,
        dbId: p.dbId,
        teamId: teamId,
        name: p.name,
        number: p.number,
        position: p.position,
        height: p.height
      });
    });

    this.save();
  }

  // Update existing match in PostgreSQL & Local
  async updateMatch(matchId, updatedData) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    const hTeam = this.teams.find(t => t.id === updatedData.homeTeamId);
    const aTeam = this.teams.find(t => t.id === updatedData.awayTeamId);

    if (match.dbId && hTeam?.dbId && aTeam?.dbId) {
      try {
        const res = await fetch('/api/matches/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: match.dbId,
            round: updatedData.round,
            home_team_id: hTeam.dbId,
            away_team_id: aTeam.dbId,
            date: updatedData.date,
            time: updatedData.time,
            venue: updatedData.venue
          })
        });
        if (!res.ok) {
          const err = await res.json();
          alert('Error actualizando en base de datos: ' + (err.error || ''));
          return;
        }
      } catch (e) {
        console.log('Error updating match in PostgreSQL:', e);
      }
    }

    match.round = updatedData.round;
    match.homeTeamId = updatedData.homeTeamId;
    match.awayTeamId = updatedData.awayTeamId;
    match.date = updatedData.date;
    match.time = updatedData.time;
    match.venue = updatedData.venue;

    this.save();
    render();
    showToastNotification('✅ Partido modificado exitosamente');
  }

  // Delete match in PostgreSQL & Local
  async deleteMatch(matchId) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    if (match.dbId) {
      try {
        let res = await fetch(`/api/matches?id=${match.dbId}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          res = await fetch('/api/matches/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: match.dbId })
          });
        }
      } catch (e) {
        console.log('Error deleting match in PostgreSQL:', e);
      }
    }

    this.matches = this.matches.filter(m => m.id !== matchId);
    this.save();
    render();
    showToastNotification('🗑️ Partido eliminado exitosamente');
  }

  getStandings() {
    const activeTourney = this.getActiveTournament();
    const activeTeams = this.getActiveTeams();
    const activeMatches = this.getActiveMatches();

    const map = {};
    activeTeams.forEach(t => {
      map[t.id] = {
        teamId: t.id,
        name: t.name,
        shortName: t.shortName,
        logo: t.logo,
        color: t.color,
        played: 0, won: 0, lost: 0,
        pointsFor: 0, pointsAgainst: 0,
        diff: 0, ratio: 0, points: 0
      };
    });

    activeMatches.forEach(m => {
      if (m.status !== 'FINISHED') return;
      const home = map[m.homeTeamId];
      const away = map[m.awayTeamId];
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;
      home.pointsFor += m.homeScore;
      home.pointsAgainst += m.awayScore;
      away.pointsFor += m.awayScore;
      away.pointsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.won += 1; home.points += (activeTourney.win_points || 2);
        away.lost += 1; away.points += (activeTourney.loss_points || 1);
      } else if (m.awayScore > m.homeScore) {
        away.won += 1; away.points += (activeTourney.win_points || 2);
        home.lost += 1; home.points += (activeTourney.loss_points || 1);
      }
    });

    const standings = Object.values(map).map(s => {
      s.diff = s.pointsFor - s.pointsAgainst;
      s.ratio = s.pointsAgainst > 0 ? Number((s.pointsFor / s.pointsAgainst).toFixed(3)) : s.pointsFor;
      return s;
    });

    const isDiff = (activeTourney.tie_breaker_type || 'diff') === 'diff';
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (isDiff) {
        if (b.diff !== a.diff) return b.diff - a.diff;
      } else {
        if (b.ratio !== a.ratio) return b.ratio - a.ratio;
      }
      return b.pointsFor - a.pointsFor;
    });

    return standings;
  }

  getLeaders() {
    const activeTeams = this.getActiveTeams();
    const activeTeamIds = new Set(activeTeams.map(t => t.id));
    const activePlayers = this.players.filter(p => activeTeamIds.has(p.teamId));
    const activeMatches = this.getActiveMatches();

    const teamMap = {};
    activeTeams.forEach(t => teamMap[t.id] = t);

    const map = {};
    activePlayers.forEach(p => {
      map[p.id] = {
        playerId: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        teamName: teamMap[p.teamId]?.name || 'Equipo',
        teamLogo: teamMap[p.teamId]?.logo || '🏀',
        teamColor: teamMap[p.teamId]?.color || '#f97316',
        gamesPlayed: 0,
        totalPoints: 0,
        totalRebounds: 0,
        totalAssists: 0,
        totalFouls: 0,
        total3P: 0,
        total2P: 0,
        totalFT: 0,
        ppg: 0,
        rpg: 0,
        apg: 0,
        fpg: 0
      };
    });

    activeMatches.forEach(m => {
      const statsSource = m.playerStats || m.boxScore;
      if (m.status !== 'FINISHED' || !statsSource) return;
      Object.entries(statsSource).forEach(([pid, stats]) => {
        if (map[pid]) {
          // Si el jugador no disputó el partido (played === false), no suma PJ ni promedios
          const didPlay = stats.played !== false;
          if (!didPlay) return;
          map[pid].gamesPlayed    += 1;
          map[pid].totalPoints    += (stats.points    || 0);
          map[pid].totalRebounds  += (stats.rebounds  || 0);
          map[pid].totalAssists   += (stats.assists   || 0);
          map[pid].totalFouls     += (stats.fouls     || 0);
          map[pid].total3P        += (stats.threePointers || 0);
          map[pid].total2P        += (stats.twoPointers   || 0);
          map[pid].totalFT        += (stats.freeThrows    || 0);
        }
      });
    });

    const list = Object.values(map)
      .filter(p => p.gamesPlayed > 0 || p.totalPoints > 0 || p.totalRebounds > 0 || p.totalAssists > 0 || p.totalFouls > 0)
      .map(p => {
        p.ppg = p.gamesPlayed > 0 ? Number((p.totalPoints    / p.gamesPlayed).toFixed(1)) : 0;
        p.rpg = p.gamesPlayed > 0 ? Number((p.totalRebounds  / p.gamesPlayed).toFixed(1)) : 0;
        p.apg = p.gamesPlayed > 0 ? Number((p.totalAssists   / p.gamesPlayed).toFixed(1)) : 0;
        p.fpg = p.gamesPlayed > 0 ? Number((p.totalFouls     / p.gamesPlayed).toFixed(1)) : 0;
        return p;
      });

    list.sort((a, b) => b.totalPoints - a.totalPoints || b.ppg - a.ppg);
    return list;
  }

  async generateAutoFixtureForActiveTournament() {
    const activeTeams = this.getActiveTeams();
    if (activeTeams.length < 2) {
      alert('Se necesitan al menos 2 equipos inscritos en este torneo para generar el fixture.');
      return;
    }

    const teams = [...activeTeams];
    if (teams.length % 2 !== 0) {
      teams.push({ id: 'BYE', dbId: null, name: 'Descanso', dummy: true });
    }

    const n = teams.length;
    const numRounds = n - 1;
    const matchesPerRound = n / 2;
    const teamIndexes = teams.map((_, i) => i);
    const generated = [];
    const apiPayloadMatches = [];

    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const h = teams[teamIndexes[i]];
        const a = teams[teamIndexes[n - 1 - i]];

        if (!h.dummy && !a.dummy) {
          const matchDate = new Date(Date.now() + round * 86400000 * 3).toISOString().split('T')[0];
          generated.push({
            id: `match_${this.activeTournamentId}_${round + 1}_${i + 1}_${Date.now()}`,
            tournamentId: this.activeTournamentId,
            round: round + 1,
            homeTeamId: h.id,
            awayTeamId: a.id,
            homeScore: 0,
            awayScore: 0,
            quarters: { q1: { home: 0, away: 0 }, q2: { home: 0, away: 0 }, q3: { home: 0, away: 0 }, q4: { home: 0, away: 0 }, ot: { home: 0, away: 0 } },
            status: 'SCHEDULED',
            date: matchDate,
            time: '19:00',
            venue: 'Cancha Principal'
          });

          if (h.dbId && a.dbId) {
            apiPayloadMatches.push({
              round: round + 1,
              home_team_id: h.dbId,
              away_team_id: a.dbId,
              date: matchDate,
              time: '19:00',
              venue: 'Cancha Principal'
            });
          }
        }
      }
      teamIndexes.splice(1, 0, teamIndexes.pop());
    }

    if (apiPayloadMatches.length > 0) {
      try {
        await fetch('/api/matches/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournament_id: this.activeTournamentId,
            replace: true,
            matches: apiPayloadMatches
          })
        });
      } catch (e) {
        console.log('Error saving batch fixture to PostgreSQL:', e);
      }
    }

    this.matches = this.matches.filter(m => m.tournamentId !== this.activeTournamentId).concat(generated);
    this.save();
  }
}

const store = new Store();
let activeTab = 'dashboard';
let currentSelectedEmoji = '🏀';
let editSelectedEmoji = '🏀';

// Local state for dynamic roster creation and editing
let activeModalRoster = [];
let editModalRoster = [];
let currentEditingTeamId = null;

let isAppInitialized = false;

function initApp() {
  if (isAppInitialized) {
    store.load();
    render();
    return;
  }
  isAppInitialized = true;
  setupNavigation();
  setupTournamentSelector();
  setupModals();
  store.subscribe(render);
  render();
}

function setupNavigation() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeTab = e.currentTarget.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('btn-active'));
      e.currentTarget.classList.add('btn-active');
      render();
    });
  });

  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (confirm('¿Restablecer datos de demostración?')) {
      localStorage.clear();
      location.reload();
    }
  });

  document.getElementById('dash-btn-create-team')?.addEventListener('click', () => openModalTeamRoster());
  document.getElementById('dash-btn-create-match')?.addEventListener('click', () => openModalNewMatch());
  document.getElementById('btn-add-team-full')?.addEventListener('click', () => openModalTeamRoster());
  document.getElementById('btn-add-match')?.addEventListener('click', () => openModalNewMatch());
}

function setupTournamentSelector() {
  const sel = document.getElementById('select-active-tournament');
  sel.addEventListener('change', (e) => {
    store.activeTournamentId = parseInt(e.target.value);
    store.save();
  });

  document.getElementById('btn-modal-new-tournament')?.addEventListener('click', () => {
    openModal('modal-tournament');
  });

  document.getElementById('form-new-tournament')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('input-tourney-name').value.trim();
    const category = document.getElementById('input-tourney-category').value.trim();
    const season = document.getElementById('input-tourney-season').value.trim();
    const tie_breaker_type = document.getElementById('input-tourney-tiebreaker').value;

    if (!name) return;
    await store.createTournament({ name, category, season, tie_breaker_type });
    closeModal('modal-tournament');
    document.getElementById('form-new-tournament').reset();
  });
}

function setupModals() {
  // Creation Emoji Picker
  document.querySelectorAll('.emoji-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.emoji-choice').forEach(b => b.style.borderColor = 'transparent');
      e.currentTarget.style.borderColor = 'var(--primary-orange)';
      currentSelectedEmoji = e.currentTarget.getAttribute('data-emoji');
    });
  });

  // Edit Emoji Picker
  document.querySelectorAll('.emoji-edit-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.emoji-edit-choice').forEach(b => b.style.borderColor = 'transparent');
      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
      editSelectedEmoji = e.currentTarget.getAttribute('data-emoji');
    });
  });

  // Creation Roster Controls
  document.getElementById('btn-add-single-player')?.addEventListener('click', () => {
    saveCurrentRosterFromInputs();
    if (activeModalRoster.length >= 16) {
      alert('Has alcanzado el límite máximo de 16 jugadores por equipo.');
      return;
    }
    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    const nextPos = positions[activeModalRoster.length % 5];
    activeModalRoster.push({
      name: `Jugador ${activeModalRoster.length + 1}`,
      number: (activeModalRoster.length + 1) * 2,
      position: nextPos,
      height: '1.92m'
    });
    renderDynamicRosterTable();
  });

  document.getElementById('btn-fill-5')?.addEventListener('click', () => {
    activeModalRoster = generateRosterPreset(5);
    renderDynamicRosterTable();
  });

  document.getElementById('btn-fill-16')?.addEventListener('click', () => {
    activeModalRoster = generateRosterPreset(16);
    renderDynamicRosterTable();
  });

  // Submit New Team
  document.getElementById('form-team-15')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveCurrentRosterFromInputs();

    if (activeModalRoster.length < 5 || activeModalRoster.length > 16) {
      alert(`La plantilla debe tener entre 5 y 16 jugadores (actualmente tienes ${activeModalRoster.length}).`);
      return;
    }

    const name = document.getElementById('team-15-name').value.trim();
    const shortName = document.getElementById('team-15-short').value.trim().toUpperCase();
    const color = document.getElementById('team-15-color').value;

    await store.createTeamWithRoster({ name, shortName, color, logo: currentSelectedEmoji }, activeModalRoster);
    closeModal('modal-team-15');
    document.getElementById('form-team-15').reset();
  });

  // Edit Roster Controls
  document.getElementById('btn-edit-add-single-player')?.addEventListener('click', () => {
    saveEditRosterFromInputs();
    if (editModalRoster.length >= 16) {
      alert('Has alcanzado el límite máximo de 16 jugadores por equipo.');
      return;
    }
    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    const nextPos = positions[editModalRoster.length % 5];
    editModalRoster.push({
      name: `Refuerzo ${editModalRoster.length + 1}`,
      number: (editModalRoster.length + 1) * 2,
      position: nextPos,
      height: '1.92m'
    });
    renderEditRosterTable();
  });

  // Submit Edit Team Roster
  document.getElementById('form-team-edit')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveEditRosterFromInputs();

    if (editModalRoster.length < 5 || editModalRoster.length > 16) {
      alert(`La plantilla debe tener entre 5 y 16 jugadores (actualmente tienes ${editModalRoster.length}).`);
      return;
    }

    const name = document.getElementById('edit-team-name').value.trim();
    const shortName = document.getElementById('edit-team-short').value.trim().toUpperCase();
    const color = document.getElementById('edit-team-color').value;

    await store.updateTeamAndRoster(currentEditingTeamId, { name, shortName, color, logo: editSelectedEmoji }, editModalRoster);
    closeModal('modal-team-edit');
  });

  // New Match Form Submission
  document.getElementById('form-new-match')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const homeId = document.getElementById('match-home-team').value;
    const awayId = document.getElementById('match-away-team').value;
    if (homeId === awayId) {
      alert('El equipo local y el visitante no pueden ser el mismo.');
      return;
    }

    const round = parseInt(document.getElementById('match-round').value) || 1;
    const date = document.getElementById('match-date').value || new Date().toISOString().split('T')[0];
    const time = document.getElementById('match-time').value || '19:00';
    const venue = document.getElementById('match-venue').value || 'Cancha Principal';

    const hTeam = store.teams.find(t => t.id === homeId);
    const aTeam = store.teams.find(t => t.id === awayId);

    const newMatch = {
      id: `match_${store.activeTournamentId}_${Date.now()}`,
      tournamentId: store.activeTournamentId,
      round,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: 0,
      awayScore: 0,
      quarters: { q1: { home: 0, away: 0 }, q2: { home: 0, away: 0 }, q3: { home: 0, away: 0 }, q4: { home: 0, away: 0 }, ot: { home: 0, away: 0 } },
      status: 'SCHEDULED',
      date,
      time,
      venue
    };

    if (hTeam?.dbId && aTeam?.dbId) {
      try {
        const res = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tournament_id: store.activeTournamentId,
            round,
            home_team_id: hTeam.dbId,
            away_team_id: aTeam.dbId,
            date,
            time,
            venue
          })
        });
        if (res.ok) {
          const d = await res.json();
          newMatch.dbId = d.id;
        }
      } catch (err) {
        console.log('Error creando partido en PostgreSQL:', err);
      }
    }

    store.matches.push(newMatch);
    store.save();
    closeModal('modal-match-new');
  });

  // Edit Match Form Submission
  document.getElementById('form-edit-match')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const matchId = document.getElementById('edit-match-id').value;
    const homeId = document.getElementById('edit-match-home-team').value;
    const awayId = document.getElementById('edit-match-away-team').value;

    if (homeId === awayId) {
      alert('El equipo local y el visitante no pueden ser el mismo.');
      return;
    }

    const round = parseInt(document.getElementById('edit-match-round').value) || 1;
    const date = document.getElementById('edit-match-date').value;
    const time = document.getElementById('edit-match-time').value;
    const venue = document.getElementById('edit-match-venue').value;

    await store.updateMatch(matchId, {
      homeTeamId: homeId,
      awayTeamId: awayId,
      round,
      date,
      time,
      venue
    });

    closeModal('modal-match-edit');
  });
}

function saveCurrentRosterFromInputs() {
  const rows = document.querySelectorAll('#tbody-roster-15 tr');
  const updated = [];
  rows.forEach((r, idx) => {
    const pName = r.querySelector('.r-name').value.trim() || `Jugador ${idx + 1}`;
    const pNum = r.querySelector('.r-num').value.trim() || String(idx + 1);
    const pPos = r.querySelector('.r-pos').value;
    const pHeight = r.querySelector('.r-height').value.trim() || '1.92m';
    updated.push({ name: pName, number: pNum, position: pPos, height: pHeight });
  });
  if (updated.length > 0) {
    activeModalRoster = updated;
  }
}

function saveEditRosterFromInputs() {
  const rows = document.querySelectorAll('#tbody-roster-edit tr');
  const updated = [];
  rows.forEach((r, idx) => {
    const original = editModalRoster[idx] || {};
    const pName = r.querySelector('.r-edit-name').value.trim() || `Jugador ${idx + 1}`;
    const pNum = r.querySelector('.r-edit-num').value.trim() || String(idx + 1);
    const pPos = r.querySelector('.r-edit-pos').value;
    const pHeight = r.querySelector('.r-edit-height').value.trim() || '1.92m';
    updated.push({
      ...original,
      name: pName,
      number: pNum,
      position: pPos,
      height: pHeight
    });
  });
  if (updated.length > 0) {
    editModalRoster = updated;
  }
}

function openModalTeamRoster() {
  activeModalRoster = generateRosterPreset(5);
  renderDynamicRosterTable();
  openModal('modal-team-15');
}

function renderDynamicRosterTable() {
  const tbody = document.getElementById('tbody-roster-15');
  const countBadge = document.getElementById('badge-roster-count');
  const btnAdd = document.getElementById('btn-add-single-player');
  const len = activeModalRoster.length;

  if (countBadge) {
    countBadge.textContent = `${len} / 16 Jugadores ${len === 5 ? '(Quinteto Mínimo)' : len === 16 ? '(Máximo Alcanzado)' : ''}`;
    countBadge.className = `badge ${len < 5 ? 'badge-loss' : len === 16 ? 'badge-orange' : 'badge-win'}`;
  }

  if (btnAdd) {
    btnAdd.disabled = len >= 16;
    btnAdd.style.opacity = len >= 16 ? '0.5' : '1';
    btnAdd.style.cursor = len >= 16 ? 'not-allowed' : 'pointer';
  }

  tbody.innerHTML = activeModalRoster.map((p, idx) => `
    <tr>
      <td style="color:var(--text-muted); font-weight:700;">${idx + 1}</td>
      <td>
        <input type="text" class="form-input r-name" value="${p.name}" style="padding:0.3rem 0.5rem;" placeholder="Nombre completo" required>
      </td>
      <td>
        <input type="number" class="form-input r-num" value="${p.number}" style="width:55px; text-align:center; padding:0.3rem;" required>
      </td>
      <td>
        <select class="form-select r-pos" style="padding:0.3rem;">
          <option value="PG" ${p.position === 'PG' ? 'selected' : ''}>Base (PG)</option>
          <option value="SG" ${p.position === 'SG' ? 'selected' : ''}>Escolta (SG)</option>
          <option value="SF" ${p.position === 'SF' ? 'selected' : ''}>Alero (SF)</option>
          <option value="PF" ${p.position === 'PF' ? 'selected' : ''}>Ala-Pívot (PF)</option>
          <option value="C"  ${p.position === 'C' ? 'selected' : ''}>Pívot (C)</option>
        </select>
      </td>
      <td>
        <input type="text" class="form-input r-height" value="${p.height}" style="width:75px; text-align:center; padding:0.3rem;">
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-danger btn-sm" onclick="removePlayerRow(${idx})" ${len <= 5 ? 'disabled title="Mínimo 5 jugadores obligatorios"' : ''} style="${len <= 5 ? 'opacity:0.4; cursor:not-allowed;' : ''}; padding:0.2rem 0.4rem;">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');
}

window.removePlayerRow = function(index) {
  if (activeModalRoster.length <= 5) {
    alert('No puedes eliminar más jugadores. El reglamento exige un mínimo de 5 jugadores por equipo.');
    return;
  }
  saveCurrentRosterFromInputs();
  activeModalRoster.splice(index, 1);
  renderDynamicRosterTable();
};

// Open and Render Team & Roster Edit Modal
window.openEditTeamModal = function(teamId) {
  const team = store.teams.find(t => t.id === teamId);
  if (!team) return;

  currentEditingTeamId = teamId;
  document.getElementById('edit-team-name').value = team.name;
  document.getElementById('edit-team-short').value = team.shortName;
  document.getElementById('edit-team-color').value = team.color || '#f97316';
  editSelectedEmoji = team.logo || '🏀';

  document.querySelectorAll('.emoji-edit-choice').forEach(btn => {
    btn.style.borderColor = btn.getAttribute('data-emoji') === editSelectedEmoji ? 'var(--accent-cyan)' : 'transparent';
  });

  // Load existing players of this team
  const existing = store.players.filter(p => p.teamId === teamId);
  if (existing.length < 5) {
    // If fewer than 5, supplement up to 5
    const preset = generateRosterPreset(5);
    editModalRoster = existing.concat(preset.slice(existing.length));
  } else {
    editModalRoster = existing.map(p => ({ ...p }));
  }

  renderEditRosterTable();
  openModal('modal-team-edit');
};

function renderEditRosterTable() {
  const tbody = document.getElementById('tbody-roster-edit');
  const countBadge = document.getElementById('badge-edit-roster-count');
  const btnAdd = document.getElementById('btn-edit-add-single-player');
  const len = editModalRoster.length;

  if (countBadge) {
    countBadge.textContent = `${len} / 16 Jugadores ${len === 5 ? '(Mínimo 5)' : len === 16 ? '(Máximo 16)' : ''}`;
    countBadge.className = `badge ${len < 5 ? 'badge-loss' : len === 16 ? 'badge-orange' : 'badge-win'}`;
  }

  if (btnAdd) {
    btnAdd.disabled = len >= 16;
    btnAdd.style.opacity = len >= 16 ? '0.5' : '1';
    btnAdd.style.cursor = len >= 16 ? 'not-allowed' : 'pointer';
  }

  tbody.innerHTML = editModalRoster.map((p, idx) => `
    <tr>
      <td style="color:var(--text-muted); font-weight:700;">${idx + 1}</td>
      <td>
        <input type="text" class="form-input r-edit-name" value="${p.name}" style="padding:0.3rem 0.5rem;" placeholder="Nombre completo" required>
      </td>
      <td>
        <input type="number" class="form-input r-edit-num" value="${p.number}" style="width:55px; text-align:center; padding:0.3rem;" required>
      </td>
      <td>
        <select class="form-select r-edit-pos" style="padding:0.3rem;">
          <option value="PG" ${p.position === 'PG' ? 'selected' : ''}>Base (PG)</option>
          <option value="SG" ${p.position === 'SG' ? 'selected' : ''}>Escolta (SG)</option>
          <option value="SF" ${p.position === 'SF' ? 'selected' : ''}>Alero (SF)</option>
          <option value="PF" ${p.position === 'PF' ? 'selected' : ''}>Ala-Pívot (PF)</option>
          <option value="C"  ${p.position === 'C' ? 'selected' : ''}>Pívot (C)</option>
        </select>
      </td>
      <td>
        <input type="text" class="form-input r-edit-height" value="${p.height || '1.92m'}" style="width:75px; text-align:center; padding:0.3rem;">
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeEditPlayerRow(${idx})" ${len <= 5 ? 'disabled title="Mínimo 5 jugadores obligatorios"' : ''} style="${len <= 5 ? 'opacity:0.4; cursor:not-allowed;' : ''}; padding:0.2rem 0.4rem;">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');
}

window.removeEditPlayerRow = function(index) {
  if (editModalRoster.length <= 5) {
    alert('No puedes eliminar más jugadores. El reglamento exige un mínimo de 5 jugadores por equipo.');
    return;
  }
  saveEditRosterFromInputs();
  editModalRoster.splice(index, 1);
  renderEditRosterTable();
};

function openModalNewMatch() {
  const activeTeams = store.getActiveTeams();
  if (activeTeams.length < 2) {
    alert('Necesitas inscribir al menos 2 equipos en este torneo para programar partidos.');
    return;
  }

  const selHome = document.getElementById('match-home-team');
  const selAway = document.getElementById('match-away-team');
  
  selHome.innerHTML = activeTeams.map(t => `<option value="${t.id}">${t.logo} ${t.name}</option>`).join('');
  selAway.innerHTML = activeTeams.map(t => `<option value="${t.id}">${t.logo} ${t.name}</option>`).join('');

  if (activeTeams.length >= 2) {
    selAway.selectedIndex = 1;
  }

  document.getElementById('match-date').value = new Date().toISOString().split('T')[0];
  openModal('modal-match-new');
}

window.openEditMatchModal = function(matchId) {
  const match = store.matches.find(m => m.id === matchId);
  if (!match) return;

  const activeTeams = store.getActiveTeams();
  const selHome = document.getElementById('edit-match-home-team');
  const selAway = document.getElementById('edit-match-away-team');
  if (!selHome || !selAway) return;

  selHome.innerHTML = activeTeams.map(t => `<option value="${t.id}">${t.logo} ${t.name}</option>`).join('');
  selAway.innerHTML = activeTeams.map(t => `<option value="${t.id}">${t.logo} ${t.name}</option>`).join('');

  document.getElementById('edit-match-id').value = match.id;
  selHome.value = match.homeTeamId;
  selAway.value = match.awayTeamId;
  document.getElementById('edit-match-round').value = match.round || 1;

  const dateVal = match.date ? (typeof match.date === 'string' ? match.date.split('T')[0] : new Date(match.date).toISOString().split('T')[0]) : '';
  document.getElementById('edit-match-date').value = dateVal;
  document.getElementById('edit-match-time').value = match.time ? match.time.slice(0, 5) : '19:00';
  document.getElementById('edit-match-venue').value = match.venue || 'Cancha Principal';

  openModal('modal-match-edit');
};

window.confirmDeleteMatch = async function(matchId) {
  if (!matchId) return;
  const match = store.matches.find(m => m.id === matchId);
  if (!match) return;
  const hTeam = store.teams.find(t => t.id === match.homeTeamId);
  const aTeam = store.teams.find(t => t.id === match.awayTeamId);
  const matchTitle = (hTeam && aTeam) ? `${hTeam.name} vs ${aTeam.name}` : 'este partido';

  if (confirm(`¿Estás seguro de que deseas eliminar ${matchTitle} (Jornada ${match.round || 1})?\nEsta acción no se puede deshacer.`)) {
    closeModal('modal-match-edit');
    await store.deleteMatch(matchId);
  }
};

window.openModal = function(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
};

window.closeModal = function(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
};

function render() {
  const currentTourney = store.getActiveTournament();

  const selectTourney = document.getElementById('select-active-tournament');
  if (selectTourney) {
    selectTourney.innerHTML = store.tournaments.map(t => `
      <option value="${t.id}" ${t.id === store.activeTournamentId ? 'selected' : ''}>
        🏆 ${t.name} (${t.season || '2026'})
      </option>
    `).join('');
  }

  const heroTitle = document.getElementById('hero-tournament-title');
  if (heroTitle) heroTitle.textContent = currentTourney.name;

  const heroMeta = document.getElementById('hero-tournament-meta');
  if (heroMeta) {
    heroMeta.innerHTML = `Categoría: <strong>${currentTourney.category || 'Mayor'}</strong> • Temporada: <strong>${currentTourney.season || '2026'}</strong> • Desempate: <strong>${currentTourney.tie_breaker_type === 'diff' ? 'Diferencia (PF - PC)' : 'Basket Average Ratio (PF / PC)'}</strong>`;
  }

  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${activeTab}`)?.classList.remove('hidden');

  if (activeTab === 'dashboard') renderDashboard();
  if (activeTab === 'standings') renderStandings();
  if (activeTab === 'matches') renderMatches();
  if (activeTab === 'teams') renderTeams();
  if (activeTab === 'stats') renderStats();
}

function renderDashboard() {
  const standings = store.getStandings();
  const leaders = store.getLeaders();
  const activeTeams = store.getActiveTeams();
  const activeMatches = store.getActiveMatches();
  const completed = activeMatches.filter(m => m.status === 'FINISHED').length;

  document.getElementById('dash-teams-count').textContent = activeTeams.length;
  document.getElementById('dash-matches-count').textContent = `${completed} / ${activeMatches.length}`;
  document.getElementById('dash-leader-team').textContent = standings[0] ? `${standings[0].logo} ${standings[0].name}` : 'N/A';
  document.getElementById('dash-top-scorer').textContent = leaders[0] ? `${leaders[0].name} (${leaders[0].totalPoints} pts)` : 'N/A';

  const tbody = document.getElementById('dash-standings-tbody');
  if (tbody) {
    tbody.innerHTML = standings.length === 0 
      ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No hay partidos o equipos registrados en este torneo aún.</td></tr>'
      : standings.slice(0, 4).map((item, idx) => `
        <tr>
          <td><span class="badge ${idx < 2 ? 'badge-win' : 'badge-orange'}">#${idx + 1}</span></td>
          <td style="font-weight:700;">${item.logo} ${item.name}</td>
          <td>${item.played}</td>
          <td style="color:var(--status-win); font-weight:700;">${item.won}</td>
          <td style="color:var(--status-loss);">${item.lost}</td>
          <td style="font-weight:700;">${item.diff > 0 ? '+' + item.diff : item.diff}</td>
          <td><span style="background:var(--primary-orange-glow); color:var(--primary-orange); padding:0.2rem 0.5rem; border-radius:6px; font-weight:900;">${item.points}</span></td>
        </tr>
      `).join('');
  }
}

function renderStandings() {
  const standings = store.getStandings();
  const tourney = store.getActiveTournament();
  const isDiff = (tourney.tie_breaker_type || 'diff') === 'diff';

  const btnToggle = document.getElementById('btn-toggle-tiebreaker');
  if (btnToggle) {
    btnToggle.textContent = isDiff ? 'Criterio: Diferencia (PF - PC)' : 'Criterio: Basket Average (PF / PC)';
    btnToggle.onclick = () => {
      tourney.tie_breaker_type = isDiff ? 'ratio' : 'diff';
      store.save();
    };
  }

  const tbody = document.getElementById('standings-tbody');
  if (tbody) {
    tbody.innerHTML = standings.length === 0
      ? '<tr><td colspan="10" style="text-align:center; color:var(--text-muted); padding:2rem;">Sin estadísticas para este torneo aún. Inscribe equipos y programa partidos.</td></tr>'
      : standings.map((item, idx) => `
        <tr style="${idx < 4 ? 'background: rgba(16, 185, 129, 0.03); border-left: 4px solid #10b981;' : ''}">
          <td><span class="badge ${idx === 0 ? 'badge-win' : idx < 4 ? 'badge-orange' : 'badge-pending'}">#${idx + 1}</span></td>
          <td style="font-weight:700; font-size:1rem;">${item.logo} ${item.name} <small style="color:var(--text-muted);">(${item.shortName})</small></td>
          <td style="text-align:center;">${item.played}</td>
          <td style="text-align:center; color:var(--status-win); font-weight:800;">${item.won}</td>
          <td style="text-align:center; color:var(--status-loss);">${item.lost}</td>
          <td style="text-align:center;">${item.pointsFor}</td>
          <td style="text-align:center;">${item.pointsAgainst}</td>
          <td style="text-align:center; font-weight:800; color:${item.diff > 0 ? 'var(--status-win)' : item.diff < 0 ? 'var(--status-loss)' : 'inherit'};">${item.diff > 0 ? '+' + item.diff : item.diff}</td>
          <td style="text-align:center; font-weight:800; color:var(--accent-cyan);">${item.ratio}</td>
          <td style="text-align:center;"><span style="background:linear-gradient(135deg, #f97316 0%, #ea580c 100%); color:#fff; padding:0.3rem 0.75rem; border-radius:8px; font-weight:900;">${item.points}</span></td>
        </tr>
      `).join('');
  }
}

function renderMatches() {
  const container = document.getElementById('matches-grid');
  if (!container) return;

  const activeMatches = store.getActiveMatches();

  document.getElementById('btn-generate-fixture').onclick = () => {
    if (confirm('¿Generar fixture automático Round-Robin para todos los equipos de este torneo?')) {
      store.generateAutoFixtureForActiveTournament();
    }
  };

  container.innerHTML = activeMatches.length === 0 
    ? '<div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding:2.5rem; color:var(--text-muted);"><p style="font-size:1.1rem; margin-bottom:1rem;">No hay partidos programados para este torneo.</p><button class="btn btn-primary" onclick="store.generateAutoFixtureForActiveTournament()">✨ Generar Fixture Automático</button></div>'
    : activeMatches.map(m => {
      const home = store.teams.find(t => t.id === m.homeTeamId);
      const away = store.teams.find(t => t.id === m.awayTeamId);

      return `
        <div class="glass-card" style="background:var(--bg-card); padding:1.25rem; border-radius:12px; border:1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
            <span class="badge badge-orange">Jornada ${m.round}</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">${m.date} • ${m.time} hs</span>
            <span class="badge ${m.status === 'FINISHED' ? 'badge-win' : 'badge-pending'}">${m.status === 'FINISHED' ? 'Finalizado' : 'Programado'}</span>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-around; text-align:center; margin:1rem 0;">
            <div style="flex:1;">
              <div style="font-size:1.8rem;">${home?.logo || '🏀'}</div>
              <div style="font-weight:800; font-size:1rem;">${home?.name || 'Local'}</div>
            </div>

            <div style="font-size:1.6rem; font-weight:900; color:var(--primary-orange); background:rgba(15,23,42,0.9); padding:0.4rem 1rem; border-radius:10px;">
              ${m.status === 'FINISHED' ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
            </div>

            <div style="flex:1;">
              <div style="font-size:1.8rem;">${away?.logo || '🏀'}</div>
              <div style="font-weight:800; font-size:1rem;">${away?.name || 'Visitante'}</div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.6rem; flex-wrap:wrap; gap:0.5rem;">
            <span style="font-size:0.8rem; color:var(--text-muted);">📍 ${m.venue}</span>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center;">
              <button class="btn btn-secondary btn-sm" onclick="openEditMatchModal('${m.id}')" title="Modificar partido" style="font-weight:700;">
                ✏️ Editar
              </button>
              <button class="btn btn-secondary btn-sm" onclick="confirmDeleteMatch('${m.id}')" title="Eliminar partido" style="color:#ef4444; border-color:rgba(239,68,68,0.3); font-weight:700;">
                🗑️
              </button>
              <button class="btn btn-secondary btn-sm" onclick="exportMatchConsoleCSV('${m.id}')" title="Exportar planilla a CSV" style="font-weight:700;">
                📥 CSV
              </button>
              <button class="btn btn-secondary btn-sm" onclick="exportMatchConsolePDF('${m.id}')" title="Exportar planilla oficial Box Score a PDF" style="font-weight:700; color:var(--primary-orange); border-color:rgba(249,115,22,0.4);">
                📄 Box Score PDF
              </button>
              <button class="btn btn-accent btn-sm" onclick="openMatchConsole('${m.id}')">
                ${m.status === 'FINISHED' ? 'Ver Planilla' : 'Consola Partido'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
}

function renderTeams() {
  const container = document.getElementById('teams-list');
  if (!container) return;

  const activeTeams = store.getActiveTeams();

  container.innerHTML = activeTeams.length === 0
    ? '<div class="glass-card" style="text-align:center; padding:2.5rem; color:var(--text-muted);"><p style="font-size:1.1rem; margin-bottom:1rem;">No hay equipos inscritos en este torneo aún.</p><button class="btn btn-primary" onclick="openModalTeamRoster()">+ Inscribir Equipo (5 a 16 Jugadores)</button></div>'
    : activeTeams.map(team => {
      const roster = store.players.filter(p => p.teamId === team.id);

      return `
        <div class="glass-card" style="border-left:5px solid ${team.color}; padding:1.25rem; margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.8rem;">${team.logo}</span>
              <div>
                <h3 style="font-size:1.2rem; font-weight:800; margin:0;">
                  ${team.name} <span class="badge badge-orange">${team.shortName}</span>
                </h3>
                <span style="font-size:0.8rem; color:var(--text-secondary);">
                  ${roster.length} / 16 Jugadores Registrados (Mínimo 5)
                </span>
              </div>
            </div>
            
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="badge ${roster.length >= 5 ? 'badge-win' : 'badge-loss'}">
                ${roster.length >= 5 ? `${roster.length} Jugadores (Válido)` : `${roster.length} Jugadores (Incompleto)`}
              </span>
              <button class="btn btn-secondary btn-sm" onclick="openEditTeamModal('${team.id}')">
                ✏️ Editar Nómina
              </button>
            </div>
          </div>

          <div class="table-container" style="margin-top:0.85rem;">
            <table class="custom-table">
              <thead>
                <tr><th>Dorsal</th><th>Jugador</th><th>Posición</th><th>Estatura</th></tr>
              </thead>
              <tbody>
                ${roster.length === 0 ? '<tr><td colspan="4" style="color:var(--text-muted);">Sin jugadores.</td></tr>' : roster.map(p => `
                  <tr>
                    <td><strong>#${p.number}</strong></td>
                    <td style="font-weight:600;">${p.name}</td>
                    <td><span class="badge badge-pending">${p.position}</span></td>
                    <td style="color:var(--text-muted);">${p.height}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
}

let activeStatsCategory = 'all';

window.setStatsCategory = function(cat) {
  activeStatsCategory = cat;
  renderStats();
};

function renderStats() {
  const container = document.getElementById('stats-content-area');
  if (!container) return;

  // Actualizar estado activo en los botones de categoría
  document.querySelectorAll('.stats-pill').forEach(btn => {
    if (btn.dataset.cat === activeStatsCategory) {
      btn.classList.add('active');
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    } else {
      btn.classList.remove('active');
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    }
  });

  const allPlayers = store.getLeaders();

  // Función para insignias de podio y posición
  const rankBadge = (idx) => {
    if (idx === 0) return `<span class="badge" style="background:rgba(234,179,8,0.25); color:#facc15; border:1px solid rgba(234,179,8,0.5); font-weight:800;">🥇 1°</span>`;
    if (idx === 1) return `<span class="badge" style="background:rgba(203,213,225,0.2); color:#e2e8f0; border:1px solid rgba(203,213,225,0.4); font-weight:800;">🥈 2°</span>`;
    if (idx === 2) return `<span class="badge" style="background:rgba(217,119,6,0.2); color:#fb923c; border:1px solid rgba(217,119,6,0.4); font-weight:800;">🥉 3°</span>`;
    return `<span class="badge badge-pending">#${idx + 1}</span>`;
  };

  // Listas ordenadas por categoría específica
  const ptsList = [...allPlayers]
    .filter(p => p.totalPoints > 0 || p.gamesPlayed > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints || b.ppg - a.ppg);

  const rebList = [...allPlayers]
    .filter(p => p.totalRebounds > 0 || p.gamesPlayed > 0)
    .sort((a, b) => b.totalRebounds - a.totalRebounds || b.rpg - a.rpg);

  const astList = [...allPlayers]
    .filter(p => p.totalAssists > 0 || p.gamesPlayed > 0)
    .sort((a, b) => b.totalAssists - a.totalAssists || b.apg - a.apg);

  const foulsList = [...allPlayers]
    .filter(p => p.totalFouls > 0 || p.gamesPlayed > 0)
    .sort((a, b) => b.totalFouls - a.totalFouls || b.fpg - a.fpg);

  // Si no hay datos registrados
  if (allPlayers.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align:center; padding:3rem 1.5rem;">
        <div style="font-size:3rem; margin-bottom:0.75rem;">📊</div>
        <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:0.5rem;">Sin estadísticas individuales registradas</h3>
        <p style="color:var(--text-secondary); max-width:500px; margin:0 auto 1.5rem; font-size:0.9rem;">
          Aún no se han guardado planillas de estadísticas en los partidos de este torneo.
        </p>
        <button class="btn btn-primary" onclick="switchTab('matches')">
          Ir a Partidos y abrir Consola
        </button>
      </div>`;
    return;
  }

  // Renderizar tarjeta individual de categoría
  const renderCategoryCard = (title, emoji, color, list, statKey, statLabel, avgKey, avgLabel, isFullWidth = false) => {
    const limit = isFullWidth ? list.length : 8;
    const topLeader = list[0];
    return `
      <div class="glass-card stats-category-card" style="border-top: 4px solid ${color};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.6rem;">${emoji}</span>
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; margin:0; color:var(--text-primary);">${title}</h3>
              ${topLeader && topLeader[statKey] > 0 ? `<small style="color:${color}; font-weight:700;">Líder: ${topLeader.name} (${topLeader[statKey]} ${statLabel})</small>` : '<small style="color:var(--text-muted);">Sin líder definido</small>'}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem; font-weight:700;" onclick="exportCategoryStatsCSV('${statKey}')" title="Exportar esta categoría a CSV">
              📥 CSV
            </button>
            <button class="btn btn-secondary btn-sm" style="padding:0.25rem 0.6rem; font-size:0.75rem; font-weight:700; color:var(--primary-orange); border-color:rgba(249,115,22,0.4);" onclick="exportCategoryStatsPDF('${statKey}')" title="Exportar esta categoría a PDF">
              📄 PDF
            </button>
            <span class="badge" style="background:${color}22; color:${color}; border:1px solid ${color}44;">
              ${list.length} jugadores
            </span>
          </div>
        </div>

        <div class="table-container" style="flex:1;">
          <table class="custom-table" style="font-size:0.875rem;">
            <thead>
              <tr>
                <th style="width:60px; text-align:center;">POS</th>
                <th>Jugador</th>
                <th>Equipo</th>
                <th style="text-align:center; width:50px;">PJ</th>
                <th style="text-align:center; color:${color}; font-weight:800; width:75px;">${statLabel}</th>
                <th style="text-align:center; color:${color}; width:70px;">${avgLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Sin registros en esta categoría.</td></tr>` : list.slice(0, limit).map((p, idx) => `
                <tr>
                  <td style="text-align:center;">${rankBadge(idx)}</td>
                  <td>
                    <strong style="font-size:0.9rem;">${p.name}</strong>
                    <small style="color:var(--text-muted);">&nbsp;#${p.number}&nbsp;${p.position || ''}</small>
                  </td>
                  <td><span style="color:var(--text-secondary); font-weight:600;">${p.teamLogo || ''} ${p.teamName}</span></td>
                  <td style="text-align:center; color:var(--text-muted);">${p.gamesPlayed}</td>
                  <td style="text-align:center; font-weight:900; color:${color}; font-size:1.05rem;">${p[statKey]}</td>
                  <td style="text-align:center; font-weight:700; color:${color}; opacity:0.85;">${p[avgKey]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };

  // Renderizar tabla completa con todas las columnas
  const renderFullTable = () => `
    <div class="glass-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <h3 style="font-size:1.2rem; font-weight:800; margin:0;">📋 Tabla Consolidada General</h3>
          <small style="color:var(--text-secondary);">Todas las estadísticas acumuladas y promedios por jugador</small>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="exportConsolidatedStatsCSV()" style="font-weight:700;">
            📥 Exportar Tabla Consolidada (CSV)
          </button>
          <button class="btn btn-secondary btn-sm" onclick="exportStatsLeaderboardPDF()" style="font-weight:700; color:var(--primary-orange); border-color:rgba(249,115,22,0.4);">
            📄 Exportar Tabla a PDF
          </button>
          <span class="badge badge-orange">${allPlayers.length} Jugadores</span>
        </div>
      </div>
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width:60px; text-align:center;">POS</th>
              <th>Jugador</th>
              <th>Equipo</th>
              <th style="text-align:center;">PJ</th>
              <th style="text-align:center; color:#f97316;">PTS</th>
              <th style="text-align:center; color:#f97316;">PPG</th>
              <th style="text-align:center; color:#10b981;">REB</th>
              <th style="text-align:center; color:#10b981;">RPG</th>
              <th style="text-align:center; color:#38bdf8;">AST</th>
              <th style="text-align:center; color:#38bdf8;">APG</th>
              <th style="text-align:center; color:#f43f5e;">FP</th>
              <th style="text-align:center; color:#f43f5e;">FPG</th>
            </tr>
          </thead>
          <tbody>
            ${allPlayers.map((p, idx) => `
              <tr>
                <td style="text-align:center;">${rankBadge(idx)}</td>
                <td style="font-weight:800;">${p.name} <small style="color:var(--text-muted);">(#${p.number})</small></td>
                <td style="font-weight:700; color:var(--primary-orange);">${p.teamLogo || ''} ${p.teamName}</td>
                <td style="text-align:center;">${p.gamesPlayed}</td>
                <td style="text-align:center; font-weight:900; color:#f97316; font-size:1.05rem;">${p.totalPoints}</td>
                <td style="text-align:center; font-weight:800; color:#fb923c;">${p.ppg}</td>
                <td style="text-align:center; font-weight:700; color:#10b981;">${p.totalRebounds}</td>
                <td style="text-align:center; color:#34d399;">${p.rpg}</td>
                <td style="text-align:center; font-weight:700; color:#38bdf8;">${p.totalAssists}</td>
                <td style="text-align:center; color:#7dd3fc;">${p.apg}</td>
                <td style="text-align:center; font-weight:700; color:#f43f5e;">${p.totalFouls}</td>
                <td style="text-align:center; color:#fda4af;">${p.fpg}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  // Según la categoría seleccionada
  if (activeStatsCategory === 'all') {
    container.innerHTML = `
      <div class="grid-2">
        ${renderCategoryCard('Máximos Anotadores (Puntos)', '🏀', '#f97316', ptsList, 'totalPoints', 'PTS', 'ppg', 'PPG')}
        ${renderCategoryCard('Líderes en Rebotes', '🛡️', '#10b981', rebList, 'totalRebounds', 'REB', 'rpg', 'RPG')}
        ${renderCategoryCard('Líderes en Asistencias', '🎯', '#38bdf8', astList, 'totalAssists', 'AST', 'apg', 'APG')}
        ${renderCategoryCard('Faltas Personales', '⚠️', '#f43f5e', foulsList, 'totalFouls', 'FP', 'fpg', 'FPG')}
      </div>`;
  } else if (activeStatsCategory === 'pts') {
    container.innerHTML = renderCategoryCard('Máximos Anotadores (Puntos) — Clasificación Completa', '🏀', '#f97316', ptsList, 'totalPoints', 'PTS', 'ppg', 'PPG', true);
  } else if (activeStatsCategory === 'reb') {
    container.innerHTML = renderCategoryCard('Líderes en Rebotes — Clasificación Completa', '🛡️', '#10b981', rebList, 'totalRebounds', 'REB', 'rpg', 'RPG', true);
  } else if (activeStatsCategory === 'ast') {
    container.innerHTML = renderCategoryCard('Líderes en Asistencias — Clasificación Completa', '🎯', '#38bdf8', astList, 'totalAssists', 'AST', 'apg', 'APG', true);
  } else if (activeStatsCategory === 'fouls') {
    container.innerHTML = renderCategoryCard('Faltas Personales — Clasificación Completa', '⚠️', '#f43f5e', foulsList, 'totalFouls', 'FP', 'fpg', 'FPG', true);
  } else if (activeStatsCategory === 'table') {
    container.innerHTML = renderFullTable();
  }
}

window.openMatchConsole = function(matchId) {
  const m = store.matches.find(item => item.id === matchId);
  if (!m) return;

  const home = store.teams.find(t => t.id === m.homeTeamId);
  const away = store.teams.find(t => t.id === m.awayTeamId);
  const homePlayers = store.players.filter(p => p.teamId === m.homeTeamId);
  const awayPlayers = store.players.filter(p => p.teamId === m.awayTeamId);

  const modal = document.getElementById("match-console-modal");
  modal.classList.remove("hidden");

  // Render a single player stat row
  const statsRow = (p) => {
    const existing = (m.playerStats || m.boxScore || {})[p.id] || {};
    const dbId = p.dbId || "";
    const played = existing.played !== undefined ? Boolean(existing.played) : true;
    const rowOpacity = played ? '1' : '0.45';
    const disabledAttr = played ? '' : 'disabled';
    return `
      <tr id="player-row-${p.id}" style="transition:opacity 0.2s ease; opacity:${rowOpacity};">
        <td style="white-space:nowrap; padding:0.35rem 0.5rem;">
          <span style="font-size:0.75rem; color:var(--text-muted); margin-right:4px;">#${p.number}</span>
          <strong style="font-size:0.85rem;">${p.name}</strong>
          <small style="color:var(--text-muted);">&nbsp;${p.position || ""}</small>
        </td>
        <td style="padding:0.35rem;text-align:center;"><input type="number" min="0" max="99" data-pid="${p.id}" data-dbid="${dbId}" data-stat="points"
          value="${existing.points || 0}" class="stat-input form-input stat-input-${p.id}" style="width:64px;height:40px;font-size:1.05rem;font-weight:700;text-align:center;padding:0.35rem 0.5rem;" onfocus="this.select()" ${disabledAttr}></td>
        <td style="padding:0.35rem;text-align:center;"><input type="number" min="0" max="50" data-pid="${p.id}" data-dbid="${dbId}" data-stat="rebounds"
          value="${existing.rebounds || 0}" class="stat-input form-input stat-input-${p.id}" style="width:64px;height:40px;font-size:1.05rem;font-weight:700;text-align:center;padding:0.35rem 0.5rem;" onfocus="this.select()" ${disabledAttr}></td>
        <td style="padding:0.35rem;text-align:center;"><input type="number" min="0" max="30" data-pid="${p.id}" data-dbid="${dbId}" data-stat="assists"
          value="${existing.assists || 0}" class="stat-input form-input stat-input-${p.id}" style="width:64px;height:40px;font-size:1.05rem;font-weight:700;text-align:center;padding:0.35rem 0.5rem;" onfocus="this.select()" ${disabledAttr}></td>
        <td style="padding:0.35rem;text-align:center;"><input type="number" min="0" max="5"  data-pid="${p.id}" data-dbid="${dbId}" data-stat="fouls"
          value="${existing.fouls || 0}" class="stat-input form-input stat-input-${p.id}" style="width:64px;height:40px;font-size:1.05rem;font-weight:700;text-align:center;padding:0.35rem 0.5rem;" onfocus="this.select()" ${disabledAttr}></td>
        <td style="padding:0.35rem;text-align:center;">
          <label style="display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;user-select:none;padding:5px 8px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);" title="Marcar si el jugador disputó este partido (afecta PJ y promedios)">
            <input type="checkbox" data-pid="${p.id}" data-dbid="${dbId}" class="stat-input-played" ${played ? 'checked' : ''} onchange="window.togglePlayerPlayed('${p.id}', this.checked)" style="width:18px;height:18px;accent-color:#10b981;cursor:pointer;margin:0;">
            <span id="played-badge-${p.id}" style="font-size:0.75rem;font-weight:800;letter-spacing:0.04em;color:${played ? '#10b981' : '#f87171'};">
              ${played ? 'SÍ' : 'NO'}
            </span>
          </label>
        </td>
      </tr>`;
  };

  const statsTable = (players, teamObj) => `
    <div style="margin-bottom:1.5rem;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem;">
        <span style="font-size:1.4rem;">${teamObj?.logo || "🏀"}</span>
        <span style="font-weight:800;font-size:1.05rem;">${teamObj?.name || "Equipo"}</span>
        <span style="font-size:0.8rem;color:var(--text-muted);margin-left:4px;">(${players.length} jugadores)</span>
      </div>
      <div class="table-container">
        <table class="custom-table" style="font-size:0.9rem;">
          <thead>
            <tr>
              <th style="min-width:180px;">Jugador</th>
              <th style="text-align:center;color:#f97316;width:80px;">PTS</th>
              <th style="text-align:center;color:#10b981;width:80px;">REB</th>
              <th style="text-align:center;color:#38bdf8;width:80px;">AST</th>
              <th style="text-align:center;color:#f43f5e;width:80px;">FP</th>
              <th style="text-align:center;color:#10b981;width:95px;" title="¿Disputó este partido? (Afecta cálculo de PJ y promedios)">¿DISPUTÓ?</th>
            </tr>
          </thead>
          <tbody>
            ${players.length > 0
              ? players.map(p => statsRow(p)).join("")
              : "<tr><td colspan=\"6\" style=\"text-align:center;color:var(--text-muted);padding:1rem;\">Sin jugadores registrados.</td></tr>"}
          </tbody>
        </table>
      </div>
    </div>`;

  modal.innerHTML = `
    <div class="modal-content" style="max-width:920px;max-height:90vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
        <h3 style="font-size:1.4rem;font-weight:800;margin:0;">🏀 Consola de Partido — Jornada ${m.round}</h3>
        <div class="no-print-pdf" style="display:flex;gap:0.4rem;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="exportMatchConsoleCSV('${m.id}')" style="display:inline-flex;align-items:center;gap:0.35rem;font-weight:700;">
            📥 Planilla CSV
          </button>
          <button class="btn btn-secondary btn-sm" onclick="exportMatchConsolePDF('${m.id}')" style="display:inline-flex;align-items:center;gap:0.35rem;font-weight:700;color:var(--primary-orange);border-color:rgba(249,115,22,0.4);">
            📄 Box Score PDF
          </button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-around;align-items:center;text-align:center;background:rgba(15,23,42,0.8);padding:1rem;border-radius:12px;margin-bottom:1.25rem;">
        <div>
          <div style="font-size:2rem;">${home?.logo || "🏀"}</div>
          <h4 style="margin:0.3rem 0 0;">${home?.name || "Local"}</h4>
          <small style="color:var(--text-muted);">${home?.shortName || ""}</small>
        </div>
        <div style="font-size:2.5rem;font-weight:900;color:var(--primary-orange);">${m.homeScore} – ${m.awayScore}</div>
        <div>
          <div style="font-size:2rem;">${away?.logo || "🏀"}</div>
          <h4 style="margin:0.3rem 0 0;">${away?.name || "Visitante"}</h4>
          <small style="color:var(--text-muted);">${away?.shortName || ""}</small>
        </div>
      </div>
      <h4 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);margin-bottom:0.5rem;letter-spacing:0.05em;">📊 Marcador por Cuartos</h4>
      <div class="table-container" style="margin-bottom:1.75rem;">
        <table class="custom-table" style="text-align:center;">
          <thead><tr><th style="min-width:100px;">Equipo</th><th style="width:90px;">Q1</th><th style="width:90px;">Q2</th><th style="width:90px;">Q3</th><th style="width:90px;">Q4</th><th style="width:90px;">OT</th></tr></thead>
          <tbody>
            <tr>
              <td><strong style="font-size:1.05rem;">${home?.shortName || "LOC"}</strong></td>
              <td><input type="number" id="q1-h" value="${m.quarters?.q1?.home || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="q2-h" value="${m.quarters?.q2?.home || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="q3-h" value="${m.quarters?.q3?.home || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="q4-h" value="${m.quarters?.q4?.home || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="ot-h"  value="${m.quarters?.ot?.home  || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
            </tr>
            <tr>
              <td><strong style="font-size:1.05rem;">${away?.shortName || "VIS"}</strong></td>
              <td><input type="number" id="q1-a" value="${m.quarters?.q1?.away || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="q2-a" value="${m.quarters?.q2?.away || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="q3-a" value="${m.quarters?.q3?.away || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="q4-a" value="${m.quarters?.q4?.away || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
              <td><input type="number" id="ot-a"  value="${m.quarters?.ot?.away  || 0}" class="form-input quarter-score-input" style="width:72px;height:44px;font-size:1.15rem;font-weight:700;text-align:center;padding:0.4rem 0.5rem;" onfocus="this.select()"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="border-top:2px solid rgba(249,115,22,0.3);padding-top:1.25rem;margin-bottom:0.5rem;">
        <h4 style="font-size:0.85rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);margin-bottom:1.25rem;letter-spacing:0.05em;">
          📋 Planilla de Estadísticas — Box Score
          <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;text-transform:none;margin-left:8px;">PTS · REB · AST · FP</span>
        </h4>
        ${statsTable(homePlayers, home)}
        ${statsTable(awayPlayers, away)}
      </div>
      <div class="no-print-pdf" style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.07);flex-wrap:wrap;">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="exportMatchConsoleCSV('${m.id}')" style="font-weight:700;">
            📥 Exportar CSV
          </button>
          <button class="btn btn-secondary" onclick="exportMatchConsolePDF('${m.id}')" style="font-weight:700;color:var(--primary-orange);border-color:rgba(249,115,22,0.4);">
            📄 Box Score PDF
          </button>
        </div>
        <div style="display:flex;gap:0.75rem;">
          <button class="btn btn-secondary" onclick="closeMatchConsole()">Cerrar</button>
          <button class="btn btn-primary" id="save-boxscore-btn" onclick="saveMatchConsole('${m.id}')">💾 Finalizar &amp; Guardar en PostgreSQL</button>
        </div>
      </div>
    </div>
  `;
};

window.togglePlayerPlayed = function(playerId, isChecked) {
  const row = document.getElementById(`player-row-${playerId}`);
  const badge = document.getElementById(`played-badge-${playerId}`);
  const inputs = document.querySelectorAll(`.stat-input-${playerId}`);

  if (row) {
    row.style.opacity = isChecked ? '1' : '0.45';
  }
  if (badge) {
    badge.textContent = isChecked ? 'SÍ' : 'NO';
    badge.style.color = isChecked ? '#10b981' : '#f87171';
  }
  inputs.forEach(input => {
    input.disabled = !isChecked;
    if (!isChecked) {
      input.value = 0;
    }
  });
};

function showToastNotification(msg, isSuccess = true) {
  let toast = document.getElementById('app-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast-notification';
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#0f172a; color:#f8fafc; padding:12px 20px; border-radius:12px; border:1px solid rgba(249,115,22,0.4); box-shadow:0 12px 30px rgba(0,0,0,0.6); font-weight:700; font-size:0.9rem; z-index:99999999; display:flex; align-items:center; gap:8px; transition:opacity 0.3s ease, transform 0.3s ease; pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.style.borderColor = isSuccess ? '#10b981' : '#f97316';
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 3500);
}

window.closeMatchConsole = function() {
  document.getElementById('match-console-modal').classList.add('hidden');
};

window.persistConsoleMatchData = async function(matchId, isFinalizing = false) {
  const m = store.matches.find(item => item.id === matchId);
  if (!m) return null;

  const isConsoleOpen = document.getElementById('q1-h') !== null && !document.getElementById('match-console-modal')?.classList.contains('hidden');
  if (!isConsoleOpen) return m;

  const q1h = parseInt(document.getElementById('q1-h')?.value) || 0;
  const q2h = parseInt(document.getElementById('q2-h')?.value) || 0;
  const q3h = parseInt(document.getElementById('q3-h')?.value) || 0;
  const q4h = parseInt(document.getElementById('q4-h')?.value) || 0;
  const oth = parseInt(document.getElementById('ot-h')?.value) || 0;

  const q1a = parseInt(document.getElementById('q1-a')?.value) || 0;
  const q2a = parseInt(document.getElementById('q2-a')?.value) || 0;
  const q3a = parseInt(document.getElementById('q3-a')?.value) || 0;
  const q4a = parseInt(document.getElementById('q4-a')?.value) || 0;
  const ota = parseInt(document.getElementById('ot-a')?.value) || 0;

  m.quarters = {
    q1: { home: q1h, away: q1a },
    q2: { home: q2h, away: q2a },
    q3: { home: q3h, away: q3a },
    q4: { home: q4h, away: q4a },
    ot: { home: oth, away: ota }
  };

  m.homeScore = q1h + q2h + q3h + q4h + oth;
  m.awayScore = q1a + q2a + q3a + q4a + ota;
  if (isFinalizing || m.status === 'FINISHED') {
    m.status = 'FINISHED';
  }

  // Recolectar estadísticas individuales de la consola
  const statInputs = document.querySelectorAll('.stat-input');
  const statsMap = {};
  const statsForDB = [];

  statInputs.forEach(input => {
    const pid  = input.dataset.pid;
    const dbid = input.dataset.dbid;
    const stat = input.dataset.stat;
    const val  = parseInt(input.value) || 0;
    if (!statsMap[pid]) {
      statsMap[pid] = { played: true, points: 0, rebounds: 0, assists: 0, fouls: 0, dbPlayerId: dbid ? parseInt(dbid) : null };
    }
    statsMap[pid][stat] = val;
  });

  // Leer estado de los checkboxes de ¿Disputó partido?
  document.querySelectorAll('.stat-input-played').forEach(chk => {
    const pid  = chk.dataset.pid;
    const dbid = chk.dataset.dbid;
    if (!statsMap[pid]) {
      statsMap[pid] = { played: true, points: 0, rebounds: 0, assists: 0, fouls: 0, dbPlayerId: dbid ? parseInt(dbid) : null };
    }
    statsMap[pid].played = chk.checked;
    if (!chk.checked) {
      statsMap[pid].points = 0;
      statsMap[pid].rebounds = 0;
      statsMap[pid].assists = 0;
      statsMap[pid].fouls = 0;
    }
  });

  Object.entries(statsMap).forEach(([pid, s]) => {
    if (s.dbPlayerId) {
      statsForDB.push({
        player_id: s.dbPlayerId,
        played:    s.played !== false,
        points:    s.points,
        rebounds:  s.rebounds,
        assists:   s.assists,
        fouls:     s.fouls
      });
    }
  });

  m.playerStats = statsMap;
  m.boxScore    = statsMap;

  // Persistir en base de datos PostgreSQL
  if (m.dbId) {
    try {
      await fetch('/api/matches/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: m.dbId,
          home_score: m.homeScore,
          away_score: m.awayScore,
          quarters: m.quarters
        })
      });
      if (statsForDB.length > 0) {
        await fetch('/api/matches/player-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ match_id: m.dbId, stats: statsForDB })
        });
      }
    } catch (e) {
      console.warn('Error enviando resultado a PostgreSQL API:', e);
    }
  }

  store.save();
  return m;
};

window.saveMatchConsole = async function(matchId) {
  const btn = document.getElementById('save-boxscore-btn');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '💾 Guardando en PostgreSQL...';
    btn.disabled = true;
  }

  try {
    await window.persistConsoleMatchData(matchId, true);
    closeMatchConsole();
    render();
    showToastNotification('✅ Marcador y estadísticas guardados exitosamente en PostgreSQL');
  } catch (err) {
    console.error('Error al guardar consola:', err);
    alert('Ocurrió un error al guardar en PostgreSQL: ' + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = originalText || '💾 Finalizar &amp; Guardar en PostgreSQL';
      btn.disabled = false;
    }
  }
};

// ==========================================
// CSV EXPORT UTILITIES & HANDLERS
// ==========================================

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function cleanFilename(str) {
  return (str || 'archivo')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'archivo';
}

function downloadCSV(filename, csvContent) {
  // \uFEFF Byte Order Mark (BOM) para compatibilidad total con Excel y caracteres UTF-8 (tildes, ñ)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : filename + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 1. Exportar Consola de Partido / Planilla Oficial a CSV
window.exportMatchConsoleCSV = async function(matchId) {
  const m = store.matches.find(item => item.id === matchId);
  if (!m) {
    alert('Partido no encontrado.');
    return;
  }

  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const home = store.teams.find(t => t.id === m.homeTeamId);
  const away = store.teams.find(t => t.id === m.awayTeamId);
  const homeName = home ? home.name : 'Local';
  const awayName = away ? away.name : 'Visitante';
  const homePlayers = store.players.filter(p => p.teamId === m.homeTeamId);
  const awayPlayers = store.players.filter(p => p.teamId === m.awayTeamId);

  // Verificar si la consola modal está abierta para capturar valores en vivo
  const isConsoleOpen = document.getElementById('q1-h') !== null && !document.getElementById('match-console-modal')?.classList.contains('hidden');

  let q1h = 0, q2h = 0, q3h = 0, q4h = 0, oth = 0;
  let q1a = 0, q2a = 0, q3a = 0, q4a = 0, ota = 0;
  let liveStatsMap = {};

  if (isConsoleOpen) {
    // Sincronizar y guardar automáticamente los cambios en la base de datos PostgreSQL
    await window.persistConsoleMatchData(matchId, false);
    showToastNotification('💾 Datos del partido sincronizados con PostgreSQL');

    q1h = parseInt(document.getElementById('q1-h')?.value) || 0;
    q2h = parseInt(document.getElementById('q2-h')?.value) || 0;
    q3h = parseInt(document.getElementById('q3-h')?.value) || 0;
    q4h = parseInt(document.getElementById('q4-h')?.value) || 0;
    oth = parseInt(document.getElementById('ot-h')?.value) || 0;

    q1a = parseInt(document.getElementById('q1-a')?.value) || 0;
    q2a = parseInt(document.getElementById('q2-a')?.value) || 0;
    q3a = parseInt(document.getElementById('q3-a')?.value) || 0;
    q4a = parseInt(document.getElementById('q4-a')?.value) || 0;
    ota = parseInt(document.getElementById('ot-a')?.value) || 0;

    document.querySelectorAll('.stat-input').forEach(input => {
      const pid = input.dataset.pid;
      const stat = input.dataset.stat;
      const val = parseInt(input.value) || 0;
      if (!liveStatsMap[pid]) liveStatsMap[pid] = { played: true, points: 0, rebounds: 0, assists: 0, fouls: 0 };
      liveStatsMap[pid][stat] = val;
    });

    document.querySelectorAll('.stat-input-played').forEach(chk => {
      const pid = chk.dataset.pid;
      if (!liveStatsMap[pid]) liveStatsMap[pid] = { played: true, points: 0, rebounds: 0, assists: 0, fouls: 0 };
      liveStatsMap[pid].played = chk.checked;
      if (!chk.checked) {
        liveStatsMap[pid].points = 0;
        liveStatsMap[pid].rebounds = 0;
        liveStatsMap[pid].assists = 0;
        liveStatsMap[pid].fouls = 0;
      }
    });
  } else {
    q1h = m.quarters?.q1?.home || 0;
    q2h = m.quarters?.q2?.home || 0;
    q3h = m.quarters?.q3?.home || 0;
    q4h = m.quarters?.q4?.home || 0;
    oth = m.quarters?.ot?.home || 0;

    q1a = m.quarters?.q1?.away || 0;
    q2a = m.quarters?.q2?.away || 0;
    q3a = m.quarters?.q3?.away || 0;
    q4a = m.quarters?.q4?.away || 0;
    ota = m.quarters?.ot?.away || 0;

    liveStatsMap = m.playerStats || m.boxScore || {};
  }

  const finalHomeScore = (q1h + q2h + q3h + q4h + oth) || m.homeScore || 0;
  const finalAwayScore = (q1a + q2a + q3a + q4a + ota) || m.awayScore || 0;
  const matchStatus = m.status === 'FINISHED' ? 'Finalizado' : 'Programado / En Curso';

  const lines = [];

  // Metadata del Partido
  lines.push(['HOOPMANAGER - PLANILLA OFICIAL DE PARTIDO']);
  lines.push(['Torneo', escapeCSV(tourneyName)]);
  lines.push(['Jornada', m.round]);
  lines.push(['Fecha', escapeCSV(m.date), 'Hora', escapeCSV(m.time), 'Sede', escapeCSV(m.venue)]);
  lines.push(['Estado', escapeCSV(matchStatus)]);
  lines.push(['Resultado Final', `${escapeCSV(homeName)} ${finalHomeScore} - ${finalAwayScore} ${escapeCSV(awayName)}`]);
  lines.push(['Fecha Exportacion', escapeCSV(new Date().toLocaleString())]);
  lines.push([]);

  // Marcador por Cuartos
  lines.push(['MARCADOR POR CUARTOS']);
  lines.push(['Equipo', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'TOTAL']);
  lines.push([escapeCSV(homeName), q1h, q2h, q3h, q4h, oth, finalHomeScore]);
  lines.push([escapeCSV(awayName), q1a, q2a, q3a, q4a, ota, finalAwayScore]);
  lines.push([]);

  // Planilla Local (Box Score)
  lines.push([`PLANILLA BOX SCORE - LOCAL: ${escapeCSV(homeName).toUpperCase()}`]);
  lines.push(['Dorsal', 'Jugador', 'Posicion', 'Equipo', 'Disputo Partido', 'PTS', 'REB', 'AST', 'FP']);
  let totHomePts = 0, totHomeReb = 0, totHomeAst = 0, totHomeFouls = 0;
  homePlayers.forEach(p => {
    const s = liveStatsMap[p.id] || {};
    const played = s.played !== false;
    const pts = played ? (s.points || 0) : 0;
    const reb = played ? (s.rebounds || 0) : 0;
    const ast = played ? (s.assists || 0) : 0;
    const fls = played ? (s.fouls || 0) : 0;
    totHomePts += pts;
    totHomeReb += reb;
    totHomeAst += ast;
    totHomeFouls += fls;
    lines.push([`#${p.number}`, escapeCSV(p.name), escapeCSV(p.position || '-'), escapeCSV(homeName), played ? 'SI' : 'NO (DNP)', pts, reb, ast, fls]);
  });
  lines.push(['TOTALES LOCAL', '', '', escapeCSV(homeName), '', totHomePts, totHomeReb, totHomeAst, totHomeFouls]);
  lines.push([]);

  // Planilla Visitante (Box Score)
  lines.push([`PLANILLA BOX SCORE - VISITANTE: ${escapeCSV(awayName).toUpperCase()}`]);
  lines.push(['Dorsal', 'Jugador', 'Posicion', 'Equipo', 'Disputo Partido', 'PTS', 'REB', 'AST', 'FP']);
  let totAwayPts = 0, totAwayReb = 0, totAwayAst = 0, totAwayFouls = 0;
  awayPlayers.forEach(p => {
    const s = liveStatsMap[p.id] || {};
    const played = s.played !== false;
    const pts = played ? (s.points || 0) : 0;
    const reb = played ? (s.rebounds || 0) : 0;
    const ast = played ? (s.assists || 0) : 0;
    const fls = played ? (s.fouls || 0) : 0;
    totAwayPts += pts;
    totAwayReb += reb;
    totAwayAst += ast;
    totAwayFouls += fls;
    lines.push([`#${p.number}`, escapeCSV(p.name), escapeCSV(p.position || '-'), escapeCSV(awayName), played ? 'SI' : 'NO (DNP)', pts, reb, ast, fls]);
  });
  lines.push(['TOTALES VISITANTE', '', '', escapeCSV(awayName), '', totAwayPts, totAwayReb, totAwayAst, totAwayFouls]);

  const csvContent = lines.map(row => row.join(',')).join('\r\n');
  const filename = `partido_j${m.round}_${cleanFilename(homeName)}_vs_${cleanFilename(awayName)}.csv`;
  downloadCSV(filename, csvContent);
};

// 2. Exportar Tabla Oficial de Posiciones a CSV
window.exportStandingsCSV = function() {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const standings = store.getStandings();

  if (standings.length === 0) {
    alert('No hay posiciones registradas para exportar en este torneo.');
    return;
  }

  const isDiff = (activeTourney?.tie_breaker_type || 'diff') === 'diff';
  const tieRule = isDiff ? 'Diferencia de Puntos (PF - PC)' : 'Basket Average / Ratio (PF / PC)';

  const lines = [];
  lines.push(['HOOPMANAGER - TABLA OFICIAL DE POSICIONES & BASKET AVERAGE']);
  lines.push(['Torneo', escapeCSV(tourneyName)]);
  lines.push(['Criterio de Desempate', escapeCSV(tieRule)]);
  lines.push(['Fecha Exportacion', escapeCSV(new Date().toLocaleString())]);
  lines.push([]);
  lines.push(['POS', 'EQUIPO', 'PJ', 'PG', 'PP', 'PF', 'PC', 'DIF (PF-PC)', 'BASKET AVG (PF/PC)', 'PTS']);

  standings.forEach((s, idx) => {
    lines.push([
      idx + 1,
      escapeCSV(s.name),
      s.played,
      s.won,
      s.lost,
      s.pointsFor,
      s.pointsAgainst,
      s.diff,
      s.ratio,
      s.points
    ]);
  });

  const csvContent = lines.map(row => row.join(',')).join('\r\n');
  const filename = `tabla_posiciones_${cleanFilename(tourneyName)}.csv`;
  downloadCSV(filename, csvContent);
};

// 3. Exportar Tabla Consolidada General de Jugadores a CSV
window.exportConsolidatedStatsCSV = function() {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const allPlayers = store.getLeaders();

  if (allPlayers.length === 0) {
    alert('No hay estadísticas individuales registradas para exportar.');
    return;
  }

  const lines = [];
  lines.push(['HOOPMANAGER - TABLA CONSOLIDADA GENERAL DE ESTADÍSTICAS']);
  lines.push(['Torneo', escapeCSV(tourneyName)]);
  lines.push(['Total Jugadores Evaluados', allPlayers.length]);
  lines.push(['Fecha Exportacion', escapeCSV(new Date().toLocaleString())]);
  lines.push([]);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'POSICION', 'EQUIPO', 'PJ', 'PTS', 'PPG', 'REB', 'RPG', 'AST', 'APG', 'FP', 'FPG']);

  allPlayers.forEach((p, idx) => {
    lines.push([
      idx + 1,
      `#${p.number}`,
      escapeCSV(p.name),
      escapeCSV(p.position || '-'),
      escapeCSV(p.teamName),
      p.gamesPlayed,
      p.totalPoints,
      p.ppg,
      p.totalRebounds,
      p.rpg,
      p.totalAssists,
      p.apg,
      p.totalFouls,
      p.fpg
    ]);
  });

  const csvContent = lines.map(row => row.join(',')).join('\r\n');
  const filename = `estadisticas_consolidadas_${cleanFilename(tourneyName)}.csv`;
  downloadCSV(filename, csvContent);
};

// 4. Exportar Líderes por Categoría Específica a CSV
window.exportCategoryStatsCSV = function(catKey) {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const allPlayers = store.getLeaders();

  if (allPlayers.length === 0) {
    alert('No hay estadísticas individuales registradas para exportar.');
    return;
  }

  let catTitle = '';
  let statKey = '';
  let statLabel = '';
  let avgKey = '';
  let avgLabel = '';
  let sortFn = null;

  if (catKey === 'pts' || catKey === 'totalPoints') {
    catTitle = 'Máximos Anotadores (Puntos)';
    statKey = 'totalPoints';
    statLabel = 'PTS';
    avgKey = 'ppg';
    avgLabel = 'PPG';
    sortFn = (a, b) => b.totalPoints - a.totalPoints || b.ppg - a.ppg;
  } else if (catKey === 'reb' || catKey === 'totalRebounds') {
    catTitle = 'Líderes en Rebotes';
    statKey = 'totalRebounds';
    statLabel = 'REB';
    avgKey = 'rpg';
    avgLabel = 'RPG';
    sortFn = (a, b) => b.totalRebounds - a.totalRebounds || b.rpg - a.rpg;
  } else if (catKey === 'ast' || catKey === 'totalAssists') {
    catTitle = 'Líderes en Asistencias';
    statKey = 'totalAssists';
    statLabel = 'AST';
    avgKey = 'apg';
    avgLabel = 'APG';
    sortFn = (a, b) => b.totalAssists - a.totalAssists || b.apg - a.apg;
  } else if (catKey === 'fouls' || catKey === 'totalFouls') {
    catTitle = 'Faltas Personales';
    statKey = 'totalFouls';
    statLabel = 'FP';
    avgKey = 'fpg';
    avgLabel = 'FPG';
    sortFn = (a, b) => b.totalFouls - a.totalFouls || b.fpg - a.fpg;
  } else {
    exportConsolidatedStatsCSV();
    return;
  }

  const list = [...allPlayers]
    .filter(p => p[statKey] > 0 || p.gamesPlayed > 0)
    .sort(sortFn);

  const lines = [];
  lines.push([`HOOPMANAGER - LÍDERES INDIVIDUALES: ${escapeCSV(catTitle).toUpperCase()}`]);
  lines.push(['Torneo', escapeCSV(tourneyName)]);
  lines.push(['Categoría', escapeCSV(catTitle)]);
  lines.push(['Fecha Exportacion', escapeCSV(new Date().toLocaleString())]);
  lines.push([]);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'POSICION', 'EQUIPO', 'PJ', statLabel, avgLabel]);

  list.forEach((p, idx) => {
    lines.push([
      idx + 1,
      `#${p.number}`,
      escapeCSV(p.name),
      escapeCSV(p.position || '-'),
      escapeCSV(p.teamName),
      p.gamesPlayed,
      p[statKey],
      p[avgKey]
    ]);
  });

  const csvContent = lines.map(row => row.join(',')).join('\r\n');
  const filename = `estadisticas_lideres_${cleanFilename(catKey)}_${cleanFilename(tourneyName)}.csv`;
  downloadCSV(filename, csvContent);
};

// 5. Exportar Reporte Completo de Todas las Estadísticas a CSV
window.exportAllStatsCSV = function() {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const allPlayers = store.getLeaders();

  if (allPlayers.length === 0) {
    alert('No hay estadísticas registradas para exportar en este torneo.');
    return;
  }

  const lines = [];
  lines.push(['============================================================']);
  lines.push(['HOOPMANAGER - REPORTE COMPLETO DE TODAS LAS ESTADÍSTICAS']);
  lines.push(['============================================================']);
  lines.push(['Torneo', escapeCSV(tourneyName)]);
  lines.push(['Fecha de Generación', escapeCSV(new Date().toLocaleString())]);
  lines.push(['Total Jugadores Evaluados', allPlayers.length]);
  lines.push([]);

  // SECCIÓN 1: TABLA GENERAL CONSOLIDADA
  lines.push(['------------------------------------------------------------']);
  lines.push(['SECCIÓN 1: TABLA GENERAL CONSOLIDADA']);
  lines.push(['------------------------------------------------------------']);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'POSICION', 'EQUIPO', 'PJ', 'PTS', 'PPG', 'REB', 'RPG', 'AST', 'APG', 'FP', 'FPG']);
  allPlayers.forEach((p, idx) => {
    lines.push([
      idx + 1,
      `#${p.number}`,
      escapeCSV(p.name),
      escapeCSV(p.position || '-'),
      escapeCSV(p.teamName),
      p.gamesPlayed,
      p.totalPoints,
      p.ppg,
      p.totalRebounds,
      p.rpg,
      p.totalAssists,
      p.apg,
      p.totalFouls,
      p.fpg
    ]);
  });
  lines.push([]);

  // SECCIÓN 2: LÍDERES EN PUNTOS
  lines.push(['------------------------------------------------------------']);
  lines.push(['SECCIÓN 2: LÍDERES EN ANOTACIÓN (PUNTOS)']);
  lines.push(['------------------------------------------------------------']);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'EQUIPO', 'PJ', 'PTS', 'PPG']);
  const ptsList = [...allPlayers].filter(p => p.totalPoints > 0 || p.gamesPlayed > 0).sort((a,b) => b.totalPoints - a.totalPoints || b.ppg - a.ppg);
  ptsList.forEach((p, idx) => {
    lines.push([idx + 1, `#${p.number}`, escapeCSV(p.name), escapeCSV(p.teamName), p.gamesPlayed, p.totalPoints, p.ppg]);
  });
  lines.push([]);

  // SECCIÓN 3: LÍDERES EN REBOTES
  lines.push(['------------------------------------------------------------']);
  lines.push(['SECCIÓN 3: LÍDERES EN REBOTES']);
  lines.push(['------------------------------------------------------------']);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'EQUIPO', 'PJ', 'REB', 'RPG']);
  const rebList = [...allPlayers].filter(p => p.totalRebounds > 0 || p.gamesPlayed > 0).sort((a,b) => b.totalRebounds - a.totalRebounds || b.rpg - a.rpg);
  rebList.forEach((p, idx) => {
    lines.push([idx + 1, `#${p.number}`, escapeCSV(p.name), escapeCSV(p.teamName), p.gamesPlayed, p.totalRebounds, p.rpg]);
  });
  lines.push([]);

  // SECCIÓN 4: LÍDERES EN ASISTENCIAS
  lines.push(['------------------------------------------------------------']);
  lines.push(['SECCIÓN 4: LÍDERES EN ASISTENCIAS']);
  lines.push(['------------------------------------------------------------']);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'EQUIPO', 'PJ', 'AST', 'APG']);
  const astList = [...allPlayers].filter(p => p.totalAssists > 0 || p.gamesPlayed > 0).sort((a,b) => b.totalAssists - a.totalAssists || b.apg - a.apg);
  astList.forEach((p, idx) => {
    lines.push([idx + 1, `#${p.number}`, escapeCSV(p.name), escapeCSV(p.teamName), p.gamesPlayed, p.totalAssists, p.apg]);
  });
  lines.push([]);

  // SECCIÓN 5: FALTAS PERSONALES
  lines.push(['------------------------------------------------------------']);
  lines.push(['SECCIÓN 5: FALTAS PERSONALES']);
  lines.push(['------------------------------------------------------------']);
  lines.push(['POS', 'DORSAL', 'JUGADOR', 'EQUIPO', 'PJ', 'FP', 'FPG']);
  const foulsList = [...allPlayers].filter(p => p.totalFouls > 0 || p.gamesPlayed > 0).sort((a,b) => b.totalFouls - a.totalFouls || b.fpg - a.fpg);
  foulsList.forEach((p, idx) => {
    lines.push([idx + 1, `#${p.number}`, escapeCSV(p.name), escapeCSV(p.teamName), p.gamesPlayed, p.totalFouls, p.fpg]);
  });

  const csvContent = lines.map(row => row.join(',')).join('\r\n');
  const filename = `todas_las_estadisticas_${cleanFilename(tourneyName)}.csv`;
  downloadCSV(filename, csvContent);
};

// 6. Exportar Vista Actual según la categoría activa
window.exportCurrentStatsCSV = function() {
  if (activeStatsCategory === 'all') {
    exportAllStatsCSV();
  } else if (activeStatsCategory === 'pts') {
    exportCategoryStatsCSV('pts');
  } else if (activeStatsCategory === 'reb') {
    exportCategoryStatsCSV('reb');
  } else if (activeStatsCategory === 'ast') {
    exportCategoryStatsCSV('ast');
  } else if (activeStatsCategory === 'fouls') {
    exportCategoryStatsCSV('fouls');
  } else if (activeStatsCategory === 'table') {
    exportConsolidatedStatsCSV();
  } else {
    exportAllStatsCSV();
  }
};

// ==========================================
// PDF EXPORT HANDLERS (MATCH CONSOLE & STATS)
// ==========================================

function printNativeFallback(htmlContent, title) {
  const printWin = window.open('', '_blank');
  if (!printWin) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para ver o guardar el PDF.');
    return;
  }
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page { size: A4 portrait; margin: 8mm; }
        body { margin: 0; padding: 0; background: #fff; font-family: sans-serif; }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

window.exportMatchConsolePDF = async function(matchId) {
  const m = store.matches.find(item => item.id === matchId);
  if (!m) {
    alert('Partido no encontrado.');
    return;
  }

  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const home = store.teams.find(t => t.id === m.homeTeamId);
  const away = store.teams.find(t => t.id === m.awayTeamId);
  const homeName = home ? home.name : 'Local';
  const awayName = away ? away.name : 'Visitante';
  const homePlayers = store.players.filter(p => p.teamId === m.homeTeamId);
  const awayPlayers = store.players.filter(p => p.teamId === m.awayTeamId);

  // Verificar si la consola modal está abierta para capturar valores en vivo
  const isConsoleOpen = document.getElementById('q1-h') !== null && !document.getElementById('match-console-modal')?.classList.contains('hidden');

  let q1h = 0, q2h = 0, q3h = 0, q4h = 0, oth = 0;
  let q1a = 0, q2a = 0, q3a = 0, q4a = 0, ota = 0;
  let liveStatsMap = {};

  if (isConsoleOpen) {
    // Sincronizar y guardar automáticamente los cambios en la base de datos PostgreSQL
    await window.persistConsoleMatchData(matchId, false);
    showToastNotification('💾 Datos del partido sincronizados con PostgreSQL');

    q1h = parseInt(document.getElementById('q1-h')?.value) || 0;
    q2h = parseInt(document.getElementById('q2-h')?.value) || 0;
    q3h = parseInt(document.getElementById('q3-h')?.value) || 0;
    q4h = parseInt(document.getElementById('q4-h')?.value) || 0;
    oth = parseInt(document.getElementById('ot-h')?.value) || 0;

    q1a = parseInt(document.getElementById('q1-a')?.value) || 0;
    q2a = parseInt(document.getElementById('q2-a')?.value) || 0;
    q3a = parseInt(document.getElementById('q3-a')?.value) || 0;
    q4a = parseInt(document.getElementById('q4-a')?.value) || 0;
    ota = parseInt(document.getElementById('ot-a')?.value) || 0;

    document.querySelectorAll('.stat-input').forEach(input => {
      const pid = input.dataset.pid;
      const stat = input.dataset.stat;
      const val = parseInt(input.value) || 0;
      if (!liveStatsMap[pid]) liveStatsMap[pid] = { played: true, points: 0, rebounds: 0, assists: 0, fouls: 0 };
      liveStatsMap[pid][stat] = val;
    });

    document.querySelectorAll('.stat-input-played').forEach(chk => {
      const pid = chk.dataset.pid;
      if (!liveStatsMap[pid]) liveStatsMap[pid] = { played: true, points: 0, rebounds: 0, assists: 0, fouls: 0 };
      liveStatsMap[pid].played = chk.checked;
      if (!chk.checked) {
        liveStatsMap[pid].points = 0;
        liveStatsMap[pid].rebounds = 0;
        liveStatsMap[pid].assists = 0;
        liveStatsMap[pid].fouls = 0;
      }
    });
  } else {
    q1h = m.quarters?.q1?.home || 0;
    q2h = m.quarters?.q2?.home || 0;
    q3h = m.quarters?.q3?.home || 0;
    q4h = m.quarters?.q4?.home || 0;
    oth = m.quarters?.ot?.home || 0;

    q1a = m.quarters?.q1?.away || 0;
    q2a = m.quarters?.q2?.away || 0;
    q3a = m.quarters?.q3?.away || 0;
    q4a = m.quarters?.q4?.away || 0;
    ota = m.quarters?.ot?.away || 0;

    liveStatsMap = m.playerStats || m.boxScore || {};
  }

  const finalHomeScore = (q1h + q2h + q3h + q4h + oth) || m.homeScore || 0;
  const finalAwayScore = (q1a + q2a + q3a + q4a + ota) || m.awayScore || 0;
  const matchStatus = m.status === 'FINISHED' ? 'Finalizado' : 'Programado / En Curso';
  const filename = `box_score_j${m.round}_${cleanFilename(homeName)}_vs_${cleanFilename(awayName)}.pdf`;

  // Ordenar jugadores por dorsal
  const sortByNumber = (a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
  const sortedHome = [...homePlayers].sort(sortByNumber);
  const sortedAway = [...awayPlayers].sort(sortByNumber);

  // Totales y filas de estadísticas del equipo local
  let totHomePts = 0, totHomeReb = 0, totHomeAst = 0, totHomeFouls = 0;
  const homeRowsHtml = sortedHome.map((p, idx) => {
    const s = liveStatsMap[p.id] || {};
    const played = s.played !== false;
    const pts = played ? (s.points || 0) : 0;
    const reb = played ? (s.rebounds || 0) : 0;
    const ast = played ? (s.assists || 0) : 0;
    const fls = played ? (s.fouls || 0) : 0;
    totHomePts += pts;
    totHomeReb += reb;
    totHomeAst += ast;
    totHomeFouls += fls;
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const dnpTag = !played ? '<span style="display:inline-block; font-size:8px; font-weight:800; background:#f1f5f9; color:#64748b; padding:1px 4px; border-radius:3px; margin-left:5px; border:1px solid #cbd5e1;">DNP</span>' : '';
    return `
      <tr style="background:${bg}; opacity:${played ? '1' : '0.6'};">
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#475569;">#${p.number}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a;">${p.name}${dnpTag}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; color:#64748b; font-size:9.5px; font-weight:700;">${p.position || '-'}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:900; color:${played ? '#ea580c' : '#94a3b8'}; background:${played ? '#fff7ed' : 'transparent'}; font-size:11.5px;">${pts}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${played ? '#059669' : '#94a3b8'};">${reb}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${played ? '#0284c7' : '#94a3b8'};">${ast}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${played ? '#e11d48' : '#94a3b8'};">${fls}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="padding:8px; text-align:center; color:#94a3b8;">Sin jugadores registrados</td></tr>';

  // Totales y filas de estadísticas del equipo visitante
  let totAwayPts = 0, totAwayReb = 0, totAwayAst = 0, totAwayFouls = 0;
  const awayRowsHtml = sortedAway.map((p, idx) => {
    const s = liveStatsMap[p.id] || {};
    const played = s.played !== false;
    const pts = played ? (s.points || 0) : 0;
    const reb = played ? (s.rebounds || 0) : 0;
    const ast = played ? (s.assists || 0) : 0;
    const fls = played ? (s.fouls || 0) : 0;
    totAwayPts += pts;
    totAwayReb += reb;
    totAwayAst += ast;
    totAwayFouls += fls;
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const dnpTag = !played ? '<span style="display:inline-block; font-size:8px; font-weight:800; background:#f1f5f9; color:#64748b; padding:1px 4px; border-radius:3px; margin-left:5px; border:1px solid #cbd5e1;">DNP</span>' : '';
    return `
      <tr style="background:${bg}; opacity:${played ? '1' : '0.6'};">
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#475569;">#${p.number}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a;">${p.name}${dnpTag}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; color:#64748b; font-size:9.5px; font-weight:700;">${p.position || '-'}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:900; color:${played ? '#ea580c' : '#94a3b8'}; background:${played ? '#fff7ed' : 'transparent'}; font-size:11.5px;">${pts}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${played ? '#059669' : '#94a3b8'};">${reb}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${played ? '#0284c7' : '#94a3b8'};">${ast}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${played ? '#e11d48' : '#94a3b8'};">${fls}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="padding:8px; text-align:center; color:#94a3b8;">Sin jugadores registrados</td></tr>';

  // Calcular líderes individuales del partido (solo jugadores que disputaron el partido)
  const allMatchStats = [];
  sortedHome.forEach(p => {
    const s = liveStatsMap[p.id] || {};
    if (s.played !== false) {
      allMatchStats.push({ name: p.name, team: homeName, pts: s.points || 0, reb: s.rebounds || 0, ast: s.assists || 0 });
    }
  });
  sortedAway.forEach(p => {
    const s = liveStatsMap[p.id] || {};
    if (s.played !== false) {
      allMatchStats.push({ name: p.name, team: awayName, pts: s.points || 0, reb: s.rebounds || 0, ast: s.assists || 0 });
    }
  });
  const topScorer = [...allMatchStats].filter(s => s.pts > 0).sort((a, b) => b.pts - a.pts)[0] || null;
  const topRebounder = [...allMatchStats].filter(s => s.reb > 0).sort((a, b) => b.reb - a.reb)[0] || null;
  const topAssister = [...allMatchStats].filter(s => s.ast > 0).sort((a, b) => b.ast - a.ast)[0] || null;

  // Construcción de la plantilla HTML oficial del Box Score
  const boxScoreHtml = `
    <div style="font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif; color:#0f172a; background:#ffffff; width:720px; box-sizing:border-box; padding:18px 22px; line-height:1.25;">
      
      <!-- ENCABEZADO OFICIAL -->
      <div style="background:#0f172a; color:#ffffff; padding:12px 18px; border-radius:8px 8px 0 0; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #f97316;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:32px; line-height:1;">🏀</span>
          <div>
            <div style="font-size:19px; font-weight:900; letter-spacing:0.5px; color:#ffffff; line-height:1.1;">HOOPMANAGER</div>
            <div style="font-size:10.5px; font-weight:800; color:#f97316; letter-spacing:1px; text-transform:uppercase;">Planilla Oficial Box Score</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:800; color:#f8fafc;">${tourneyName}</div>
          <div style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:2px;">
            Jornada ${m.round} • ${m.date || 'Sin fecha'} ${m.time || ''} • ${m.venue || 'Cancha Principal'}
          </div>
        </div>
      </div>

      <!-- MARCADOR PRINCIPAL (SCOREBOARD) -->
      <div style="background:#f8fafc; border-left:1px solid #cbd5e1; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; padding:12px 18px; display:flex; justify-content:space-between; align-items:center;">
        <!-- Equipo Local -->
        <div style="display:flex; align-items:center; gap:10px; flex:1;">
          <span style="font-size:30px;">${home?.logo || '🏀'}</span>
          <div>
            <div style="font-size:9.5px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">LOCAL</div>
            <div style="font-size:16px; font-weight:900; color:#0f172a; line-height:1.1;">${homeName}</div>
          </div>
        </div>

        <!-- Puntuación Final y Estado -->
        <div style="text-align:center; padding:0 18px;">
          <div style="font-size:30px; font-weight:900; color:#0f172a; letter-spacing:2px; line-height:1;">
            ${finalHomeScore} <span style="font-size:22px; color:#94a3b8; font-weight:400; margin:0 4px;">–</span> ${finalAwayScore}
          </div>
          <div style="margin-top:4px;">
            <span style="display:inline-block; background:${m.status === 'FINISHED' ? '#10b981' : '#f97316'}; color:#ffffff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">
              ${matchStatus}
            </span>
          </div>
        </div>

        <!-- Equipo Visitante -->
        <div style="display:flex; align-items:center; gap:10px; flex:1; justify-content:flex-end; text-align:right;">
          <div>
            <div style="font-size:9.5px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">VISITANTE</div>
            <div style="font-size:16px; font-weight:900; color:#0f172a; line-height:1.1;">${awayName}</div>
          </div>
          <span style="font-size:30px;">${away?.logo || '🏀'}</span>
        </div>
      </div>

      <!-- MARCADOR POR CUARTOS (LINE SCORE) -->
      <div style="margin-top:10px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse; text-align:center; font-size:11px;">
          <thead>
            <tr style="background:#f1f5f9; color:#475569; font-weight:800; font-size:9.5px; text-transform:uppercase;">
              <th style="padding:6px 10px; border-right:1px solid #cbd5e1; text-align:left;">Equipo</th>
              <th style="padding:6px 6px; border-right:1px solid #cbd5e1; width:52px;">Q1</th>
              <th style="padding:6px 6px; border-right:1px solid #cbd5e1; width:52px;">Q2</th>
              <th style="padding:6px 6px; border-right:1px solid #cbd5e1; width:52px;">Q3</th>
              <th style="padding:6px 6px; border-right:1px solid #cbd5e1; width:52px;">Q4</th>
              <th style="padding:6px 6px; border-right:1px solid #cbd5e1; width:52px;">OT</th>
              <th style="padding:6px 10px; width:70px; background:#0f172a; color:#ffffff; font-weight:900;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-top:1px solid #cbd5e1;">
              <td style="padding:6px 10px; border-right:1px solid #cbd5e1; text-align:left; font-weight:800; color:#0f172a;">${homeName} (LOC)</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q1h}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q2h}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q3h}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q4h}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; color:${oth > 0 ? '#0f172a' : '#94a3b8'}; font-weight:600;">${oth > 0 ? oth : '-'}</td>
              <td style="padding:6px 10px; font-weight:900; font-size:12.5px; color:#ea580c; background:#fff7ed;">${finalHomeScore}</td>
            </tr>
            <tr style="border-top:1px solid #cbd5e1; background:#f8fafc;">
              <td style="padding:6px 10px; border-right:1px solid #cbd5e1; text-align:left; font-weight:800; color:#0f172a;">${awayName} (VIS)</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q1a}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q2a}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q3a}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; font-weight:600;">${q4a}</td>
              <td style="padding:6px 6px; border-right:1px solid #cbd5e1; color:${ota > 0 ? '#0f172a' : '#94a3b8'}; font-weight:600;">${ota > 0 ? ota : '-'}</td>
              <td style="padding:6px 10px; font-weight:900; font-size:12.5px; color:#ea580c; background:#fff7ed;">${finalAwayScore}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BOX SCORE: EQUIPO LOCAL -->
      <div style="margin-top:12px; page-break-inside:avoid; break-inside:avoid;">
        <div style="background:#1e293b; color:#ffffff; padding:6px 12px; font-weight:800; font-size:11px; display:flex; justify-content:space-between; align-items:center; border-radius:6px 6px 0 0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>${home?.logo || '🏀'}</span>
            <span style="color:#f97316; font-size:9px; text-transform:uppercase; letter-spacing:0.5px;">[LOCAL]</span>
            <span style="letter-spacing:0.3px;">${homeName.toUpperCase()}</span>
          </div>
          <div style="font-size:10px; color:#cbd5e1;">TOTAL PUNTOS: <strong style="color:#ffffff; font-size:12px; margin-left:3px;">${finalHomeScore}</strong></div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead>
            <tr style="background:#f1f5f9; color:#334155; font-size:9.5px; text-transform:uppercase;">
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:36px; text-align:center;">DOR</th>
              <th style="padding:5px 8px; border:1px solid #cbd5e1; text-align:left;">Jugador</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:44px; text-align:center;">POS</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#ea580c; font-weight:900; background:#fff7ed;">PTS</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#059669; font-weight:800;">REB</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#0284c7; font-weight:800;">AST</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#e11d48; font-weight:800;">FP</th>
            </tr>
          </thead>
          <tbody>
            ${homeRowsHtml}
            <tr style="background:#e2e8f0; font-weight:900; color:#0f172a; border-top:2px solid #94a3b8;">
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left; font-weight:900;">TOTALES LOCAL</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#ea580c; font-size:11px; background:#fed7aa;">${totHomePts > 0 ? totHomePts : finalHomeScore}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#059669; font-size:11px;">${totHomeReb}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#0284c7; font-size:11px;">${totHomeAst}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#e11d48; font-size:11px;">${totHomeFouls}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BOX SCORE: EQUIPO VISITANTE -->
      <div style="margin-top:12px; page-break-inside:avoid; break-inside:avoid;">
        <div style="background:#1e293b; color:#ffffff; padding:6px 12px; font-weight:800; font-size:11px; display:flex; justify-content:space-between; align-items:center; border-radius:6px 6px 0 0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>${away?.logo || '🏀'}</span>
            <span style="color:#f97316; font-size:9px; text-transform:uppercase; letter-spacing:0.5px;">[VISITANTE]</span>
            <span style="letter-spacing:0.3px;">${awayName.toUpperCase()}</span>
          </div>
          <div style="font-size:10px; color:#cbd5e1;">TOTAL PUNTOS: <strong style="color:#ffffff; font-size:12px; margin-left:3px;">${finalAwayScore}</strong></div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead>
            <tr style="background:#f1f5f9; color:#334155; font-size:9.5px; text-transform:uppercase;">
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:36px; text-align:center;">DOR</th>
              <th style="padding:5px 8px; border:1px solid #cbd5e1; text-align:left;">Jugador</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:44px; text-align:center;">POS</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#ea580c; font-weight:900; background:#fff7ed;">PTS</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#059669; font-weight:800;">REB</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#0284c7; font-weight:800;">AST</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#e11d48; font-weight:800;">FP</th>
            </tr>
          </thead>
          <tbody>
            ${awayRowsHtml}
            <tr style="background:#e2e8f0; font-weight:900; color:#0f172a; border-top:2px solid #94a3b8;">
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left; font-weight:900;">TOTALES VISITANTE</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#ea580c; font-size:11px; background:#fed7aa;">${totAwayPts > 0 ? totAwayPts : finalAwayScore}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#059669; font-size:11px;">${totAwayReb}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#0284c7; font-size:11px;">${totAwayAst}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:#e11d48; font-size:11px;">${totAwayFouls}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- LÍDERES DESTACADOS DEL ENCUENTRO -->
      <div style="margin-top:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; page-break-inside:avoid; break-inside:avoid;">
        <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; color:#475569; margin-bottom:6px; letter-spacing:0.5px;">
          ⭐ Líderes Destacados del Partido
        </div>
        <div style="display:flex; justify-content:space-between; gap:8px;">
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:9px; font-weight:800; color:#ea580c; text-transform:uppercase;">🔥 Máximo Anotador</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topScorer ? topScorer.name : 'Pendiente'}</div>
            <div style="font-size:9px; color:#64748b;">${topScorer ? topScorer.team : '-'}</div>
            <div style="font-size:13px; font-weight:900; color:#ea580c; margin-top:1px;">${topScorer ? `${topScorer.pts} <span style="font-size:9px; font-weight:700;">PTS</span>` : '-'}</div>
          </div>
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:9px; font-weight:800; color:#059669; text-transform:uppercase;">💪 Líder en Rebotes</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topRebounder ? topRebounder.name : 'Pendiente'}</div>
            <div style="font-size:9px; color:#64748b;">${topRebounder ? topRebounder.team : '-'}</div>
            <div style="font-size:13px; font-weight:900; color:#059669; margin-top:1px;">${topRebounder ? `${topRebounder.reb} <span style="font-size:9px; font-weight:700;">REB</span>` : '-'}</div>
          </div>
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:9px; font-weight:800; color:#0284c7; text-transform:uppercase;">🎯 Líder en Asistencias</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topAssister ? topAssister.name : 'Pendiente'}</div>
            <div style="font-size:9px; color:#64748b;">${topAssister ? topAssister.team : '-'}</div>
            <div style="font-size:13px; font-weight:900; color:#0284c7; margin-top:1px;">${topAssister ? `${topAssister.ast} <span style="font-size:9px; font-weight:700;">AST</span>` : '-'}</div>
          </div>
        </div>
      </div>

      <!-- PIE DE PÁGINA OFICIAL -->
      <div style="margin-top:14px; padding-top:10px; border-top:1px dashed #cbd5e1; text-align:center; font-size:8.5px; color:#94a3b8; font-weight:600; page-break-inside:avoid; break-inside:avoid;">
        HoopManager Basketball Platform • Planilla Oficial Box Score • Documento emitido el ${new Date().toLocaleString()}
      </div>

    </div>
  `;

  // Renderizar y capturar mediante html2pdf
  const wrapper = document.createElement('div');
  wrapper.id = 'match-pdf-export-wrapper';
  wrapper.style.cssText = 'position:absolute; top:0; left:0; width:720px; background:#ffffff; z-index:999999; margin:0; padding:0;';
  wrapper.innerHTML = boxScoreHtml;
  document.body.appendChild(wrapper);

  try {
    if (window.html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      await window.html2pdf().set(opt).from(wrapper.firstElementChild).save();
    } else {
      printNativeFallback(boxScoreHtml, filename);
    }
  } catch (err) {
    console.error('Error generando PDF con html2pdf, recurriendo a impresión nativa:', err);
    printNativeFallback(boxScoreHtml, filename);
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

// ==========================================
// 2. EXPORTAR TABLA OFICIAL DE POSICIONES A PDF (ESTILO BASKETBALL DOC)
// ==========================================
window.exportStandingsPDF = async function() {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const standings = store.getStandings();

  if (standings.length === 0) {
    alert('No hay posiciones registradas para exportar en este torneo.');
    return;
  }

  const isDiff = (activeTourney?.tie_breaker_type || 'diff') === 'diff';
  const tieRule = isDiff ? 'Diferencia de Puntos (PF - PC)' : 'Basket Average / Ratio (PF / PC)';
  const tieRuleShort = isDiff ? 'Diferencia (PF - PC)' : 'Basket Avg (PF / PC)';

  const totMatchesCount = Math.round(standings.reduce((acc, s) => acc + s.played, 0) / 2);
  const totPointsFor = standings.reduce((acc, s) => acc + s.pointsFor, 0);
  const totPointsAgainst = standings.reduce((acc, s) => acc + s.pointsAgainst, 0);
  const totWon = standings.reduce((acc, s) => acc + s.won, 0);
  const totLost = standings.reduce((acc, s) => acc + s.lost, 0);
  const totPlayedSum = standings.reduce((acc, s) => acc + s.played, 0);
  const totDiff = totPointsFor - totPointsAgainst;
  const totPointsSum = standings.reduce((acc, s) => acc + s.points, 0);
  const avgPpg = totMatchesCount > 0 ? (totPointsFor / totMatchesCount).toFixed(1) : '0.0';

  const leader = standings[0];

  const rankBadgeHtml = (idx) => {
    if (idx === 0) return `<span style="display:inline-block; background:#fef08a; color:#854d0e; border:1px solid #facc15; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥇 1°</span>`;
    if (idx === 1) return `<span style="display:inline-block; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥈 2°</span>`;
    if (idx === 2) return `<span style="display:inline-block; background:#ffedd5; color:#9a3412; border:1px solid #fdba74; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥉 3°</span>`;
    return `<span style="display:inline-block; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; font-weight:700; padding:1px 6px; border-radius:4px; font-size:9px;">#${idx + 1}</span>`;
  };

  const rowsHtml = standings.map((s, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const diffColor = s.diff > 0 ? '#059669' : s.diff < 0 ? '#e11d48' : '#64748b';
    const diffText = s.diff > 0 ? `+${s.diff}` : `${s.diff}`;
    return `
      <tr style="background:${bg};">
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center;">${rankBadgeHtml(idx)}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a; text-align:left;">
          <span style="margin-right:5px; font-size:13px;">${s.logo || '🏀'}</span>
          <span>${s.name}</span>
          <small style="color:#64748b; font-weight:600; margin-left:4px;">(${s.shortName || ''})</small>
        </td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:600; color:#475569;">${s.played}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#059669; background:#f0fdf4;">${s.won}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#e11d48; background:#fef2f2;">${s.lost}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:600; color:#334155;">${s.pointsFor}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:600; color:#334155;">${s.pointsAgainst}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${diffColor};">${diffText}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#0284c7;">${s.ratio}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:900; color:#ea580c; background:#fff7ed; font-size:12px;">${s.points}</td>
      </tr>
    `;
  }).join('');

  const reportHtml = `
    <div style="font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif; color:#0f172a; background:#ffffff; width:720px; box-sizing:border-box; padding:18px 22px; line-height:1.25;">
      
      <!-- ENCABEZADO OFICIAL -->
      <div style="background:#0f172a; color:#ffffff; padding:12px 18px; border-radius:8px 8px 0 0; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #f97316;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:32px; line-height:1;">🏆</span>
          <div>
            <div style="font-size:19px; font-weight:900; letter-spacing:0.5px; color:#ffffff; line-height:1.1;">HOOPMANAGER</div>
            <div style="font-size:10.5px; font-weight:800; color:#f97316; letter-spacing:1px; text-transform:uppercase;">Tabla Oficial de Posiciones & Basket Average</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:800; color:#f8fafc;">${tourneyName}</div>
          <div style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:2px;">
            ${standings.length} Equipos • Criterio: ${tieRuleShort}
          </div>
        </div>
      </div>

      <!-- BANNER INFORMATIVO RESUMEN -->
      <div style="background:#f8fafc; border-left:1px solid #cbd5e1; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:8px;">
        <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 10px; display:flex; align-items:center; gap:8px;">
          <span style="font-size:24px;">${leader?.logo || '🥇'}</span>
          <div>
            <div style="font-size:8.5px; font-weight:800; color:#ea580c; text-transform:uppercase;">Puntero del Torneo</div>
            <div style="font-size:11px; font-weight:900; color:#0f172a; white-space:nowrap;">${leader?.name || '-'}</div>
            <div style="font-size:9px; color:#64748b; font-weight:700;">${leader?.won || 0} PG - ${leader?.lost || 0} PP • ${leader?.points || 0} Pts</div>
          </div>
        </div>

        <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 10px; text-align:center;">
          <div style="font-size:8.5px; font-weight:800; color:#0284c7; text-transform:uppercase;">Estadísticas Globales</div>
          <div style="font-size:13px; font-weight:900; color:#0f172a; margin-top:1px;">${totMatchesCount} <span style="font-size:9px; font-weight:700; color:#64748b;">PARTIDOS</span></div>
          <div style="font-size:9px; color:#64748b; font-weight:700;">${totPointsFor} pts (${avgPpg} pts/partido)</div>
        </div>

        <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 10px; text-align:right;">
          <div style="font-size:8.5px; font-weight:800; color:#059669; text-transform:uppercase;">Regla de Puntuación</div>
          <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:1px;">Victoria: +${activeTourney?.win_points || 2} pts | Derrota: +${activeTourney?.loss_points || 1} pt</div>
          <div style="font-size:9px; color:#64748b; font-weight:700;">Desempate: ${tieRuleShort}</div>
        </div>
      </div>

      <!-- TABLA PRINCIPAL DE POSICIONES -->
      <div style="page-break-inside:avoid; break-inside:avoid;">
        <div style="background:#1e293b; color:#ffffff; padding:6px 12px; font-weight:800; font-size:11px; display:flex; justify-content:space-between; align-items:center; border-radius:6px 6px 0 0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>📋</span>
            <span style="letter-spacing:0.3px;">CLASIFICACIÓN GENERAL OFICIAL</span>
          </div>
          <div style="font-size:10px; color:#cbd5e1;">CRITERIO: <strong style="color:#f97316;">${tieRule.toUpperCase()}</strong></div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead>
            <tr style="background:#f1f5f9; color:#334155; font-size:9.5px; text-transform:uppercase; font-weight:800;">
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:38px; text-align:center;">POS</th>
              <th style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left;">Equipo</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:36px; text-align:center;">PJ</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:36px; text-align:center; color:#059669;">PG</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:36px; text-align:center; color:#e11d48;">PP</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:44px; text-align:center;">PF</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:44px; text-align:center;">PC</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:58px; text-align:center;">DIF</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:58px; text-align:center; color:#0284c7;">AVG</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:48px; text-align:center; color:#ea580c; background:#fed7aa; font-weight:900;">PTS</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- NOTA INFORMATIVA DE NOMENCLATURA -->
      <div style="margin-top:10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:7px 12px; font-size:9px; color:#64748b; text-align:center; page-break-inside:avoid; break-inside:avoid;">
        PJ: Partidos Jugados • PG: Ganados • PP: Perdidos • PF: Puntos a Favor • PC: Puntos en Contra • DIF: Dif. Puntos • AVG: Basket Average • PTS: Puntos
      </div>

      <!-- PIE DE PÁGINA OFICIAL -->
      <div style="margin-top:14px; padding-top:10px; border-top:1px dashed #cbd5e1; text-align:center; font-size:8.5px; color:#94a3b8; font-weight:600; page-break-inside:avoid; break-inside:avoid;">
        HoopManager Basketball Platform • Tabla Oficial de Posiciones • Documento emitido el ${new Date().toLocaleString()}
      </div>

    </div>
  `;

  const filename = `tabla_posiciones_${cleanFilename(tourneyName)}.pdf`;

  const wrapper = document.createElement('div');
  wrapper.id = 'standings-pdf-export-wrapper';
  wrapper.style.cssText = 'position:absolute; top:0; left:0; width:720px; background:#ffffff; z-index:999999; margin:0; padding:0;';
  wrapper.innerHTML = reportHtml;
  document.body.appendChild(wrapper);

  try {
    if (window.html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await window.html2pdf().set(opt).from(wrapper.firstElementChild).save();
    } else {
      printNativeFallback(reportHtml, filename);
    }
  } catch (err) {
    console.error('Error generando PDF de posiciones con html2pdf, recurriendo a impresión nativa:', err);
    printNativeFallback(reportHtml, filename);
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

// ==========================================
// 3. EXPORTAR REPORTE OFICIAL DE ESTADÍSTICAS INDIVIDUALES A PDF (ESTILO BASKETBALL DOC)
// ==========================================
window.exportStatsLeaderboardPDF = async function() {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const allPlayers = store.getLeaders();

  if (allPlayers.length === 0) {
    alert('No hay estadísticas registradas para exportar en este torneo.');
    return;
  }

  // Top 10 de cada categoría
  const ptsList = [...allPlayers].filter(p => p.totalPoints > 0 || p.gamesPlayed > 0).sort((a, b) => b.totalPoints - a.totalPoints || b.ppg - a.ppg).slice(0, 10);
  const rebList = [...allPlayers].filter(p => p.totalRebounds > 0 || p.gamesPlayed > 0).sort((a, b) => b.totalRebounds - a.totalRebounds || b.rpg - a.rpg).slice(0, 10);
  const astList = [...allPlayers].filter(p => p.totalAssists > 0 || p.gamesPlayed > 0).sort((a, b) => b.totalAssists - a.totalAssists || b.apg - a.apg).slice(0, 10);
  const foulsList = [...allPlayers].filter(p => p.totalFouls > 0 || p.gamesPlayed > 0).sort((a, b) => b.totalFouls - a.totalFouls || b.fpg - a.fpg).slice(0, 10);

  // Ordenar tabla consolidada y limitar a los primeros 10
  const sortedPlayers = [...allPlayers].sort((a, b) => b.totalPoints - a.totalPoints || b.ppg - a.ppg).slice(0, 10);

  const topScorer = ptsList[0] || null;
  const topRebounder = rebList[0] || null;
  const topAssister = astList[0] || null;
  const topFouls = foulsList[0] || null;

  // Totales acumulados del Top 10
  const totPJ = sortedPlayers.reduce((a, p) => a + p.gamesPlayed, 0);
  const totPTS = sortedPlayers.reduce((a, p) => a + p.totalPoints, 0);
  const totREB = sortedPlayers.reduce((a, p) => a + p.totalRebounds, 0);
  const totAST = sortedPlayers.reduce((a, p) => a + p.totalAssists, 0);
  const totFP = sortedPlayers.reduce((a, p) => a + p.totalFouls, 0);

  const avgPPG = totPJ > 0 ? (totPTS / totPJ).toFixed(1) : '0.0';
  const avgRPG = totPJ > 0 ? (totREB / totPJ).toFixed(1) : '0.0';
  const avgAPG = totPJ > 0 ? (totAST / totPJ).toFixed(1) : '0.0';
  const avgFPG = totPJ > 0 ? (totFP / totPJ).toFixed(1) : '0.0';

  const rankBadgeHtml = (idx) => {
    if (idx === 0) return `<span style="display:inline-block; background:#fef08a; color:#854d0e; border:1px solid #facc15; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥇 1°</span>`;
    if (idx === 1) return `<span style="display:inline-block; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥈 2°</span>`;
    if (idx === 2) return `<span style="display:inline-block; background:#ffedd5; color:#9a3412; border:1px solid #fdba74; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥉 3°</span>`;
    return `<span style="display:inline-block; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; font-weight:700; padding:1px 6px; border-radius:4px; font-size:9px;">#${idx + 1}</span>`;
  };

  const rowsHtml = sortedPlayers.map((p, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    return `
      <tr style="background:${bg};">
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;">${rankBadgeHtml(idx)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#475569;">#${p.number}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a; text-align:left;">${p.name}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; font-weight:600; color:#334155; text-align:left;">
          <span style="margin-right:3px;">${p.teamLogo || '🏀'}</span>${p.teamName}
        </td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-size:9px; color:#64748b; font-weight:700;">${p.position || '-'}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600; color:#475569;">${p.gamesPlayed}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:900; color:#ea580c; background:#fff7ed; font-size:11px;">${p.totalPoints}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:700; color:#ea580c;">${p.ppg}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#059669;">${p.totalRebounds}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; color:#059669;">${p.rpg}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#0284c7;">${p.totalAssists}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; color:#0284c7;">${p.apg}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#e11d48;">${p.totalFouls}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; color:#e11d48;">${p.fpg}</td>
      </tr>
    `;
  }).join('');

  const renderCategoryMiniTable = (catTitle, catEmoji, catColor, catList, valKey, valLabel, avgValKey, avgValLabel) => `
    <div style="flex:1; min-width:330px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; background:#ffffff; page-break-inside:avoid; break-inside:avoid;">
      <div style="background:#1e293b; color:#ffffff; padding:5px 10px; font-size:10px; font-weight:800; display:flex; justify-content:space-between; align-items:center; border-top:3px solid ${catColor};">
        <div style="display:flex; align-items:center; gap:5px;">
          <span>${catEmoji}</span>
          <span>${catTitle.toUpperCase()} (TOP 10)</span>
        </div>
        <span style="font-size:9px; color:${catColor}; font-weight:800;">${valLabel}</span>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:9px;">
        <thead>
          <tr style="background:#f1f5f9; color:#475569; font-size:8.5px; text-transform:uppercase;">
            <th style="padding:4px 3px; border:1px solid #cbd5e1; width:28px; text-align:center;">POS</th>
            <th style="padding:4px 3px; border:1px solid #cbd5e1; width:24px; text-align:center;">#</th>
            <th style="padding:4px 6px; border:1px solid #cbd5e1; text-align:left;">Jugador</th>
            <th style="padding:4px 6px; border:1px solid #cbd5e1; text-align:left;">Equipo</th>
            <th style="padding:4px 3px; border:1px solid #cbd5e1; width:26px; text-align:center;">PJ</th>
            <th style="padding:4px 4px; border:1px solid #cbd5e1; width:38px; text-align:center; color:${catColor}; font-weight:900;">${valLabel}</th>
            <th style="padding:4px 4px; border:1px solid #cbd5e1; width:34px; text-align:center; color:${catColor}; font-weight:700;">${avgValLabel}</th>
          </tr>
        </thead>
        <tbody>
          ${catList.map((p, idx) => `
            <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding:3px 2px; border:1px solid #cbd5e1; text-align:center;">${rankBadgeHtml(idx)}</td>
              <td style="padding:3px 2px; border:1px solid #cbd5e1; text-align:center; font-weight:700; color:#64748b;">#${p.number}</td>
              <td style="padding:3px 5px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:95px;">${p.name}</td>
              <td style="padding:3px 5px; border:1px solid #cbd5e1; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:85px;">${p.teamLogo || ''} ${p.teamName}</td>
              <td style="padding:3px 2px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${p.gamesPlayed}</td>
              <td style="padding:3px 3px; border:1px solid #cbd5e1; text-align:center; font-weight:900; color:${catColor}; background:${catColor}11;">${p[valKey]}</td>
              <td style="padding:3px 3px; border:1px solid #cbd5e1; text-align:center; font-weight:700; color:${catColor};">${p[avgValKey]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const reportHtml = `
    <div style="font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif; color:#0f172a; background:#ffffff; width:720px; box-sizing:border-box; padding:18px 22px; line-height:1.25;">
      
      <!-- ENCABEZADO OFICIAL -->
      <div style="background:#0f172a; color:#ffffff; padding:12px 18px; border-radius:8px 8px 0 0; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #f97316;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:32px; line-height:1;">📊</span>
          <div>
            <div style="font-size:19px; font-weight:900; letter-spacing:0.5px; color:#ffffff; line-height:1.1;">HOOPMANAGER</div>
            <div style="font-size:10.5px; font-weight:800; color:#f97316; letter-spacing:1px; text-transform:uppercase;">Reporte Oficial de Estadísticas Individuales (Top 10)</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:800; color:#f8fafc;">${tourneyName}</div>
          <div style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:2px;">
            Top 10 Jugadores por Categoría
          </div>
        </div>
      </div>

      <!-- LÍDERES DESTACADOS DEL TORNEO -->
      <div style="background:#f8fafc; border-left:1px solid #cbd5e1; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; padding:8px 12px; margin-bottom:12px; page-break-inside:avoid; break-inside:avoid;">
        <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; color:#475569; margin-bottom:6px; letter-spacing:0.5px;">
          ⭐ Líderes Destacados del Torneo
        </div>
        <div style="display:flex; justify-content:space-between; gap:8px;">
          <!-- Máximo Anotador -->
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:8.5px; font-weight:800; color:#ea580c; text-transform:uppercase;">🔥 Máximo Anotador</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topScorer ? topScorer.name : 'Pendiente'}</div>
            <div style="font-size:8.5px; color:#64748b;">${topScorer ? `${topScorer.teamLogo || ''} ${topScorer.teamName}` : '-'}</div>
            <div style="font-size:12.5px; font-weight:900; color:#ea580c; margin-top:1px;">${topScorer ? `${topScorer.totalPoints} <span style="font-size:8.5px; font-weight:700;">PTS</span>` : '-'}</div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${topScorer ? `${topScorer.ppg} PPG` : ''}</div>
          </div>

          <!-- Líder en Rebotes -->
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:8.5px; font-weight:800; color:#059669; text-transform:uppercase;">💪 Líder en Rebotes</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topRebounder ? topRebounder.name : 'Pendiente'}</div>
            <div style="font-size:8.5px; color:#64748b;">${topRebounder ? `${topRebounder.teamLogo || ''} ${topRebounder.teamName}` : '-'}</div>
            <div style="font-size:12.5px; font-weight:900; color:#059669; margin-top:1px;">${topRebounder ? `${topRebounder.totalRebounds} <span style="font-size:8.5px; font-weight:700;">REB</span>` : '-'}</div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${topRebounder ? `${topRebounder.rpg} RPG` : ''}</div>
          </div>

          <!-- Líder en Asistencias -->
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:8.5px; font-weight:800; color:#0284c7; text-transform:uppercase;">🎯 Líder en Asistencias</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topAssister ? topAssister.name : 'Pendiente'}</div>
            <div style="font-size:8.5px; color:#64748b;">${topAssister ? `${topAssister.teamLogo || ''} ${topAssister.teamName}` : '-'}</div>
            <div style="font-size:12.5px; font-weight:900; color:#0284c7; margin-top:1px;">${topAssister ? `${topAssister.totalAssists} <span style="font-size:8.5px; font-weight:700;">AST</span>` : '-'}</div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${topAssister ? `${topAssister.apg} APG` : ''}</div>
          </div>

          <!-- Líder en Faltas -->
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:8.5px; font-weight:800; color:#e11d48; text-transform:uppercase;">⚠️ Control de Faltas</div>
            <div style="font-size:10.5px; font-weight:800; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topFouls ? topFouls.name : 'Pendiente'}</div>
            <div style="font-size:8.5px; color:#64748b;">${topFouls ? `${topFouls.teamLogo || ''} ${topFouls.teamName}` : '-'}</div>
            <div style="font-size:12.5px; font-weight:900; color:#e11d48; margin-top:1px;">${topFouls ? `${topFouls.totalFouls} <span style="font-size:8.5px; font-weight:700;">FP</span>` : '-'}</div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${topFouls ? `${topFouls.fpg} FPG` : ''}</div>
          </div>
        </div>
      </div>

      <!-- TABLA GENERAL CONSOLIDADA (TOP 10) -->
      <div style="margin-bottom:12px; page-break-inside:avoid; break-inside:avoid;">
        <div style="background:#1e293b; color:#ffffff; padding:6px 12px; font-weight:800; font-size:11px; display:flex; justify-content:space-between; align-items:center; border-radius:6px 6px 0 0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>📋</span>
            <span style="letter-spacing:0.3px;">TABLA GENERAL CONSOLIDADA (TOP 10 JUGADORES)</span>
          </div>
          <div style="font-size:10px; color:#cbd5e1;">TOTAL EVALUADOS: <strong style="color:#f97316;">${sortedPlayers.length}</strong></div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
          <thead>
            <tr style="background:#f1f5f9; color:#334155; font-size:9px; text-transform:uppercase; font-weight:800;">
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:34px; text-align:center;">POS</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:30px; text-align:center;">DOR</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; text-align:left;">Jugador</th>
              <th style="padding:5px 6px; border:1px solid #cbd5e1; text-align:left;">Equipo</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:36px; text-align:center;">POS</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:30px; text-align:center;">PJ</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:44px; text-align:center; color:#ea580c; background:#fff7ed; font-weight:900;">PTS</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:40px; text-align:center; color:#ea580c; font-weight:800;">PPG</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:40px; text-align:center; color:#059669; font-weight:800;">REB</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:38px; text-align:center; color:#059669;">RPG</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:40px; text-align:center; color:#0284c7; font-weight:800;">AST</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:38px; text-align:center; color:#0284c7;">APG</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:36px; text-align:center; color:#e11d48; font-weight:800;">FP</th>
              <th style="padding:5px 4px; border:1px solid #cbd5e1; width:36px; text-align:center; color:#e11d48;">FPG</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="background:#e2e8f0; font-weight:900; color:#0f172a; border-top:2px solid #94a3b8;">
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:left; font-weight:900;">TOTALES Y PROMEDIOS (TOP 10)</td>
              <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:left;">-</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center;">${totPJ}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#ea580c; background:#fed7aa; font-size:11px;">${totPTS}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#ea580c;">${avgPPG}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#059669; font-size:11px;">${totREB}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#059669;">${avgRPG}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#0284c7; font-size:11px;">${totAST}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#0284c7;">${avgAPG}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#e11d48; font-size:11px;">${totFP}</td>
              <td style="padding:5px 4px; border:1px solid #cbd5e1; text-align:center; color:#e11d48;">${avgFPG}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- RANKINGS OFICIALES TOP 10 POR CATEGORÍA -->
      <div style="margin-top:12px; page-break-inside:avoid; break-inside:avoid;">
        <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; color:#475569; margin-bottom:6px; letter-spacing:0.5px;">
          📊 Rankings Oficiales Top 10 por Categorías
        </div>
        <div style="display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap;">
          ${renderCategoryMiniTable('Líderes en Puntos', '🏀', '#ea580c', ptsList, 'totalPoints', 'PTS', 'ppg', 'PPG')}
          ${renderCategoryMiniTable('Líderes en Rebotes', '🛡️', '#059669', rebList, 'totalRebounds', 'REB', 'rpg', 'RPG')}
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${renderCategoryMiniTable('Líderes en Asistencias', '🎯', '#0284c7', astList, 'totalAssists', 'AST', 'apg', 'APG')}
          ${renderCategoryMiniTable('Control de Faltas', '⚠️', '#e11d48', foulsList, 'totalFouls', 'FP', 'fpg', 'FPG')}
        </div>
      </div>

      <!-- PIE DE PÁGINA OFICIAL -->
      <div style="margin-top:14px; padding-top:10px; border-top:1px dashed #cbd5e1; text-align:center; font-size:8.5px; color:#94a3b8; font-weight:600; page-break-inside:avoid; break-inside:avoid;">
        HoopManager Basketball Platform • Reporte Oficial de Estadísticas Individuales (Top 10) • Documento emitido el ${new Date().toLocaleString()}
      </div>

    </div>
  `;

  const filename = `reporte_estadisticas_${cleanFilename(tourneyName)}.pdf`;

  const wrapper = document.createElement('div');
  wrapper.id = 'stats-pdf-export-wrapper';
  wrapper.style.cssText = 'position:absolute; top:0; left:0; width:720px; background:#ffffff; z-index:999999; margin:0; padding:0;';
  wrapper.innerHTML = reportHtml;
  document.body.appendChild(wrapper);

  try {
    if (window.html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await window.html2pdf().set(opt).from(wrapper.firstElementChild).save();
    } else {
      printNativeFallback(reportHtml, filename);
    }
  } catch (err) {
    console.error('Error generando PDF de estadísticas con html2pdf, recurriendo a impresión nativa:', err);
    printNativeFallback(reportHtml, filename);
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

// ==========================================
// 4. EXPORTAR LÍDERES POR CATEGORÍA ESPECÍFICA A PDF
// ==========================================
window.exportCategoryStatsPDF = async function(catKey) {
  const activeTourney = store.getActiveTournament();
  const tourneyName = activeTourney ? activeTourney.name : 'Torneo';
  const allPlayers = store.getLeaders();

  if (allPlayers.length === 0) {
    alert('No hay estadísticas individuales registradas para exportar.');
    return;
  }

  const categoryConfigs = {
    pts: {
      title: 'Líderes Oficiales en Anotación (Puntos)',
      emoji: '🏀',
      color: '#ea580c',
      statKey: 'totalPoints',
      statLabel: 'PTS',
      avgKey: 'ppg',
      avgLabel: 'PPG',
      subLabel: 'PUNTOS TOTALES'
    },
    reb: {
      title: 'Líderes Oficiales en Rebotes',
      emoji: '🛡️',
      color: '#059669',
      statKey: 'totalRebounds',
      statLabel: 'REB',
      avgKey: 'rpg',
      avgLabel: 'RPG',
      subLabel: 'REBOTES TOTALES'
    },
    ast: {
      title: 'Líderes Oficiales en Asistencias',
      emoji: '🎯',
      color: '#0284c7',
      statKey: 'totalAssists',
      statLabel: 'AST',
      avgKey: 'apg',
      avgLabel: 'APG',
      subLabel: 'ASISTENCIAS TOTALES'
    },
    fouls: {
      title: 'Control Oficial de Faltas Personales',
      emoji: '⚠️',
      color: '#e11d48',
      statKey: 'totalFouls',
      statLabel: 'FP',
      avgKey: 'fpg',
      avgLabel: 'FPG',
      subLabel: 'FALTAS COMETIDAS'
    }
  };

  const config = categoryConfigs[catKey] || categoryConfigs.pts;
  const list = [...allPlayers]
    .filter(p => p[config.statKey] > 0 || p.gamesPlayed > 0)
    .sort((a, b) => b[config.statKey] - a[config.statKey] || b[config.avgKey] - a[config.avgKey])
    .slice(0, 10);

  if (list.length === 0) {
    alert(`No hay registros de jugadores para la categoría ${config.title}.`);
    return;
  }

  const rankBadgeHtml = (idx) => {
    if (idx === 0) return `<span style="display:inline-block; background:#fef08a; color:#854d0e; border:1px solid #facc15; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥇 1°</span>`;
    if (idx === 1) return `<span style="display:inline-block; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥈 2°</span>`;
    if (idx === 2) return `<span style="display:inline-block; background:#ffedd5; color:#9a3412; border:1px solid #fdba74; font-weight:800; padding:1px 6px; border-radius:4px; font-size:9px;">🥉 3°</span>`;
    return `<span style="display:inline-block; background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; font-weight:700; padding:1px 6px; border-radius:4px; font-size:9px;">#${idx + 1}</span>`;
  };

  const top1 = list[0] || null;
  const top2 = list[1] || null;
  const top3 = list[2] || null;

  const totStat = list.reduce((acc, p) => acc + (p[config.statKey] || 0), 0);
  const totGames = list.reduce((acc, p) => acc + (p.gamesPlayed || 0), 0);
  const avgStatOverall = totGames > 0 ? (totStat / totGames).toFixed(1) : '0.0';

  const rowsHtml = list.map((p, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    return `
      <tr style="background:${bg};">
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center;">${rankBadgeHtml(idx)}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:#475569;">#${p.number}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1; font-weight:700; color:#0f172a; text-align:left;">${p.name}</td>
        <td style="padding:5px 8px; border:1px solid #cbd5e1; font-weight:600; color:#334155; text-align:left;">
          <span style="margin-right:4px;">${p.teamLogo || '🏀'}</span>${p.teamName}
        </td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-size:9.5px; color:#64748b; font-weight:700;">${p.position || '-'}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:600; color:#475569;">${p.gamesPlayed}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:900; color:${config.color}; font-size:12px; background:${config.color}11;">${p[config.statKey]}</td>
        <td style="padding:5px 6px; border:1px solid #cbd5e1; text-align:center; font-weight:800; color:${config.color};">${p[config.avgKey]}</td>
      </tr>
    `;
  }).join('');

  const reportHtml = `
    <div style="font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif; color:#0f172a; background:#ffffff; width:720px; box-sizing:border-box; padding:18px 22px; line-height:1.25;">
      
      <!-- ENCABEZADO OFICIAL -->
      <div style="background:#0f172a; color:#ffffff; padding:12px 18px; border-radius:8px 8px 0 0; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid ${config.color};">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:32px; line-height:1;">${config.emoji}</span>
          <div>
            <div style="font-size:19px; font-weight:900; letter-spacing:0.5px; color:#ffffff; line-height:1.1;">HOOPMANAGER</div>
            <div style="font-size:10.5px; font-weight:800; color:${config.color}; letter-spacing:1px; text-transform:uppercase;">${config.title}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:800; color:#f8fafc;">${tourneyName}</div>
          <div style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:2px;">
            Top 10 Jugadores Clasificados
          </div>
        </div>
      </div>

      <!-- PODIO DE LÍDERES (TOP 3) -->
      <div style="background:#f8fafc; border-left:1px solid #cbd5e1; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; padding:10px 14px; margin-bottom:12px;">
        <div style="font-size:9px; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">
          🏆 Podio Oficial de la Categoría
        </div>
        <div style="display:flex; justify-content:space-between; gap:8px;">
          <!-- 1° Lugar -->
          <div style="flex:1; background:#ffffff; border:2px solid #facc15; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:9px; font-weight:800; color:#854d0e; text-transform:uppercase;">🥇 1° Lugar</div>
            <div style="font-size:11px; font-weight:900; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${top1 ? top1.name : '-'}</div>
            <div style="font-size:8.5px; color:#64748b;">${top1 ? `#${top1.number} • ${top1.teamName}` : '-'}</div>
            <div style="font-size:13px; font-weight:900; color:${config.color}; margin-top:2px;">
              ${top1 ? `${top1[config.statKey]} <span style="font-size:9px; font-weight:700;">${config.statLabel}</span>` : '-'}
            </div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${top1 ? `${top1[config.avgKey]} ${config.avgLabel}` : ''}</div>
          </div>

          <!-- 2° Lugar -->
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:9px; font-weight:800; color:#475569; text-transform:uppercase;">🥈 2° Lugar</div>
            <div style="font-size:11px; font-weight:900; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${top2 ? top2.name : '-'}</div>
            <div style="font-size:8.5px; color:#64748b;">${top2 ? `#${top2.number} • ${top2.teamName}` : '-'}</div>
            <div style="font-size:13px; font-weight:900; color:${config.color}; margin-top:2px;">
              ${top2 ? `${top2[config.statKey]} <span style="font-size:9px; font-weight:700;">${config.statLabel}</span>` : '-'}
            </div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${top2 ? `${top2[config.avgKey]} ${config.avgLabel}` : ''}</div>
          </div>

          <!-- 3° Lugar -->
          <div style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; text-align:center;">
            <div style="font-size:9px; font-weight:800; color:#9a3412; text-transform:uppercase;">🥉 3° Lugar</div>
            <div style="font-size:11px; font-weight:900; color:#0f172a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${top3 ? top3.name : '-'}</div>
            <div style="font-size:8.5px; color:#64748b;">${top3 ? `#${top3.number} • ${top3.teamName}` : '-'}</div>
            <div style="font-size:13px; font-weight:900; color:${config.color}; margin-top:2px;">
              ${top3 ? `${top3[config.statKey]} <span style="font-size:9px; font-weight:700;">${config.statLabel}</span>` : '-'}
            </div>
            <div style="font-size:8.5px; color:#64748b; font-weight:700;">${top3 ? `${top3[config.avgKey]} ${config.avgLabel}` : ''}</div>
          </div>
        </div>
      </div>

      <!-- TABLA DETALLADA DE LA CATEGORÍA -->
      <div style="page-break-inside:avoid; break-inside:avoid;">
        <div style="background:#1e293b; color:#ffffff; padding:6px 12px; font-weight:800; font-size:11px; display:flex; justify-content:space-between; align-items:center; border-radius:6px 6px 0 0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>${config.emoji}</span>
            <span style="letter-spacing:0.3px;">RANKING OFICIAL (TOP 10): ${config.title.toUpperCase()}</span>
          </div>
          <div style="font-size:10px; color:#cbd5e1;">MÉTRICA: <strong style="color:${config.color};">${config.subLabel}</strong></div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead>
            <tr style="background:#f1f5f9; color:#334155; font-size:9.5px; text-transform:uppercase; font-weight:800;">
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:38px; text-align:center;">POS</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:34px; text-align:center;">DOR</th>
              <th style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left;">Jugador</th>
              <th style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left;">Equipo</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:38px; text-align:center;">POS</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:36px; text-align:center;">PJ</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:65px; text-align:center; color:${config.color}; background:${config.color}15;">${config.statLabel} TOTAL</th>
              <th style="padding:6px 6px; border:1px solid #cbd5e1; width:60px; text-align:center; color:${config.color};">${config.avgLabel} PROM</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="background:#e2e8f0; font-weight:900; color:#0f172a; border-top:2px solid #94a3b8;">
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left; font-weight:900;">TOTALES TOP 10</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; text-align:left;">-</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">-</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center;">${totGames}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:${config.color}; font-size:12px; background:${config.color}22;">${totStat}</td>
              <td style="padding:6px 6px; border:1px solid #cbd5e1; text-align:center; color:${config.color};">${avgStatOverall}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PIE DE PÁGINA OFICIAL -->
      <div style="margin-top:14px; padding-top:10px; border-top:1px dashed #cbd5e1; text-align:center; font-size:8.5px; color:#94a3b8; font-weight:600; page-break-inside:avoid; break-inside:avoid;">
        HoopManager Basketball Platform • Reporte Oficial de Categoría • Documento emitido el ${new Date().toLocaleString()}
      </div>

    </div>
  `;

  const filename = `lideres_${cleanFilename(catKey)}_${cleanFilename(tourneyName)}.pdf`;

  const wrapper = document.createElement('div');
  wrapper.id = 'category-pdf-export-wrapper';
  wrapper.style.cssText = 'position:absolute; top:0; left:0; width:720px; background:#ffffff; z-index:999999; margin:0; padding:0;';
  wrapper.innerHTML = reportHtml;
  document.body.appendChild(wrapper);

  try {
    if (window.html2pdf) {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      await window.html2pdf().set(opt).from(wrapper.firstElementChild).save();
    } else {
      printNativeFallback(reportHtml, filename);
    }
  } catch (err) {
    console.error('Error generando PDF de categoría con html2pdf, recurriendo a impresión nativa:', err);
    printNativeFallback(reportHtml, filename);
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
};

// ==========================================
// 5. EXPORTAR VISTA ACTUAL DE ESTADÍSTICAS A PDF
// ==========================================
window.exportCurrentStatsPDF = function() {
  if (activeStatsCategory === 'all' || activeStatsCategory === 'table') {
    exportStatsLeaderboardPDF();
  } else if (activeStatsCategory === 'pts') {
    exportCategoryStatsPDF('pts');
  } else if (activeStatsCategory === 'reb') {
    exportCategoryStatsPDF('reb');
  } else if (activeStatsCategory === 'ast') {
    exportCategoryStatsPDF('ast');
  } else if (activeStatsCategory === 'fouls') {
    exportCategoryStatsPDF('fouls');
  } else {
    exportStatsLeaderboardPDF();
  }
};

// ==========================================
// AUTHENTICATION & SESSION MANAGEMENT
// ==========================================
const AUTH_TOKEN_KEY = 'hoopmanager_auth_token';
const AUTH_USER_KEY = 'hoopmanager_auth_user';
let currentUser = null;

async function checkAuthAndInit() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    showLoginView();
    return;
  }

  try {
    const res = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        currentUser = data.user || { username: 'admin' };
        showAppView();
        initApp();
        return;
      }
    }
  } catch (err) {
    console.warn('Error verificando sesión con backend:', err);
  }

  // Token inválido o expirado
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  showLoginView();
}

function showLoginView() {
  const loginView = document.getElementById('login-view');
  const appWrapper = document.getElementById('app-wrapper');
  if (loginView) loginView.classList.remove('hidden');
  if (appWrapper) appWrapper.classList.add('hidden');
}

function showAppView() {
  const loginView = document.getElementById('login-view');
  const appWrapper = document.getElementById('app-wrapper');
  const navUsername = document.getElementById('nav-username');

  if (loginView) loginView.classList.add('hidden');
  if (appWrapper) appWrapper.classList.remove('hidden');
  if (navUsername && currentUser) {
    navUsername.textContent = currentUser.username || 'admin';
  }
}

window.handleLoginSubmit = async function(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');
  const btnSubmit = document.getElementById('btn-login-submit');
  const btnLabel = document.getElementById('btn-login-label');
  const btnSpinner = document.getElementById('btn-login-spinner');

  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      if (errorText) errorText.textContent = 'Por favor ingresa usuario y contraseña.';
    }
    return;
  }

  if (btnSubmit) btnSubmit.disabled = true;
  if (btnLabel) btnLabel.textContent = 'Verificando...';
  if (btnSpinner) btnSpinner.classList.remove('hidden');
  if (errorAlert) errorAlert.classList.add('hidden');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ username: data.username, role: data.role }));
      currentUser = { username: data.username, role: data.role };

      showAppView();
      initApp();
    } else {
      if (errorAlert) {
        errorAlert.classList.remove('hidden');
        if (errorText) errorText.textContent = data.error || 'Credenciales incorrectas.';
      }
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  } catch (err) {
    console.error('Error durante login:', err);
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      if (errorText) errorText.textContent = 'Error de conexión con el servidor. Intenta de nuevo.';
    }
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnLabel) btnLabel.textContent = 'Iniciar Sesión ➔';
    if (btnSpinner) btnSpinner.classList.add('hidden');
  }
};

window.togglePasswordVisibility = function() {
  const pwd = document.getElementById('login-password');
  const btn = document.getElementById('btn-toggle-pwd');
  if (!pwd) return;
  if (pwd.type === 'password') {
    pwd.type = 'text';
    if (btn) btn.textContent = 'Ocultar';
  } else {
    pwd.type = 'password';
    if (btn) btn.textContent = 'Mostrar';
  }
};

window.logout = async function() {
  if (!confirm('¿Deseas cerrar tu sesión administrativa?')) {
    return;
  }
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
    } catch (e) {
      // Ignorar error de red al salir
    }
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  currentUser = null;

  showLoginView();
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errorAlert = document.getElementById('login-error-alert');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (errorAlert) errorAlert.classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', checkAuthAndInit);
