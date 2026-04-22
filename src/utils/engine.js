/**
 * Orizon21 — Financial Model Engine
 * Bitcoin × Real Estate Feasibility Tool
 * Author: HOUESSOU Geneviève Espérance
 *
 * Sources:
 * - RY3T Calculator (AC Building Sagl, 14.03.2025)
 * - SIA 380/1 Swiss thermal standard
 * - Braiins Insights / Mempool.space (hashprice)
 */

// ─── IRR via Newton-Raphson ───────────────────────────────────────────────────
export function calcIRR(flows, guess = 0.1) {
  let r = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0, d = 0;
    flows.forEach((f, t) => {
      npv += f / Math.pow(1 + r, t);
      d   -= t * f / Math.pow(1 + r, t + 1);
    });
    const nr = r - npv / d;
    if (Math.abs(nr - r) < 1e-7) return nr;
    r = nr;
  }
  return r;
}

// ─── Core model ──────────────────────────────────────────────────────────────
export function runModel(p, btcApprecOverride) {
  const ba = btcApprecOverride !== undefined ? btcApprecOverride : p.btcApprec / 100;

  // Mining setup
  const totKw      = (p.minerCount * p.minerWatts) / 1000;
  const totHash    = (totKw * 1000) / p.minerJTH;            // TH/s
  const annMiningKwh = totKw * 8760;                          // kWh/year

  // Thermal
  // 95% efficiency — Source: RY3T Input Data
  const annHeatMwh  = (annMiningKwh * 0.95) / 1000;
  const bldgHeatKwh = p.gfa * p.heatDemand + p.dhwDemand;
  const heatCover   = Math.min(1, (annMiningKwh * 0.95) / bldgHeatKwh);

  // PV — ~900 kWh/kWp/year Switzerland
  const pvKwh = p.pvKwp * 900;

  // Year-by-year P&L
  const flows = [];
  let cum = -p.capex;
  let breakEven = null;

  for (let yr = 1; yr <= p.horizon; yr++) {
    const hashYr  = totHash  * Math.pow(1 - p.hwDegr  / 100, yr - 1);
    const diffF   = Math.pow(1 + p.diffGrowth / 100, yr - 1);
    const hpAdj   = p.hashprice / diffF;

    // Revenue: hashrate × hashprice(USD/TH/d) × 365 × USD→CHF rate
    const btcRevYr  = hashYr * hpAdj * 365 * 0.9228;
    const heatRevYr = annHeatMwh * heatCover * p.heatPrice;
    const pvRevYr   = pvKwh * p.feedIn;
    const elecCostYr = annMiningKwh * p.elecPrice;
    const opexYr    = p.opexAnnual;

    const revYr  = btcRevYr + heatRevYr + pvRevYr;
    const costYr = elecCostYr + opexYr;
    const netYr  = revYr - costYr;

    cum += netYr;
    if (breakEven === null && cum >= 0) breakEven = yr;

    flows.push({
      yr, btcRevYr, heatRevYr, pvRevYr,
      elecCostYr, opexYr, netYr, cum,
    });
  }

  const irr = calcIRR([-p.capex, ...flows.map(f => f.netYr)]);

  let npv = -p.capex;
  flows.forEach((f, i) => {
    npv += f.netYr / Math.pow(1 + p.wacc / 100, i + 1);
  });

  return {
    flows, irr, npv, breakEven,
    totKw, totHash, annMiningKwh, annHeatMwh, bldgHeatKwh, heatCover, pvKwh,
  };
}

// ─── Feasibility matrix ───────────────────────────────────────────────────────
export function calcFeasibility(p, m) {
  const revPerKwh = m.flows[0]?.btcRevYr / m.annMiningKwh || 0;
  const heatPct   = Math.round(m.heatCover * 100);
  const roofRatio = p.roofArea / p.gfa;

  return [
    {
      label: 'Connexion réseau',
      status: p.gridKw >= 100 ? 'green' : p.gridKw >= 50 ? 'orange' : 'red',
      value: `${p.gridKw} kW`,
      detail: p.gridKw >= 100 ? '≥ 100 kW — optimal' : p.gridKw >= 50 ? 'Marginal — min 50 kW' : '< 50 kW insuffisant',
    },
    {
      label: 'Couverture thermique',
      status: heatPct >= 80 ? 'green' : heatPct >= 40 ? 'orange' : 'red',
      value: `${heatPct}%`,
      detail: heatPct >= 80 ? 'Demande couverte' : heatPct >= 40 ? 'Appoint requis' : '< 40% insuffisant',
    },
    {
      label: 'Taille du projet',
      status: (p.units >= 10 && p.gfa >= 1000) ? 'green' : p.units >= 5 ? 'orange' : 'red',
      value: `${p.units} unités`,
      detail: p.units >= 10 ? `${p.gfa} m² — viable` : p.units >= 5 ? 'Min. 10 recommandé' : 'Trop petit',
    },
    {
      label: 'Plafond énergie',
      status: p.elecPrice < revPerKwh * 0.7 ? 'green' : p.elecPrice < revPerKwh ? 'orange' : 'red',
      value: `CHF ${p.elecPrice}/kWh`,
      detail: p.elecPrice < revPerKwh * 0.7 ? 'Marge confortable' : p.elecPrice < revPerKwh ? 'Marge serrée' : 'Déficitaire',
    },
    {
      label: 'Ratio toit/sol',
      status: roofRatio >= 0.20 ? 'green' : roofRatio >= 0.10 ? 'orange' : 'red',
      value: `${Math.round(roofRatio * 100)}%`,
      detail: roofRatio >= 0.20 ? 'PV viable' : roofRatio >= 0.10 ? 'PV partiel' : 'Toit insuffisant',
    },
    {
      label: 'Rentabilité (IRR)',
      status: m.irr > 0.15 ? 'green' : m.irr > 0.08 ? 'orange' : 'red',
      value: m.irr > 0 ? `${(m.irr * 100).toFixed(1)}%` : 'N/A',
      detail: m.irr > 0.15 ? 'Excellent > 15%' : m.irr > 0.08 ? 'Acceptable 8-15%' : '< 8% risqué',
    },
  ];
}

// ─── Run all scenarios ────────────────────────────────────────────────────────
export function runAllScenarios(p) {
  return {
    'Base (+20%/an)':       runModel(p, 0.20),
    'Bull (+50%/an)':       runModel(p, 0.50),
    'Bear (-30%)':          runModel(p, -0.30),
    'Choc élec. +30%':      runModel({ ...p, elecPrice: p.elecPrice * 1.30 }),
    'Choc élec. +50%':      runModel({ ...p, elecPrice: p.elecPrice * 1.50 }),
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export const FX = { CHF: 1, EUR: 0.96, USD: 1.08 };

export function fmt(val, currency = 'CHF', decimals = 0) {
  const v = val * FX[currency];
  return `${currency} ${v.toLocaleString('fr-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
