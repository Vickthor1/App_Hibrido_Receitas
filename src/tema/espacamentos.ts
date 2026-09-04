// Espaçamentos e shapes — DESIGN.md
export const espacamentos = {
  // base 8px
  xs: 4,
  sm: 8, // stack-sm
  md: 16, // stack-md / gutter
  lg: 24, // stack-lg
  xl: 32, // stack-xl
  page: 20, // margin-page
  gutter: 16,
} as const;

export const arredondamento = {
  sm: 4, // 0.25rem
  padrao: 8, // 0.5rem (DEFAULT)
  md: 12, // 0.75rem
  lg: 16, // 1rem (cards, hero)
  xl: 24, // 1.5rem
  pill: 9999,
} as const;

export const sombras = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  nav: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;

export const layout = {
  maxWidth: 1280,
  bottomNavHeight: 88,
  topBarHeight: 64,
} as const;
