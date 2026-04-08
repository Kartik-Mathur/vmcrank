import type { InstType } from '../types';
export function detectInstType(name: string): InstType {
  const n = name.toUpperCase();
  if (n.includes('INDIAN INSTITUTE OF TECHNOLOGY') || n.startsWith('IIT ')) return 'IIT';
  if (n.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || n.startsWith('NIT ')) return 'NIT';
  if (n.includes('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY') || n.includes('IIIT')) return 'IIIT';
  if (n.includes('TECHNOLOGY') || n.includes('ENGINEERING') || n.includes('INSTITUTE')) return 'GFTI';
  return 'Other';
}
