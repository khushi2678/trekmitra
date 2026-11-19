export type Level = 'beginner' | 'intermediate' | 'expert';

export interface TrekCard {
    id: number;
    slug: string;
    name: string;
    state: string;
    nearest_city: string;
    level: Level;
    duration_days: number;
    max_altitude_m: number;
    short_description: string;
    cover_url: string | null;
    /** Lowest active package price per person, in paise. */
    from_price: number | null;
}

export interface LevelSummary {
    value: Level;
    trek_count: number;
    min_days: number | null;
    max_days: number | null;
    min_altitude_m: number | null;
    max_altitude_m: number | null;
}

export interface HomeHero {
    photo_url: string;
    trek_name: string;
    state: string;
    slug: string;
    max_altitude_m: number;
    video_url: string | null;
}

export interface ClosingPhoto {
    photo_url: string;
    trek_name: string;
    state: string;
    slug: string;
    max_altitude_m: number;
}

export interface NavMenuData {
    levels: { value: Level; trek_count: number; photo_url: string | null }[];
    states: { name: string; trek_count: number }[];
}

export interface HomePageProps {
    hero: HomeHero | null;
    closing: ClosingPhoto | null;
    featured: TrekCard[];
    recommended: TrekCard[] | null;
    levels: LevelSummary[];
    cities: string[];
}
