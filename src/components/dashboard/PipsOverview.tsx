import React from 'react';

interface PipsOverviewProps {
  totalPips: number;
  dateRange: string;
}

/**
 * Forex Overview tab — background image only, no content overlay.
 */
export function PipsOverview({ totalPips, dateRange }: PipsOverviewProps) {
  return <div className="h-full" />;
}


