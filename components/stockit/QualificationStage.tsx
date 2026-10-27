'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Upload,
} from 'lucide-react';
import {
  PILOT_STOCKS,
  MarketBar,
  ResearchPolicyId,
  StockSymbol,
} from '@/lib/stockit-engine';

interface QualificationStageProps {
  activeSymbol: StockSymbol;
  onSelectSymbol: (sym: StockSymbol) => void;
  policy: ResearchPolicyId;
  onChangePolicy: (pol: ResearchPolicyId) => void;
  bars: MarketBar[];
  isWorkbenchMode: boolean;
  onOpenUploadModal: () => void;
  onExportEvidenceReport: () => void;
}

export default function QualificationStage({
  activeSymbol,
  onSelectSymbol,
  policy,
  onChangePolicy,
  bars,
  isWorkbenchMode,
  onOpenUploadModal,
}: QualificationStageProps) {
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);

  const stats = useMemo(() => {
    const total = bars.length;
    const admitted = bars.filter((b) => b.isAdmittedForResearch).length;
    const dividendFlags = bars.filter((b) => b.gapStatus === 'DIVIDEND_UNADJUSTED_FLAG').length;
    return {
      total,
      admitted,
      excluded: total - admitted,
      dividendFlags,
      admissionRatePct: total > 0 ? ((admitted / total) * 100).toFixed(1) : '0.0',
    };
  }, [bars]);

  const isGateAdmitted = policy === 'POLICY_1_1_PROVIDER_ADJUSTED';

  return (
    <div className="space-y-6">
      {/* Essential KPI & Gate Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400">Phase 12 Gate Status</div>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-sm font-semibold">
            {isGateAdmitted ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>ADMITTED (PILOT)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-400">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>BLOCKED (POL 1.0)</span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 font-mono tabular-nums">
          <div className="text-xs font-sans text-slate-400">Admitted Sessions ({activeSymbol})</div>
          <div className="mt-1.5 text-base font-semibold text-slate-100">
            {stats.admitted} / {stats.total}{' '}
            <span className="text-xs text-slate-400 font-normal">({stats.admissionRatePct}%)</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 font-mono tabular-nums">
          <div className="text-xs font-sans text-slate-400">Upstox Basis &amp; Dividends</div>
          <div className="mt-1.5 text-sm font-semibold text-amber-400">
            {stats.dividendFlags} Ex-Dates Isolated
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 font-mono tabular-nums">
          <div className="text-xs font-sans text-slate-400">Final Holdout (Q1 2027)</div>
          <div className="mt-1.5 text-sm font-semibold text-rose-400">
            SEALED · UNCONSUMED
          </div>
        </div>
      </div>
    </div>
  );
}
