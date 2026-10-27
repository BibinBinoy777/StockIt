'use client';

import React, { useState, useMemo } from 'react';
import {
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  PILOT_STOCKS,
  StockSymbol,
  ResearchPolicyId,
  MarketBar,
  generatePilotMarketBars,
  computeCausalFeaturesAndSplits,
  runExpandingWalkForward,
  runHistoricalBacktest,
  parseAndValidateUploadedData,
  computeSha256HexSync,
} from '@/lib/stockit-engine';
import QualificationStage from '@/components/stockit/QualificationStage';
import FeaturesSplitsStage from '@/components/stockit/FeaturesSplitsStage';
import EvaluationStage from '@/components/stockit/EvaluationStage';
import BacktestBriefStage from '@/components/stockit/BacktestBriefStage';

type MainStage = 'QUALIFICATION' | 'FEATURES' | 'EVALUATION' | 'BACKTEST' | 'BRIEF';

export default function StockItWorkbenchPage() {
  const [activeStage, setActiveStage] = useState<MainStage>('QUALIFICATION');
  const [isWorkbenchMode, setIsWorkbenchMode] = useState<boolean>(false);
  const [activeSymbol, setActiveSymbol] = useState<StockSymbol>('INFY');
  const [policy, setPolicy] = useState<ResearchPolicyId>('POLICY_1_1_PROVIDER_ADJUSTED');

  const [numFolds, setNumFolds] = useState<number>(5);
  const [backtestModel, setBacktestModel] = useState<'logistic' | 'randomForest'>('logistic');
  const [thresholdProb, setThresholdProb] = useState<number>(0.51);
  const [costBps, setCostBps] = useState<number>(15);

  const [customBars, setCustomBars] = useState<MarketBar[] | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadRawText, setUploadRawText] = useState<string>('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const activeBars = useMemo(() => {
    if (activeSymbol === 'CUSTOM' && customBars && customBars.length > 0) {
      return customBars.map((b) => ({
        ...b,
        isAdmittedForResearch:
          policy === 'POLICY_1_1_PROVIDER_ADJUSTED' && b.gapStatus !== 'ZERO_UNVERIFIED_QUOTE',
      }));
    }
    return generatePilotMarketBars(activeSymbol, policy);
  }, [activeSymbol, policy, customBars]);

  const featureRows = useMemo(
    () => computeCausalFeaturesAndSplits(activeBars, policy),
    [activeBars, policy]
  );

  const evalData = useMemo(
    () => runExpandingWalkForward(featureRows, numFolds),
    [featureRows, numFolds]
  );

  const backtestData = useMemo(
    () =>
      runHistoricalBacktest(activeSymbol, activeBars, evalData.oosPredictions, {
        modelType: backtestModel,
        thresholdProb,
        costBps,
        initialCapitalInr: 1000000,
      }),
    [activeSymbol, activeBars, evalData.oosPredictions, backtestModel, thresholdProb, costBps]
  );

  const handleExportEvidenceReport = () => {
    const hash = computeSha256HexSync(
      `${activeSymbol}_${policy}_${evalData.aggregate.logistic.accuracy}`
    );
    const reportMd = `# StockIt — Phase 12 Market Qualification & Walk-Forward Evaluation Report
Generated: ${new Date().toISOString()}
Package Snapshot: v0.12.0 · Provenance Digest: ${hash}
Notice: Research Only — Not Trading Advice

## 1. Phase 12 Qualification Summary
- Security: ${activeSymbol} | Policy: ${policy}
- Admitted Sessions: ${activeBars.filter((b) => b.isAdmittedForResearch).length} / ${activeBars.length}

## 2. Walk-Forward Evaluation (${evalData.folds.length} Folds)
- Logistic Regression: Accuracy ${evalData.aggregate.logistic.accuracy}% | ROC-AUC ${evalData.aggregate.logistic.rocAuc} | Brier ${evalData.aggregate.logistic.brierScore}
- Random Forest: Accuracy ${evalData.aggregate.randomForest.accuracy}% | ROC-AUC ${evalData.aggregate.randomForest.rocAuc} | Brier ${evalData.aggregate.randomForest.brierScore}
- Majority Baseline: Accuracy ${evalData.aggregate.majorityBaseline.accuracy}%

## 3. Historical Simulation (${backtestData.modelName})
- Final Portfolio: ₹${backtestData.finalCapitalInr.toLocaleString('en-IN')} (${backtestData.totalReturnPct}%)
- Sharpe: ${backtestData.sharpeRatio} | Max Drawdown: -${backtestData.maxDrawdownPct}%
`;

    const blob = new Blob([reportMd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StockIt_Report_${activeSymbol}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportToast(`Exported StockIt_Report_${activeSymbol}.md`);
    setTimeout(() => setExportToast(null), 3000);
  };

  const handleLoadSampleCsvText = () => {
    const sampleRows = ['date,open,high,low,close,volume'];
    const sampleBars = generatePilotMarketBars('TCS', 'POLICY_1_1_PROVIDER_ADJUSTED').slice(-95);
    for (const b of sampleBars) {
      sampleRows.push(`${b.date},${b.open},${b.high},${b.low},${b.close},${b.volume}`);
    }
    setUploadRawText(sampleRows.join('\n'));
    setUploadErrors([]);
  };

  const handleValidateAndAdmitUpload = () => {
    const res = parseAndValidateUploadedData(
      uploadRawText,
      customFileName || 'custom_vintage.csv',
      policy
    );
    if (!res.valid) {
      setUploadErrors(res.errors);
      return;
    }
    setCustomBars(res.bars);
    setActiveSymbol('CUSTOM');
    setShowUploadModal(false);
    setUploadErrors([]);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadRawText(String(ev.target?.result || ''));
      setUploadErrors([]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100">
      {/* 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-[#0B1120]">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveStage('QUALIFICATION');
          }}
          className="text-lg font-bold tracking-tight text-slate-100 font-display whitespace-nowrap shrink-0"
        >
          StockIt
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {(
            [
              { id: 'QUALIFICATION', label: 'Qualification' },
              { id: 'FEATURES', label: 'Features & Splits' },
              { id: 'EVALUATION', label: 'Walk-Forward Eval' },
              { id: 'BACKTEST', label: 'Backtest Sim' },
            ] as const
          ).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => setActiveStage(nav.id)}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeStage === nav.id
                  ? 'text-slate-100 border-sky-400'
                  : 'border-transparent'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportEvidenceReport}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 rounded-lg hover:bg-sky-300 transition-colors whitespace-nowrap shrink-0"
          >
            Export Report
          </button>
        </div>
      </header>

      {/* MINIMAL WORKSPACE BAR */}
      <div className="border-b border-slate-800/80 bg-[#0F172A]/60 px-6 py-2.5">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsWorkbenchMode(false);
                  setPolicy('POLICY_1_1_PROVIDER_ADJUSTED');
                  setNumFolds(5);
                }}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  !isWorkbenchMode
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Saved Mode
              </button>
              <button
                type="button"
                onClick={() => setIsWorkbenchMode(true)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  isWorkbenchMode
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Workbench Mode
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <span className="text-xs text-slate-400">Stock:</span>
              <select
                value={activeSymbol}
                onChange={(e) => setActiveSymbol(e.target.value as StockSymbol)}
                className="bg-transparent text-xs font-mono font-semibold text-sky-400 focus:outline-none cursor-pointer"
              >
                {PILOT_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol} className="bg-slate-900 text-slate-100">
                    {s.symbol}
                  </option>
                ))}
                {customBars && (
                  <option value="CUSTOM" className="bg-slate-900 text-emerald-400">
                    CUSTOM
                  </option>
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsWorkbenchMode(true);
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            >
              <Upload className="w-3 h-3 text-sky-400" />
              <span>Upload CSV</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Research Only · Not Trading Advice · v0.12.0
          </div>
        </div>
      </div>

      {exportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-sky-500/50 text-slate-100 px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* ESSENTIAL MAIN VIEWPORT */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-6">
        {activeStage === 'QUALIFICATION' && (
          <QualificationStage
            activeSymbol={activeSymbol}
            onSelectSymbol={setActiveSymbol}
            policy={policy}
            onChangePolicy={setPolicy}
            bars={activeBars}
            isWorkbenchMode={isWorkbenchMode}
            onOpenUploadModal={() => setShowUploadModal(true)}
            onExportEvidenceReport={handleExportEvidenceReport}
          />
        )}

        {activeStage === 'FEATURES' && (
          <FeaturesSplitsStage activeSymbol={activeSymbol} featureRows={featureRows} />
        )}

        {activeStage === 'EVALUATION' && (
          <EvaluationStage
            activeSymbol={activeSymbol}
            numFolds={numFolds}
            onChangeNumFolds={setNumFolds}
            isWorkbenchMode={isWorkbenchMode}
            evalData={evalData}
          />
        )}

        {activeStage === 'BACKTEST' && (
          <BacktestBriefStage
            activeSubTab="BACKTEST"
            onChangeSubTab={() => {}}
            activeSymbol={activeSymbol}
            isWorkbenchMode={isWorkbenchMode}
            backtest={backtestData}
            modelType={backtestModel}
            onChangeModelType={setBacktestModel}
            thresholdProb={thresholdProb}
            onChangeThresholdProb={setThresholdProb}
            costBps={costBps}
            onChangeCostBps={setCostBps}
          />
        )}
      </main>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-lg max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-100 font-display">
                Upload Daily OHLCV Vintage (CSV / JSON)
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUploadChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSampleCsvText}
                className="px-3 py-1.5 text-xs font-medium text-sky-400 bg-slate-950 border border-slate-800 rounded-md"
              >
                Load Sample CSV
              </button>
            </div>

            <textarea
              rows={6}
              value={uploadRawText}
              onChange={(e) => setUploadRawText(e.target.value)}
              placeholder="date,open,high,low,close,volume"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            />

            {uploadErrors.length > 0 && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-md text-xs font-mono text-rose-300 space-y-1">
                {uploadErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleValidateAndAdmitUpload}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-md"
              >
                Validate &amp; Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
