import React, { useState } from 'react';
import { CapitalRunwayParams, RunwayResults } from '../types/finance';
import { calculateCapitalRunway } from '../utils/valuationMath';
import { Clock } from 'lucide-react';

export const CapitalRunwaySim: React.FC = () => {
  const [params, setParams] = useState<CapitalRunwayParams>({
    totalLiquidCapital: 120000,
    monthlyBurn: 3200,
    passiveMonthlyCashFlow: 800,
    macroScenario: 'BASELINE',
  });

  const results: RunwayResults = calculateCapitalRunway(params);

  // Trajectory SVG Dimensions
  const chartHeight = 180;
  const chartWidth = 540;
  const padding = { top: 15, right: 25, bottom: 25, left: 55 };

  const maxCap = Math.max(params.totalLiquidCapital, 1000);
  const trajectory = results.monthlyTrajectory;
  const maxMonth = trajectory.length > 0 ? trajectory[trajectory.length - 1].month : 12;

  const getX = (month: number) => {
    const usableWidth = chartWidth - padding.left - padding.right;
    return padding.left + (month / Math.max(1, maxMonth)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - padding.top - padding.bottom;
    const clamped = Math.max(0, Math.min(val, maxCap));
    return chartHeight - padding.bottom - (clamped / maxCap) * usableHeight;
  };

  const path = trajectory.length > 0
    ? trajectory.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.month)} ${getY(d.capitalRemaining)}`).join(' ')
    : '';

  const areaPath = trajectory.length > 0
    ? `${path} L ${getX(maxMonth)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`
    : '';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-6 rounded-xl bg-[#0E121A] border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-semibold text-white tracking-tight">
              Стресс-тест автономности капитала (Runway)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Симуляция горизонта финансовой свободы с учетом инфляции и рыночных спадов.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Покрытие пассивным доходом:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                results.burnCoverageRatio >= 100
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-[#141924] text-sky-300'
              }`}
            >
              {results.burnCoverageRatio}% расходов
            </span>
          </div>
        </div>

        {/* Macro Regime Selector */}
        <div className="mt-5">
          <label className="block text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">
            Макроэкономический режим:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              {
                id: 'BASELINE',
                label: 'Базовый режим',
                desc: 'Инфляция 3% · Доходность 6%',
              },
              {
                id: 'STAGFLATION',
                label: 'Стагфляция 1970-х',
                desc: 'Инфляция 8% · Доходность 1%',
              },
              {
                id: 'MARKET_SHOCK',
                label: 'Шок обвала -30%',
                desc: 'Мгновенная просадка активов',
              },
              {
                id: 'EXTENDED_WINTER',
                label: '3 года рецессии',
                desc: 'Реальная доходность -5% в год',
              },
            ].map((s) => {
              const active = params.macroScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setParams({ ...params, macroScenario: s.id as any })}
                  className={`p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1C2333] text-sky-200 border-sky-400/40 shadow-sm'
                      : 'bg-[#10141D] text-slate-400 border-white/[0.05] hover:text-slate-200 hover:border-white/[0.1]'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{s.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs & Results Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 items-stretch">
          {/* Inputs Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 p-4 sm:p-5 rounded-lg bg-[#10141D] border border-white/[0.06]">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Ликвидный капитал ($)</span>
                <span className="font-mono text-sky-300 font-semibold">
                  ${params.totalLiquidCapital.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                step="5000"
                value={params.totalLiquidCapital}
                onChange={(e) =>
                  setParams({ ...params, totalLiquidCapital: Math.max(1000, Number(e.target.value) || 0) })
                }
                className="w-full px-3 py-2 bg-[#090B10] border border-white/[0.1] rounded-md text-sm font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Расходы (Burn rate $/мес)</span>
                <span className="font-mono text-rose-400 font-semibold">
                  ${params.monthlyBurn.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                step="200"
                value={params.monthlyBurn}
                onChange={(e) =>
                  setParams({ ...params, monthlyBurn: Math.max(100, Number(e.target.value) || 0) })
                }
                className="w-full px-3 py-2 bg-[#090B10] border border-white/[0.1] rounded-md text-sm font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Пассивный доход ($/мес)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ${params.passiveMonthlyCashFlow.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                step="100"
                value={params.passiveMonthlyCashFlow}
                onChange={(e) =>
                  setParams({ ...params, passiveMonthlyCashFlow: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full px-3 py-2 bg-[#090B10] border border-white/[0.1] rounded-md text-sm font-mono text-white focus:border-sky-400 outline-none"
              />
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Чистый дефицит: ${Math.max(0, params.monthlyBurn - params.passiveMonthlyCashFlow)}/мес
              </div>
            </div>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="p-4 sm:p-5 rounded-lg bg-[#141924] border border-white/[0.09]">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Срок автономности капитала
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums">
                      {results.totalRunwayMonths >= 360
                        ? '30+ лет'
                        : `${results.runwayYears}г ${results.runwayMonths}м`}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({results.totalRunwayMonths >= 360 ? 'самоподдерживающийся' : `${results.totalRunwayMonths} мес.`})
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-sky-300">
                  {results.survivalProbabilityText}
                </div>
              </div>
            </div>

            {/* Decay Trajectory SVG */}
            <div className="p-3.5 sm:p-4 rounded-lg bg-[#10141D] border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>Динамика сохранения капитала</span>
                <span className="font-mono text-[11px]">${Math.round(params.totalLiquidCapital / 1000)}k пик</span>
              </div>

              <div className="relative w-full h-[160px] sm:h-[180px] overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                  <defs>
                    <linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.5, 1].map((pct, idx) => {
                    const y = padding.top + (chartHeight - padding.top - padding.bottom) * pct;
                    return (
                      <line
                        key={idx}
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="2 2"
                      />
                    );
                  })}

                  {/* Area */}
                  {areaPath && <path d={areaPath} fill="url(#runwayGradient)" />}

                  {/* Line */}
                  {path && (
                    <path
                      d={path}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Старт (0 мес)</span>
                <span>{Math.round(maxMonth / 2)} мес</span>
                <span>{maxMonth} мес</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
