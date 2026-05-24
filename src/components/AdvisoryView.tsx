import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Wind, 
  Flame, 
  Database, 
  Droplet, 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  Scale, 
  Sprout, 
  Info, 
  Coins, 
  AlertTriangle,
  Lightbulb,
  CornerDownRight,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
  CloudRain
} from 'lucide-react';

interface CrisisScenario {
  id: string;
  name: string;
  emoji: string;
  shortDesc: string;
  icon: React.ElementType;
  warningTheme: string; // colors for highlight
  symptoms: string[];
  scientificContext: string;
  organicRemedies: string;
  wisdom: string;
}

const CRISIS_DATABASE: CrisisScenario[] = [
  {
    id: 'crisis-salinity',
    name: 'Soil Salinity (Salt Crust)',
    emoji: '🪵',
    shortDesc: 'Arid evaporation leaves poisonous white salt deposits, drying out seeds and sealing soil pores.',
    icon: Layers,
    warningTheme: 'border-amber-300 bg-amber-50/40 text-amber-900',
    symptoms: [
      'Glazed white powdery crusts appearing on dry ridge-tops',
      'Marginal leaf scorch, yellowing, and terminal leaf curl',
      'Seedlings failing to emerge despite ample watering',
      'Water pooling on the surface instead of absorbing'
    ],
    scientificContext: 'High electrical conductivity (EC) interferes with root osmotic potential. Cultivating fields with sodium adsorption ratios (SAR) > 13 prevents osmotic water uptake—causing plants to dehydrate even in fully wet soils (physiological drought).',
    organicRemedies: 'Incorporate deep green manures (like Sesbania or sweet clover), apply organic humate acids to chelate heavy ions, and add bulk agricultural gypsum to displace toxic sodium on soil particles so safe freshwater can flush it down.',
    wisdom: 'Adding heavy amounts of standard chemical fertilizers in dry, saline soil will amplify the salt index exponentially. Prioritize mulching to block topsoil evaporation and keep salts buried deeply.'
  },
  {
    id: 'crisis-frost',
    name: 'Sudden Night Frost Burn',
    emoji: '❄️',
    shortDesc: 'A rapid drop to sub-zero temperatures ruptures cell membranes, destroying spring buds, stems, and blossoms.',
    icon: Thermometer,
    warningTheme: 'border-sky-300 bg-sky-50/40 text-sky-900',
    symptoms: [
      'Delicate flower blossoms turning brown or black overnight',
      'Stems showing wet, translucent, water-soaked brown spots',
      'Leaves wilting and taking on a paper-thin, dry appearance upon sunrise',
      'Bending, cracked stalks on early-sprouted tubers'
    ],
    scientificContext: 'Ice crystal formation inside plant intercellular spaces draws water out of living cells, resulting in severe local cellular dehydration, structural cell membrane tearing, and ultimate plant tissue death.',
    organicRemedies: 'Spray liquid kelp extract (high in cytokinins) to increase plants osmoprotectant internal sugar concentrations, utilize light burlap covers, or run low-volume misting sprinklers to leverage the heat of fusion.',
    wisdom: 'Wet soils retain heat significantly better than dry loose soils. If a freeze is predicted tonight, irrigate your orchard late in the afternoon; the damp earth will absorb heat and protect low-lying leaves.'
  },
  {
    id: 'crisis-lodging',
    name: 'Crop Lodging (Wind Buckling)',
    emoji: '🌾',
    shortDesc: 'Stems of grain, rice, or corn snap or fall flat due to high winds combined with heavy, weak node growth.',
    icon: Wind,
    warningTheme: 'border-orange-300 bg-orange-50/40 text-orange-900',
    symptoms: [
      'Stalks bending flat on the ground across windward field edges',
      'Fungal mold developing inside dense, flat piles of grain plants',
      'Dramatic reduction in mechanical combine harvesting efficiency',
      'Overly lush, dark green foliage but thin, brittle, watery lower stalks'
    ],
    scientificContext: 'Excessive Nitrogen inputs speed up cell division in stalks before structural lignin can deposit. When heavy winds or rains hit the top-heavy crop canopy, the brittle lower nodes buckle under the lateral mechanical load.',
    organicRemedies: 'Amplify potassium reserves early using granite dust or sulfate of potash to form sturdy culms. Avoid applying Nitrogen in a single heavy dump; split applications instead.',
    wisdom: 'A plant forced to compete for light grows tall and brittle. Increase row spacing to allow high winds to pass through the crop easily, and encourage light to strengthen the lower nodes.'
  },
  {
    id: 'crisis-compaction',
    name: 'Soil Compaction (Hardpan)',
    emoji: '🚜',
    shortDesc: 'Heavy tractors compress soil pore space, creating a concrete-like barrier that blocks roots and water drainage.',
    icon: Wrench,
    warningTheme: 'border-zinc-300 bg-zinc-50/40 text-zinc-900',
    symptoms: [
      'Water pooling in tractor tire tracks several days after rain',
      'Roots growing sideways or horizontally at a shallow depth',
      'Stunted plant growth and localized nutrient starvation symptoms',
      'Soil resistance is too high to insert a basic probe or shovel'
    ],
    scientificContext: 'Bulk soil densities exceeding 1.6 g/cm³ physical bar root tip cell elongation. Because mechanical macropores are crushed, plant roots starve for oxygen, and methane-producing anaerobic microbes thrive.',
    organicRemedies: 'Sow deep-rooted taproot cover crops like daikon "tillage radish" to physically drill through the hardpan, restrict tractor passes to designated tramlines, and incorporate high-cellulose wheat straws.',
    wisdom: 'Never plow or tractor across muddy clay. Tillage under high soil moisture is the primary creator of subsoil plow pans. Always wait for the soil to dry to a crumbly consistency.'
  },
  {
    id: 'crisis-leaching',
    name: 'Nitrogen Leaching / Gas Loss',
    emoji: '💨',
    shortDesc: 'Applied chemical N gets washed into aquifers or evaporates into gas, leaving crops hungry while costing money.',
    icon: CloudRain,
    warningTheme: 'border-red-300 bg-red-50/40 text-red-900',
    symptoms: [
      'Progressive V-shaped yellowing (chlorosis) on older lower leaves first',
      'Slow, stunted crop growth despite heavy initial nitrogen top-dressing',
      'Strong gaseous ammonia odor hanging over warm fields after scattering urea',
      'Damp weather followed by heavy field drainage runoff'
    ],
    scientificContext: 'Chemical urea scattered onto warm, moist soil surface is enzymatically broken down by soil urease into ammonia gas, which easily volatilizes. Liquid nitrates carry a negative electrical charge, making them physically unable to bind with clay particles, causing them to flush directly down into groundwaters during rain.',
    organicRemedies: 'Implement split application schedules (match dosage with exact vegetative cycles), mix in biochar to increase soil ion retention, or cover crops during wet winters to physically trap nitrate molecules.',
    wisdom: 'Throwing urea directly on dry ground on a hot sunny day is equivalent to throwing cash into the wind. Always incorporate fertilizer into the top 2 inches of soil or time applications right before a light drizzle.'
  }
];

import { SectorStat } from '../types';

interface AdvisoryViewProps {
  sectorsData?: Record<string, SectorStat>;
}

export default function AdvisoryView({ sectorsData }: AdvisoryViewProps) {
  const [selectedCrisisId, setSelectedCrisisId] = useState<string>('crisis-salinity');
  const [selectedSectorLink, setSelectedSectorLink] = useState<string>('none');
  
  // Soil Salinity Calculator State
  const [salinityInputEC, setSalinityInputEC] = useState<number>(6.5); // dS/m
  const [salinitySoilType, setSalinitySoilType] = useState<'sandy' | 'loamy' | 'clay'>('loamy');
  const [salinityTargetEC, setSalinityTargetEC] = useState<number>(2.0);

  // Frost Solver Simulator State
  const [frostAirTemp, setFrostAirTemp] = useState<number>(-3); // °C
  const [frostWindSpeed, setFrostWindSpeed] = useState<number>(12); // km/h
  const [frostHumidity, setFrostHumidity] = useState<number>(65); // %

  // Crop Lodging Calculator State
  const [lodgingNitrogenPct, setLodgingNitrogenPct] = useState<number>(180); // kg/ha applied
  const [lodgingPotassiumPct, setLodgingPotassiumPct] = useState<number>(60); // kg/ha applied
  const [lodgingCropHeight, setLodgingCropHeight] = useState<number>(110); // cm

  // Soil Compaction State
  const [compactionBulkDensity, setCompactionBulkDensity] = useState<number>(1.65); // g/cm³
  const [compactionClayContent, setCompactionClayContent] = useState<number>(35); // %

  // Nitrogen Loss State
  const [nLossUreaRate, setNLossUreaRate] = useState<number>(200); // kg/ha
  const [nLossIncorporated, setNLossIncorporated] = useState<'unincorporated' | 'incorporated'>('unincorporated');
  const [nLossSoilTemp, setNLossSoilTemp] = useState<number>(28); // °C

  // General Field Area (re-usable)
  const [fieldSize, setFieldSize] = useState<number>(10);

  // Automatically sync calculator state values with physical sensors when linked
  useEffect(() => {
    if (!sectorsData || selectedSectorLink === 'none') return;
    
    const linkedData = sectorsData[selectedSectorLink];
    if (!linkedData) return;

    // Link Soil Salinity input EC (simulated drift base)
    const baseEC = selectedSectorLink === 'Sector Alpha' ? 4.2 : selectedSectorLink === 'Sector Beta' ? 7.2 : 3.1;
    const finalEC = +(baseEC + (linkedData.soilMoisture - 40) * 0.1).toFixed(1);
    setSalinityInputEC(Math.max(2.0, Math.min(16.0, finalEC)));

    // Link Frost Air Temperature to Rounded temperature shifted to sub-zero
    const targetFrostTemp = Math.min(0, Math.round(linkedData.temperature - 27.5));
    setFrostAirTemp(targetFrostTemp);
    setFrostHumidity(linkedData.humidity);

    // Link Nitrogen Loss surface temperature directly to sensor telemetry
    setNLossSoilTemp(Math.round(linkedData.temperature));

    // Link Crop Lodging average stalk height simulated drift
    const baseLodgingN = selectedSectorLink === 'Sector Alpha' ? 140 : selectedSectorLink === 'Sector Beta' ? 220 : 110;
    setLodgingNitrogenPct(baseLodgingN);
    const linkedSoilMoist = linkedData.soilMoisture;
    const computedStalkH = Math.round(90 + (linkedSoilMoist - 35) * 2.5);
    setLodgingCropHeight(Math.max(40, Math.min(180, computedStalkH)));

    // Link Soil Compaction Bulk Density to soil moisture inverse
    const bulkD = +(1.85 - (linkedSoilMoist / 150)).toFixed(2);
    setCompactionBulkDensity(Math.max(1.15, Math.min(1.85, bulkD)));

  }, [sectorsData, selectedSectorLink]);

  // Active crop selector
  const activeCrisis = CRISIS_DATABASE.find(c => c.id === selectedCrisisId) || CRISIS_DATABASE[0];

  // Calculations for Soil Salinity Gypsum Requirement
  // Gypsum (CaSO4) needed to drop EC.
  // Standard agronomic formula estimates that sand needs less gypsum, clay needs significantly more due to high cation exchange capacity (CEC).
  const calculateSalinityTreatment = () => {
    const ecDiff = Math.max(0, salinityInputEC - salinityTargetEC);
    if (ecDiff === 0) return { gypsumNeededPerAcre: 0, totalGypsumBags: 0, flushWaterNeeded: 0 };
    
    let multiplier = 0.35; // sandy
    if (salinitySoilType === 'loamy') multiplier = 0.75;
    if (salinitySoilType === 'clay') multiplier = 1.35;

    const tonsPerAcre = Math.round(ecDiff * multiplier * 10) / 10;
    // 1 ton = 1000kg. bags of 50kg -> 20 bags per ton
    const totalBags = Math.ceil(tonsPerAcre * 20 * fieldSize);

    // Irrigation fraction needed to flush salts down below 3-foot zone:
    // Roughly 6 inch depth per dS/m reduction
    const depthOfIrrigationWaterInches = Math.round(ecDiff * 1.5 * 10) / 10;

    return {
      gypsumNeededPerAcre: tonsPerAcre,
      totalGypsumBags: totalBags,
      flushWaterNeeded: depthOfIrrigationWaterInches
    };
  };

  // Calculations for Frost Sprinkler Protective Output
  // Minimum required water spray rate (mm/ha/hr) to release enough latent heat of fusion.
  const calculateFrostTreatment = () => {
    // Basic thermal release formula: Sprinkler output increases as air temperature drops and wind speed rises
    const tempDrop = Math.max(0, 0 - frostAirTemp);
    if (tempDrop === 0) return { sprinklerRate: 0, fuelBurnRate: 0, protectiveIceThickness: 0 };

    // Sprinkler rate (mm/hr) roughly = tempDrop * (1 + windSpeed / 15) * 0.8
    const rate = Math.round(tempDrop * (1 + frostWindSpeed / 12) * 0.7 * 10) / 10;
    const waterRate = Math.max(2.0, rate);

    // Direct heat burner fuel estimate (liters/hour/hectare) for clean orchard heaters
    const fuel = Math.round(tempDrop * 6.5 * (1 + frostWindSpeed / 20));

    // Anticipated protective ice layer thickness (mm)
    const iceThickness = Math.round(tempDrop * 0.8 * 10) / 10;

    return {
      sprinklerRate: waterRate,
      fuelBurnRate: fuel,
      protectiveIceThickness: Math.min(25, Math.max(1, iceThickness))
    };
  };

  // Calculations for Crop Lodging Risk Assessment
  const calculateLodgingRisk = () => {
    // Excessive nitrogen makes things tall and watery, while potassium adds cell lignin.
    // Optimal N:K ratios should be around 1.5 : 1 or less. High ratio means high susceptibility.
    const pot = Math.max(5, lodgingPotassiumPct);
    const nKRatio = lodgingNitrogenPct / pot;
    
    // Risk score out of 100
    // Factors: heavy nitrogen ratio (weight 55%), height factor (weight 45%)
    let score = Math.round((nKRatio / 4) * 55 + (lodgingCropHeight / 150) * 45);
    score = Math.min(100, Math.max(5, score));

    let riskLevel = 'Low Risk';
    let alertColor = 'text-emerald-600 bg-emerald-50';
    if (score > 40) {
      riskLevel = 'Moderate Risk';
      alertColor = 'text-amber-600 bg-amber-50';
    }
    if (score > 70) {
      riskLevel = 'Severe Node Weakness';
      alertColor = 'text-red-600 bg-red-50';
    }

    // Recommended Potassium correction rate (kg/ha) to balance cell wall thickness
    const suggestedKCorrection = Math.max(0, Math.round(lodgingNitrogenPct * 0.8 - lodgingPotassiumPct));

    return {
      score,
      riskLevel,
      alertColor,
      suggestedKCorrection
    };
  };

  // Calculations for Soil Compaction Mechanical Depth Guide
  const calculateCompactionSolution = () => {
    // Normal bulk density is 1.1 - 1.4 g/cm³. Values above 1.5 start to restrict roots.
    // Hard clay amplifies bulk density resistance at smaller values than sand.
    const excessCompaction = Math.max(0, compactionBulkDensity - 1.35);
    if (excessCompaction === 0) return { subsoilDepthCm: 0, riskLabel: 'Minimal', daikonSeedsKg: 0 };

    // Deep ripping mechanical shear depth target:
    let depth = Math.round(30 + excessCompaction * 140);
    if (compactionClayContent > 40) depth += 12; // requires deeper shear in clay soils

    const subsoilDepthCm = Math.min(85, depth);

    let riskLabel = 'Optimal Permeability';
    if (compactionBulkDensity > 1.5) riskLabel = 'Moderate Clog';
    if (compactionBulkDensity > 1.7) riskLabel = 'Lethal Root Block';

    // Radish cover crop seed count (kg/ha needed to establish bio-drill pores)
    const seedKgHa = Math.round(12 + (compactionBulkDensity - 1.4) * 30);
    const totalSeedsKg = Math.round(seedKgHa * fieldSize * 0.4046); // fieldSize acres -> hectares is roughly 0.4

    return {
      subsoilDepthCm,
      riskLabel,
      daikonSeedsKg: Math.max(3, totalSeedsKg)
    };
  };

  // Calculations for Nitrogen Loss Percentage
  const calculateNLoss = () => {
    // Urea scattered on surface loses nitrogen through volatilization as ammonia gas.
    // Loss is high on warm soils, high pH (alkaline soil), and surface application.
    let baseLossPct = 5.0; // inherent biological conversion
    
    if (nLossIncorporated === 'unincorporated') {
      baseLossPct += 15.0;
      // Multiplied by temp index
      if (nLossSoilTemp > 20) {
        baseLossPct += (nLossSoilTemp - 20) * 1.4;
      }
    } else {
      // incorporated
      baseLossPct += (nLossSoilTemp - 20) * 0.3;
    }

    const lossPercentage = Math.round(Math.min(55, Math.max(3, baseLossPct)));
    
    // Financial loss calculation (estimating urea cost at $0.48 per kg)
    const wastedKg = Math.round(nLossUreaRate * (lossPercentage / 100) * fieldSize);
    const wastedMoney = Math.round(wastedKg * 0.48);

    return {
      lossPercentage,
      wastedKg,
      wastedMoney
    };
  };

  // Resolve calculation UI components dynamically
  const salinityResults = calculateSalinityTreatment();
  const frostResults = calculateFrostTreatment();
  const lodgingResults = calculateLodgingRisk();
  const compactionResults = calculateCompactionSolution();
  const nLossResults = calculateNLoss();

  return (
    <div className="space-y-6" id="farmer-crisis-advisory-workspace">
      
      {/* Visual Header Grid Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-950 rounded-2xl p-6 text-white shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-zinc-100 pointer-events-none">
          <ShieldAlert size={120} />
        </div>

        <div className="relative max-w-3xl space-y-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
            Interactive Advisory Workspace
          </span>
          <h1 className="text-3xl font-display-lg font-extrabold tracking-tight">
            Agronomic Risk Mitigation Hub
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Agricultural life is defined by sudden challenges—excessive soil salts, crop buckling, sudden overnight freezes, and fertilizer evaporation. Use this dedicated workbench to input farm metadata and calculate exact, mathematically models for immediate field protection support.
          </p>
        </div>
      </div>

      {/* Main Grid: Left tabs of problems, Right calculators & advice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 5 main crises tabs cards */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-wider block mb-2 px-1">
              Identify Current Soil & Crop Threats
            </span>
            <div className="space-y-2">
              {CRISIS_DATABASE.map(crisis => {
                const isSelected = selectedCrisisId === crisis.id;
                const CrisisIcon = crisis.icon;
                return (
                  <button
                    key={crisis.id}
                    onClick={() => setSelectedCrisisId(crisis.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow shadow-emerald-600/10' 
                        : 'bg-white border-gray-150 hover:bg-slate-50 hover:border-gray-300 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-emerald-700'}`}>
                      <CrisisIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-bold leading-tight truncate">{crisis.name}</span>
                        <span className="text-xs">{crisis.emoji}</span>
                      </div>
                      <p className={`text-[10px] mt-1 leading-snug line-clamp-2 ${isSelected ? 'text-emerald-100' : 'text-slate-450'}`}>
                        {crisis.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick field dimension selector */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Scale size={15} className="text-emerald-600" />
              <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">Configure Field Metrics</h4>
            </div>
            <p className="text-[10.5px] text-gray-500 leading-normal">
              Calculators below will automatically calibrate chemical doses, bag quantities, and water rates matching this workspace acreage value.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="risk-field-input" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Workspace Acreage</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <input
                  id="risk-field-input"
                  type="number"
                  min="1"
                  max="500"
                  value={fieldSize}
                  onChange={(e) => setFieldSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-transparent text-xs w-full font-bold text-slate-800 outline-none"
                />
                <span className="text-[10px] font-black text-slate-400 font-mono uppercase pl-1.5">Acres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed analysis, dynamic workbench, preventative planner */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Crisis Core Info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-xl font-display-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{activeCrisis.emoji}</span> {activeCrisis.name}
                </h2>
                <p className="text-slate-500 text-xs mt-1 max-w-xl">
                  {activeCrisis.shortDesc}
                </p>
              </div>
              <div className={`border p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${activeCrisis.warningTheme} max-w-xs`}>
                <AlertTriangle size={15} className="flex-shrink-0" />
                <span>Agronomic Threat Priority: High</span>
              </div>
            </div>

            {/* Warn Symptoms Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" /> Key Diagnostic Field Symptoms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeCrisis.symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0 animate-pulse" />
                    <span className="text-[11px] text-slate-600 font-medium leading-relaxed select-none">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC CALCULATOR WORKBENCH (Conditionally rendered) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              
              {/* Header block tab */}
              <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white border-b border-slate-950">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-emerald-400" />
                  <span className="text-[11px] font-black uppercase tracking-wider font-mono">Solve Scenario: Dynamic Input Workbench</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Real-time variables calibrated</span>
              </div>

              {/* 📡 Telemetry linkage strip */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[10.5px] font-bold text-slate-600 font-mono flex items-center gap-1.5 uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedSectorLink !== 'none' ? 'bg-emerald-400' : 'bg-transparent'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedSectorLink !== 'none' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                  </span>
                  IoT Telemetry Linkage
                </span>
                <div className="flex flex-wrap gap-1 bg-slate-200/60 p-1 rounded-xl border border-slate-200 font-mono text-[9.5px]">
                  {['none', 'Sector Alpha', 'Sector Beta', 'Sector Gamma'].map(l => (
                    <button
                      key={l}
                      onClick={() => setSelectedSectorLink(l)}
                      className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all whitespace-nowrap cursor-pointer select-none ${
                        selectedSectorLink === l 
                          ? 'bg-slate-800 text-white shadow-xs' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {l === 'none' ? 'Manual (Off)' : l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculator Body Option 1: Salinity */}
              {selectedCrisisId === 'crisis-salinity' && (
                <div className="p-5 bg-white space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Input A */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="salinity-current-ec">CURRENT SOIL EC</label>
                        <span className="text-slate-800">{salinityInputEC} dS/m</span>
                      </div>
                      <input
                        id="salinity-current-ec"
                        type="range"
                        min="2.0"
                        max="16.0"
                        step="0.1"
                        value={salinityInputEC}
                        onChange={(e) => setSalinityInputEC(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-emerald-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">Saline above 4.0 dS/m</span>
                    </div>

                    {/* Input B */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="salinity-target-ec">TARGET SAFE EC</label>
                        <span className="text-slate-800">{salinityTargetEC} dS/m</span>
                      </div>
                      <input
                        id="salinity-target-ec"
                        type="range"
                        min="1.0"
                        max="3.5"
                        step="0.1"
                        value={salinityTargetEC}
                        onChange={(e) => setSalinityTargetEC(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-emerald-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">Corn Tol: 1.7 dS/m</span>
                    </div>

                    {/* Input C: Soil texture dropdown */}
                    <div className="space-y-1.5">
                      <label htmlFor="salinity-soil-type" className="text-[10px] font-bold text-gray-500 font-mono uppercase">SOIL TEXTURE</label>
                      <select
                        id="salinity-soil-type"
                        value={salinitySoilType}
                        onChange={(e) => setSalinitySoilType(e.target.value as any)}
                        className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-pointer outline-none focus:border-emerald-500"
                      >
                        <option value="sandy">Coarse Sandy Soil (Low CEC)</option>
                        <option value="loamy">Medium Loamy Ground (Average)</option>
                        <option value="clay">Dense Hard Clay (High Gypsum Req)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculations Output */}
                  <div className="p-4 bg-emerald-50/40 border border-emerald-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-slate-700 font-bold text-xs flex items-center gap-1">
                        <Wrench size={13} className="text-emerald-700" /> Chemical Sodium Leaching Solution Recipe
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-md">
                        Applying calcium sulfate (gypsum) forces physical exchange of sodium. Requires an estimated <strong className="text-emerald-900">{salinityResults.flushWaterNeeded} inches</strong> of low-salinity watering to flush salts downwards.
                      </p>
                    </div>
                    <div className="text-center md:text-right bg-white p-3 border border-emerald-500/10 rounded-xl shadow-xs">
                      <span className="text-[8.5px] uppercase font-mono text-gray-450 block font-bold">Total Gypsum (50kg Bags Required)</span>
                      <span className="text-xl font-black text-emerald-800">{salinityResults.totalGypsumBags} Bags</span>
                      <span className="text-[9.5px] text-slate-400 block mt-0.5">({salinityResults.gypsumNeededPerAcre} Tons / Acre avg)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculator Body Option 2: Frost */}
              {selectedCrisisId === 'crisis-frost' && (
                <div className="p-5 bg-white space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Temp Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="frost-temper-val">FORECAST SHIFT AIR TEMP</label>
                        <span className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-xs">{frostAirTemp} °C</span>
                      </div>
                      <input
                        id="frost-temper-val"
                        type="range"
                        min="-12"
                        max="0"
                        step="1"
                        value={frostAirTemp}
                        onChange={(e) => setFrostAirTemp(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 accent-sky-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">BLOSSOM DANGER BELLOW -1.5°C</span>
                    </div>

                    {/* Wind Speed Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="frost-wind-val">CURRENT WIND SPEED</label>
                        <span className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-xs">{frostWindSpeed} km/h</span>
                      </div>
                      <input
                        id="frost-wind-val"
                        type="range"
                        min="2"
                        max="35"
                        value={frostWindSpeed}
                        onChange={(e) => setFrostWindSpeed(parseInt(e.target.value) || 5)}
                        className="w-full h-1.5 accent-sky-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">High wind spreads freeze fast</span>
                    </div>

                    {/* Protection advice note */}
                    <div className="p-3 bg-sky-50/20 border border-sky-100 rounded-xl flex items-start gap-2.5">
                      <Info size={13} className="text-sky-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-[10px] font-black text-sky-850 uppercase font-mono tracking-wider">Misting Principle</h5>
                        <p className="text-[10px] text-slate-550 leading-normal">
                          Continuous application of overhead fine water droplets deposits a shield of ice. Freezing water emits latent calories, holding the plant bud surface safely at 0°C.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calculations Output */}
                  <div className="p-4 bg-sky-50/40 border border-sky-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-slate-700 font-bold text-xs flex items-center gap-1">
                        <Droplet size={13} className="text-sky-700" /> Active Latent Energy Water Cover Rate
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-sm">
                        To defend blossoms against sudden freezes, set overhead spray speed to <strong className="text-sky-950">{frostResults.sprinklerRate} mm / hour</strong> continuously until ice thaws in morning light.
                      </p>
                    </div>
                    <div className="text-center md:text-right bg-white p-3 border border-sky-500/10 rounded-xl shadow-xs">
                      <span className="text-[8.5px] uppercase font-mono text-gray-450 block font-bold">Recommended Spray Stream</span>
                      <span className="text-xl font-black text-sky-800">{frostResults.sprinklerRate} mm/h</span>
                      <span className="text-[9.2px] text-slate-400 block mt-0.5">({frostResults.protectiveIceThickness}mm Est. Protective Ice Crust)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculator Body Option 3: Lodging */}
              {selectedCrisisId === 'crisis-lodging' && (
                <div className="p-5 bg-white space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Nitrogen Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="lodging-nitro-val">NITROGEN (N) APPLIED</label>
                        <span className="text-slate-800">{lodgingNitrogenPct} kg/ha</span>
                      </div>
                      <input
                        id="lodging-nitro-val"
                        type="range"
                        min="20"
                        max="260"
                        value={lodgingNitrogenPct}
                        onChange={(e) => setLodgingNitrogenPct(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 accent-orange-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Potassium Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="lodging-pota-val">POTASSIUM (K) APPLIED</label>
                        <span className="text-slate-800">{lodgingPotassiumPct} kg/ha</span>
                      </div>
                      <input
                        id="lodging-pota-val"
                        type="range"
                        min="0"
                        max="180"
                        value={lodgingPotassiumPct}
                        onChange={(e) => setLodgingPotassiumPct(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 accent-sky-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Stalk Height Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="lodging-height-val">AVERAGE STALK HEIGHT</label>
                        <span className="text-slate-800">{lodgingCropHeight} cm</span>
                      </div>
                      <input
                        id="lodging-height-val"
                        type="range"
                        min="40"
                        max="180"
                        value={lodgingCropHeight}
                        onChange={(e) => setLodgingCropHeight(parseInt(e.target.value) || 80)}
                        className="w-full h-1.5 accent-emerald-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculations Output */}
                  <div className="p-4 bg-orange-50/40 border border-orange-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-slate-700 font-bold text-xs flex items-center gap-1">
                        <Wind size={13} className="text-orange-700" /> Stalk Mechanical Structural Load Factor
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-sm">
                        High N values increase top weight before bottom fibers harden. Apply a side-dressing top of <strong className="text-amber-900">{lodgingResults.suggestedKCorrection} kg/ha potassium</strong> to harden wall lignin now.
                      </p>
                    </div>
                    
                    <div className="flex gap-2.5 items-center">
                      <div className="text-center bg-white p-3 border border-slate-100 rounded-xl shadow-xs">
                        <span className="text-[8px] uppercase font-mono text-gray-400 block">Lodging Probability</span>
                        <span className={`text-md font-black px-2 py-0.5 rounded block mt-1 ${lodgingResults.alertColor}`}>
                          {lodgingResults.riskLevel} ({lodgingResults.score}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculator Body Option 4: Compaction */}
              {selectedCrisisId === 'crisis-compaction' && (
                <div className="p-5 bg-white space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Bulk Density Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="compact-bulk-val">BULK SOIL DENSITY</label>
                        <span className="text-slate-800 font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">{compactionBulkDensity} g/cm³</span>
                      </div>
                      <input
                        id="compact-bulk-val"
                        type="range"
                        min="1.15"
                        max="1.85"
                        step="0.05"
                        value={compactionBulkDensity}
                        onChange={(e) => setCompactionBulkDensity(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-zinc-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">Exceeding 1.55 limits roots</span>
                    </div>

                    {/* Clay Content */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="compact-clay-val">CLAY CONTENT RATION</label>
                        <span className="text-slate-800 font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">{compactionClayContent} %</span>
                      </div>
                      <input
                        id="compact-clay-val"
                        type="range"
                        min="5"
                        max="65"
                        value={compactionClayContent}
                        onChange={(e) => setCompactionClayContent(parseInt(e.target.value) || 10)}
                        className="w-full h-1.5 accent-zinc-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">High clay forms hardpan fast</span>
                    </div>

                    {/* Field info summary */}
                    <div className="p-3 bg-zinc-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                      <Wrench size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-[10px] font-black text-slate-700 uppercase font-mono tracking-wider">Subsoiler Rationale</h5>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Deep subsoil ripping breaks the mechanical plow pan. Daikon radish roots act as natural "bio-drills" to keep the ground crumbly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calculations Output */}
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-slate-700 font-bold text-xs flex items-center gap-1">
                        <Layers size={13} className="text-zinc-700" /> Hardpan Fracture Execution Guide
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-sm">
                        To successfully break this layer, run subsoiling shank shatters at an absolute depth of <strong className="text-zinc-900">{compactionResults.subsoilDepthCm} cm</strong> when soil is thoroughly dry.
                      </p>
                    </div>
                    <div className="text-center md:text-right bg-white p-3 border border-zinc-200 rounded-xl shadow-xs">
                      <span className="text-[8.5px] uppercase font-mono text-gray-450 block font-bold">Suggested Radish Seeds</span>
                      <span className="text-xl font-black text-zinc-800">{compactionResults.daikonSeedsKg} kg</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">({compactionResults.riskLabel})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculator Body Option 5: Leaching */}
              {selectedCrisisId === 'crisis-leaching' && (
                <div className="p-5 bg-white space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Urea Rate */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="nloss-rate-val">UREA SCATTER RATE</label>
                        <span className="text-slate-800 font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">{nLossUreaRate} kg/ha</span>
                      </div>
                      <input
                        id="nloss-rate-val"
                        type="range"
                        min="50"
                        max="350"
                        value={nLossUreaRate}
                        onChange={(e) => setNLossUreaRate(parseInt(e.target.value) || 100)}
                        className="w-full h-1.5 accent-red-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Soil Temp Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500">
                        <label htmlFor="nloss-temp-val">SOIL SURFACE TEMP</label>
                        <span className="text-slate-800 font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded">{nLossSoilTemp} °C</span>
                      </div>
                      <input
                        id="nloss-temp-val"
                        type="range"
                        min="10"
                        max="42"
                        value={nLossSoilTemp}
                        onChange={(e) => setNLossSoilTemp(parseInt(e.target.value) || 20)}
                        className="w-full h-1.5 accent-red-500 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-400 block font-mono">Warm soils speed gas loss</span>
                    </div>

                    {/* Method Dropdown */}
                    <div className="space-y-1.5">
                      <label htmlFor="nloss-method-val" className="text-[10px] font-bold text-gray-500 font-mono uppercase">APPLICATION DETAILS</label>
                      <select
                        id="nloss-method-val"
                        value={nLossIncorporated}
                        onChange={(e) => setNLossIncorporated(e.target.value as any)}
                        className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 cursor-pointer outline-none focus:border-red-500"
                      >
                        <option value="unincorporated">Broadcasting (Scattered on surface)</option>
                        <option value="incorporated">Immediate Tillage Incorporation (2" deep)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculations Output */}
                  <div className="p-4 bg-red-50/40 border border-red-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-slate-700 font-bold text-xs flex items-center gap-1">
                        <Coins size={13} className="text-red-700" /> Financial & Nutrient Runoff Ledger
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-normal max-w-sm">
                        Urease enzymes volatilize scattered urea rapidly. Immediate mechanical incorporation or applying nitrification inhibitors preserves nitrogen atoms for root intake.
                      </p>
                    </div>
                    <div className="text-center md:text-right bg-white p-3 border border-red-500/10 rounded-xl shadow-xs">
                      <span className="text-[8.5px] uppercase font-mono text-gray-450 block font-bold">Estimated Loss Pct (Volatilized)</span>
                      <span className="text-xl font-black text-red-700">{nLossResults.lossPercentage} % Loss</span>
                      <span className="text-[9.2px] text-red-650 block mt-0.5">($ {nLossResults.wastedMoney} Wasted Capital / Field)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Scientific Breakdown */}
            <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800">
                <BookOpen size={15} className="text-emerald-700" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider font-mono">The Physical & Biological Mechanics</h4>
              </div>
              <p className="text-[11.5px] text-slate-655 leading-relaxed font-body">
                {activeCrisis.scientificContext}
              </p>
            </div>

            {/* Strategic Roadmap Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-600" /> Farm Recovery & Restoration Timeline Roadmap
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Stage 1 */}
                <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2.5 relative hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.0 py-0.5 rounded font-mono">Immediate (1-3 Days)</span>
                    <CornerDownRight size={13} className="text-slate-300" />
                  </div>
                  <h4 className="font-extrabold text-slate-855 text-xs">Emergency First-Aid</h4>
                  <p className="text-[10.5px] text-gray-500 leading-relaxed font-body">
                    {selectedCrisisId === 'crisis-salinity' && 'Apply high-volume gypsum amendments immediately on crust coordinates and construct surface drainage ditches.'}
                    {selectedCrisisId === 'crisis-frost' && 'Activate secondary heaters at midnight. Turn misting sprinklers on before air drops to 0.5°C and leave running.'}
                    {selectedCrisisId === 'crisis-lodging' && 'Prop up flattened stands manually on high-value seed areas. Top-dress with soluble potassium to brace undamaged nodes.'}
                    {selectedCrisisId === 'crisis-compaction' && 'Avoid moving heavy tractors until soil wetness matches field capacity moisture. Stake compacted tire paths.'}
                    {selectedCrisisId === 'crisis-leaching' && 'Halt further broadcast urea distribution. Prepare compost teas or split upcoming side-dress feeds immediately.'}
                  </p>
                </div>

                {/* Stage 2 */}
                <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2.5 relative hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.0 py-0.5 rounded font-mono">Correction (30 Days)</span>
                    <CornerDownRight size={13} className="text-slate-300" />
                  </div>
                  <h4 className="font-extrabold text-slate-855 text-xs">Soil Reconstruction</h4>
                  <p className="text-[10.5px] text-gray-500 leading-relaxed font-body">
                    {selectedCrisisId === 'crisis-salinity' && 'Conduct deep soil core tests at multiple layers. Restructure irrigation schedules with leaching fractions.'}
                    {selectedCrisisId === 'crisis-frost' && 'Prune frosted leaves only once healthy replacement shoots emerge to protect the wood from disease vectors.'}
                    {selectedCrisisId === 'crisis-lodging' && 'Adjust plant spacing density. Introduce a balanced fertilizer layout with an optimized nitrogen feed ratio.'}
                    {selectedCrisisId === 'crisis-compaction' && 'Begin chisel subsoiling at computed depths. Sow high-density tillage radishes into grid channels.'}
                    {selectedCrisisId === 'crisis-leaching' && 'Introduce organic composts or biochar under field layer lines to maximize cation exchange retention capacity.'}
                  </p>
                </div>

                {/* Stage 3 */}
                <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2.5 relative hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.0 py-0.5 rounded font-mono">Future Practice</span>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  </div>
                  <h4 className="font-extrabold text-slate-855 text-xs">Acoustical Prevention</h4>
                  <p className="text-[10.5px] text-gray-500 leading-relaxed font-body">
                    {selectedCrisisId === 'crisis-salinity' && 'Cultivate salt-tolerant companion breeds. Maintain continuous mulches to keep moisture in.'}
                    {selectedCrisisId === 'crisis-frost' && 'Establish high windbreaker hedge borders. Invest in computerized micro-climate frost warnings.'}
                    {selectedCrisisId === 'crisis-lodging' && 'Adopt lodging-resistant short-statured cultivars. Shift row sowing orientations parallel with winds.'}
                    {selectedCrisisId === 'crisis-compaction' && 'Adopt low-compaction tracks or floating dual-wheels. Implement no-till organic layer layouts.'}
                    {selectedCrisisId === 'crisis-leaching' && 'Transition towards organic nitrogen covers (vetches, legumes). Embed polymer slow-release urea blends.'}
                  </p>
                </div>

              </div>

            </div>

            {/* Advice and Organic alternatives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="glass-panel p-4 bg-emerald-50/20 border border-emerald-500/10 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Lightbulb size={14} className="text-emerald-600 font-black" />
                    <h5 className="text-[10.5px] uppercase font-extrabold tracking-wider font-mono">Organic Alternatives</h5>
                  </div>
                  <p className="text-[11px] text-emerald-950 mt-1.5 leading-relaxed font-body">
                    {activeCrisis.organicRemedies}
                  </p>
                </div>
              </div>

              <div className="glass-panel p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Info size={14} className="text-emerald-700 font-bold" />
                    <h5 className="text-[10.5px] uppercase font-extrabold tracking-wider font-mono">Farmers Folk Wisdom</h5>
                  </div>
                  <p className="text-[11px] text-slate-650 mt-1.5 leading-relaxed font-body italic">
                    "{activeCrisis.wisdom}"
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
