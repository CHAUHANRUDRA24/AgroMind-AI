/**
 * AgroMind AI Type Declarations
 */

export type ActiveTab =
  | 'dashboard'
  | 'detection'
  | 'fertilizer'
  | 'assistant'
  | 'weather'
  | 'irrigation'
  | 'reports'
  | 'profile'
  | 'settings'
  | 'advisory';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolCard?: {
    type: 'soil_npk' | 'disease_scan' | 'irrigation_warning';
    title: string;
    description: string;
    data?: any;
  };
}

export interface ChatHistorySession {
  id: string;
  title: string;
  lastActive: string;
  messages: ChatMessage[];
}

export interface RecentScan {
  id: string;
  crop: string;
  disease: string;
  confidence: number;
  timeLabel: string;
  imageUrl: string;
  status: 'Requires Action' | 'Healthy' | 'Reviewed';
  symptoms?: string;
  treatment?: string[];
  prevention?: string[];
}

export interface FieldReport {
  id: string;
  date: string;
  zone: string;
  crop: string;
  insight: string;
  status: 'Requires Action' | 'Healthy' | 'Automated';
}

export interface SectorStat {
  temperature: number;
  temperatureChange: string;
  humidity: number;
  humidityChange: string;
  soilMoisture: number;
  soilMoistureStatus: 'Opt' | 'Low' | 'High';
  waterUsage: string;
  waterUsageChange: string;
  cropHealth: number;
  cropHealthStatus: 'Stable' | 'Critical' | 'Optimal';
  rainProbability: number;
  rainProbabilityStatus: 'Low' | 'Medium' | 'High';
}

export interface IrrigationZone {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  moisture: number;
  flowRate: number; // L/min
  nextScheduled: string;
  duration: number; // minutes
}

export interface AppSettings {
  farmName: string;
  location: string;
  alertEmail: string;
  enableNotifications: boolean;
  enableGrounding: boolean;
  wateringThreshold: number; // percentage
  aiModel: string;
}
