import React, { useState } from 'react';
import { StockAsset, ValuationResults, ValuationParams } from '../types/finance';
import {
  Copy,
  Check,
  Maximize2,
  ChevronDown,
  X,
} from 'lucide-react';

interface PluginWidgetHudProps {
  asset: StockAsset;
  onSelectAsset: (asset: StockAsset) => void;
  presetAssets: StockAsset[];
  results: ValuationResults;
  params: ValuationParams;
  setParams: React.Dispatch<React.SetStateAction<ValuationParams>>;
  onClosePluginMode: () => void;
}

export const PluginWidgetHud: React.FC<PluginWidgetHudProps> = ({
  asset,
  onSelectAsset,
  presetAssets,
  results,
  params,
  setParams,
  onClosePluginMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCopySummary = () => {
    const text = `[Axiom Capital] ${asset.ticker} ($${asset.currentPrice}) | Ожидания рынка FCF CAGR: +${results.impliedGrowthRate}% на ${params.projectionYears} лет | Оценка: ${results.riskAssessment.label} | Справедливая цена: $${results.fairValuePerShare} (${results.upsideDownsidePercent >= 0 ? '+' : ''}${results.upsideDownsidePercent}%)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:w-96 rounded-t-2xl sm:rounded-xl bg-[#0E121A]/95 border-t sm:border border-white/[0.12] shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden font-sans transition-all duration-200">
      {/* Plugin Header Bar */}
      <div className="p-3 bg-[#141924] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#1C2333] border border-white/[0.12] flex items-center justify-center text-[10px] font-bold text-slate-200 font-mono">
            AX
          </div>
          <span className="font-display font-semibold text-xs tracking-wide text-white">
            AXIOM WIDGET
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopySummary}
            title="Скопировать выжимку"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClosePluginMode}
            title="Закрыть режим плагина"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Plugin Body */}
      <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
        {/* Ticker Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#141924] border border-white/[0.08] hover:border-white/[0.16] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-left">
              <span className="font-mono font-bold text-sm text-sky-300">{asset.ticker}</span>
              <span className="text-xs text-slate-400 truncate max-w-[130px]">{asset.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-white">${asset.currentPrice}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-[#090B10] border border-white/[0.12] rounded-lg shadow-2xl z-50 p-1">
              {presetAssets.map((p) => (
                <button
                  key={p.ticker}
                  onClick={() => {
                    onSelectAsset(p);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-md hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                >
                  <span className="font-mono font-semibold text-sky-300">{p.ticker}</span>
                  <span className="text-slate-400 truncate max-w-[140px]">{p.name}</span>
                  <span className="font-mono text-slate-200">${p.currentPrice}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Luminous Metric */}
        <div className="p-3.5 rounded-lg bg-[#141924] border border-white/[0.08]">
          <div className="text-[11px] text-slate-400 mb-1">
            Рыночные ожидания (CAGR {params.projectionYears} лет):
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-mono font-bold text-sky-300">
              +{results.impliedGrowthRate}% <span className="text-xs text-slate-400 font-normal">/год</span>
            </div>
            <div
              className="text-[10px] font-mono px-2 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${results.riskAssessment.accentColor}18`,
                color: results.riskAssessment.accentColor,
              }}
            >
              {results.riskAssessment.label}
            </div>
          </div>
        </div>

        {/* Quick Sliders */}
        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Ставка дисконтирования:</span>
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
            <div className="flex justify-between text-[11px] mb-1">
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

        {/* Outcome Row */}
        <div className="p-2.5 rounded-lg bg-[#10141D] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400">Справедливо: <strong className="text-white">${results.fairValuePerShare}</strong></div>
          <div className={results.upsideDownsidePercent >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {results.upsideDownsidePercent >= 0 ? `+${results.upsideDownsidePercent}%` : `${results.upsideDownsidePercent}%`}
          </div>
        </div>
      </div>

      {/* Plugin Footer */}
      <div className="px-4 py-2.5 bg-[#090B10] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
        <span>Axiom Core Widget</span>
        <button
          onClick={onClosePluginMode}
          className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          Развернуть терминал &rarr;
        </button>
      </div>
    </div>
  );
};
