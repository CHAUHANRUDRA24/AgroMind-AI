import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, 
  Droplets,
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Cpu,
  Plus,
  Trash2,
  X,
  Sliders,
  SlidersHorizontal,
  Terminal,
  Activity,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { IrrigationZone } from '../types';

interface AutomationRule {
  id: string;
  zoneId: string; // Specific zone ID or 'all'
  zoneName: string;
  moistureThreshold: number; // percentage
  timeWindowHours: number; // hours
  durationMinutes: number; // minutes
  isEnabled: boolean;
  accumulatedHours: number; // tracks active condition duration
}

interface IrrigationViewProps {
  zones: IrrigationZone[];
  setZones: React.Dispatch<React.SetStateAction<IrrigationZone[]>>;
}

export default function IrrigationView({ zones, setZones }: IrrigationViewProps) {
  const [notification, setNotification] = useState<string | null>(null);
  
  // Automation state
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-default-1',
      zoneId: 'zone-2',
      zoneName: 'Zone Beta (Wheat)',
      moistureThreshold: 35,
      timeWindowHours: 2,
      durationMinutes: 15,
      isEnabled: true,
      accumulatedHours: 0.5,
    },
    {
      id: 'rule-default-2',
      zoneId: 'all',
      zoneName: 'All Zones',
      moistureThreshold: 30,
      timeWindowHours: 3,
      durationMinutes: 20,
      isEnabled: false,
      accumulatedHours: 0,
    }
  ]);

  // Terminal logging state
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] Telemetry Core: Scanning soil grid sensors...`,
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] Automated irrigation schedule linked to weather stream (Precipitation 12%).`,
    `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] Automated rules validator online.`
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form inputs
  const [newRuleZoneId, setNewRuleZoneId] = useState<string>('zone-1');
  const [newRuleThreshold, setNewRuleThreshold] = useState<number>(30);
  const [newRuleWindow, setNewRuleWindow] = useState<number>(3); // hours
  const [newRuleDuration, setNewRuleDuration] = useState<number>(15); // minutes

  // Helper to add timestamped entries to system terminal logger
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Close loops - dynamic sweep checker
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      // Direct drying/watering simulation is now handled in App.tsx to unify state.
      // 1. Check for Active zones exceeding safety limits and shut them off
      setZones(prevZones => {
        return prevZones.map(zone => {
          if (zone.status === 'Active' && zone.moisture >= 85) {
            addLog(`Rule Triggered Auto-Shutoff: ${zone.name} moist levels reached 85% safety trigger. Shutting off valves.`);
            return {
              ...zone,
              status: 'Inactive',
              flowRate: 0
            };
          }
          return zone;
        });
      });

      // 2. Evaluated Active Rules
      setRules(prevRules => {
        return prevRules.map(rule => {
          if (!rule.isEnabled) return rule;

          // Resolve matching zones
          const matchedZones = zones.filter(z => rule.zoneId === 'all' || z.id === rule.zoneId);
          if (matchedZones.length === 0) return rule;

          let nextAccumulated = rule.accumulatedHours;
          let triggeredAny = false;

          matchedZones.forEach(z => {
            if (z.moisture < rule.moistureThreshold) {
              if (z.status === 'Active') {
                return; // already hydrating
              }
              // Each sweep represents 0.5 hours of steady dryness in our time accelerated simulation!
              nextAccumulated = Math.min(rule.timeWindowHours, nextAccumulated + 0.5);

              if (nextAccumulated >= rule.timeWindowHours) {
                triggeredAny = true;
                
                // Actuate zone hydration valves
                setZones(currentZones => currentZones.map(cz => {
                  if (cz.id === z.id && cz.status !== 'Active') {
                    return {
                      ...cz,
                      status: 'Active',
                      flowRate: 45,
                      nextScheduled: 'Automated Rule'
                    };
                  }
                  return cz;
                }));

                setNotification(`Rule Fired: ${z.name} moisture < ${rule.moistureThreshold}% for ${rule.timeWindowHours} hrs! Automated water cycle active.`);
                setTimeout(() => setNotification(null), 4500);
                addLog(`CRITICAL TRIGGER: Rule for "${rule.zoneName}" activated. Moisture evaluated at ${z.moisture}%. Valves open for ${rule.durationMinutes} mins.`);
              } else {
                addLog(`Rule Evaluating (${rule.zoneName}): Moisture ${z.moisture}% < threshold ${rule.moistureThreshold}%. Accumulator: ${nextAccumulated}h / ${rule.timeWindowHours}h.`);
              }
            } else {
              // Moisture restored above safety margin. Clear values.
              if (nextAccumulated > 0) {
                addLog(`Moisture recovered: ${z.name} reached ${z.moisture}% (Above trigger safety of ${rule.moistureThreshold}%). Rule counter reset.`);
                nextAccumulated = 0;
              }
            }
          });

          return {
            ...rule,
            accumulatedHours: triggeredAny ? 0 : nextAccumulated
          };
        });
      });

    }, 5000);

    return () => clearInterval(sweepInterval);
  }, [zones, rules]);

  const toggleZone = (id: string) => {
    setZones(prev => prev.map(zone => {
      if (zone.id === id) {
        const isTurningOn = zone.status === 'Inactive';
        
        setNotification(`Valve trigger: ${zone.name} was toggled ${isTurningOn ? 'ON' : 'OFF'}.`);
        setTimeout(() => setNotification(null), 3000);
        addLog(`Manual Overrule: ${zone.name} was clicked ${isTurningOn ? 'OPEN' : 'CLOSED'}.`);

        return {
          ...zone,
          status: isTurningOn ? 'Active' : 'Inactive',
          flowRate: isTurningOn ? 45 : 0,
          moisture: isTurningOn ? Math.min(zone.moisture + 5, 100) : zone.moisture
        };
      }
      return zone;
    }));
  };

  const triggerIrrigateAll = () => {
    setZones(prev => prev.map(zone => ({
      ...zone,
      status: 'Active',
      flowRate: 45,
      moisture: Math.min(zone.moisture + 6, 100)
    })));
    setNotification('Override Hydrations: Initializing and opening valves inside all grids.');
    addLog('Operator Override Command: Emergency opening of all grid watering lines.');
    setTimeout(() => setNotification(null), 3500);
  };

  const triggerStopAll = () => {
    setZones(prev => prev.map(zone => ({
      ...zone,
      status: 'Inactive',
      flowRate: 0
    })));
    setNotification('Emergency Cutoff: Stopped all irrigation lines, closed bypass valves.');
    addLog('Emergency Cutoff Activated: Closing all pipeline sprayers and backflow regulators.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();

    const targetZone = newRuleZoneId === 'all' 
      ? { name: 'All Zones' } 
      : zones.find(z => z.id === newRuleZoneId);

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      zoneId: newRuleZoneId,
      zoneName: targetZone ? targetZone.name : 'Unknown Zone',
      moistureThreshold: newRuleThreshold,
      timeWindowHours: newRuleWindow,
      durationMinutes: newRuleDuration,
      isEnabled: true,
      accumulatedHours: 0
    };

    setRules(prev => [...prev, newRule]);
    setIsModalOpen(false);

    addLog(`Automation Engine: Registered new rule for "${newRule.zoneName}" (Threshold < ${newRule.moistureThreshold}%).`);
    setNotification('Added customized automation rule successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setRules(prev => prev.filter(r => r.id !== ruleId));
    if (rule) {
      addLog(`Automation Engine: Cleared rule "${rule.zoneName}".`);
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.isEnabled;
        addLog(`Automation Engine: Flag rule for "${r.zoneName}" changed to ${nextState ? 'ENABLED' : 'DISABLED'}.`);
        return {
          ...r,
          isEnabled: nextState,
          accumulatedHours: 0
        };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Intelligent Irrigation
          </h1>
          <p className="text-gray-500 font-body-md mt-1">
            Real-time control matrix for localized water valves, custom thresholds, and dynamic rules.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            type="button"
            id="btn-emergency-stop"
            onClick={triggerStopAll}
            className="flex-1 md:flex-none border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-black px-4 py-3 rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Emergency Shutoff
          </button>
          <button 
            type="button"
            id="btn-irrigate-all"
            onClick={triggerIrrigateAll}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-3 rounded-xl block cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play size={12} /> Override Hydrate All
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 bg-slate-900 text-emerald-150 border border-slate-800 text-xs rounded-xl flex items-center gap-2.5 shadow-lg max-w-xl mx-auto"
          >
            <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 animate-bounce" />
            <span className="font-semibold">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-irrigation-grid">
        
        {/* Valves Toggles controls */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h3 className="font-display-lg text-md font-bold text-gray-900 flex items-center gap-1.5">
              <Droplets size={16} className="text-emerald-600 animate-pulse" /> Field Calibration Modules
            </h3>
            <span className="text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase font-mono animate-pulse">Telemetry Live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="watering-zones-slider-grid">
            {zones.map((zone) => (
              <div 
                key={zone.id}
                id={`zone-card-${zone.id}`}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[260px] ${
                  zone.status === 'Active' 
                    ? 'bg-emerald-50/10 border-emerald-400 shadow-md' 
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                {/* Fluid ripple simulation background for active line */}
                {zone.status === 'Active' && (
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse"></div>
                )}

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] uppercase font-mono font-black px-2 py-0.5 rounded-full ${
                      zone.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {zone.status}
                    </span>
                    <button 
                      type="button"
                      onClick={() => toggleZone(zone.id)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                        zone.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <motion.span
                        initial={false}
                        animate={{
                          x: zone.status === 'Active' ? 22 : 2,
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-tight">{zone.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">Source: Main Duct ({zone.duration} Min standard)</p>
                  </div>
                </div>

                {/* Interactive Moisture Simulator for Quick Testing */}
                <div className="space-y-2.5 pt-4 border-t border-gray-150 mt-4 relative z-10">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500 text-[10px] uppercase font-mono">Humid Ratio</span>
                    <span className="text-emerald-600 font-bold font-mono">{zone.moisture}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-gray-200/20">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        zone.moisture < 35 ? 'bg-red-500' : zone.moisture < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${zone.moisture}%` }}
                    ></div>
                  </div>

                  {/* Interactive input range slider */}
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl mt-1.5 space-y-1">
                    <div className="flex justify-between text-[8px] uppercase tracking-wider font-mono text-gray-400 font-black">
                      <span>Live Test Slider</span>
                      <span className="text-slate-600 font-bold">{zone.moisture}%</span>
                    </div>
                    <input 
                      type="range"
                      min="15"
                      max="90"
                      value={zone.moisture}
                      onChange={(e) => {
                        const nextVal = parseInt(e.target.value);
                        setZones(prev => prev.map(cz => cz.id === zone.id ? { ...cz, moisture: nextVal } : cz));
                        addLog(`Interactive Sensor Mod: Manual calibration adjusted ${zone.name} to ${nextVal}% moisture.`);
                      }}
                      className="w-full h-1.5 accent-emerald-600 bg-slate-200/50 rounded-lg cursor-pointer appearance-none"
                    />
                  </div>

                  {zone.status === 'Active' && (
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-bold uppercase tracking-wider font-mono">
                      <Clock size={11} className="animate-spin text-emerald-600" /> Valve Flow: {zone.flowRate} L/Min
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Environmental Conditions Warning */}
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3 mt-4 shadow-sm" id="rainfall-warning-widget">
            <AlertCircle size={18} className="text-sky-600 mt-0.5 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-xs text-sky-800 uppercase tracking-widest font-mono">Telemetry Buffer Sync</h4>
              <p className="text-sky-900 text-xs mt-1 leading-relaxed">
                The micro-controller is tracking rainfall parameters for local regions. Some automation schedulers were dampened to save utility budget allocations, but custom moisture automation rules always retain absolute higher-order priority.
              </p>
            </div>
          </div>
        </div>

        {/* Schedule, Rules, and Logs Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Rules List Container Card */}
          <div className="glass-panel bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4" id="sidebar-rules-engine-panel">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <div className="flex items-center gap-1.5">
                <Cpu className="text-emerald-600 animate-pulse" size={16} />
                <h3 className="font-display-lg text-xs uppercase tracking-wider font-black text-slate-800">Rule Controllers</h3>
              </div>
              <button
                type="button"
                id="btn-add-rule-modal"
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <Plus size={11} /> New Rule
              </button>
            </div>

            {/* List of active automation rules */}
            <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar pr-0.5">
              {rules.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  <SlidersHorizontal size={24} className="mx-auto block text-gray-300 mb-2" />
                  No automation rules registered.
                </div>
              ) : (
                rules.map(rule => {
                  const percentAccumulated = Math.min(100, Math.round((rule.accumulatedHours / rule.timeWindowHours) * 100));
                  return (
                    <div 
                      key={rule.id}
                      className={`p-3 bg-slate-50 border rounded-xl hover:bg-slate-100/50 transition-all space-y-2 relative ${
                        rule.isEnabled ? 'border-gray-205' : 'border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                            rule.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {rule.isEnabled ? 'Active' : 'Muted'}
                          </span>
                          <p className="font-bold text-[11px] text-gray-800 leading-snug mt-1">If {rule.zoneName}</p>
                          <p className="text-slate-500 text-[10px] leading-tight select-text mt-0.5">
                            Moist &lt; <strong className="text-emerald-700">{rule.moistureThreshold}%</strong> for {rule.timeWindowHours} hrs
                          </p>
                          <p className="text-zinc-400 text-[9px] font-semibold flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> Waters: {rule.durationMinutes}m
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Toggle rule button */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className="text-gray-400 hover:text-slate-800 p-1 rounded hover:bg-white"
                            title={rule.isEnabled ? "Mute rule" : "Activate rule"}
                          >
                            <Sliders size={12} />
                          </button>
                          
                          {/* Trash button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-white"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Delay window duration accumulator progress bar */}
                      {rule.isEnabled && (
                        <div className="pt-1.5 border-t border-dashed border-gray-200/80">
                          <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                            <span>Delay Window Buffer</span>
                            <span className={percentAccumulated > 0 ? "text-amber-600 font-bold" : ""}>
                              {rule.accumulatedHours.toFixed(1)}h / {rule.timeWindowHours}h
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                percentAccumulated >= 100 ? 'bg-red-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${percentAccumulated}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-500/10 rounded-xl flex items-start gap-2.5">
              <Info size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-600 leading-relaxed font-body">
                <strong>Sim Tip:</strong> Slide any crop moisture bar below its threshold to trigger accumulator ticking. Once threshold timing is fulfilled, valves turn on live!
              </p>
            </div>
          </div>

          {/* Interactive live Terminal Logs sweep reporter */}
          <div className="glass-panel bg-slate-900 border border-slate-950 p-4 rounded-3xl space-y-3 font-mono text-[10px] text-slate-300 shadow-xl" id="sidebar-telemetry-logs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-[9px] uppercase font-black text-rose-500">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span> Real-Time Monitor
              </span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Scan Cycle Freq: 5s</span>
            </div>
            
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar select-text leading-normal scrollbar-none">
              {logs.map((log, idx) => (
                <div key={idx} className={`border-l-2 pl-1.5 ${idx === 0 ? 'text-white border-emerald-500 font-bold' : 'border-slate-800 text-slate-400'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Define Rule Modal form popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-md w-full relative"
              id="automation-modal"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="text-emerald-600" size={18} />
                  <h3 className="font-display-lg text-lg font-bold text-gray-900">Define Automation Rule</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddRule} className="p-6 space-y-5" id="add-rule-form">
                {/* Description alert helper */}
                <div className="p-3 bg-emerald-50 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800">
                  <Sparkles size={14} className="mt-0.5 text-emerald-600 flex-shrink-0 animate-pulse" />
                  <p className="leading-relaxed">
                    Custom conditions are checked periodically. The engine actuates field lines as soon as targets align.
                  </p>
                </div>

                {/* Target Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Irrigation Zone Target</label>
                  <select 
                    value={newRuleZoneId}
                    onChange={(e) => setNewRuleZoneId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 cursor-pointer focus:outline-none focus:border-emerald-500"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                    <option value="all">All Zones</option>
                  </select>
                </div>

                {/* Threshold level slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase font-mono tracking-widest text-gray-500">
                    <label>Steady Moisture Threshold</label>
                    <span className="text-emerald-700 font-black font-sans text-xs bg-emerald-50 px-2 py-0.5 rounded-md">{newRuleThreshold}%</span>
                  </div>
                  <input 
                    type="range"
                    min="15"
                    max="60"
                    value={newRuleThreshold}
                    onChange={(e) => setNewRuleThreshold(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                    <span>15% (Arid Soil)</span>
                    <span>60% (Optimal)</span>
                  </div>
                </div>

                {/* Timing configuration options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-black text-gray-400 tracking-wider">Dry Duration Window</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <input 
                        type="number"
                        min="1"
                        max="24"
                        value={newRuleWindow}
                        onChange={(e) => setNewRuleWindow(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-transparent text-xs w-full focus:outline-none font-bold text-gray-800"
                      />
                      <span className="text-[10px] text-gray-400 font-mono pl-1 uppercase font-black">Hrs</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-black text-gray-400 tracking-wider font-semibold">Valve Watering Period</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <input 
                        type="number"
                        min="5"
                        max="120"
                        value={newRuleDuration}
                        onChange={(e) => setNewRuleDuration(Math.max(5, parseInt(e.target.value) || 5))}
                        className="bg-transparent text-xs w-full focus:outline-none font-bold text-gray-800"
                      />
                      <span className="text-[10px] text-gray-400 font-mono pl-1 uppercase font-black">Mins</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic logic summary block */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                  <span className="text-[8px] uppercase font-mono font-black tracking-widest text-slate-400">Compiled Rule Logic</span>
                  <p className="text-[11px] text-slate-600 leading-normal mt-1 font-medium">
                    <span className="font-extrabold text-slate-900 font-mono uppercase">If</span> {newRuleZoneId === 'all' ? 'any irrigation zone' : zones.find(z => z.id === newRuleZoneId)?.name} moisture levels are recorded below <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">{newRuleThreshold}%</span> continuous for <span className="text-blue-600 font-bold">{newRuleWindow} hrs</span>, <span className="font-extrabold text-slate-900 font-mono uppercase">Then</span> actuate safety valves and irrigate for <span className="text-blue-600 font-bold">{newRuleDuration} minutes</span>.
                  </p>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-gray-700 border border-gray-200 font-semibold rounded-xl text-xs text-center cursor-pointer transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs text-center cursor-pointer shadow shadow-emerald-600/10 transition-all active:scale-95"
                  >
                    Save Controller Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
