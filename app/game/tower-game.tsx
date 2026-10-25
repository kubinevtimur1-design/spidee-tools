"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

function getSavedHighScore() {
  try {
    const value = Number(localStorage.getItem("spidee_tower_record"));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function subscribeToHighScore(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getServerHighScore() {
  return 0;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export default function TowerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [sessionHighScore, setHighScore] = useState(0);
  const savedHighScore = useSyncExternalStore(
    subscribeToHighScore,
    getSavedHighScore,
    getServerHighScore,
  );
  const highScore = Math.max(sessionHighScore, savedHighScore);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [comboText, setComboText] = useState<string | null>(null);

  // Размер квадратного блока (64x64 px)
  const BLOCK_SIZE = 64;

  const gameData = useRef({
    score: 0,
    highScore: 0,
    cameraY: 0,
    targetCameraY: 0,
    blocks: [] as Block[],
    currentBlock: {
      x: 20,
      y: 80,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      vx: 3.6,
      isDropping: false,
      color: "#2563eb",
    },
    isPlaying: false,
  });

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2 - BLOCK_SIZE / 2;
    const startY = canvas.height - 70;

    gameData.current = {
      score: 0,
      highScore: Math.max(gameData.current.highScore, getSavedHighScore()),
      cameraY: 0,
      targetCameraY: 0,
      blocks: [
        {
          x: startX,
          y: startY,
          width: BLOCK_SIZE,
          height: BLOCK_SIZE,
          color: "#1d1d1f",
        },
      ],
      currentBlock: {
        x: 20,
        y: startY - 170,
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        vx: 3.6,
        isDropping: false,
        color: "#2563eb",
      },
      isPlaying: true,
    };

    setScore(0);
    setGameState("playing");
    setComboText(null);
  }, []);

  const dropBlock = () => {
    const g = gameData.current;
    if (!g.isPlaying || g.currentBlock.isDropping) return;
    g.currentBlock.isDropping = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const colors = ["#2563eb", "#3b82f6", "#0ea5e9", "#6366f1", "#4f46e5", "#0284c7"];

    // Отрисовка квадратного блока с аккуратными окнами 2x2
    const drawSquareBlock = (b: Block, isCurrent = false, index?: number) => {
      // Тело куба
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.width, b.height, 10);
      ctx.fill();

      // Окна этажа (сетка 2x2)
      ctx.fillStyle = isCurrent ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.75)";
      const winSize = 12;
      const spacing = 10;
      const startOffsetX = (b.width - (winSize * 2 + spacing)) / 2;
      const startOffsetY = (b.height - (winSize * 2 + spacing)) / 2 + 2;

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const wx = b.x + startOffsetX + col * (winSize + spacing);
          const wy = b.y + startOffsetY + row * (winSize + spacing);
          ctx.beginPath();
          ctx.roundRect(wx, wy, winSize, winSize, 3);
          ctx.fill();
        }
      }

      // Номер этажа
      if (index !== undefined) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.font = "9px sans-serif";
        ctx.fillText(`${index}`, b.x + 6, b.y + 11);
      }
    };

    const loop = () => {
      const g = gameData.current;

      if (g.isPlaying) {
        const cur = g.currentBlock;
        const minX = 20;
        const maxX = canvas.width - cur.width - minX;

        if (!cur.isDropping) {
          cur.x += cur.vx;

          if (cur.x <= minX) {
            cur.x = minX;
            cur.vx = Math.abs(cur.vx);
          } else if (cur.x >= maxX) {
            cur.x = maxX;
            cur.vx = -Math.abs(cur.vx);
          }
        } else {
          cur.y += 14;

          const topBlock = g.blocks[g.blocks.length - 1];
          const targetY = topBlock.y - cur.height;

          if (cur.y >= targetY) {
            cur.y = targetY;

            const diff = cur.x - topBlock.x;
            const absDiff = Math.abs(diff);

            if (absDiff <= 4) {
              cur.x = topBlock.x;
              setComboText("Идеально! 🎯");
            } else {
              setComboText(null);
            }

            if (absDiff < topBlock.width) {
              g.blocks.push({
                x: cur.x,
                y: cur.y,
                width: cur.width,
                height: cur.height,
                color: cur.color,
              });

              g.score += 1;
              setScore(g.score);

              if (g.score > g.highScore) {
                g.highScore = g.score;
                setHighScore(g.score);
                try {
                  localStorage.setItem("spidee_tower_record", g.score.toString());
                } catch {
                  // Keep the session record even when browser storage is unavailable.
                }
              }

              // Поднимаем камеру, когда башня растет
              if (g.blocks.length > 3) {
                g.targetCameraY = (g.blocks.length - 3) * cur.height;
              }

              const nextSpeed = 3.6 + Math.min(g.score * 0.16, 5.2);
              const nextColor = colors[g.score % colors.length];
              const spawnLeft = Math.random() > 0.5;

              g.currentBlock = {
                x: spawnLeft ? minX : maxX,
                y: topBlock.y - 170,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                vx: spawnLeft ? nextSpeed : -nextSpeed,
                isDropping: false,
                color: nextColor,
              };
            } else {
              g.isPlaying = false;
              setGameState("gameover");
            }
          }
        }

        g.cameraY += (g.targetCameraY - g.cameraY) * 0.1;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(0, g.cameraY);

      // Земля
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, canvas.height - 26, canvas.width, 26);

      // Фундамент под размер куба
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(canvas.width / 2 - 45, canvas.height - 30, 90, 6);

      // Построенные этажи
      g.blocks.forEach((b, idx) => {
        drawSquareBlock(b, false, idx);
      });

      // Падающий блок и трос
      if (g.isPlaying) {
        const cur = g.currentBlock;

        ctx.strokeStyle = "rgba(156, 163, 175, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cur.x + cur.width / 2, cur.y);
        ctx.lineTo(cur.x + cur.width / 2, cur.y - 120);
        ctx.stroke();
        ctx.setLineDash([]);

        drawSquareBlock(cur, true);
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameData.current.isPlaying) {
          dropBlock();
        } else {
          startGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [startGame]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none">
      <div className="w-full flex justify-between items-center mb-4 px-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Этажи</span>
          <div className="text-3xl font-extrabold text-[#1d1d1f]">{score}</div>
        </div>

        {comboText && (
          <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold animate-bounce">
            {comboText}
          </div>
        )}

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Рекорд</span>
          <div className="text-3xl font-extrabold text-blue-600">{highScore}</div>
        </div>
      </div>

      <div
        onClick={gameState === "playing" ? dropBlock : startGame}
        className="relative w-full aspect-[3/4] bg-gradient-to-b from-sky-50/70 via-blue-50/30 to-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={480}
          className="w-full h-full block"
        />

        {gameState === "idle" && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="text-4xl">🏗️</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Spidee Tower</h3>
              <p className="text-xs text-gray-500 max-w-[220px]">
                Построй самый высокий небоскреб. Тапай по экрану или жми пробел, чтобы сбросить этаж!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-full bg-[#1d1d1f] text-white text-xs font-semibold hover:bg-black transition-all shadow-md active:scale-95"
            >
              Начать стройку
            </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 shadow-xl space-y-3 w-full max-w-[260px]">
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Башня рухнула!</span>
              <div className="text-4xl font-extrabold text-gray-900">{score}</div>
              <p className="text-xs text-gray-400">
                {score >= highScore && score > 0 ? "🎉 Новый рекорд!" : `Лучший результат: ${highScore}`}
              </p>
              <button
                onClick={startGame}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Построить заново
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Тапайте по полю для сброса этажа • Рекорд сохраняется в браузере
      </p>
    </div>
  );
}
