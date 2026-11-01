import React from 'react';
import { Sliders, Activity, Grid3X3, ShieldCheck, TrendingDown, Download, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dcf' | 'matrix' | 'kelly' | 'runway';
  setActiveTab: (tab: 'dcf' | 'matrix' | 'kelly' | 'runway') => void;
  isWidgetView: boolean;
  setIsWidgetView: (val: boolean) => void;
  onOpenInstallModal: () => void;
  ticker: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isWidgetView,
  setIsWidgetView,
  onOpenInstallModal,
  ticker,
}) => {
  const tabs = [
    { id: 'dcf', label: 'Ожидания рынка (DCF)', shortLabel: 'DCF Радар', icon: Activity },
    { id: 'matrix', label: 'Матрица оценки', shortLabel: 'Матрица', icon: Grid3X3 },
    { id: 'kelly', label: 'Критерий Келли', shortLabel: 'Келли', icon: ShieldCheck },
    { id: 'runway', label: 'Стресс-тест капитала', shortLabel: 'Стресс-тест', icon: TrendingDown },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090B10]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#141924] border border-white/[0.12] flex items-center justify-center text-slate-100 font-display font-bold text-xs sm:text-sm shadow-sm">
              AX
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-semibold tracking-tight text-sm sm:text-base text-white whitespace-nowrap">
                AXIOM
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase hidden sm:inline">
                CAPITAL
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Tabs */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#10141D] border border-white/[0.08] rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1C2333] text-sky-300 border border-white/[0.1] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions - Install on Screen + Widget View */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenInstallModal}
              title="Добавить на главный экран"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-md border border-white/[0.1] bg-[#141924] hover:bg-[#1A2232] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>На экран</span>
            </button>

            <button
              onClick={() => setIsWidgetView(!isWidgetView)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isWidgetView
                  ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold'
                  : 'bg-[#141924] hover:bg-[#1A2232] text-slate-200 border-white/[0.1] hover:border-sky-400/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>{isWidgetView ? 'Полный сайт' : 'Мини-виджет'}</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Tab Strip */}
        <div className="lg:hidden pb-2.5 pt-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-t border-white/[0.04]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1C2333] text-sky-300 border border-white/[0.12] shadow-sm'
                    : 'bg-[#10141D] text-slate-400 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#141924] text-slate-300 border border-white/[0.08] whitespace-nowrap shrink-0 ml-auto cursor-pointer"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>На экран</span>
          </button>
        </div>
      </div>
    </header>
  );
};
