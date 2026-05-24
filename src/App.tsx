import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  LayoutDashboard,
  Activity, 
  BrainCircuit, 
  Bot, 
  CloudSun, 
  Droplet, 
  FileText, 
  User, 
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  Cpu,
  LogOut,
  Info,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

// Import Types
import { ActiveTab, AppSettings } from './types';

// Import Modular Views
import DashboardView from './components/DashboardView';
import DiseaseDetectionView from './components/DiseaseDetectionView';
import AssistantView from './components/AssistantView';
import WeatherView from './components/WeatherView';
import IrrigationView from './components/IrrigationView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import FertilizerView from './components/FertilizerView';
import AdvisoryView from './components/AdvisoryView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAlertBannerVisible, setIsAlertBannerVisible] = useState(true);

  // Theme states
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('agromind-theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('agromind-theme', nextTheme);
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // App-wide customized settings parameters
  const [appSettings, setAppSettings] = useState<AppSettings>({
    farmName: 'North Valley Precinct',
    location: 'California, USA',
    alertEmail: 'elias.thorne@farmnet.io',
    enableNotifications: true,
    enableGrounding: true,
    wateringThreshold: 40,
    aiModel: 'Gemini 3.5 Flash',
  });

  // Shared state for real-time sector telemetry and irrigation zones
  const [sectorsData, setSectorsData] = useState<Record<string, any>>({
    'Sector Alpha': {
      temperature: 24.5,
      temperatureChange: '+1.2°',
      humidity: 68,
      humidityChange: '-2%',
      soilMoisture: 42,
      soilMoistureStatus: 'Opt',
      waterUsage: '1.2k L',
      waterUsageChange: '+5%',
      cropHealth: 94,
      cropHealthStatus: 'Stable',
      rainProbability: 15,
      rainProbabilityStatus: 'Low',
    },
    'Sector Beta': {
      temperature: 21.8,
      temperatureChange: '-0.4°',
      humidity: 74,
      humidityChange: '+3%',
      soilMoisture: 38,
      soilMoistureStatus: 'Opt',
      waterUsage: '940 L',
      waterUsageChange: '-1.5%',
      cropHealth: 91,
      cropHealthStatus: 'Stable',
      rainProbability: 25,
      rainProbabilityStatus: 'Low',
    },
    'Sector Gamma': {
      temperature: 26.2,
      temperatureChange: '+1.8°',
      humidity: 61,
      humidityChange: '-4%',
      soilMoisture: 45,
      soilMoistureStatus: 'Opt',
      waterUsage: '1.4k L',
      waterUsageChange: '+8%',
      cropHealth: 97,
      cropHealthStatus: 'Optimal',
      rainProbability: 10,
      rainProbabilityStatus: 'Low',
    },
  });

  const [zones, setZones] = useState<any[]>([
    { id: 'zone-1', name: 'Zone Alpha (Soybeans)', status: 'Inactive', moisture: 42, flowRate: 0, nextScheduled: '05:00 AM', duration: 15 },
    { id: 'zone-2', name: 'Zone Beta (Wheat)', status: 'Inactive', moisture: 38, flowRate: 0, nextScheduled: '06:30 AM', duration: 20 },
    { id: 'zone-3', name: 'Zone Gamma (Corn)', status: 'Inactive', moisture: 45, flowRate: 0, nextScheduled: '04:15 AM', duration: 10 },
  ]);

  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Core unified environmental and hydration simulation loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // 1. First tick zone moistures (up if Active sprinkler, down slowly if Inactive natural drying)
      setZones((prevZones) => {
        const nextZones = prevZones.map(zone => {
          if (zone.status === 'Active') {
            if (zone.moisture < 85) {
              return {
                ...zone,
                moisture: Math.min(100, zone.moisture + 2),
                flowRate: 45
              };
            } else {
              // High limits safety shutdown
              return {
                ...zone,
                status: 'Inactive',
                flowRate: 0
              };
            }
          } else {
            // Natural evaporation decay
            return {
              ...zone,
              moisture: Math.max(12, +(zone.moisture - 0.2).toFixed(1))
            };
          }
        });

        // 2. Synchronize the newly computed values back into sectorsData
        setSectorsData((prevSectors) => {
          const nextSectors = { ...prevSectors };
          const sectorMap = [
            { sectorName: 'Sector Alpha', zoneId: 'zone-1' },
            { sectorName: 'Sector Beta', zoneId: 'zone-2' },
            { sectorName: 'Sector Gamma', zoneId: 'zone-3' }
          ];

          sectorMap.forEach(({ sectorName, zoneId }) => {
            const matchedZone = nextZones.find(z => z.id === zoneId);
            if (!matchedZone) return;

            const originalSector = nextSectors[sectorName];
            if (!originalSector) return;

            // Generate slow atmospheric fluctuations (drift)
            const tempDrift = +(Math.random() * 0.4 - 0.2).toFixed(1);
            const targetTemp = Math.max(12, Math.min(42, +(originalSector.temperature + tempDrift).toFixed(1)));
            const humidDrift = Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const targetHumid = Math.max(15, Math.min(98, originalSector.humidity + humidDrift));

            // Dynamic Crop Health penalties based on the synced moisture
            let penalty = 0;
            if (matchedZone.moisture < 35) penalty += (35 - matchedZone.moisture) * 1.5;
            if (matchedZone.moisture > 55) penalty += (matchedZone.moisture - 55) * 0.4;
            if (targetTemp > 28) penalty += (targetTemp - 28) * 1.8;
            if (targetTemp < 18) penalty += (18 - targetTemp) * 1.2;
            if (targetHumid < 45) penalty += (45 - targetHumid) * 0.4;
            if (targetHumid > 80) penalty += (targetHumid - 80) * 0.3;

            const calculatedHealth = Math.max(8, Math.min(100, Math.round(98 - penalty)));
            const estimatedUsage = Math.round(1100 + (48 - matchedZone.moisture) * 12);
            const waterUsageStr = `${(Math.max(300, estimatedUsage) / 1000).toFixed(1)}k L`;

            nextSectors[sectorName] = {
              ...originalSector,
              soilMoisture: matchedZone.moisture,
              temperature: targetTemp,
              humidity: targetHumid,
              cropHealth: calculatedHealth,
              waterUsage: waterUsageStr,
              temperatureChange: tempDrift >= 0 ? `+${tempDrift}°` : `${tempDrift}°`,
              humidityChange: humidDrift >= 0 ? `+${humidDrift}%` : `${humidDrift}%`,
              soilMoistureStatus: matchedZone.moisture < 35 ? 'Low' : matchedZone.moisture > 55 ? 'High' : 'Opt',
              cropHealthStatus: calculatedHealth >= 90 ? 'Optimal' : calculatedHealth >= 70 ? 'Stable' : 'Critical'
            };
          });

          return nextSectors;
        });

        return nextZones;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Custom visual Toast status management
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSaveSettings = () => {
    showToast("Configurations saved! Farm thresholds, regions, and AI agents updated globally.", "success");
  };

  // Nav Items array
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'detection' as const, label: 'Leaf Analyzer', icon: BrainCircuit },
    { id: 'fertilizer' as const, label: 'NPK Calculator', icon: Calculator },
    { id: 'advisory' as const, label: 'Risk Advisory', icon: AlertTriangle },
    { id: 'assistant' as const, label: 'AI Assistant', icon: Bot },
    { id: 'weather' as const, label: 'Weather Forecast', icon: CloudSun },
    { id: 'irrigation' as const, label: 'Smart Irrigation', icon: Droplet },
    { id: 'reports' as const, label: 'Field Reports', icon: FileText },
    { id: 'profile' as const, label: 'Farmer Profile', icon: User },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Render active component
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            farmName={appSettings.farmName} 
            wateringThreshold={appSettings.wateringThreshold}
            onTabChange={setActiveTab}
            sectorsData={sectorsData}
            setSectorsData={setSectorsData}
            zones={zones}
            setZones={setZones}
            isLiveStreaming={isLiveStreaming}
            setIsLiveStreaming={setIsLiveStreaming}
          />
        );
      case 'detection':
        return <DiseaseDetectionView showToast={showToast} />;
      case 'fertilizer':
        return <FertilizerView />;
      case 'assistant':
        return <AssistantView onTabChange={setActiveTab} showToast={showToast} />;
      case 'advisory':
        return <AdvisoryView sectorsData={sectorsData} />;
      case 'weather':
        return <WeatherView location={appSettings.location} />;
      case 'irrigation':
        return <IrrigationView zones={zones} setZones={setZones} />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView farmName={appSettings.farmName} location={appSettings.location} />;
      case 'settings':
        return (
          <SettingsView 
            settings={appSettings} 
            onSettingsChange={setAppSettings} 
            onSave={handleSaveSettings}
          />
        );
      default:
        return (
          <DashboardView 
            farmName={appSettings.farmName} 
            wateringThreshold={appSettings.wateringThreshold} 
            onTabChange={setActiveTab}
            sectorsData={sectorsData}
            setSectorsData={setSectorsData}
            zones={zones}
            setZones={setZones}
            isLiveStreaming={isLiveStreaming}
            setIsLiveStreaming={setIsLiveStreaming}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased text-gray-800">
      
      {/* Dynamic top alert warning strip */}
      {isAlertBannerVisible && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-2 flex items-center justify-between text-xs font-semibold z-30 shadow-sm border-b border-emerald-800">
          <div className="flex items-center gap-2 max-w-xl truncate">
            <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider shadow-xs">Alert</span>
            <span className="truncate">High humidity favoring crop early blight spore dispersal. Check Leaf Analyzer tool path suggestions.</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleNavClick('detection')} 
              className="hover:underline text-[11px] font-bold text-white whitespace-nowrap cursor-pointer"
            >
              Scan Leaf →
            </button>
            <button 
              onClick={() => setIsAlertBannerVisible(false)} 
              className="p-1 hover:bg-emerald-800/50 rounded-lg text-emerald-300 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar Navigation Panel */}
        <aside className={`hidden lg:flex w-64 flex-col justify-between p-5 z-20 shadow-md transition-colors duration-200 ${
          theme === 'dark' 
            ? 'bg-slate-900 border-r border-slate-800 text-slate-300' 
            : 'bg-white border-r border-slate-200 text-slate-700'
        }`}>
          <div className="space-y-6">
            {/* App logo brand */}
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center gap-2.5 pb-3 border-b w-full text-left transition-colors cursor-pointer group hover:opacity-90 ${
                theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                <Sprout size={20} />
              </div>
              <div>
                <h1 className={`text-md font-bold font-display-lg leading-tight tracking-wide transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-slate-905'
                }`}>AgroMind AI</h1>
                <p className="text-[10px] text-emerald-500 font-semibold font-mono uppercase tracking-widest mt-0.5">&gt; PRECISION</p>
              </div>
            </button>

            {/* Nav list */}
            <nav className="space-y-1.5 flex flex-col">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs select-none cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-extrabold' 
                        : theme === 'dark'
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer block showing connected Status */}
          <div className={`pt-4 border-t space-y-3.5 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border ${
              theme === 'dark' 
                ? 'bg-slate-800/40 border-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-150 text-slate-700'
            }`}>
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                <Cpu size={14} className="animate-pulse" />
              </div>
              <div className="flex-1 truncate">
                <p className={`font-bold text-[10px] uppercase font-mono tracking-wider ${
                  theme === 'dark' ? 'text-white' : 'text-slate-905'
                }`}>Mesh Node: Active</p>
                <p className="text-[9px] text-slate-400 truncate">{appSettings.farmName}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Core application body */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top header navigation bar (Mobile & Search) */}
          <header className={`border-b transition-colors duration-200 py-3.5 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            {/* Left Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-1.5 rounded-lg cursor-pointer transition-all ${
                  theme === 'dark' ? 'text-slate-300 hover:bg-slate-850 border border-slate-800' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Menu size={18} />
              </button>
              <div className="flex items-end gap-1.5">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="group flex items-center gap-1 cursor-pointer"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className={`font-bold text-xs font-mono px-2 py-0.5 rounded uppercase select-none ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-300 group-hover:text-emerald-400' : 'bg-slate-100 text-slate-700 group-hover:text-emerald-600'
                  }`}>{activeTab}</span>
                </button>
              </div>
            </div>

            {/* Right Header notifications */}
            <div className="flex items-center gap-3.5">
              {/* Dynamic Theme Toggle Action Button */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800' 
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                }`}
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                onClick={() => handleNavClick('settings')}
                className={`p-1.5 rounded-xl cursor-pointer transition-all ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                title="System Settings"
              >
                <SettingsIcon size={18} />
              </button>
              <div className={`w-px h-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs select-none border ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200/50 text-slate-700'
                }`}>
                  ET
                </div>
                <div className="hidden md:block">
                  <p className={`text-xs font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Elias Thorne</p>
                  <p className={`text-[9px] mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>Master Agronomist</p>
                </div>
              </div>
            </div>
          </header>

          {/* Active Workscreen panel nested scroll zone */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

      </div>

      {/* Mobile Menu Slide Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop black overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black"
            ></motion.div>

            {/* Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`absolute left-0 top-0 bottom-0 w-64 p-5 flex flex-col justify-between border-r transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-slate-300' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="space-y-6">
                <div className={`flex items-center justify-between border-b pb-3 ${
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <button 
                    onClick={() => handleNavClick('dashboard')}
                    className="flex items-center gap-2 text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                      <Sprout size={18} />
                    </div>
                    <span className={`font-bold text-md font-display-lg leading-tight ${
                      theme === 'dark' ? 'text-white' : 'text-slate-905'
                    }`}>AgroMind AI</span>
                  </button>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-1 rounded-lg cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1.5 flex flex-col">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs select-none cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-emerald-600 text-white font-black shadow shadow-emerald-600/30' 
                            : theme === 'dark'
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className={`border-t pt-3 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <p className={`text-[10px] text-center uppercase font-mono font-bold tracking-widest ${
                  theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                }`}>Mesh Node Online</p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Custom toast system */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-gray-150 rounded-2xl shadow-xl p-4 flex items-start gap-3.5"
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            
            <div className="flex-1 min-w-0 pr-1.5 selection:bg-emerald-100">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider font-mono">
                {toast.type === 'success' ? 'Task Completed' : toast.type === 'warning' ? 'Alert Diagnostic' : 'System Note'}
              </h4>
              <p className="text-gray-700 text-xs mt-1 leading-normal font-medium">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Dismiss note"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
