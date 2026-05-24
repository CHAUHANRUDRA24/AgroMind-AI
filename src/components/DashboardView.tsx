import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Leaf, 
  CloudRain, 
  Droplet, 
  Droplets, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Cpu, 
  RefreshCw, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { SectorStat, ActiveTab, IrrigationZone } from '../types';

interface DashboardViewProps {
  farmName: string;
  wateringThreshold: number;
  onTabChange: (tab: ActiveTab) => void;
  sectorsData: Record<string, SectorStat>;
  setSectorsData: React.Dispatch<React.SetStateAction<Record<string, SectorStat>>>;
  zones: IrrigationZone[];
  setZones: React.Dispatch<React.SetStateAction<IrrigationZone[]>>;
  isLiveStreaming: boolean;
  setIsLiveStreaming: (live: boolean) => void;
}

export default function DashboardView({ 
  farmName, 
  wateringThreshold, 
  onTabChange,
  sectorsData,
  setSectorsData,
  zones,
  setZones,
  isLiveStreaming,
  setIsLiveStreaming
}: DashboardViewProps) {
  const [activeSector, setActiveSector] = useState('Sector Alpha');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [expandedFeedIndex, setExpandedFeedIndex] = useState<number | null>(null);

  // States for real-time telemetry plotting
  const [plotMetric, setPlotMetric] = useState<'moisture' | 'temperature' | 'humidity'>('moisture');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // States for real-time sector quick watering override action
  const [irrigationProgress, setIrrigationProgress] = useState(0);
  const irrigationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Safely clean up and reset timers on component unmount
  useEffect(() => {
    return () => {
      if (irrigationIntervalRef.current) {
        clearInterval(irrigationIntervalRef.current);
      }
    };
  }, []);

  // Deactivate active hydration states when swapping sectors
  useEffect(() => {
    if (isCurrentlyIrrigating) {
      if (irrigationIntervalRef.current) {
        clearInterval(irrigationIntervalRef.current);
      }
      setIrrigationProgress(0);
    }
  }, [activeSector]);

  const stats = sectorsData[activeSector];

  const handleSensorChange = (key: 'temperature' | 'humidity' | 'soilMoisture', value: number) => {
    const updatedStats = { ...stats, [key]: value };

    // 1. Calculate dynamic Soil Moisture statuses
    if (key === 'soilMoisture') {
      updatedStats.soilMoistureStatus = value < 35 ? 'Low' : value > 55 ? 'High' : 'Opt';
    }

    // 2. Crop Health math simulation
    let penalty = 0;
    if (updatedStats.soilMoisture < 35) penalty += (35 - updatedStats.soilMoisture) * 1.5;
    if (updatedStats.soilMoisture > 55) penalty += (updatedStats.soilMoisture - 55) * 0.4;
    if (updatedStats.temperature > 28) penalty += (updatedStats.temperature - 28) * 1.8;
    if (updatedStats.temperature < 18) penalty += (18 - updatedStats.temperature) * 1.2;
    if (updatedStats.humidity < 45) penalty += (45 - updatedStats.humidity) * 0.4;
    if (updatedStats.humidity > 80) penalty += (updatedStats.humidity - 80) * 0.3;

    const calculatedHealth = Math.max(8, Math.min(100, Math.round(98 - penalty)));
    updatedStats.cropHealth = calculatedHealth;
    updatedStats.cropHealthStatus = calculatedHealth >= 90 ? 'Optimal' : calculatedHealth >= 70 ? 'Stable' : 'Critical';

    // 3. Water Usage dynamic estimation
    const estimatedUsage = Math.round(1100 + (48 - updatedStats.soilMoisture) * 12);
    updatedStats.waterUsage = `${(Math.max(300, estimatedUsage) / 1000).toFixed(1)}k L`;

    setSectorsData(prev => ({
      ...prev,
      [activeSector]: updatedStats
    }));
  };

  const runDeepScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs(['Initializing deep sector scan...', 'Checking sensor mesh networks...']);
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + 12.5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            
            // Randomize active sector's stats during real-time scan verification
            const randTemp = +(21 + Math.random() * 7).toFixed(1);
            const randHumid = Math.floor(52 + Math.random() * 28);
            const randMoisture = Math.floor(32 + Math.random() * 32);
            
            const moistStatus = randMoisture < 35 ? 'Low' : randMoisture > 55 ? 'High' : 'Opt';
            let penalty = 0;
            if (randMoisture < 35) penalty += (35 - randMoisture) * 1.4;
            if (randMoisture > 55) penalty += (randMoisture - 55) * 0.4;
            if (randTemp > 28) penalty += (randTemp - 28) * 1.5;
            if (randTemp < 18) penalty += (18 - randTemp) * 1.0;

            const computedHealth = Math.max(10, Math.min(100, Math.round(98 - penalty)));
            const healthStatus = computedHealth >= 90 ? 'Optimal' : computedHealth >= 72 ? 'Stable' : 'Critical';

            setSectorsData(prev => ({
              ...prev,
              [activeSector]: {
                temperature: randTemp,
                temperatureChange: Math.random() > 0.5 ? '+1.4°' : '-0.2°',
                humidity: randHumid,
                humidityChange: Math.random() > 0.5 ? '+2%' : '-4%',
                soilMoisture: randMoisture,
                soilMoistureStatus: moistStatus as 'Opt' | 'Low' | 'High',
                waterUsage: `${(Math.round(850 + Math.random() * 550) / 1000).toFixed(1)}k L`,
                waterUsageChange: Math.random() > 0.5 ? '+3%' : '-2%',
                cropHealth: computedHealth,
                cropHealthStatus: healthStatus as 'Stable' | 'Critical' | 'Optimal',
                rainProbability: Math.floor(8 + Math.random() * 35),
                rainProbabilityStatus: Math.random() > 0.5 ? 'Medium' : 'Low',
              }
            }));
          }, 800);
          return 100;
        }
        
        // Dynamic scan report logging
        if (next === 25) {
          setScanLogs(prev => [...prev, 'Reading soil moisture sensors at depth 15cm...', 'Analyzing leaf-wetness ratios...']);
        } else if (next === 50) {
          setScanLogs(prev => [...prev, 'Verifying NDVI crop-health indexes via satellite images...', 'Pathogen signature scan complete: Clean.']);
        } else if (next === 75) {
          setScanLogs(prev => [...prev, 'Predicting dynamic irrigation thresholds...', 'Calculating rain evapotranspiration balances...']);
        } else if (next === 87.5) {
          setScanLogs(prev => [...prev, 'Scan completed successfully. Synchronization finalized.']);
        }
        return next;
      });
    }, 280);
  };

  const activeZoneId = activeSector === 'Sector Alpha' ? 'zone-1' : activeSector === 'Sector Beta' ? 'zone-2' : 'zone-3';
  const matchedZone = zones.find(z => z.id === activeZoneId);
  const isCurrentlyIrrigating = matchedZone?.status === 'Active';

  const startDashboardIrrigation = () => {
    setZones(prev => prev.map(z => {
      if (z.id === activeZoneId) {
        const nextStatus = z.status === 'Active' ? 'Inactive' : 'Active';
        return {
          ...z,
          status: nextStatus,
          flowRate: nextStatus === 'Active' ? 45 : 0
        };
      }
      return z;
    }));
  };

  const xLabel = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "LIVE"];

  const sectors = [
    { name: 'Sector Alpha', crops: 'Soybeans', area: '120 Acres', moisture: '42%' },
    { name: 'Sector Beta', crops: 'Winter Wheat', area: '180 Acres', moisture: '38%' },
    { name: 'Sector Gamma', crops: 'Corn', area: '120 Acres', moisture: '45%' },
  ];

  // Animation layout variants for vital stats staggered sliding effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 280, 
        damping: 22 
      } 
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {activeSector} Overview
          </h1>
          <p className="text-gray-500 font-body-md mt-1">
            System status optimal. AI agents actively monitoring 420 acres at {farmName}.
          </p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
          {/* Live IoT Pulse indicator widget */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/65 px-4 py-2 rounded-full shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveStreaming ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveStreaming ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <div className="flex flex-col min-w-[130px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">IoT Telemetry Feed</span>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {isLiveStreaming ? 'Direct Live Streaming' : 'Sensors Paused (Ready)'}
              </span>
            </div>
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ml-1 transition-all select-none cursor-pointer ${
                isLiveStreaming 
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300/30' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
              }`}
            >
              {isLiveStreaming ? 'Pause' : 'Stream'}
            </button>
          </div>

          <button
            onClick={runDeepScan}
            disabled={isScanning}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white shadow-lg hover:shadow-emerald-600/30 px-6 py-2.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto text-sm"
          >
            <Activity size={18} className={isScanning ? 'animate-pulse text-emerald-300' : ''} />
            {isScanning ? `Scanning ${Math.round(scanProgress)}%` : 'Run Deep Scan'}
          </button>
        </div>
      </div>

      {/* Progress Animation Panel */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card bg-emerald-950/90 text-emerald-200 border border-emerald-500/20 rounded-xl p-4 overflow-hidden shadow-inner flex flex-col gap-3 font-mono text-xs"
          >
            <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest border-b border-emerald-500/10 pb-2">
              <span className="flex items-center gap-1.5"><Cpu size={12} className="animate-spin" /> Deep Diagnostic Scan Engine v3.1</span>
              <span>Running</span>
            </div>
            <div className="w-full bg-emerald-950/50 rounded-full h-2 overflow-hidden border border-emerald-800/40">
              <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {scanLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-emerald-500 font-bold">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid: Vital Stats (Animated stagger layout on select shift) */}
      <motion.div 
        key={activeSector}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {/* Temp */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="glass-card bg-white p-4 flex flex-col justify-between h-[130px] rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <Activity size={20} />
            </div>
            <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-0.5">
              {stats.temperatureChange}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Temperature</p>
            <p className="text-xl font-bold text-gray-900">{stats.temperature}°C</p>
          </div>
        </motion.div>

        {/* Humidity */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="glass-card bg-white p-4 flex flex-col justify-between h-[130px] rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Droplet size={20} className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-bold text-gray-500">
              {stats.humidityChange}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Humidity</p>
            <p className="text-xl font-bold text-gray-900">{stats.humidity}%</p>
          </div>
        </motion.div>

        {/* Soil Moisture */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="glass-card bg-white p-4 flex flex-col justify-between h-[130px] rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sprout size={20} className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              stats.soilMoistureStatus === 'Low' ? 'bg-amber-100 text-amber-800' :
              stats.soilMoistureStatus === 'High' ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {stats.soilMoistureStatus}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Soil Moisture</p>
            <p className="text-xl font-bold text-gray-900">{stats.soilMoisture}%</p>
          </div>
        </motion.div>

        {/* Water Usage */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="glass-card bg-white p-4 flex flex-col justify-between h-[130px] rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Droplets size={20} className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[12px] font-bold text-emerald-600">
              {stats.waterUsageChange}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Water Usage</p>
            <p className="text-xl font-bold text-gray-900">{stats.waterUsage}</p>
          </div>
        </motion.div>

        {/* Crop Health */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="glass-card bg-white p-4 flex flex-col justify-between h-[130px] rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-1.5 rounded-lg bg-lime-50 text-lime-600">
              <Leaf size={20} className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              stats.cropHealthStatus === 'Critical' ? 'bg-red-100 text-red-800 animate-pulse' :
              stats.cropHealthStatus === 'Optimal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {stats.cropHealthStatus}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Crop Health</p>
            <p className="text-xl font-bold text-gray-900">{stats.cropHealth}%</p>
          </div>
        </motion.div>

        {/* Rain Prediction */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.15 } }}
          className="glass-card bg-white p-4 flex flex-col justify-between h-[130px] rounded-xl border border-gray-100 shadow-xs hover:shadow-sm hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CloudRain size={20} className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
              {stats.rainProbabilityStatus}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Rain Prob.</p>
            <p className="text-xl font-bold text-gray-900">{stats.rainProbability}%</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Sector Visuals & Quick Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sector Interactive Selector Cards & Tuning Controls */}
        <div className="lg:col-span-2 glass-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display-lg text-lg font-bold text-gray-900">Manage Farm Sectors</h3>
              <p className="text-gray-500 text-xs">Switch between sectors to review precision sensor diagnostics.</p>
            </div>
            <MapPin className="text-emerald-600" size={20} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectors.map((s) => {
              const active = activeSector === s.name;
              return (
                <motion.div
                  key={s.name}
                  onClick={() => setActiveSector(s.name)}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    active
                      ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 shadow-sm shadow-emerald-500/5'
                      : 'bg-white border-gray-200 hover:border-emerald-500/30 text-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{s.area}</span>
                  </div>
                  <h4 className="font-semibold text-sm mt-3">{s.name}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>Crop: {s.crops}</span>
                    <span className="font-bold text-emerald-600">{sectorsData[s.name].soilMoisture}% Moisture</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Real-time Precision Tuning Console */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/50 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="text-emerald-600 w-4 h-4 animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Precision Tuning Override Console</h4>
            </div>
            <p className="text-xs text-slate-500">
              Manually slide variables to simulate environmental shifts and watch the dynamic AI threshold warnings and crop health indices instantly calculate.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              {/* Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Temperature</span>
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="38"
                  step="0.5"
                  value={stats.temperature}
                  onChange={(e) => handleSensorChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>12°C (Cool)</span>
                  <span>38°C (Hot)</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Humidity</span>
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.humidity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={stats.humidity}
                  onChange={(e) => handleSensorChange('humidity', parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>30% (Dry)</span>
                  <span>95% (Damp)</span>
                </div>
              </div>

              {/* Soil Moisture */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Moisture</span>
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.soilMoisture}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  value={stats.soilMoisture}
                  disabled={isCurrentlyIrrigating}
                  onChange={(e) => handleSensorChange('soilMoisture', parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>15% (Dry)</span>
                  <span>75% (Saturated)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Trend Plotter Card */}
          <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Real-time Telemetry Plotter</h4>
              </div>
              {/* Plot metric tabs */}
              <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-lg">
                {(['moisture', 'temperature', 'humidity'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPlotMetric(m)}
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md transition-all cursor-pointer ${
                      plotMetric === m 
                        ? 'bg-white text-slate-800 shadow-xs' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Chart Canvas */}
            <div className="pt-2">
              <svg viewBox="0 0 480 120" className="w-full h-28 overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </linearGradient>
                  
                  {/* Dynamic glow drop shadow filters */}
                  <filter id="moistureGlow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#10b981" floodOpacity="0.25" />
                  </filter>
                  <filter id="temperatureGlow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#f97316" floodOpacity="0.25" />
                  </filter>
                  <filter id="humidityGlow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0ea5e9" floodOpacity="0.25" />
                  </filter>
                </defs>
                
                {/* Horizontal reference grid lines */}
                <line x1="0" y1={120 * 0.25} x2={480} y2={120 * 0.25} stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1={120 * 0.5} x2={480} y2={120 * 0.5} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1={120 * 0.75} x2={480} y2={120 * 0.75} stroke="#f8fafc" strokeWidth="1" />

                {/* Plot area */}
                {(() => {
                  const plotPoints = 
                    plotMetric === 'moisture' ? [38, 39, 41, 40, 42, 41, 40, stats.soilMoisture] :
                    plotMetric === 'temperature' ? [22, 23, 23.5, 24, 23.8, 24.2, 24.1, stats.temperature] :
                    [62, 64, 65, 66, 68, 67, 66, stats.humidity];

                  const pMin = plotMetric === 'moisture' ? 10 : plotMetric === 'temperature' ? 10 : 25;
                  const pMax = plotMetric === 'moisture' ? 80 : plotMetric === 'temperature' ? 40 : 100;
                  const pRange = pMax - pMin;
                  const pXStep = 480 / (plotPoints.length - 1);

                  const pCoords = plotPoints.map((val, idx) => {
                    const cx = idx * pXStep;
                    const cy = 120 - ((val - pMin) / pRange) * 120;
                    return { x: cx, y: cy, val };
                  });

                  // Cubic Bezier curve algorithm for a highly polished, smooth layout response
                  const pPathD = pCoords.reduce((acc, c, idx, arr) => {
                    if (idx === 0) return `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
                    const prev = arr[idx - 1];
                    const cpX1 = prev.x + (c.x - prev.x) * 0.42;
                    const cpY1 = prev.y;
                    const cpX2 = prev.x + (c.x - prev.x) * 0.58;
                    const cpY2 = c.y;
                    return `${acc} C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
                  }, "");

                  const pAreaD = pCoords.length > 0 ? `${pPathD} L 480 120 L 0 120 Z` : "";
                  
                  const pStroke = plotMetric === 'moisture' ? '#10b981' : plotMetric === 'temperature' ? '#f97316' : '#0ea5e9';
                  const pFill = plotMetric === 'moisture' ? 'url(#moistureGradient)' : plotMetric === 'temperature' ? 'url(#temperatureGradient)' : 'url(#humidityGradient)';
                  const pGlow = plotMetric === 'moisture' ? 'url(#moistureGlow)' : plotMetric === 'temperature' ? 'url(#temperatureGlow)' : 'url(#humidityGlow)';
                  const pUnit = plotMetric === 'moisture' ? '%' : plotMetric === 'temperature' ? '°C' : '%';

                  return (
                    <g>
                      {/* Gradient Fill under spline */}
                      <motion.path 
                        animate={{ d: pAreaD }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        fill={pFill} 
                      />
                      
                      {/* Main Smooth Curve Line with Glow Filter */}
                      <motion.path 
                        animate={{ d: pPathD }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        fill="none" 
                        stroke={pStroke} 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        filter={pGlow}
                      />
                      
                      {/* Interactive Guideline crosshairs */}
                      {hoveredPointIdx !== null && pCoords[hoveredPointIdx] && (
                        <motion.line 
                          x1={pCoords[hoveredPointIdx].x} 
                          y1={0} 
                          x2={pCoords[hoveredPointIdx].x} 
                          animate={{ y2: 120 }}
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                          stroke={pStroke} 
                          strokeWidth="1.2" 
                          strokeDasharray="4 3" 
                          opacity="0.5" 
                          pointerEvents="none" 
                        />
                      )}

                      {/* Render markers and floating tooltips */}
                      {pCoords.map((c, i) => {
                        const isLast = i === pCoords.length - 1;
                        const isHovered = hoveredPointIdx === i;
                        
                        return (
                          <g key={i}>
                            {/* Marker Halo on Hover */}
                            {isHovered && (
                              <motion.circle 
                                cx={c.x} 
                                animate={{ cy: c.y }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                                r="12" 
                                fill={pStroke} 
                                opacity="0.15" 
                                pointerEvents="none"
                                className="animate-pulse" 
                              />
                            )}

                            {/* Node Anchor Dot */}
                            <motion.circle 
                              cx={c.x} 
                              animate={{ cy: c.y }}
                              transition={{ duration: 0.45, ease: "easeInOut" }}
                              r={isHovered ? "5.5" : isLast ? "5" : "3.5"} 
                              fill={isHovered ? pStroke : "#ffffff"} 
                              stroke={isHovered ? "#ffffff" : pStroke} 
                              strokeWidth={isHovered ? "2" : "1.8"} 
                              className="transition-all duration-200"
                              pointerEvents="none"
                            />

                            {/* Keep Pulse Indicator on live point when idle */}
                            {isLast && !isHovered && (
                              <motion.circle 
                                cx={c.x} 
                                animate={{ cy: c.y }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                                r="9" 
                                fill={pStroke} 
                                className="animate-pulse" 
                                opacity="0.3" 
                                pointerEvents="none"
                              />
                            )}

                            {/* Floating precise tooltip tag */}
                            {isHovered && (
                              <g pointerEvents="none">
                                {/* Adjusted background placement to avoid SVG border clip */}
                                <rect 
                                  x={c.x - 38 < 4 ? 4 : c.x + 38 > 476 ? 400 : c.x - 38} 
                                  y={c.y - 28 < 4 ? c.y + 12 : c.y - 30} 
                                  width="76" 
                                  height="20" 
                                  rx="6" 
                                  fill="#0f172a" 
                                  opacity="0.95"
                                />
                                <text 
                                  x={c.x - 38 < 4 ? 42 : c.x + 38 > 476 ? 438 : c.x} 
                                  y={c.y - 28 < 4 ? c.y + 24 : c.y - 17} 
                                  textAnchor="middle" 
                                  className="text-[9px] font-mono font-bold fill-white"
                                >
                                  {xLabel[i]}: {c.val}{pUnit}
                                </text>
                              </g>
                            )}

                            {/* Hidden wider hotspot bounds for easier touch targeting */}
                            <circle 
                              cx={c.x} 
                              cy={c.y} 
                              r="18" 
                              fill="transparent" 
                              className="cursor-pointer" 
                              onMouseEnter={() => setHoveredPointIdx(i)} 
                              onMouseLeave={() => setHoveredPointIdx(null)} 
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
              
              <div className="flex justify-between text-[9px] text-gray-400 font-mono pt-1.5 px-1 border-t border-slate-100">
                {xLabel.map((lbl, i) => (
                  <span key={i} className={i === xLabel.length - 1 ? "font-bold text-slate-700" : ""}>{lbl}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Conditions Warning */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/50 rounded-xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide">Farming Action Notice</h4>
                <p className="text-amber-950 text-xs mt-1">
                  {stats.soilMoisture < wateringThreshold ? (
                    <span>
                      Warning: Active soil moisture of <strong>{stats.soilMoisture}%</strong> drops below your custom safety threshold ({wateringThreshold}%). Intelligent hydration cycle suggested!
                    </span>
                  ) : (
                    <span>
                      Optimal hydration: Active soil moisture of <strong>{stats.soilMoisture}%</strong> is safely above your configuration threshold ({wateringThreshold}%). No manual irrigation required.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick manual sector watering override bar */}
            <div className="pt-2 border-t border-amber-200/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1">
                {isCurrentlyIrrigating ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-emerald-800 font-bold">
                      <span className="flex items-center gap-1"><Droplet size={10} className="animate-bounce" /> Hydrating sector...</span>
                      <span>{stats.soilMoisture}% / Target 65%</span>
                    </div>
                    <div className="w-full bg-emerald-250 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${((stats.soilMoisture - 15) / 50) * 100}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Water source coordinates mapped. Sprayers online for {activeSector}.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={startDashboardIrrigation}
                  className={`text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrentlyIrrigating 
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow shadow-red-600/20' 
                      : stats.soilMoisture < wateringThreshold
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow shadow-blue-600/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Droplets size={13} className={isCurrentlyIrrigating ? 'animate-spin' : ''} />
                  {isCurrentlyIrrigating ? 'Shutoff Valve' : 'Quick Hydrate'}
                </button>
                
                <button 
                  onClick={() => {
                    onTabChange('irrigation');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 text-[11px] font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-0.5"
                >
                  View Matrix →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Central Automated Farm Alerts Side panel (Interactive Expandable Cards) */}
        <div className="glass-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-display-lg text-md font-bold text-gray-900">Live AI Health Feed</h3>
            </div>
            
            <p className="text-xs text-gray-400 pb-1">Click feed items to expand dynamic analysis & recommendable triggers.</p>
            
            <div className="space-y-3">
              {[
                {
                  id: 0,
                  title: 'Dynamic Schedule Refined',
                  summary: 'Hydration parameters fully calculated based on humidity indexes.',
                  time: '14m ago',
                  type: 'check',
                  detail: 'AI agent evaluated that humidity levels combined with overnight cool breezes decrease crop transpiration rates. Automatic watering times shortened by 4 minutes to conserve regional aquifer reserves.',
                  btnText: 'Review System Matrix',
                  tabTarget: 'irrigation' as const,
                },
                {
                  id: 1,
                  title: 'Weekly Rain Balance Recalculated',
                  summary: 'Forecast shifts reflect +15mm rain in 48h. Irrigation holding verified.',
                  time: '1h ago',
                  type: 'check',
                  detail: 'Cloud forecast model suggests heavy rainfall starting tomorrow @ 08:30. In response, AgroMind has suspended non-critical deep watering cycles across all soybean fields.',
                  btnText: 'Inspect Weather Radar',
                  tabTarget: 'weather' as const,
                },
                {
                  id: 2,
                  title: 'Local Spore Alert Triggered',
                  summary: 'High humidity warnings issued: early pathogen tests suggested for blight.',
                  time: '3h ago',
                  type: 'warn',
                  detail: 'Slight yellowing index detected via mesh satellite analysis. Early leaf spots spotted near grid C18. Run AI model to scan specific plant leaves to verify pathogen signatures.',
                  btnText: 'Run Diagnostics Scan Now',
                  tabTarget: 'detection' as const,
                },
              ].map((feed, idx) => {
                const isExpanded = expandedFeedIndex === idx;
                return (
                  <div 
                    key={feed.title}
                    className={`border rounded-xl transition-all duration-200 cursor-pointer overflow-hidden ${
                      isExpanded 
                        ? 'border-emerald-500 bg-emerald-50/10 shadow-xs' 
                        : 'border-slate-100 bg-white hover:border-emerald-500/20'
                    }`}
                    onClick={() => setExpandedFeedIndex(isExpanded ? null : idx)}
                  >
                    <div className="flex gap-3 items-start p-3 select-none">
                      {feed.type === 'check' ? (
                        <CheckCircle size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                      ) : (
                        <ShieldAlert size={16} className="text-amber-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-800 leading-tight truncate">{feed.title}</p>
                          <span className="text-[9px] font-mono text-gray-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.25 rounded-md">{feed.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{feed.summary}</p>
                      </div>
                    </div>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="bg-emerald-50/20 border-t border-slate-100 px-3 pb-3 pt-2 text-[11px] text-slate-600 space-y-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="leading-relaxed font-normal">{feed.detail}</p>
                          <button
                            onClick={() => {
                              onTabChange(feed.tabTarget);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow-sm hover:bg-emerald-700 active:scale-95 transition-all w-full flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {feed.btnText} →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => {
              onTabChange('detection');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-gray-700 text-xs font-bold border border-gray-200 rounded-lg text-center cursor-pointer transition-all hover:border-emerald-500/20"
          >
            Diagnostics Crop Analyzer Tree
          </button>
        </div>

      </div>
    </div>
  );
}
