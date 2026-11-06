import { Image } from "expo-image";
import { memo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTema } from "../contexto/TemaContext";
import { useTraducao } from "../hooks/useTraducao";
import { Cores } from "../tema/cores";
import { arredondamento } from "../tema/espacamentos";

export type VarianteCartao = "vertical" | "horizontal";

interface Props {
  id: string;
  titulo: string;
  imagem: string;
  nota?: string;
  tempo?: string;
  variante?: VarianteCartao;
  favoritado?: boolean;
  onPress?: () => void;
  onFavoritar?: () => void;
}

export const CartaoReceita = memo(function CartaoReceita({
  id,
  titulo,
  imagem,
  nota = "4.8",
  tempo = "30 min",
  variante = "vertical",
  favoritado = false,
  onPress,
  onFavoritar,
}: Props) {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  // IDs numéricos são da TheMealDB. Receitas de usuários já estão em português.
  const { texto: tituloExibido } = useTraducao(titulo, { ativo: /^\d+$/.test(id) });

  if (variante === "horizontal") {
    return (
      <Pressable
        style={({ hovered }: { hovered?: boolean }) => [
          styles.horizontal,
          hovered && styles.cardHovered,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Receita ${tituloExibido}`}
      >
        {({ hovered }: { hovered?: boolean }) => (
          <>
            <View style={styles.hImageWrap}>
              <Image
                source={{ uri: imagem }}
                style={[
                  styles.hImage,
                  hovered && styles.imageZoom,
                ]}
                contentFit="cover"
                transition={250}
                cachePolicy="memory-disk"
              />
            </View>

            <View style={styles.hConteudo}>
              <Text
                style={[
                  styles.hTitulo,
                  hovered && styles.titleHovered,
                ]}
                numberOfLines={1}
              >
                {tituloExibido}
              </Text>

              <View style={styles.meta}>
                <Text style={styles.metaStar}>★ {nota}</Text>
                <Text style={styles.metaSep}>•</Text>
                <Text style={styles.metaTime}>◷ {tempo}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.hFav}
              onPress={onFavoritar}
              activeOpacity={0.7}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Text
                style={[
                  styles.favIcon,
                  favoritado && styles.favActive,
                ]}
              >
                {favoritado ? "♥" : "♡"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ hovered }: { hovered?: boolean }) => [
        styles.vertical,
        hovered && styles.cardHovered,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Receita ${tituloExibido}`}
    >
      {({ hovered }: { hovered?: boolean }) => (
        <>
          <View style={styles.vImageWrap}>
            <Image
              source={{ uri: imagem }}
              style={[
                styles.vImage,
                hovered && styles.imageZoom,
              ]}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
            />

            <TouchableOpacity
              style={styles.vFav}
              onPress={onFavoritar}
              activeOpacity={0.7}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Text
                style={[
                  styles.favIconSmall,
                  favoritado && styles.favActive,
                ]}
              >
                {favoritado ? "♥" : "♡"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vConteudo}>
            <Text
              style={[
                styles.vTitulo,
                hovered && styles.titleHovered,
              ]}
              numberOfLines={2}
            >
              {tituloExibido}
            </Text>

            <View style={styles.meta}>
              <Text style={styles.metaStarSmall}>★ {nota}</Text>
              <Text style={styles.metaSep}>•</Text>
              <Text style={styles.metaTimeSmall}>◷ {tempo}</Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
});

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    // =====================================================
    // CARD VERTICAL
    // =====================================================

    vertical: {
      backgroundColor: coresTema.surfaceContainerLowest,
      borderRadius: arredondamento.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: coresTema.surfaceVariant,

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 2,

      transitionDuration: "250ms",
      transitionProperty: "transform, box-shadow",
    },

    cardHovered: {
      transform: [{ translateY: -4 }, { scale: 1.02 }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
      elevation: 6,
      borderColor: coresTema.primary + "50",
    },

    vImageWrap: {
      position: "relative",
      aspectRatio: 1,
      overflow: "hidden",
      backgroundColor: coresTema.surfaceVariant,
    },

    vImage: {
      width: "100%",
      height: "100%",
      transitionDuration: "300ms",
      transitionProperty: "transform",
    },

    imageZoom: {
      transform: [{ scale: 1.06 }],
    },

    vFav: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: coresTema.surfaceContainerLowest + "E6",
      borderRadius: 20,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },

    favIconSmall: {
      color: coresTema.onSurfaceVariant,
      fontSize: 14,
    },

    favActive: {
      color: coresTema.primary,
    },

    vConteudo: {
      padding: 12,
    },

    vTitulo: {
      fontSize: 14,
      fontFamily: "BeVietnamPro_600SemiBold",
      color: coresTema.onSurface,
      lineHeight: 18,
      transitionDuration: "150ms",
    },

    titleHovered: {
      color: coresTema.primary,
    },

    // =====================================================
    // INFORMAÇÕES
    // =====================================================

    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },

    metaStar: {
      color: coresTema.primary,
      fontSize: 12,
      fontFamily: "BeVietnamPro_600SemiBold",
    },

    metaStarSmall: {
      color: coresTema.primary,
      fontSize: 11,
      fontFamily: "BeVietnamPro_600SemiBold",
    },

    metaSep: {
      color: coresTema.onSurfaceVariant,
      fontSize: 10,
    },

    metaTime: {
      color: coresTema.onSurfaceVariant,
      fontSize: 12,
      fontFamily: "BeVietnamPro_400Regular",
    },

    metaTimeSmall: {
      color: coresTema.onSurfaceVariant,
      fontSize: 11,
      fontFamily: "BeVietnamPro_400Regular",
    },

    // =====================================================
    // CARD HORIZONTAL
    // =====================================================

    horizontal: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: coresTema.surfaceContainerLowest,
      borderRadius: arredondamento.lg,
      padding: 8,
      gap: 12,
      borderWidth: 1,
      borderColor: coresTema.surfaceVariant,

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 2,

      transitionDuration: "250ms",
      transitionProperty: "transform, box-shadow",
    },

    hImageWrap: {
      width: 80,
      height: 80,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: coresTema.surfaceVariant,
    },

    hImage: {
      width: "100%",
      height: "100%",
      transitionDuration: "300ms",
      transitionProperty: "transform",
    },

    hConteudo: {
      flex: 1,
      gap: 4,
    },

    hTitulo: {
      fontSize: 15,
      fontFamily: "BeVietnamPro_600SemiBold",
      color: coresTema.onSurface,
      transitionDuration: "150ms",
    },

    hFav: {
      padding: 8,
    },

    favIcon: {
      fontSize: 18,
      color: coresTema.onSurfaceVariant,
    },
  });
