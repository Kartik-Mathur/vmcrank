import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppMode,
  JosaaRecord, JosaaProfile, JosaaFilters, JosaaResult,
  JacRecord,   JacProfile,   JacFilters,   JacResult,
} from '../types';

// ── defaults ──────────────────────────────────────────────────────────────────
const D_JOSAA_PROFILE: JosaaProfile = {
  advRank: null, mainRank: null, category: 'OPEN',
  gender: 'Gender-Neutral', homeState: '',
};
const D_JOSAA_FILTERS: JosaaFilters = {
  instTypeFilter: 'ALL', quotas: [], seatTypes: [], genders: [],
  searchText: '', sortBy: 'bestMatch', subtypeChips: [],
};
const D_JAC_PROFILE: JacProfile = {
  mainRank: null, reservationGroup: 'General',
  subcategory: 'Gender Neutral', region: 'Delhi', gender: 'male',
};
const D_JAC_FILTERS: JacFilters = {
  institutes: [], campuses: [], bonusType: 'Without Bonus',
  searchText: '', sortBy: 'bestMatch', showAmbitious: false,
};

// ── store shape ───────────────────────────────────────────────────────────────
interface Store {
  // nav
  mode: AppMode;
  setMode: (m: AppMode) => void;

  // josaa data
  josaaRecords: JosaaRecord[];
  josaaLoading: boolean;
  josaaError: string | null;
  setJosaaRecords: (r: JosaaRecord[]) => void;
  setJosaaLoading: (v: boolean) => void;
  setJosaaError: (e: string | null) => void;

  // jac data
  jacRecords: JacRecord[];
  jacLoading: boolean;
  jacError: string | null;
  setJacRecords: (r: JacRecord[]) => void;
  setJacLoading: (v: boolean) => void;
  setJacError: (e: string | null) => void;

  // josaa state
  josaaProfile: JosaaProfile;
  setJosaaProfile: (p: Partial<JosaaProfile>) => void;
  josaaFilters: JosaaFilters;
  setJosaaFilters: (f: Partial<JosaaFilters>) => void;
  resetJosaaFilters: () => void;
  josaaSearched: boolean;
  setJosaaSearched: (v: boolean) => void;

  // jac state
  jacProfile: JacProfile;
  setJacProfile: (p: Partial<JacProfile>) => void;
  jacFilters: JacFilters;
  setJacFilters: (f: Partial<JacFilters>) => void;
  resetJacFilters: () => void;
  jacSearched: boolean;
  setJacSearched: (v: boolean) => void;

  // shared UI
  viewMode: 'card' | 'table';
  setViewMode: (v: 'card' | 'table') => void;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (v: boolean) => void;
  page: number;
  setPage: (p: number) => void;

  // bookmarks
  josaaBookmarks: Set<string>;
  toggleJosaaBookmark: (k: string) => void;
  jacBookmarks: Set<string>;
  toggleJacBookmark: (k: string) => void;

  // compare
  josaaCompare: JosaaResult[];
  toggleJosaaCompare: (r: JosaaResult) => void;
  josaaCompareOpen: boolean;
  setJosaaCompareOpen: (v: boolean) => void;

  jacCompare: JacResult[];
  toggleJacCompare: (r: JacResult) => void;
  jacCompareOpen: boolean;
  setJacCompareOpen: (v: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      mode: 'josaa',
      setMode: (mode) => set({ mode, page: 0 }),

      josaaRecords: [], josaaLoading: true, josaaError: null,
      setJosaaRecords: (josaaRecords) => set({ josaaRecords }),
      setJosaaLoading: (josaaLoading) => set({ josaaLoading }),
      setJosaaError: (josaaError) => set({ josaaError }),

      jacRecords: [], jacLoading: true, jacError: null,
      setJacRecords: (jacRecords) => set({ jacRecords }),
      setJacLoading: (jacLoading) => set({ jacLoading }),
      setJacError: (jacError) => set({ jacError }),

      josaaProfile: D_JOSAA_PROFILE,
      setJosaaProfile: (p) => set((s) => ({ josaaProfile: { ...s.josaaProfile, ...p } })),
      josaaFilters: D_JOSAA_FILTERS,
      setJosaaFilters: (f) => set((s) => ({ josaaFilters: { ...s.josaaFilters, ...f }, page: 0 })),
      resetJosaaFilters: () => set({ josaaFilters: D_JOSAA_FILTERS }),
      josaaSearched: false,
      setJosaaSearched: (josaaSearched) => set({ josaaSearched }),

      jacProfile: D_JAC_PROFILE,
      setJacProfile: (p) => set((s) => ({ jacProfile: { ...s.jacProfile, ...p } })),
      jacFilters: D_JAC_FILTERS,
      setJacFilters: (f) => set((s) => ({ jacFilters: { ...s.jacFilters, ...f }, page: 0 })),
      resetJacFilters: () => set({ jacFilters: D_JAC_FILTERS }),
      jacSearched: false,
      setJacSearched: (jacSearched) => set({ jacSearched }),

      viewMode: 'card', setViewMode: (viewMode) => set({ viewMode }),
      mobileFiltersOpen: false, setMobileFiltersOpen: (mobileFiltersOpen) => set({ mobileFiltersOpen }),
      page: 0, setPage: (page) => set({ page }),

      josaaBookmarks: new Set(),
      toggleJosaaBookmark: (k) => set((s) => {
        const b = new Set(s.josaaBookmarks); b.has(k) ? b.delete(k) : b.add(k); return { josaaBookmarks: b };
      }),
      jacBookmarks: new Set(),
      toggleJacBookmark: (k) => set((s) => {
        const b = new Set(s.jacBookmarks); b.has(k) ? b.delete(k) : b.add(k); return { jacBookmarks: b };
      }),

      josaaCompare: [], josaaCompareOpen: false,
      toggleJosaaCompare: (r) => set((s) => {
        const key = `${r.institute}||${r.program}||${r.quota}||${r.seatType}`;
        const idx = s.josaaCompare.findIndex(x => `${x.institute}||${x.program}||${x.quota}||${x.seatType}` === key);
        if (idx >= 0) return { josaaCompare: s.josaaCompare.filter((_, i) => i !== idx) };
        if (s.josaaCompare.length >= 3) return s;
        return { josaaCompare: [...s.josaaCompare, r] };
      }),
      setJosaaCompareOpen: (josaaCompareOpen) => set({ josaaCompareOpen }),

      jacCompare: [], jacCompareOpen: false,
      toggleJacCompare: (r) => set((s) => {
        const key = `${r.institute}||${r.branch}||${r.category}`;
        const idx = s.jacCompare.findIndex(x => `${x.institute}||${x.branch}||${x.category}` === key);
        if (idx >= 0) return { jacCompare: s.jacCompare.filter((_, i) => i !== idx) };
        if (s.jacCompare.length >= 3) return s;
        return { jacCompare: [...s.jacCompare, r] };
      }),
      setJacCompareOpen: (jacCompareOpen) => set({ jacCompareOpen }),
    }),
    {
      name: 'rank-predictor-v3',
      partialize: (s) => ({
        mode: s.mode,
        josaaProfile: s.josaaProfile, josaaFilters: s.josaaFilters, viewMode: s.viewMode,
        jacProfile: s.jacProfile, jacFilters: s.jacFilters,
        josaaBookmarks: [...s.josaaBookmarks], jacBookmarks: [...s.jacBookmarks],
      }),
      merge: (saved: unknown, cur) => {
        const p = saved as Record<string, unknown>;
        return {
          ...cur, ...p,
          josaaBookmarks: new Set((p.josaaBookmarks as string[]) ?? []),
          jacBookmarks: new Set((p.jacBookmarks as string[]) ?? []),
        };
      },
    }
  )
);
