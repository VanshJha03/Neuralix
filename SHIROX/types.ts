
export type TaskMode = 'Deep Research' | 'Fast' | 'Imagine';

export type ViewType = 'chat' | 'search' | 'ideas' | 'marketing' | 'interests' | 'settings' | 'analytics';

export interface UserSettings {
  name: string;
  email: string;
  handle: string;
  avatarColor: string;
  customSystemPrompt: string;
  styles?: string[];
  linkedAccounts?: {
    platform: 'IG' | 'X' | 'YT';
    username: string;
    handle: string;
    niche: string;
  }[];
}

export interface SocialAccount {
  id: string;
  platform: 'IG' | 'X' | 'YT';
  name: string;
  handle: string;
  followers: number;
  posts: number;
}

export interface Interest {
  id: string;
  label: string;
  active: boolean;
}

export interface NicheContent {
  id: string;
  platform: 'IG' | 'X' | 'YT';
  title: string;
  channel: string;
  views: string;
  date: string;
  url: string;
  thumbnail: string;
}

export interface Target {
  id: string;
  accountId: string;
  targetFollowers: number;
  targetPosts: number;
  deadline: string;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  type: 'Deep Research' | 'Imagine';
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: TaskMode;
  sources?: any[];
}

export interface Trend {
  platform: 'Instagram' | 'YouTube' | 'Twitter';
  topic: string;
  engagement: string;
  hook?: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  platform: 'X' | 'IG' | 'YT' | 'WEB';
  isActive: boolean;
}

export interface VoiceRating {
  confidence: number;
  clarity: number;
  pacing: number;
  accentMatch: number;
  feedback: string;
}

export interface ViralPrediction {
  topic: string;
  velocity: 'Early' | 'Rising' | 'Peak' | 'Saturation';
  score: number;
  why: string;
}

export interface CreatorAnalysis {
  name: string;
  platform: 'IG' | 'X' | 'YT';
  style: string;
  successfulHooks: string[];
}

export interface GapAnalysis {
  trend: string;
  crowdIsSaying: string;
  missingPiece: string;
  hookUSP: string;
}
