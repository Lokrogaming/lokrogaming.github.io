export interface Application {
  id: string;
  title: string;
  team: string;
  status: 'open' | 'closed';
  summary: string;
  requirements: string[];
  questions: ApplicationQuestion[];
}

export interface ApplicationQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  required: boolean;
}

export interface HallOfFameEntry {
  name: string;
  role: string;
  description: string;
  avatar?: string;
  link?: string;
  featured?: boolean;
}

export interface ChangelogEntry {
  id: string;
  slug: string;
  title: string;
  version?: string;
  date: string;
  summary: string;
  content_html?: string;
  tags: string[];
  url?: string;
}

export interface RoadmapItem {
  id: string;
  status: 'planned' | 'in-progress' | 'done';
  eta?: string | null;
  title: Record<string, string>;
  description: Record<string, string>;
}

export interface ThemeColor {
  id: string;
  name: string;
  colors: Record<string, string>;
  headerShadow?: boolean;
  author?: { name: string; platform: string; username: string } | null;
}

export interface SiteSettings {
  seasonalTheme: boolean;
  weatherEgg: boolean;
  reducedMotion: boolean;
  themeId: string;
}
