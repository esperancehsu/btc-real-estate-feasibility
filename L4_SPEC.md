# SPEC.md — Orizon21 Bitcoin × Real Estate Feasibility Tool
**Version**: 1.0.0  
**Date**: Avril 2026  
**Auteur**: Orizon21 (by AC Building Sagl) × Plan ₿ Network  
**License**: MIT

---

## VISION

Outil open-source de référence pour évaluer la faisabilité économique d'intégrer des mineurs Bitcoin comme système de chauffage dans des immeubles résidentiels suisses et européens.

---

## FEATURES IMPLÉMENTÉES (v1.0)

### Interface Utilisateur
- [x] Design dark industriel Bitcoin (Space Mono + Syne, orange #F7931A sur fond #080808)
- [x] Header sticky avec prix BTC live (CoinGecko API) + fallback manuel
- [x] Sélecteur de scénarios SCN1 (Lugano 15) / SCN2 (Projet 40)
- [x] Toggle devise CHF / EUR / USD avec conversion automatique
- [x] 5 panneaux d'inputs collapsibles (Bâtiment, Énergie, Mining, Financier, Bitcoin)
- [x] Tooltips contextuels sur chaque paramètre
- [x] Responsive design (mobile, tablette, desktop)

### Inputs
- [x] Paramètres bâtiment: surface, unités, type, localisation, toit, connexion réseau
- [x] Paramètres énergie: tarif élec., demande thermique, ECS, injection réseau, PV solaire
- [x] Hardware presets: Bitaxe 500W, RY3T ONE, RY3T MAX, RY3T ULTRA, Antminer S21, Custom
- [x] Calcul auto du hashrate total et puissance totale
- [x] Paramètres financiers: CAPEX, OPEX, horizon, WACC, prix chaleur
- [x] Paramètres Bitcoin: prix BTC, appréciation, difficulté, dégradation HW, hashprice
- [x] Tarifs énergie auto par localisation (CH-TI, CH-ZH, CH-GE, DE, IT, FR)

### Moteur de Calcul
- [x] Revenue BTC = hashrate × hashprice × 365 × FX_CHF / difficulty_factor × hw_degradation
- [x] Chaleur produite = électricité × 0.95 (efficacité RY3T, source: RY3T Calculator)
- [x] Couverture thermique = MIN(1, chaleur_produite / demande_bâtiment)
- [x] IRR via Newton-Raphson (100 itérations)
- [x] NPV avec taux WACC configurable
- [x] Break-even year (première année P&L cumulatif ≥ 0)
- [x] P&L annuel sur horizon configurable (3–30 ans)
- [x] Conversion multi-devises (CHF, EUR, USD)

### Outputs
- [x] 4 KPIs principaux: TRI, VAN, Break-even, Revenus An 1
- [x] Matrice faisabilité 6 critères (feux tricolores vert/orange/rouge)
- [x] Tableau comparaison 5 scénarios (Base/Bull/Bear/Choc +30%/+50%)
- [x] Panel hash economics (BTC/mois, revenus, CHF/kWh, chaleur couverte)
- [x] Diagramme flux énergétique
- [x] Comparaison 3 alternatives (Bitcoin Heating vs PAC vs PV seul)
- [x] 4 graphiques Chart.js: P&L cumulatif, Cash flows annuels, Comparaison VAN, Sensibilité énergie

### Export & Partage
- [x] Export JSON (état complet des paramètres)
- [x] Export CSV (cash flows annuels)
- [x] Lien partageable (URL params)
- [x] Restore URL state au chargement

---

## FEATURES FUTURES (ROADMAP v2.0)

### P0 — Critique (avant lancement plateforme)
- [ ] **Traduction EN** : i18n complet FR/EN, switcher dans header
- [ ] **Validation inputs** : messages d'erreur inline, min/max enforced
- [ ] **Mode impression** : CSS print, layout A4, export PDF

### P1 — Important (Q2 2026)
- [ ] **Intégration API hashprice live** : Mempool.space ou Braiins Insights WebSocket
- [ ] **Carte localisation** : Sélection projet sur carte Suisse, auto-fill tarifs énergie
- [ ] **Rapport PDF automatique** : jsPDF, template branded Orizon21
- [ ] **Sauvegarde cloud** : localStorage + sync optionnel (compte utilisateur)
- [ ] **Mode comparaison** : Comparer 2 scénarios côte à côte

### P2 — Amélioration (Q3 2026)
- [ ] **Monte Carlo simulation** : Distribution probabiliste des revenus (10,000 tirages)
- [ ] **Optimiseur hardware** : Recommandation automatique du bon hardware selon bâtiment
- [ ] **Calculateur CO2** : Empreinte carbone vs alternatives + offset Bitcoin (hashrate green energy)
- [ ] **Intégration SIA 380/1** : Import direct des données de bilan thermique
- [ ] **Tableau de bord multi-projets** : Gestion portfolio pour promoteurs
- [ ] **API REST** : Endpoint public pour intégration dans autres outils

### P3 — Vision long terme
- [ ] **IA assistant** : Claude-powered recommendations basées sur le profil du bâtiment
- [ ] **Marketplace hardware** : Lien direct RY3T / Bitaxe shop intégré
- [ ] **Module réglementaire** : Base de données permis canton par canton
- [ ] **Intégration CRM promoteur** : Export vers Salesforce/HubSpot

---

## ARCHITECTURE TECHNIQUE

### Stack
- **Frontend**: HTML5 + CSS3 + JavaScript ES6+ (vanilla, no framework)
- **Charts**: Chart.js 4.4.1 (CDN Cloudflare)
- **Fonts**: Space Mono + Syne (Google Fonts)
- **API externe**: CoinGecko `/simple/price` (CORS-friendly, gratuit)

### Fichiers
```
orizon21/
├── index.html                    # Application complète (single file)
├── Orizon21_Financial_Model.xlsx # Modèle financier Excel (4 onglets)
├── SPEC.md                       # Ce fichier
└── docs/
    └── FEASIBILITY_FRAMEWORK.md  # Framework de décision
```

### Déploiement
- **GitHub Pages**: Push `index.html` sur `gh-pages` branch → live en 2 min
- **Netlify Drop**: Drag & drop `index.html` → URL publique instantanée
- **IPFS**: Distribution décentralisée possible (thème Bitcoin)
- **Aucun backend requis** — 100% statique

---

## DONNÉES & SOURCES

| Donnée | Source | Mise à jour |
|--------|--------|-------------|
| Efficacité thermique (95%) | RY3T Input Data, Aron Clementi | Statique |
| J/TH (22.6) | RY3T Input Data, Aron Clementi | Statique |
| CAPEX RY3T ONE (32,921 CHF) | RY3T Calculator, 14.03.2025 | Annuelle |
| Hashprice défaut (0.075 USD/TH/j) | Braiins Insights | Utilisateur |
| Tarifs énergie | SFOE 2024 / Ember | Annuelle |
| Norme thermique | SIA 380/1 | Statique |
| Prix BTC | CoinGecko API | Temps réel |
| Tarif RPC CH | Pronovo/Swissgrid | Annuelle |

---

## LIMITATIONS CONNUES

1. **Hashprice non live** : L'utilisateur doit entrer le hashprice manuellement (API Braiins/Mempool nécessite CORS proxy)
2. **Pas de profil de charge saisonnier** : La demande thermique est annualisée, pas modélisée mois par mois
3. **IRR instable** : Newton-Raphson peut diverger pour des cash flows très irréguliers (bear scenario extrême)
4. **PV simplifié** : 900 kWh/kWp/an est une moyenne CH; varie selon orientation, ombrage
5. **Pas d'amortissement BTC** : Le BTC miné est valorisé au prix courant, pas stocké

---

*© 2026 AC Building Sagl / Orizon21. MIT License.*
