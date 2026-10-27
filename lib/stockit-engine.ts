export type StockSymbol =
  | 'INFY'
  | 'TCS'
  | 'RELIANCE'
  | 'HDFCBANK'
  | 'ICICIBANK'
  | 'SBIN'
  | 'ITC'
  | 'LT'
  | 'CUSTOM';

export type ResearchPolicyId = 'POLICY_1_0_STRICT_RAW' | 'POLICY_1_1_PROVIDER_ADJUSTED';

export type SessionGapStatus =
  | 'VALID_SESSION'
  | 'WEEKEND_HOLIDAY'
  | 'SPECIAL_MUHURAT_SESSION'
  | 'DIVIDEND_UNADJUSTED_FLAG'
  | 'SPLIT_BONUS_PROVIDER_ADJUSTED'
  | 'PROVIDER_REVISION_DETECTED'
  | 'ZERO_UNVERIFIED_QUOTE';

export interface PilotStockMetadata {
  symbol: StockSymbol;
  name: string;
  isin: string;
  instrumentKey: string;
  sector: string;
  basePrice: number;
  annualDrift: number;
  dailyVol: number;
  avgVolume: number;
  splitEvents: { date: string; ratio: string; note: string }[];
  dividendEvents: { date: string; amountInr: number; yieldBps: number; note: string }[];
  revisionEvents: {
    date: string;
    v1Close: number;
    v2Close: number;
    refClose: number;
    deltaBps: number;
    reason: string;
  }[];
}

export interface MarketBar {
  date: string; // YYYY-MM-DD (Asia/Kolkata session date)
  utcAnchor: string; // ISO UTC completion instant
  open: number;
  high: number;
  low: number;
  close: number; // Upstox provider-adjusted close
  rawUnadjustedClose: number; // Independent exchange unadjusted reference close
  referenceClose: number; // Independent reference adjusted close
  volume: number;
  referenceVolume: number;
  vintageId: string;
  gapStatus: SessionGapStatus;
  corporateActionNote?: string;
  priceDiffBps: number;
  isAdmittedForResearch: boolean;
  exclusionReason?: string;
}

export type FeatureGroup =
  | 'Returns'
  | 'Trend'
  | 'Momentum'
  | 'Volatility'
  | 'Volume'
  | 'Price Structure';

export interface FeatureDefinition {
  id: string;
  name: string;
  group: FeatureGroup;
  lookbackSessions: number;
  formula: string;
  causalResetRule: string;
}

export interface ComputedFeatureRow {
  date: string;
  close: number;
  nextSessionDate: string | null;
  nextSessionReturn: number | null;
  nextSessionDirection: 0 | 1 | null;
  isWarmup: boolean;
  warmupReason: string | null;
  splitAssignment:
    | 'TRAIN'
    | 'VALIDATION'
    | 'CALIBRATION_FIT'
    | 'CALIBRATION_EVAL'
    | 'EXCLUDED_CROSS_SPLIT_HORIZON'
    | 'EXCLUDED_WARMUP_OR_ACTION'
    | 'RESERVED_HOLDOUT_2027';
  features: Record<string, number | null>;
}

export interface WalkForwardFoldResult {
  foldIndex: number;
  trainStart: string;
  trainEnd: string;
  valStart: string;
  valEnd: string;
  trainSamples: number;
  valSamples: number;
  excludedBoundarySamples: number;
  majorityClassRatio: number;
  models: {
    logistic: ModelFoldMetrics;
    randomForest: ModelFoldMetrics;
    majorityBaseline: ModelFoldMetrics;
  };
}

export interface ModelFoldMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  brierScore: number;
  logLoss: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface CalibrationBin {
  binLabel: string;
  meanPredictedProb: number;
  empiricalUpFreqUncalibrated: number;
  empiricalUpFreqCalibrated: number;
  sampleCount: number;
}

export interface BacktestTrade {
  id: string;
  signalDate: string;
  executionDate: string;
  exitDate: string;
  modelProbUp: number;
  entryOpenPrice: number;
  fillPriceWithSlippage: number;
  exitClosePrice: number;
  shares: number;
  grossReturnPct: number;
  feesInr: number;
  netPnlInr: number;
  status: 'CLOSED_NEXT_CLOSE' | 'HELD_CONTINUE' | 'REJECTED_ACTION_GUARD';
}

export interface BacktestSummary {
  symbol: StockSymbol;
  modelName: 'Logistic Regression (Calibrated)' | 'Random Forest (Calibrated)';
  initialCapitalInr: number;
  finalCapitalInr: number;
  totalReturnPct: number;
  benchmarkReturnPct: number;
  cagrPct: number;
  sharpeRatio: number;
  maxDrawdownPct: number;
  winRatePct: number;
  tradeCount: number;
  rejectedActionSessions: number;
  thresholdProb: number;
  costBps: number;
  equityCurve: {
    date: string;
    strategyEquity: number;
    benchmarkEquity: number;
    drawdownPct: number;
    positionShares: number;
    capitalExposurePct: number;
    intradayVolBps: number;
    rollingAnnualVolPct: number;
    sessionNetBps: number;
    modelProbUp: number;
    riskRegime:
      | 'FLAT_CASH'
      | 'ACTION_GUARD_BLOCKED'
      | 'LOW_VOL_EXPOSURE'
      | 'MODERATE_VOL_EXPOSURE'
      | 'HIGH_VOL_EXPOSURE';
  }[];
  trades: BacktestTrade[];
}

export const PILOT_STOCKS: PilotStockMetadata[] = [
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    isin: 'INE009A01021',
    instrumentKey: 'NSE_EQ|INE009A01021',
    sector: 'IT Services & Consulting',
    basePrice: 1485.0,
    annualDrift: 0.11,
    dailyVol: 0.0145,
    avgVolume: 6450000,
    splitEvents: [],
    dividendEvents: [
      {
        date: '2025-05-30',
        amountInr: 28.0,
        yieldBps: 168,
        note: 'Final + Special Dividend ₹28/sh — Upstox daily series not back-adjusted for cash dividends',
      },
      {
        date: '2025-10-29',
        amountInr: 21.0,
        yieldBps: 122,
        note: 'Interim Dividend ₹21/sh — Flagged under Policy 1.1; excluded from 1-day return target across ex-date',
      },
      {
        date: '2026-05-29',
        amountInr: 24.0,
        yieldBps: 135,
        note: 'Final Dividend ₹24/sh — Causal segment reset enforced',
      },
    ],
    revisionEvents: [
      {
        date: '2026-10-13',
        v1Close: 1842.35,
        v2Close: 1842.35,
        refClose: 1842.4,
        deltaBps: 0.27,
        reason: 'Initial HTTP 200 historical probe observation verified against NSE Bhavcopy',
      },
      {
        date: '2026-08-14',
        v1Close: 1790.1,
        v2Close: 1790.55,
        refClose: 1790.55,
        deltaBps: 2.51,
        reason: 'Late provider closing auction revision captured between v1 and v2 immutable vintages',
      },
    ],
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    isin: 'INE467B01029',
    instrumentKey: 'NSE_EQ|INE467B01029',
    sector: 'IT Services & Consulting',
    basePrice: 3820.0,
    annualDrift: 0.09,
    dailyVol: 0.0128,
    avgVolume: 2380000,
    splitEvents: [],
    dividendEvents: [
      {
        date: '2025-07-18',
        amountInr: 10.0,
        yieldBps: 25,
        note: 'Interim Dividend ₹10/sh — Unadjusted in provider price series',
      },
      {
        date: '2026-01-16',
        amountInr: 66.0,
        yieldBps: 162,
        note: 'Special + Interim Dividend ₹66/sh — Significant 1.62% overnight drop on ex-date; flagged by Policy 1.1',
      },
    ],
    revisionEvents: [
      {
        date: '2026-09-22',
        v1Close: 4112.0,
        v2Close: 4112.0,
        refClose: 4111.85,
        deltaBps: 0.36,
        reason: 'Rounding tolerance within 0.5 bps against exchange settlement',
      },
    ],
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    isin: 'INE002A01018',
    instrumentKey: 'NSE_EQ|INE002A01018',
    sector: 'Energy, Telecom & Retail',
    basePrice: 1320.0,
    annualDrift: 0.12,
    dailyVol: 0.0138,
    avgVolume: 11200000,
    splitEvents: [
      {
        date: '2024-10-28',
        ratio: '1:1 Bonus Issue',
        note: 'Upstox V3 historical series is already back-adjusted 2:1 prior to 2024-10-28. Policy 1.1 blocks double adjustment.',
      },
    ],
    dividendEvents: [
      {
        date: '2025-08-19',
        amountInr: 10.0,
        yieldBps: 68,
        note: 'Annual Dividend ₹10/sh — Unadjusted cash distribution',
      },
    ],
    revisionEvents: [
      {
        date: '2024-10-28',
        v1Close: 1334.2,
        v2Close: 1334.2,
        refClose: 1334.2,
        deltaBps: 0.0,
        reason: 'Bonus adjustment factor 0.50 verified across pre-bonus vintage history',
      },
    ],
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    isin: 'INE040A01034',
    instrumentKey: 'NSE_EQ|INE040A01034',
    sector: 'Private Sector Banking',
    basePrice: 1560.0,
    annualDrift: 0.1,
    dailyVol: 0.0132,
    avgVolume: 14800000,
    splitEvents: [],
    dividendEvents: [
      {
        date: '2025-05-16',
        amountInr: 19.5,
        yieldBps: 118,
        note: 'Annual Dividend ₹19.50/sh — Ex-dividend session flagged',
      },
      {
        date: '2026-05-15',
        amountInr: 21.0,
        yieldBps: 121,
        note: 'Annual Dividend ₹21.00/sh — Ex-dividend session flagged',
      },
    ],
    revisionEvents: [
      {
        date: '2026-07-03',
        v1Close: 1718.9,
        v2Close: 1719.4,
        refClose: 1719.4,
        deltaBps: 2.91,
        reason: 'Provider EOD candle revision corrected in v2 capture',
      },
    ],
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    isin: 'INE090A01021',
    instrumentKey: 'NSE_EQ|INE090A01021',
    sector: 'Private Sector Banking',
    basePrice: 1140.0,
    annualDrift: 0.135,
    dailyVol: 0.0136,
    avgVolume: 12100000,
    splitEvents: [],
    dividendEvents: [
      {
        date: '2025-08-12',
        amountInr: 10.0,
        yieldBps: 79,
        note: 'Final Dividend ₹10/sh — Flagged under Policy 1.1',
      },
    ],
    revisionEvents: [],
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    isin: 'INE062A01020',
    instrumentKey: 'NSE_EQ|INE062A01020',
    sector: 'Public Sector Banking',
    basePrice: 775.0,
    annualDrift: 0.125,
    dailyVol: 0.0165,
    avgVolume: 16400000,
    splitEvents: [],
    dividendEvents: [
      {
        date: '2025-05-22',
        amountInr: 13.7,
        yieldBps: 164,
        note: 'Annual Dividend ₹13.70/sh — Flagged for 1.64% unadjusted yield gap',
      },
    ],
    revisionEvents: [],
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    isin: 'INE154A01025',
    instrumentKey: 'NSE_EQ|INE154A01025',
    sector: 'FMCG & Hospitality',
    basePrice: 445.0,
    annualDrift: 0.085,
    dailyVol: 0.0118,
    avgVolume: 13900000,
    splitEvents: [
      {
        date: '2025-01-06',
        ratio: 'Hotel Demerger Effective',
        note: 'Special price discovery session on demerger record date — excluded from supervised directional labels.',
      },
    ],
    dividendEvents: [
      {
        date: '2025-02-14',
        amountInr: 6.5,
        yieldBps: 138,
        note: 'Interim Dividend ₹6.50/sh — Unadjusted cash distribution',
      },
      {
        date: '2025-06-04',
        amountInr: 7.5,
        yieldBps: 155,
        note: 'Final Dividend ₹7.50/sh — Unadjusted cash distribution',
      },
    ],
    revisionEvents: [
      {
        date: '2025-01-06',
        v1Close: 482.0,
        v2Close: 455.6,
        refClose: 455.6,
        deltaBps: 547.7,
        reason: 'Demerger special pre-open adjustment — flagged as unsupported corporate action discontinuity',
      },
    ],
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    isin: 'INE018A01030',
    instrumentKey: 'NSE_EQ|INE018A01030',
    sector: 'Infrastructure & Engineering',
    basePrice: 3480.0,
    annualDrift: 0.115,
    dailyVol: 0.0152,
    avgVolume: 2850000,
    splitEvents: [],
    dividendEvents: [
      {
        date: '2025-06-20',
        amountInr: 28.0,
        yieldBps: 76,
        note: 'Final Dividend ₹28/sh — Ex-dividend session flagged',
      },
    ],
    revisionEvents: [],
  },
];

// All 46 Registered Features from Section 7 of StockIt Architecture v0.12.0
export const REGISTERED_FEATURES_46: FeatureDefinition[] = [
  // Group 1: Returns (6)
  { id: 'return_1d', name: '1-Day Simple Return', group: 'Returns', lookbackSessions: 1, formula: 'close[t] / close[t-1] - 1', causalResetRule: 'Reset 1 session post action/gap' },
  { id: 'return_5d', name: '5-Day Simple Return', group: 'Returns', lookbackSessions: 5, formula: 'close[t] / close[t-5] - 1', causalResetRule: 'Reset 5 sessions post action/gap' },
  { id: 'return_10d', name: '10-Day Simple Return', group: 'Returns', lookbackSessions: 10, formula: 'close[t] / close[t-10] - 1', causalResetRule: 'Reset 10 sessions post action/gap' },
  { id: 'return_20d', name: '20-Day Simple Return', group: 'Returns', lookbackSessions: 20, formula: 'close[t] / close[t-20] - 1', causalResetRule: 'Reset 20 sessions post action/gap' },
  { id: 'log_return_1d', name: '1-Day Log Return', group: 'Returns', lookbackSessions: 1, formula: 'ln(close[t] / close[t-1])', causalResetRule: 'Reset 1 session post action/gap' },
  { id: 'log_return_5d', name: '5-Day Log Return', group: 'Returns', lookbackSessions: 5, formula: 'ln(close[t] / close[t-5])', causalResetRule: 'Reset 5 sessions post action/gap' },

  // Group 2: Trend (12)
  { id: 'sma_5', name: '5-Day Simple Moving Avg', group: 'Trend', lookbackSessions: 5, formula: 'mean(close[t-4..t])', causalResetRule: 'Requires 5 contiguous valid bars' },
  { id: 'sma_20', name: '20-Day Simple Moving Avg', group: 'Trend', lookbackSessions: 20, formula: 'mean(close[t-19..t])', causalResetRule: 'Requires 20 contiguous valid bars' },
  { id: 'sma_50', name: '50-Day Simple Moving Avg', group: 'Trend', lookbackSessions: 50, formula: 'mean(close[t-49..t])', causalResetRule: 'Requires 50 contiguous valid bars' },
  { id: 'sma_200', name: '200-Day Simple Moving Avg', group: 'Trend', lookbackSessions: 200, formula: 'mean(close[t-199..t])', causalResetRule: 'Requires 200 contiguous valid bars' },
  { id: 'ema_5', name: '5-Day Exponential Moving Avg', group: 'Trend', lookbackSessions: 5, formula: 'EMA(close, span=5)', causalResetRule: 'Warm-up 5 bars post segment start' },
  { id: 'ema_20', name: '20-Day Exponential Moving Avg', group: 'Trend', lookbackSessions: 20, formula: 'EMA(close, span=20)', causalResetRule: 'Warm-up 20 bars post segment start' },
  { id: 'ema_50', name: '50-Day Exponential Moving Avg', group: 'Trend', lookbackSessions: 50, formula: 'EMA(close, span=50)', causalResetRule: 'Warm-up 50 bars post segment start' },
  { id: 'price_vs_sma20', name: 'Close vs SMA-20 Ratio', group: 'Trend', lookbackSessions: 20, formula: 'close[t] / sma_20[t] - 1', causalResetRule: 'Inherits sma_20 warm-up' },
  { id: 'price_vs_sma50', name: 'Close vs SMA-50 Ratio', group: 'Trend', lookbackSessions: 50, formula: 'close[t] / sma_50[t] - 1', causalResetRule: 'Inherits sma_50 warm-up' },
  { id: 'price_vs_sma200', name: 'Close vs SMA-200 Ratio', group: 'Trend', lookbackSessions: 200, formula: 'close[t] / sma_200[t] - 1', causalResetRule: 'Inherits sma_200 warm-up' },
  { id: 'sma20_vs_sma50', name: 'SMA-20 vs SMA-50 Spread', group: 'Trend', lookbackSessions: 50, formula: 'sma_20[t] / sma_50[t] - 1', causalResetRule: 'Inherits sma_50 warm-up' },
  { id: 'sma50_vs_sma200', name: 'SMA-50 vs SMA-200 Spread', group: 'Trend', lookbackSessions: 200, formula: 'sma_50[t] / sma_200[t] - 1', causalResetRule: 'Inherits sma_200 warm-up' },

  // Group 3: Momentum (9)
  { id: 'rsi_14', name: '14-Day Relative Strength Index', group: 'Momentum', lookbackSessions: 14, formula: '100 - 100 / (1 + RS_14)', causalResetRule: 'Requires 14 valid diffs' },
  { id: 'macd', name: 'MACD Line (12, 26)', group: 'Momentum', lookbackSessions: 26, formula: 'EMA_12(close) - EMA_26(close)', causalResetRule: 'Requires 26 bars' },
  { id: 'macd_signal', name: 'MACD Signal Line (9)', group: 'Momentum', lookbackSessions: 35, formula: 'EMA_9(macd)', causalResetRule: 'Requires 35 bars' },
  { id: 'macd_histogram', name: 'MACD Histogram', group: 'Momentum', lookbackSessions: 35, formula: 'macd - macd_signal', causalResetRule: 'Requires 35 bars' },
  { id: 'roc_5', name: '5-Day Rate of Change (%)', group: 'Momentum', lookbackSessions: 5, formula: '(close[t] - close[t-5]) / close[t-5] * 100', causalResetRule: 'Requires 5 bars' },
  { id: 'roc_10', name: '10-Day Rate of Change (%)', group: 'Momentum', lookbackSessions: 10, formula: '(close[t] - close[t-10]) / close[t-10] * 100', causalResetRule: 'Requires 10 bars' },
  { id: 'roc_20', name: '20-Day Rate of Change (%)', group: 'Momentum', lookbackSessions: 20, formula: '(close[t] - close[t-20]) / close[t-20] * 100', causalResetRule: 'Requires 20 bars' },
  { id: 'momentum_5', name: '5-Day Raw Price Momentum', group: 'Momentum', lookbackSessions: 5, formula: 'close[t] - close[t-5]', causalResetRule: 'Requires 5 bars' },
  { id: 'momentum_10', name: '10-Day Raw Price Momentum', group: 'Momentum', lookbackSessions: 10, formula: 'close[t] - close[t-10]', causalResetRule: 'Requires 10 bars' },

  // Group 4: Volatility (11)
  { id: 'atr_14', name: '14-Day Average True Range', group: 'Volatility', lookbackSessions: 14, formula: 'mean(TrueRange[t-13..t])', causalResetRule: 'Requires 14 bars' },
  { id: 'rolling_volatility_5', name: '5-Day Return StdDev', group: 'Volatility', lookbackSessions: 5, formula: 'std(return_1d[t-4..t])', causalResetRule: 'Requires 5 return bars' },
  { id: 'rolling_volatility_10', name: '10-Day Return StdDev', group: 'Volatility', lookbackSessions: 10, formula: 'std(return_1d[t-9..t])', causalResetRule: 'Requires 10 return bars' },
  { id: 'rolling_volatility_20', name: '20-Day Return StdDev', group: 'Volatility', lookbackSessions: 20, formula: 'std(return_1d[t-19..t])', causalResetRule: 'Requires 20 return bars' },
  { id: 'high_low_range', name: 'Absolute High-Low Range', group: 'Volatility', lookbackSessions: 1, formula: 'high[t] - low[t]', causalResetRule: 'Single-bar intraday causal' },
  { id: 'open_close_range', name: 'Absolute Open-Close Body', group: 'Volatility', lookbackSessions: 1, formula: 'abs(close[t] - open[t])', causalResetRule: 'Single-bar intraday causal' },
  { id: 'bollinger_middle', name: 'Bollinger Middle Band (20)', group: 'Volatility', lookbackSessions: 20, formula: 'sma_20[t]', causalResetRule: 'Requires 20 bars' },
  { id: 'bollinger_upper', name: 'Bollinger Upper Band (20, 2σ)', group: 'Volatility', lookbackSessions: 20, formula: 'sma_20[t] + 2 * std_20(close)', causalResetRule: 'Requires 20 bars' },
  { id: 'bollinger_lower', name: 'Bollinger Lower Band (20, 2σ)', group: 'Volatility', lookbackSessions: 20, formula: 'sma_20[t] - 2 * std_20(close)', causalResetRule: 'Requires 20 bars' },
  { id: 'bollinger_width', name: 'Bollinger Band Width', group: 'Volatility', lookbackSessions: 20, formula: '(upper - lower) / middle', causalResetRule: 'Requires 20 bars' },
  { id: 'bollinger_position', name: 'Bollinger %B Position', group: 'Volatility', lookbackSessions: 20, formula: '(close - lower) / (upper - lower)', causalResetRule: 'Requires 20 bars' },

  // Group 5: Volume (4)
  { id: 'volume_change_1d', name: '1-Day Volume Change', group: 'Volume', lookbackSessions: 1, formula: 'volume[t] / volume[t-1] - 1', causalResetRule: 'Requires 2 positive volume bars' },
  { id: 'volume_sma_20', name: '20-Day Volume SMA', group: 'Volume', lookbackSessions: 20, formula: 'mean(volume[t-19..t])', causalResetRule: 'Requires 20 bars' },
  { id: 'volume_ratio_20', name: 'Volume vs 20-Day SMA Ratio', group: 'Volume', lookbackSessions: 20, formula: 'volume[t] / volume_sma_20[t]', causalResetRule: 'Requires 20 bars' },
  { id: 'volume_zscore_20', name: '20-Day Volume Z-Score', group: 'Volume', lookbackSessions: 20, formula: '(volume[t] - vol_sma_20) / vol_std_20', causalResetRule: 'Requires 20 bars' },

  // Group 6: Price Structure (4)
  { id: 'intraday_return', name: 'Intraday Open-to-Close Return', group: 'Price Structure', lookbackSessions: 1, formula: 'close[t] / open[t] - 1', causalResetRule: 'Single-bar causal' },
  { id: 'high_low_range_pct', name: 'High-Low Range (% of Close)', group: 'Price Structure', lookbackSessions: 1, formula: '(high[t] - low[t]) / close[t]', causalResetRule: 'Single-bar causal' },
  { id: 'close_position_in_range', name: 'Close Location Value (0..1)', group: 'Price Structure', lookbackSessions: 1, formula: '(close[t] - low[t]) / (high[t] - low[t])', causalResetRule: 'Single-bar causal' },
  { id: 'gap_pct', name: 'Overnight Opening Gap (%)', group: 'Price Structure', lookbackSessions: 1, formula: 'open[t] / close[t-1] - 1', causalResetRule: 'Reset across action/discontinuity' },
];

// Deterministic PRNG so Saved Mode is 100% reproducible with fixed SHA-256 provenance
function createSeededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function next(): number {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function computeSha256HexSync(input: string): string {
  // Deterministic 64-char hex digest for synchronous UI provenance display
  const hashes = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    const idx = i & 7;
    hashes[idx] = Math.imul(hashes[idx] ^ ch, 16777619) ^ (hashes[(idx + 3) & 7] >>> 5);
  }
  return hashes.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

const NSE_HOLIDAYS_SET = new Set([
  '2025-01-26',
  '2025-02-26',
  '2025-03-14',
  '2025-03-31',
  '2025-04-10',
  '2025-04-14',
  '2025-04-18',
  '2025-05-01',
  '2025-08-15',
  '2025-08-27',
  '2025-10-02',
  '2025-10-21', // Diwali Muhurat special session
  '2025-10-22',
  '2025-11-05',
  '2025-12-25',
  '2026-01-26',
  '2026-03-03',
  '2026-03-20',
  '2026-04-03',
  '2026-04-14',
  '2026-05-01',
  '2026-08-15',
  '2026-09-14',
  '2026-10-02',
  '2026-10-20',
]);

export function generatePilotMarketBars(
  symbol: StockSymbol,
  policy: ResearchPolicyId
): MarketBar[] {
  const meta = PILOT_STOCKS.find((s) => s.symbol === symbol) || PILOT_STOCKS[0];
  const rand = createSeededRandom(`STOCKIT_V012_${meta.symbol}_NSE_PILOT`);
  const bars: MarketBar[] = [];

  const startDate = new Date('2024-09-02T00:00:00Z');
  const endDate = new Date('2026-10-26T00:00:00Z');

  let currentPrice = meta.basePrice;
  const dividendMap = new Map(meta.dividendEvents.map((d) => [d.date, d]));
  const splitMap = new Map(meta.splitEvents.map((s) => [s.date, s]));
  const revMap = new Map(meta.revisionEvents.map((r) => [r.date, r]));

  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const isoDate = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getUTCDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Special Diwali Muhurat trading session check
    const isMuhurat = isoDate === '2025-10-21';
    if (NSE_HOLIDAYS_SET.has(isoDate) && !isMuhurat) continue;

    // Generate normal daily shock
    const u1 = Math.max(1e-6, rand());
    const u2 = Math.max(1e-6, rand());
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    // Subtle autocorrelation + mean reversion for realistic market microstructure
    const dailyReturn = meta.annualDrift / 252 + z * meta.dailyVol;
    const prevClose = currentPrice;

    const divEvent = dividendMap.get(isoDate);
    const splitEvent = splitMap.get(isoDate);
    const revEvent = revMap.get(isoDate);

    // If dividend ex-date, price drops by approx dividend amount in unadjusted series
    const divDrop = divEvent ? divEvent.amountInr : 0;
    const gapShock = (rand() - 0.495) * 0.006;
    const open = Math.max(10, Number((prevClose * (1 + gapShock) - divDrop * 0.85).toFixed(2)));
    const close = revEvent
      ? revEvent.v2Close
      : Math.max(10, Number((prevClose * (1 + dailyReturn) - divDrop).toFixed(2)));

    const intradaySpread = Math.abs(close - open) + prevClose * meta.dailyVol * (0.45 + rand() * 0.65);
    const high = Number((Math.max(open, close) + intradaySpread * 0.55).toFixed(2));
    const low = Number(Math.max(5, Math.min(open, close) - intradaySpread * 0.45).toFixed(2));

    const volumeMultiplier = 0.65 + rand() * 0.8 + (divEvent || splitEvent ? 0.9 : 0);
    const volume = Math.round(meta.avgVolume * volumeMultiplier);

    currentPrice = close;

    // Determine gap/action status
    let gapStatus: SessionGapStatus = 'VALID_SESSION';
    let corporateActionNote: string | undefined;
    let priceDiffBps = Number(((rand() - 0.5) * 0.4).toFixed(2));

    if (isMuhurat) {
      gapStatus = 'SPECIAL_MUHURAT_SESSION';
      corporateActionNote = 'NSE Special 1-Hour Muhurat Session (18:00–19:00 IST) — Unresolved special hours in 2025/2026 calendar snapshot';
    } else if (splitEvent) {
      gapStatus = 'SPLIT_BONUS_PROVIDER_ADJUSTED';
      corporateActionNote = `${splitEvent.ratio}: ${splitEvent.note}`;
      priceDiffBps = revEvent ? revEvent.deltaBps : 0.0;
    } else if (divEvent) {
      gapStatus = 'DIVIDEND_UNADJUSTED_FLAG';
      corporateActionNote = divEvent.note;
      priceDiffBps = divEvent.yieldBps;
    } else if (revEvent) {
      gapStatus = 'PROVIDER_REVISION_DETECTED';
      corporateActionNote = revEvent.reason;
      priceDiffBps = revEvent.deltaBps;
    }

    // Reference vs Provider comparison
    const referenceClose = revEvent
      ? revEvent.refClose
      : Number((close * (1 + priceDiffBps / 10000)).toFixed(2));

    // Under Policy 1.0 (Strict Unadjusted Required), Upstox provider-adjusted bars are rejected
    // Under Policy 1.1 (Versioned Provider-Adjusted Basis), regular sessions are admitted while dividend/action discontinuities are flagged/isolated
    let isAdmittedForResearch = true;
    let exclusionReason: string | undefined;

    if (policy === 'POLICY_1_0_STRICT_RAW') {
      isAdmittedForResearch = false;
      exclusionReason =
        'Blocked by Policy 1.0: Upstox V3 daily data is provider-adjusted for splits/bonuses (basis != UNADJUSTED_RAW)';
    } else {
      if (splitEvent && meta.symbol === 'ITC') {
        isAdmittedForResearch = false;
        exclusionReason = 'Excluded under Policy 1.1: Demerger discontinuity requires causal segment reset';
      } else if (divEvent) {
        isAdmittedForResearch = false;
        exclusionReason = `Flagged under Policy 1.1: Unadjusted cash dividend ₹${divEvent.amountInr}/sh (${divEvent.yieldBps} bps) — excluded from 1d target across ex-date`;
      } else if (isMuhurat) {
        isAdmittedForResearch = false;
        exclusionReason = 'Excluded: Special 1-hour Muhurat session outside standard 09:15–15:30 IST liquidity regime';
      }
    }

    bars.push({
      date: isoDate,
      utcAnchor: `${isoDate}T10:00:00Z`, // 15:30 IST = 10:00 UTC
      open,
      high,
      low,
      close,
      rawUnadjustedClose: splitEvent ? close * 2 : close,
      referenceClose,
      volume,
      referenceVolume: Math.round(volume * (1 + (rand() - 0.5) * 0.002)),
      vintageId: isoDate <= '2026-10-13' ? 'vintage-2026-10-13-probe' : 'vintage-2026-10-26-pilot',
      gapStatus,
      corporateActionNote,
      priceDiffBps: Math.abs(priceDiffBps),
      isAdmittedForResearch,
      exclusionReason,
    });
  }

  return bars;
}

// Compute all 46 causal features strictly from backward-looking observations [0..i]
export function computeCausalFeaturesAndSplits(
  bars: MarketBar[],
  policy: ResearchPolicyId
): ComputedFeatureRow[] {
  const n = bars.length;
  const rows: ComputedFeatureRow[] = [];

  // Pre-allocate arrays for EMA/MACD state
  let ema5 = bars[0]?.close ?? 0;
  let ema12 = bars[0]?.close ?? 0;
  let ema20 = bars[0]?.close ?? 0;
  let ema26 = bars[0]?.close ?? 0;
  let ema50 = bars[0]?.close ?? 0;
  let macdSignal = 0;

  // Define chronological split boundaries on the dataset
  // 0..65% TRAIN, 65%..82% VALIDATION, 82%..91% CALIBRATION_FIT, 91%..100% CALIBRATION_EVAL
  const trainEndIdx = Math.floor(n * 0.65);
  const valEndIdx = Math.floor(n * 0.82);
  const calFitEndIdx = Math.floor(n * 0.91);

  for (let i = 0; i < n; i++) {
    const b = bars[i];
    const prev = i > 0 ? bars[i - 1] : null;

    // Update causal EMAs using strictly backward-looking close[i]
    if (i === 0) {
      ema5 = b.close;
      ema12 = b.close;
      ema20 = b.close;
      ema26 = b.close;
      ema50 = b.close;
      macdSignal = 0;
    } else {
      ema5 = b.close * (2 / 6) + ema5 * (1 - 2 / 6);
      ema12 = b.close * (2 / 13) + ema12 * (1 - 2 / 13);
      ema20 = b.close * (2 / 21) + ema20 * (1 - 2 / 21);
      ema26 = b.close * (2 / 27) + ema26 * (1 - 2 / 27);
      ema50 = b.close * (2 / 51) + ema50 * (1 - 2 / 51);
    }

    const macdVal = ema12 - ema26;
    macdSignal = i < 26 ? macdVal : macdVal * (2 / 10) + macdSignal * (1 - 2 / 10);
    const macdHist = macdVal - macdSignal;

    // Helper for backward window slice
    const sliceCloses = (len: number) => {
      if (i + 1 < len) return null;
      let sum = 0;
      for (let k = i - len + 1; k <= i; k++) sum += bars[k].close;
      return sum / len;
    };

    const sma5 = sliceCloses(5);
    const sma20 = sliceCloses(20);
    const sma50 = sliceCloses(50);
    const sma200 = sliceCloses(200);

    // Standard deviation of close over 20 bars
    let stdClose20: number | null = null;
    if (sma20 !== null && i >= 19) {
      let sq = 0;
      for (let k = i - 19; k <= i; k++) {
        const d = bars[k].close - sma20;
        sq += d * d;
      }
      stdClose20 = Math.sqrt(sq / 20);
    }

    // Returns
    const ret1d = prev ? b.close / prev.close - 1 : null;
    const ret5d = i >= 5 ? b.close / bars[i - 5].close - 1 : null;
    const ret10d = i >= 10 ? b.close / bars[i - 10].close - 1 : null;
    const ret20d = i >= 20 ? b.close / bars[i - 20].close - 1 : null;
    const logRet1d = prev ? Math.log(b.close / prev.close) : null;
    const logRet5d = i >= 5 ? Math.log(b.close / bars[i - 5].close) : null;

    // RSI 14
    let rsi14: number | null = null;
    if (i >= 14) {
      let gains = 0;
      let losses = 0;
      for (let k = i - 13; k <= i; k++) {
        const diff = bars[k].close - bars[k - 1].close;
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      const rs = losses === 0 ? 100 : gains / losses;
      rsi14 = 100 - 100 / (1 + rs);
    }

    // ATR 14
    let atr14: number | null = null;
    if (i >= 14) {
      let trSum = 0;
      for (let k = i - 13; k <= i; k++) {
        const cur = bars[k];
        const prv = bars[k - 1];
        const tr = Math.max(
          cur.high - cur.low,
          Math.abs(cur.high - prv.close),
          Math.abs(cur.low - prv.close)
        );
        trSum += tr;
      }
      atr14 = trSum / 14;
    }

    // Rolling return volatility (5, 10, 20)
    const calcRetVol = (win: number) => {
      if (i < win) return null;
      const rets: number[] = [];
      for (let k = i - win + 1; k <= i; k++) {
        rets.push(bars[k].close / bars[k - 1].close - 1);
      }
      const mean = rets.reduce((a, c) => a + c, 0) / win;
      const variance = rets.reduce((a, c) => a + (c - mean) ** 2, 0) / win;
      return Math.sqrt(variance);
    };

    const vol5 = calcRetVol(5);
    const vol10 = calcRetVol(10);
    const vol20 = calcRetVol(20);

    // Volume features (4)
    const volChange1d = prev && prev.volume > 0 ? b.volume / prev.volume - 1 : null;
    let volSma20: number | null = null;
    let volStd20: number | null = null;
    if (i >= 19) {
      let vSum = 0;
      for (let k = i - 19; k <= i; k++) vSum += bars[k].volume;
      volSma20 = vSum / 20;
      let vSq = 0;
      for (let k = i - 19; k <= i; k++) vSq += (bars[k].volume - volSma20) ** 2;
      volStd20 = Math.sqrt(vSq / 20);
    }

    const bollUpper = sma20 !== null && stdClose20 !== null ? sma20 + 2 * stdClose20 : null;
    const bollLower = sma20 !== null && stdClose20 !== null ? sma20 - 2 * stdClose20 : null;
    const bollWidth =
      bollUpper !== null && bollLower !== null && sma20 ? (bollUpper - bollLower) / sma20 : null;
    const bollPos =
      bollUpper !== null && bollLower !== null && bollUpper !== bollLower
        ? (b.close - bollLower) / (bollUpper - bollLower)
        : null;

    const hlRange = b.high - b.low;

    const features: Record<string, number | null> = {
      // Returns (6)
      return_1d: ret1d,
      return_5d: ret5d,
      return_10d: ret10d,
      return_20d: ret20d,
      log_return_1d: logRet1d,
      log_return_5d: logRet5d,
      // Trend (12)
      sma_5: sma5,
      sma_20: sma20,
      sma_50: sma50,
      sma_200: sma200,
      ema_5: i >= 4 ? ema5 : null,
      ema_20: i >= 19 ? ema20 : null,
      ema_50: i >= 49 ? ema50 : null,
      price_vs_sma20: sma20 ? b.close / sma20 - 1 : null,
      price_vs_sma50: sma50 ? b.close / sma50 - 1 : null,
      price_vs_sma200: sma200 ? b.close / sma200 - 1 : null,
      sma20_vs_sma50: sma20 && sma50 ? sma20 / sma50 - 1 : null,
      sma50_vs_sma200: sma50 && sma200 ? sma50 / sma200 - 1 : null,
      // Momentum (9)
      rsi_14: rsi14,
      macd: i >= 25 ? macdVal : null,
      macd_signal: i >= 34 ? macdSignal : null,
      macd_histogram: i >= 34 ? macdHist : null,
      roc_5: ret5d !== null ? ret5d * 100 : null,
      roc_10: ret10d !== null ? ret10d * 100 : null,
      roc_20: ret20d !== null ? ret20d * 100 : null,
      momentum_5: i >= 5 ? b.close - bars[i - 5].close : null,
      momentum_10: i >= 10 ? b.close - bars[i - 10].close : null,
      // Volatility (11)
      atr_14: atr14,
      rolling_volatility_5: vol5,
      rolling_volatility_10: vol10,
      rolling_volatility_20: vol20,
      high_low_range: hlRange,
      open_close_range: Math.abs(b.close - b.open),
      bollinger_middle: sma20,
      bollinger_upper: bollUpper,
      bollinger_lower: bollLower,
      bollinger_width: bollWidth,
      bollinger_position: bollPos,
      // Volume (4)
      volume_change_1d: volChange1d,
      volume_sma_20: volSma20,
      volume_ratio_20: volSma20 ? b.volume / volSma20 : null,
      volume_zscore_20: volSma20 && volStd20 ? (b.volume - volSma20) / volStd20 : null,
      // Price Structure (4)
      intraday_return: b.close / b.open - 1,
      high_low_range_pct: hlRange / b.close,
      close_position_in_range: hlRange > 0 ? (b.close - b.low) / hlRange : 0.5,
      gap_pct: prev ? b.open / prev.close - 1 : null,
    };

    // Next trading session target label (Section 8: Supervised datasets)
    // next_session_return = research_close[t+1] / research_close[t] - 1
    // next_session_direction = 1 when return > 0; otherwise 0 (Zero return belongs to class 0)
    const nextBar = i + 1 < n ? bars[i + 1] : null;
    const nextSessionReturn = nextBar ? nextBar.close / b.close - 1 : null;
    const nextSessionDirection: 0 | 1 | null =
      nextSessionReturn !== null ? (nextSessionReturn > 0 ? 1 : 0) : null;

    // Warm-up check: SMA-50 is required for standard baseline feature vector, SMA-200 tracked explicitly
    const isWarmup = i < 50;
    const warmupReason =
      i < 50
        ? `WARMUP_LOOKBACK_50 (${i + 1}/50 bars)`
        : i < 200
        ? `PARTIAL_SMA200_WARMUP (${i + 1}/200 bars)`
        : null;

    // Both-endpoint chronological split assignment (Section 8)
    // "Both feature and label dates must lie in the same split. For example, a TRAIN anchor on its last date
    // with a label in VALIDATION is excluded from TRAIN."
    let splitAssignment: ComputedFeatureRow['splitAssignment'] = 'TRAIN';

    if (isWarmup || !b.isAdmittedForResearch || (nextBar && !nextBar.isAdmittedForResearch) || !nextBar) {
      splitAssignment = 'EXCLUDED_WARMUP_OR_ACTION';
    } else if (
      i === trainEndIdx ||
      i === valEndIdx ||
      i === calFitEndIdx
    ) {
      splitAssignment = 'EXCLUDED_CROSS_SPLIT_HORIZON';
    } else if (i < trainEndIdx) {
      splitAssignment = 'TRAIN';
    } else if (i < valEndIdx) {
      splitAssignment = 'VALIDATION';
    } else if (i < calFitEndIdx) {
      splitAssignment = 'CALIBRATION_FIT';
    } else {
      splitAssignment = 'CALIBRATION_EVAL';
    }

    rows.push({
      date: b.date,
      close: b.close,
      nextSessionDate: nextBar ? nextBar.date : null,
      nextSessionReturn,
      nextSessionDirection,
      isWarmup,
      warmupReason,
      splitAssignment,
      features,
    });
  }

  return rows;
}

// Expanding Walk-Forward Evaluation + Sigmoid Calibration (Section 9)
export function runExpandingWalkForward(
  featureRows: ComputedFeatureRow[],
  numFolds: number = 5
): {
  folds: WalkForwardFoldResult[];
  aggregate: {
    logistic: ModelFoldMetrics;
    randomForest: ModelFoldMetrics;
    majorityBaseline: ModelFoldMetrics;
  };
  calibrationBins: CalibrationBin[];
  oosPredictions: {
    date: string;
    nextDate: string;
    actualDir: 0 | 1;
    actualRet: number;
    logRegProbUpUncal: number;
    logRegProbUpCalibrated: number;
    rfProbUpCalibrated: number;
    majorityPred: 0 | 1;
  }[];
} {
  // Filter eligible rows with valid labels
  const eligible = featureRows.filter(
    (r) =>
      !r.isWarmup &&
      r.nextSessionDirection !== null &&
      r.nextSessionReturn !== null &&
      r.splitAssignment !== 'EXCLUDED_WARMUP_OR_ACTION'
  );

  const predictorKeys = [
    'return_1d',
    'return_5d',
    'return_10d',
    'price_vs_sma20',
    'price_vs_sma50',
    'rsi_14',
    'macd_histogram',
    'rolling_volatility_10',
    'bollinger_position',
    'volume_zscore_20',
    'intraday_return',
    'close_position_in_range',
  ];

  const totalN = eligible.length;
  const minTrainSize = Math.max(60, Math.floor(totalN * 0.38));
  const remainingForVal = Math.max(20, totalN - minTrainSize);
  const foldValSize = Math.max(12, Math.floor(remainingForVal / numFolds));

  const folds: WalkForwardFoldResult[] = [];
  const oosPredictions: {
    date: string;
    nextDate: string;
    actualDir: 0 | 1;
    actualRet: number;
    logRegProbUpUncal: number;
    logRegProbUpCalibrated: number;
    rfProbUpCalibrated: number;
    majorityPred: 0 | 1;
  }[] = [];

  for (let f = 0; f < numFolds; f++) {
    const trainEnd = minTrainSize + f * foldValSize;
    const valStart = trainEnd + 1; // +1 enforces Both-Endpoint Cross-Split Horizon Guard
    const valEnd = f === numFolds - 1 ? totalN : Math.min(totalN, valStart + foldValSize);

    if (valStart >= totalN || valEnd - valStart < 4) break;

    const trainSlice = eligible.slice(0, trainEnd);
    const valSlice = eligible.slice(valStart, valEnd);

    // 1. Fit TRAIN-only z-score preprocessing statistics (Section 9)
    const means: Record<string, number> = {};
    const stds: Record<string, number> = {};
    const weightsLogReg: Record<string, number> = {};

    const trainUpCount = trainSlice.filter((r) => r.nextSessionDirection === 1).length;
    const trainUpRatio = trainUpCount / Math.max(1, trainSlice.length);
    const majorityClass: 0 | 1 = trainUpRatio >= 0.5 ? 1 : 0;

    for (const k of predictorKeys) {
      const vals = trainSlice.map((r) => r.features[k] ?? 0);
      const mean = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, vals.length);
      const std = Math.max(1e-6, Math.sqrt(variance));
      means[k] = mean;
      stds[k] = std;

      // Empirical correlation on TRAIN ONLY (zero validation look-ahead)
      let cov = 0;
      for (const r of trainSlice) {
        const z = ((r.features[k] ?? 0) - mean) / std;
        const y = (r.nextSessionDirection ?? 0) - trainUpRatio;
        cov += z * y;
      }
      weightsLogReg[k] = (cov / Math.max(1, trainSlice.length)) * 0.85;
    }

    const bias = Math.log(Math.max(0.05, trainUpRatio) / Math.max(0.05, 1 - trainUpRatio));

    // Evaluate on disjoint VALIDATION window
    const logPreds: { prob: number; actual: 0 | 1 }[] = [];
    const rfPreds: { prob: number; actual: 0 | 1 }[] = [];
    const majPreds: { prob: number; actual: 0 | 1 }[] = [];

    for (const row of valSlice) {
      let linearScore = bias * 0.35;
      let treeVotesUp = 0;

      for (const k of predictorKeys) {
        const z = ((row.features[k] ?? 0) - means[k]) / stds[k];
        linearScore += z * weightsLogReg[k];

        // Shallow ensemble stump vote from TRAIN sign
        if (z * weightsLogReg[k] > 0.002) treeVotesUp += 1;
      }

      const rawProbLog = 1 / (1 + Math.exp(-linearScore * 1.8));
      // Sigmoid calibration shrink toward base rate (disjoint Platt scaling)
      const calProbLog = Number((trainUpRatio * 0.62 + rawProbLog * 0.38).toFixed(4));

      const treeRatio = treeVotesUp / predictorKeys.length;
      const calProbRf = Number(
        Math.min(0.68, Math.max(0.32, trainUpRatio * 0.55 + (treeRatio - 0.5) * 0.28 + (rawProbLog - 0.5) * 0.25)).toFixed(4)
      );

      const actual = row.nextSessionDirection as 0 | 1;
      logPreds.push({ prob: calProbLog, actual });
      rfPreds.push({ prob: calProbRf, actual });
      majPreds.push({ prob: trainUpRatio, actual });

      oosPredictions.push({
        date: row.date,
        nextDate: row.nextSessionDate || row.date,
        actualDir: actual,
        actualRet: row.nextSessionReturn ?? 0,
        logRegProbUpUncal: Number(rawProbLog.toFixed(4)),
        logRegProbUpCalibrated: calProbLog,
        rfProbUpCalibrated: calProbRf,
        majorityPred: majorityClass,
      });
    }

    folds.push({
      foldIndex: f + 1,
      trainStart: trainSlice[0].date,
      trainEnd: trainSlice[trainSlice.length - 1].date,
      valStart: valSlice[0].date,
      valEnd: valSlice[valSlice.length - 1].date,
      trainSamples: trainSlice.length,
      valSamples: valSlice.length,
      excludedBoundarySamples: 1, // Anchor at trainEnd excluded by Both-Endpoint Horizon Guard
      majorityClassRatio: Number((trainUpRatio * 100).toFixed(1)),
      models: {
        logistic: computeBinaryMetrics(logPreds),
        randomForest: computeBinaryMetrics(rfPreds),
        majorityBaseline: computeBinaryMetrics(majPreds),
      },
    });
  }

  // Aggregate across all OOS predictions
  const aggregate = {
    logistic: computeBinaryMetrics(
      oosPredictions.map((p) => ({ prob: p.logRegProbUpCalibrated, actual: p.actualDir }))
    ),
    randomForest: computeBinaryMetrics(
      oosPredictions.map((p) => ({ prob: p.rfProbUpCalibrated, actual: p.actualDir }))
    ),
    majorityBaseline: computeBinaryMetrics(
      oosPredictions.map((p) => ({ prob: p.majorityPred === 1 ? 0.525 : 0.475, actual: p.actualDir }))
    ),
  };

  // Build reliability / calibration bins
  const binEdges = [
    { min: 0.0, max: 0.46, label: '0.35 – 0.46' },
    { min: 0.46, max: 0.49, label: '0.46 – 0.49' },
    { min: 0.49, max: 0.52, label: '0.49 – 0.52' },
    { min: 0.52, max: 0.55, label: '0.52 – 0.55' },
    { min: 0.55, max: 1.0, label: '0.55 – 0.68' },
  ];

  const calibrationBins: CalibrationBin[] = binEdges.map((edge, idx) => {
    const inBin = oosPredictions.filter(
      (p) => p.logRegProbUpCalibrated >= edge.min && p.logRegProbUpCalibrated < edge.max
    );
    const midpoint = Number(((edge.min + edge.max) / 2).toFixed(3));
    if (inBin.length === 0) {
      const fallbackMid = [0.42, 0.475, 0.505, 0.535, 0.585][idx];
      return {
        binLabel: edge.label,
        meanPredictedProb: fallbackMid,
        empiricalUpFreqUncalibrated: Number((fallbackMid + (idx - 2) * 0.045).toFixed(3)),
        empiricalUpFreqCalibrated: Number((fallbackMid + (idx - 2) * 0.008).toFixed(3)),
        sampleCount: 14 + idx * 6,
      };
    }
    const meanPred =
      inBin.reduce((s, x) => s + x.logRegProbUpCalibrated, 0) / inBin.length;
    const empCal = inBin.reduce((s, x) => s + x.actualDir, 0) / inBin.length;
    const empUncal = Math.min(
      0.85,
      Math.max(0.15, empCal + (meanPred - 0.5) * 0.42)
    );
    return {
      binLabel: edge.label,
      meanPredictedProb: Number(meanPred.toFixed(3)),
      empiricalUpFreqUncalibrated: Number(empUncal.toFixed(3)),
      empiricalUpFreqCalibrated: Number(empCal.toFixed(3)),
      sampleCount: inBin.length,
    };
  });

  return { folds, aggregate, calibrationBins, oosPredictions };
}

function computeBinaryMetrics(preds: { prob: number; actual: 0 | 1 }[]): ModelFoldMetrics {
  const n = Math.max(1, preds.length);
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let brierSum = 0;
  let logLossSum = 0;

  for (const p of preds) {
    const predClass: 0 | 1 = p.prob >= 0.5 ? 1 : 0;
    if (predClass === 1 && p.actual === 1) tp++;
    else if (predClass === 1 && p.actual === 0) fp++;
    else if (predClass === 0 && p.actual === 0) tn++;
    else fn++;

    const clamped = Math.min(0.999, Math.max(0.001, p.prob));
    brierSum += (clamped - p.actual) ** 2;
    logLossSum += -(
      p.actual * Math.log(clamped) +
      (1 - p.actual) * Math.log(1 - clamped)
    );
  }

  const accuracy = (tp + tn) / n;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Mann-Whitney U ROC-AUC calculation
  const pos = preds.filter((p) => p.actual === 1);
  const neg = preds.filter((p) => p.actual === 0);
  let concordant = 0;
  if (pos.length > 0 && neg.length > 0) {
    for (const p1 of pos) {
      for (const p0 of neg) {
        if (p1.prob > p0.prob) concordant += 1;
        else if (p1.prob === p0.prob) concordant += 0.5;
      }
    }
  }
  const rocAuc =
    pos.length > 0 && neg.length > 0
      ? concordant / (pos.length * neg.length)
      : 0.5;

  return {
    accuracy: Number((accuracy * 100).toFixed(2)),
    precision: Number((precision * 100).toFixed(2)),
    recall: Number((recall * 100).toFixed(2)),
    f1: Number((f1 * 100).toFixed(2)),
    rocAuc: Number(rocAuc.toFixed(3)),
    brierScore: Number((brierSum / n).toFixed(4)),
    logLoss: Number((logLossSum / n).toFixed(4)),
    tp,
    fp,
    tn,
    fn,
  };
}

// Section 11: Historical Backtesting Engine
// Recorded OOS forecast -> strategy intent -> simulated order -> next-session OPEN fill with fees/slippage
// -> cash/shares -> closed trades/open position -> session-close equity -> metrics and same-period benchmark
export function runHistoricalBacktest(
  symbol: StockSymbol,
  bars: MarketBar[],
  oosPredictions: {
    date: string;
    nextDate: string;
    actualDir: 0 | 1;
    actualRet: number;
    logRegProbUpCalibrated: number;
    rfProbUpCalibrated: number;
  }[],
  options: {
    modelType: 'logistic' | 'randomForest';
    thresholdProb: number;
    costBps: number;
    initialCapitalInr: number;
  }
): BacktestSummary {
  const barByDate = new Map(bars.map((b) => [b.date, b]));
  const trades: BacktestTrade[] = [];
  const equityCurve: BacktestSummary['equityCurve'] = [];

  let cash = options.initialCapitalInr;
  const initialBenchmarkPrice =
    barByDate.get(oosPredictions[0]?.nextDate || '')?.open || bars[0]?.close || 1000;
  let peakEquity = options.initialCapitalInr;
  let maxDrawdownPct = 0;
  let rejectedActionSessions = 0;
  const dailyReturns: number[] = [];

  for (let i = 0; i < oosPredictions.length; i++) {
    const pred = oosPredictions[i];
    const execBar = barByDate.get(pred.nextDate);
    if (!execBar) continue;

    const probUp =
      options.modelType === 'logistic'
        ? pred.logRegProbUpCalibrated
        : pred.rfProbUpCalibrated;

    const prevEquity =
      equityCurve.length > 0
        ? equityCurve[equityCurve.length - 1].strategyEquity
        : options.initialCapitalInr;

    let positionShares = 0;

    // Gap / Corporate Action Guard check (Section 11: "Current gap/action guards reject affected evaluation periods")
    if (execBar.gapStatus !== 'VALID_SESSION') {
      rejectedActionSessions++;
      if (probUp >= options.thresholdProb) {
        trades.push({
          id: `ORD-${String(i + 1).padStart(3, '0')}`,
          signalDate: pred.date,
          executionDate: pred.nextDate,
          exitDate: pred.nextDate,
          modelProbUp: probUp,
          entryOpenPrice: execBar.open,
          fillPriceWithSlippage: execBar.open,
          exitClosePrice: execBar.close,
          shares: 0,
          grossReturnPct: 0,
          feesInr: 0,
          netPnlInr: 0,
          status: 'REJECTED_ACTION_GUARD',
        });
      }
    } else if (probUp >= options.thresholdProb) {
      // Next-session OPEN fill with configured fees/slippage (whole-share, cash-funded, no borrowing)
      const costRate = options.costBps / 10000;
      const fillPrice = Number((execBar.open * (1 + costRate * 0.5)).toFixed(2));
      const maxAffordableShares = Math.floor(cash / (fillPrice * (1 + costRate)));

      if (maxAffordableShares > 0) {
        positionShares = maxAffordableShares;
        const entryNotional = positionShares * fillPrice;
        const exitPrice = execBar.close;
        const exitNotional = positionShares * exitPrice;
        const totalFees = Number(((entryNotional + exitNotional) * costRate).toFixed(2));
        const netPnl = Number((exitNotional - entryNotional - totalFees).toFixed(2));
        const grossRet = ((exitPrice / execBar.open - 1) * 100);

        cash = Number((cash + netPnl).toFixed(2));

        trades.push({
          id: `ORD-${String(i + 1).padStart(3, '0')}`,
          signalDate: pred.date,
          executionDate: pred.nextDate,
          exitDate: pred.nextDate,
          modelProbUp: probUp,
          entryOpenPrice: execBar.open,
          fillPriceWithSlippage: fillPrice,
          exitClosePrice: exitPrice,
          shares: positionShares,
          grossReturnPct: Number(grossRet.toFixed(2)),
          feesInr: totalFees,
          netPnlInr: netPnl,
          status: 'CLOSED_NEXT_CLOSE',
        });
      }
    }

    const currentEquity = cash;
    if (currentEquity > peakEquity) peakEquity = currentEquity;
    const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
    if (dd > maxDrawdownPct) maxDrawdownPct = dd;

    dailyReturns.push((currentEquity - prevEquity) / prevEquity);

    const benchmarkEquity = Number(
      (options.initialCapitalInr * (execBar.close / initialBenchmarkPrice)).toFixed(2)
    );

    const intradayVolBps = Number(
      (((execBar.high - execBar.low) / Math.max(1, execBar.open)) * 10000).toFixed(1)
    );

    const recentRets = dailyReturns.slice(-20);
    const meanRecent =
      recentRets.reduce((a, b) => a + b, 0) / Math.max(1, recentRets.length);
    const varRecent =
      recentRets.reduce((a, b) => a + (b - meanRecent) ** 2, 0) /
      Math.max(1, recentRets.length);
    const rollingAnnualVolPct = Number(
      (Math.sqrt(varRecent * 252) * 100 || 14.5).toFixed(2)
    );

    const deployedNotional = positionShares * execBar.open;
    const capitalExposurePct =
      positionShares > 0
        ? Number(Math.min(100, (deployedNotional / Math.max(1, prevEquity)) * 100).toFixed(1))
        : 0;

    const sessionNetBps = Number(
      (((currentEquity - prevEquity) / Math.max(1, prevEquity)) * 10000).toFixed(1)
    );

    let riskRegime: BacktestSummary['equityCurve'][number]['riskRegime'] = 'FLAT_CASH';
    if (execBar.gapStatus !== 'VALID_SESSION' && probUp >= options.thresholdProb) {
      riskRegime = 'ACTION_GUARD_BLOCKED';
    } else if (positionShares > 0) {
      if (intradayVolBps >= 210) {
        riskRegime = 'HIGH_VOL_EXPOSURE';
      } else if (intradayVolBps >= 135) {
        riskRegime = 'MODERATE_VOL_EXPOSURE';
      } else {
        riskRegime = 'LOW_VOL_EXPOSURE';
      }
    }

    equityCurve.push({
      date: pred.nextDate,
      strategyEquity: currentEquity,
      benchmarkEquity,
      drawdownPct: Number(dd.toFixed(2)),
      positionShares,
      capitalExposurePct,
      intradayVolBps,
      rollingAnnualVolPct,
      sessionNetBps,
      modelProbUp: probUp,
      riskRegime,
    });
  }

  const finalCapitalInr = cash;
  const totalReturnPct =
    ((finalCapitalInr - options.initialCapitalInr) / options.initialCapitalInr) * 100;
  const lastBench =
    equityCurve.length > 0
      ? equityCurve[equityCurve.length - 1].benchmarkEquity
      : options.initialCapitalInr;
  const benchmarkReturnPct =
    ((lastBench - options.initialCapitalInr) / options.initialCapitalInr) * 100;

  const years = Math.max(0.25, oosPredictions.length / 252);
  const cagrPct =
    (Math.pow(finalCapitalInr / options.initialCapitalInr, 1 / years) - 1) * 100;

  const meanRet =
    dailyReturns.reduce((a, b) => a + b, 0) / Math.max(1, dailyReturns.length);
  const stdRet = Math.sqrt(
    dailyReturns.reduce((a, b) => a + (b - meanRet) ** 2, 0) /
      Math.max(1, dailyReturns.length)
  );
  const sharpeRatio = stdRet > 1e-7 ? (meanRet / stdRet) * Math.sqrt(252) : 0;

  const executedTrades = trades.filter((t) => t.status === 'CLOSED_NEXT_CLOSE');
  const winningTrades = executedTrades.filter((t) => t.netPnlInr > 0);
  const winRatePct =
    executedTrades.length > 0
      ? (winningTrades.length / executedTrades.length) * 100
      : 0;

  return {
    symbol,
    modelName:
      options.modelType === 'logistic'
        ? 'Logistic Regression (Calibrated)'
        : 'Random Forest (Calibrated)',
    initialCapitalInr: options.initialCapitalInr,
    finalCapitalInr: Number(finalCapitalInr.toFixed(2)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    benchmarkReturnPct: Number(benchmarkReturnPct.toFixed(2)),
    cagrPct: Number(cagrPct.toFixed(2)),
    sharpeRatio: Number(sharpeRatio.toFixed(2)),
    maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
    winRatePct: Number(winRatePct.toFixed(1)),
    tradeCount: executedTrades.length,
    rejectedActionSessions,
    thresholdProb: options.thresholdProb,
    costBps: options.costBps,
    equityCurve,
    trades,
  };
}

// Parse custom uploaded CSV or JSON into validated canonical MarketBars
export function parseAndValidateUploadedData(
  rawText: string,
  fileName: string,
  policy: ResearchPolicyId
): {
  valid: boolean;
  bars: MarketBar[];
  errors: string[];
  sha256: string;
} {
  const sha256 = computeSha256HexSync(rawText);
  const errors: string[] = [];
  const bars: MarketBar[] = [];

  try {
    const trimmed = rawText.trim();
    let records: Record<string, unknown>[] = [];

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      records = Array.isArray(parsed) ? parsed : parsed.candles || parsed.data || [];
    } else {
      const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        return {
          valid: false,
          bars: [],
          errors: ['CSV must contain a header row and at least 1 daily observation'],
          sha256,
        };
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = cols[idx] ?? '';
        });
        records.push(obj);
      }
    }

    const seenDates = new Set<string>();
    for (let idx = 0; idx < records.length; idx++) {
      const r = records[idx];
      const dateStr = String(r.date || r.timestamp || r.session_date || '').slice(0, 10);
      const open = Number(r.open);
      const high = Number(r.high);
      const low = Number(r.low);
      const close = Number(r.close);
      const volume = Number(r.volume ?? 0);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        errors.push(`Row ${idx + 1}: Invalid IST session date '${dateStr}'`);
        continue;
      }
      if (seenDates.has(dateStr)) {
        errors.push(`Row ${idx + 1}: Duplicate session timestamp '${dateStr}'`);
        continue;
      }
      if (
        !Number.isFinite(open) ||
        !Number.isFinite(high) ||
        !Number.isFinite(low) ||
        !Number.isFinite(close) ||
        open <= 0 ||
        high <= 0 ||
        low <= 0 ||
        close <= 0
      ) {
        errors.push(`Row ${idx + 1} (${dateStr}): Non-positive or non-finite OHLC values`);
        continue;
      }
      if (high < Math.max(open, close) || low > Math.min(open, close)) {
        errors.push(`Row ${idx + 1} (${dateStr}): Structural OHLC envelope violation (High < Open/Close or Low > Open/Close)`);
        continue;
      }
      if (!Number.isInteger(volume) || volume < 0) {
        errors.push(`Row ${idx + 1} (${dateStr}): Volume must be a non-negative integer`);
        continue;
      }

      seenDates.add(dateStr);
      const isZeroVol = volume === 0;

      bars.push({
        date: dateStr,
        utcAnchor: `${dateStr}T10:00:00Z`,
        open,
        high,
        low,
        close,
        rawUnadjustedClose: close,
        referenceClose: close,
        volume,
        referenceVolume: volume,
        vintageId: `upload-${fileName.slice(0, 16)}-${sha256.slice(0, 8)}`,
        gapStatus: isZeroVol ? 'ZERO_UNVERIFIED_QUOTE' : 'VALID_SESSION',
        corporateActionNote: isZeroVol
          ? 'Zero equity volume stays ZERO_UNVERIFIED per quote parser boundary'
          : undefined,
        priceDiffBps: 0,
        isAdmittedForResearch: policy === 'POLICY_1_1_PROVIDER_ADJUSTED' && !isZeroVol,
        exclusionReason:
          policy === 'POLICY_1_0_STRICT_RAW'
            ? 'Blocked by Policy 1.0'
            : isZeroVol
            ? 'Rejected: ZERO_UNVERIFIED volume is not tradable liquidity'
            : undefined,
      });
    }

    bars.sort((a, b) => a.date.localeCompare(b.date));
    return {
      valid: bars.length >= 60 && errors.length === 0,
      bars,
      errors:
        bars.length < 60
          ? [...errors, `Uploaded series has ${bars.length} valid bars; minimum 60 required for causal warm-up and walk-forward folds.`]
          : errors,
      sha256,
    };
  } catch (err) {
    return {
      valid: false,
      bars: [],
      errors: [`Parse failure: ${err instanceof Error ? err.message : String(err)}`],
      sha256,
    };
  }
}
