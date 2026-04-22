import { useState, useEffect, useCallback } from 'react';
import { runModel, runAllScenarios, calcFeasibility } from '../utils/engine';
import { SCENARIOS, HARDWARE, ENERGY_PRICES } from '../data/presets';

export function useOrizon21() {
  const [params, setParams] = useState(SCENARIOS[2]); // SCN2 default
  const [currency, setCurrency] = useState('CHF');
  const [btcPrice, setBtcPrice] = useState(85000);
  const [btcLoading, setBtcLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [scenarios, setScenarios] = useState(null);

  // Fetch live BTC price
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=chf')
      .then(r => r.json())
      .then(d => {
        const price = Math.round(d.bitcoin.chf);
        setBtcPrice(price);
        setParams(prev => ({ ...prev, btcPrice: price }));
      })
      .catch(() => {})
      .finally(() => setBtcLoading(false));
  }, []);

  // Calculate whenever params change
  useEffect(() => {
    const base = runModel(params);
    const allScens = runAllScenarios(params);
    const feasibility = calcFeasibility(params, base);
    setResults({ base, feasibility });
    setScenarios(allScens);
  }, [params]);

  const updateParam = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateMiner = useCallback((model) => {
    const hw = HARDWARE[model];
    if (hw && model !== 'custom') {
      setParams(prev => ({
        ...prev,
        minerModel: model,
        minerWatts: hw.watts,
        minerJTH: hw.jth,
      }));
    } else {
      setParams(prev => ({ ...prev, minerModel: model }));
    }
  }, []);

  const updateLocation = useCallback((loc) => {
    setParams(prev => ({
      ...prev,
      location: loc,
      elecPrice: ENERGY_PRICES[loc] ?? prev.elecPrice,
    }));
  }, []);

  const loadScenario = useCallback((n) => {
    setParams(SCENARIOS[n]);
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(params, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orizon21-scenario.json';
    a.click();
  }, [params]);

  const exportCSV = useCallback(() => {
    if (!results) return;
    const rows = ['Année,Rev BTC CHF,Rev Chaleur CHF,Coût Élec CHF,OPEX CHF,Net CHF,Cumulatif CHF'];
    results.base.flows.forEach(f => {
      rows.push(`${f.yr},${f.btcRevYr.toFixed(0)},${f.heatRevYr.toFixed(0)},${f.elecCostYr.toFixed(0)},${f.opexYr.toFixed(0)},${f.netYr.toFixed(0)},${f.cum.toFixed(0)}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orizon21-cashflows.csv';
    a.click();
  }, [results]);

  const copyLink = useCallback(() => {
    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    navigator.clipboard.writeText(`${window.location.href.split('?')[0]}?${qs}`);
  }, [params]);

  const totKw   = (params.minerCount * params.minerWatts) / 1000;
  const totHash = (totKw * 1000) / params.minerJTH;

  return {
    params, updateParam, updateMiner, updateLocation, loadScenario,
    currency, setCurrency,
    btcPrice, btcLoading,
    results, scenarios,
    totKw, totHash,
    exportJSON, exportCSV, copyLink,
  };
}
