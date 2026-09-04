// Tipografia — Be Vietnam Pro (via @expo-google-fonts/be-vietnam-pro)
// DESIGN.md: headline-xl 28/34 700, headline-lg 22/28 700, headline-md 18/24 600, body-lg 16/24 400, body-md 14/20 400, label-md 12/16 500, label-sm 10/12 600

export const fontes = {
  headlineXl: { fontFamily: "BeVietnamPro_700Bold", fontSize: 28, fontWeight: "700" as const, lineHeight: 34, letterSpacing: -0.56 },
  headlineXlMobile: { fontFamily: "BeVietnamPro_700Bold", fontSize: 24, fontWeight: "700" as const, lineHeight: 30 },
  headlineLg: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, fontWeight: "700" as const, lineHeight: 28, letterSpacing: -0.22 },
  headlineMd: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  bodyLg: { fontFamily: "BeVietnamPro_400Regular", fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodyMd: { fontFamily: "BeVietnamPro_400Regular", fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  labelMd: { fontFamily: "BeVietnamPro_500Medium", fontSize: 12, fontWeight: "500" as const, lineHeight: 16, letterSpacing: 0.12 },
  labelSm: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, fontWeight: "600" as const, lineHeight: 12, letterSpacing: 0.5 },
} as const;

// Helpers para usar com StyleSheet
export const texto = {
  titulo: fontes.headlineXl,
  tituloMobile: fontes.headlineXlMobile,
  subtitulo: fontes.headlineLg,
  subtituloMd: fontes.headlineMd,
  corpo: fontes.bodyMd,
  corpoGrande: fontes.bodyLg,
  rotulo: fontes.labelMd,
  rotuloPequeno: fontes.labelSm,
} as const;
