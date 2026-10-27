'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BacktestSummary, StockSymbol } from '@/lib/stockit-engine';

interface BacktestBriefStageProps {
  activeSubTab: 'BACKTEST' | 'BRIEF';
  onChangeSubTab: (tab: 'BACKTEST' | 'BRIEF') => void;
  activeSymbol: StockSymbol;
  isWorkbenchMode: boolean;
  backtest: BacktestSummary;
  modelType: 'logistic' | 'randomForest';
  onChangeModelType: (m: 'logistic' | 'randomForest') => void;
  thresholdProb: number;
  onChangeThresholdProb: (p: number) => void;
  costBps: number;
  onChangeCostBps: (c: number) => void;
}

type HeatmapLens = 'RISK_EXPOSURE' | 'INTRADAY_VOL' | 'NET_PNL_IMPACT';

export default function BacktestBriefStage({
  activeSymbol,
  isWorkbenchMode,
  backtest,
  modelType,
  onChangeModelType,
  thresholdProb,
  onChangeThresholdProb,
  costBps,
  onChangeCostBps,
}: BacktestBriefStageProps) {
  const [heatmapLens, setHeatmapLens] = useState<HeatmapLens>('RISK_EXPOSURE');
  const [selectedSessionDate, setSelectedSessionDate] = useState<string | null>(null);
  const [showTradeLedger, setShowTradeLedger] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activeSession = useMemo(() => {
    if (selectedSessionDate) {
      const found = backtest.equityCurve.find((s) => s.date === selectedSessionDate);
      if (found) return found;
    }
    const exposed = backtest.equityCurve.filter((s) => s.positionShares > 0);
    return (
      exposed[exposed.length - 1] ||
      backtest.equityCurve[backtest.equityCurve.length - 1] ||
      null
    );
  }, [backtest.equityCurve, selectedSessionDate]);

  // Render D3 color-coded SVG heatmap grid
  useEffect(() => {
    if (!svgRef.current) return;

    const sessions = backtest.equityCurve;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (sessions.length === 0) return;

    const numRows = 5; // 5 trading sessions per weekly column
    const numCols = Math.ceil(sessions.length / numRows);

    const margin = { top: 24, right: 16, bottom: 28, left: 48 };
    const cellWidth = Math.max(42, Math.floor((880 - margin.left - margin.right) / Math.max(1, numCols)));
    const cellHeight = 34;
    const width = margin.left + numCols * cellWidth + margin.right;
    const height = margin.top + numRows * cellHeight + margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Color Scales for the 3 Lenses
    const volExtent = d3.extent(sessions, (d) => d.intradayVolBps) as [number, number];
    const minVol = volExtent[0] ?? 60;
    const maxVol = Math.max(minVol + 50, volExtent[1] ?? 260);

    // Continuous D3 risk color scale: Emerald (Low Vol) -> Amber (Mod Vol) -> Rose (High Vol)
    const riskColorScale = d3
      .scaleLinear<string>()
      .domain([minVol, (minVol + maxVol) * 0.5, maxVol])
      .range(['#10B981', '#F59E0B', '#F43F5E'])
      .clamp(true);

    // Intraday volatility sequential D3 scale
    const volColorScale = d3
      .scaleLinear<string>()
      .domain([minVol, (minVol + maxVol) * 0.5, maxVol])
      .range(['#0284C7', '#F59E0B', '#E11D48'])
      .clamp(true);

    // Net P&L D3 diverging scale
    const pnlColorScale = d3
      .scaleLinear<string>()
      .domain([-120, 0, 120])
      .range(['#F43F5E', '#334155', '#10B981'])
      .clamp(true);

    const getCellFill = (d: BacktestSummary['equityCurve'][number]) => {
      if (heatmapLens === 'RISK_EXPOSURE') {
        if (d.riskRegime === 'ACTION_GUARD_BLOCKED') return '#0EA5E9';
        if (d.positionShares === 0) return '#1E293B';
        return riskColorScale(d.intradayVolBps);
      }
      if (heatmapLens === 'INTRADAY_VOL') {
        return volColorScale(d.intradayVolBps);
      }
      if (d.positionShares === 0) return '#1E293B';
      return pnlColorScale(d.sessionNetBps);
    };

    // Row labels (S1..S5)
    const rowLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
    g.selectAll('.row-label')
      .data(rowLabels)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', (_, i) => i * cellHeight + cellHeight / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono), monospace')
      .text((d) => d);

    // Column labels (W01, W02...)
    const colIndices = d3.range(numCols);
    g.selectAll('.col-label')
      .data(colIndices)
      .enter()
      .append('text')
      .attr('x', (c) => c * cellWidth + cellWidth / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono), monospace')
      .text((c) => `W${String(c + 1).padStart(2, '0')}`);

    // Data cells
    const cellGroups = g
      .selectAll('.session-cell')
      .data(sessions)
      .enter()
      .append('g')
      .attr('class', 'session-cell')
      .attr('transform', (_, i) => {
        const col = Math.floor(i / numRows);
        const row = i % numRows;
        return `translate(${col * cellWidth},${row * cellHeight})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelectedSessionDate(d.date);
      });

    cellGroups
      .append('rect')
      .attr('x', 2)
      .attr('y', 2)
      .attr('width', cellWidth - 4)
      .attr('height', cellHeight - 4)
      .attr('rx', 4)
      .attr('fill', (d) => getCellFill(d))
      .attr('fill-opacity', (d) => (d.positionShares > 0 || heatmapLens === 'INTRADAY_VOL' ? 0.85 : 0.55))
      .attr('stroke', (d) =>
        activeSession?.date === d.date ? '#38BDF8' : '#0F172A'
      )
      .attr('stroke-width', (d) => (activeSession?.date === d.date ? 2 : 1));

    // Cell value label
    cellGroups
      .append('text')
      .attr('x', cellWidth / 2)
      .attr('y', cellHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) =>
        d.positionShares === 0 && heatmapLens !== 'INTRADAY_VOL' ? '#64748B' : '#0B1120'
      )
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'var(--font-mono), monospace')
      .text((d) => {
        if (heatmapLens === 'NET_PNL_IMPACT') {
          if (d.positionShares === 0) return '0';
          return `${d.sessionNetBps >= 0 ? '+' : ''}${d.sessionNetBps.toFixed(0)}`;
        }
        if (heatmapLens === 'RISK_EXPOSURE' && d.positionShares === 0) {
          return d.riskRegime === 'ACTION_GUARD_BLOCKED' ? 'BLK' : '0%';
        }
        return `${d.intradayVolBps.toFixed(0)}`;
      });
  }, [backtest.equityCurve, heatmapLens, activeSession?.date]);

  return (
    <div className="space-y-6">
      {/* Essential 4-Metric Backtest Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums">
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">Final Portfolio (₹10L Init)</div>
          <div className="text-base font-semibold text-slate-100 mt-1">
            ₹{backtest.finalCapitalInr.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">Net Return vs Buy &amp; Hold</div>
          <div
            className={`text-base font-semibold mt-1 ${
              backtest.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {backtest.totalReturnPct >= 0 ? '+' : ''}
            {backtest.totalReturnPct.toFixed(2)}%{' '}
            <span className="text-xs text-slate-400 font-normal">
              vs {backtest.benchmarkReturnPct.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">Sharpe / Max Drawdown</div>
          <div className="text-base font-semibold text-sky-400 mt-1">
            {backtest.sharpeRatio.toFixed(2)}{' '}
            <span className="text-xs text-amber-400 font-normal">
              (-{backtest.maxDrawdownPct.toFixed(1)}% DD)
            </span>
          </div>
        </div>
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-sans text-slate-400">Whole-Share Trades &amp; Guards</div>
          <div className="text-base font-semibold text-slate-100 mt-1">
            {backtest.tradeCount} trades{' '}
            <span className="text-xs text-amber-400 font-normal">
              ({backtest.rejectedActionSessions} blocked)
            </span>
          </div>
        </div>
      </div>

      {/* D3 Color-Coded Volatility & Trade Risk-Exposure Heatmap Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 font-display">
              D3 Session Volatility &amp; Risk-Exposure Grid ({activeSymbol})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Columns represent chronological trading weeks (W01–W{Math.ceil(backtest.equityCurve.length / 5)}); rows represent sessions (Day 1–Day 5). Click any cell to inspect.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isWorkbenchMode && (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono">
                <select
                  value={modelType}
                  onChange={(e) => onChangeModelType(e.target.value as 'logistic' | 'randomForest')}
                  className="bg-transparent text-slate-200 focus:outline-none"
                >
                  <option value="logistic" className="bg-slate-900">LogReg</option>
                  <option value="randomForest" className="bg-slate-900">RandomForest</option>
                </select>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">θ={thresholdProb.toFixed(2)}</span>
                <input
                  type="range"
                  min={0.48}
                  max={0.56}
                  step={0.01}
                  value={thresholdProb}
                  onChange={(e) => onChangeThresholdProb(Number(e.target.value))}
                  className="w-16 accent-sky-400"
                />
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{costBps}bps</span>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={5}
                  value={costBps}
                  onChange={(e) => onChangeCostBps(Number(e.target.value))}
                  className="w-16 accent-sky-400"
                />
              </div>
            )}

            <div className="inline-flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
              {(
                [
                  { id: 'RISK_EXPOSURE', label: 'Risk Exposure' },
                  { id: 'INTRADAY_VOL', label: 'Intraday Vol (bps)' },
                  { id: 'NET_PNL_IMPACT', label: 'Net P&L (bps)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHeatmapLens(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    heatmapLens === tab.id
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* D3 SVG Grid Container */}
        <div className="bg-slate-950 border border-slate-800 rounded-md p-3 overflow-x-auto">
          <svg ref={svgRef} className="w-full min-w-[640px] h-auto select-none" />

          {/* D3 Color Legend */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#1E293B] border border-slate-700 inline-block" />
                <span>0% Cash / Unexposed</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#10B981] inline-block" />
                <span>Low Vol Exposure (&lt;135 bps)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#F59E0B] inline-block" />
                <span>Moderate Vol (135–210 bps)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#F43F5E] inline-block" />
                <span>High Tail Risk (≥210 bps)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#0EA5E9] inline-block" />
                <span>Action-Guard Blocked</span>
              </span>
            </div>
            <span>Values inside cells = {heatmapLens === 'NET_PNL_IMPACT' ? 'Net P&L (bps)' : 'Intraday Vol (bps)'}</span>
          </div>
        </div>

        {/* Selected Session Telemetry Bar + Collapsible Order Ledger Toggle */}
        {activeSession && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono tabular-nums">
            <div className="flex flex-wrap items-center gap-2 text-slate-300">
              <span className="text-sky-400 font-semibold">{activeSession.date}</span>
              <span>·</span>
              <span>Regime: {activeSession.riskRegime}</span>
              <span>·</span>
              <span>Exp: {activeSession.capitalExposurePct}% ({activeSession.positionShares} sh)</span>
              <span>·</span>
              <span>P(UP): {activeSession.modelProbUp.toFixed(3)}</span>
              <span>·</span>
              <span>Vol: {activeSession.intradayVolBps} bps</span>
              <span>·</span>
              <span>
                Net: {activeSession.sessionNetBps >= 0 ? '+' : ''}
                {activeSession.sessionNetBps} bps
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowTradeLedger(!showTradeLedger)}
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-sans font-medium whitespace-nowrap shrink-0"
            >
              <span>{showTradeLedger ? 'Hide Order Ledger' : 'Show Order Ledger'}</span>
              {showTradeLedger ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Optional Collapsible Order Ledger */}
        {showTradeLedger && (
          <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-800 rounded-md">
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                <tr>
                  <th className="py-2 px-3">Order</th>
                  <th className="py-2 px-3">Exec Date</th>
                  <th className="py-2 px-3 text-right">P(UP)</th>
                  <th className="py-2 px-3 text-right">Fill OPEN</th>
                  <th className="py-2 px-3 text-right">Shares</th>
                  <th className="py-2 px-3 text-right">Net P&amp;L (₹)</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {backtest.trades
                  .slice()
                  .reverse()
                  .map((tr) => (
                    <tr
                      key={tr.id}
                      onClick={() => setSelectedSessionDate(tr.executionDate)}
                      className="hover:bg-slate-800/40 cursor-pointer"
                    >
                      <td className="py-1.5 px-3 text-slate-300">{tr.id}</td>
                      <td className="py-1.5 px-3 text-slate-200">{tr.executionDate}</td>
                      <td className="py-1.5 px-3 text-right text-sky-400">
                        {tr.modelProbUp.toFixed(3)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-300">
                        ₹{tr.fillPriceWithSlippage.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-300">{tr.shares}</td>
                      <td
                        className={`py-1.5 px-3 text-right ${
                          tr.netPnlInr >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tr.netPnlInr >= 0 ? '+' : ''}
                        {tr.netPnlInr.toFixed(0)}
                      </td>
                      <td className="py-1.5 px-3 text-emerald-400">{tr.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
