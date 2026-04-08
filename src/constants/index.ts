export const JOSAA_THRESHOLDS = { SAFE: 0.85, TARGET: 1.0, AMBITIOUS: 1.08 };
export const JAC_THRESHOLDS   = { SAFE: 0.85, TARGET: 1.0, AMBITIOUS: 1.10 };
export const PER_PAGE = 18;
export const MAX_COMPARE = 3;

export const LABEL_COLORS: Record<string, string> = {
  Safe:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  Target:    'bg-blue-100 text-blue-800 border-blue-200',
  Ambitious: 'bg-amber-100 text-amber-800 border-amber-200',
  'Out of Range': 'bg-red-100 text-red-700 border-red-200',
};

export const LABEL_ICONS: Record<string, string> = {
  Safe: '✓', Target: '◎', Ambitious: '↑', 'Out of Range': '✕',
};

export const INST_TYPE_COLORS: Record<string, string> = {
  IIT: 'bg-violet-100 text-violet-800', NIT: 'bg-sky-100 text-sky-800',
  IIIT: 'bg-teal-100 text-teal-800',    GFTI: 'bg-orange-100 text-orange-800',
  Other: 'bg-gray-100 text-gray-600',
};

export const JAC_INST_META: Record<string, { color: string; accent: string; short: string; full: string; rounds: number; note: string }> = {
  DTU:    { color:'bg-blue-100 text-blue-800',   accent:'#1d4ed8', short:'DTU',    full:'Delhi Technological University',                          rounds:5, note:'Formerly DCE · Delhi & Outside Delhi seats · Girl Child subcategory' },
  NSUT:   { color:'bg-green-100 text-green-800', accent:'#15803d', short:'NSUT',   full:'Netaji Subhas University of Technology',                  rounds:5, note:'3 campuses: Main, East, West · branch availability varies by campus' },
  IGDTUW: { color:'bg-pink-100 text-pink-800',   accent:'#be185d', short:'IGDTUW', full:'Indira Gandhi Delhi Technical University for Women',      rounds:5, note:'Women-only institution · all seats for female candidates' },
  'IIIT-D':{ color:'bg-purple-100 text-purple-800',accent:'#7c3aed',short:'IIIT-D',full:'Indraprastha Institute of Information Technology Delhi', rounds:2, note:'Only 2 JAC rounds · "With Bonus" rows for strong board scores' },
};

export const QUOTA_LABELS: Record<string, string> = {
  AI:'All India', HS:'Home State', OS:'Other State',
  GO:'Goa (State)', JK:'Jammu & Kashmir', LA:'Ladakh',
};

export const SEAT_TYPE_ORDER = [
  'OPEN','EWS','OBC-NCL','SC','ST','OPEN (PwD)','OBC-NCL (PwD)','EWS (PwD)','SC (PwD)','ST (PwD)',
];

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Delhi','Jammu and Kashmir','Ladakh','Puducherry',
].sort();
