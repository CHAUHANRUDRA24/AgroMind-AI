import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Calculator, 
  Sliders, 
  Download, 
  Sparkles, 
  FlaskConical, 
  TrendingUp, 
  Info, 
  BookOpen, 
  Scale, 
  Check, 
  AlertTriangle,
  Layers,
  ArrowRight,
  Database,
  Printer
} from 'lucide-react';

interface CropNutrientProfile {
  id: string;
  name: string;
  category: string;
  targetN: number; // ppm (mg/kg)
  targetP: number; // ppm
  targetK: number; // ppm
  notes: string;
  organicAdvice: string;
  dangerLevelN: number; // upper tolerance limits
  dangerLevelP: number;
  dangerLevelK: number;
}

const CROP_DATABASE: CropNutrientProfile[] = [
  {
    id: 'crop-corn',
    name: 'Field Corn (Maize)',
    category: 'Cereal Grain',
    targetN: 180,
    targetP: 45,
    targetK: 160,
    notes: 'Corn is a heavy feeder of Nitrogen. Optimal application is split-application (starter plus side-dress during V5-V6 vegetative phase). Avoid single heavy pre-plant dumps to minimize leaching.',
    organicAdvice: 'Incorporate well-rotted poultry manure (high in N) or alfalfa meal 3 weeks prior to planting. Cover cropping with hairy vetch prefix is highly recommended.',
    dangerLevelN: 260,
    dangerLevelP: 80,
    dangerLevelK: 250
  },
  {
    id: 'crop-wheat',
    name: 'Winter Wheat',
    category: 'Cereal Grain',
    targetN: 130,
    targetP: 35,
    targetK: 130,
    notes: 'Wheat requires modest early season Nitrogen, followed by a top-dress at early jointing stage. Excessive Nitrogen increases risk of crop lodging (falling over) and powdery mildew vulnerability.',
    organicAdvice: 'Utilize high-quality vermicompost and fish hydrolysate during early tillering to increase grain protein levels without burning secondary roots.',
    dangerLevelN: 200,
    dangerLevelP: 70,
    dangerLevelK: 200
  },
  {
    id: 'crop-soybeans',
    name: 'Soybeans',
    category: 'Legumes',
    targetN: 40,
    targetP: 35,
    targetK: 140,
    notes: 'Soybeans form active symbiotic relationships with rhizobia bacteria for biological Nitrogen fixation. Thus, soil Nitrogen targets are low; however, Potassium reserves must be high to sustain pod structural density.',
    organicAdvice: 'Inoculate seed with Bradyrhizobium bacteria. Amend clay beds with green basalt dust and rock phosphate to supplement potassium and phosphorus naturally.',
    dangerLevelN: 100,
    dangerLevelP: 75,
    dangerLevelK: 220
  },
  {
    id: 'crop-potatoes',
    name: 'Russet Potatoes',
    category: 'Tubers',
    targetN: 150,
    targetP: 60,
    targetK: 200,
    notes: 'Tubers are highly potassium-demanding for starch synthesis and translocation. Ensure Phosphorus is highly bio-available in early stages to encourage rich root branching and initial stolon development.',
    organicAdvice: 'Incorporate steamed bone meal for slow-release phosphorus, alongside organic kelp meal or sulfate of potash-magnesia (sul-po-mag) for potassium boost.',
    dangerLevelN: 220,
    dangerLevelP: 100,
    dangerLevelK: 300
  },
  {
    id: 'crop-tomatoes',
    name: 'Roma Tomatoes',
    category: 'Solanaceous Fruit',
    targetN: 120,
    targetP: 50,
    targetK: 200,
    notes: 'Excessive Nitrogen favors lush green foliage growth at the expense of blossom counts. Supplement Potassium as fruit set begins to avoid blotchy ripening and ensure flavor sweetness.',
    organicAdvice: 'Apply liquid compost teas and crustacean meal. Add calcium amendments (gypsum) concurrently to ward off Blossom End Rot tied to nutrient blocks.',
    dangerLevelN: 180,
    dangerLevelP: 90,
    dangerLevelK: 280
  },
  {
    id: 'crop-rice',
    name: 'Lowland Paddy Rice',
    category: 'Wetland Grain',
    targetN: 110,
    targetP: 30,
    targetK: 110,
    notes: 'Under flooded conditions, Nitrogen converts to ammonium quickly. Split-apply fertilizer as basals, during active tillering, and during panicle initiation stages for maximum uptake efficiency.',
    organicAdvice: 'Cultivate aquatic azolla fern as a green manure companion; it hosts nitrogen-fixing cyanobacteria, cutting requirements by up to 40%.',
    dangerLevelN: 170,
    dangerLevelP: 65,
    dangerLevelK: 180
  }
];

export default function FertilizerView() {
  const [selectedCropId, setSelectedCropId] = useState<string>('crop-corn');
  
  // N-P-K user inputs (in ppm / mg per kg of dry soil)
  const [currentN, setCurrentN] = useState<number>(85);
  const [currentP, setCurrentP] = useState<number>(20);
  const [currentK, setCurrentK] = useState<number>(110);

  const [fieldArea, setFieldArea] = useState<number>(10); // acres
  const [measurementUnit, setMeasurementUnit] = useState<'lbs-acre' | 'kg-ha'>('kg-ha');

  // Interactive feedback triggers
  const [calculationTimestamp, setCalculationTimestamp] = useState<string>('');
  const [calculatorTipIndex, setCalculatorTipIndex] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Active crop profile resolver
  const activeCrop = CROP_DATABASE.find(c => c.id === selectedCropId) || CROP_DATABASE[0];

  useEffect(() => {
    // Generate simple time label when computation inputs alter
    const now = new Date();
    setCalculationTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [selectedCropId, currentN, currentP, currentK, fieldArea, measurementUnit]);

  // Calibration Quick Presets
  const applyPreset = (n: number, p: number, k: number, label: string) => {
    setCurrentN(n);
    setCurrentP(p);
    setCurrentK(k);
  };

  const tipsList = [
    "Always pull 6 to 8 soil core samples at a depth of 6-8 inches per sector to get an accurate average NPK reading.",
    "Applying nitrogen during strong rain risks significant nutrient run-off into local waterways or deep aquifer leaching.",
    "Soil pH actively dictates NPK availability. At pH levels below 5.5, phosphorus binds onto iron/aluminum, rendering it inaccessible.",
    "Adding organic compost over time drastically increases overall Cation Exchange Capacity (CEC), saving artificial fertilizer costs."
  ];

  // Logic Calculations:
  // Deficit in ppm = Target ppm - Current ppm
  const deficitN = Math.max(0, activeCrop.targetN - currentN);
  const deficitP = Math.max(0, activeCrop.targetP - currentP);
  const deficitK = Math.max(0, activeCrop.targetK - currentK);

  // Rule of thumb converting ppm deficit to application recommendation:
  // ppm in 0-6 inches soil depth roughly corresponds to 2 lbs per acre, or ~2.24 kg per hectare
  // Typically, to increase soil test value by 1 ppm, you need to apply more than 1 ppm nutrient due to buffering capacity and biological uptake efficiency.
  // Buffering factors: Nitrogen (needs ~2x applied), Phosphorus (needs ~4.5x applied due to fixation), Potassium (needs ~1.8x applied)
  const multiplierUnit = measurementUnit === 'kg-ha' ? 2.24 : 2.0;

  const reqNutrientN = Math.round(deficitN * 1.8 * multiplierUnit * 10) / 10;
  const reqNutrientP = Math.round(deficitP * 4.0 * multiplierUnit * 10) / 10;
  const reqNutrientK = Math.round(deficitK * 1.5 * multiplierUnit * 10) / 10;

  // Commercial synthetic fertilizer blend solutions mapping
  // We recommend: 
  // 1. Urea (46% Nitrogen)
  // 2. DAP (Diammonium Phosphate: 18% N, 46% P₂O₅)
  // 3. Muriate of Potash (MOP: 60% K₂O)
  // Let's resolve the exact products needed to fulfill the targets:
  // Step A: Calculate DAP required to fulfill Phosphorus deficiency. DAP delivers P and N.
  // DAP is 46% P2O5. To yield 1 unit of actual P, we need: reqNutrientP / 0.46
  const dapRequired = reqNutrientP > 0 ? Math.round((reqNutrientP / 0.46) * 10) / 10 : 0;
  // DAP also yields 18% actual N. Count credit:
  const nitrogenCreditFromDAP = Math.round((dapRequired * 0.18) * 10) / 10;

  // Step B: Calculate Urea required to cover remaining Nitrogen deficit.
  const netNitrogenNeeded = Math.max(0, reqNutrientN - nitrogenCreditFromDAP);
  // Urea is 46% actual N.
  const ureaRequired = netNitrogenNeeded > 0 ? Math.round((netNitrogenNeeded / 0.46) * 10) / 10 : 0;

  // Step C: Potassium via MOP (60% K2O).
  const mopRequired = reqNutrientK > 0 ? Math.round((reqNutrientK / 0.60) * 10) / 10 : 0;

  // Total application weighs for the current field area
  const unitLabel = measurementUnit === 'kg-ha' ? 'kg' : 'lbs';
  const totalUreaText = (ureaRequired * fieldArea).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const totalDAPText = (dapRequired * fieldArea).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const totalMOPText = (mopRequired * fieldArea).toLocaleString(undefined, { maximumFractionDigits: 1 });

  const totalFertilizerAppliedWeightPerUnit = Math.round((ureaRequired + dapRequired + mopRequired) * 10) / 10;
  const grandTotalAllBagsWeight = Math.round((ureaRequired + dapRequired + mopRequired) * fieldArea);

  const printReport = () => {
    window.print();
  };

  const copyToClipboard = () => {
    const textToCopy = `Agronomic Soil NPK Plan - ${activeCrop.name}
Generated at: 2026-05-24
Current Soil State: N: ${currentN}ppm, P: ${currentP}ppm, K: ${currentK}ppm
Target Levels: N: ${activeCrop.targetN}ppm, P: ${activeCrop.targetP}ppm, K: ${activeCrop.targetK}ppm
Deficits resolved: N: ${deficitN}ppm, P: ${deficitP}ppm, K: ${deficitK}ppm

Application Recommendations per Acre/Hectare (${measurementUnit === 'kg-ha' ? 'kg/hectare' : 'lbs/acre'}):
- Actual N required: ${reqNutrientN}
- Actual P required: ${reqNutrientP}
- Actual K required: ${reqNutrientK}

Commercial Product Selection for ${fieldArea} total acres:
- Urea (46-0-0): ${totalUreaText} ${unitLabel}
- DAP (18-46-0): ${totalDAPText} ${unitLabel}
- Muriate of Potash (0-0-60): ${totalMOPText} ${unitLabel}
- Estimated Total Weight: ${grandTotalAllBagsWeight.toLocaleString()} ${unitLabel}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6" id="fertilizer-calculator-view">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Calculator className="text-emerald-600 h-8 w-8" /> Nutrient Fertilizer Calculator
          </h1>
          <p className="text-gray-500 font-body-md mt-1">
            Input soil test outputs and crop targets to compute exact fertilizer application rates, product blends, and split-timeline schedules.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto" id="calculator-quick-options">
          <button 
            type="button"
            id="btn-copy-plan"
            onClick={copyToClipboard}
            className="flex-1 md:flex-none border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check size={13} className={copiedNotification ? "text-emerald-600 animate-bounce" : "text-slate-400"} />
            {copiedNotification ? 'Plan Copied!' : 'Copy Plan Data'}
          </button>
          
          <button 
            type="button"
            id="btn-print-report"
            onClick={printReport}
            className="flex-1 md:flex-none bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer size={13} className="text-slate-500" /> Print Summary
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column Left: Input parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 bg-white border border-gray-200 rounded-2xl space-y-5 shadow-xs">
            
            {/* Header section option */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sprout size={16} className="text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">1. Select Target Crop</h3>
            </div>

            {/* Crop selection select drop */}
            <div className="space-y-1.5">
              <label htmlFor="crop-select" className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Agricultural Variable</label>
              <select
                id="crop-select"
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-3 cursor-pointer outline-none focus:border-emerald-500 transition-colors"
              >
                {CROP_DATABASE.map(crop => (
                  <option key={crop.id} value={crop.id}>{crop.name} ({crop.category})</option>
                ))}
              </select>
            </div>

            {/* Target Area and units */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label htmlFor="field-area-input" className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Field Size</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <input
                    id="field-area-input"
                    type="number"
                    min="1"
                    max="500"
                    value={fieldArea}
                    onChange={(e) => setFieldArea(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-transparent text-xs w-full focus:outline-none font-bold text-slate-800"
                  />
                  <span className="text-[9px] text-gray-400 font-bold uppercase pl-1 font-mono">Acres</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Dosage Unit</label>
                <div className="flex gap-1.5 bg-slate-100 p-1.2 rounded-xl h-[42px] items-center">
                  <button
                    type="button"
                    onClick={() => setMeasurementUnit('kg-ha')}
                    className={`flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg transition-all cursor-pointer ${
                      measurementUnit === 'kg-ha' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    kg/ha
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasurementUnit('lbs-acre')}
                    className={`flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg transition-all cursor-pointer ${
                      measurementUnit === 'lbs-acre' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    lb/ac
                  </button>
                </div>
              </div>
            </div>

            {/* Preset shortcuts section */}
            <div className="space-y-2 pt-2 border-t border-dashed border-slate-100">
              <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase font-mono">Quick Calibration Presets</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset(25, 8, 55, 'Sandy Arid')}
                  className="text-[9.5px] font-semibold px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer transition-all"
                >
                  🌾 Depleted Arid (Low NPK)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(120, 15, 90, 'Average Clay')}
                  className="text-[9.5px] font-semibold px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer transition-all"
                >
                  🪵 Average Clay (Medium P)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(170, 38, 140, 'Balanced Organic')}
                  className="text-[9.5px] font-semibold px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer transition-all"
                >
                  🍃 Balanced Loam (High NPK)
                </button>
              </div>
            </div>

          </div>

          {/* Environmental Soil Test Card */}
          <div className="glass-panel p-5 bg-white border border-gray-200 rounded-2xl space-y-5 shadow-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FlaskConical size={16} className="text-emerald-700" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">2. Current Soil Saturation</h3>
              </div>
              <span className="text-[9px] text-gray-400 font-mono">PPM Levels (mg/kg)</span>
            </div>

            {/* Slider Nitrogen input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono text-gray-600">
                <label htmlFor="current-n-input" className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                  Nitrogen (N)
                </label>
                <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">{currentN} ppm</span>
              </div>
              <input
                id="current-n-input"
                type="range"
                min="0"
                max={Math.max(250, activeCrop.targetN + 30)}
                value={currentN}
                onChange={(e) => setCurrentN(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 accent-orange-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                <span>0 ppm (Deficient)</span>
                <span>Opt. Target: {activeCrop.targetN} ppm</span>
              </div>
            </div>

            {/* Slider Phosphorus input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono text-gray-600">
                <label htmlFor="current-p-input" className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Phosphorus (P)
                </label>
                <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">{currentP} ppm</span>
              </div>
              <input
                id="current-p-input"
                type="range"
                min="0"
                max={Math.max(80, activeCrop.targetP + 20)}
                value={currentP}
                onChange={(e) => setCurrentP(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 accent-emerald-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                <span>0 ppm (Critically Low)</span>
                <span>Opt. Target: {activeCrop.targetP} ppm</span>
              </div>
            </div>

            {/* Slider Potassium input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono text-gray-600">
                <label htmlFor="current-k-input" className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                  Potassium (K)
                </label>
                <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">{currentK} ppm</span>
              </div>
              <input
                id="current-k-input"
                type="range"
                min="0"
                max={Math.max(260, activeCrop.targetK + 40)}
                value={currentK}
                onChange={(e) => setCurrentK(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 accent-sky-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                <span>0 ppm (Arid Soil)</span>
                <span>Opt. Target: {activeCrop.targetK} ppm</span>
              </div>
            </div>

          </div>

          {/* Quick Informative Info Card */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex items-start gap-3 shadow-xs">
            <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-[11px] text-amber-800 uppercase tracking-widest font-mono">Agronomist Reminder</h4>
              <p className="text-slate-600 text-xs mt-1 leading-normal">
                Avoid over-applying nitrogen on grain legumes like {CROP_DATABASE[2].name}. Excess soil N blocks organic microbial root nodulation triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Column Right: Outputs, graphs and blender recommendations */}
        <div className="lg:col-span-8 space-y-6">

          {/* Chart & Deficiency Indicators Card */}
          <div className="glass-panel p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm" id="calcs-visualization-panel">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">NPK Soil Saturation vs Optimal Benchmarks</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Soil Calibration Frame Auto-rebuilt: <strong>{calculationTimestamp || "LIVE"}</strong>
              </span>
            </div>

            {/* Micro comparison metrics bento-block widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* N Column status */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-500 font-mono">NITROGEN (N) STATUS</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 font-sans">{currentN}</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ {activeCrop.targetN} ppm</span>
                </div>
                {deficitN > 0 ? (
                  <span className="text-[9.5px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded block text-center uppercase tracking-widest font-mono">
                    Deficiency: -{deficitN} ppm
                  </span>
                ) : (
                  <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block text-center uppercase tracking-widest font-mono">
                    Optimal/Sufficient
                  </span>
                )}
              </div>

              {/* P Column status */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-500 font-mono">PHOSPHORUS (P) STATUS</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 font-sans">{currentP}</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ {activeCrop.targetP} ppm</span>
                </div>
                {deficitP > 0 ? (
                  <span className="text-[9.5px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded block text-center uppercase tracking-widest font-mono">
                    Deficiency: -{deficitP} ppm
                  </span>
                ) : (
                  <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block text-center uppercase tracking-widest font-mono">
                    Optimal/Sufficient
                  </span>
                )}
              </div>

              {/* K Column status */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-500 font-mono">POTASSIUM (K) STATUS</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-800 font-sans">{currentK}</span>
                  <span className="text-[10px] text-slate-400 font-mono">/ {activeCrop.targetK} ppm</span>
                </div>
                {deficitK > 0 ? (
                  <span className="text-[9.5px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded block text-center uppercase tracking-widest font-mono">
                    Deficiency: -{deficitK} ppm
                  </span>
                ) : (
                  <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded block text-center uppercase tracking-widest font-mono">
                    Optimal/Sufficient
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Comparison SVG Graph */}
            <div className="pt-2 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-bold block mb-4">Nutrient Concentration Benchmark Chart</span>
              <div className="space-y-4">
                {/* Nitrogen row bar comparison */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Nitrogen (N)</span>
                    <span className="text-gray-400 font-mono">
                      Current <strong className="text-slate-800">{currentN} ppm</strong> vs. Target {activeCrop.targetN} ppm
                    </span>
                  </div>
                  <div className="h-6 w-full bg-slate-105 rounded-lg overflow-hidden relative flex items-center border border-slate-200/50">
                    {/* Target marker line */}
                    <div 
                      className="absolute top-0 bottom-0 border-r-2 border-slate-500 border-dashed z-10"
                      style={{ left: `${Math.min(100, (activeCrop.targetN / Math.max(250, activeCrop.targetN + 30)) * 100)}%` }}
                    ></div>
                    {/* Current overlay bar */}
                    <div 
                      className="h-full bg-orange-500/80 transition-all duration-500 rounded-r-md" 
                      style={{ width: `${Math.min(100, (currentN / Math.max(250, activeCrop.targetN + 30)) * 100)}%` }}
                    ></div>
                    {/* Excess alert overlay */}
                    {currentN > activeCrop.dangerLevelN && (
                      <div className="absolute right-2 px-1.5 py-0.5 bg-red-650 text-white font-mono text-[8px] uppercase font-extrabold rounded">Soil Toxicity Warning</div>
                    )}
                  </div>
                </div>

                {/* Phosphorus row bar comparison */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Phosphorus (P)</span>
                    <span className="text-gray-400 font-mono">
                      Current <strong className="text-slate-800">{currentP} ppm</strong> vs. Target {activeCrop.targetP} ppm
                    </span>
                  </div>
                  <div className="h-6 w-full bg-slate-105 rounded-lg overflow-hidden relative flex items-center border border-slate-200/50">
                    {/* Target marker line */}
                    <div 
                      className="absolute top-0 bottom-0 border-r-2 border-slate-500 border-dashed z-10"
                      style={{ left: `${Math.min(100, (activeCrop.targetP / Math.max(80, activeCrop.targetP + 20)) * 100)}%` }}
                    ></div>
                    {/* Current overlay bar */}
                    <div 
                      className="h-full bg-emerald-500/80 transition-all duration-500 rounded-r-md" 
                      style={{ width: `${Math.min(100, (currentP / Math.max(80, activeCrop.targetP + 20)) * 100)}%` }}
                    ></div>
                    {/* Excess alert overlay */}
                    {currentP > activeCrop.dangerLevelP && (
                      <div className="absolute right-2 px-1.5 py-0.5 bg-red-650 text-white font-mono text-[8px] uppercase font-extrabold rounded">Heavy Phosphorus Load</div>
                    )}
                  </div>
                </div>

                {/* Potassium row bar comparison */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Potassium (K)</span>
                    <span className="text-gray-400 font-mono">
                      Current <strong className="text-slate-800">{currentK} ppm</strong> vs. Target {activeCrop.targetK} ppm
                    </span>
                  </div>
                  <div className="h-6 w-full bg-slate-105 rounded-lg overflow-hidden relative flex items-center border border-slate-200/50">
                    {/* Target marker line */}
                    <div 
                      className="absolute top-0 bottom-0 border-r-2 border-slate-500 border-dashed z-10"
                      style={{ left: `${Math.min(100, (activeCrop.targetK / Math.max(260, activeCrop.targetK + 40)) * 100)}%` }}
                    ></div>
                    {/* Current overlay bar */}
                    <div 
                      className="h-full bg-sky-500/80 transition-all duration-500 rounded-r-md" 
                      style={{ width: `${Math.min(100, (currentK / Math.max(260, activeCrop.targetK + 40)) * 100)}%` }}
                    ></div>
                    {/* Excess alert overlay */}
                    {currentK > activeCrop.dangerLevelK && (
                      <div className="absolute right-2 px-1.5 py-0.5 bg-red-650 text-white font-mono text-[8px] uppercase font-extrabold rounded">High Salinity Blockage</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart legend guide indicators */}
              <div className="mt-3.5 flex justify-between border-t border-slate-200/60 pt-2.5 text-[9px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded bg-slate-400 inline-block"></span> ── Dashed Line Represents Ideal Target Benchmark limit
                </span>
                <span>Values scaled relative to dry soil weight density ratios</span>
              </div>
            </div>

          </div>

          {/* Core Fertilizer Application Solution */}
          <div className="glass-panel p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm" id="blender-solution-matrix">
            
            <div className="flex items-center gap-2 pb-3 border-b border-gray-150">
              <Scale size={16} className="text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">3. Commercial Product Blend Recipe Recommendation</h3>
            </div>

            {/* Total Area summary strip */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-500/10 rounded-xl flex items-center justify-between text-xs">
              <p className="text-slate-700">
                Calculations dialed in for <strong className="text-emerald-900 font-black">{fieldArea} Acres</strong> total area using <strong className="text-emerald-900">{measurementUnit === 'kg-ha' ? 'Kilograms per Hectare' : 'Pounds per Acre'}</strong> rate metrics.
              </p>
              <span className="text-[10px] uppercase font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {totalFertilizerAppliedWeightPerUnit} {measurementUnit === 'kg-ha' ? 'kg/ha' : 'lbs/ac'} total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Product 1: Urea */}
              <div className="p-4 border border-slate-150 rounded-xl space-y-3 flex flex-col justify-between hover:bg-slate-50/30 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-mono">Urea (46-0-0)</span>
                    <span className="text-[8.5px] font-mono text-gray-400">Nitrogen feeder</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs mt-2.5">Nitrate Supplement Plan</h4>
                  <p className="text-[11px] text-gray-500 mt-1 font-body leading-relaxed">
                    Provides pure organic-bound amine nitrogen values. Absorbs swiftly in warm soils.
                  </p>
                </div>
                
                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-gray-400 font-mono block">Acres Gross Weight</span>
                    <span className="text-base font-extrabold text-slate-800">{totalUreaText} <span className="text-xs font-medium text-slate-500">{unitLabel}</span></span>
                  </div>
                  <span className="text-[9.5px] font-semibold text-slate-600 pb-0.5 uppercase font-mono">{ureaRequired} {measurementUnit === 'kg-ha' ? 'kg/ha' : 'lbs/ac'}</span>
                </div>
              </div>

              {/* Product 2: DAP */}
              <div className="p-4 border border-slate-150 rounded-xl space-y-3 flex flex-col justify-between hover:bg-slate-50/30 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">DAP (18-46-0)</span>
                    <span className="text-[8.5px] font-mono text-gray-400">Phosphate source</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs mt-2.5">Phosphoric Acid Mix</h4>
                  <p className="text-[11px] text-gray-500 mt-1 font-body leading-relaxed">
                    Delivers highly soluble phosphorus plus starter ammonium. Drives robust rooting shoots.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-gray-400 font-mono block">Acres Gross Weight</span>
                    <span className="text-base font-extrabold text-slate-800">{totalDAPText} <span className="text-xs font-medium text-slate-500">{unitLabel}</span></span>
                  </div>
                  <span className="text-[9.5px] font-semibold text-slate-600 pb-0.5 uppercase font-mono">{dapRequired} {measurementUnit === 'kg-ha' ? 'kg/ha' : 'lbs/ac'}</span>
                </div>
              </div>

              {/* Product 3: Muriate of Potash */}
              <div className="p-4 border border-slate-150 rounded-xl space-y-3 flex flex-col justify-between hover:bg-slate-50/30 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-mono">MOP (0-0-60)</span>
                    <span className="text-[8.5px] font-mono text-gray-400">Potassium chloride</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs mt-2.5">Potassic Mineral Base</h4>
                  <p className="text-[11px] text-gray-500 mt-1 font-body leading-relaxed">
                    Provides water-soluble potassium. Essential to control leaf turgor and build fiber weight.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-gray-400 font-mono block">Acres Gross Weight</span>
                    <span className="text-base font-extrabold text-slate-800">{totalMOPText} <span className="text-xs font-medium text-slate-500">{unitLabel}</span></span>
                  </div>
                  <span className="text-[9.5px] font-semibold text-slate-600 pb-0.5 uppercase font-mono">{mopRequired} {measurementUnit === 'kg-ha' ? 'kg/ha' : 'lbs/ac'}</span>
                </div>
              </div>

            </div>

            {/* Total Bags Weight summary box */}
            <div className="p-4 bg-slate-900 border border-slate-950 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display-lg text-xs uppercase tracking-wider font-extrabold text-slate-300">Agricultural Application Aggregate Weight</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Estimated weight needed for <strong>{fieldArea} Acres</strong> of {activeCrop.name} crops. Correct calibration assumes broadcast spreader mechanics.
                  </p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">Field Delivery Gross Supply</span>
                <span className="text-2xl font-black text-emerald-400">{grandTotalAllBagsWeight.toLocaleString()} <span className="text-xs font-medium">{unitLabel}</span></span>
              </div>
            </div>

          </div>

          {/* Split Scheduling Application Timeline */}
          <div className="glass-panel p-5 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm" id="scheduling-split-timeline">
            
            <div className="flex items-center gap-2 pb-3 border-b border-gray-150">
              <Layers size={16} className="text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Optimal Split-Dose Timeline Planner</h3>
            </div>

            <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
              
              {/* Timeline Stage 1 */}
              <div className="relative">
                {/* Visual state pin */}
                <div className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center"></div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] uppercase font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">Stage 1: Pre-Plant Basal Dose</span>
                    <span className="text-[9.5px] text-slate-400 font-mono">At Sowing Preparation</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">Incorporate Starter Fertilizer (100% DAP + 20% Urea)</h4>
                  <p className="text-[11.5px] text-zinc-500 font-body leading-relaxed max-w-2xl">
                    Broadcasting full phosphorus (DAP) at sowing forces phosphate deep within early root layers which makes it available as primary roots emerge. Supplement minor Urea as starter nitrogen to stimulate seedling shoots.
                  </p>
                </div>
              </div>

              {/* Timeline Stage 2 */}
              <div className="relative">
                {/* Visual state pin */}
                <div className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center"></div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] uppercase font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-mono">Stage 2: Early Vegetative Growth</span>
                    <span className="text-[9.5px] text-slate-400 font-mono">2 - 4 Weeks Post-Emergence</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">First Side-Dress Top Dressing (40% Urea)</h4>
                  <p className="text-[11.5px] text-zinc-500 font-body leading-relaxed max-w-2xl">
                    Side-dress urea near active roots when plants reach rapid cell expansion stages. Ensure light soil moisture during application to encourage immediate organic mineral integration and minimize volatilization losses.
                  </p>
                </div>
              </div>

              {/* Timeline Stage 3 */}
              <div className="relative">
                {/* Visual state pin */}
                <div className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center"></div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[9px] uppercase font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md font-mono">Stage 3: Reproduction / Fruiting Set</span>
                    <span className="text-[9.5px] text-slate-400 font-mono">Onset of Flowering / Budding</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">Secondary Side-Dress (Remaining 40% Urea + 100% Potassium chloride MOP)</h4>
                  <p className="text-[11.5px] text-zinc-500 font-body leading-relaxed max-w-2xl">
                    Apply remaining nitrogen alongside total potassium (MOP). Potassium boosts grain/fruit density, starch loading, and controls local leaf moisture pressure during warm summer maturation spikes.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Extra Crop Advice Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Advice panel Left */}
            <div className="glass-panel p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-slate-700">
                <BookOpen size={14} className="text-emerald-700" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider font-mono">Precision Agronomic Insights</h4>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed font-body">
                {activeCrop.notes}
              </p>
            </div>

            {/* Advice panel Right */}
            <div className="glass-panel p-4 bg-emerald-50/20 border border-emerald-500/10 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <Sparkles size={14} className="text-emerald-600" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider font-mono text-emerald-800">Organic Alternatives</h4>
              </div>
              <p className="text-[11.5px] text-emerald-905 leading-relaxed font-body">
                {activeCrop.organicAdvice}
              </p>
            </div>

          </div>

          {/* Quick random tip widget container */}
          <div className="p-4 bg-slate-100/50 border border-slate-200/50 rounded-xl flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[9px] font-bold text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
              <Info size={11} className="text-slate-400" /> Continuous Tip:
            </span>
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed flex-1 select-text">
              {tipsList[calculatorTipIndex]}
            </p>
            <button
              type="button"
              onClick={() => setCalculatorTipIndex(prev => (prev + 1) % tipsList.length)}
              className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded cursor-pointer transition-all active:scale-95 whitespace-nowrap"
            >
              Next Tip
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
