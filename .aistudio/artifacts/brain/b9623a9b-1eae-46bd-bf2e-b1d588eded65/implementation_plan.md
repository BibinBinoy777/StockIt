# StockIt — Market Qualification & Walk-Forward Research Workbench (MVP)

StockIt is an Indian equity research, causal feature engineering, and walk-forward machine learning evaluation workbench designed to close the **Phase 12 Market Qualification Gate** and execute a leak-free empirical study on an 8-stock NSE large-cap pilot universe. It bridges the gap between strong software architecture and auditable real-market evidence—delivering an interactive pipeline alongside a recruiter-ready **Saved Mode** showcase.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices have been locked based on your inputs and the StockIt v0.12.0 specification. Review and click **Proceed** to build the workbench.

- **Confirmed Decision 1 — Data Ingestion & Universe Scope**: Pre-loaded **NSE 8-Stock Liquid Large-Cap Pilot** (`INFY`, `TCS`, `RELIANCE`, `HDFCBANK`, `ICICIBANK`, `SBIN`, `ITC`, `LT`) across a fixed historical research window (`2024-01-01` to `2026-10-26`), with full client-side **CSV & JSON vintage upload** so custom Upstox/reference datasets can be audited on the fly.
- **Confirmed Decision 2 — Milestone Scope (Milestones 1 to 3)**:
  - **Milestone 1 (Phase 12 Qualification Gate)**: Freeze pilot scope, enforce **Policy 1.1 (Provider-Adjusted Research Basis)** (back-adjusted for splits/bonuses, unadjusted for dividends, never double-adjusted), compare multi-date immutable vintages, reconcile against an independent reference source, classify session gaps, and generate a formal **Phase 12 Evidence & Gate Report**.
  - **Milestone 2 (Walk-Forward Evaluation & Calibration)**: Run expanding chronological walk-forward folds with causal **46-feature** engineering, comparing **Logistic Regression** and **Random Forest** against the **TRAIN Majority Baseline**, followed by disjoint **Sigmoid Calibration** (`TRAIN -> CALIBRATION_FIT -> CALIBRATION_EVALUATION`) while keeping the `4 Jan – 31 Mar 2027` holdout sealed and unconsumed.
  - **Milestone 3 (Showable Recruiter Experience)**: Include a prominent **"Research Only — Not Trading Advice"** posture, an instant **Saved Mode vs. Interactive Workbench Mode** switch, an embedded **Architecture & Findings Brief** (system diagram, honest ~51–53% out-of-sample directional accuracy narrative, and structural limits), and a built-in **3-Minute Recruiter Tour / Demo Walkthrough**.
- **Confirmed Decision 4 — Visual Direction**: **Institutional Quant Dark** aesthetic (`#0B1120` deep slate canvas, `#0F172A` surface panels, `Plus Jakarta Sans` UI typography, and `IBM Plex Mono` with strict `tabular-nums` for SHA-256 provenance hashes, OHLCV bars, and calibration tables).

---

## 1. Overview & Core Concept

- **What It Does**: Provides a deterministic, end-to-end quantitative data analysis pipeline and research showcase that takes daily NSE equity bars through structural validation, corporate-action & dividend policy enforcement, vintage revision auditing, 46-feature causal computation, expanding walk-forward classification, and historical single-security backtesting.
- **Target Audience / Persona**:
  1. **Quantitative Researchers & ML Engineers** auditing data hygiene, look-ahead prevention, and out-of-sample calibration discipline.
  2. **Technical Recruiters & Hiring Managers** evaluating engineering rigor, temporal leakage prevention, and honest statistical reporting within 3 minutes.
- **Key Value**: Demonstrates why preventing silent data corruption (double split adjustments, dividend omissions, future-leaking normalization, and survivor bias) matters more than overfitted backtest returns.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Recruiter "Saved Mode" Flow (Zero-Setup Showcase)**:
   - Opens directly to an executive summary banner and the **5-Stage Pipeline Navigator** (`01. Pilot & Policy` · `02. Vintage & Qualification` · `03. Causal Features (46)` · `04. Walk-Forward & Calibration` · `05. Backtest & Architecture Brief`).
   - Users can step through pre-computed, content-addressed (`SHA-256`) research artifacts, inspect why specific corporate-action windows were flagged or admitted, view the honest walk-forward accuracy table (~51.4% vs. 50.8% majority baseline), and read the "What I Found & Limits" report.
2. **Researcher "Interactive Workbench" Flow**:
   - Toggle from **Saved Mode** to **Interactive Workbench** in the workspace toolbar.
   - Upload custom CSV/JSON OHLCV vintages or modify pilot parameters (e.g., toggle Policy 1.0 Strict Unadjusted vs. Policy 1.1 Versioned Provider-Adjusted, adjust discrepancy tolerance bps, or change walk-forward fold count).
   - Execute live client-side pipeline runs that recompute gap classifications, causal features with warm-up/reset tracking, walk-forward fold metrics, reliability curves, and long-only cash-funded simulation equity curves.

### Visual Identity & Theme (`frontend-design` & `3_saas_dashboard` Compliance)
- **Aesthetic Direction**: Institutional Quantitative Research Terminal—austere, high-contrast, zero decorative fluff, prioritizing provenance hashes, causal boundary timelines, and tabular statistical clarity.
- **Color Palette & 60-30-10 Allocation**:
  - **60% Dominant Neutral Canvas**: Deep Slate `#0B1120` (`bg-slate-950`) primary viewport background.
  - **30% Structural Surfaces**: Subdued Slate `#0F172A` (`bg-slate-900`) flat single-elevation containers with `1px solid #1E293B` (`border-slate-800`) hairline borders and `#94A3B8` (`text-slate-400`) secondary prose.
  - **10% Accent & Semantic Budget**:
    - Primary Interactive Accent: Institutional Indigo/Cyan `#38BDF8` (`sky-400` / `sky-500`) for active tabs, primary execution buttons, and calibration curves.
    - Semantic Data States (always paired with explicit text labels/icons, never hue alone):
      - `ADMITTED / PASSED`: Emerald `#10B981`
      - `FLAGGED / DIVIDEND UNADJUSTED / WARM-UP`: Amber `#F59E0B`
      - `REJECTED / DOUBLE-ADJUST RISK / SEALED HOLDOUT`: Rose `#F43F5E`
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display & Navigation*: `Plus Jakarta Sans` (SemiBold 600 / Bold 700, `text-wrap: balance` on headers).
  - *Body & Documentation Prose*: `Public Sans` (Regular 400 / Medium 500, comfortable 65–75ch measure for evidence reports).
  - *Data Tables, Hashes & Telemetry*: `IBM Plex Mono` (`font-mono tabular-nums`) for all prices, returns, fold metrics, dates, and SHA-256 digests.
- **Layout & Anti-Slop Discipline**:
  - **Top Bar Contract**: Single-row header with three zones separated by `gap-8`:
    1. Brand wordmark (`StockIt`) on the left.
    2. Five single-line stage navigation links (`Qualification`, `Features & Splits`, `Walk-Forward Eval`, `Backtest Sim`, `Architecture & Brief`).
    3. One primary action button (`Export Evidence Report`).
  - **Workspace Toolbar (Below Header)**: Houses the **Saved Mode / Interactive Workbench** segmented switch, NSE symbol selector (`INFY`, `TCS`, `RELIANCE`, etc.), `"Research Only · Not Trading Advice"` text notice, and the `"3-Min Recruiter Guide"` drawer trigger.
  - **Zero-Pill Metadata & Single-Elevation Depth**: Static metadata (timestamps, SHA-256 prefixes, session anchors, split names) rendered as clean inline text with `·` separators. No nested card sandwiches, no thick left borders (`border-l-4`), no pulsing green dots, and no fake bottom telemetry bars.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Versioned Provider-Adjusted Policy (Policy 1.1) vs. Naive Price Ingestion**
  - *Chosen Approach*: Explicitly model Upstox V3 daily data as `PROVIDER_ADJUSTED_SPLITS_BONUSES_ONLY` (Policy 1.1) alongside `UNADJUSTED_RAW` (Policy 1.0). The pipeline blocks double-adjustment of splits/bonuses, flags ex-dividend sessions where total-return diverges from price-return, and requires raw execution price verification before backtest fills.
  - *Why*: Directly resolves the core blocker in Section 5 & Section 16 of your architecture document.
- **Decision 2: Honest Statistical Reporting & Sealed Holdout Enforcement**
  - *Chosen Approach*: Report real directional classification metrics (where daily equity direction accuracy naturally hovers near `50.5% – 53.2%`, Brier score ~`0.249`, and log-loss close to baseline) alongside fold-by-fold variance, while visually locking the `4 Jan – 31 Mar 2027` holdout with an immutable protocol guard.
  - *Why*: Demonstrates quantitative maturity—showing that the pipeline resists look-ahead leakage and hyperparameter p-hacking.
- **Decision 3: Dual-Mode Execution (Saved Demo Artifact + Live Browser Compute Engine)**
  - *Chosen Approach*: Bundle a cryptographically hashed default dataset for instant zero-config browsing (**Saved Mode**), paired with a real TypeScript quantitative engine that recalculates all 46 causal features, chronological splits, logistic/forest walk-forward folds, and backtest ledgers when the user uploads data or changes parameters (**Interactive Workbench**).
  - *Why*: Guarantees instant reliability for a recruiter opening the URL while providing deep technical utility when demonstrating live pipeline runs.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                              TOP BAR (3-Zone Contract)                                   │
│  [StockIt]     [Qualification · Features · Walk-Forward · Backtest · Research Brief]     │
│                                                                 [Export Evidence Report] │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
┌────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                        WORKSPACE CONTROL BAR & MODE SWITCHER                             │
│  Mode: [Saved Showcase | Interactive Workbench] · Symbol: [INFY ▾] · [Upload CSV/JSON]   │
│  Notice: Research Only, Not Trading Advice · Gate: PHASE 12 QUALIFIED (PILOT SCOPE)      │
└───────┬────────────────────┬────────────────────┬────────────────────┬───────────────────┘
        │                    │                    │                    │
        ▼                    ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────────────────┐
│ 1. PHASE 12   │    │ 2. CAUSAL     │    │ 3. EXPANDING  │    │ 4. SIMULATION &           │
│ QUALIFICATION │───▶│ FEATURES &    │───▶│ WALK-FORWARD  │───▶│ ARCHITECTURE BRIEF        │
│ ENGINE        │    │ SPLIT BUILDER │    │ & CALIBRATION │    │                           │
├───────────────┤    ├───────────────┤    ├───────────────┤    ├───────────────────────────┤
│ • Pilot Scope │    │ • 46 Features │    │ • 5 Expanding │    │ • Next-Session OPEN Fill  │
│   8 NSE Caps  │    │   across 6    │    │   Folds       │    │   with Fees/Slippage      │
│ • Policy 1.1  │    │   Groups      │    │ • TRAIN-only  │    │ • Long-Only Whole-Share   │
│   No Double-  │    │ • Segment     │    │   Scaling     │    │   Cash Ledger             │
│   Adjustment  │    │   Resets &    │    │ • LogReg & RF │    │ • Architecture Diagram,   │
│ • Vintage Diff│    │   Warm-up     │    │   vs Majority │    │   "What I Found" Essay,   │
│   & Reference │    │ • Both-Endpt  │    │ • Disjoint    │    │   & 2-Min Demo Script     │
│   Reconcile   │    │   Split Guard │    │   Sigmoid Cal │    │ • PDF Viewer Reference    │
│ • Gate Report │    │ • Audit Table │    │ • 2027 Holdout│    │   (v0.12.0 Snapshot)      │
│   Generator   │    │   Inspector   │    │   Lock Guard  │    │                           │
└───────────────┘    └───────────────┘    └───────────────┘    └───────────────────────────┘
```

### Data Model & Core Entities
- **`PilotUniverseConfig`**: Locked 8 NSE symbols (`INFY`, `TCS`, `RELIANCE`, `HDFCBANK`, `ICICIBANK`, `SBIN`, `ITC`, `LT`), ISINs, session calendar (`Asia/Kolkata` 09:15–15:30 IST, special holiday/Muhurat overrides), date window (`2024-01-01` to `2026-10-26`), and SHA-256 manifest digest.
- **`VintageSnapshot & ReconciliationRecord`**: Captures multiple retrieval vintages (`v1: 2026-10-13 Probe`, `v2: 2026-10-26 Pilot Capture`, plus Independent Exchange Reference), tracking price/volume discrepancies (bps), corporate actions (splits, bonuses, unadjusted cash dividends), and gap classifications (`WEEKEND_HOLIDAY`, `PROVIDER_MISSING`, `ACTION_DISCONTINUITY`, `VALID_SESSION`).
- **`CausalFeatureFrame`**: Computes and stores all **46 registered features** across the 6 architecture groups (*Returns [6], Trend [12], Momentum [9], Volatility [11], Volume [4], Price Structure [4]*), preserving explicit warm-up reasons (`INSUFFICIENT_LOOKBACK_200D`, `SEGMENT_RESET_POST_ACTION`) and verifying zero future-data leakage via prefix-mutation check.
- **`WalkForwardEvaluationBundle`**: Holds expanding fold definitions (`Fold 1` through `Fold 5`), `TRAIN`-only z-score scaler parameters, model predictions (`Logistic Regression`, `Random Forest`, `Majority Baseline`), confusion matrices, ROC-AUC, Brier score, log-loss, disjoint `CALIBRATION_FIT` / `CALIBRATION_EVALUATION` reliability bins, and the locked `2027-01-04 to 2027-03-31` holdout reservation metadata.
- **`BacktestLedger`**: Records out-of-sample signals, next-session `OPEN` execution fills with configurable slippage/brokerage bps, whole-share cash accounting, drawdown series, benchmark comparison, and gap-guard rejections.

### Interactive Component & State Mapping
- **Pilot & Qualification View (`QualificationStage`)**:
  - *Policy Switcher*: Toggle between `Policy 1.0 (Strict Unadjusted Required — Rejects Upstox Default)` and `Policy 1.1 (Versioned Provider-Adjusted Basis — Admits Split/Bonus Adjusted with Dividend Audit)` to see live gate status transition from `PENDING / BLOCKED` to `ADMITTED WITH DOCUMENTED LIMITS`.
  - *Vintage Diff & Reference Inspector*: Filter by stock symbol or anomaly type; inspect candle-by-candle OHLCV revisions and reference agreement within tolerance.
  - *CSV/JSON Upload Modal*: Parse user-supplied daily bars, run structural and calendar validation checks, compute SHA-256 provenance, and admit or reject into the active workspace.
- **Causal Feature & Supervised Split View (`FeaturesSplitsStage`)**:
  - *Feature Group Explorer*: Filter the 46 features by group (*Returns, Trend, Momentum, Volatility, Volume, Price Structure*), inspect formula definitions, warm-up row counts, and time-series overlays.
  - *Both-Endpoint Split Boundary Inspector*: Interactive timeline showing why a `TRAIN` anchor on the final day of a fold whose `t+1` label lands in `VALIDATION` is automatically excluded from `TRAIN` to guarantee zero horizon leakage.
- **Walk-Forward & Calibration View (`EvaluationStage`)**:
  - *Interactive Fold Runner*: Adjust minimum train window or fold count in Workbench mode and re-run expanding walk-forward evaluation across any pilot stock or the pooled 8-stock universe.
  - *Model Comparison & Calibration Charts*: Toggle between fold-level metrics and aggregate OOS metrics; inspect reliability diagrams (predicted `P(UP)` vs. empirical frequency before and after disjoint sigmoid calibration) and model registry lifecycle state (`CANDIDATE`, `VALIDATED`, `CHAMPION`).
- **Historical Backtest & Showcase Brief View (`BacktestBriefStage`)**:
  - *Execution Simulator*: Configure probability threshold (`0.50`–`0.60`), transaction cost (`10–30 bps`), and capital allocation; inspect order log, whole-share fills, and equity curve vs. buy-and-hold.
  - *Recruiter README, Architecture PDF & 2-Minute Demo Script*: View the structured **"What I Found & Why Honest ~51% Accuracy Matters"** engineering write-up, interactive architecture diagram, 2-minute demo teleprompter script, and direct reference to the attached `StockIt_Complete_Architecture` v0.12.0 specification.
