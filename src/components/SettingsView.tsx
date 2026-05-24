import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  HelpCircle, 
  Info, 
  Cpu, 
  ShieldAlert, 
  Save, 
  Bell, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onSave: () => void;
}

export default function SettingsView({ settings, onSettingsChange, onSave }: SettingsViewProps) {
  
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      wateringThreshold: parseInt(e.target.value) || 40,
    });
  };

  const handleTextChange = (field: keyof AppSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-display-lg font-bold text-gray-905 tracking-tight flex items-center gap-2">
          System Settings
        </h1>
        <p className="text-gray-500 font-body-md mt-1">
          Adjust farm details, soil triggers, and AI grounding features.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Form Settings inputs */}
        <div className="md:col-span-8 glass-panel bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <SlidersHorizontal className="text-emerald-600" size={18} />
            <h2 className="font-display-lg text-md font-bold text-gray-900">Farm Configurations</h2>
          </div>

          <div className="space-y-4">
            {/* Farm Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Farm Registry Name</label>
              <input 
                type="text" 
                value={settings.farmName}
                onChange={(e) => handleTextChange('farmName', e.target.value)}
                placeholder="Enter farm name..."
                className="w-full bg-transparent border border-gray-250 focus:border-emerald-500 rounded-xl py-2 px-3 text-sm outline-none text-gray-800"
              />
            </div>

            {/* Farm Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Geographical Location</label>
              <input 
                type="text" 
                value={settings.location}
                onChange={(e) => handleTextChange('location', e.target.value)}
                placeholder="Enter country or state..."
                className="w-full bg-transparent border border-gray-250 focus:border-emerald-500 rounded-xl py-2 px-3 text-sm outline-none text-gray-800"
              />
            </div>

            {/* Threshold moisture Slider (Dynamic) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase">Soil Moisture Hydration Warning Threshold</label>
                <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded">{settings.wateringThreshold}%</span>
              </div>
              <input 
                type="range"
                min="20"
                max="80"
                value={settings.wateringThreshold}
                onChange={handleThresholdChange}
                className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Triggers alert statuses on dashboard if moisture content drops below this value.</p>
            </div>

            {/* Notification settings */}
            <div className="pt-2 space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase block">Telemetry Notifications</label>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-150 rounded-xl">
                <div className="text-xs">
                  <p className="font-bold text-gray-800 flex items-center gap-1.5"><Bell size={14} className="text-emerald-600" /> Enable email warnings</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Send alert notices for high pathogen risks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTextChange('enableNotifications', !settings.enableNotifications)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.enableNotifications ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    settings.enableNotifications ? 'right-1' : 'left-1'
                  }`}></div>
                </button>
              </div>
            </div>

            {/* AI Grounding settings */}
            <div className="pt-2 space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase block">AgroMind AI Models & Grounding</label>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-150 rounded-xl">
                <div className="text-xs">
                  <p className="font-bold text-gray-800 flex items-center gap-1.5"><Bot size={14} className="text-emerald-600" /> Enable Google Search Grounding</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Appends real-time weather and commodity crop index queries.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTextChange('enableGrounding', !settings.enableGrounding)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.enableGrounding ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    settings.enableGrounding ? 'right-1' : 'left-1'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onSave}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold p-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
            >
              <Save size={14} /> Update Configurations
            </button>
          </div>
        </div>

        {/* Right Column: Platform Secrets note */}
        <div className="md:col-span-4 space-y-6">
          {/* Key security info box (no input visual keys as requested!) */}
          <div className="glass-panel bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Cpu className="text-emerald-600" size={18} />
                <h3 className="font-display-lg text-md font-bold text-gray-900">Secrets System Info</h3>
              </div>

              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-sky-800 text-xs text-left flex gap-2">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed leading-normal">
                  Your **Gemini API key** is securely hosted on the platform level. It is completely isolated from the browser and injected into server-side controllers automatically.
                </p>
              </div>

              <p className="text-[10px] text-gray-400 font-semibold leading-normal leading-relaxed">
                To update your platform keys and other integrations, use the Secrets management system panels. Default model values utilize standard safe limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
