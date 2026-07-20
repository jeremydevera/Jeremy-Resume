export interface Category {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
}

export interface Social {
  label: string;
  url: string;
}

export interface Stat {
  value: string;
  label: string;
  href?: string;
}

export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  email: string;
  location?: string;
  avatar_key?: string | null;
  avatar_url?: string | null;
  available_for_hire: boolean;
  socials: Social[];
  stats: Stat[];
  home_layout?: string;
  projects_layout?: string;
  experience_layout?: string;
  experience_intro?: string;
}

export interface ProjectImage {
  id: number;
  r2_key?: string;
  url?: string;
  alt?: string | null;
  sort_order?: number;
}

export interface ProjectListItem {
  id: number;
  slug: string;
  title: string;
  tagline?: string | null;
  summary?: string | null;
  cover_image_key?: string | null;
  cover_url?: string | null;
  link_url?: string | null;
  category_id?: number | null;
  category_slug?: string | null;
  category_name?: string | null;
  status?: string;
  sort_order?: number;
  featured?: boolean;
  skills?: string[];
}

export interface ProjectDetail extends ProjectListItem {
  body_markdown?: string | null;
  images: ProjectImage[];
}

export interface ResumeEntry {
  id: number;
  period: string;
  role: string;
  org?: string | null;
  location?: string | null;
  kind?: string;
  description?: string;
  skills: string[];
  sort_order: number;
  show_period_home?: boolean;
}

export interface HomeData {
  profile: Profile | null;
  categories: Category[];
  projects: ProjectListItem[];
  resume: ResumeEntry[];
}
