export const EASE = {
  outCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  outQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  springSlow: 'cubic-bezier(0.22, 1, 0.36, 1)',
  springMed: 'cubic-bezier(0.16, 1, 0.3, 1)',
  springHover: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const

export const DURATION = {
  lineReveal: 0.9,
  wordReveal: 0.7,
  headerEnter: 0.7,
  panelEnter: 0.8,
  hover: 0.35,
  modal: 0.5,
  navOverlay: 0.45,
} as const

export const STAGGER = {
  line: 0.12,
  word: 0.035,
  footerLine: 0.1,
  listItem: 0.09,
} as const

export const RADIUS = {
  pill: '9999px',
  card: '2rem',
  cardSm: '1.25rem',
  control: '0.875rem',
} as const

export const ADAPTIVE_GRID = {
  fontBase: 16,
  baseWidth: 1920,
  coef: 0.6666,
} as const
