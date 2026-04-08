import * as XLSX from 'xlsx';
import type { JosaaRecord } from '../types';

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = parseInt(String(v).trim().replace(/,/g, '').replace(/P$/i, ''), 10);
  return isNaN(n) ? null : n;
}
function str(v: unknown) { return String(v ?? '').trim().replace(/\s+/g, ' '); }

export async function parseExcelFromUrl(url: string): Promise<JosaaRecord[]> {
  const buf = await (await fetch(url)).arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
  return rows.flatMap(r => {
    const institute = str(r['Institute'] ?? r['institute']);
    const program   = str(r['Academic Program Name'] ?? r['Program'] ?? r['programme']);
    const quota     = str(r['Quota'] ?? r['quota']);
    const seatType  = str(r['Seat Type'] ?? r['seat_type'] ?? r['Category']);
    const gender    = str(r['Gender'] ?? r['gender']);
    const openingRank = toNum(r['Opening Rank'] ?? r['opening_rank']);
    const closingRank = toNum(r['Closing Rank'] ?? r['closing_rank']);
    if (!institute || !program || !quota) return [];
    return [{ institute, program, quota, seatType, gender, openingRank, closingRank }];
  });
}
