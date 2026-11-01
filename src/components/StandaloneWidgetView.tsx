import React, { useState } from 'react';
import { StockAsset, ValuationResults, ValuationParams } from '../types/finance';
import {
  Copy,
  Check,
  Maximize2,
  ExternalLink,
  ChevronDown,
  Download,
  Scale,
  Sparkles,
} from 'lucide-react';

interface StandaloneWidgetViewProps {
  asset: StockAsset;
  onSelectAsset: (asset: StockAsset) => void;
  presetAssets: StockAsset[];
  results: ValuationResults;
  params: ValuationParams;
  setParams: React.Dispatch<React.SetStateAction<ValuationParams>>;
  onOpenFullTerminal: () => void;
  onOpenInstallModal: () => void;
}

export const StandaloneWidgetView: React.FC<StandaloneWidgetViewProps> = ({
  asset,
  onSelectAsset,
  presetAssets,
  results,
  params,
  setParams,
  onOpenFullTerminal,
  onOpenInstallModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCopySummary = () => {
    const text = `[Axiom Capital] ${asset.ticker} ($${asset.currentPrice}) | Рынок ожидает FCF CAGR: +${results.impliedGrowthRate}% на ${params.projectionYears}л | Оценка: ${results.riskAssessment.label} | Справедливая цена: $${results.fairValuePerShare} (${results.upsideDownsidePercent >= 0 ? '+' : ''}${results.upsideDownsidePercent}%)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090B10] flex flex-col items-center justify-center p-3 sm:p-6 text-slate-100">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-sky-500/[0.04] blur-[120px] rounded-full" />
      </div>

      {/* Mode Switch Header Banner */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono text-[11px] tracking-wider uppercase text-slate-500">
          Режим: Мини-виджет / Плагин
        </span>
        <button
          onClick={onOpenFullTerminal}
          className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>В полный терминал</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Widget Container — mimics a real browser extension popup or phone widget */}
      <div className="w-full max-w-[420px] rounded-2xl bg-[#0E121A] border border-white/[0.1] shadow-2xl overflow-hidden font-sans">
        {/* Widget Top Bar */}
        <div className="p-3.5 bg-[#141924] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1C2333] border border-white/[0.12] flex items-center justify-center text-xs font-bold text-sky-300 font-display">
              AX
            </div>
            <div>
              <div className="font-display font-semibold text-xs tracking-tight text-white leading-tight">
                AXIOM WIDGET
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Радар рыночных ожиданий</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenInstallModal}
              title="Добавить на экран"
              className="px-2 py-1 rounded bg-[#1C2333] hover:bg-[#252F45] text-slate-300 hover:text-white border border-white/[0.08] text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>На экран</span>
            </button>
            <button
              onClick={handleCopySummary}
              title="Скопировать выжимку"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Widget Content Body */}
        <div className="p-4 space-y-4">
          {/* Ticker Selector & Price */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#141924] border border-white/[0.08] hover:border-white/[0.16] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="font-mono font-bold text-base text-sky-300">{asset.ticker}</span>
                <span className="text-xs text-slate-400 truncate max-w-[150px]">{asset.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-white">${asset.currentPrice}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#090B10] border border-white/[0.12] rounded-xl shadow-2xl z-50 p-1">
                {presetAssets.map((p) => (
                  <button
                    key={p.ticker}
                    onClick={() => {
                      onSelectAsset(p);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-semibold text-sky-300">{p.ticker}</span>
                    <span className="text-slate-400 truncate max-w-[160px]">{p.name}</span>
                    <span className="font-mono text-slate-200">${p.currentPrice}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Horizontal Tickers Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {presetAssets.slice(0, 6).map((p) => {
              const isActive = asset.ticker === p.ticker;
              return (
                <button
                  key={p.ticker}
                  onClick={() => onSelectAsset(p)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1C2333] text-sky-300 border border-sky-400/40'
                      : 'bg-[#10141D] text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {p.ticker}
                </button>
              );
            })}
          </div>

          {/* Core Expectation Hero Box */}
          <div className="p-4 rounded-xl bg-[#141924] border border-white/[0.09]">
            <div className="text-[11px] text-slate-400 mb-1">
              Рыночные ожидания (CAGR {params.projectionYears} лет):
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-3xl font-mono font-bold tracking-tight text-sky-300 tabular-nums">
                {results.impliedGrowthRate > 0 ? `+${results.impliedGrowthRate}%` : `${results.impliedGrowthRate}%`}
                <span className="text-xs text-slate-400 font-normal ml-1">/год</span>
              </div>
              <div
                className="text-[10px] font-mono px-2 py-0.5 rounded font-medium shrink-0"
                style={{
                  backgroundColor: `${results.riskAssessment.accentColor}18`,
                  color: results.riskAssessment.accentColor,
                  border: `1px solid ${results.riskAssessment.accentColor}30`,
                }}
              >
                {results.riskAssessment.label}
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] text-[11px] text-slate-300 flex justify-between">
              <span className="text-slate-400">Историческая норма:</span>
              <span className="font-mono text-slate-200">{results.riskAssessment.historicalPercentile}</span>
            </div>
          </div>

          {/* Quick Sliders */}
          <div className="space-y-3 p-3 rounded-xl bg-[#10141D] border border-white/[0.06]">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Ставка дисконта (WACC):</span>
                <span className="font-mono text-sky-300 font-semibold">{params.discountRate}%</span>
              </div>
              <input
                type="range"
                min="7"
                max="15"
                step="0.5"
                value={params.discountRate}
                onChange={(e) => setParams({ ...params, discountRate: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Ваш прогноз роста (CAGR):</span>
                <span className="font-mono text-emerald-400 font-semibold">+{params.userExpectedGrowth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={params.userExpectedGrowth}
                onChange={(e) => setParams({ ...params, userExpectedGrowth: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Valuation Outcome Card */}
          <div className="p-3.5 rounded-xl bg-[#141924] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[11px]">Справедливая цена:</div>
              <div className="text-base font-bold text-white mt-0.5">${results.fairValuePerShare}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[11px]">Потенциал:</div>
              <div
                className={`text-base font-bold mt-0.5 ${
                  results.upsideDownsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {results.upsideDownsidePercent >= 0 ? `+${results.upsideDownsidePercent}%` : `${results.upsideDownsidePercent}%`}
              </div>
            </div>
          </div>

          {/* PRIMARY CALL TO ACTION BUTTON */}
          <button
            onClick={onOpenFullTerminal}
            className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <span>Открыть полную аналитику сайта</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#090B10] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
          <span>Axiom Capital Core</span>
          <span className="font-mono text-[10px]">v2.4 PWA</span>
        </div>
      </div>
    </div>
  );
};
