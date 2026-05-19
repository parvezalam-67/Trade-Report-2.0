import { useRef, useState, useMemo } from 'react';
import { Loader2, RefreshCw, AlertCircle, Download, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import { Sidebar } from './components/dashboard/Sidebar';
import { TradeTable } from './components/dashboard/TradeTable';
import { PipsOverview } from './components/dashboard/PipsOverview';
import { useDashboard } from './hooks/useDashboard';
import { useDownload } from './hooks/useDownload';
import { cn } from './lib/utils';
import { TechnicalChartBackground } from './components/dashboard/TechnicalChartBackground';
import { Category, WeekFilter } from './types';
import { AnimatePresence, motion } from 'motion/react';
import forexBg from './public/forex.jpg';
import goldBg from './public/gold.jpg';
import indicesBg from './public/indices.jpg';

/**
 * Main Application Dashboard.
 * Professional refactored architecture using custom hooks and layered UI.
 */
export default function App() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('FOREX');
  const [view, setView] = useState<'table' | 'overview'>('table');
  const [weekFilter, setWeekFilter] = useState<WeekFilter>({ weekStart: 0, weekEnd: 0 });

  // ── Custom date range ──────────────────────────────────────────────────────
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');

  // API always returns ALL trades regardless of weekFilter, so use it directly
  const { data, loading, refreshing, error, refresh } = useDashboard(activeCategory, weekFilter);
  const { download, isExporting } = useDownload(dashboardRef);

  // Enrich trades with full calendar dates (Gregorian-safe across New Year boundaries)
  const enrichedTrades = useMemo(() => {
    if (!data?.trades) return [];
    
    // Copy the trades so we don't mutate original data
    const tradesCopy = data.trades.map(t => ({ ...t }));
    
    const monthMap: Record<string, number> = {
      JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
      JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
    };

    let currentYear = new Date().getFullYear(); // e.g. 2026
    let lastMonthVal = 0;
    
    // Iterate backwards to dynamically assign correct calendar years
    for (let i = tradesCopy.length - 1; i >= 0; i--) {
      const t = tradesCopy[i];
      const parts = t.date.toUpperCase().replace(/,/g, '').split(/[-\s/]+/);
      const monthStr = parts[0]?.substring(0, 3) || 'JAN';
      const monthVal = monthMap[monthStr] || 1;
      const dayVal = parseInt(parts[1], 10) || 1;
      
      if (lastMonthVal > 0 && monthVal > lastMonthVal) {
        // Crossed New Year going backwards (e.g. from Jan to Dec)
        currentYear--;
      }
      
      lastMonthVal = monthVal;
      
      const mm = String(monthVal).padStart(2, '0');
      const dd = String(dayVal).padStart(2, '0');
      (t as any).formattedDate = `${currentYear}-${mm}-${dd}`;
    }
    
    return tradesCopy;
  }, [data]);

  /** Trades filtered by the custom date range (identity when not in custom mode) */
  const displayData = useMemo(() => {
    if (!data) return null;
    if (!isCustomMode || (!customFrom && !customTo)) return data;
    
    const filtered = enrichedTrades.filter(t => {
      const d = (t as any).formattedDate;
      if (customFrom && d < customFrom) return false;
      if (customTo && d > customTo) return false;
      return true;
    });

    const totalPips = filtered.reduce((s: number, t: any) => s + t.net, 0);
    const dateRange = filtered.length
      ? `${filtered[0].date} - ${filtered[filtered.length - 1].date}`
      : '—';
      
    return { ...data, trades: filtered, totalPips, dateRange };
  }, [data, isCustomMode, enrichedTrades, customFrom, customTo]);

  const toggleView = () => setView(prev => prev === 'table' ? 'overview' : 'table');
  const isGold = activeCategory === 'GOLD';
  const isIndices = activeCategory === 'INDICES';

  const categories: Category[] = ['FOREX', 'GOLD', 'INDICES'];

  const accentColor = isGold ? '#FFD700' : isIndices ? '#3B82F6' : '#00FF00';
  const accentShadow = isGold
    ? 'rgba(255,215,0,0.3)'
    : isIndices ? 'rgba(59,130,246,0.3)' : 'rgba(0,255,0,0.3)';

  const availableWeeks = data?.availableWeeks ?? [];
  const latestWeek = availableWeeks.length ? availableWeeks[availableWeeks.length - 1] : 0;

  // Human-readable labels for each preset
  const HUMAN_LABELS: Record<string, string> = {
    '1W': 'This Week',
    '2W': 'Last 2 Weeks',
    '3W': 'Last 3 Weeks',
    '4W': 'Last 4 Weeks',
    '1M': 'Last 1 Month',
    '2M': 'Last 2 Months',
    '3M': 'Last 3 Months',
  };

  // Period presets relative to the latest week in the sheet
  const periodPresets = latestWeek > 0 ? [
    { label: '1W', humanLabel: 'This Week',      weekStart: latestWeek,      weekEnd: latestWeek },
    { label: '2W', humanLabel: 'Last 2 Weeks',   weekStart: Math.max(1, latestWeek - 1),  weekEnd: latestWeek },
    { label: '3W', humanLabel: 'Last 3 Weeks',   weekStart: Math.max(1, latestWeek - 2),  weekEnd: latestWeek },
    { label: '4W', humanLabel: 'Last 4 Weeks',   weekStart: Math.max(1, latestWeek - 3),  weekEnd: latestWeek },
    { label: '1M', humanLabel: 'Last 1 Month',   weekStart: Math.max(1, latestWeek - 4),  weekEnd: latestWeek },
    { label: '2M', humanLabel: 'Last 2 Months',  weekStart: Math.max(1, latestWeek - 8),  weekEnd: latestWeek },
    { label: '3M', humanLabel: 'Last 3 Months',  weekStart: Math.max(1, latestWeek - 12), weekEnd: latestWeek },
  ] : [];

  const isActivePreset = (p: { weekStart: number; weekEnd: number }) =>
    weekFilter.weekStart === p.weekStart && weekFilter.weekEnd === p.weekEnd;

  // The human label of the currently active preset
  const activeHumanLabel = (() => {
    if (!isCustomMode) {
      return periodPresets.find(p => isActivePreset(p))?.humanLabel
        ?? (weekFilter.weekStart === 0 ? 'This Week' : 'Custom');
    }
    // Both dates picked → calculate span
    if (customFrom && customTo) {
      const days = Math.round(
        (new Date(customTo).getTime() - new Date(customFrom).getTime()) / 86_400_000
      ) + 1;
      if (days <= 7)  return 'This Week';
      if (days <= 30) return `Last ${days} Days`;
      if (days <= 60) return 'This Month';
      return 'Last 2 Months';
    }
    // Only one date picked
    return 'Custom';
  })();

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setWeekFilter({ weekStart: 0, weekEnd: 0 });
    setIsCustomMode(false);
    setCustomFrom('');
    setCustomTo('');
  };

  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4 min-h-screen bg-[#020802]">
      {/* Category Tabs */}
      <nav className="flex gap-4 p-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl z-[70] ignore-export">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              "px-8 py-3 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] transition-all",
              activeCategory === cat
                ? (
                  cat === 'GOLD' ? "bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]" :
                    cat === 'INDICES' ? "bg-[#3B82F6] text-black shadow-[0_0_20px_rgba(59,130,246,0.3)]" :
                      "bg-[#00FF00] text-black shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                )
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* ── Period Filter Bar ── */}
      <div className="flex flex-col items-center gap-2 ignore-export">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.3em]">Period</span>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl">
            {periodPresets.map(p => (
              <button
                key={p.label}
                title={p.humanLabel}
                onClick={() => {
                  setWeekFilter({ weekStart: p.weekStart, weekEnd: p.weekEnd });
                  setIsCustomMode(false);
                }}
                className={cn(
                  "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                  !isCustomMode && isActivePreset(p)
                    ? 'text-black'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                )}
                style={!isCustomMode && isActivePreset(p)
                  ? { backgroundColor: accentColor, boxShadow: `0 0 16px ${accentShadow}` }
                  : {}}
              >
                {p.label}
              </button>
            ))}

            {/* ── CUSTOM button ── */}
            <button
              title="Pick a custom date range"
              onClick={() => {
                const nextMode = !isCustomMode;
                setIsCustomMode(nextMode);
                if (nextMode) {
                  setWeekFilter({ weekStart: 1, weekEnd: 9999 });
                } else {
                  setWeekFilter({ weekStart: 0, weekEnd: 0 });
                }
              }}
              className={cn(
                "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                isCustomMode ? 'text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
              )}
              style={isCustomMode
                ? { backgroundColor: accentColor, boxShadow: `0 0 16px ${accentShadow}` }
                : {}}
            >
              Custom
            </button>
          </div>

          {/* Human-readable label of the selected period */}
          <span
            className="text-[10px] font-black uppercase tracking-widest transition-all"
            style={{ color: accentColor }}
          >
            {activeHumanLabel}
          </span>
        </div>

        {/* ── Custom date range picker (slides in when CUSTOM is active) ── */}
        {isCustomMode && (
          <div
            className="flex items-center gap-4 px-5 py-3 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-xl"
            style={{ boxShadow: `0 0 24px ${accentShadow}` }}
          >
            {/* FROM */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: accentColor }}>From</span>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white font-bold outline-none focus:border-white/30 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <span className="text-white/20 font-black text-lg">→</span>

            {/* TO */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: accentColor }}>To</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white font-bold outline-none focus:border-white/30 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Result count */}
            {(customFrom || customTo) && (
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                {displayData?.trades.length ?? 0} trades
              </span>
            )}

            {/* Clear */}
            {(customFrom || customTo) && (
              <button
                onClick={() => { setCustomFrom(''); setCustomTo(''); }}
                className="text-[9px] font-black text-white/25 hover:text-red-400 uppercase tracking-widest transition-all"
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1:1 Aspect Ratio Canvas Container Wrapper */}
      <div className="relative w-full max-w-[1000px] aspect-square group">
        <div
          ref={dashboardRef}
          className="relative w-full h-full bg-[#010501] overflow-hidden rounded-[32px] shadow-2xl flex border border-white/5"
        >
          {/* Layer 0: Background Textures */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className={cn(
              "absolute top-0 right-0 w-full h-full",
              isGold
                ? "bg-[radial-gradient(circle_at_80%_20%,#332200_0%,transparent_50%)]"
                : isIndices
                  ? "bg-[radial-gradient(circle_at_80%_20%,#001a33_0%,transparent_50%)]"
                  : "bg-[radial-gradient(circle_at_80%_20%,#002200_0%,transparent_50%)]",
              view === 'table' ? "opacity-60" : "opacity-20"
            )} />
            <div className={cn(
              "absolute bottom-0 left-0 w-full h-full",
              isGold
                ? "bg-[radial-gradient(circle_at_20%_80%,#221100_0%,transparent_50%)]"
                : isIndices
                  ? "bg-[radial-gradient(circle_at_20%_80%,#000d1a_0%,transparent_50%)]"
                  : "bg-[radial-gradient(circle_at_20%_80%,#001100_0%,transparent_50%)]",
              view === 'table' ? "opacity-40" : "opacity-10"
            )} />

            {/* Universal Technical SVG Chart Background (Replaces Grid) */}
            <div className={cn(view === 'table' ? "opacity-100" : "opacity-30")}>
              <TechnicalChartBackground />
            </div>

            {/* Overview Background Image - full canvas, changes per active category */}
            {view === 'overview' && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
                  style={{
                    backgroundImage: `url(${
                      activeCategory === 'GOLD' ? goldBg
                      : activeCategory === 'INDICES' ? indicesBg
                      : forexBg
                    })`
                  }}
                />
                <div className="absolute inset-0 bg-black/55" />
              </>
            )}

          </div>

          {/* Layer 1: Dashboard UI */}
          <div className="relative z-10 w-full h-full flex">
            {/* Identity Sidebar - Unified on Overview */}
            <div className={cn(
              "w-[32%] shrink-0",
              view === 'table' ? "border-r border-white/5 bg-black/10 backdrop-blur-md" : "border-r-0 bg-transparent"
            )}>
              <Sidebar
                dateRange={displayData?.dateRange || 'SYNCING...'}
                totalPips={displayData?.totalPips || 0}
                weekLabel={activeHumanLabel}
                view={view}
                category={activeCategory}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-8 lg:p-10 relative overflow-hidden">
              {/* Main Feed Engine */}
              <main className="flex-1 min-h-0 relative mt-4">
                {error ? (
                  <div className="h-full flex items-center justify-center p-10 bg-red-500/5 rounded-2xl border border-red-500/10 backdrop-blur-md">
                    <div className="text-center space-y-6">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" strokeWidth={2.5} />
                      <div>
                        <h4 className="text-red-500 font-black uppercase tracking-widest text-xs mb-2">Protocol Disruption</h4>
                        <p className="text-white/40 text-[11px] leading-relaxed max-w-[240px] mx-auto uppercase">
                          Spreadsheet handshake failed. Verify ID and public access.
                        </p>
                      </div>
                      <button
                        onClick={() => refresh()}
                        className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-red-500/30 transition-all"
                      >
                        Restart Engine
                      </button>
                    </div>
                  </div>
                ) : loading && !data ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-lg">
                    <Loader2 className="w-12 h-12 text-[#00FF00] opacity-40" strokeWidth={1.5} />
                    <div className="text-center">
                      <p className="text-[11px] text-[#00FF00] font-black tracking-[0.5em] uppercase">decrypting_feed.bin</p>
                      <p className="text-[9px] text-white/20 font-black mt-2 uppercase tracking-widest">Awaiting Remote Synchronizer...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    {view === 'table' ? (
                      displayData && <TradeTable trades={displayData.trades} category={activeCategory} />
                    ) : (view === 'overview' && displayData) ? (
                      <PipsOverview totalPips={displayData.totalPips} dateRange={displayData.dateRange} />
                    ) : null}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        {/* View Switcher Arrow - OUTSIDE the dashboardRef Ref area so it's not captured in screenshot */}
        <button
          onClick={toggleView}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 flex items-center justify-center bg-black/80 hover:bg-black text-[#00FF00] rounded-full border border-white/10 shadow-xl transition-all"
          title={view === 'table' ? 'Switch to Overview' : 'Back to List'}
        >
          {view === 'table' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Control Station - Desktop Only */}
      <div className="flex gap-4 items-center ignore-export">
        <button
          onClick={refresh}
          disabled={refreshing || loading}
          className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 overflow-hidden"
        >
          <RefreshCw className={cn("w-4 h-4 text-[#00FF00]")} />
          <span className="font-black uppercase text-[10px] tracking-widest">Force Refresh</span>
        </button>

        <button
          onClick={download}
          disabled={loading || !data || isExporting}
          className="group relative flex items-center gap-3 px-10 py-4 bg-[#00FF00] hover:bg-[#39ff39] text-black rounded-2xl transition-all font-black shadow-[0_0_30px_rgba(0,255,0,0.2)] disabled:opacity-50 disabled:grayscale"
        >
          {isExporting ? <Loader2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span className="uppercase text-[10px] tracking-widest">Generate Export</span>
        </button>

        <a
          href={(() => {
            const raw = import.meta.env.VITE_SPREADSHEET_ID || '';
            // If it's already a full URL, swap /pubhtml → /edit (or strip to base)
            if (raw.includes('docs.google.com')) {
              return raw.split('/pubhtml')[0].split('/pub')[0] + '/edit';
            }
            return `https://docs.google.com/spreadsheets/d/${raw}/edit`;
          })()}
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all border border-white/10"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
