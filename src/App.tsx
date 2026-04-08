import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Building2,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  X,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useStore } from "./store/index";
import { parseExcelFromUrl } from "./utils/parseExcel";
import { runJosaa, josaaStats, getUniqueField } from "./utils/josaaEngine";
import { runJac, jacStats, exportJacCSV } from "./utils/jacEngine";
import { exportJosaaCsv } from "./utils/exportCsv";
import { PER_PAGE } from "./constants";
import { cn } from "./utils/cn";

// Shared
import { Pagination } from "./components/shared/Pagination";
import { EmptyState } from "./components/shared/EmptyState";
import { StatsRow } from "./components/shared/StatsRow";

// JoSAA components
import { JosaaInputForm } from "./components/josaa/JosaaInputForm";
import { JosaaFilters } from "./components/josaa/JosaaFilters";
import { JosaaCard } from "./components/josaa/JosaaCard";
import { JosaaTable } from "./components/josaa/JosaaTable";
import { JosaaCompare } from "./components/josaa/JosaaCompare";

// JAC components
import { JacInputForm } from "./components/jac/JacInputForm";
import { JacFilters } from "./components/jac/JacFilters";
import { JacCard } from "./components/jac/JacCard";
import { JacTable } from "./components/jac/JacTable";
import { JacCompare } from "./components/jac/JacCompare";

import type { JosaaResult, JacResult } from "./types";

// ─── bookmark key helpers ────────────────────────────────────────────────────
const jKey = (r: JosaaResult) =>
  `${r.institute}||${r.program}||${r.quota}||${r.seatType}`;
const jcKey = (r: JacResult) => `${r.institute}||${r.branch}||${r.category}`;

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    mode,
    setMode,
    josaaRecords,
    josaaLoading,
    josaaError,
    setJosaaRecords,
    setJosaaLoading,
    setJosaaError,
    jacRecords,
    jacLoading,
    jacError,
    setJacRecords,
    setJacLoading,
    setJacError,
    josaaProfile,
    josaaFilters,
    josaaSearched,
    resetJosaaFilters,
    jacProfile,
    jacFilters,
    jacSearched,
    resetJacFilters,
    viewMode,
    setViewMode,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    page,
    setPage,
    josaaBookmarks,
    toggleJosaaBookmark,
    jacBookmarks,
    toggleJacBookmark,
    josaaCompare,
    toggleJosaaCompare,
    josaaCompareOpen,
    setJosaaCompareOpen,
    jacCompare,
    toggleJacCompare,
    jacCompareOpen,
    setJacCompareOpen,
  } = useStore();

  const [bookmarkPanel, setBookmarkPanel] = useState(false);

  // ── Load JoSAA data ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setJosaaLoading(true);
      try {
        try {
          const d = await parseExcelFromUrl("./data/JOSSA-2025.xlsx");
          if (d.length > 100) {
            setJosaaRecords(d);
            return;
          }
        } catch {
          /* fall through */
        }
        const j = await import("./data/josaa_data.json");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setJosaaRecords(j.default as any[]);
      } catch (e) {
        setJosaaError(
          e instanceof Error ? e.message : "Failed to load JoSAA data",
        );
      } finally {
        setJosaaLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load JAC data ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setJacLoading(true);
      try {
        const j = await import("./data/jac_data.json");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setJacRecords(j.default as any[]);
      } catch (e) {
        setJacError(e instanceof Error ? e.message : "Failed to load JAC data");
      } finally {
        setJacLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── JoSAA derived ────────────────────────────────────────────────────────────
  const availableQuotas = useMemo(
    () => getUniqueField(josaaRecords, "quota"),
    [josaaRecords],
  );
  const availableSeatTypes = useMemo(
    () => getUniqueField(josaaRecords, "seatType"),
    [josaaRecords],
  );

  const josaaResults = useMemo(() => {
    if (!josaaSearched || (!josaaProfile.advRank && !josaaProfile.mainRank))
      return [];
    return runJosaa(josaaRecords, josaaProfile, josaaFilters);
  }, [josaaRecords, josaaProfile, josaaFilters, josaaSearched]);

  const jStats = useMemo(() => josaaStats(josaaResults), [josaaResults]);
  const jTotalPgs = Math.ceil(josaaResults.length / PER_PAGE);
  const jPaged = josaaResults.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const jBookmarkedResults = useMemo(
    () => josaaResults.filter((r) => josaaBookmarks.has(jKey(r))),
    [josaaResults, josaaBookmarks],
  );

  // ── JAC derived ──────────────────────────────────────────────────────────────
  const jacResults = useMemo(() => {
    if (!jacSearched || !jacProfile.mainRank) return [];
    return runJac(jacRecords, jacProfile, jacFilters);
  }, [jacRecords, jacProfile, jacFilters, jacSearched]);

  const jcStats = useMemo(() => jacStats(jacResults), [jacResults]);
  const jcTotalPgs = Math.ceil(jacResults.length / PER_PAGE);
  const jcPaged = jacResults.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const jcBookmarkedResults = useMemo(
    () => jacResults.filter((r) => jacBookmarks.has(jcKey(r))),
    [jacResults, jacBookmarks],
  );

  const changePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Loading splash ────────────────────────────────────────────────────────────
  const isLoading = josaaLoading || jacLoading;
  if (isLoading) return <LoadingSplash />;

  const hasError = josaaError || jacError;
  if (hasError)
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-slate-100">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-bold text-slate-800 text-lg mb-2">
            Data load failed
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {josaaError ?? jacError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  const isJosaa = mode === "josaa";

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden">
              <img
                src="https://play-lh.googleusercontent.com/ob4Cv6OmH6ja1fB6R18np_jD4AFzCENodfwtLIA1UvzFU_jtXdpgQPI3WDEvLCIhwBSP"
                alt="VMC Logo"
                className="w-6 h-6 object-contain"
              />
            </div>

            <div className="flex flex-col leading-tight">
              {/* Top Row */}
              <div className="flex items-center">
                <span className="font-semibold text-slate-800 text-sm">
                  Rank Predictor
                </span>
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  2026
                </span>
              </div>

              {/* Bottom Row */}
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Vidya Mandir Classes
              </span>
            </div>
          </div>

          {/* Mode switcher — center */}
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => {
                setMode("josaa");
                setPage(0);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                isJosaa
                  ? "bg-white shadow-sm text-brand-700 ring-1 ring-brand-100"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <GraduationCap size={14} />
              <span className="hidden sm:inline">JoSAA Counselling</span>
              <span className="sm:hidden">JoSAA</span>
              {isJosaa && (
                <span className="hidden md:inline text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-full">
                  IITs · NITs · IIITs
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setMode("jac");
                setPage(0);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                !isJosaa
                  ? "bg-white shadow-sm text-emerald-700 ring-1 ring-emerald-100"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <Building2 size={14} />
              <span className="hidden sm:inline">JAC Delhi</span>
              <span className="sm:hidden">JAC</span>
              {!isJosaa && (
                <span className="hidden md:inline text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                  DTU · NSUT · IGDTUW · IIIT-D
                </span>
              )}
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile filter toggle */}
            {(isJosaa ? josaaSearched : jacSearched) && (
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg"
              >
                <SlidersHorizontal size={13} /> Filters
              </button>
            )}
            {/* Bookmarks */}
            <button
              onClick={() => setBookmarkPanel(true)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                (isJosaa ? josaaBookmarks.size : jacBookmarks.size) > 0
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              <Bookmark size={13} />
              <span className="hidden sm:inline">Saved</span>
              {(isJosaa ? josaaBookmarks.size : jacBookmarks.size) > 0 && (
                <span className="bg-brand-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {isJosaa ? josaaBookmarks.size : jacBookmarks.size}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mode indicator bar */}
        <div
          className={cn(
            "h-0.5 transition-all",
            isJosaa ? "bg-brand-500" : "bg-emerald-500",
          )}
        />
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">
        {/* Context explainer banner */}
        {isJosaa ? <JosaaBanner /> : <JacBanner />}

        {/* Input form */}
        {isJosaa ? <JosaaInputForm /> : <JacInputForm />}

        {/* Results area */}
        {(isJosaa ? josaaSearched : jacSearched) ? (
          <div className="flex gap-5 items-start">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-[64px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
                {isJosaa ? (
                  <JosaaFilters
                    availableQuotas={availableQuotas}
                    availableSeatTypes={availableSeatTypes}
                  />
                ) : (
                  <JacFilters />
                )}
              </div>
            </aside>

            {/* Results column */}
            <div className="flex-1 min-w-0 space-y-4">
              {isJosaa ? (
                <>
                  <StatsRow
                    stats={jStats}
                    onExport={() => exportJosaaCsv(josaaResults)}
                    onCompare={() => setJosaaCompareOpen(true)}
                    compareCount={josaaCompare.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    accent="brand"
                    extraInfo={
                      <span className="text-xs text-slate-400">
                        {josaaProfile.advRank && (
                          <span>
                            JEE Adv:{" "}
                            <strong className="text-slate-600 font-mono">
                              {josaaProfile.advRank.toLocaleString()}
                            </strong>
                          </span>
                        )}
                        {josaaProfile.advRank && josaaProfile.mainRank && " · "}
                        {josaaProfile.mainRank && (
                          <span>
                            JEE Main:{" "}
                            <strong className="text-slate-600 font-mono">
                              {josaaProfile.mainRank.toLocaleString()}
                            </strong>
                          </span>
                        )}
                      </span>
                    }
                  />
                  {josaaResults.length === 0 ? (
                    <EmptyState
                      hasFilters={
                        josaaFilters.quotas.length > 0 ||
                        josaaFilters.seatTypes.length > 0
                      }
                      hasRank={
                        !!(josaaProfile.advRank || josaaProfile.mainRank)
                      }
                      onReset={resetJosaaFilters}
                      mode="josaa"
                    />
                  ) : viewMode === "card" ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {jPaged.map((r, i) => (
                          <JosaaCard
                            key={`${jKey(r)}-${i}`}
                            r={r}
                            bookmarked={josaaBookmarks.has(jKey(r))}
                            inCompare={josaaCompare.some(
                              (c) => jKey(c) === jKey(r),
                            )}
                            canCompare={josaaCompare.length < 3}
                            onBookmark={() => toggleJosaaBookmark(jKey(r))}
                            onCompare={() => toggleJosaaCompare(r)}
                          />
                        ))}
                      </div>
                      <Pagination
                        page={page}
                        total={josaaResults.length}
                        perPage={PER_PAGE}
                        onChange={changePage}
                      />
                    </>
                  ) : (
                    <JosaaTable
                      results={jPaged}
                      bookmarks={josaaBookmarks}
                      compare={josaaCompare}
                      onBookmark={toggleJosaaBookmark}
                      onCompare={toggleJosaaCompare}
                    />
                  )}
                </>
              ) : (
                <>
                  <StatsRow
                    stats={jcStats}
                    onExport={() => exportJacCSV(jacResults)}
                    onCompare={() => setJacCompareOpen(true)}
                    compareCount={jacCompare.length}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    accent="emerald"
                    extraInfo={
                      <div className="flex gap-1.5 flex-wrap">
                        {Object.entries(
                          jacResults.reduce<Record<string, number>>(
                            (acc, r) => ({
                              ...acc,
                              [r.institute]: (acc[r.institute] ?? 0) + 1,
                            }),
                            {},
                          ),
                        ).map(([inst, cnt]) => (
                          <span
                            key={inst}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium"
                          >
                            {inst}: {cnt}
                          </span>
                        ))}
                      </div>
                    }
                  />
                  {jacResults.length === 0 ? (
                    <EmptyState
                      hasFilters={jacFilters.institutes.length > 0}
                      hasRank={!!jacProfile.mainRank}
                      onReset={resetJacFilters}
                      mode="jac"
                    />
                  ) : viewMode === "card" ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {jcPaged.map((r, i) => (
                          <JacCard
                            key={`${jcKey(r)}-${i}`}
                            r={r}
                            bookmarked={jacBookmarks.has(jcKey(r))}
                            inCompare={jacCompare.some(
                              (c) => jcKey(c) === jcKey(r),
                            )}
                            canCompare={jacCompare.length < 3}
                            onBookmark={() => toggleJacBookmark(jcKey(r))}
                            onCompare={() => toggleJacCompare(r)}
                          />
                        ))}
                      </div>
                      <Pagination
                        page={page}
                        total={jacResults.length}
                        perPage={PER_PAGE}
                        onChange={changePage}
                      />
                    </>
                  ) : (
                    <JacTable
                      results={jcPaged}
                      bookmarks={jacBookmarks}
                      compare={jacCompare}
                      onBookmark={toggleJacBookmark}
                      onCompare={toggleJacCompare}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            hasFilters={false}
            hasRank={false}
            onReset={isJosaa ? resetJosaaFilters : resetJacFilters}
            mode={mode}
          />
        )}
      </main>

      {/* ── Mobile filter drawer ──────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[90vw] bg-white h-full shadow-2xl overflow-hidden">
            {isJosaa ? (
              <JosaaFilters
                availableQuotas={availableQuotas}
                availableSeatTypes={availableSeatTypes}
                onClose={() => setMobileFiltersOpen(false)}
              />
            ) : (
              <JacFilters onClose={() => setMobileFiltersOpen(false)} />
            )}
          </div>
        </div>
      )}

      {/* ── Bookmark side panel ───────────────────────────────────────────── */}
      {bookmarkPanel && (
        <BookmarkPanel
          josaaResults={jBookmarkedResults}
          jacResults={jcBookmarkedResults}
          mode={mode}
          josaaBookmarks={josaaBookmarks}
          jacBookmarks={jacBookmarks}
          onRemoveJosaa={toggleJosaaBookmark}
          onRemoveJac={toggleJacBookmark}
          onClose={() => setBookmarkPanel(false)}
        />
      )}

      {/* ── Compare modals ────────────────────────────────────────────────── */}
      {josaaCompareOpen && (
        <JosaaCompare
          items={josaaCompare}
          onClose={() => setJosaaCompareOpen(false)}
          onRemove={toggleJosaaCompare}
        />
      )}
      {jacCompareOpen && (
        <JacCompare
          items={jacCompare}
          onClose={() => setJacCompareOpen(false)}
          onRemove={toggleJacCompare}
        />
      )}
    </div>
  );
}

// ─── Loading Splash ────────────────────────────────────────────────────────────
function LoadingSplash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-brand-400/20 animate-ping" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center shadow-xl">
            <span className="text-3xl">🎓</span>
          </div>
        </div>
        <h1 className="text-white font-bold text-2xl mb-1">
          College Rank Predictor
        </h1>
        <p className="text-brand-300 text-sm mb-1 font-medium">
          JoSAA + JAC Delhi · 2025
        </p>
        <p className="text-slate-400 text-xs mb-6">
          Loading 13,442 cutoff records…
        </p>
        <div className="flex justify-center gap-1.5 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{
                animationDelay: `${i * 120}ms`,
                animationDuration: "800ms",
              }}
            />
          ))}
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {[
            {
              label: "23 IITs",
              c: "bg-violet-900/60 text-violet-300 border-violet-700",
            },
            {
              label: "31 NITs",
              c: "bg-sky-900/60 text-sky-300 border-sky-700",
            },
            {
              label: "24 IIITs",
              c: "bg-teal-900/60 text-teal-300 border-teal-700",
            },
            {
              label: "DTU+NSUT",
              c: "bg-blue-900/60 text-blue-300 border-blue-700",
            },
            {
              label: "IGDTUW+IIIT-D",
              c: "bg-pink-900/60 text-pink-300 border-pink-700",
            },
          ].map(({ label, c }) => (
            <span
              key={label}
              className={`text-xs px-3 py-1 rounded-full border font-medium ${c}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── JoSAA info banner ────────────────────────────────────────────────────────
function JosaaBanner() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const tips = [
    {
      icon: "✅",
      title: "Safe",
      desc: "Rank ≤85% of closing rank. Strong chance — place near top of choice list.",
      bg: "bg-emerald-50 border-emerald-100 text-emerald-800",
    },
    {
      icon: "🎯",
      title: "Target",
      desc: "Rank is 85–100% of closing. Competitive — include in middle of choices.",
      bg: "bg-blue-50 border-blue-100 text-blue-800",
    },
    {
      icon: "⬆️",
      title: "Ambitious",
      desc: "Rank within 8% over cutoff. Very risky — fill only as last options.",
      bg: "bg-amber-50 border-amber-100 text-amber-800",
    },
    {
      icon: "🏛️",
      title: "IIT vs NIT",
      desc: "IITs → JEE Advanced rank + AI quota. NITs/IIITs/GFTIs → JEE Main + HS/OS quota.",
      bg: "bg-violet-50 border-violet-100 text-violet-800",
    },
    {
      icon: "🏠",
      title: "Home State",
      desc: "NITs reserve ~50% for HS candidates. Select your state + HS quota for accurate results.",
      bg: "bg-sky-50 border-sky-100 text-sky-800",
    },
    {
      icon: "📊",
      title: "Data source",
      desc: "JoSAA 2025 Round 6 final closing ranks — most accurate allotment round.",
      bg: "bg-slate-50 border-slate-100 text-slate-700",
    },
  ];
  return (
    <div className="bg-brand-50 border border-brand-100 rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-start gap-3 flex-1 text-left hover:opacity-80"
        >
          <Info size={16} className="text-brand-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-800">
              JoSAA Counselling — IITs, NITs, IIITs & GFTIs
            </p>
            <p className="text-xs text-brand-500 mt-0.5">
              11,944 records · 128 institutes · JEE Advanced + JEE Main{" "}
              <span className="underline">
                {open ? "Hide guide" : "Show guide"}
              </span>
            </p>
          </div>
        </button>
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-lg hover:bg-brand-100 text-brand-500"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-brand-100 text-brand-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-brand-100 px-4 pb-4 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tips.map(({ icon, title, desc, bg }) => (
            <div key={title} className={`rounded-xl p-3 border text-xs ${bg}`}>
              <div className="font-semibold mb-1">
                {icon} {title}
              </div>
              <div className="opacity-80 leading-relaxed">{desc}</div>
            </div>
          ))}
          <p className="col-span-full text-xs text-brand-500 text-center pt-1">
            💡 Fill 15–20 choices. Mix Safe, Target, and Ambitious picks. Verify
            at josaa.nic.in before final submission.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── JAC info banner ──────────────────────────────────────────────────────────
function JacBanner() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const tips = [
    {
      icon: "🏛️",
      title: "4 Delhi institutes",
      desc: "DTU, NSUT, IGDTUW (women-only), IIIT-D — all via single JEE Main CRL rank.",
      bg: "bg-emerald-50 border-emerald-100 text-emerald-800",
    },
    {
      icon: "🏠",
      title: "Delhi vs Outside Delhi",
      desc: "~85% seats reserved for Delhi domicile. Outside Delhi quota is separate and competitive.",
      bg: "bg-sky-50 border-sky-100 text-sky-800",
    },
    {
      icon: "👧",
      title: "Girl subcategory",
      desc: "Girls can apply to both Gender-Neutral and Girl Child pools — more opportunities.",
      bg: "bg-pink-50 border-pink-100 text-pink-800",
    },
    {
      icon: "🏢",
      title: "NSUT 3 campuses",
      desc: "Main campus (Dwarka), East campus, West campus — branch availability varies by campus.",
      bg: "bg-blue-50 border-blue-100 text-blue-800",
    },
    {
      icon: "🎓",
      title: "IIIT-D board bonus",
      desc: '"With Bonus" rows apply if you scored well in Class 12 boards. Only 2 JAC rounds.',
      bg: "bg-purple-50 border-purple-100 text-purple-800",
    },
    {
      icon: "📋",
      title: "Category code",
      desc: "GNGND = General, Gender Neutral, Delhi. SCGLO = SC, Girl, Outside Delhi. Check the sidebar for full decoding.",
      bg: "bg-slate-50 border-slate-100 text-slate-700",
    },
  ];
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-start gap-3 flex-1 text-left hover:opacity-80"
        >
          <Info size={16} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              JAC Delhi Counselling — DTU, NSUT, IGDTUW, IIIT-D
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              1,498 records · 4 institutes · JEE Main rank only{" "}
              <span className="underline">
                {open ? "Hide guide" : "Show guide"}
              </span>
            </p>
          </div>
        </button>
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-500"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-emerald-100 px-4 pb-4 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tips.map(({ icon, title, desc, bg }) => (
            <div key={title} className={`rounded-xl p-3 border text-xs ${bg}`}>
              <div className="font-semibold mb-1">
                {icon} {title}
              </div>
              <div className="opacity-80 leading-relaxed">{desc}</div>
            </div>
          ))}
          <p className="col-span-full text-xs text-emerald-600 text-center pt-1">
            💡 JAC data shows round-wise cutoff progression. Final closing rank
            is most reliable. Verify at jacdelhi.admissions.nic.in
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Bookmark panel ──────────────────────────────────────────────────────────
interface BPProps {
  josaaResults: JosaaResult[];
  jacResults: JacResult[];
  mode: "josaa" | "jac";
  josaaBookmarks: Set<string>;
  jacBookmarks: Set<string>;
  onRemoveJosaa: (k: string) => void;
  onRemoveJac: (k: string) => void;
  onClose: () => void;
}

function BookmarkPanel({
  josaaResults,
  jacResults,
  mode,
  onRemoveJosaa,
  onRemoveJac,
  onClose,
}: BPProps) {
  const [activeTab, setActiveTab] = useState<"josaa" | "jac">(mode);
  const items = activeTab === "josaa" ? josaaResults : jacResults;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm">
      <div className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={16} className="text-brand-600" />
            <h2 className="font-bold text-slate-800">Saved Colleges</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100">
          {(["josaa", "jac"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "flex-1 py-3 text-xs font-semibold transition-colors",
                activeTab === t
                  ? "text-brand-600 border-b-2 border-brand-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {t === "josaa"
                ? `JoSAA (${josaaResults.length})`
                : `JAC (${jacResults.length})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No bookmarks yet</p>
              <p className="text-xs text-slate-300 mt-1">
                Click the bookmark icon on any card to save it here
              </p>
            </div>
          ) : (
            items.map((r, i) => {
              if (activeTab === "josaa") {
                const jr = r as JosaaResult;
                const k = jKey(jr);
                return (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          jr.instType === "IIT"
                            ? "bg-violet-100 text-violet-800"
                            : jr.instType === "NIT"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-teal-100 text-teal-800",
                        )}
                      >
                        {jr.instType}
                      </span>
                      <button
                        onClick={() => onRemoveJosaa(k)}
                        className="p-1 rounded hover:bg-red-50"
                      >
                        <X size={11} className="text-red-400" />
                      </button>
                    </div>
                    <p className="font-semibold text-slate-800 text-xs leading-snug">
                      {jr.institute}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {jr.program}
                    </p>
                    <div className="flex gap-2 mt-1.5 text-xs text-slate-500">
                      <span>
                        Close:{" "}
                        <span className="font-mono font-semibold text-slate-700">
                          {jr.closingRank?.toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          jr.rankGap >= 0
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        {jr.rankGap >= 0
                          ? `+${jr.rankGap.toLocaleString()}`
                          : jr.rankGap.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              } else {
                const jr = r as JacResult;
                const k = jcKey(jr);
                return (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {jr.institute}
                      </span>
                      <button
                        onClick={() => onRemoveJac(k)}
                        className="p-1 rounded hover:bg-red-50"
                      >
                        <X size={11} className="text-red-400" />
                      </button>
                    </div>
                    <p className="font-semibold text-slate-800 text-xs leading-snug">
                      {jr.instituteFull}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{jr.branch}</p>
                    <div className="flex gap-2 mt-1.5 text-xs text-slate-500">
                      <span>
                        Final:{" "}
                        <span className="font-mono font-semibold text-slate-700">
                          {jr.finalRank?.toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          jr.rankGap >= 0
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        {jr.rankGap >= 0
                          ? `+${jr.rankGap.toLocaleString()}`
                          : jr.rankGap.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
}
