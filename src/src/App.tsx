import { useRef, useState } from 'react';
import { Loader2, RefreshCw, AlertCircle, Download, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import { Sidebar } from './components/dashboard/Sidebar';
import { TradeTable } from './components/dashboard/TradeTable';
import { PipsOverview } from './components/dashboard/PipsOverview';
import { useDashboard } from './hooks/useDashboard';
import { useDownload } from './hooks/useDownload';
import { cn } from './lib/utils';
import { TechnicalChartBackground } from './components/dashboard/TechnicalChartBackground';
import { Category } from './types';
import { AnimatePresence, motion } from 'motion/react';

/**
 * Main Application Dashboard.
 * Professional refactored architecture using custom hooks and layered UI.
 */
export default function App() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('FOREX');
  const [view, setView] = useState<'table' | 'overview'>('table');
  const { data, loading, refreshing, error, refresh } = useDashboard(activeCategory);
  const { download, isExporting } = useDownload(dashboardRef);

  const toggleView = () => setView(prev => prev === 'table' ? 'overview' : 'table');
  const isGold = activeCategory === 'GOLD';
  const isIndices = activeCategory === 'INDICES';

  const categories: Category[] = ['FOREX', 'GOLD', 'INDICES'];

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-4 min-h-screen bg-[#020802]">
      {/* Category Tabs - OUTSIDE of canvas Ref area */}
      <nav className="flex gap-4 p-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl z-[70] ignore-export">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
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
          </div>

          {/* Layer 1: Dashboard UI */}
          <div className="relative z-10 w-full h-full flex">
            {/* Identity Sidebar - Unified on Overview */}
            <div className={cn(
              "w-[32%] shrink-0",
              view === 'table' ? "border-r border-white/5 bg-black/10 backdrop-blur-md" : "border-r-0 bg-transparent"
            )}>
              <Sidebar
                dateRange={data?.dateRange || 'SYNCING...'}
                totalPips={data?.totalPips || 0}
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
                      data && <TradeTable trades={data.trades} category={activeCategory} />
                    ) : (view === 'overview' && data) ? (
                      <PipsOverview totalPips={data.totalPips} dateRange={data.dateRange} />
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
          href={`https://docs.google.com/spreadsheets/d/${import.meta.env.VITE_SPREADSHEET_ID}`}
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
