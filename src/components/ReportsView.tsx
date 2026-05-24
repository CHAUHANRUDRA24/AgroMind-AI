import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Clock, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { FieldReport } from '../types';

export default function ReportsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const initialReportsState: FieldReport[] = [
    { id: 'rep-1', date: 'May 23, 2026', zone: 'Sector Alpha', crop: 'Soybeans', insight: 'Early Blight spotted under moist canopy conditions. Copper fungicide treatment triggered.', status: 'Requires Action' },
    { id: 'rep-2', date: 'May 22, 2026', zone: 'Sector Beta', crop: 'Winter Wheat', insight: 'Soil moisture values dropping below threshold limits. Dynamic watering override started.', status: 'Automated' },
    { id: 'rep-3', date: 'May 21, 2026', zone: 'Sector Gamma', crop: 'Corn', insight: 'Vibrancy, chlorophyll readings, and vein density indices fully optimal.', status: 'Healthy' },
    { id: 'rep-4', date: 'May 19, 2026', zone: 'Sector Alpha', crop: 'Soybeans', insight: 'Baseline Nitrogen levels checked. 46-0-0 standard fertilizer balance suggest timing guidelines.', status: 'Healthy' },
    { id: 'rep-5', date: 'May 18, 2026', zone: 'Sector Beta', crop: 'Winter Wheat', insight: 'Moisture tracking buffers holding stable. Wet weather forecasts parsed.', status: 'Healthy' },
    { id: 'rep-6', date: 'May 15, 2026', zone: 'Sector Gamma', crop: 'Corn', insight: 'Yield forecast predictions recalculating above standard targets (+4%).', status: 'Healthy' },
  ];

  // Filtering list
  const filteredReports = initialReportsState.filter(rep => {
    const matchesSearch = rep.zone.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rep.insight.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = selectedCropFilter === 'All' || rep.crop === selectedCropFilter;
    const matchesStatus = selectedStatusFilter === 'All' || rep.status === selectedStatusFilter;

    return matchesSearch && matchesCrop && matchesStatus;
  });

  // Simple pagination logic
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Trigger real local CSV data compilation export download!
  const triggerExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Zone,Crop,AI Path Analysis,Status\n";
    
    filteredReports.forEach(rep => {
      csvContent += `"${rep.date}","${rep.zone}","${rep.crop}","${rep.insight.replace(/"/g, '""')}","${rep.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agromind_farm_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cropYieldData = [
    { name: "Soybeans", current: 85, target: 90 },
    { name: "Wheat", current: 95, target: 88 },
    { name: "Corn", current: 78, target: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Field Reports & Diagnostics
          </h1>
          <p className="text-gray-500 font-body-md mt-1">
            Browse structured farm history logs, productivity sheets, and export analytics.
          </p>
        </div>
        <button
          onClick={triggerExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer w-full md:w-auto active:scale-95"
        >
          <Download size={14} /> Export Report (.CSV)
        </button>
      </div>

      {/* Grid: Charts Comparison and Soil NPK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Yield Chart Comparison block (Pure responsive HTML / SVGs) */}
        <div className="lg:col-span-8 glass-panel bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-2">
            <div>
              <h3 className="font-display-lg text-md font-bold text-gray-900">Crop Yield vs Target Expectations</h3>
              <p className="text-gray-400 text-xs mt-0.5">Estimated production metrics (Bushels/Acre) dynamic indexes.</p>
            </div>
            <TrendingUp className="text-emerald-600" size={18} />
          </div>

          <div className="space-y-5 pt-3">
            {cropYieldData.map((crop, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-800">{crop.name} Yields</span>
                  <span className="text-gray-400 font-mono">Current: <span className="font-bold text-gray-900">{crop.current} bu/A</span> / Target: {crop.target}</span>
                </div>
                {/* Dual progress bar representing target overlay */}
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-gray-200/40 relative">
                  {/* Current progress */}
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${(crop.current / 100) * 100}%` }}
                  ></div>
                  {/* Marker overlay for target */}
                  <div 
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500" 
                    style={{ left: `${(crop.target / 100) * 100}%` }}
                    title={`Target Target: ${crop.target}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NPK Parameters sidebar */}
        <div className="lg:col-span-4 glass-panel bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Database className="text-emerald-600" size={18} />
              <h3 className="font-display-lg text-md font-bold text-gray-900">Soil NPK Ratios</h3>
            </div>

            <div className="space-y-3">
              {/* Nitrogen */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-gray-800">Nitrogen (N)</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Vein chlorophyll builder</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                  Normal
                </span>
              </div>

              {/* Phosphorus */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-gray-800">Phosphorus (P)</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Root and bloom multiplier</p>
                </div>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                  High
                </span>
              </div>

              {/* Potassium */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-gray-800">Potassium (K)</p>
                  <p className="text-gray-400 text-[10px] mt-0.5">Cold and pest inhibitor</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase">
                  Optimal
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-[10px] text-gray-400 font-semibold mt-4">
            Sensor telemetry updated: Today
          </div>
        </div>

      </div>

      {/* Main Table: Historical Logs with searching and paging filters */}
      <div className="glass-panel bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        
        {/* Search controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5 font-display-lg text-md font-bold text-gray-900">
            <SlidersHorizontal size={16} className="text-emerald-600" /> Filter Logs Table
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search report logs..."
                className="w-full md:w-60 bg-transparent border border-gray-200 focus:border-emerald-500 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none text-gray-800"
              />
            </div>

            {/* Crop Select */}
            <select
              value={selectedCropFilter}
              onChange={(e) => {
                setSelectedCropFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border border-gray-200 focus:border-emerald-500 rounded-xl p-1.5 text-xs text-gray-700 outline-none cursor-pointer"
            >
              <option value="All">All Crops</option>
              <option value="Soybeans">Soybeans</option>
              <option value="Winter Wheat">Wheat</option>
              <option value="Corn">Corn</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border border-gray-200 focus:border-emerald-500 rounded-xl p-1.5 text-xs text-gray-700 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Requires Action">Requires Action</option>
              <option value="Automated">Automated</option>
            </select>
          </div>
        </div>

        {/* Table representation workspace */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-700">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Sector Zone</th>
                <th className="py-3 px-4">Active Crop</th>
                <th className="py-3 px-4">AI Diagnostic Insights</th>
                <th className="py-3 px-4 text-right">Diagnosis status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((rep) => (
                  <tr 
                    key={rep.id} 
                    className="border-b border-gray-50 hover:bg-slate-50/70 transition-all font-body-md"
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">{rep.date}</td>
                    <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">{rep.zone}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {rep.crop}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 leading-relaxed font-normal min-w-[280px]">{rep.insight}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                        rep.status === 'Healthy' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : rep.status === 'Automated'
                          ? 'bg-sky-50 border-sky-200 text-sky-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-body-md select-none">
                    No field reports found matching filter conditions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paging controls box */}
        {filteredReports.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-400">Showing {paginatedReports.length} of {filteredReports.length} index reports.</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg cursor-pointer text-gray-500"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg cursor-pointer text-gray-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
