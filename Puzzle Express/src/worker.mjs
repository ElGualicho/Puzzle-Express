const SCORE_LIMIT = 10;

const LEVELS = {
  easy: { baseScore: 300 },
  medium: { baseScore: 600 },
  hard: { baseScore: 900 }
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (url.pathname === "/api/scores") {
      return handleScores(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "Not found" }, 404);
  }
};

async function handleScores(request, env) {
  if (!env.DB) {
    return json({ error: "Database binding DB is missing" }, 500);
  }

  if (request.method === "GET") {
    const scores = await readTopScores(env, new URL(request.url));
    return json({ scores });
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const score = normalizeIncomingScore(body);
    if (!score) {
      return json({ error: "Invalid score payload" }, 400);
    }

    await env.DB.prepare(`
      INSERT OR IGNORE INTO scores (
        id,
        client_entry_id,
        game,
        player_name,
        score,
        level,
        moves,
        hints,
        time_seconds,
        image_id,
        site_id,
        device_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
      .bind(
        crypto.randomUUID(),
        score.clientEntryId,
        "puzzle-express",
        score.playerName,
        score.score,
        score.level,
        score.moves,
        score.hints,
        score.timeSeconds,
        score.imageId,
        score.siteId,
        score.deviceId
      )
      .run();

    const savedScore = await env.DB.prepare(`
      SELECT
        id,
        client_entry_id,
        game,
        player_name,
        score,
        level,
        moves,
        hints,
        time_seconds,
        image_id,
        site_id,
        device_id,
        created_at
      FROM scores
      WHERE client_entry_id = ?
      LIMIT 1
    `)
      .bind(score.clientEntryId)
      .first();

    const scores = await readTopScores(env, new URL(request.url));
    return json({ score: toClientScore(savedScore), scores }, 201);
  }

  return json({ error: "Method not allowed" }, 405);
}

async function readTopScores(env, url) {
  const limit = clampNumber(url.searchParams.get("limit"), 1, 50, SCORE_LIMIT);
  const siteId = sanitizeIdentifier(url.searchParams.get("site") || "", "");
  const scope = url.searchParams.get("scope");

  const statement = scope === "site" && siteId
    ? env.DB.prepare(`
        SELECT
          id,
          client_entry_id,
          game,
          player_name,
          score,
          level,
          moves,
          hints,
          time_seconds,
          image_id,
          site_id,
          device_id,
          created_at
        FROM scores
        WHERE game = ? AND site_id = ?
        ORDER BY score DESC, time_seconds ASC, created_at ASC
        LIMIT ?
      `).bind("puzzle-express", siteId, limit)
    : env.DB.prepare(`
        SELECT
          id,
          client_entry_id,
          game,
          player_name,
          score,
          level,
          moves,
          hints,
          time_seconds,
          image_id,
          site_id,
          device_id,
          created_at
        FROM scores
        WHERE game = ?
        ORDER BY score DESC, time_seconds ASC, created_at ASC
        LIMIT ?
      `).bind("puzzle-express", limit);

  const result = await statement.all();
  return (result.results || []).map(toClientScore);
}

function normalizeIncomingScore(body) {
  const level = String(body.level || "");
  if (!LEVELS[level]) {
    return null;
  }

  const moves = clampNumber(body.moves, 0, 10000, 0);
  const hints = clampNumber(body.hints, 0, 10000, 0);
  const timeSeconds = clampNumber(body.timeSeconds, 0, 86400, 0);

  return {
    clientEntryId: sanitizeIdentifier(body.clientEntryId || crypto.randomUUID(), crypto.randomUUID(), 120),
    playerName: sanitizePlayerName(body.playerName),
    score: calculateScore(level, moves, hints, timeSeconds),
    level,
    moves,
    hints,
    timeSeconds,
    imageId: sanitizeIdentifier(body.imageId || "", "", 80),
    siteId: sanitizeIdentifier(body.siteId || "default", "default", 80),
    deviceId: sanitizeIdentifier(body.deviceId || "unknown", "unknown", 120)
  };
}

function calculateScore(level, moves, hints, timeSeconds) {
  const timePenalty = Math.floor(timeSeconds / 5);
  const hintPenalty = hints * 50;
  const movePenalty = moves * 10;
  const noHintBonus = hints === 0 ? 100 : 0;

  return Math.max(LEVELS[level].baseScore - movePenalty - timePenalty - hintPenalty + noHintBonus, 50);
}

function toClientScore(row) {
  return {
    id: row.id,
    clientEntryId: row.client_entry_id,
    game: row.game,
    playerName: row.player_name,
    score: row.score,
    level: row.level,
    moves: row.moves,
    hints: row.hints,
    timeSeconds: row.time_seconds,
    imageId: row.image_id,
    siteId: row.site_id,
    deviceId: row.device_id,
    createdAt: row.created_at
  };
}

function sanitizePlayerName(value) {
  const name = String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14);

  return name || "Joueur";
}

function sanitizeIdentifier(value, fallback, maxLength = 80) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);

  return normalized || fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  return {
    ...JSON_HEADERS,
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
