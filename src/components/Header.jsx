import { useState } from 'react';
import { Bitcoin, Zap, Download, Link } from 'lucide-react';
import { FX } from '../utils/engine';
import styles from './Header.module.css';

const CURRENCIES = ['CHF', 'EUR', 'USD'];
const SCENARIOS = [
  { n: 1, label: 'SCN1 — Lugano 15' },
  { n: 2, label: 'SCN2 — Projet 40' },
];

export default function Header({
  btcPrice, btcLoading, currency, setCurrency,
  activeScenario, onScenario,
  onExportJSON, onExportCSV, onCopyLink,
}) {
  const [toast, setToast] = useState('');

  const handleCopy = () => {
    onCopyLink();
    setToast('Lien copié !');
    setTimeout(() => setToast(''), 2000);
  };

  const displayPrice = btcLoading
    ? '…'
    : `${currency} ${Math.round(btcPrice * FX[currency]).toLocaleString('fr-CH')}`;

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <Bitcoin size={16} color="var(--btc)" />
        <span className={styles.logoText}>ORIZON<em>21</em></span>
        <span className={styles.logoDivider}>×</span>
        <span className={styles.logoSub}>RE Feasibility</span>
      </div>

      {/* Center: BTC price + scenarios */}
      <div className={styles.center}>
        <div className={styles.btcBadge}>
          <span className={btcLoading ? styles.dotLoading : styles.dot} />
          <span className={styles.btcLabel}>BTC</span>
          <span className={styles.btcPrice}>{displayPrice}</span>
        </div>

        <div className={styles.scenarioGroup}>
          {SCENARIOS.map(s => (
            <button
              key={s.n}
              className={`${styles.scBtn} ${activeScenario === s.n ? styles.scActive : ''}`}
              onClick={() => onScenario(s.n)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: currency + export */}
      <div className={styles.right}>
        <div className={styles.currencyGroup}>
          {CURRENCIES.map(c => (
            <button
              key={c}
              className={`${styles.curBtn} ${currency === c ? styles.curActive : ''}`}
              onClick={() => setCurrency(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={onExportJSON} title="Export JSON">
            <Download size={13} />
          </button>
          <button className={styles.actionBtn} onClick={onExportCSV} title="Export CSV">
            <Zap size={13} />
          </button>
          <button className={styles.actionBtn} onClick={handleCopy} title="Copier lien">
            <Link size={13} />
          </button>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </header>
  );
}
