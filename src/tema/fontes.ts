// Tipografia editorial — Be Vietnam Pro com hierarquia vitoriana
// Headlines com tracking negativo e peso 700, body denso 14px, labels uppercase tracking 0.05em
export const fontes = {
  // Editorial display — usado no hero
  display: { fontFamily: "BeVietnamPro_700Bold", fontSize: 42, fontWeight: "700" as const, lineHeight: 44, letterSpacing: -0.03 },
  displayMobile: { fontFamily: "BeVietnamPro_700Bold", fontSize: 28, fontWeight: "700" as const, lineHeight: 32, letterSpacing: -0.02 },
  headlineXl: { fontFamily: "BeVietnamPro_700Bold", fontSize: 28, fontWeight: "700" as const, lineHeight: 34, letterSpacing: -0.02 },
  headlineXlMobile: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, fontWeight: "700" as const, lineHeight: 30 },
  headlineLg: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, fontWeight: "700" as const, lineHeight: 28, letterSpacing: -0.01 },
  headlineMd: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  bodyLg: { fontFamily: "BeVietnamPro_400Regular", fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodyMd: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  labelMd: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, fontWeight: "500" as const, lineHeight: 16, letterSpacing: 0.01 },
  labelSm: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, fontWeight: "600" as const, lineHeight: 12, letterSpacing: 0.08, textTransform: "uppercase" as const },
} as const;

export const texto = {
  titulo: fontes.display,
  tituloMobile: fontes.displayMobile,
  subtitulo: fontes.headlineLg,
  subtituloMd: fontes.headlineMd,
  corpo: fontes.bodyMd,
  corpoGrande: fontes.bodyLg,
  rotulo: fontes.labelMd,
  rotuloPequeno: fontes.labelSm,
} as const;
