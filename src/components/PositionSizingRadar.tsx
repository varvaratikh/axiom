import React, { useState } from 'react';
import { KellyParams, KellyResults } from '../types/finance';
import { calculateKellyAllocation } from '../utils/valuationMath';
import { ShieldAlert, DollarSign } from 'lucide-react';

interface PositionSizingRadarProps {
  currentStockTicker: string;
  currentUpsidePercent: number;
}

export const PositionSizingRadar: React.FC<PositionSizingRadarProps> = ({
  currentStockTicker,
  currentUpsidePercent,
}) => {
  const [params, setParams] = useState<KellyParams>({
    portfolioSize: 50000,
    winProbability: 60,
    targetUpsidePercent: Math.max(15, Math.round(currentUpsidePercent || 35)),
    stopLossPercent: 15,
  });

  const results: KellyResults = calculateKellyAllocation(params);

  const recommendedDollars = Math.round((params.portfolioSize * results.halfKellyFraction) / 100);
  const maxDollars = Math.round((params.portfolioSize * results.fullKellyFraction) / 100);
  const maxLossAtStop = Math.round((recommendedDollars * params.stopLossPercent) / 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 sm:p-6 rounded-xl bg-[#0E121A] border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-semibold text-white tracking-tight">
              Распределение капитала (Критерий Келли)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Оптимальный размер позиции для максимизации долгосрочного роста капитала и исключения риска разорения.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Для актива: <span className="text-sky-300 font-bold">{currentStockTicker}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 items-stretch">
          {/* Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-4 p-4 sm:p-5 rounded-lg bg-[#10141D] border border-white/[0.06]">
            {/* Portfolio Size Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Общий портфель ($)</span>
                <span className="font-mono text-sky-300 font-semibold">${params.portfolioSize.toLocaleString()}</span>
              </div>
              <input
                type="number"
                step="5000"
                value={params.portfolioSize}
                onChange={(e) => setParams({ ...params, portfolioSize: Math.max(100, Number(e.target.value) || 0) })}
                className="w-full px-3 py-2 bg-[#090B10] border border-white/[0.1] rounded-md text-sm font-mono text-white focus:border-sky-400 outline-none"
              />
            </div>

            {/* Win Probability Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Ожидаемая вероятность успеха (Win Rate)</span>
                <span className="font-mono text-sky-300 font-semibold">{params.winProbability}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={params.winProbability}
                onChange={(e) => setParams({ ...params, winProbability: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>30%</span>
                <span>55% (Базовая норма)</span>
                <span>80%</span>
              </div>
            </div>

            {/* Target Upside */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Расчетный апсайд</span>
                <span className="font-mono text-emerald-400 font-semibold">+{params.targetUpsidePercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={params.targetUpsidePercent}
                onChange={(e) => setParams({ ...params, targetUpsidePercent: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>+15%</span>
                <span>+40%</span>
                <span>+100%+</span>
              </div>
            </div>

            {/* Stop Loss Downside */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Защитный стоп-лосс (Убыток)</span>
                <span className="font-mono text-rose-400 font-semibold">-{params.stopLossPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={params.stopLossPercent}
                onChange={(e) => setParams({ ...params, stopLossPercent: Number(e.target.value) })}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>-8%</span>
                <span>-15% (Институциональный норматив)</span>
                <span>-35%</span>
              </div>
            </div>
          </div>

          {/* Results Display (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* Half-Kelly Card - Matte, No Neon Bloom */}
            <div className="p-4 sm:p-5 rounded-lg bg-[#141924] border border-white/[0.1]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[11px] text-sky-300 uppercase tracking-wider font-semibold">
                    Рекомендуемая доля (Half-Kelly)
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-white mt-1">
                    {results.halfKellyFraction}%{' '}
                    <span className="text-sm text-slate-400 font-normal">портфеля</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#1C2333] text-sky-300 border border-white/[0.08]">
                  R:R = {results.riskRewardRatio}
                </span>
              </div>

              <div className="text-sm font-mono text-slate-300 mt-2">
                Сумма входа: <strong className="text-sky-300">${recommendedDollars.toLocaleString()}</strong>
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span>Макс. риск при стопе:</span>
                <span className="font-mono text-rose-400 font-semibold">
                  -${maxLossAtStop.toLocaleString()} ({((maxLossAtStop / params.portfolioSize) * 100).toFixed(1)}% портфеля)
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-[#10141D] border border-white/[0.06]">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Full Kelly (Предел)
                </div>
                <div className="text-lg sm:text-xl font-mono font-bold text-slate-200 mt-1">
                  {results.fullKellyFraction}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  ${maxDollars.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#10141D] border border-white/[0.06]">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Мат. ожидание (EV)
                </div>
                <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400 mt-1">
                  +{results.expectedValuePercent}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  на сделку
                </div>
              </div>
            </div>

            {/* Risk of Ruin assessment - Clean prose */}
            <div className="p-3.5 rounded-lg bg-[#10141D] border border-white/[0.06] text-xs text-slate-300">
              <div className="flex items-center gap-2 mb-1 font-medium text-white">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                <span>Защита от серии последовательных убытков:</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {results.halfKellyFraction > 25
                  ? 'Внимание: Доля выше 25% создает повышенную уязвимость при череде неудач. Рекомендуется ограничить позицию.'
                  : results.halfKellyFraction === 0
                  ? 'Мат. ожидание отрицательно. Математически правильное решение — воздержаться от входа.'
                  : 'Институциональная калибровка. Капитал защищен от фатальной просадки даже при серии из 5 неудачных сделок подряд.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
