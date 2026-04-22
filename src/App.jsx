import { useState } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import Results from './components/Results';
import { useOrizon21 } from './hooks/useOrizon21';
import styles from './App.module.css';

export default function App() {
  const {
    params, updateParam, updateMiner, updateLocation, loadScenario,
    currency, setCurrency,
    btcPrice, btcLoading,
    results, scenarios,
    totKw, totHash,
    exportJSON, exportCSV, copyLink,
  } = useOrizon21();

  const [activeScenario, setActiveScenario] = useState(2);

  const handleScenario = (n) => {
    setActiveScenario(n);
    loadScenario(n);
  };

  return (
    <div className={styles.app}>
      <Header
        btcPrice={btcPrice} btcLoading={btcLoading}
        currency={currency} setCurrency={setCurrency}
        activeScenario={activeScenario} onScenario={handleScenario}
        onExportJSON={exportJSON} onExportCSV={exportCSV} onCopyLink={copyLink}
      />

      <div className={styles.hero}>
        <div className={styles.heroTag}>Plan ₿ Network × AC Building Sagl — Orizon21</div>
        <h1 className={styles.heroTitle}>
          Bitcoin <em>×</em> Immobilier<br />
          <span>Outil de Faisabilité</span>
        </h1>
        <p className={styles.heroSub}>
          Évaluez si intégrer des mineurs Bitcoin comme système de chauffage est économiquement viable pour votre projet immobilier résidentiel.
        </p>
        <p className={styles.heroAuthor}>
          Conçu par <strong>HOUESSOU Geneviève Espérance</strong>
        </p>
      </div>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <InputPanel
            params={params} updateParam={updateParam}
            updateMiner={updateMiner} updateLocation={updateLocation}
            totKw={totKw} totHash={totHash}
          />
        </aside>
        <main className={styles.content}>
          <Results results={results} scenarios={scenarios} params={params} currency={currency} />
        </main>
      </div>

      <footer className={styles.footer}>
        <span>Conçu par <strong>HOUESSOU Geneviève Espérance</strong> · Orizon21 / AC Building Sagl × Plan ₿ Network · MIT License</span>
        <span>Data: CoinGecko · Braiins · SIA 380/1 · RY3T Calculator (AC Building Sagl, 14.03.2025)</span>
      </footer>
    </div>
  );
}
