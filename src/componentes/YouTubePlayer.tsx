import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { extrairIdYoutube, gerarUrlEmbed } from "../utils/youtube";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

interface Props {
  urlYoutube?: string | null;
  tituloReceita?: string;
}

export function YouTubePlayer({ urlYoutube, tituloReceita = "Vídeo da Receita" }: Props) {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  const [reproduzindo, setReproduzindo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  const videoId = extrairIdYoutube(urlYoutube);

  if (!videoId || !urlYoutube) {
    return null; // Não exibe nada se não houver vídeo válido
  }

  const embedUrl = gerarUrlEmbed(videoId);

  function abrirExterno() {
    Linking.openURL(urlYoutube!).catch(() => {});
  }

  // Se o usuário clicou para assistir
  if (reproduzindo) {
    if (Platform.OS === "web") {
      // WEB: Iframe oficial responsivo 16:9
      return (
        <View style={styles.container}>
          <View style={styles.headerPlayer}>
            <Text style={styles.playerTitle} numberOfLines={1}>▶ {tituloReceita}</Text>
            <TouchableOpacity onPress={() => setReproduzindo(false)} style={styles.closeBtn} accessibilityRole="button">
              <Icone name="close" size={16} color={coresTema.onSurface} />
              <Text style={styles.closeTxt}>Recolher</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.iframeWrapper}>
            <iframe
              src={embedUrl}
              style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={tituloReceita}
            />
          </View>
        </View>
      );
    } else {
      // NATIVO (Android / iOS): WebView
      try {
        const { WebView } = require("react-native-webview");
        return (
          <View style={styles.container}>
            <View style={styles.headerPlayer}>
              <Text style={styles.playerTitle} numberOfLines={1}>▶ {tituloReceita}</Text>
              <TouchableOpacity onPress={() => setReproduzindo(false)} style={styles.closeBtn} accessibilityRole="button">
                <Icone name="close" size={16} color={coresTema.onSurface} />
                <Text style={styles.closeTxt}>Recolher</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.iframeWrapper}>
              {carregando && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color={coresTema.primary} />
                </View>
              )}
              <WebView
                source={{ uri: embedUrl }}
                style={{ flex: 1, backgroundColor: "transparent" }}
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                onLoadStart={() => setCarregando(true)}
                onLoadEnd={() => setCarregando(false)}
                onError={() => setErro(true)}
              />
            </View>
            {erro && (
              <View style={styles.erroBox}>
                <Text style={styles.erroTxt}>Não foi possível carregar o vídeo integrado.</Text>
                <TouchableOpacity onPress={abrirExterno}><Text style={styles.linkExt}>Assistir no YouTube</Text></TouchableOpacity>
              </View>
            )}
          </View>
        );
      } catch {
        // Fallback caso react-native-webview não esteja linkado
        return (
          <View style={styles.container}>
            <TouchableOpacity style={styles.btnAssistir} onPress={abrirExterno}>
              <Icone name="youtube" size={22} color="#FF0000" />
              <Text style={styles.btnAssistirTxt}>Assistir vídeo no YouTube</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  }

  // Estado inicial: Botão de Assistir incorporado com thumbnail ou card elegante
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardPreview}
        onPress={() => setReproduzindo(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Assistir vídeo de preparo"
      >
        <Image
          source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
          style={styles.thumb}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.overlay}>
          <View style={styles.playBtnCircle}>
            <Icone name="play" size={28} color="#FFF" style={{ marginLeft: 2 }} />
          </View>
          <Text style={styles.previewTxt}>Assistir passo a passo em vídeo</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: coresTema.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: coresTema.surfaceVariant,
    },
    headerPlayer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: coresTema.outlineVariant + "40",
      backgroundColor: coresTema.surfaceContainerLow,
    },
    playerTitle: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 13,
      color: coresTema.onSurface,
      flex: 1,
      marginRight: 8,
    },
    closeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: coresTema.surfaceContainerHigh,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 9999,
    },
    closeTxt: {
      fontFamily: "BeVietnamPro_500Medium",
      fontSize: 11,
      color: coresTema.onSurface,
    },
    iframeWrapper: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: "#000",
      position: "relative",
    },
    loaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    erroBox: {
      padding: 12,
      alignItems: "center",
      gap: 6,
      backgroundColor: coresTema.errorContainer,
    },
    erroTxt: {
      fontFamily: "BeVietnamPro_500Medium",
      fontSize: 12,
      color: coresTema.onErrorContainer,
    },
    linkExt: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 12,
      color: coresTema.primary,
      textDecorationLine: "underline",
    },
    cardPreview: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: "#111",
      position: "relative",
      overflow: "hidden",
    },
    thumb: {
      width: "100%",
      height: "100%",
      opacity: 0.8,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    playBtnCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: coresTema.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    previewTxt: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 13,
      color: "#FFF",
      textShadowColor: "rgba(0,0,0,0.7)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    btnAssistir: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 16,
      backgroundColor: coresTema.surfaceContainerLow,
    },
    btnAssistirTxt: {
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 14,
      color: coresTema.onSurface,
    },
  });
