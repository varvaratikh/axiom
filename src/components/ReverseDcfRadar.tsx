import React, { useState } from 'react';
import { StockAsset, ValuationParams, ValuationResults } from '../types/finance';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Scale,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

interface ReverseDcfRadarProps {
  asset: StockAsset;
  onSelectAsset: (asset: StockAsset) => void;
  presetAssets: StockAsset[];
  params: ValuationParams;
  setParams: React.Dispatch<React.SetStateAction<ValuationParams>>;
  results: ValuationResults;
  onCustomAssetChange: (updated: StockAsset) => void;
  isCustomAsset: boolean;
  setIsCustomAsset: (val: boolean) => void;
}

export const ReverseDcfRadar: React.FC<ReverseDcfRadarProps> = ({
  asset,
  onSelectAsset,
  presetAssets,
  params,
  setParams,
  results,
  onCustomAssetChange,
  isCustomAsset,
  setIsCustomAsset,
}) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 560;
  const padding = { top: 20, right: 25, bottom: 28, left: 45 };

  const maxFCF = Math.max(
    ...results.cashFlowTrajectory.map((d) => Math.max(d.marketImpliedFCF, d.userProjectedFCF)),
    asset.freeCashFlow * 1.4,
    10
  );

  const getX = (year: number) => {
    const usableWidth = chartWidth - padding.left - padding.right;
    return padding.left + (year / params.projectionYears) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - padding.top - padding.bottom;
    const clamped = Math.max(0, Math.min(val, maxFCF));
    return chartHeight - padding.bottom - (clamped / maxFCF) * usableHeight;
  };

  const marketPath = results.cashFlowTrajectory
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year)} ${getY(d.marketImpliedFCF)}`)
    .join(' ');

  const userPath = results.cashFlowTrajectory
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year)} ${getY(d.userProjectedFCF)}`)
    .join(' ');

  const areaGradientPath = `${marketPath} L ${getX(params.projectionYears)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  const finalMarketFCF = results.cashFlowTrajectory[results.cashFlowTrajectory.length - 1]?.marketImpliedFCF || 0;
  const growthMultiplier = asset.freeCashFlow > 0 ? (finalMarketFCF / asset.freeCashFlow).toFixed(1) : '1.0';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Ticker Bar & Selector */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-[#0E121A] border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
          <span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">
            Выберите актив для анализа:
          </span>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 font-mono">
            <span>Капитализация: <strong className="text-slate-200">${asset.marketCap.toLocaleString()}B</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>FCF: <strong className="text-slate-200">${asset.freeCashFlow.toLocaleString()}B</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>P/E: <strong className="text-slate-200">{asset.peRatio}x</strong></span>
          </div>
        </div>

        {/* Preset Tickers Horizontal Scroll */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar touch-pan-x">
          {presetAssets.map((p) => {
            const isActive = !isCustomAsset && asset.ticker === p.ticker;
            return (
              <button
                key={p.ticker}
                onClick={() => {
                  setIsCustomAsset(false);
                  onSelectAsset(p);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1C2333] text-sky-300 border border-sky-400/30'
                    : 'bg-[#141924] text-slate-400 hover:text-slate-200 hover:bg-[#1A2232] border border-white/[0.04]'
                }`}
              >
                {p.ticker}
              </button>
            );
          })}
          <button
            onClick={() => setIsCustomAsset(true)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all shrink-0 cursor-pointer ${
              isCustomAsset
                ? 'bg-[#1C2333] text-sky-300 border border-sky-400/30'
                : 'bg-[#141924] text-slate-400 hover:text-slate-200 hover:bg-[#1A2232] border border-white/[0.04]'
            }`}
          >
            + Свой актив
          </button>
        </div>

        {/* If Custom Asset is selected, show responsive fields */}
        {isCustomAsset && (
          <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Тикер / Название</label>
              <input
                type="text"
                value={asset.ticker}
                onChange={(e) => onCustomAssetChange({ ...asset, ticker: e.target.value.toUpperCase() })}
                className="w-full px-2.5 py-1.5 bg-[#090B10] border border-white/[0.1] rounded-md text-xs font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Цена акции ($)</label>
              <input
                type="number"
                value={asset.currentPrice}
                onChange={(e) => onCustomAssetChange({ ...asset, currentPrice: Number(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-[#090B10] border border-white/[0.1] rounded-md text-xs font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Кол-во акций (млрд)</label>
              <input
                type="number"
                step="0.1"
                value={asset.sharesOutstanding}
                onChange={(e) => {
                  const shares = Number(e.target.value) || 0.1;
                  onCustomAssetChange({
                    ...asset,
                    sharesOutstanding: shares,
                    marketCap: Number((asset.currentPrice * shares).toFixed(1)),
                  });
                }}
                className="w-full px-2.5 py-1.5 bg-[#090B10] border border-white/[0.1] rounded-md text-xs font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Свободный FCF ($ млрд)</label>
              <input
                type="number"
                step="0.5"
                value={asset.freeCashFlow}
                onChange={(e) => onCustomAssetChange({ ...asset, freeCashFlow: Number(e.target.value) || 0.1 })}
                className="w-full px-2.5 py-1.5 bg-[#090B10] border border-white/[0.1] rounded-md text-xs font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Чистый кэш/долг ($ млрд)</label>
              <input
                type="number"
                value={asset.netCash}
                onChange={(e) => onCustomAssetChange({ ...asset, netCash: Number(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 bg-[#090B10] border border-white/[0.1] rounded-md text-xs font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Капитализация ($ млрд)</label>
              <input
                type="number"
                value={asset.marketCap}
                onChange={(e) => onCustomAssetChange({ ...asset, marketCap: Number(e.target.value) || 1 })}
                className="w-full px-2.5 py-1.5 bg-[#090B10] border border-white/[0.1] rounded-md text-xs font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Split: Left Expectations Radar + Right Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Left: The Implied Growth Engine (7 Cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 rounded-xl bg-[#0E121A] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-medium">
                {asset.name} ({asset.ticker})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Текущая цена: <strong className="text-slate-100 font-bold">${asset.currentPrice}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight mb-4">
              Рыночные ожидания роста FCF
            </h2>

            {/* Dial Hero - Matte Dark Finish, No Cheap Plastic Glow */}
            <div className="p-4 sm:p-5 rounded-lg bg-[#141924] border border-white/[0.09] mb-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mb-1">
                    Требуемый среднегодовой темп роста (CAGR {params.projectionYears} лет):
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-sky-300 tabular-nums">
                      {results.impliedGrowthRate > 0 ? `+${results.impliedGrowthRate}%` : `${results.impliedGrowthRate}%`}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 font-mono">в год</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] sm:text-xs text-slate-400 mb-1">Оценка рыночного профиля:</div>
                  <div
                    className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${results.riskAssessment.accentColor}18`,
                      color: results.riskAssessment.accentColor,
                      border: `1px solid ${results.riskAssessment.accentColor}35`,
                    }}
                  >
                    <span>{results.riskAssessment.label}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-300">
                <span className="text-slate-400">Историческая база:</span>
                <span className="font-mono text-slate-200">{results.riskAssessment.historicalPercentile}</span>
              </div>
            </div>

            {/* Explanation card */}
            <div className="p-3.5 sm:p-4 rounded-lg bg-[#10141D] border border-white/[0.06] text-xs text-slate-300 leading-relaxed mb-5">
              <p>
                Чтобы текущая капитализация <span className="font-mono text-white">${asset.marketCap}B</span> была
                математически обоснована (при ставке дисконтирования <span className="font-mono text-sky-300">{params.discountRate}%</span>), 
                свободный денежный поток компании должен вырасти с <span className="font-mono text-white">${asset.freeCashFlow}B</span> до{' '}
                <span className="font-mono text-sky-300">${finalMarketFCF}B</span> в год к {new Date().getFullYear() + params.projectionYears}{' '}
                (рост в <span className="font-mono text-white">{growthMultiplier}x</span> раз).
              </p>
            </div>
          </div>

          {/* Interactive Trajectory SVG */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-sky-300 font-mono text-[11px]">
                  <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> Ожидания рынка (CAGR {results.impliedGrowthRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <span className="w-2.5 h-0.5 bg-emerald-400 border-dashed border-t inline-block"></span> Ваш прогноз (CAGR {params.userExpectedGrowth}%)
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono">$ млрд FCF</span>
            </div>

            <div className="relative w-full h-[200px] sm:h-[220px] bg-[#090B10] rounded-lg border border-white/[0.06] p-1.5 sm:p-2 overflow-hidden">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                <defs>
                  <linearGradient id="marketAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = padding.top + (chartHeight - padding.top - padding.bottom) * pct;
                  const val = Math.round(maxFCF * (1 - pct));
                  return (
                    <g key={idx}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="2 3"
                      />
                      <text
                        x={padding.left - 6}
                        y={y + 3}
                        fill="rgba(148, 163, 184, 0.6)"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="JetBrains Mono"
                      >
                        ${val}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Years */}
                {results.cashFlowTrajectory.map((d) => (
                  <text
                    key={d.year}
                    x={getX(d.year)}
                    y={chartHeight - 8}
                    fill="rgba(148, 163, 184, 0.7)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    Г+{d.year}
                  </text>
                ))}

                {/* Market Area Fill */}
                <path d={areaGradientPath} fill="url(#marketAreaGradient)" />

                {/* Market Trajectory Line */}
                <path
                  d={marketPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* User Projected Line */}
                <path
                  d={userPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {results.cashFlowTrajectory.map((d) => {
                  const isHovered = hoveredYear === d.year;
                  return (
                    <g
                      key={d.year}
                      onMouseEnter={() => setHoveredYear(d.year)}
                      onMouseLeave={() => setHoveredYear(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={getX(d.year)}
                        cy={getY(d.marketImpliedFCF)}
                        r={isHovered ? 4.5 : 2.5}
                        fill="#38bdf8"
                        stroke="#090B10"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={getX(d.year)}
                        cy={getY(d.userProjectedFCF)}
                        r={isHovered ? 4.5 : 2.5}
                        fill="#10b981"
                        stroke="#090B10"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {hoveredYear !== null && (
                <div className="absolute top-2 right-2 bg-[#141924] border border-white/[0.12] rounded-md p-2 text-[10px] sm:text-[11px] font-mono text-slate-200 pointer-events-none shadow-lg">
                  <div>Год +{hoveredYear}</div>
                  <div className="text-sky-300">Рынок: ${results.cashFlowTrajectory[hoveredYear]?.marketImpliedFCF}B</div>
                  <div className="text-emerald-400">Ваш прогноз: ${results.cashFlowTrajectory[hoveredYear]?.userProjectedFCF}B</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sliders & Assumption Engine (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-6 rounded-xl bg-[#0E121A] border border-white/[0.08] flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-400" />
                Параметры и стресс-тест
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">РЕЖИМ DCF</span>
            </div>

            {/* Slider 1: WACC */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Ставка дисконтирования (WACC)</span>
                <span className="font-mono text-sky-300 font-semibold">{params.discountRate}%</span>
              </div>
              <input
                type="range"
                min="6"
                max="16"
                step="0.5"
                value={params.discountRate}
                onChange={(e) => setParams({ ...params, discountRate: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>6%</span>
                <span>10% (Норма)</span>
                <span>16%</span>
              </div>
            </div>

            {/* Slider 2: Terminal Multiple */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Мультипликатор выхода (Exit P/FCF)</span>
                <span className="font-mono text-sky-300 font-semibold">{params.terminalMultiple}x</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="1"
                value={params.terminalMultiple}
                onChange={(e) => setParams({ ...params, terminalMultiple: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>12x (Зрелый)</span>
                <span>20x (Лидер)</span>
                <span>35x (Гиперрост)</span>
              </div>
            </div>

            {/* Projection Horizon Selector */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Горизонт прогнозирования</span>
                <span className="font-mono text-sky-300 font-semibold">{params.projectionYears} лет</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10].map((yrs) => (
                  <button
                    key={yrs}
                    onClick={() => setParams({ ...params, projectionYears: yrs })}
                    className={`py-2 text-xs font-mono font-medium rounded-md border transition-colors cursor-pointer ${
                      params.projectionYears === yrs
                        ? 'bg-[#1C2333] text-sky-300 border-sky-400/40'
                        : 'bg-[#141924] text-slate-400 border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {yrs} ЛЕТ
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 3: Your thesis growth rate */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Ваш прогноз роста (CAGR)</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {params.userExpectedGrowth > 0 ? `+${params.userExpectedGrowth}%` : `${params.userExpectedGrowth}%`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="40"
                step="1"
                value={params.userExpectedGrowth}
                onChange={(e) => setParams({ ...params, userExpectedGrowth: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-5% (Спад)</span>
                <span>+12% (Базовый)</span>
                <span>+35% (Агрессивный)</span>
              </div>
            </div>
          </div>

          {/* Outcome Metric Cards */}
          <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
            <div className="p-3.5 rounded-lg bg-[#141924] border border-white/[0.08]">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-400">Справедливая цена:</span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white tabular-nums">
                  ${results.fairValuePerShare}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-xs">
                <span className="text-slate-400">Потенциал к цене (${asset.currentPrice}):</span>
                <span
                  className={`font-mono font-semibold ${
                    results.upsideDownsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {results.upsideDownsidePercent >= 0 ? `+${results.upsideDownsidePercent}%` : `${results.upsideDownsidePercent}%`}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#10141D] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Запас прочности (Margin of Safety):</span>
              <span
                className={`font-mono font-bold ${
                  results.marginOfSafety >= 20
                    ? 'text-emerald-400'
                    : results.marginOfSafety >= 0
                    ? 'text-sky-300'
                    : 'text-slate-400'
                }`}
              >
                {results.marginOfSafety > 0 ? `+${results.marginOfSafety}%` : `${results.marginOfSafety}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
