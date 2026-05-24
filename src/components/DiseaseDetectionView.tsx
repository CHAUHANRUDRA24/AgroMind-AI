import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  ShieldAlert, 
  Info, 
  Award, 
  Cpu, 
  ArrowRight,
  BrainCircuit,
  CornerDownRight,
  FileText,
  MousePointerClick,
  Sparkles,
  CloudLightning
} from 'lucide-react';
import { RecentScan } from '../types';
import { jsPDF } from 'jspdf';

interface DiseaseDetectionViewProps {
  showToast?: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function DiseaseDetectionView({ showToast }: DiseaseDetectionViewProps) {
  const [recentDiagnoses, setRecentDiagnoses] = useState<RecentScan[]>([
    {
      id: 'diag-1',
      crop: 'Tomato',
      disease: 'Tomato Early Blight',
      confidence: 94,
      timeLabel: '2 hours ago',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB986n-NAmnAGi1-d-WyqiVtRuPEsLLE2utF-oh5ktxuwdTjR3-9dc9iCkZ5cXIoJrywEix_iOTMswmlA87NMtIrqClmFMfd_25y3c0J0KOEz2cEiHuHku44miI1jDXCgrN2gy7OD7yKVoVG2L4o83UhnDoehOmE4UVnXhdWL0J6Gj3mUeQ1IxqpJ9Uq25KuUuuIDiEOW7HXfrls1CflVIMXyzydyu-2xGUCBa6UlKDSJPlh3AAMwOUoi-afCsv9chwZ18vtQcJUEIH',
      status: 'Requires Action',
      symptoms: 'Long, anatomical leaf spotting with classic target-shaped concentric rings. Leaf yellowing starting on lower branches.',
      treatment: ['Apply copper-based organic fungicides immediately.', 'Prune the lowest affected stems to prevent soil splash reinfection.', 'Avoid overhead splash watering.'],
      prevention: ['Crop rotation of Solanaceae family', 'Hygiene tools sterilization', 'Mulching soil beds'],
    },
    {
      id: 'diag-2',
      crop: 'Corn',
      disease: 'Healthy Corn',
      confidence: 98,
      timeLabel: 'Yesterday',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvh6KsCqzHNaL12oRtI-87yP39o20v6HSJs6sG57L0BRvxvRri-VWtHRAm2vD9KAQBcY5LF_HZ9ZUNL_41ZurnJ4yss_MrjKx4t8H9GprRNTxUp-UqqW_FkdJFaiq3Xkte3FHItFAcbosEYN8iUhoRIq32PMbJ1__sVtyCt_Mx9M9rNJflU0AyoOPnVdPmV8fSNFxNGqSH3jz5cih8qfb06GkI1eAiUXtKMjCwbQXzydHt1pUuxqt8umvdqeTv36eq58GxJY6Mu2wI',
      status: 'Healthy',
      symptoms: 'Fully vibrant green leaf vein structure. No visible fungal plaques, chlorotic halos, or necrosis identified.',
      treatment: ['Continue current baseline organic fertilizer scheduling.'],
      prevention: ['Resistant maize hybrids pairing', 'Regular sensor calibrations'],
    },
  ]);

  const [activeScan, setActiveScan] = useState<RecentScan | null>(recentDiagnoses[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressLabel, setScanProgressLabel] = useState('');
  const [errorText, setErrorText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset triggers list so users can run scans even without uploading a leaf
  const presets = [
    {
      name: "Wheat Rusty Spots",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB986n-NAmnAGi1-d-WyqiVtRuPEsLLE2utF-oh5ktxuwdTjR3-9dc9iCkZ5cXIoJrywEix_iOTMswmlA87NMtIrqClmFMfd_25y3c0J0KOEz2cEiHuHku44miI1jDXCgrN2gy7OD7yKVoVG2L4o83UhnDoehOmE4UVnXhdWL0J6Gj3mUeQ1IxqpJ9Uq25KuUuuIDiEOW7HXfrls1CflVIMXyzydyu-2xGUCBa6UlKDSJPlh3AAMwOUoi-afCsv9chwZ18vtQcJUEIH",
      mockType: "wheat_rust",
      promptHint: "Wheat Rust (Puccinia graminis) showing reddish-brown pustules on healthy stems."
    },
    {
      name: "Soybean Blight Symptoms",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvh6KsCqzHNaL12oRtI-87yP39o20v6HSJs6sG57L0BRvxvRri-VWtHRAm2vD9KAQBcY5LF_HZ9ZUNL_41ZurnJ4yss_MrjKx4t8H9GprRNTxUp-UqqW_FkdJFaiq3Xkte3FHItFAcbosEYN8iUhoRIq32PMbJ1__sVtyCt_Mx9M9rNJflU0AyoOPnVdPmV8fSNFxNGqSH3jz5cih8qfb06GkI1eAiUXtKMjCwbQXzydHt1pUuxqt8umvdqeTv36eq58GxJY6Mu2wI",
      mockType: "soybean_blight",
      promptHint: "Soybean leaf with water-soaked fungal halos under high humidity."
    }
  ];

  const triggerAnalyzeImage = async (base64Image: string) => {
    setIsScanning(true);
    setErrorText('');
    setScanProgressLabel('Uploading image payload...');

    try {
      setTimeout(() => setScanProgressLabel('Executing path analysis...'), 800);
      setTimeout(() => setScanProgressLabel('Consulting plant botany pathology parameters...'), 1600);

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image }),
      });

      if (!res.ok) {
        throw new Error('Paths to scanning were interrupted by an internal diagnostic error.');
      }

      const diagnosis = await res.json();
      
      const newDiagnosis: RecentScan = {
        id: `diag-${Date.now()}`,
        crop: diagnosis.disease.split(' ')[0] || 'Unknown Crop',
        disease: diagnosis.disease,
        confidence: diagnosis.confidence || 90,
        timeLabel: 'Just now',
        imageUrl: base64Image,
        status: diagnosis.statusText || 'Requires Action',
        symptoms: diagnosis.symptoms,
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
      };

      setRecentDiagnoses(prev => [newDiagnosis, ...prev]);
      setActiveScan(newDiagnosis);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Diagnostic model timing out. Please retry.');
    } finally {
      setIsScanning(false);
      setScanProgressLabel('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        triggerAnalyzeImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        triggerAnalyzeImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Triggers mock scanning for presets
  const selectPreset = (p: typeof presets[0]) => {
    setIsScanning(true);
    setErrorText('');
    setScanProgressLabel('Initializing image preset analysis...');
    
    // Simulate real backend intelligence response using a standard payload
    setTimeout(() => {
      const isRust = p.mockType === "wheat_rust";
      const simulatedResult: RecentScan = {
        id: `diag-${Date.now()}`,
        crop: isRust ? 'Wheat' : 'Soybeans',
        disease: isRust ? 'Wheat Stem Rust' : 'Soybean Bacterial Blight',
        confidence: isRust ? 91 : 87,
        timeLabel: 'Just now',
        imageUrl: p.imageUrl,
        status: 'Requires Action',
        symptoms: isRust 
          ? 'Reddish-brown, elongated, powdery pustules appearing on stems, leaf sheaths, and upper leaves of young wheat strands.'
          : 'Translucent water-soaked lesions developing on leaves, turning reddish-brown with age and surrounded by yellow halos.',
        treatment: isRust
          ? ['Apply systemic triazole fungicide standard treatment immediately.', 'Eradicate surrounding barberry alternative host weeds.', 'Ensure low-nitrogen crop timing balances.']
          : ['Apply copper-containing organic compounds at seven-day intervals.', 'Avoid mechanical harvesting fields until foliage is thoroughly dried.'],
        prevention: isRust
          ? ['Sow highly resistant rust cereal hybrids', 'Optimized fertilizer spacing', 'Weed cleanup']
          : ['Crop rotation options', 'Sanitary farm tools disinfection', 'High-quality seeds selection'],
      };

      setRecentDiagnoses(prev => [simulatedResult, ...prev]);
      setActiveScan(simulatedResult);
      setIsScanning(false);
      setScanProgressLabel('');
    }, 1500);
  };

  const downloadPDFReport = () => {
    if (!activeScan) return;

    try {
      const doc = new jsPDF();

      // Top Header styling
      doc.setFillColor(16, 185, 129); // Emerald-600
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('AgroMind AI', 15, 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('PRECISION AGRONOMIST DECISION SUPPORT ADVISORY', 15, 29);

      // Date stamp
      doc.setFontSize(9);
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Report Date: ${today}`, 135, 22);

      // Body Section
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('CROP HEALTH HEALTH DIAGNOSIS SUMMARY', 15, 50);

      // Draw Separator Line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(15, 54, 195, 54);

      // Parameters Grid
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Target Crop Group:', 15, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(activeScan.crop, 60, 65);

      doc.setFont('helvetica', 'bold');
      doc.text('Identified Pathology:', 15, 75);
      doc.setFont('helvetica', 'normal');
      if (activeScan.status === 'Healthy') {
        doc.setTextColor(16, 185, 129); // Emerald for healthy
      } else {
        doc.setTextColor(220, 38, 38); // Red-600 for disease
      }
      doc.text(activeScan.disease, 60, 75);

      doc.setTextColor(15, 23, 42); // Reset slug
      doc.setFont('helvetica', 'bold');
      doc.text('Match Confidence:', 15, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(`${activeScan.confidence}% Match Criteria`, 60, 85);

      doc.setFont('helvetica', 'bold');
      doc.text('System Action Status:', 15, 95);
      doc.setFont('helvetica', 'normal');
      doc.text(activeScan.status, 60, 95);

      let currentY = 110;

      // Symptoms block
      if (activeScan.symptoms) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Leaf Analysis Symptoms:', 15, currentY);
        currentY += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600
        const symptomsText = doc.splitTextToSize(activeScan.symptoms, 180);
        doc.text(symptomsText, 15, currentY);
        currentY += (symptomsText.length * 5) + 10;
      }

      // Treatments block
      if (activeScan.treatment && activeScan.treatment.length > 0) {
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Recommended Actionable Treatments:', 15, currentY);
        currentY += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        activeScan.treatment.forEach((t) => {
          const treatText = doc.splitTextToSize(`• ${t}`, 180);
          doc.text(treatText, 15, currentY);
          currentY += (treatText.length * 5) + 2;
        });
        currentY += 8;
      }

      // Preventions block
      if (activeScan.prevention && activeScan.prevention.length > 0) {
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Suggested Long-Term Prevention Protocols:', 15, currentY);
        currentY += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        activeScan.prevention.forEach((p) => {
          const prevText = doc.splitTextToSize(`• ${p}`, 180);
          doc.text(prevText, 15, currentY);
          currentY += (prevText.length * 5) + 2;
        });
      }

      // Decorative bottom footer background
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(0, 268, 210, 29, 'F');

      doc.setDrawColor(241, 245, 249); // slate-100
      doc.line(0, 268, 210, 268);

      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const footerMsg = "AgroMind Decision-support output. This advisory sheet represents mock computer vision pathology and Gemini integration recommendations designed in the AgroMind AI ecosystem. Please verify extreme toxicological control operations alongside credentialed regional agronomical agencies.";
      const splitFooter = doc.splitTextToSize(footerMsg, 180);
      doc.text(splitFooter, 15, 275);

      doc.save(`AgroMind_Report_${activeScan.crop.toLowerCase()}_${Date.now()}.pdf`);
      if (showToast) {
        showToast(`Successfully compiled PDF Summary for ${activeScan.crop}! Downloading now.`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast('Failsafe summary format compilation failed.', 'warning');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Titles */}
      <div>
        <h1 className="text-3xl font-display-lg font-bold text-gray-900 tracking-tight">Crop Health Analyzer</h1>
        <p className="text-gray-500 font-body-md mt-1">
          Perform immediate pathogen screening and health diagnoses by uploading crop photographs.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Diagnostic Interface */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Drag-Drop Upload Panel */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`glass-panel border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[340px] text-center relative overflow-hidden group transition-all duration-300 ${
              isScanning 
                ? 'border-emerald-500 bg-emerald-50/10' 
                : 'border-emerald-300 bg-white hover:border-emerald-500 hover:shadow-md'
            }`}
          >
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4 flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 animate-spin relative">
                    <BrainCircuit size={40} className="text-emerald-600" />
                    {/* Visual Scanning beam effect */}
                    <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-950 font-display-lg">AI Diagnostics running...</h3>
                  <p className="text-emerald-700 text-sm font-mono tracking-wide">{scanProgressLabel}</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload size={28} />
                  </div>
                  <div>
                    <h3 className="font-display-lg text-lg font-bold text-gray-950">Drag & Drop Leaf Photograph</h3>
                    <p className="text-gray-500 text-xs mt-1">Formats: PNG, JPG standard images (up to 10MB)</p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Browse Files
                    </button>
                    <button 
                      onClick={() => {
                        if (showToast) {
                          showToast("Allow microphone and camera permissions in your browser to toggle camera view. Re-pairing webcam diagnostics.", "warning");
                        } else {
                          alert("Allow microphone & geolocation notifications inside frames to toggle camera view. Re-pairing webcam diagnostics.");
                        }
                      }}
                      className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera size={14} /> Take Photo
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error notifications */}
            {errorText && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs text-left flex gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p>{errorText}</p>
              </div>
            )}
          </div>

          {/* Quick preset selection tabs for model simulations */}
          <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Diagnostic Simulator Presets</h3>
            <div className="flex flex-wrap gap-2.5">
              {presets.map(p => (
                <button
                  key={p.name}
                  onClick={() => selectPreset(p)}
                  disabled={isScanning}
                  className="bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-500/30 text-gray-700 text-xs font-medium px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs transition-all"
                >
                  <MousePointerClick size={12} className="text-emerald-500" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent diagnoses horizontal slider */}
          <div className="space-y-3">
            <h3 className="font-display-lg text-md font-bold text-gray-900">Recent Crop Diagnostic Queries</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentDiagnoses.map(diag => (
                <div 
                  key={diag.id}
                  onClick={() => setActiveScan(diag)}
                  className={`glass-panel p-3 rounded-xl border cursor-pointer select-none transition-all flex flex-col gap-2 ${
                    activeScan?.id === diag.id 
                      ? 'border-emerald-600 bg-emerald-50/10 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-emerald-500/30'
                  }`}
                >
                  <div className="h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                    <img 
                      src={diag.imageUrl} 
                      alt={diag.disease} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                      diag.status === 'Healthy' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-gray-900 truncate">{diag.disease}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{diag.timeLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Active Diagnostic Results View */}
        <div className="lg:col-span-5">
          {activeScan ? (
            <div className="glass-panel bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden space-y-5">
              {/* Decorative radial gradients background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Cpu size={14} className="text-emerald-500" /> Pathogen Signature
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                  activeScan.status === 'Healthy' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {activeScan.status}
                </span>
              </div>

              {/* Big Crop Disease Header */}
              <div className="flex items-end justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{activeScan.crop} Diagnosis</p>
                  <h2 className="text-xl font-bold text-gray-900 font-display-lg mt-1 tracking-tight">{activeScan.disease}</h2>
                  <p className="text-xs text-emerald-600 font-semibold italic mt-0.5">Exserohilum turcicum</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-slate-50 border-t-emerald-600 flex flex-col items-center justify-center shadow-inner flex-shrink-0">
                  <span className="text-md font-bold text-gray-950 leading-none">{activeScan.confidence}%</span>
                  <span className="text-[8px] text-gray-400 mt-0.5">MATCH</span>
                </div>
              </div>

              {/* Dynamic Diagnostic Details sections */}
              <div className="space-y-4">
                {/* 1. Symptoms */}
                {activeScan.symptoms && (
                  <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-700">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
                      <Info size={14} className="text-emerald-600" /> Identified Leaf Symptoms
                    </h4>
                    <p className="leading-relaxed leading-normal">{activeScan.symptoms}</p>
                  </div>
                )}

                {/* 2. Treatments */}
                {activeScan.treatment && activeScan.treatment.length > 0 && (
                  <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-700">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                      <CheckCircle size={14} className="text-emerald-600" /> Actionable Treatment Remediation
                    </h4>
                    <ul className="space-y-1.5">
                      {activeScan.treatment.map((t, idx) => (
                        <li key={idx} className="flex gap-2 items-start leading-relaxed leading-normal text-gray-600">
                          <CornerDownRight size={12} className="text-emerald-500 mt-1 flex-shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Prevention */}
                {activeScan.prevention && activeScan.prevention.length > 0 && (
                  <div className="bg-slate-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-700">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                      <Award size={14} className="text-emerald-600" /> Prevention Protocols
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeScan.prevention.map((prev, idx) => (
                        <span 
                          key={idx}
                          className="bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-xs whitespace-nowrap uppercase tracking-wider"
                        >
                          {prev}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Local weather impact note */}
              <div className="p-3.5 rounded-xl border border-sky-200/60 bg-sky-50/50 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-sky-800">Local Conditions Danger Alert</h4>
                  <p className="text-sky-900 text-[10px] mt-0.5">Elevated humidity parameters (85%) trigger spore growth acceleration risks.</p>
                </div>
                <CloudLightning className="text-sky-600" size={24} />
              </div>

              {/* PDF Download Button */}
              <button
                onClick={downloadPDFReport}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/15 hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.99] transition-all"
                title="Download highly detailed PDF disease diagnostic summary"
              >
                <FileText size={15} />
                <span>Export Simplified PDF Report</span>
              </button>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-gray-100 text-center text-gray-400 font-body-md shadow-xs bg-white flex flex-col items-center justify-center h-full min-h-[300px]">
              <FileText size={40} className="text-gray-300 mb-3" />
              <span>Select or trigger a leaf diagnosis scan to review pathological parameters here.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
