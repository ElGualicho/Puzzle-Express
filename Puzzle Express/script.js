"use strict";

const LEVELS = {
  easy: {
    label: "Facile",
    shortLabel: "4 pièces",
    rows: 2,
    cols: 2,
    baseScore: 300,
    description: "Pour découvrir tranquillement le jeu."
  },
  medium: {
    label: "Moyen",
    shortLabel: "6 pièces",
    rows: 2,
    cols: 3,
    baseScore: 600,
    description: "Le niveau conseillé pour une partie courte."
  },
  hard: {
    label: "Difficile",
    shortLabel: "9 pièces",
    rows: 3,
    cols: 3,
    baseScore: 900,
    description: "Un peu plus de défi, toujours sans stress."
  }
};

const LEVEL_ORDER = Object.keys(LEVELS);

const PUZZLE_IMAGES = [
  {
    id: "chattest-puzzle",
    title: "Chat test",
    src: "assets/puzzle/chattest_puzzle.webp",
    alt: "Image de test pour le puzzle"
  },
  {
    id: "jardin-calme",
    title: "Jardin calme",
    src: "assets/puzzle/jardin-calme.svg",
    alt: "Un jardin coloré avec une maison, un arbre, un banc et des fleurs"
  },
  {
    id: "bouquet-lumineux",
    title: "Bouquet lumineux",
    src: "assets/puzzle/bouquet-lumineux.svg",
    alt: "Un bouquet de fleurs colorées posé devant une fenêtre"
  },
  {
    id: "marche-doux",
    title: "Marché doux",
    src: "assets/puzzle/marche-doux.svg",
    alt: "Une scène de marché avec des étals, des fruits et des façades colorées"
  }
];

const STORAGE_KEY = "puzzle-express-scores-v1";
const PENDING_SCORES_KEY = "puzzle-express-pending-scores-v1";
const DEVICE_ID_KEY = "puzzle-express-device-id-v1";
const SITE_ID_KEY = "puzzle-express-site-id-v1";
const SCORE_API_URL = "/api/scores";
const SCORE_LIMIT = 10;

const app = document.querySelector("#app");
const announcer = document.querySelector("#announcer");
const modelDialog = document.querySelector("#modelDialog");
const modelDialogTitle = document.querySelector("#modelDialogTitle");
const modelDialogImage = document.querySelector("#modelDialogImage");

const state = {
  view: "menu",
  levelKey: "medium",
  image: null,
  board: [],
  selectedCell: null,
  moves: 0,
  hints: 0,
  elapsedSeconds: 0,
  startedAt: 0,
  timerId: null,
  score: 0,
  scoreSaved: false,
  scoreSaveStatus: "",
  playerName: "",
  levelComplete: false,
  highlightCell: null,
  scores: []
};

app.addEventListener("click", handleAppClick);
app.addEventListener("submit", handleAppSubmit);

renderMenu();
void initScores();

function handleAppClick(event) {
  const piece = event.target.closest("[data-cell-index]");
  if (piece) {
    handlePieceClick(Number(piece.dataset.cellIndex));
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  event.preventDefault();
  const { action, level } = actionButton.dataset;

  if (action === "start") {
    startGame(level);
  }

  if (action === "show-model") {
    openModelDialog();
  }

  if (action === "hint") {
    useHint();
  }

  if (action === "next-level") {
    startNextLevel();
  }

  if (action === "finish") {
    finishGame();
  }

  if (action === "restart") {
    startGame(state.levelKey, state.image);
  }

  if (action === "quit" || action === "home") {
    renderMenu();
  }

  if (action === "replay") {
    startGame(state.levelKey);
  }

  if (action === "clear-scores") {
    clearScores();
  }

  if (action === "scores") {
    renderScoresView();
  }
}

async function handleAppSubmit(event) {
  if (event.target.id !== "scoreForm") {
    return;
  }

  event.preventDefault();
  const formData = new FormData(event.target);
  const cleanName = cleanPlayerName(formData.get("playerName"));
  const submitButton = event.target.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Envoi...";
  }

  const saveResult = await saveScore({
    game: "puzzle-express",
    playerName: cleanName,
    score: state.score,
    level: state.levelKey,
    moves: state.moves,
    hints: state.hints,
    timeSeconds: state.elapsedSeconds,
    imageId: state.image?.id || "",
    siteId: getSiteId(),
    deviceId: getDeviceId(),
    date: new Date().toISOString()
  });

  state.playerName = cleanName;
  state.scoreSaved = true;
  state.scoreSaveStatus = saveResult.synced ? "synced" : "pending";
  announce(saveResult.synced ? `Score partagé enregistré pour ${cleanName}.` : `Score enregistré sur cette borne pour ${cleanName}.`);
  renderFinished();
}

function renderMenu() {
  stopTimer();
  state.view = "menu";
  state.selectedCell = null;
  state.levelComplete = false;
  state.highlightCell = null;
  setAppView("menu");

  app.innerHTML = `
    <section class="screen start-view" aria-labelledby="startTitle">
      <img class="brand-logo" src="assets/logo_castelnau.webp" alt="Castelnau-le-Lez">
      <div class="intro-copy">
        <h1 id="startTitle" aria-label="Puzzle Express"><span>Puzzle</span><span>Express</span></h1>
        <p class="lead">Reconstituez l'image en échangeant deux morceaux par deux clics</p>
      </div>

      <div class="screen">
        <div class="level-grid" aria-label="Choix du niveau">
          ${Object.entries(LEVELS).map(([key, level]) => renderLevelCard(key, level)).join("")}
        </div>
        <button class="score-open-button" type="button" data-action="scores">Tableau des scores</button>
      </div>
    </section>
  `;

  app.focus({ preventScroll: true });
}

function renderLevelCard(key, level) {
  return `
    <button class="level-card" type="button" data-action="start" data-level="${key}">
      <span class="piece-count">${level.shortLabel}</span>
      <span>
        <strong>${level.label}</strong>
      </span>
    </button>
  `;
}

function renderScoresView(shouldRefresh = true) {
  stopTimer();
  state.view = "scores";
  state.selectedCell = null;
  state.levelComplete = false;
  state.highlightCell = null;
  setAppView("scores");

  app.innerHTML = `
    <section class="screen scores-view" aria-labelledby="scoresTitle">
      <img class="brand-logo" src="assets/logo_castelnau.webp" alt="Castelnau-le-Lez">
      <div class="intro-copy">
        <h1 id="scoresTitle">Tableau des scores</h1>
      </div>
      ${renderScorePanel(readScores(), false)}
      <button class="button secondary scores-back-button" type="button" data-action="home">Retour à l'accueil</button>
    </section>
  `;

  app.focus({ preventScroll: true });

  if (shouldRefresh) {
    void refreshScores().then((updated) => {
      if (updated && state.view === "scores") {
        renderScoresView(false);
      }
    });
  }
}

function startGame(levelKey, preferredImage = null) {
  stopTimer();
  const level = LEVELS[levelKey] || LEVELS.medium;
  const pieceCount = level.rows * level.cols;

  state.view = "play";
  state.levelKey = levelKey;
  state.image = preferredImage || pickRequestedImage() || pickRandomImage();
  state.board = createShuffledBoard(pieceCount);
  state.selectedCell = null;
  state.moves = 0;
  state.hints = 0;
  state.elapsedSeconds = 0;
  state.startedAt = Date.now();
  state.score = 0;
  state.scoreSaved = false;
  state.scoreSaveStatus = "";
  state.playerName = "";
  state.levelComplete = false;
  state.highlightCell = null;

  renderGame();
  startTimer();
  announce(`Partie ${level.label} lancée.`);
}

function renderGame() {
  const level = LEVELS[state.levelKey];
  const isLevelComplete = state.levelComplete;
  const helpText = isLevelComplete
    ? "Image reconstituée."
    : "Sélectionnez deux morceaux pour les échanger.";
  setAppView("play");

  app.innerHTML = `
    <section class="screen play-view" aria-labelledby="playTitle">
      <div class="play-top">
        <div>
          <p class="eyebrow">${escapeHtml(level.label)} · ${escapeHtml(state.image.title)}</p>
          <h1 id="playTitle" class="play-title">Puzzle Express</h1>
        </div>
        <div class="stat-strip" aria-label="Informations de partie">
          ${renderMetric("Coups", state.moves, "movesValue")}
          ${renderMetric("Temps", formatTime(state.elapsedSeconds), "timeValue")}
          ${renderMetric("Indices", state.hints, "hintsValue")}
        </div>
      </div>

      <div class="game-layout">
        <section class="board-section" aria-label="Zone de jeu">
          <div class="board-toolbar">
            <p class="help-text">${helpText}</p>
            ${isLevelComplete ? "" : `
              <div class="action-row">
                <button class="button secondary" type="button" data-action="show-model">Voir le modèle</button>
                <button class="button warm" type="button" data-action="hint">Indice</button>
              </div>
            `}
          </div>

          ${isLevelComplete ? `
            <figure class="completed-puzzle" aria-label="${escapeHtml(state.image.alt)}">
              <img src="${state.image.src}" alt="${escapeHtml(state.image.alt)}">
            </figure>
          ` : `
            <div
              class="puzzle-board"
              style="--rows: ${level.rows}; --cols: ${level.cols};"
              aria-label="Puzzle en ${level.rows} lignes et ${level.cols} colonnes"
            >
              ${state.board.map((pieceIndex, cellIndex) => renderPiece(pieceIndex, cellIndex, level)).join("")}
            </div>
          `}

          ${isLevelComplete ? `
            <div class="action-row completion-actions">
              <button class="button secondary next-level-button" type="button" data-action="next-level">Niveau suivant</button>
              <button class="button primary finish-score-button" type="button" data-action="finish">Terminer</button>
            </div>
          ` : `
            <div class="action-row">
              <button class="button secondary" type="button" data-action="restart">Recommencer</button>
              <button class="button ghost" type="button" data-action="quit">Retour à l'accueil</button>
            </div>
          `}
        </section>

        <aside class="model-panel" aria-label="Image modèle">
          <div class="panel-heading">
            <h2>Modèle</h2>
          </div>
          <img src="${state.image.src}" alt="${escapeHtml(state.image.alt)}">
          <p class="panel-copy">Gardez l'image complète sous les yeux si cela aide.</p>
        </aside>
      </div>
    </section>
  `;

  app.focus({ preventScroll: true });
}

function renderMetric(label, value, id) {
  return `
    <div class="metric">
      <p class="metric-label">${label}</p>
      <strong id="${id}">${value}</strong>
    </div>
  `;
}

function renderPiece(pieceIndex, cellIndex, level) {
  const row = Math.floor(pieceIndex / level.cols);
  const col = pieceIndex % level.cols;
  const x = level.cols === 1 ? 0 : (col / (level.cols - 1)) * 100;
  const y = level.rows === 1 ? 0 : (row / (level.rows - 1)) * 100;
  const selectedClass = state.selectedCell === cellIndex ? " is-selected" : "";
  const correctClass = pieceIndex === cellIndex ? " is-correct" : "";
  const hintedClass = state.highlightCell === cellIndex ? " is-hinted" : "";
  const lockedClass = state.levelComplete ? " is-locked" : "";
  const label = state.levelComplete
    ? `Pièce ${cellIndex + 1}. Puzzle terminé.`
    : `Pièce ${cellIndex + 1}. ${selectedClass ? "Sélectionnée." : "Cliquer pour sélectionner."}`;
  const disabledAttribute = state.levelComplete ? " disabled" : "";

  return `
    <button
      class="puzzle-piece${selectedClass}${correctClass}${hintedClass}${lockedClass}"
      type="button"
      data-cell-index="${cellIndex}"
      aria-label="${label}"
      aria-pressed="${state.selectedCell === cellIndex}"
      style="--piece-image: url('${state.image.src}'); --bg-size-x: ${level.cols * 100}%; --bg-size-y: ${level.rows * 100}%; --bg-x: ${x}%; --bg-y: ${y}%;"
      ${disabledAttribute}
    ></button>
  `;
}

function handlePieceClick(cellIndex) {
  if (state.view !== "play" || state.levelComplete) {
    return;
  }

  if (state.selectedCell === null) {
    state.selectedCell = cellIndex;
    renderGame();
    return;
  }

  if (state.selectedCell === cellIndex) {
    state.selectedCell = null;
    renderGame();
    return;
  }

  swapPieces(state.selectedCell, cellIndex);
  state.moves += 1;
  state.selectedCell = null;

  if (isComplete()) {
    completeLevel();
    return;
  }

  renderGame();
}

function swapPieces(firstCell, secondCell) {
  const firstPiece = state.board[firstCell];
  state.board[firstCell] = state.board[secondCell];
  state.board[secondCell] = firstPiece;
}

function useHint() {
  if (state.view !== "play" || state.levelComplete) {
    return;
  }

  const wrongCell = state.board.findIndex((pieceIndex, cellIndex) => pieceIndex !== cellIndex);
  if (wrongCell === -1) {
    return;
  }

  const correctPieceCell = state.board.indexOf(wrongCell);
  swapPieces(wrongCell, correctPieceCell);
  state.moves += 1;
  state.hints += 1;
  state.selectedCell = null;
  state.highlightCell = wrongCell;

  if (isComplete()) {
    completeLevel();
    return;
  }

  renderGame();
  window.setTimeout(() => {
    if (state.view !== "play") {
      return;
    }
    state.highlightCell = null;
    renderGame();
  }, 1200);
}

function completeLevel() {
  stopTimer();
  state.levelComplete = true;
  state.selectedCell = null;
  state.highlightCell = null;
  state.elapsedSeconds = Math.max(state.elapsedSeconds, Math.floor((Date.now() - state.startedAt) / 1000));
  announce("Puzzle terminé. Vous pouvez passer au niveau suivant ou terminer.");
  renderGame();
}

function startNextLevel() {
  startGame(getNextLevelKey(state.levelKey));
}

function getNextLevelKey(levelKey) {
  const currentIndex = LEVEL_ORDER.indexOf(levelKey);
  const nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, LEVEL_ORDER.length - 1);
  return LEVEL_ORDER[nextIndex];
}

function finishGame() {
  stopTimer();
  state.view = "finished";
  if (!state.levelComplete) {
    state.elapsedSeconds = Math.max(state.elapsedSeconds, Math.floor((Date.now() - state.startedAt) / 1000));
  }
  state.score = calculateScore();
  state.levelComplete = false;
  announce("Bravo, puzzle terminé.");
  renderFinished();
}

function renderFinished() {
  const level = LEVELS[state.levelKey];
  const noHintBonus = state.hints === 0 ? "Oui" : "Non";
  setAppView("finished");

  app.innerHTML = `
    <section class="screen finish-view" aria-labelledby="finishTitle">
      <div class="finish-copy finish-hero">
        <p class="eyebrow">Puzzle réussi</p>
        <h1 id="finishTitle">Bravo, image reconstituée !</h1>
        <p class="lead">Bien joué. Vous pouvez enregistrer un prénom ou un pseudo court pour garder ce résultat sur cet ordinateur.</p>
      </div>

      <div class="finish-content">
        <div class="finish-panel">
          <div class="result-grid">
            ${renderResult("Score", `${state.score} points`, true)}
            ${renderResult("Niveau", level.label)}
            ${renderResult("Temps", formatTime(state.elapsedSeconds))}
            ${renderResult("Coups", state.moves)}
            ${renderResult("Indices", state.hints)}
            ${renderResult("Bonus sans indice", noHintBonus)}
          </div>

          ${state.scoreSaved ? renderSavedMessage() : renderScoreForm()}

          <div class="action-row">
            <button class="button primary" type="button" data-action="replay">Rejouer</button>
            <button class="button secondary" type="button" data-action="home">Retour aux jeux</button>
          </div>
        </div>

        ${renderScorePanel(readScores(), false)}
      </div>
    </section>
  `;

  app.focus({ preventScroll: true });
}

function renderResult(label, value, featured = false) {
  return `
    <div class="result-item${featured ? " feature" : ""}">
      <p class="metric-label">${label}</p>
      <strong>${escapeHtml(String(value))}</strong>
    </div>
  `;
}

function renderScoreForm() {
  return `
    <form class="score-form" id="scoreForm">
      <label for="playerName">Prénom ou pseudo</label>
      <div class="input-row">
        <input id="playerName" name="playerName" type="text" maxlength="14" autocomplete="off" placeholder="Ex. Marie">
        <button class="button primary" type="submit">Enregistrer</button>
      </div>
      <p class="privacy-note">Un prénom court suffit. Évitez les noms complets.</p>
    </form>
  `;
}

function renderSavedMessage() {
  const message = state.scoreSaveStatus === "pending"
    ? `Score enregistré pour ${escapeHtml(state.playerName)}. Synchronisation dès que la borne retrouve la connexion.`
    : `Score partagé enregistré pour ${escapeHtml(state.playerName)}.`;

  return `
    <p class="game-note">${message}</p>
  `;
}

function setAppView(view) {
  app.dataset.view = view;
  document.body.dataset.view = view;
}

function renderScorePanel(scores, allowClear) {
  const rows = scores.slice(0, 5).map((score, index) => `
    <li class="score-row">
      <span class="score-rank">${index + 1}</span>
      <span>
        <span class="score-name">${escapeHtml(score.playerName)}</span>
        <span class="score-meta">${escapeHtml(LEVELS[score.level]?.label || "Partie")} · ${formatTime(score.timeSeconds)} · ${score.moves} coups</span>
      </span>
      <span class="score-points">${score.score} pts</span>
    </li>
  `).join("");

  return `
    <section class="score-panel" aria-label="Classement partagé">
      <div class="score-heading">
        <h2>Top scores</h2>
        ${allowClear && scores.length ? '<button class="button ghost compact" type="button" data-action="clear-scores">Effacer</button>' : ""}
      </div>
      ${rows ? `<ol class="score-list">${rows}</ol>` : '<p class="empty-state">Aucun score enregistré pour le moment.</p>'}
    </section>
  `;
}

function startTimer() {
  stopTimer();
  state.timerId = window.setInterval(() => {
    if (state.view !== "play") {
      return;
    }

    state.elapsedSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
    updateLiveStats();
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateLiveStats() {
  const timeValue = document.querySelector("#timeValue");
  const movesValue = document.querySelector("#movesValue");
  const hintsValue = document.querySelector("#hintsValue");

  if (timeValue) {
    timeValue.textContent = formatTime(state.elapsedSeconds);
  }

  if (movesValue) {
    movesValue.textContent = String(state.moves);
  }

  if (hintsValue) {
    hintsValue.textContent = String(state.hints);
  }
}

function calculateScore() {
  const level = LEVELS[state.levelKey];
  const timePenalty = Math.floor(state.elapsedSeconds / 5);
  const hintPenalty = state.hints * 50;
  const movePenalty = state.moves * 10;
  const noHintBonus = state.hints === 0 ? 100 : 0;

  return Math.max(level.baseScore - movePenalty - timePenalty - hintPenalty + noHintBonus, 50);
}

function isComplete() {
  return state.board.every((pieceIndex, cellIndex) => pieceIndex === cellIndex);
}

function createShuffledBoard(count) {
  const board = Array.from({ length: count }, (_, index) => index);

  do {
    for (let index = board.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const current = board[index];
      board[index] = board[randomIndex];
      board[randomIndex] = current;
    }
  } while (board.every((pieceIndex, cellIndex) => pieceIndex === cellIndex));

  return board;
}

function pickRandomImage() {
  return PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];
}

function pickRequestedImage() {
  const requestedImageId = new URLSearchParams(window.location.search).get("image");

  if (!requestedImageId) {
    return null;
  }

  return PUZZLE_IMAGES.find((image) => image.id === requestedImageId) || null;
}

function openModelDialog() {
  if (!state.image) {
    return;
  }

  modelDialogTitle.textContent = state.image.title;
  modelDialogImage.src = state.image.src;
  modelDialogImage.alt = state.image.alt;

  if (typeof modelDialog.showModal === "function") {
    modelDialog.showModal();
    return;
  }

  modelDialog.setAttribute("open", "open");
}

async function initScores() {
  state.scores = readCachedScores();
  await syncPendingScores();
  const updated = await refreshScores();

  if (updated && state.view === "scores") {
    renderScoresView(false);
  }
}

function readScores() {
  return state.scores.length ? state.scores : readCachedScores();
}

function readCachedScores() {
  try {
    const rawScores = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(rawScores)) {
      return [];
    }

    return rawScores
      .filter((score) => score && score.game === "puzzle-express")
      .sort((first, second) => second.score - first.score || first.timeSeconds - second.timeSeconds)
      .slice(0, 10);
  } catch (error) {
    return [];
  }
}

async function saveScore(entry) {
  const scoreEntry = normalizeScoreEntry(entry);
  addScoreToCache(scoreEntry);

  try {
    const response = await fetch(SCORE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(scoreEntry)
    });

    if (!response.ok) {
      throw new Error(`Score API returned ${response.status}`);
    }

    const payload = await response.json();
    if (Array.isArray(payload.scores)) {
      storeScoreCache(payload.scores);
    } else if (payload.score) {
      addScoreToCache(payload.score);
    }

    removePendingScore(scoreEntry.clientEntryId);
    return { synced: true };
  } catch (error) {
    queuePendingScore(scoreEntry);
    return { synced: false };
  }
}

async function refreshScores() {
  try {
    const response = await fetch(`${SCORE_API_URL}?limit=${SCORE_LIMIT}`, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Score API returned ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload.scores)) {
      return false;
    }

    storeScoreCache(payload.scores);
    return true;
  } catch (error) {
    return false;
  }
}

async function syncPendingScores() {
  const pendingScores = readPendingScores();
  if (!pendingScores.length) {
    return;
  }

  const remainingScores = [];

  for (const score of pendingScores) {
    try {
      const response = await fetch(SCORE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(score)
      });

      if (!response.ok) {
        throw new Error(`Score API returned ${response.status}`);
      }
    } catch (error) {
      remainingScores.push(score);
    }
  }

  writePendingScores(remainingScores);
}

function normalizeScoreEntry(entry) {
  return {
    clientEntryId: entry.clientEntryId || createId(),
    game: "puzzle-express",
    playerName: cleanPlayerName(entry.playerName),
    score: Number(entry.score) || 0,
    level: LEVELS[entry.level] ? entry.level : "medium",
    moves: Math.max(0, Number(entry.moves) || 0),
    hints: Math.max(0, Number(entry.hints) || 0),
    timeSeconds: Math.max(0, Number(entry.timeSeconds) || 0),
    imageId: String(entry.imageId || ""),
    siteId: normalizeIdentifier(entry.siteId || getSiteId(), "default"),
    deviceId: normalizeIdentifier(entry.deviceId || getDeviceId(), "unknown"),
    date: entry.date || new Date().toISOString()
  };
}

function addScoreToCache(entry) {
  storeScoreCache([entry, ...readCachedScores()]);
}

function storeScoreCache(scores) {
  const normalizedScores = scores
    .map((score) => normalizeScoreEntry(score))
    .sort((first, second) => second.score - first.score || first.timeSeconds - second.timeSeconds)
    .filter((score, index, list) => {
      const key = score.clientEntryId || `${score.playerName}-${score.score}-${score.date}`;
      return list.findIndex((item) => (item.clientEntryId || `${item.playerName}-${item.score}-${item.date}`) === key) === index;
    })
    .slice(0, SCORE_LIMIT);

  state.scores = normalizedScores;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedScores));
}

function readPendingScores() {
  try {
    const scores = JSON.parse(localStorage.getItem(PENDING_SCORES_KEY) || "[]");
    return Array.isArray(scores) ? scores.map((score) => normalizeScoreEntry(score)) : [];
  } catch (error) {
    return [];
  }
}

function queuePendingScore(entry) {
  const pendingScores = readPendingScores();
  const nextScores = [entry, ...pendingScores]
    .filter((score, index, list) => list.findIndex((item) => item.clientEntryId === score.clientEntryId) === index)
    .slice(0, 20);

  writePendingScores(nextScores);
}

function removePendingScore(clientEntryId) {
  writePendingScores(readPendingScores().filter((score) => score.clientEntryId !== clientEntryId));
}

function writePendingScores(scores) {
  localStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(scores));
}

function clearScores() {
  const confirmed = window.confirm("Effacer le cache local des scores sur cet ordinateur ?");
  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PENDING_SCORES_KEY);
  state.scores = [];
  announce("Cache local des scores effacé.");
  renderScoresView(false);
}

function getSiteId() {
  const params = new URLSearchParams(window.location.search);
  const siteFromUrl = params.get("site") || params.get("point");

  if (siteFromUrl) {
    const normalizedSite = normalizeIdentifier(siteFromUrl, "default");
    localStorage.setItem(SITE_ID_KEY, normalizedSite);
    return normalizedSite;
  }

  return normalizeIdentifier(localStorage.getItem(SITE_ID_KEY) || "default", "default");
}

function getDeviceId() {
  const existingDeviceId = normalizeIdentifier(localStorage.getItem(DEVICE_ID_KEY) || "", "");
  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId = createId();
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

function normalizeIdentifier(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function cleanPlayerName(value) {
  const name = String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14);

  return name || "Joueur";
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function announce(message) {
  announcer.textContent = "";
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 20);
}
