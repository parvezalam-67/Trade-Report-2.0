import { useMemo } from 'react';
import { TradeRecord } from '../../types';
import { cn } from '../../lib/utils';

interface TradeTableProps {
  trades: TradeRecord[];
  category?: string;
}

/**
 * Professional Trade Ledger Component.
 * Refactored to implement grouped blocks by date with high-fidelity UI.
 */
export function TradeTable({ trades, category = 'FOREX' }: TradeTableProps) {
  // Limit to most recent trades for performance in screenshot
  const displayTrades = useMemo(() => trades.slice(0, 50), [trades]);

  // Group trades by date
  const groupedTrades = useMemo(() => {
    const groups: { date: string; trades: TradeRecord[] }[] = [];
    displayTrades.forEach((trade) => {
      const existingGroup = groups.find((g) => g.date === trade.date);
      if (existingGroup) {
        existingGroup.trades.push(trade);
      } else {
        groups.push({ date: trade.date, trades: [trade] });
      }
    });
    return groups;
  }, [displayTrades]);

  const isGold = category === 'GOLD';
  const isIndices = category === 'INDICES';

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header Station - Aligned with Rows */}
      <div className="flex mb-3 bg-white/[0.05] border border-white/10 rounded-[5px] backdrop-blur-md z-20 shadow-lg overflow-hidden">
        <div className="w-[10%] shrink-0 flex items-center justify-center border-r border-white/10 bg-white/[0.04] py-2">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.1em] text-center">Date</span>
        </div>
        <div className="flex-1 grid grid-cols-[30.3%_18.1%_30.3%_21.1%] px-3 py-2 items-center">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] text-center">Pair</span>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] text-center">Type</span>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] text-center">Entry</span>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] text-center">Net</span>
        </div>
      </div>

      {/* Grouped Feed - No scrolling, dynamic density per row height */}
      <div className="flex-1 flex flex-col justify-center min-h-0 space-y-1.5">
        {groupedTrades.map((group) => (
          <div 
            key={group.date}
            style={{ flex: group.trades.length }}
            className="flex min-h-0 border border-white/10 rounded-[5px] bg-black/30 backdrop-blur-sm overflow-hidden shadow-xl"
          >
            {/* Left Wing: The Date Badge */}
            <div className="w-[10%] shrink-0 flex items-center justify-center border-r border-white/10 bg-white/[0.04]">
              <span className="text-[12px] font-black text-white uppercase tracking-tighter text-center leading-[1.1]">
                {group.date.split(' ').map((part, i) => (
                  <span key={i} className="block">{part}</span>
                ))}
              </span>
            </div>

            {/* Right Wing: The Trade Data */}
            <div className="flex-1 flex flex-col justify-center">
              {group.trades.map((trade, idx) => (
                <div 
                  key={`${trade.pair}-${idx}`}
                  className={cn(
                    "grid grid-cols-[30.3%_18.1%_30.3%_21.1%] px-3 items-center flex-1 min-h-0",
                    idx !== 0 && "border-t border-white/[0.03]"
                  )}
                >
                  <div className="text-[10px] lg:text-[11px] font-black text-white uppercase tracking-[0.1em] text-center truncate">
                    {trade.pair}
                  </div>
                  <div className={cn(
                    "text-[9px] lg:text-[10px] font-black text-center uppercase tracking-widest",
                    trade.type.includes('BUY') ? 'text-blue-400' : 
                    trade.type.includes('SELL') ? 'text-orange-500' : 'text-white'
                  )}>
                    {trade.type}
                  </div>
                  <div className="text-[9px] lg:text-[10px] font-black text-white text-center font-mono">
                    {trade.entry}
                  </div>
                  <div className={cn(
                    "text-[12px] lg:text-[13px] font-black text-center tabular-nums",
                    trade.net >= 0 
                      ? (isGold ? "text-[#FFD700] text-shadow-[0_0_10px_rgba(255,215,0,0.3)]" : (isIndices ? "text-[#3B82F6] text-shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-[#00FF00] text-shadow-[0_0_10px_rgba(0,255,0,0.3)]")) 
                      : "text-red-500 text-shadow-[0_0_10px_rgba(255,49,49,0.3)]"
                  )}>
                    {Math.abs(trade.net)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {trades.length === 0 && (
          <div className="h-full flex items-center justify-center py-20 opacity-20">
            <p className="font-black text-xs uppercase tracking-[0.5em]">No data records</p>
          </div>
        )}
      </div>
    </div>
  );
}
