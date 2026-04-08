// ─── Shared ──────────────────────────────────────────────────────────────────
export type AppMode = 'josaa' | 'jac';
export type RecLabel = 'Safe' | 'Target' | 'Ambitious' | 'Out of Range';
export type SortOpt = 'bestMatch' | 'lowestClosing' | 'highestClosing' | 'nameAZ';

// ─── JoSAA ───────────────────────────────────────────────────────────────────
export interface JosaaRecord {
  institute: string;
  program: string;
  quota: string;
  seatType: string;
  gender: string;
  openingRank: number | null;
  closingRank: number | null;
}

export type InstType = 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'Other';
export type InstTypeFilter = 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'ALL';

export interface JosaaResult extends JosaaRecord {
  instType: InstType;
  label: RecLabel;
  rankGap: number;
  score: number;
  candidateRank: number;
}

export interface JosaaProfile {
  advRank: number | null;
  mainRank: number | null;
  category: string;
  gender: string;
  homeState: string;
}

export interface JosaaFilters {
  instTypeFilter: InstTypeFilter;
  quotas: string[];
  seatTypes: string[];
  genders: string[];
  searchText: string;
  sortBy: SortOpt;
  subtypeChips: InstType[];
}

export interface JosaaStats {
  total: number; safe: number; target: number; ambitious: number;
}

// ─── JAC ─────────────────────────────────────────────────────────────────────
export interface JacRecord {
  institute: string;
  instituteFull: string;
  category: string;
  categoryFull: string;
  reservationGroup: string;
  subcategory: string;
  region: string;
  branch: string;
  campus: string;
  bonusType: string | null;
  totalRounds: number;
  r1: number | null;
  r2: number | null;
  r3: number | null;
  r4: number | null;
  r5: number | null;
  finalRank: number | null;
}

export interface JacResult extends JacRecord {
  label: RecLabel;
  rankGap: number;
  candidateRank: number;
  score: number;
}

export interface JacProfile {
  mainRank: number | null;
  reservationGroup: string;
  subcategory: string;
  region: string;
  gender: string;
}

export interface JacFilters {
  institutes: string[];
  campuses: string[];
  bonusType: string;
  searchText: string;
  sortBy: 'bestMatch' | 'lowestClosing' | 'nameAZ' | 'institute';
  showAmbitious: boolean;
}

export interface JacStats {
  total: number; safe: number; target: number; ambitious: number;
}
