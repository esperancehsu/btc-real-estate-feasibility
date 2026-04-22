import { useMemo } from 'react';
import { runModel, fmt, FX } from '../utils/engine';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import styles from './Results.module.css';

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={styles.tooltipRow}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{typeof p.value === 'number' ? fmt(p.value, currency) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, accent }) {
  return (
    <div className={styles.kpi} style={{ '--accent': accent }}>
      <div className={styles.kpiBar} />
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue} style={{ color: accent }}>{value}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Feasibility item ─────────────────────────────────────────────────────────
const STATUS_COLOR = { green: 'var(--green)', orange: 'var(--orange)', red: 'var(--red)' };
const STATUS_LABEL = { green: '✓', orange: '⚠', red: '✗' };

function FeasItem({ item }) {
  const color = STATUS_COLOR[item.status];
  return (
    <div className={styles.feasItem} style={{ '--c': color }}>
      <div className={styles.feasBorder} />
      <div className={styles.feasLabel}>{item.label}</div>
      <div className={styles.feasValue} style={{ color }}>
        {STATUS_LABEL[item.status]} {item.value}
      </div>
      <div className={styles.feasDetail}>{item.detail}</div>
    </div>
  );
}

// ─── Main Results ─────────────────────────────────────────────────────────────
export default function Results({ results, scenarios, params, currency }) {
  if (!results) return <div className={styles.loading}>Calcul en cours…</div>;

  const { base, feasibility } = results;
  const { flows, irr, npv, breakEven, totKw, totHash, annHeatMwh, heatCover, annMiningKwh } = base;

  const years = flows.map(f => `An ${f.yr}`);

  // P&L chart data — all scenarios
  const pnlData = useMemo(() => {
    const pts = [{ name: 'An 0' }];
    Object.entries(scenarios || {}).forEach(([nm, m]) => {
      pts[0][nm] = -params.capex;
    });
    flows.forEach((_, i) => {
      const pt = { name: `An ${i + 1}` };
      Object.entries(scenarios || {}).forEach(([nm, m]) => {
        pt[nm] = m.flows[i]?.cum ?? 0;
      });
      pts.push(pt);
    });
    return pts;
  }, [scenarios, flows, params.capex]);

  // Cashflow bar chart
  const cfData = flows.map(f => ({
    name: `An ${f.yr}`,
    'Rev. BTC':    f.btcRevYr,
    'Rev. Chaleur': f.heatRevYr,
    'Coût élec.':  -f.elecCostYr,
    'OPEX':        -f.opexYr,
  }));

  // Sensitivity chart
  const prices = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45];
  const sensData = prices.map(ep => {
    // runModel is imported at top
    const m = runModel({ ...params, elecPrice: ep });
    return { name: `${ep.toFixed(2)}`, NPV: m.npv };
  });

  const SCENARIO_COLORS = ['#F7931A', '#00d48a', '#ff4040', '#ff8f00', '#3d9be9'];

  const fmtK = v => `${(v / 1000).toFixed(0)}k`;

  return (
    <div className={styles.results}>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <KPI
          label="TRI (IRR)"
          value={irr > 0 ? `${(irr * 100).toFixed(1)}%` : 'N/A'}
          sub="Taux de rendement interne"
          accent={irr > 0.10 ? 'var(--green)' : irr > 0 ? 'var(--orange)' : 'var(--red)'}
        />
        <KPI
          label="VAN (NPV)"
          value={fmt(npv, currency)}
          sub={`Actualisé à ${params.wacc}% WACC`}
          accent={npv > 0 ? 'var(--green)' : 'var(--red)'}
        />
        <KPI
          label="Break-even"
          value={breakEven ? `An ${breakEven}` : `>${params.horizon} ans`}
          sub="Retour sur CAPEX"
          accent={breakEven && breakEven <= 10 ? 'var(--btc)' : 'var(--orange)'}
        />
        <KPI
          label="Revenus An 1"
          value={fmt(flows[0]?.btcRevYr + flows[0]?.heatRevYr + flows[0]?.pvRevYr, currency)}
          sub="BTC + chaleur + réseau"
          accent="var(--btc)"
        />
        <KPI
          label="Hashrate"
          value={`${totHash.toFixed(0)} TH/s`}
          sub={`${totKw.toFixed(1)} kW installés`}
          accent="var(--blue)"
        />
        <KPI
          label="Couverture thermique"
          value={`${Math.round(heatCover * 100)}%`}
          sub={`${annHeatMwh.toFixed(0)} MWh/an produits`}
          accent={heatCover >= 0.8 ? 'var(--green)' : heatCover >= 0.4 ? 'var(--orange)' : 'var(--red)'}
        />
      </div>

      {/* Feasibility matrix */}
      <Section title="🚦 Matrice de Faisabilité">
        <div className={styles.feasGrid}>
          {feasibility.map((item, i) => <FeasItem key={i} item={item} />)}
        </div>
      </Section>

      {/* Charts row 1 */}
      <div className={styles.chartGrid}>
        <Section title="📈 P&L Cumulatif — Scénarios">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pnlData}>
              <XAxis dataKey="name" tick={{ fill: 'var(--tx3)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <YAxis tickFormatter={fmtK} tick={{ fill: 'var(--tx3)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <Tooltip content={<ChartTooltip currency={currency} />} />
              <ReferenceLine y={0} stroke="var(--bd2)" strokeDasharray="4 2" />
              {Object.keys(scenarios || {}).map((nm, i) => (
                <Line key={nm} dataKey={nm} stroke={SCENARIO_COLORS[i]}
                  dot={false} strokeWidth={i === 0 ? 2.5 : 1.5} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section title="💧 Cash Flows Annuels">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cfData}>
              <XAxis dataKey="name" tick={{ fill: 'var(--tx3)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <YAxis tickFormatter={fmtK} tick={{ fill: 'var(--tx3)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <Tooltip content={<ChartTooltip currency={currency} />} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'DM Mono', color: 'var(--tx3)' }} />
              <Bar dataKey="Rev. BTC" stackId="a" fill="#F7931A" />
              <Bar dataKey="Rev. Chaleur" stackId="a" fill="#ff8f00" />
              <Bar dataKey="Coût élec." stackId="b" fill="#ff404066" />
              <Bar dataKey="OPEX" stackId="b" fill="#ff404033" />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Hash economics */}
      <Section title="⛏ Économie du Hashrate">
        <div className={styles.hashGrid}>
          {[
            { label: 'BTC/mois', value: (flows[0]?.btcRevYr / params.btcPrice / 12).toFixed(4), unit: 'Bitcoin miné' },
            { label: 'Rev. mining/an', value: fmt(flows[0]?.btcRevYr, currency), unit: 'Annuel' },
            { label: 'CHF/kWh miné', value: `CHF ${(flows[0]?.btcRevYr / annMiningKwh).toFixed(3)}`, unit: 'Par kWh consommé' },
            { label: 'Chaleur couverte', value: `${Math.round(heatCover * 100)}%`, unit: 'Demande thermique' },
          ].map((h, i) => (
            <div key={i} className={styles.hashItem}>
              <div className={styles.hashLabel}>{h.label}</div>
              <div className={styles.hashValue}>{h.value}</div>
              <div className={styles.hashUnit}>{h.unit}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sensitivity chart */}
      <div className={styles.chartGrid}>
        <Section title="📉 Sensibilité Prix Énergie">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sensData}>
              <defs>
                <linearGradient id="npvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: 'var(--tx3)', fontSize: 9, fontFamily: 'DM Mono' }}
                label={{ value: 'CHF/kWh', position: 'insideBottomRight', fill: 'var(--tx3)', fontSize: 9 }} />
              <YAxis tickFormatter={fmtK} tick={{ fill: 'var(--tx3)', fontSize: 9, fontFamily: 'DM Mono' }} />
              <Tooltip content={<ChartTooltip currency={currency} />} />
              <ReferenceLine y={0} stroke="var(--red)" strokeDasharray="4 2" />
              <Area dataKey="NPV" stroke="#F7931A" fill="url(#npvGrad)" strokeWidth={2} dot={{ fill: '#F7931A', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        {/* Alternatives comparison */}
        <Section title="⚖ Alternatives">
          <div className={styles.altGrid}>
            {[
              {
                name: 'Bitcoin Heating', badge: '★ Recommandé', highlight: true,
                capex: fmt(params.capex, currency),
                opex: fmt(flows[0]?.elecCostYr + params.opexAnnual, currency),
                rev: fmt(flows[0]?.btcRevYr + flows[0]?.heatRevYr, currency),
                be: breakEven ? `An ${breakEven}` : 'N/A',
              },
              {
                name: 'Pompe à chaleur', badge: 'Alternative',
                capex: fmt(42000 * params.units / 15, currency),
                opex: fmt(2095 * params.units / 15, currency),
                rev: 'CHF 0', be: 'Jamais',
              },
              {
                name: 'PV Solaire seul', badge: 'Alternative',
                capex: fmt(Math.max(params.pvKwp, 20) * 1200, currency),
                opex: fmt(Math.max(params.pvKwp, 20) * 1200 * 0.015, currency),
                rev: fmt(Math.max(params.pvKwp, 20) * 900 * params.feedIn, currency),
                be: 'An ~20',
              },
            ].map((a, i) => (
              <div key={i} className={`${styles.altCard} ${a.highlight ? styles.altHL : ''}`}>
                <div className={styles.altBadge}>{a.badge}</div>
                <div className={styles.altName}>{a.name}</div>
                {[['CAPEX', a.capex], ['OPEX/an', a.opex], ['Revenus/an', a.rev], ['Break-even', a.be]].map(([k, v]) => (
                  <div key={k} className={styles.altRow}>
                    <span className={styles.altKey}>{k}</span>
                    <span className={styles.altVal}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Scenario comparison table */}
      <Section title="📊 Comparaison Scénarios">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Scénario', 'TRI', 'VAN', 'Break-even', 'Net An 1', 'Net An 5', 'Statut'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(scenarios || {}).map(([nm, m]) => {
                const viable = m.npv > 0;
                const irrc = m.irr > 0.15 ? 'green' : m.irr > 0.05 ? 'orange' : 'red';
                return (
                  <tr key={nm}>
                    <td>{nm}</td>
                    <td className={styles[irrc]}>{m.irr > 0 ? `${(m.irr * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td className={viable ? styles.green : styles.red}>{fmt(m.npv, currency)}</td>
                    <td>{m.breakEven ? `An ${m.breakEven}` : `>${params.horizon}`}</td>
                    <td>{fmt(m.flows[0]?.netYr, currency)}</td>
                    <td>{fmt(m.flows[4]?.netYr ?? 0, currency)}</td>
                    <td className={viable ? styles.green : styles.red}>
                      {viable ? '✓ Viable' : '✗ Déficitaire'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        ⚠️ Outil fourni à titre informatif. Les projections ne constituent pas un conseil financier.
        Toute décision commerciale doit être vérifiée indépendamment. —&nbsp;
        HOUESSOU Geneviève Espérance · Orizon21 / AC Building Sagl · MIT License
      </p>
    </div>
  );
}
