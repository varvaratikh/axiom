export interface StockAsset {
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  sharesOutstanding: number; // in billions
  freeCashFlow: number; // in billions
  netCash: number; // in billions (cash - total debt)
  marketCap: number; // in billions
  peRatio: number;
  beta: number;
  description: string;
  historicalGrowthRate: number; // last 5y CAGR in %
}

export interface ValuationParams {
  discountRate: number; // in % (e.g. 10%)
  terminalMultiple: number; // e.g. 20x
  projectionYears: number; // 5 or 10
  terminalGrowthRate: number; // e.g. 3%
  userExpectedGrowth: number; // in % (e.g. 15%)
}

export interface ValuationResults {
  impliedGrowthRate: number; // in %
  enterpriseValue: number; // in billions
  fairValuePerShare: number; // based on userExpectedGrowth
  upsideDownsidePercent: number; // fairValue vs currentPrice
  marginOfSafety: number; // in %
  riskAssessment: {
    zone: 'DEEP_VALUE' | 'BALANCED' | 'HIGH_EXECUTION' | 'STRETCHED' | 'EUPHORIA';
    label: string;
    description: string;
    historicalPercentile: string;
    accentColor: string;
  };
  cashFlowTrajectory: {
    year: number;
    marketImpliedFCF: number;
    userProjectedFCF: number;
    discountedMarketFCF: number;
  }[];
}

export interface SensitivityCell {
  discountRate: number;
  terminalMultiple: number;
  impliedPrice: number;
  deltaPercent: number;
}

export interface KellyParams {
  portfolioSize: number;
  winProbability: number; // in % (e.g. 60)
  targetUpsidePercent: number; // e.g. 40%
  stopLossPercent: number; // e.g. 15%
}

export interface KellyResults {
  fullKellyFraction: number; // % of portfolio
  halfKellyFraction: number; // recommended prudent allocation %
  expectedValuePercent: number; // EV %
  riskRewardRatio: number;
  ruinProbabilityRating: 'MINIMAL' | 'MODERATE' | 'ELEVATED' | 'DANGEROUS';
}

export interface CapitalRunwayParams {
  totalLiquidCapital: number;
  monthlyBurn: number;
  passiveMonthlyCashFlow: number;
  macroScenario: 'BASELINE' | 'STAGFLATION' | 'MARKET_SHOCK' | 'EXTENDED_WINTER';
}

export interface RunwayResults {
  runwayYears: number;
  runwayMonths: number;
  totalRunwayMonths: number;
  monthlyTrajectory: {
    month: number;
    capitalRemaining: number;
    burnWithInflation: number;
  }[];
  survivalProbabilityText: string;
  burnCoverageRatio: number;
}
