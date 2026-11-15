export interface Palette {
  appBar: string;
  onAppBar: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  grid: string;
  gridStrong: string;
  given: string;
  entered: string;
  wrong: string;
  selected: string;
  peer: string;
  sameValue: string;
  overlay: string;
}

/** Paper & Ink: cream stock, warm ink, no shadows — hairlines do the separating. */
export const palette: Palette = {
  appBar: '#F4EFE4',
  onAppBar: '#2B2B2B',
  background: '#FBF8F1',
  surface: '#F4EFE4',
  surfaceAlt: '#E9E1D1',
  border: '#D8CFBE',
  divider: '#E2DACA',
  text: '#2B2B2B',
  textMuted: '#7A7168',
  accent: '#8C3B2E',
  accentText: '#FBF8F1',
  accentSoft: '#E8DFCB',
  grid: '#D8CFBE',
  gridStrong: '#7A7168',
  given: '#2B2B2B',
  entered: '#8C3B2E',
  wrong: '#A3231C',
  selected: '#E8DFCB',
  peer: '#F2ECE0',
  sameValue: '#EDE4D2',
  overlay: 'rgba(43, 43, 43, 0.45)',
};

export function useTheme(): { palette: Palette } {
  return { palette };
}
