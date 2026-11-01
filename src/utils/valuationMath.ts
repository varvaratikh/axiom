import {
  StockAsset,
  ValuationParams,
  ValuationResults,
  SensitivityCell,
  KellyParams,
  KellyResults,
  CapitalRunwayParams,
  RunwayResults,
} from '../types/finance';

/**
 * Calculates Enterprise Value from Market Cap and Net Cash.
 * EV = MarketCap - NetCash
 */
export function calculateEnterpriseValue(marketCap: number, netCash: number): number {
  return Math.max(0.1, marketCap - netCash);
}

/**
 * Forward DCF Enterprise Value for a given growth rate g.
 */
function forwardEV(
  fcf0: number,
  g: number,
  r: number,
  n: number,
  terminalMultiple: number
): number {
  let pvCashFlows = 0;
  let currentFCF = fcf0;

  for (let t = 1; t <= n; t++) {
    currentFCF = currentFCF * (1 + g);
    const discountFactor = Math.pow(1 + r, t);
    pvCashFlows += currentFCF / discountFactor;
  }

  // Terminal value via Exit Multiple method (standard institutional approach)
  const terminalValue = currentFCF * terminalMultiple;
  const pvTerminalValue = terminalValue / Math.pow(1 + r, n);

  return pvCashFlows + pvTerminalValue;
}

/**
 * High-precision Binary Search solver for Reverse DCF.
 * Finds the compound annual growth rate 'g' such that forwardEV(g) equals targetEV.
 */
export function solveImpliedGrowthRate(
  fcf0: number,
  targetEV: number,
  discountRate: number,
  years: number,
  terminalMultiple: number
): number {
  if (fcf0 <= 0 || targetEV <= 0) return 0;

  const r = discountRate / 100;
  let low = -0.5; // -50% annual contraction
  let high = 2.0; // +200% annual explosion
  const tolerance = 0.0001;
  const maxIterations = 60;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const ev = forwardEV(fcf0, mid, r, years, terminalMultiple);

    if (Math.abs(ev - targetEV) < targetEV * tolerance) {
      return mid * 100; // return as percentage
    }

    if (ev < targetEV) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return ((low + high) / 2) * 100;
}

/**
 * Calculates Fair Value per share based on user's expected growth rate.
 */
export function calculateFairValue(
  fcf0: number,
  userGrowthRatePercent: number,
  discountRatePercent: number,
  years: number,
  terminalMultiple: number,
  netCash: number,
  sharesOutstanding: number
): number {
  if (sharesOutstanding <= 0 || fcf0 <= 0) return 0;
  const g = userGrowthRatePercent / 100;
  const r = discountRatePercent / 100;

  const ev = forwardEV(fcf0, g, r, years, terminalMultiple);
  const impliedMarketCap = ev + netCash;
  const fairValuePerShare = impliedMarketCap / sharesOutstanding;

  return Math.max(0, fairValuePerShare);
}

/**
 * Analyzes the risk bracket of the implied growth rate against historical base rates.
 */
export function categorizeRiskZone(impliedGrowth: number): ValuationResults['riskAssessment'] {
  if (impliedGrowth < 4) {
    return {
      zone: 'DEEP_VALUE',
      label: 'Глубокая недооценка / Стагнация',
      description: 'Рынок закладывает околонулевой или отрицательный реальный рост. При сохранении текущего FCF инвестор защищен высоким свободным потоком.',
      historicalPercentile: 'Топ 15% по марже безопасности',
      accentColor: '#10B981', // emerald
    };
  } else if (impliedGrowth <= 12) {
    return {
      zone: 'BALANCED',
      label: 'Здоровые умеренные ожидания',
      description: 'Рост на уровне ВВП + инфляция или стабильного спроса. Достижимо для качественных лидеров без аномальных прорывов.',
      historicalPercentile: 'Диапазон зрелых лидеров S&P 500',
      accentColor: '#38BDF8', // ice cyan
    };
  } else if (impliedGrowth <= 22) {
    return {
      zone: 'HIGH_EXECUTION',
      label: 'Высокие требования к исполнению',
      description: 'Рынок требует удвоения денежных потоков каждые 4-5 лет. Любое замедление темпов вызовет чувствительную переоценку мультипликаторов.',
      historicalPercentile: 'Лишь 12% публичных компаний удерживают такой темп 10 лет подряд',
      accentColor: '#6366F1', // electric cobalt/indigo (no yellow)
    };
  } else if (impliedGrowth <= 35) {
    return {
      zone: 'STRETCHED',
      label: 'Напряженная траектория гиперроста',
      description: 'Для оправдания текущей цены компании требуется доминировать на растущем рынке без спадов маржинальности. Право на ошибку минимально.',
      historicalPercentile: 'Менее 4% компаний удерживают CAGR >25% в течение декады',
      accentColor: '#A855F7', // violet
    };
  } else {
    return {
      zone: 'EUPHORIA',
      label: 'Зона эйфории / Сверхвысокий риск',
      description: 'Цена закладывает идеальный сценарий без конкуренции и циклов спада. Исторически такие ожидания чаще всего приводят к резким просадкам.',
      historicalPercentile: '< 1% технологических гигантов в истории',
      accentColor: '#F43F5E', // crimson/rose
    };
  }
}

/**
 * Full valuation analysis engine.
 */
export function analyzeValuation(
  asset: StockAsset,
  params: ValuationParams
): ValuationResults {
  const ev = calculateEnterpriseValue(asset.marketCap, asset.netCash);
  const impliedGrowth = solveImpliedGrowthRate(
    asset.freeCashFlow,
    ev,
    params.discountRate,
    params.projectionYears,
    params.terminalMultiple
  );

  const fairValue = calculateFairValue(
    asset.freeCashFlow,
    params.userExpectedGrowth,
    params.discountRate,
    params.projectionYears,
    params.terminalMultiple,
    asset.netCash,
    asset.sharesOutstanding
  );

  const upsideDownside = asset.currentPrice > 0
    ? ((fairValue - asset.currentPrice) / asset.currentPrice) * 100
    : 0;

  const marginOfSafety = 100 - (asset.currentPrice / Math.max(0.01, fairValue)) * 100;

  // Trajectory over 10 years
  const trajectory: ValuationResults['cashFlowTrajectory'] = [];
  let mFCF = asset.freeCashFlow;
  let uFCF = asset.freeCashFlow;
  const mG = impliedGrowth / 100;
  const uG = params.userExpectedGrowth / 100;
  const r = params.discountRate / 100;

  trajectory.push({
    year: 0,
    marketImpliedFCF: Number(mFCF.toFixed(2)),
    userProjectedFCF: Number(uFCF.toFixed(2)),
    discountedMarketFCF: Number(mFCF.toFixed(2)),
  });

  for (let y = 1; y <= params.projectionYears; y++) {
    mFCF = mFCF * (1 + mG);
    uFCF = uFCF * (1 + uG);
    const disc = mFCF / Math.pow(1 + r, y);
    trajectory.push({
      year: y,
      marketImpliedFCF: Number(mFCF.toFixed(2)),
      userProjectedFCF: Number(uFCF.toFixed(2)),
      discountedMarketFCF: Number(disc.toFixed(2)),
    });
  }

  const riskAssessment = categorizeRiskZone(impliedGrowth);

  return {
    impliedGrowthRate: Number(impliedGrowth.toFixed(1)),
    enterpriseValue: Number(ev.toFixed(1)),
    fairValuePerShare: Number(fairValue.toFixed(2)),
    upsideDownsidePercent: Number(upsideDownside.toFixed(1)),
    marginOfSafety: Number(marginOfSafety.toFixed(1)),
    riskAssessment,
    cashFlowTrajectory: trajectory,
  };
}

/**
 * Builds a 2D sensitivity matrix for Discount Rate (8%..12%) and Terminal Multiples (15x..30x).
 */
export function generateSensitivityMatrix(
  asset: StockAsset,
  userGrowth: number,
  projectionYears: number
): SensitivityCell[][] {
  const discountRates = [8, 9, 10, 11, 12];
  const multiples = [15, 18, 22, 26, 30];

  const grid: SensitivityCell[][] = [];

  for (const r of discountRates) {
    const row: SensitivityCell[] = [];
    for (const m of multiples) {
      const price = calculateFairValue(
        asset.freeCashFlow,
        userGrowth,
        r,
        projectionYears,
        m,
        asset.netCash,
        asset.sharesOutstanding
      );
      const delta = asset.currentPrice > 0
        ? ((price - asset.currentPrice) / asset.currentPrice) * 100
        : 0;
      row.push({
        discountRate: r,
        terminalMultiple: m,
        impliedPrice: Number(price.toFixed(1)),
        deltaPercent: Number(delta.toFixed(1)),
      });
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Mathematical Kelly Criterion & Risk-of-Ruin Evaluator.
 * Formula: f* = p - (1 - p) / b
 * where p = win probability, b = payoff ratio (upside / stopLoss)
 */
export function calculateKellyAllocation(params: KellyParams): KellyResults {
  const p = params.winProbability / 100;
  const q = 1 - p;
  const b = params.stopLossPercent > 0 ? params.targetUpsidePercent / params.stopLossPercent : 1;

  // Kelly fraction f*
  let kelly = p - q / b;
  if (kelly < 0 || isNaN(kelly)) kelly = 0;

  // Cap at 100% max
  const fullKellyFraction = Math.min(100, Math.max(0, kelly * 100));
  // Half Kelly is standard institutional risk management to prevent volatility drag
  const halfKellyFraction = fullKellyFraction / 2;

  // Expected Value: EV = p * Upside - q * Downside
  const ev = p * params.targetUpsidePercent - q * params.stopLossPercent;

  let ruinRating: KellyResults['ruinProbabilityRating'] = 'MINIMAL';
  if (halfKellyFraction > 25 || params.stopLossPercent > 35) {
    ruinRating = 'DANGEROUS';
  } else if (halfKellyFraction > 18 || params.stopLossPercent > 25) {
    ruinRating = 'ELEVATED';
  } else if (halfKellyFraction > 10) {
    ruinRating = 'MODERATE';
  }

  return {
    fullKellyFraction: Number(fullKellyFraction.toFixed(1)),
    halfKellyFraction: Number(halfKellyFraction.toFixed(1)),
    expectedValuePercent: Number(ev.toFixed(1)),
    riskRewardRatio: Number(b.toFixed(2)),
    ruinProbabilityRating: ruinRating,
  };
}

/**
 * Capital Runway Stress-Tester across Macro Shocks.
 */
export function calculateCapitalRunway(params: CapitalRunwayParams): RunwayResults {
  const { totalLiquidCapital, monthlyBurn, passiveMonthlyCashFlow, macroScenario } = params;

  // Adjustments based on macro regime
  let monthlyInflationRate = 0.03 / 12; // 3% annual baseline
  let upfrontCapitalShock = 0; // % drop on day 1
  let annualAssetReturn = 0.06; // 6% portfolio return

  if (macroScenario === 'STAGFLATION') {
    monthlyInflationRate = 0.08 / 12; // 8% inflation
    annualAssetReturn = 0.01; // real return near zero
  } else if (macroScenario === 'MARKET_SHOCK') {
    upfrontCapitalShock = 0.30; // immediate -30% portfolio haircut
    annualAssetReturn = 0.04;
  } else if (macroScenario === 'EXTENDED_WINTER') {
    annualAssetReturn = -0.05; // prolonged negative real return for 3 years
    monthlyInflationRate = 0.05 / 12;
  }

  let capital = totalLiquidCapital * (1 - upfrontCapitalShock);
  let currentBurn = monthlyBurn;
  let currentPassive = passiveMonthlyCashFlow;

  const trajectory: RunwayResults['monthlyTrajectory'] = [];
  let month = 0;
  const maxMonths = 360; // 30 years cap

  while (capital > 0 && month < maxMonths) {
    if (month % 3 === 0 || month < 24) {
      trajectory.push({
        month,
        capitalRemaining: Math.round(capital),
        burnWithInflation: Math.round(currentBurn),
      });
    }

    const netMonthlyDeficit = currentBurn - currentPassive;
    if (netMonthlyDeficit <= 0) {
      // Infinite runway (financial independence achieved)
      month = maxMonths;
      break;
    }

    // Capital yields monthly return
    const monthlyReturn = (capital * annualAssetReturn) / 12;
    capital = capital + monthlyReturn - netMonthlyDeficit;
    currentBurn = currentBurn * (1 + monthlyInflationRate);
    month++;
  }

  const runwayYears = Math.floor(month / 12);
  const runwayMonths = month % 12;

  const burnCoverage = monthlyBurn > 0 ? (passiveMonthlyCashFlow / monthlyBurn) * 100 : 100;

  let survivalText = 'Высокая автономия капитала';
  if (month < 12) {
    survivalText = 'Критическая зона: менее 1 года автономности';
  } else if (month < 36) {
    survivalText = 'Уязвимая зона: менее 3 лет запаса';
  } else if (month >= 300) {
    survivalText = 'Финансовая суверенность: капитал самоподдерживающийся';
  }

  return {
    runwayYears,
    runwayMonths,
    totalRunwayMonths: month,
    monthlyTrajectory: trajectory,
    survivalProbabilityText: survivalText,
    burnCoverageRatio: Number(burnCoverage.toFixed(1)),
  };
}
