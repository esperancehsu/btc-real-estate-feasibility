# ₿ Bitcoin × Real Estate — Feasibility Tool (React)

> **Earn money while heating your real estate.**

Conçu par **HOUESSOU Geneviève Espérance** — Orizon21 / AC Building Sagl × Plan ₿ Network — Tech Track 2026

## Stack
- React 18 + Vite
- Recharts (graphiques)
- CSS Modules

## Lancer en local

```bash
npm install
npm run dev
```

## Build pour production

```bash
npm run build
# → dossier dist/ à déployer
```

## Déploiement GitHub Pages

```bash
npm run build
# Upload le contenu de dist/ sur la branche gh-pages
```

## Structure

```
src/
├── components/
│   ├── Header.jsx          # Header sticky, BTC live, scénarios
│   ├── InputPanel.jsx      # Tous les inputs (5 sections)
│   └── Results.jsx         # KPIs, matrice, graphiques, tableaux
├── hooks/
│   └── useOrizon21.js      # State management + calculs réactifs
├── utils/
│   └── engine.js           # IRR, NPV, modèle financier complet
├── data/
│   └── presets.js          # Hardware, scénarios, tarifs énergie
└── App.jsx
```

## Sources données
- RY3T Calculator — AC Building Sagl (14.03.2025)
- SIA 380/1 — Norme thermique suisse
- CoinGecko API — Prix BTC live
- Braiins Insights / Mempool.space — Hashprice

MIT License

# btc-real-estate-feasibility
