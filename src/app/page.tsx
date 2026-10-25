"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wheel } from "@/components/game-wheel";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Dices,
  FerrisWheel,
  History as HistoryIcon,
  Loader2,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  DEFAULT_NAMES,
  MAX_TEAMS,
  MIN_TEAMS,
  OPERATIONS,
  SPIN_MS,
  STORAGE_KEY,
  TEAM_COLORS,
  defaultNameOf,
  faNum,
  newId,
  syncIdCounter,
  type HistoryItem,
  type Player,
  type SpinResult,
} from "@/lib/game";

type Accent = { light: string; dark: string };

/* ---------------- ردیف امتیاز (نمای بازی) ---------------- */

function ScoreRow({
  index,
  player,
  accent,
  isCurrent,
  onScore,
}: {
  index: number;
  player: Player;
  accent: Accent;
  isCurrent: boolean;
  onScore: (delta: number) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
        isCurrent
          ? "border-amber-300 bg-amber-50 shadow-sm ring-2 ring-amber-200"
          : "bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full ring-2"
          style={{ backgroundColor: accent.dark, boxShadow: `0 0 0 2px ${accent.light}` }}
          aria-hidden="true"
        />
        <span className="truncate text-sm font-bold text-stone-700">
          {player.name}
        </span>
        {isCurrent && (
          <Badge className="shrink-0 animate-pulse bg-amber-400 text-[10px] text-stone-900 hover:bg-amber-400">
            نوبت بازی
          </Badge>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onScore(-1)}
          aria-label={`کاهش امتیاز ${player.name}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-8 text-center text-xl font-black tabular-nums">
          {faNum(player.score)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onScore(1)}
          aria-label={`افزایش امتیاز ${player.name}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- ردیف تیم (نمای تنظیمات) ---------------- */

function SettingsTeamRow({
  index,
  player,
  accent,
  canRemove,
  locked,
  onName,
  onRemove,
}: {
  index: number;
  player: Player;
  accent: Accent;
  canRemove: boolean;
  locked: boolean;
  onName: (name: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
      <Badge
        className="shrink-0 border-transparent text-xs"
        style={{ backgroundColor: accent.light, color: accent.dark }}
      >
        تیم {faNum(index + 1)}
      </Badge>
      <Input
        value={player.name}
        onChange={(e) => onName(e.target.value)}
        placeholder={`تیم ${faNum(index + 1)}`}
        maxLength={24}
        className="h-9 flex-1 font-bold"
        aria-label={`نام تیم ${faNum(index + 1)}`}
      />
      {canRemove ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-stone-300 hover:bg-rose-50 hover:text-rose-500"
          onClick={onRemove}
          disabled={locked}
          aria-label={`حذف ${player.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <span className="w-8 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}

/* ---------------- نمای بازی ---------------- */

function GameView({
  players,
  currentIdx,
  rotation,
  confettiKey,
  spinning,
  result,
  history,
  onSpin,
  onScore,
  onResetScores,
  onClearHistory,
  onOpenSettings,
}: {
  players: Player[];
  currentIdx: number;
  rotation: number;
  confettiKey: number;
  spinning: boolean;
  result: SpinResult | null;
  history: HistoryItem[];
  onSpin: () => void;
  onScore: (i: number, delta: number) => void;
  onResetScores: () => void;
  onClearHistory: () => void;
  onOpenSettings: () => void;
}) {
  const currentName =
    players[currentIdx]?.name || defaultNameOf(currentIdx);

  return (
    <main className="view-in mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ستون گردونه */}
        <section className="space-y-5 lg:col-span-3" aria-label="گردونه">
          <Wheel rotation={rotation} burstKey={confettiKey} />

          <div className="flex justify-center">
            <Button
              onClick={onSpin}
              disabled={spinning}
              size="lg"
              className="h-14 w-full max-w-[430px] rounded-full bg-stone-900 text-lg font-black text-amber-300 shadow-lg hover:bg-stone-800"
              aria-label="چرخش گردونه"
            >
              {spinning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال چرخش…
                </>
              ) : (
                <>
                  <Dices className="h-6 w-6" />
                  چرخش گردونه — نوبت: {currentName}
                </>
              )}
            </Button>
          </div>

          <div className="min-h-[110px]" aria-live="polite">
            {result ? (
              (() => {
                const op = OPERATIONS[result.opIndex];
                const pname =
                  players[result.playerIdx]?.name ||
                  defaultNameOf(result.playerIdx);
                return (
                  <div
                    className="result-pop rounded-2xl border-2 p-4 text-center shadow-sm"
                    style={{
                      borderColor: op.color,
                      backgroundColor: op.light,
                    }}
                  >
                    <div className="text-sm font-bold text-stone-600">
                      گردش {faNum(result.round)} — {pname}
                    </div>
                    <div
                      className="mt-1 text-2xl font-black sm:text-3xl"
                      style={{ color: op.dark }}
                    >
                      عمل این تیم: {op.name} ({op.symbol})
                    </div>
                    <div className="mt-1 text-xs font-medium text-stone-500">
                      بدون طرح سوال — تیم باید یک عمل {op.name} انجام دهد
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex h-[110px] items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white/60 px-4 text-center text-sm font-medium text-stone-400">
                {spinning
                  ? "گردونه در حال چرخش…"
                  : "گردونه را بچرخانید تا عملِ تیمِ نوبت به‌صورت شانسی مشخص شود"}
              </div>
            )}
          </div>
        </section>

        {/* ستون تیم‌ها */}
        <section className="space-y-5 lg:col-span-2" aria-label="تیم‌ها و تاریخچه">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-amber-500" />
                  تیم‌ها و امتیازها
                  <Badge variant="secondary">
                    {faNum(players.length)} تیم
                  </Badge>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenSettings}
                    className="h-8 text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    ویرایش تیم‌ها
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetScores}
                    className="h-8 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    صفر کردن امتیازها
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearHistory}
                    className="h-8 text-xs text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    پاک‌سازی
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {players.map((p, i) => (
                  <ScoreRow
                    key={p.id}
                    index={i}
                    player={p}
                    accent={TEAM_COLORS[i % TEAM_COLORS.length]}
                    isCurrent={i === currentIdx}
                    onScore={(delta) => onScore(i, delta)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <HistoryIcon className="h-5 w-5 text-violet-500" />
                تاریخچه گردش‌ها
                {history.length > 0 && (
                  <Badge variant="secondary">{faNum(history.length)}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-400">
                  هنوز گردشی انجام نشده است
                </p>
              ) : (
                <ul className="scroll-slim max-h-64 space-y-2 overflow-y-auto pl-1">
                  {history.map((h) => {
                    const op = OPERATIONS[h.opIndex];
                    return (
                      <li
                        key={`${h.id}-${h.round}`}
                        className="flex items-center justify-between gap-2 rounded-xl border bg-stone-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xs font-bold text-stone-400">
                            گردش {faNum(h.round)}
                          </span>
                          <span className="font-bold text-stone-700">
                            {h.playerName}
                          </span>
                        </div>
                        <span
                          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black"
                          style={{ backgroundColor: op.light, color: op.dark }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: op.color }}
                          />
                          {op.name} ({op.symbol})
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-stone-800">
                <CircleHelp className="h-4 w-4 text-amber-500" />
                راهنمای بازی
              </h3>
              <ol className="space-y-1.5 text-xs font-medium leading-relaxed text-stone-600">
                <li>۱. از «ویرایش تیم‌ها» (یا آیکون چرخ‌دنده بالا) نام و تعداد تیم‌ها را تعیین کنید (۲ تا ۸ تیم).</li>
                <li>۲. دکمه «چرخش گردونه» را بزنید؛ گردونه به‌صورت شانسی می‌ایستد.</li>
                <li>۳. عمل روی‌نشان‌شده (جمع، تفریق، ضرب یا تقسیم) برای تیمِ نوبت است و هیچ سوالی پرسیده نمی‌شود.</li>
                <li>۴. امتیاز هر تیم را با دکمه‌های + و − ثبت کنید.</li>
              </ol>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

/* ---------------- نمای تنظیمات ---------------- */

function SettingsView({
  players,
  spinning,
  onName,
  onAddTeam,
  onRemoveTeam,
  onRestoreNames,
  onBack,
}: {
  players: Player[];
  spinning: boolean;
  onName: (i: number, name: string) => void;
  onAddTeam: () => void;
  onRemoveTeam: (i: number) => void;
  onRestoreNames: () => void;
  onBack: () => void;
}) {
  return (
    <main
      className="view-in mx-auto w-full max-w-2xl flex-1 px-3 py-6 sm:px-4"
      aria-label="تنظیمات تیم‌ها"
    >
      <div className="space-y-5">
        {/* تعداد تیم‌ها */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-amber-500" />
              تعداد تیم‌ها
              <Badge variant="secondary">{faNum(players.length)} تیم</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center gap-5">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-2xl"
                onClick={onAddTeam}
                disabled={spinning || players.length >= MAX_TEAMS}
                aria-label="افزودن تیم"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <div className="flex min-w-24 flex-col items-center" aria-live="polite">
                <span className="text-4xl font-black tabular-nums text-stone-800">
                  {faNum(players.length)}
                </span>
                <span className="text-xs font-medium text-stone-400">تیم فعال</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-2xl"
                onClick={() => onRemoveTeam(players.length - 1)}
                disabled={spinning || players.length <= MIN_TEAMS}
                aria-label="حذف آخرین تیم"
              >
                <Minus className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-center text-xs font-medium leading-relaxed text-stone-400">
              تعداد تیم‌ها بین {faNum(MIN_TEAMS)} تا {faNum(MAX_TEAMS)} قابل تنظیم است
              {spinning ? " — تا پایان چرخش گردونه قفل است" : ""}
            </p>
          </CardContent>
        </Card>

        {/* نام تیم‌ها */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pencil className="h-5 w-5 text-violet-500" />
                نام تیم‌ها
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onRestoreNames}
                className="h-8 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                نام‌های پیش‌فرض
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {players.map((p, i) => (
              <SettingsTeamRow
                key={p.id}
                index={i}
                player={p}
                accent={TEAM_COLORS[i % TEAM_COLORS.length]}
                canRemove={players.length > MIN_TEAMS}
                locked={spinning}
                onName={(name) => onName(i, name)}
                onRemove={() => onRemoveTeam(i)}
              />
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-xs font-medium text-stone-400">
          تغییرات به‌صورت خودکار ذخیره می‌شوند
        </p>

        {/* ذخیره و بازگشت */}
        <div className="sticky bottom-4 z-10">
          <Button
            onClick={onBack}
            size="lg"
            className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-black text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
          >
            <Check className="h-5 w-5" />
            ذخیره و بازگشت به بازی
          </Button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- صفحه اصلی ---------------- */

export default function Home() {
  const [view, setView] = useState<"game" | "settings">("game");
  const [players, setPlayers] = useState<Player[]>(() =>
    DEFAULT_NAMES.map((name) => ({ id: newId(), name, score: 0 }))
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [round, setRound] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timersRef = useRef<number[]>([]);

  /* بازیابی وضعیت از localStorage */
  /* eslint-disable react-hooks/set-state-in-effect -- بارگذاری اولیه از localStorage باید بعد از mount انجام شود تا با SSR ناسازگار نشود */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw) as {
          players?: Player[];
          history?: HistoryItem[];
          round?: number;
          currentIdx?: number;
        };
        const stored = Array.isArray(d.players) ? d.players : null;
        const len =
          stored && stored.length >= MIN_TEAMS && stored.length <= MAX_TEAMS
            ? stored.length
            : 4;
        if (stored && len === stored.length) {
          const loadedPlayers = stored.map((p, i) => ({
            id:
              typeof p?.id === "number" && Number.isFinite(p.id)
                ? p.id
                : newId(),
            name:
              typeof p?.name === "string" && p.name
                ? p.name
                : defaultNameOf(i),
            score: Number.isFinite(Number(p?.score))
              ? Math.max(0, Number(p?.score))
              : 0,
          }));
          const maxId = Math.max(...loadedPlayers.map((p) => p.id));
          syncIdCounter(maxId);
          setPlayers(loadedPlayers);
        }
        if (Array.isArray(d.history)) {
          setHistory(
            d.history
              .filter(
                (h) =>
                  h &&
                  typeof h.opIndex === "number" &&
                  h.opIndex >= 0 &&
                  h.opIndex < 4
              )
              .slice(0, 60)
              .map((h, i) => ({
                id: typeof h.id === "number" ? h.id : i,
                round: Number(h.round) || 0,
                playerName: String(h.playerName ?? ""),
                opIndex: h.opIndex,
              }))
          );
        }
        if (typeof d.round === "number" && d.round >= 0) setRound(d.round);
        if (typeof d.currentIdx === "number")
          setCurrentIdx(Math.abs(Math.trunc(d.currentIdx)) % len);
      }
    } catch {
      /* داده خراب است — نادیده بگیر */
    }
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ذخیره وضعیت */
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ players, history, round, currentIdx })
      );
    } catch {
      /* حافظه در دسترس نیست */
    }
  }, [players, history, round, currentIdx, loaded]);

  /* پاک‌سازی تایمرها */
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const extra = 4 * 360 + Math.floor(Math.random() * 3) * 360 + Math.random() * 360;
    const target = rotation + extra;
    setRotation(target);

    const t1 = window.setTimeout(() => {
      const norm = ((target % 360) + 360) % 360;
      const pointerAngle = (360 - norm) % 360;
      const opIndex = Math.floor(pointerAngle / 90) % 4;
      const playerIdx = currentIdx;
      const newRound = round + 1;
      setResult({ playerIdx, opIndex, round: newRound });
      setRound(newRound);
      setConfettiKey((k) => k + 1);
      setHistory((h) =>
        [
          {
            id: Date.now(),
            round: newRound,
            playerName:
              players[playerIdx]?.name || defaultNameOf(playerIdx),
            opIndex,
          },
          ...h,
        ].slice(0, 60)
      );
      const t2 = window.setTimeout(() => {
        setCurrentIdx((i) => (i + 1) % players.length);
        setSpinning(false);
      }, 2000);
      timersRef.current.push(t2);
    }, SPIN_MS);
    timersRef.current.push(t1);
  };

  const setName = (i: number, name: string) =>
    setPlayers((ps) => ps.map((p, idx) => (idx === i ? { ...p, name } : p)));

  const bumpScore = (i: number, delta: number) =>
    setPlayers((ps) =>
      ps.map((p, idx) =>
        idx === i ? { ...p, score: Math.max(0, p.score + delta) } : p
      )
    );

  const addTeam = () => {
    if (spinning || players.length >= MAX_TEAMS) return;
    setPlayers((ps) => {
      const taken = new Set(ps.map((p) => p.name));
      let n = ps.length + 1;
      while (taken.has(`تیم ${faNum(n)}`)) n += 1;
      return [...ps, { id: newId(), name: `تیم ${faNum(n)}`, score: 0 }];
    });
  };

  const removeTeam = (index: number) => {
    if (spinning || players.length <= MIN_TEAMS) return;
    setPlayers((ps) => ps.filter((_, idx) => idx !== index));
    setCurrentIdx((c) => {
      const newLen = players.length - 1;
      if (index < c) return c - 1;
      if (index === c) return c % newLen;
      return Math.min(c, newLen - 1);
    });
  };

  const resetScores = () =>
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));

  const clearHistory = () => {
    setHistory([]);
    setRound(0);
    setResult(null);
  };

  const restoreNames = () =>
    setPlayers((ps) =>
      ps.map((p, i) => ({ ...p, name: defaultNameOf(i) }))
    );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 via-orange-50/40 to-white">
      {/* سربرگ */}
      <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 shadow-inner">
              <FerrisWheel className="h-7 w-7 text-stone-900" />
            </div>
            <div>
              <h1 className="text-lg font-black text-stone-900 sm:text-2xl">
                گردونه عملیات ریاضی
              </h1>
              <p className="text-[11px] font-medium text-stone-500 sm:text-sm">
                نام و تعداد تیم‌ها را از تنظیمات تعیین کنید — بدون سوال!
              </p>
            </div>
          </div>
          {view === "game" ? (
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl border-amber-200 bg-white/80 hover:bg-amber-50"
              onClick={() => setView("settings")}
              aria-label="تنظیمات تیم‌ها"
            >
              <Settings className="h-5 w-5 text-stone-600" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl border-amber-200 bg-white/80 hover:bg-amber-50"
              onClick={() => setView("game")}
              aria-label="بازگشت به بازی"
            >
              <ArrowRight className="h-5 w-5 text-stone-600" />
            </Button>
          )}
        </div>
      </header>

      {view === "game" ? (
        <GameView
          players={players}
          currentIdx={currentIdx}
          rotation={rotation}
          confettiKey={confettiKey}
          spinning={spinning}
          result={result}
          history={history}
          onSpin={spin}
          onScore={bumpScore}
          onResetScores={resetScores}
          onClearHistory={clearHistory}
          onOpenSettings={() => setView("settings")}
        />
      ) : (
        <SettingsView
          players={players}
          spinning={spinning}
          onName={setName}
          onAddTeam={addTeam}
          onRemoveTeam={removeTeam}
          onRestoreNames={restoreNames}
          onBack={() => setView("game")}
        />
      )}

      <footer className="mt-auto border-t border-amber-100 bg-white/60 py-3">
        <p className="text-center text-xs font-medium text-stone-400">
          گردونه عملیات ریاضی — بازی گروهی کلاسی برای تمرین چهار عمل اصلی
        </p>
      </footer>
    </div>
  );
}
