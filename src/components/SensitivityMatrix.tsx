import React from 'react';
import { StockAsset, SensitivityCell } from '../types/finance';
import { Table, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SensitivityMatrixProps {
  asset: StockAsset;
  grid: SensitivityCell[][];
  userGrowth: number;
  projectionYears: number;
  onSelectCell?: (cell: SensitivityCell) => void;
}

export const SensitivityMatrix: React.FC<SensitivityMatrixProps> = ({
  asset,
  grid,
  userGrowth,
  projectionYears,
  onSelectCell,
}) => {
  if (!grid || grid.length === 0) return null;

  const multiples = grid[0].map((c) => c.terminalMultiple);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-6 rounded-xl bg-[#0E121A] border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-semibold text-white tracking-tight">
              Двухфакторная матрица чувствительности
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Справедливая стоимость акции при разной стоимости капитала (WACC) и мультипликаторе выхода (Exit P/FCF).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Текущая цена:</span>
            <span className="px-2.5 py-1 rounded bg-[#141924] border border-white/[0.1] text-sky-300 font-bold">
              ${asset.currentPrice}
            </span>
          </div>
        </div>

        {/* Matrix Table with horizontal touch scroll */}
        <div className="mt-5 overflow-x-auto no-scrollbar touch-pan-x">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr>
                <th className="p-2.5 sm:p-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-[#141924] border border-white/[0.08] rounded-tl-md">
                  WACC \ P/FCF
                </th>
                {multiples.map((m) => (
                  <th
                    key={m}
                    className="p-2.5 sm:p-3 text-xs font-mono font-semibold text-slate-300 text-center bg-[#141924] border border-white/[0.08]"
                  >
                    {m}x
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => {
                const wacc = row[0].discountRate;
                return (
                  <tr key={wacc}>
                    <td className="p-2.5 sm:p-3 text-xs font-mono font-medium text-slate-300 bg-[#141924] border border-white/[0.08]">
                      {wacc}%
                    </td>
                    {row.map((cell, cIdx) => {
                      const isPositive = cell.deltaPercent >= 0;
                      const isHighPositive = cell.deltaPercent > 25;
                      const isDeepNegative = cell.deltaPercent < -25;

                      let bgClass = 'bg-[#10141D] hover:bg-[#18202F]';
                      let textClass = 'text-slate-400';

                      if (isHighPositive) {
                        bgClass = 'bg-emerald-950/30 hover:bg-emerald-900/40';
                        textClass = 'text-emerald-400';
                      } else if (isPositive) {
                        bgClass = 'bg-sky-950/25 hover:bg-sky-900/35';
                        textClass = 'text-sky-300';
                      } else if (isDeepNegative) {
                        bgClass = 'bg-rose-950/25 hover:bg-rose-900/35';
                        textClass = 'text-rose-400';
                      } else {
                        // Mild negative (0 to -25%) - subtle slate, no yellow!
                        bgClass = 'bg-[#121622] hover:bg-[#1A2234]';
                        textClass = 'text-slate-300';
                      }

                      return (
                        <td
                          key={cIdx}
                          onClick={() => onSelectCell && onSelectCell(cell)}
                          className={`p-2.5 sm:p-3 text-center border border-white/[0.06] transition-colors cursor-pointer ${bgClass}`}
                        >
                          <div className="font-mono text-xs sm:text-sm font-bold text-white tabular-nums">
                            ${cell.impliedPrice}
                          </div>
                          <div
                            className={`font-mono text-[10px] sm:text-[11px] flex items-center justify-center gap-0.5 mt-0.5 ${textClass}`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3 h-3 shrink-0" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 shrink-0" />
                            )}
                            <span>{cell.deltaPercent > 0 ? `+${cell.deltaPercent}%` : `${cell.deltaPercent}%`}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend & Guide - No Yellow */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/60"></span>
              Недооценка &gt;25% (Зона покупки)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/30 border border-sky-500/50"></span>
              Умеренный запас (0% – 25%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500/50"></span>
              Переоценка &lt; -15% (Риск сжатия)
            </span>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Рост в модели: <span className="text-sky-300 font-semibold">{userGrowth}%</span> на {projectionYears} лет
          </div>
        </div>
      </div>
    </div>
  );
};
