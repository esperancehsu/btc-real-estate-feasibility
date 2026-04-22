import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { HARDWARE, ENERGY_PRICES } from '../data/presets';
import styles from './InputPanel.module.css';

function Accordion({ title, icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordion}>
      <button className={styles.accordionHeader} onClick={() => setOpen(!open)}>
        <span className={styles.accordionTitle}><span>{icon}</span>{title}</span>
        <ChevronDown size={14} className={open ? styles.chevronOpen : styles.chevron} />
      </button>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </div>
  );
}

function Field({ label, tip, children, full }) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ''}`}>
      <label className={styles.label}>
        {label}
        {tip && (
          <span className={styles.tip} title={tip}>
            <HelpCircle size={10} />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'number', step, min, max, readOnly }) {
  return (
    <input
      className={`${styles.input} ${readOnly ? styles.readonly : ''}`}
      type={type} value={value} step={step} min={min} max={max}
      readOnly={readOnly}
      onChange={e => onChange?.(type === 'number' ? +e.target.value : e.target.value)}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function InputPanel({ params, updateParam, updateMiner, updateLocation, totKw, totHash }) {
  return (
    <div className={styles.panel}>

      {/* BÂTIMENT */}
      <Accordion title="Bâtiment" icon="🏢">
        <div className={styles.grid2}>
          <Field label="Surface (m²)" tip="Surface plancher totale">
            <Input value={params.gfa} onChange={v => updateParam('gfa', v)} min={100} />
          </Field>
          <Field label="Nb. logements" tip="Nombre d'appartements">
            <Input value={params.units} onChange={v => updateParam('units', v)} min={1} />
          </Field>
          <Field label="Localisation">
            <Select value={params.location} onChange={updateLocation} options={[
              { value: 'CH-TI', label: 'Lugano (CH-TI)' },
              { value: 'CH-ZH', label: 'Zürich (CH-ZH)' },
              { value: 'CH-GE', label: 'Genève (CH-GE)' },
              { value: 'DE', label: 'Allemagne' },
              { value: 'IT', label: 'Italie' },
              { value: 'FR', label: 'France' },
            ]} />
          </Field>
          <Field label="Toit (m²)" tip="Surface toit disponible pour PV">
            <Input value={params.roofArea} onChange={v => updateParam('roofArea', v)} min={0} />
          </Field>
          <Field label="Connexion réseau (kW)" tip="Puissance de raccordement. Min. 50 kW recommandé">
            <Input value={params.gridKw} onChange={v => updateParam('gridKw', v)} min={10} />
          </Field>
        </div>
      </Accordion>

      {/* ÉNERGIE */}
      <Accordion title="Énergie & Thermique" icon="⚡">
        <div className={styles.grid2}>
          <Field label="Tarif élec. (CHF/kWh)" tip="Prix réseau. CH: 0.22-0.32 CHF/kWh">
            <Input value={params.elecPrice} onChange={v => updateParam('elecPrice', v)} step={0.01} min={0.05} />
          </Field>
          <Field label="Chauf. (kWh/m²/an)" tip="Norme SIA 380/1: 80-200 kWh/m²/an">
            <Input value={params.heatDemand} onChange={v => updateParam('heatDemand', v)} min={30} />
          </Field>
          <Field label="ECS (kWh/an)" tip="~500 kWh/logement/an">
            <Input value={params.dhwDemand} onChange={v => updateParam('dhwDemand', v)} min={0} />
          </Field>
          <Field label="Injection réseau (CHF/kWh)" tip="Pronovo/Swissgrid RPC: ~0.075">
            <Input value={params.feedIn} onChange={v => updateParam('feedIn', v)} step={0.005} min={0} />
          </Field>
          <Field label="PV solaire (kWp)" tip="~900 kWh/kWp/an en Suisse">
            <Input value={params.pvKwp} onChange={v => updateParam('pvKwp', v)} min={0} />
          </Field>
          <Field label="Prix chaleur (CHF/MWh)" tip="Prix vente chaleur au bâtiment">
            <Input value={params.heatPrice} onChange={v => updateParam('heatPrice', v)} min={0} />
          </Field>
        </div>
      </Accordion>

      {/* HARDWARE */}
      <Accordion title="Hardware Mining" icon="⛏">
        <div className={styles.grid2}>
          <Field label="Modèle" full>
            <Select value={params.minerModel} onChange={updateMiner} options={
              Object.entries(HARDWARE).map(([k, v]) => ({ value: k, label: v.label }))
            } />
          </Field>
          <Field label="Nb. unités" tip="Nombre de mineurs">
            <Input value={params.minerCount} onChange={v => updateParam('minerCount', v)} min={1} />
          </Field>
          <Field label="Puissance (W/unité)" tip="Consommation électrique par miner">
            <Input value={params.minerWatts} onChange={v => updateParam('minerWatts', v)} min={100} />
          </Field>
          <Field label="Efficacité (J/TH)" tip="RY3T: 22.6 J/TH. Plus bas = meilleur">
            <Input value={params.minerJTH} onChange={v => updateParam('minerJTH', v)} step={0.1} min={5} />
          </Field>
          <Field label="Puissance totale (kW)">
            <Input value={totKw.toFixed(1)} readOnly />
          </Field>
          <Field label="Hashrate total (TH/s)">
            <Input value={totHash.toFixed(0)} readOnly />
          </Field>
        </div>
      </Accordion>

      {/* FINANCIER */}
      <Accordion title="Financier" icon="💰">
        <div className={styles.grid2}>
          <Field label="CAPEX (CHF)" tip="Hardware + installation + MEP">
            <Input value={params.capex} onChange={v => updateParam('capex', v)} min={10000} />
          </Field>
          <Field label="Horizon (années)">
            <Input value={params.horizon} onChange={v => updateParam('horizon', v)} min={3} max={30} />
          </Field>
          <Field label="WACC (%)" tip="Taux d'actualisation pour NPV">
            <Input value={params.wacc} onChange={v => updateParam('wacc', v)} step={0.5} min={0} />
          </Field>
          <Field label="OPEX/an (CHF)" tip="Maintenance hors électricité">
            <Input value={params.opexAnnual} onChange={v => updateParam('opexAnnual', v)} min={0} />
          </Field>
        </div>
      </Accordion>

      {/* BITCOIN */}
      <Accordion title="Bitcoin & Scénarios" icon="₿">
        <div className={styles.grid2}>
          <Field label="Prix BTC (CHF)" tip="Mis à jour via CoinGecko API">
            <Input value={params.btcPrice} onChange={v => updateParam('btcPrice', v)} min={1000} />
          </Field>
          <Field label="Hashprice (USD/TH/j)" tip="Braiins: Optimiste 0.0995, Base 0.075">
            <Input value={params.hashprice} onChange={v => updateParam('hashprice', v)} step={0.005} min={0.001} />
          </Field>
          <Field label="Appréciation BTC (%/an)" tip="Scénario base: +20%/an">
            <Input value={params.btcApprec} onChange={v => updateParam('btcApprec', v)} step={5} />
          </Field>
          <Field label="Difficulté (%/an)" tip="Conservateur: 10%, Agressif: 25%">
            <Input value={params.diffGrowth} onChange={v => updateParam('diffGrowth', v)} step={5} min={0} />
          </Field>
          <Field label="Dégradation HW (%/an)" tip="Perte efficacité annuelle du hashrate">
            <Input value={params.hwDegr} onChange={v => updateParam('hwDegr', v)} step={1} min={0} />
          </Field>
        </div>
      </Accordion>

    </div>
  );
}
