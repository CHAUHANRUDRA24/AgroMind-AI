import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  MapPin, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  CloudRain, 
  Clock, 
  Settings, 
  Star,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ProfileViewProps {
  farmName: string;
  location: string;
}

export default function ProfileView({ farmName, location }: ProfileViewProps) {
  const farmerBio = {
    name: "Elias Thorne",
    title: "Chief Precision Agronomist & Farm Owner",
    farmID: "#8204-Alpha-Precise",
    coordinates: "38.5816° N, 121.4944° W",
    experience: "15+ Years Sustainable Cultivation",
  };

  const bioAchievements = [
    { name: "Nitrogen Balancer Badge", desc: "Perfect split urea application timings achieved consecutive weeks.", icon: ShieldCheck, status: "Unlocked" },
    { name: "Water Guard Master Accord", desc: "Saved 12k L water by following rain holding advice forecasts.", icon: Award, status: "Unlocked" },
    { name: "Solanaceae Harvest Standard", desc: "Kept Early Blight tomato yields pathogen-free.", icon: Star, status: "Unlocked" },
    { name: "Carbon Neutral Pioneer", desc: "Verify 100 acres set under solar grid pumps.", icon: Sparkles, status: "Locked" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Titles */}
      <div>
        <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Agronomist Profile
        </h1>
        <p className="text-gray-500 font-body-md mt-1">
          Review credentials, dynamic badges, sustainable achievements, and coordinates.
        </p>
      </div>

      {/* Main Grid Card layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card layout */}
        <div className="lg:col-span-8 glass-panel bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          
          {/* Decorative map outline graphic in corner */}
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 translate-y-2 select-none text-emerald-800 uppercase font-mono font-bold text-[140px]">
            MAP
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start z-10 relative">
            {/* Avatar Sphere */}
            <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold font-display-lg text-4xl select-none flex-shrink-0">
              ET
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-md inline-block uppercase tracking-wider">
                  Precise Account Registered
                </p>
                <h2 className="text-2xl font-bold font-display-lg text-gray-900 tracking-tight mt-2">{farmerBio.name}</h2>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{farmerBio.title}</p>
              </div>

              {/* Farmer parameters details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs pt-2">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin size={14} className="text-emerald-600" />
                  <span>Farm ID: <span className="font-bold text-gray-950 font-mono">{farmerBio.farmID}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock size={14} className="text-emerald-600" />
                  <span>Farm Place: <span className="font-semibold text-gray-900">{farmName}, {location}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <TrendingUp size={14} className="text-emerald-600" />
                  <span>GPS Vectors: <span className="font-mono text-[10px] text-gray-900">{farmerBio.coordinates}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Experience: <span className="font-semibold text-gray-950">{farmerBio.experience}</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex items-start gap-3 mt-6">
            <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-gray-900">Carbon offset telemetry validated</h4>
              <p className="text-gray-500 text-[11px] mt-0.5">Your sustainable soil-conservation techniques balance -12 Metric Tons carbon sequestered this solar cycle.</p>
            </div>
          </div>

        </div>

        {/* Circular Gauge Metrics side-panel */}
        <div className="lg:col-span-4 glass-panel bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h3 className="font-display-lg text-md font-bold text-gray-900 pb-2 border-b border-gray-100 mb-4 flex items-center justify-center gap-1.5">
              <TrendingUp className="text-emerald-600" size={16} /> Productivity Rank
            </h3>
            
            {/* Beautiful visual circle progress loop using raw SVG */}
            <div className="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle track */}
                <circle 
                  cx="72" cy="72" r="60" 
                  className="stroke-gray-100" strokeWidth="12" fill="transparent" 
                />
                {/* Colored highlight loader path */}
                <circle 
                  cx="72" cy="72" r="60" 
                  className="stroke-emerald-500" strokeWidth="12" fill="transparent" 
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * 94) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold font-display-lg text-gray-950">94%</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Optimal</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-4 font-semibold">
            Productivity score parsed across 18 telemetry vectors.
          </p>
        </div>

      </div>

      {/* Grid: Unlocked Achievements and Badges */}
      <div className="glass-panel bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="font-display-lg text-md font-bold text-gray-900 flex items-center gap-1.5 animate-pulse">
            <Award size={16} className="text-emerald-600 animate-bounce" /> Crop Sustainability Achievements
          </h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded uppercase">Dynamic Badges</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {bioAchievements.map((ach) => {
            const Icon = ach.icon;
            const isLocked = ach.status === "Locked";
            return (
              <div 
                key={ach.name}
                className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden group ${
                  isLocked 
                    ? 'border-gray-200 bg-slate-50/50' 
                    : 'border-emerald-300 bg-emerald-50/10 hover:shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${
                    isLocked ? 'bg-gray-100 text-gray-400' : 'bg-emerald-55 text-emerald-800'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded ${
                    isLocked ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ach.status}
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className={`text-xs font-bold leading-tight ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{ach.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 mt-0.5 leading-relaxed leading-normal">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
