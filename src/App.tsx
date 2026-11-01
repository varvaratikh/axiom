/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PRESET_ASSETS } from './data/presetAssets';
import { StockAsset, ValuationParams } from './types/finance';
import { analyzeValuation, generateSensitivityMatrix } from './utils/valuationMath';
import { Header } from './components/Header';
import { ReverseDcfRadar } from './components/ReverseDcfRadar';
import { SensitivityMatrix } from './components/SensitivityMatrix';
import { PositionSizingRadar } from './components/PositionSizingRadar';
import { CapitalRunwaySim } from './components/CapitalRunwaySim';
import { PluginWidgetHud } from './components/PluginWidgetHud';
import { StandaloneWidgetView } from './components/StandaloneWidgetView';
import { InstallPromptModal } from './components/InstallPromptModal';

export default function App() {
  const [presetList] = useState<StockAsset[]>(PRESET_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<StockAsset>(PRESET_ASSETS[0]);
  const [isCustomAsset, setIsCustomAsset] = useState(false);
  const [customAsset, setCustomAsset] = useState<StockAsset>({
    ticker: 'CUSTOM',
    name: 'Мой стартап / Актив',
    sector: 'Частный бизнес / Акции',
    currentPrice: 100,
    sharesOutstanding: 1.0,
    freeCashFlow: 5.0,
    netCash: 2.0,
    marketCap: 100,
    peRatio: 20,
    beta: 1.2,
    historicalGrowthRate: 15,
    description: 'Пользовательский финансовый актив для сценарного моделирования.',
  });

  const [activeTab, setActiveTab] = useState<'dcf' | 'matrix' | 'kelly' | 'runway'>('dcf');
  const [isPluginMode, setIsPluginMode] = useState(false);
  const [isWidgetView, setIsWidgetView] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Check URL query param e.g. ?mode=widget on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'widget' || params.get('widget') === 'true') {
      setIsWidgetView(true);
    }
  }, []);

  const [valuationParams, setValuationParams] = useState<ValuationParams>({
    discountRate: 9.5,
    terminalMultiple: 22,
    projectionYears: 10,
    terminalGrowthRate: 3.0,
    userExpectedGrowth: 18.0,
  });

  const currentAsset = isCustomAsset ? customAsset : selectedAsset;

  // Real-time valuation results
  const results = useMemo(() => {
    return analyzeValuation(currentAsset, valuationParams);
  }, [currentAsset, valuationParams]);

  // Sensitivity matrix grid
  const sensitivityGrid = useMemo(() => {
    return generateSensitivityMatrix(
      currentAsset,
      valuationParams.userExpectedGrowth,
      valuationParams.projectionYears
    );
  }, [currentAsset, valuationParams.userExpectedGrowth, valuationParams.projectionYears]);

  // Standalone Mini-Widget View Mode (compact popup window requested by user)
  if (isWidgetView) {
    return (
      <>
        <StandaloneWidgetView
          asset={currentAsset}
          onSelectAsset={(a) => {
            setIsCustomAsset(false);
            setSelectedAsset(a);
          }}
          presetAssets={presetList}
          results={results}
          params={valuationParams}
          setParams={setValuationParams}
          onOpenFullTerminal={() => setIsWidgetView(false)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />
        <InstallPromptModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </>
    );
  }

  // Full Command Center View Mode
  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navigation Bar with Mobile Tab Strip */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWidgetView={isWidgetView}
        setIsWidgetView={setIsWidgetView}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        ticker={currentAsset.ticker}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121A] border border-white/[0.08]">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Актив
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
              <span className="text-lg sm:text-xl font-mono font-bold text-white">{currentAsset.ticker}</span>
              <span className="text-xs text-slate-400 font-mono">${currentAsset.currentPrice}</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">{currentAsset.sector}</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121A] border border-white/[0.08]">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Заложенный рост (CAGR)
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg sm:text-xl font-mono font-bold text-sky-300">
                +{results.impliedGrowthRate}%
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-mono">/год</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
              {results.riskAssessment.label}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121A] border border-white/[0.08]">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Справедливая цена
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg sm:text-xl font-mono font-bold text-white">
                ${results.fairValuePerShare}
              </span>
              <span
                className={`text-[11px] sm:text-xs font-mono font-bold ${
                  results.upsideDownsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {results.upsideDownsidePercent >= 0 ? `+${results.upsideDownsidePercent}%` : `${results.upsideDownsidePercent}%`}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5 truncate">
              при росте +{valuationParams.userExpectedGrowth}%
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121A] border border-white/[0.08]">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Запас прочности
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`text-lg sm:text-xl font-mono font-bold ${
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
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5 truncate">
              WACC {valuationParams.discountRate}% · P/FCF {valuationParams.terminalMultiple}x
            </div>
          </div>
        </div>

        {/* Tab 1: Reverse DCF Radar */}
        {activeTab === 'dcf' && (
          <ReverseDcfRadar
            asset={currentAsset}
            onSelectAsset={(a) => {
              setIsCustomAsset(false);
              setSelectedAsset(a);
            }}
            presetAssets={presetList}
            params={valuationParams}
            setParams={setValuationParams}
            results={results}
            onCustomAssetChange={setCustomAsset}
            isCustomAsset={isCustomAsset}
            setIsCustomAsset={setIsCustomAsset}
          />
        )}

        {/* Tab 2: Sensitivity Matrix */}
        {activeTab === 'matrix' && (
          <SensitivityMatrix
            asset={currentAsset}
            grid={sensitivityGrid}
            userGrowth={valuationParams.userExpectedGrowth}
            projectionYears={valuationParams.projectionYears}
            onSelectCell={(cell) => {
              setValuationParams((prev) => ({
                ...prev,
                discountRate: cell.discountRate,
                terminalMultiple: cell.terminalMultiple,
              }));
              setActiveTab('dcf');
            }}
          />
        )}

        {/* Tab 3: Kelly Sizing Radar */}
        {activeTab === 'kelly' && (
          <PositionSizingRadar
            currentStockTicker={currentAsset.ticker}
            currentUpsidePercent={results.upsideDownsidePercent}
          />
        )}

        {/* Tab 4: Capital Runway Stress Test */}
        {activeTab === 'runway' && <CapitalRunwaySim />}

        {/* Floating companion HUD (if opened inside full view) */}
        {isPluginMode && (
          <PluginWidgetHud
            asset={currentAsset}
            onSelectAsset={(a) => {
              setIsCustomAsset(false);
              setSelectedAsset(a);
            }}
            presetAssets={presetList}
            results={results}
            params={valuationParams}
            setParams={setValuationParams}
            onClosePluginMode={() => setIsPluginMode(false)}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07090E] py-5 sm:py-6 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-medium text-slate-300">Axiom Capital</span>
            <span aria-hidden="true">·</span>
            <span>Обратный DCF & Анализ ожиданий</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <button
              onClick={() => setIsWidgetView(true)}
              className="hover:text-sky-300 transition-colors cursor-pointer"
            >
              Открыть в режиме мини-виджета
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="hover:text-sky-300 transition-colors cursor-pointer"
            >
              Добавить на экран
            </button>
          </div>
        </div>
      </footer>

      {/* In-App PWA Install Modal */}
      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
