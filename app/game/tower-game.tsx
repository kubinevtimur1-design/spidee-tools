"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "spidee_tower_record";
const BLOCK_HEIGHT = 58;
const START_WIDTH = 108;
const MIN_OVERLAP = 10;

const PAPER = "#F7F5F2";
const INK = "#242424";
const RED = "#FF3830";
const ACID = "#D7FF00";

const FLOOR_COLORS = [RED, INK, "#FF4D45", "#343434", "#F0443D", "#1D1D1D"];

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface FallingPiece extends Block {
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

interface CurrentBlock extends Block {
  vx: number;
  isDropping: boolean;
  dropVelocity: number;
}

interface GameData {
  score: number;
  highScore: number;
  cameraY: number;
  targetCameraY: number;
  blocks: Block[];
  fallingPieces: FallingPiece[];
  currentBlock: CurrentBlock;
  isPlaying: boolean;
}

function getSavedHighScore() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function getNextColor(score: number) {
  return FLOOR_COLORS[score % FLOOR_COLORS.length];
}

export default function TowerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [sessionHighScore, setSessionHighScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [comboText, setComboText] = useState<string | null>(null);
  const comboTimerRef = useRef<number | null>(null);

  const savedHighScore = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    getSavedHighScore,
    () => 0,
  );

  const highScore = Math.max(sessionHighScore, savedHighScore);

  const gameData = useRef<GameData>({
    score: 0,
    highScore: 0,
    cameraY: 0,
    targetCameraY: 0,
    blocks: [],
    fallingPieces: [],
    currentBlock: {
      x: 20,
      y: 80,
      width: START_WIDTH,
      height: BLOCK_HEIGHT,
      vx: 3.4,
      isDropping: false,
      dropVelocity: 0,
      color: RED,
    },
    isPlaying: false,
  });

  const showCombo = useCallback((text: string) => {
    setComboText(text);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = window.setTimeout(() => setComboText(null), 850);
  }, []);

  useEffect(() => () => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2 - START_WIDTH / 2;
    const startY = canvas.height - 74;

    gameData.current = {
      score: 0,
      highScore: Math.max(gameData.current.highScore, getSavedHighScore()),
      cameraY: 0,
      targetCameraY: 0,
      fallingPieces: [],
      blocks: [{
        x: startX,
        y: startY,
        width: START_WIDTH,
        height: BLOCK_HEIGHT,
        color: INK,
      }],
      currentBlock: {
        x: 18,
        y: startY - 158,
        width: START_WIDTH,
        height: BLOCK_HEIGHT,
        vx: 3.4,
        isDropping: false,
        dropVelocity: 0,
        color: RED,
      },
      isPlaying: true,
    };

    setScore(0);
    setComboText(null);
    setGameState("playing");
  }, []);

  const dropBlock = useCallback(() => {
    const game = gameData.current;
    if (!game.isPlaying || game.currentBlock.isDropping) return;
    game.currentBlock.isDropping = true;
    game.currentBlock.dropVelocity = 4.2; // начальная скорость падения
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;

    const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    };

    const drawBackground = () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.strokeStyle = "rgba(36,36,36,0.045)";
      ctx.lineWidth = 1;
      for (let x = 20; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 20; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,56,48,0.055)";
      ctx.font = "900 170px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("*", 250, 150);
      ctx.restore();
    };

    const drawBlock = (block: Block, opts?: { current?: boolean; index?: number; opacity?: number }) => {
      const { current = false, opacity = 1, index } = opts ?? {};
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.shadowColor = "rgba(36,36,36,.08)";
      ctx.shadowBlur = current ? 9 : 4;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = block.color;
      roundedRect(block.x, block.y, block.width, block.height, 5);
      ctx.fill();

      ctx.shadowColor = "transparent";
      const isDark = ["#242424", "#343434", "#1D1D1D"].includes(block.color);
      ctx.strokeStyle = isDark ? "rgba(255,255,255,.10)" : "rgba(36,36,36,.13)";
      ctx.lineWidth = 1;
      roundedRect(block.x + 0.5, block.y + 0.5, Math.max(0, block.width - 1), block.height - 1, 5);
      ctx.stroke();

      // Окна
      const available = block.width - 16;
      if (available >= 15) {
        const ww = Math.min(13, available / 3);
        const gap = Math.min(9, ww * 0.65);
        let cols = Math.max(1, Math.min(4, Math.floor((available + gap) / (ww + gap))));
        const total = cols * ww + (cols - 1) * gap;
        const startX = block.x + (block.width - total) / 2;

        ctx.fillStyle = current ? ACID : "rgba(247,245,242,.82)";
        for (let c = 0; c < cols; c++) {
          const wx = startX + c * (ww + gap);
          for (let r = 0; r < 2; r++) {
            roundedRect(wx, block.y + 15 + r * 18, ww, 10, 2);
            ctx.fill();
          }
        }
      }

      if (index !== undefined && block.width >= 34) {
        ctx.fillStyle = "rgba(247,245,242,.48)";
        ctx.font = "700 8px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(String(index), block.x + 6, block.y + 10);
      }
      ctx.restore();
    };

    const drawFalling = (piece: FallingPiece) => {
      ctx.save();
      const cx = piece.x + piece.width / 2;
      const cy = piece.y + piece.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(piece.rotation);
      ctx.translate(-cx, -cy);
      drawBlock(piece, { opacity: piece.opacity });
      ctx.restore();
    };

    const addFallingPiece = (block: Block, dir: -1 | 1, strong = false) => {
      if (block.width <= 1) return;
      gameData.current.fallingPieces.push({
        ...block,
        vx: dir * (strong ? 2.8 + Math.random() * 1.4 : 1.4 + Math.random() * 0.9),
        vy: strong ? -0.8 : 0.2,
        rotation: 0,
        rotationSpeed: dir * (strong ? 0.06 : 0.038),
        opacity: 1,
      });
    };

    const updateFallingPieces = () => {
      const pieces = gameData.current.fallingPieces;
      for (const p of pieces) {
        p.vy += 0.68;                 // гравитация
        p.vx *= 0.992;                // лёгкое сопротивление воздуха
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height + 140) p.opacity -= 0.07;
      }
      gameData.current.fallingPieces = pieces.filter(
        (p) => p.opacity > 0 && p.y < canvas.height + 300,
      );
    };

    const finishGame = (current: CurrentBlock) => {
      const top = gameData.current.blocks.at(-1)!;
      const dir: -1 | 1 = current.x + current.width / 2 < top.x + top.width / 2 ? -1 : 1;
      addFallingPiece(current, dir, true);
      gameData.current.isPlaying = false;
      setComboText(null);
      setGameState("gameover");
    };

    const placeBlock = (current: CurrentBlock) => {
      const game = gameData.current;
      const top = game.blocks.at(-1)!;
      const left = Math.max(current.x, top.x);
      const right = Math.min(current.x + current.width, top.x + top.width);
      let overlap = right - left;

      if (overlap <= 0 || overlap < MIN_OVERLAP) {
        finishGame(current);
        return;
      }

      const diff = current.x - top.x;
      const perfectTol = Math.min(3, top.width * 0.04);
      const isPerfect = Math.abs(diff) <= perfectTol;

      let placedX = left;
      let placedWidth = overlap;

      if (isPerfect) {
        placedX = top.x;
        placedWidth = top.width;
        overlap = top.width;
        showCombo("Идеально!");
      } else {
        setComboText(null);
        const leftOver = Math.max(0, top.x - current.x);
        const rightOver = Math.max(0, current.x + current.width - (top.x + top.width));
        if (leftOver > 0.5) addFallingPiece({ x: current.x, y: current.y, width: leftOver, height: current.height, color: current.color }, -1);
        if (rightOver > 0.5) addFallingPiece({ x: top.x + top.width, y: current.y, width: rightOver, height: current.height, color: current.color }, 1);
      }

      const placed: Block = {
        x: placedX,
        y: current.y,
        width: placedWidth,
        height: current.height,
        color: current.color,
      };
      game.blocks.push(placed);
      game.score += 1;
      setScore(game.score);

      if (game.score > game.highScore) {
        game.highScore = game.score;
        setSessionHighScore(game.score);
        try { localStorage.setItem(STORAGE_KEY, String(game.score)); } catch {}
      }

      if (game.blocks.length > 4) {
        game.targetCameraY = (game.blocks.length - 4) * BLOCK_HEIGHT;
      }

      const minX = 16;
      const maxX = canvas.width - placedWidth - minX;
      const speed = 3.4 + Math.min(game.score * 0.17, 5.4);
      const fromLeft = Math.random() > 0.5;

      game.currentBlock = {
        x: fromLeft ? minX : maxX,
        y: placed.y - 158,
        width: placedWidth,
        height: BLOCK_HEIGHT,
        vx: fromLeft ? speed : -speed,
        isDropping: false,
        dropVelocity: 0,
        color: getNextColor(game.score),
      };
    };

    const updateGame = () => {
      const game = gameData.current;
      updateFallingPieces();
      if (!game.isPlaying) return;

      const current = game.currentBlock;
      const minX = 16;
      const maxX = canvas.width - current.width - minX;

      if (!current.isDropping) {
        current.x += current.vx;
        if (current.x <= minX) { current.x = minX; current.vx = Math.abs(current.vx); }
        if (current.x >= maxX) { current.x = maxX; current.vx = -Math.abs(current.vx); }
      } else {
        // Более физичное падение: ускорение + ограничение максимальной скорости
        current.dropVelocity = Math.min(current.dropVelocity + 0.55, 16.5);
        current.y += current.dropVelocity;

        const top = game.blocks.at(-1)!;
        const targetY = top.y - current.height;
        if (current.y >= targetY) {
          current.y = targetY;
          placeBlock(current);
        }
      }

      game.cameraY += (game.targetCameraY - game.cameraY) * 0.09;
    };

    const drawGround = () => {
      ctx.fillStyle = "rgba(36,36,36,.055)";
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
      ctx.fillStyle = INK;
      roundedRect(canvas.width / 2 - 66, canvas.height - 29, 132, 7, 3);
      ctx.fill();
      ctx.fillStyle = RED;
      ctx.fillRect(canvas.width / 2 - 18, canvas.height - 31, 36, 2);
    };

    const drawCable = (current: CurrentBlock) => {
      if (current.isDropping) return;
      const center = current.x + current.width / 2;
      ctx.save();
      ctx.strokeStyle = "rgba(36,36,36,.23)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(center, current.y);
      ctx.lineTo(center, current.y - 125);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(center, current.y - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      const game = gameData.current;
      drawBackground();
      ctx.save();
      ctx.translate(0, game.cameraY);
      drawGround();
      game.blocks.forEach((b, i) => drawBlock(b, { index: i }));
      game.fallingPieces.forEach(drawFalling);
      if (game.isPlaying) {
        drawCable(game.currentBlock);
        drawBlock(game.currentBlock, { current: true });
      }
      ctx.restore();
    };

    const loop = () => {
      updateGame();
      render();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      gameData.current.isPlaying ? dropBlock() : startGame();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKey);
    };
  }, [dropBlock, showCombo, startGame]);

  const handleAction = () => {
    gameState === "playing" ? dropBlock() : startGame();
  };

  return (
    <div className="tower-game mx-auto w-full max-w-[520px] select-none">
      <div className="game-scoreboard">
        <div>
          <span className="score-label">Этажи</span>
          <div className="score-value">{score}</div>
        </div>
        <div className="combo-slot">
          {comboText && (
            <div className="combo-badge">
              <span aria-hidden="true">*</span>
              {comboText}
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="score-label">Рекорд</span>
          <div className="score-value score-record">{highScore}</div>
        </div>
      </div>

      <div
        className="game-field"
        onClick={handleAction}
        onKeyDown={(e) => e.key === "Enter" && handleAction()}
        role="button"
        tabIndex={0}
        aria-label={gameState === "playing" ? "Сбросить этаж" : "Начать игру"}
      >
        <canvas ref={canvasRef} width={360} height={480} className="block h-full w-full" />
        <span className="field-star" aria-hidden="true">*</span>

        {gameState === "idle" && (
          <div className="game-overlay idle-overlay">
            <div className="start-card">
              <span className="start-star" aria-hidden="true">*</span>
              <h2>Spidee Tower</h2>
              <p>
                Построй башню как можно выше. Свисающая часть этажа отломятся — промахи уменьшают следующий блок.
              </p>
              <button type="button" className="game-button" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                Начать стройку <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="game-overlay gameover-overlay">
            <div className="result-card">
              <span className="result-kicker">Башня рухнула</span>
              <div className="result-score">{score}</div>
              <p>{score >= highScore && score > 0 ? "Новый рекорд!" : `Лучший результат: ${highScore}`}</p>
              <button type="button" className="game-button" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                Ещё раз <span className="restart-icon" aria-hidden="true">↻</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="game-footer">
        <span>Тап по полю <span className="footer-dot">•</span> пробел</span>
        <span>Рекорд сохраняется в браузере</span>
      </div>

      <style jsx global>{`
        .tower-game { --paper:#f7f5f2; --ink:#242424; --red:#ff3830; --acid:#d7ff00; }
        .game-scoreboard { display:grid; grid-template-columns:1fr auto 1fr; align-items:end; gap:14px; margin-bottom:12px; padding:0 3px; }
        .score-label { display:block; margin-bottom:3px; color:rgba(36,36,36,.34); font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
        .score-value { color:var(--ink); font-size:42px; font-weight:800; line-height:.9; letter-spacing:-.075em; }
        .score-record { color:var(--red); }
        .combo-slot { display:flex; min-width:104px; justify-content:center; padding-bottom:2px; }
        .combo-badge { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border:1px solid rgba(36,36,36,.08); border-radius:999px; background:var(--acid); color:var(--ink); box-shadow:0 5px 18px rgba(36,36,36,.06); font-size:11px; font-weight:800; white-space:nowrap; transform:rotate(-1deg); animation:combo-in 180ms ease-out; }
        .combo-badge span { color:var(--red); font-size:18px; line-height:.5; }
        @keyframes combo-in { from { opacity:0; transform:translateY(5px) rotate(-4deg) scale(.92); } to { opacity:1; transform:translateY(0) rotate(-1deg) scale(1); } }
        .game-field { position:relative; width:100%; aspect-ratio:3/4; overflow:hidden; border:1px solid rgba(36,36,36,.11); border-radius:20px; background:var(--paper); box-shadow:inset 0 1px 0 rgba(255,255,255,.72), 0 24px 70px rgba(36,36,36,.055); cursor:pointer; isolation:isolate; outline:none; }
        .game-field:focus-visible { box-shadow:0 0 0 3px var(--acid), 0 24px 70px rgba(36,36,36,.055); }
        .field-star { position:absolute; z-index:3; top:9px; right:14px; color:var(--red); font-size:34px; font-weight:800; line-height:1; pointer-events:none; transform:rotate(8deg); }
        .game-overlay { position:absolute; z-index:10; inset:0; display:flex; align-items:center; justify-content:center; padding:24px; text-align:center; }
        .idle-overlay { background:rgba(247,245,242,.84); backdrop-filter:blur(5px); }
        .gameover-overlay { background:rgba(36,36,36,.34); backdrop-filter:blur(3px); animation:overlay-in 160ms ease-out; }
        @keyframes overlay-in { from { opacity:0; } to { opacity:1; } }
        .start-card { display:flex; max-width:300px; flex-direction:column; align-items:center; }
        .start-star { height:68px; color:var(--red); font-size:98px; font-weight:800; line-height:.82; transform:rotate(-8deg); }
        .start-card h2 { color:var(--ink); font-size:clamp(32px,7vw,44px); font-weight:800; line-height:.95; letter-spacing:-.06em; }
        .start-card p { max-width:270px; margin-top:13px; color:rgba(36,36,36,.5); font-size:13px; line-height:1.5; letter-spacing:-.015em; }
        .game-button { display:inline-flex; min-height:44px; align-items:center; justify-content:center; gap:15px; margin-top:22px; padding:0 18px; border:0; border-radius:11px; background:var(--ink); color:white; font-size:12px; font-weight:750; cursor:pointer; transition:background 160ms ease, transform 160ms ease; }
        .game-button > span { color:var(--acid); font-size:17px; line-height:1; transition:color 160ms ease, transform 160ms ease; }
        .game-button:hover { background:var(--red); transform:translateY(-1px); }
        .game-button:hover > span { color:white; transform:translateX(3px); }
        .game-button:active { transform:scale(.98); }
        .result-card { width:min(100%,278px); padding:27px 23px 23px; border:1px solid rgba(36,36,36,.09); border-radius:18px; background:var(--paper); box-shadow:0 25px 70px rgba(0,0,0,.16); transform:rotate(-.6deg); }
        .result-kicker { color:var(--red); font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
        .result-score { margin-top:5px; color:var(--ink); font-size:76px; font-weight:800; line-height:.92; letter-spacing:-.09em; }
        .result-card p { margin-top:8px; color:rgba(36,36,36,.42); font-size:12px; }
        .result-card .game-button { width:100%; margin-top:20px; }
        .result-card .game-button:hover .restart-icon { transform:rotate(90deg); }
        .game-footer { display:flex; justify-content:space-between; gap:16px; padding:12px 4px 0; color:rgba(36,36,36,.32); font-size:10px; font-weight:600; }
        .footer-dot { margin:0 7px; color:var(--red); }
        @media (max-width:520px) {
          .game-scoreboard { gap:8px; }
          .score-value { font-size:36px; }
          .combo-slot { min-width:84px; }
          .combo-badge { padding:5px 8px; font-size:10px; }
          .game-field { border-radius:16px; }
          .game-footer { flex-direction:column; gap:3px; }
        }
        @media (prefers-reduced-motion:reduce) {
          .combo-badge, .gameover-overlay { animation:none; }
          .game-button, .game-button > span { transition:none; }
        }
      `}</style>
    </div>
  );
}