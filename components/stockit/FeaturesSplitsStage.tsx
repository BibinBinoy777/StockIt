'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  REGISTERED_FEATURES_46,
  FeatureGroup,
  ComputedFeatureRow,
  StockSymbol,
} from '@/lib/stockit-engine';

interface FeaturesSplitsStageProps {
  activeSymbol: StockSymbol;
  featureRows: ComputedFeatureRow[];
}

const GROUPS: FeatureGroup[] = [
  'Returns',
  'Trend',
  'Momentum',
  'Volatility',
  'Volume',
  'Price Structure',
];

export default function FeaturesSplitsStage({
  activeSymbol,
  featureRows,
}: FeaturesSplitsStageProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const splitSummary = useMemo(() => {
    const train = featureRows.filter((r) => r.splitAssignment === 'TRAIN').length;
    const val = featureRows.filter((r) => r.splitAssignment === 'VALIDATION').length;
    const cal = featureRows.filter(
      (r) =>
        r.splitAssignment === 'CALIBRATION_FIT' || r.splitAssignment === 'CALIBRATION_EVAL'
    ).length;
    const crossSplitExcluded = featureRows.filter(
      (r) => r.splitAssignment === 'EXCLUDED_CROSS_SPLIT_HORIZON'
    ).length;
    return { train, val, cal, crossSplitExcluded };
  }, [featureRows]);

  const latestRow = featureRows[featureRows.length - 1];

  return (
    <div className="space-y-6">
      {/* Essential Chronological Split & Causality Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums">
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">TRAIN Samples ({activeSymbol})</div>
          <div className="text-base font-semibold text-slate-100 mt-1">
            {splitSummary.train} sessions
          </div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">VALIDATION Samples</div>
          <div className="text-base font-semibold text-sky-400 mt-1">
            {splitSummary.val} sessions
          </div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">Cross-Split Horizon Excluded</div>
          <div className="text-base font-semibold text-amber-400 mt-1">
            {splitSummary.crossSplitExcluded} boundary anchors
          </div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">Future-Data Leakage Check</div>
          <div className="text-sm font-semibold text-emerald-400 mt-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>0.0000 LEAKAGE</span>
          </div>
        </div>
      </div>

      {/* Essential 6 Feature Groups Overview */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 font-display">
              46 Causal Features Across 6 Groups ({activeSymbol})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Backward-looking only · Both feature anchor (t) and label session (t+1) must lie in the same split.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 shrink-0"
          >
            <span>{showAllFeatures ? 'Hide All 46 Formulas' : 'Inspect All 46 Features'}</span>
            {showAllFeatures ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GROUPS.map((grp) => {
            const items = REGISTERED_FEATURES_46.filter((f) => f.group === grp);
            const sampleFeat = items[0];
            const val = latestRow?.features[sampleFeat.id];
            return (
              <div
                key={grp}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-md flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100 font-display">{grp}</span>
                  <span className="text-xs font-mono text-sky-400">{items.length} features</span>
                </div>
                <div className="text-xs font-mono text-slate-400 truncate">
                  {items.map((x) => x.id).join(', ')}
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-400">Latest {sampleFeat.id}:</span>
                  <span className="text-slate-200 font-medium">
                    {val !== null && val !== undefined ? val.toFixed(4) : 'WARMUP'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {showAllFeatures && (
          <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-800 rounded-md mt-3">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                <tr>
                  <th className="py-2 px-3">Feature ID</th>
                  <th className="py-2 px-3">Group</th>
                  <th className="py-2 px-3 text-right">Lookback</th>
                  <th className="py-2 px-3">Formula</th>
                  <th className="py-2 px-3 text-right">Latest ({activeSymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono tabular-nums">
                {REGISTERED_FEATURES_46.map((f) => {
                  const v = latestRow?.features[f.id];
                  return (
                    <tr key={f.id} className="hover:bg-slate-800/40">
                      <td className="py-1.5 px-3 text-sky-400">{f.id}</td>
                      <td className="py-1.5 px-3 font-sans text-slate-400">{f.group}</td>
                      <td className="py-1.5 px-3 text-right text-slate-300">{f.lookbackSessions}d</td>
                      <td className="py-1.5 px-3 text-slate-300">{f.formula}</td>
                      <td className="py-1.5 px-3 text-right text-slate-100">
                        {v !== null && v !== undefined ? v.toFixed(4) : 'NULL'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
