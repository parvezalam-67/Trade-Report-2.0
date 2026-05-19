import { cn } from '../../lib/utils';
import { WeekFilter } from '../../types';
import myfxReview from '../../public/myfx_book_review.png';

interface SidebarProps {
  dateRange: string;
  totalPips: number;
  weekLabel?: string;
  availableWeeks?: number[];
  weekFilter?: WeekFilter;
  onWeekFilterChange?: (f: WeekFilter) => void;
  view?: 'table' | 'overview';
  category?: string;
}

export function Sidebar({
  dateRange,
  totalPips,
  weekLabel,
  availableWeeks = [],
  weekFilter = { weekStart: 0, weekEnd: 0 },
  onWeekFilterChange,
  view = 'table',
  category = 'FOREX',
}: SidebarProps) {
  const isOverview = view === 'overview';
  const isGold     = category === 'GOLD';
  const isIndices  = category === 'INDICES';

  const accentColor = isGold ? '#FFD700' : isIndices ? '#3B82F6' : '#00FF00';

  // Derive display label: "This Week", "2 Weeks", "Monthly", etc.
  const periodLabel = weekLabel || 'This Week';

  // Build week range options from availableWeeks
  const latestWeek = availableWeeks.length ? availableWeeks[availableWeeks.length - 1] : 0;

  // Quick-select presets: single weeks and multi-week spans relative to latest
  const presets = availableWeeks.length > 0 ? [
    { label: '1W', weekStart: latestWeek, weekEnd: latestWeek },
    ...(availableWeeks.length >= 2
      ? [{ label: '2W', weekStart: latestWeek - 1, weekEnd: latestWeek }]
      : []),
    ...(availableWeeks.length >= 3
      ? [{ label: '3W', weekStart: latestWeek - 2, weekEnd: latestWeek }]
      : []),
    ...(availableWeeks.length >= 4
      ? [{ label: '4W', weekStart: latestWeek - 3, weekEnd: latestWeek }]
      : []),
    ...(availableWeeks.length >= 5
      ? [{ label: '1M', weekStart: latestWeek - 4, weekEnd: latestWeek }]
      : []),
    ...(availableWeeks.length >= 9
      ? [{ label: '2M', weekStart: latestWeek - 8, weekEnd: latestWeek }]
      : []),
    ...(availableWeeks.length >= 13
      ? [{ label: '3M', weekStart: latestWeek - 12, weekEnd: latestWeek }]
      : []),
  ] : [];

  const isActive = (p: { weekStart: number; weekEnd: number }) =>
    weekFilter.weekStart === p.weekStart && weekFilter.weekEnd === p.weekEnd;

  const handlePreset = (p: { weekStart: number; weekEnd: number }) => {
    onWeekFilterChange?.({ weekStart: p.weekStart, weekEnd: p.weekEnd });
  };

  return (
    <div className="flex flex-col h-full text-white p-6 lg:p-8 relative">
      {/* Brand Section */}
      <div className="mb-6">
        <svg
          id="Layer_2"
          data-name="Layer 2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 731.55 96.11"
          className="w-auto h-8 lg:h-5"
        >
          <defs>
            <style>
              {`
                .cls-1 { fill: #48b95e; }
                .cls-2 { fill: #fefefe; }
              `}
            </style>
          </defs>
          <g id="Layer_1-2" data-name="Layer 1">
            <g>
              <path className="cls-1" d="M241.94,20.18l-10.79-.18c-1.81-.03-2.59-1.75-3.01-2.64-.52-1.09-.37-3.86,1.13-3.92l12.97-.53c-.7-1.73-.41-5.77,1.67-5.76l59.71.05c.64,6.45.82,12.11-.29,18.77l-61.17.18-.2-5.97Z"/>
              <path className="cls-1" d="M230.94,84.11l-12.95.02c-2,0-3.35-1.37-3.85-2.75-.39-1.09.28-4.08,1.89-4.1l14.87-.17c.07-2.14.02-3.62.74-5.89l57.31-.14-.03,18-57.69.05-.3-5.01Z"/>
              <g>
                <path className="cls-2" d="M13,96.11h-3c-3.13-4.45,3.54-9.02-.27-10.66-4.14-1.78-7.21-4.08-9.73-7.34v-4c5-5.09,5.08,3.94,13.93,7.25l7.83-19.16-8.79-10.15c-4.96-5.73-9.37-12.35-10.82-19.9C.29,22.46,5.03,14.12,13.5,9.42c9.5-5.28,20.87-5.5,31.46-2.48l2.33-5.55c.53-1.26,2.07-1.64,3.17-1.23,2.51.92,1.66,4.49-.41,8.8,5.53,3.32,10.74,6.39,8.51,9.21-.6.76-2.3,1.71-3.49.86l-7.54-5.36-6.87,18.29,11.82,13.71c4.58,5.31,8.6,11.31,9.55,18.28,1.28,9.39-3.04,16.86-11.09,21.27-10.59,5.81-22.99,6.39-34.69,2.83-1.08,3.18-1.9,5.71-3.25,8.06ZM36.59,27.03l6.74-15.39-8.43-1.65c-1.8-.35-5.59,1.07-5.37,3.26.52,5.18,3.87,9.3,7.06,13.78ZM32.75,84.5c5.63-2.54-1.81-10.52-7.34-17.56l-6.87,16.55c4.65,1.5,9.21,2.41,14.21,1.01Z"/>
                <path className="cls-2" d="M188.16,88.16l-3.11-26.12c-.17-1.4-.17-2.65-.94-3.54-.85-.99-2.23-1.48-4.05-1.45l-11.02.19-4.53,30.62-22.75.23,3.27-27.03,8.45-57.68,44.19.04c8.58,0,15.82,5.47,19.1,12.92,1.49,15.73-.71,29.56-16.57,32.43,5.21,3.1,7.53,6.79,8.24,11.93l3.82,27.37-24.08.08ZM190.69,20.52l-16.54-.38-3.1,18.77c5.44-.03,11.55,1.09,17.3-.49,5-1.37,8.33-17.76,2.34-17.9Z"/>
                <path className="cls-2" d="M147.78,4.27l-9.03,60.39c-2.65,8.88-7.07,17.43-15.85,21.35-13.24,5.9-29.43,5.66-42.24-.23-10.38-4.77-13.15-16.55-11.98-27.84l1.13-10.88,6.36-42.92h23.58s-7.98,58.81-7.98,58.81c-.34,2.51,1.33,5.37,2.31,6.66,1.31,1.71,4.84,1.29,6.74,1.55,7.66,1.06,12.91-2.44,14.42-10.02,3.76-18.81,5.92-37.62,8.74-56.96l23.78.1Z"/>
              </g>
              <path className="cls-1" d="M281.09,52.05c-.1,2.49.17,4.34-.69,6.93l-49.29.17-.18-6.97-9.58-.22c-.68-1.52-.7-4.6.28-5.65,3.05-3.27,11.4,2.37,9.22-6.05l49.96-.2.37,5.07,11.85.21c2.22.04,2.94,5.71.77,6.32-4,1.12-7.61.26-12.7.39Z"/>
              <g>
                <path className="cls-2" d="M625.05,22.11c-5.72,0-5.77,7.26-5.91,16h30s-2.33,15.98-2.33,15.98l-30.19.06-5.04,34.03-23.71-.12,9.09-65.95-23.86.04-9.46,66.02-23.75-.11,9.38-65.91-23.43-.07,2.03-17.87,71.5-.03c-.78,5.02-2.1,8.02-1.04,12.07,3.4-7.55,10.07-12.77,18.75-12.96,7.48-.17,14.91-.81,22.36.49l38.74.4,9.62,32.7,19.63-32.69,24.1.33-25.05,40.62,14.97,42.57-23.37.35-10.69-35.29-20.8,35.26-25.25-.07,26.94-42.85-3.71-12.64-7.14-20.52-1.81,10.15h-30.59Z"/>
                <path className="cls-2" d="M494.52,89.22c-12.21,1.74-24.01,1.49-34.52-4.19-9.44-5.1-12.12-20.31-10.6-31.48,2.26-16.61,4.69-39.74,19.97-47,12.25-5.82,26.6-5.53,39.44-2.4,14.08,3.43,18.55,17.36,17.61,31.29-1.69,25.06-5.13,49.98-31.9,53.78ZM496.47,63.47c3.55-11.97,8.64-34.8,3.13-40.42-1.95-1.99-5.19-3.14-8.53-2.97-5.68.29-10.19,2.94-11.76,8.42-3.48,12.2-8.42,34.42-2.91,40.74,2.88,3.3,17.11,4.19,20.07-5.77Z"/>
                <polygon className="cls-2" points="440.61 87.89 416.8 88.09 422.02 52.12 398.86 52.17 393.81 88.1 369.85 88.08 375.52 49.69 381.83 4.16 405.29 4.38 401.65 34.82 424.13 35.06 428.91 4.16 452.38 4.16 440.61 87.89"/>
                <path className="cls-2" d="M349.33,89.17c-7.46.78-14.65,1.54-21.81.48-7.69-1.14-15.5-1.03-22.75-4.2l1.96-16.13,24.17.1c6.86.03,14.71,1.03,16-4.02.83-3.21-.71-5.65-4.22-7.09-7.37-3.01-14.62-6.36-21.46-10.32-13.82-8-11.01-30.97-2.36-39,10.63-9.86,40.3-7.69,55.96-2.96.44,6.23-.97,15.08-1.72,15.63-.6.44-1.82-.54-3.1-.53l-29.57.25c-2.92.03-4.79,2.3-5.32,4.47s.68,4.72,3.33,5.96l19.49,9.11c11.23,5.25,14.6,14.92,12.66,26.52s-8.36,20.38-21.26,21.74Z"/>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* MyFxBook Review Image */}
      <div className="mb-6">
        <img
          src={myfxReview}
          alt="MyFxBook Review"
          className="w-full max-w-[180px] object-contain"
        />
      </div>

      {/* Hero Text */}
      <div className="space-y-4 mb-4">
        <div>
          <h2 className={cn(
            "font-black leading-tight uppercase tracking-tighter transition-all",
            isGold ? "text-[#FFD700]" : (isIndices ? "text-[#3B82F6]" : "text-[#00FF00]"),
            isOverview
              ? "text-[32px] lg:text-[46px] whitespace-nowrap"
              : "text-[24px] lg:text-[32px] max-w-[200px] lg:max-w-[280px]"
          )}>
            Sureshot {category}
          </h2>
          <h3 className={cn(
            "font-black text-[#FFD700] leading-[0.8] transition-all",
            isOverview ? "text-[80px] lg:text-[115px] mb-8" : "text-[60px] lg:text-[80px] mb-4"
          )}>
            VIP
          </h3>
        </div>

        <div className="space-y-2">
          <p className={cn(
            "font-bold tracking-tight text-white/90 transition-all",
            isOverview ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl"
          )}>
            ({dateRange})
          </p>

          <div className="font-black uppercase tracking-[-0.02em] opacity-95 transition-all space-y-0 leading-[1.05]">
            <p className={cn(
              "transition-all whitespace-nowrap",
              isOverview ? "text-xl lg:text-[28px]" : "text-[15px] lg:text-[20px]"
            )}>
              {periodLabel}
            </p>
            <p className={cn(
              "transition-all",
              isOverview ? "text-2xl lg:text-[42px]" : "text-xl lg:text-[30px]"
            )}>Performance</p>
            <p className={cn(
              "transition-all",
              isOverview ? "text-2xl lg:text-[42px]" : "text-xl lg:text-[30px]"
            )}>Overview</p>
          </div>
        </div>
      </div>

      {/* Week Selector — only shown in table view and when we have data */}
      {!isOverview && presets.length > 0 && onWeekFilterChange && (
        <div className="mt-2 mb-3">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Duration</p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all border",
                  isActive(p)
                    ? "border-transparent text-black"
                    : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                )}
                style={isActive(p) ? { backgroundColor: accentColor } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pips Counter */}
      <div className={cn("mt-auto", isOverview ? "pt-0 pb-10" : "pt-4")}>
        <div className={cn(
          "flex",
          isOverview ? "flex-row items-baseline gap-x-4 scale-125 origin-left whitespace-nowrap" : "flex-col gap-y-0"
        )}>
          <span className={cn(
            "font-[1000] leading-none tracking-[-0.07em]",
            isGold    ? "text-[#FFD700] drop-shadow-[0_0_40px_rgba(255,215,0,0.4)]" :
            isIndices ? "text-[#3B82F6] drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]" :
                        "text-[#00FF00] drop-shadow-[0_0_40px_rgba(0,255,0,0.4)]",
            isOverview ? "text-[85px] lg:text-[140px]" : "text-[55px] lg:text-[85px]"
          )}>
            {totalPips >= 0 ? `${totalPips}+` : totalPips}
          </span>
          <span className={cn(
            "font-[1000] text-white leading-none uppercase",
            isOverview ? "text-[85px] lg:text-[140px] tracking-[-0.02em]" : "text-[55px] lg:text-[85px] tracking-[0.1em] opacity-90 mt-[-25px] lg:mt-[-35px]"
          )}>
            PIPS
          </span>
        </div>
      </div>
    </div>
  );
}
