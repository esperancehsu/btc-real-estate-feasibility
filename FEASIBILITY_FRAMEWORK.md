# Orizon21 — Framework de Faisabilité Bitcoin × Immobilier
**A project by Orizon21 (by AC Building Sagl) × Plan ₿ Network**  
Version 1.0 | Avril 2026

---

## 1. INTRODUCTION

### Contexte
Les bâtiments résidentiels consomment de grandes quantités d'énergie pour le chauffage. Les mineurs Bitcoin produisent de la chaleur comme sous-produit direct du calcul. Combinés correctement, ils transforment un centre de coût énergétique en actif générateur de revenus.

### La lacune du marché
Aucun outil n'existe aujourd'hui qui combine dans un modèle cohérent :
- Les entrées énergétiques et thermiques d'un bâtiment (normes SIA 380/1)
- Les revenus de minage Bitcoin (hashprice, difficulté, prix BTC)
- Les projections financières (IRR, NPV, break-even)
- Les alternatives de chauffage (PAC, solaire PV)

### Sources de données clés
- **RY3T Calculator** (Aron Clementi, AC Building Sagl, 14.03.2025) — données financières réelles
- **Norme SIA 380/1** — demande thermique standard Suisse (80–200 kWh/m²/an)
- **Braiins Insights / Mempool.space** — hashprice et difficulté BTC
- **CoinGecko API** — prix BTC en temps réel
- **Pronovo / Swissgrid** — tarifs RPC Suisse (~0.075 CHF/kWh)

---

## 2. MATRICE DES PARAMÈTRES D'ENTRÉE

### 2.1 Bâtiment
| Paramètre | Unité | Défaut (SCN1) | Description |
|-----------|-------|---------------|-------------|
| Surface plancher brute | m² | 1,500 | Scénario 1 — Lugano 15 |
| Nombre de logements | unités | 15 | Appartements résidentiels |
| Type de bâtiment | - | Résidentiel | Résidentiel / Mixte |
| Localisation | - | Lugano CH-TI | Détermine tarif énergie |
| Surface toit disponible | m² | 320 | Pour PV ou équipements |
| Connexion réseau | kW | 100 | Min. 50 kW pour minage |

### 2.2 Énergie & Thermique
| Paramètre | Unité | Défaut | Source |
|-----------|-------|--------|--------|
| Tarif électricité | CHF/kWh | 0.22 | SFOE — Lugano 2024 |
| Demande chauffage | kWh/m²/an | 180 | Norme SIA 380/1 |
| Demande ECS | kWh/an | 7,500 | ~500 kWh/logement |
| Tarif injection réseau | CHF/kWh | 0.075 | Pronovo/Swissgrid RPC |
| PV solaire | kWp | 0 | Optionnel |

### 2.3 Hardware Mining
| Paramètre | Unité | Défaut | Source |
|-----------|-------|--------|--------|
| Modèle hardware | - | Bitaxe 500W | RY3T / Bitaxe Immersion |
| Nombre d'unités | - | 20 | Adapté au bâtiment |
| Puissance par unité | W | 500 | Watts par miner |
| Efficacité | J/TH | 22.6 | RY3T Input Data (auto-tuning) |
| Hashrate total | TH/s | calculé | = (kW × 1000) / J/TH |

### 2.4 Financier
| Paramètre | Unité | Défaut | Source |
|-----------|-------|--------|--------|
| CAPEX total | CHF | 150,000 | Assignment brief (SCN1) |
| OPEX annuel | CHF/an | 4,000 | RY3T: 733 CHF/an/unité |
| Horizon | années | 15 | Standard immobilier CH |
| WACC | % | 8% | Coût du capital |
| Prix chaleur vendue | CHF/MWh | 60 | Marché district chauffage |

### 2.5 Bitcoin
| Paramètre | Unité | Défaut | Scénarios |
|-----------|-------|--------|-----------|
| Prix BTC | CHF | Live API | Via CoinGecko |
| Appréciation BTC | %/an | +20% | Base: 20%, Bull: 50%, Bear: -30% |
| Hashprice | USD/TH/jour | 0.075 | Braiins: Optimiste 0.0995 |
| Croissance difficulté | %/an | 10% | Conservateur: 10%, Agressif: 25% |
| Dégradation hardware | %/an | 2% | Usure annuelle hashrate |

---

## 3. MODÈLE FINANCIER — LOGIQUE

### 3.1 Calcul des revenus de minage

```
Revenue_BTC_CHF/an = Hashrate(TH/s) × Hashprice(USD/TH/j) × 365 × FX(USD→CHF)
                   × (1/DifficultyFactor) × HardwareDegradationFactor

où:
- Hashrate = (Nb_miners × Watts) / J_TH
- DifficultyFactor = (1 + diff_growth)^(année-1)
- HardwareDegradation = (1 - hw_degr)^(année-1)
```

*Source: RY3T Calculator — Rendement optimiste: CHF 0.20/kWh*

### 3.2 Calcul de la chaleur produite

```
Chaleur_produite_kWh = Electricité_consommée_kWh × 0.95
(Efficacité thermique RY3T: 95% — Source: RY3T Input Data)

Demande_bâtiment_kWh = Surface_m² × kWh/m²/an + ECS

Taux_couverture = MIN(1, Chaleur_produite / Demande_bâtiment)
Revenue_chaleur = Chaleur_produite × taux_couverture × Prix_chaleur(CHF/MWh) / 1000
```

### 3.3 Compte de résultat annuel

```
REVENUS:
  + Revenue mining BTC
  + Revenue chaleur (si vendue)
  + Revenue PV (injection réseau)

COÛTS:
  - Electricité consommée × tarif
  - OPEX (maintenance, assurance)

CAPEX (An 0):
  - Hardware (RY3T/Bitaxe)
  - Installation électrique
  - Intégration MEP

NET = REVENUS - COÛTS
```

### 3.4 Indicateurs financiers

**Break-even** : Première année où le P&L cumulatif ≥ 0

**IRR** (Taux de Rendement Interne) :
```
Résoudre: 0 = -CAPEX + Σ(NetCashFlow_t / (1+IRR)^t)
Méthode: Newton-Raphson (100 itérations max)
```

**NPV** (Valeur Actuelle Nette) :
```
NPV = -CAPEX + Σ(NetCashFlow_t / (1+WACC)^t)
```

---

## 4. MATRICE DE FAISABILITÉ — SEUILS DE DÉCISION

### 4.1 Tableau des seuils

| Dimension | 🟢 Viable | 🟡 Conditionnel | 🔴 Non recommandé |
|-----------|-----------|-----------------|-------------------|
| **Connexion réseau** | ≥ 100 kW | 50–100 kW | < 50 kW |
| **Couverture thermique** | ≥ 80% | 40–80% | < 40% |
| **Taille du projet** | ≥ 10 unités ET ≥ 1000 m² | ≥ 5 unités | < 5 unités |
| **Plafond énergie** | Elec. < 70% du rev. mining | Elec. 70–100% rev. | Elec. > rev. mining |
| **Ratio toit/sol** | ≥ 20% | 10–20% | < 10% |
| **Rentabilité** | IRR > 15% | IRR 8–15% | IRR < 8% |

### 4.2 Justification des seuils

**Connexion réseau (min. 50 kW)** : En dessous de 50 kW, le hashrate déployable est insuffisant pour générer un retour significatif. 100 kW permet ~200 unités Bitaxe à 500W.

**Couverture thermique (cible 80%)** : Un immeuble dont 80%+ de la demande thermique est couverte par le minage peut éliminer le chauffage complémentaire. En dessous de 40%, le surcoût d'un chauffage d'appoint réduit l'avantage économique.

**Taille minimale (10 unités / 1000 m²)** : En dessous de ce seuil, les coûts fixes (installation électrique, MEP, comptabilité crypto) deviennent disproportionnés par rapport aux revenus.

**Plafond énergie** : Si le coût de l'électricité dépasse le revenu de minage par kWh, l'opération est déficitaire sans la valeur de la chaleur. Seuil critique Suisse: ~0.30–0.35 CHF/kWh selon le hashprice.

**Ratio toit/sol** : Pour le PV complémentaire, un ratio ≥ 20% permet d'installer ~1 kWp pour 5 m² de sol, rendant le PV viable.

---

## 5. ANALYSE DE RISQUES

### 5.1 Risques modélisés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Chute prix BTC -30% | Revenu mining -30% | Scénario Bear dans le modèle |
| Hausse tarif élec. +50% | Coût +50% | Analyse sensibilité incluse |
| Croissance difficulté +25%/an | Revenu -20%/an | Scénario agressif modélisé |
| Dégradation hardware 5%/an | Hashrate -5%/an | Paramètre configurable |

### 5.2 Risques non modélisés (PRD)

- **Risque réglementaire** : Restrictions sur revente d'énergie ou minage dans certaines juridictions. Note: la Suisse est favorable (pas de restriction actuelle).
- **Risque de liquidité BTC** : Volatilité intra-annuelle non capturée
- **Risque de maintenance** : Pannes matérielles imprévues
- **Risque réseau** : Downtime serveurs de minage

---

## 6. COMPARAISON ALTERNATIVES

### 6.1 Résumé scénario Lugano 15 (basé sur données RY3T)

| Système | CAPEX | OPEX/an | Revenus/an | Coût net/an | Break-even |
|---------|-------|---------|------------|-------------|------------|
| **Bitcoin Mining (RY3T)** | CHF 32,921/unité | CHF 4,091 | CHF 2,019 | CHF 2,073 | **~7 ans** |
| Pompe à chaleur air | CHF 42,000 | CHF 2,095 | CHF 0 | CHF 2,095 | Jamais |
| Sonde géothermique | CHF 84,000 | CHF 1,138 | CHF 0 | CHF 1,138 | Jamais |
| Chaudière fioul/gaz | CHF 27,000 | CHF 2,239–3,223 | CHF 0 | CHF 2,239–3,223 | Jamais |

*Source: RY3T Calculator (Aron Clementi, 14.03.2025) — 11'000 kWh/an, CHF 0.29/kWh, perspective optimiste*

---

## 7. LIMITATIONS & DISCLAIMER

Ce framework est conçu pour une analyse préliminaire de faisabilité. Il ne remplace pas :
- Un audit énergétique professionnel (ingénieur MEP certifié)
- Une étude de faisabilité technique complète
- Un conseil financier ou juridique professionnel

**Toutes les projections financières doivent être vérifiées indépendamment avant toute décision commerciale.**

---

*© 2026 AC Building Sagl / Orizon21. MIT License.*  
*Plan ₿ Network — Tech Track Assignment 2026*
