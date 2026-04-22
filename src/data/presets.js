// ─── Hardware presets ─────────────────────────────────────────────────────────
// Source: RY3T Calculator (AC Building Sagl, 14.03.2025)
export const HARDWARE = {
  bitaxe:       { label: 'Bitaxe Immersion',  watts: 500,    jth: 22.6, cost: 3069   },
  'ry3t-one':   { label: 'RY3T ONE',          watts: 3000,   jth: 22.6, cost: 17921  },
  'ry3t-max':   { label: 'RY3T MAX',          watts: 25000,  jth: 20.0, cost: 45000  },
  'ry3t-ultra': { label: 'RY3T ULTRA',        watts: 100000, jth: 18.0, cost: 120000 },
  's21':        { label: 'Antminer S21',      watts: 3500,   jth: 17.5, cost: 4500   },
  custom:       { label: 'Personnalisé',       watts: 500,    jth: 22.6, cost: 3000   },
};

// ─── Energy prices by region ──────────────────────────────────────────────────
// Source: SFOE 2024
export const ENERGY_PRICES = {
  'CH-TI': 0.22,
  'CH-ZH': 0.25,
  'CH-GE': 0.24,
  'DE':    0.28,
  'IT':    0.30,
  'FR':    0.20,
};

// ─── Scenario presets ─────────────────────────────────────────────────────────
// Source: Assignment brief Plan B Network Tech Track 2026
export const SCENARIOS = {
  1: {
    label: 'SCN1 — Lugano 15',
    gfa: 1500, units: 15, location: 'CH-TI', roofArea: 320, gridKw: 100,
    elecPrice: 0.22, heatDemand: 180, dhwDemand: 7500, peakLoad: 85,
    feedIn: 0.075, pvKwp: 0,
    capex: 150000, horizon: 15, wacc: 8, opexAnnual: 4000,
    heatPrice: 60, btcApprec: 20, diffGrowth: 10, hwDegr: 2,
    hashprice: 0.075, btcPrice: 85000,
    minerModel: 'bitaxe', minerCount: 20, minerWatts: 500, minerJTH: 22.6,
  },
  2: {
    label: 'SCN2 — Projet 40',
    gfa: 4000, units: 40, location: 'CH-ZH', roofArea: 800, gridKw: 250,
    elecPrice: 0.25, heatDemand: 160, dhwDemand: 20000, peakLoad: 200,
    feedIn: 0.075, pvKwp: 60,
    capex: 380000, horizon: 15, wacc: 8, opexAnnual: 10000,
    heatPrice: 60, btcApprec: 20, diffGrowth: 10, hwDegr: 2,
    hashprice: 0.075, btcPrice: 85000,
    minerModel: 'ry3t-max', minerCount: 3, minerWatts: 25000, minerJTH: 20.0,
  },
};
