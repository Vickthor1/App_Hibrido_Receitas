import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

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

export function CartaoReceita({ titulo, imagem, nota = "4.8", tempo = "30 min", variante = "vertical", favoritado = false, onPress, onFavoritar }: Props) {
  if (variante === "horizontal") {
    return (
      <TouchableOpacity style={styles.horizontal} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: imagem }} style={styles.hImage} />
        <View style={styles.hConteudo}>
          <Text style={styles.hTitulo} numberOfLines={1}>{titulo}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaStar}>★ {nota}</Text>
            <Text style={styles.metaSep}>•</Text>
            <Text style={styles.metaTime}>◷ {tempo}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.hFav} onPress={onFavoritar} activeOpacity={0.7}>
          <Text style={[styles.favIcon, favoritado && styles.favActive]}>{favoritado ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.vertical} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.vImageWrap}>
        <Image source={{ uri: imagem }} style={styles.vImage} />
        <TouchableOpacity style={styles.vFav} onPress={onFavoritar} activeOpacity={0.7}>
          <Text style={[styles.favIconSmall, favoritado && styles.favActive]}>{favoritado ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.vConteudo}>
        <Text style={styles.vTitulo} numberOfLines={2}>{titulo}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaStarSmall}>★ {nota}</Text>
          <Text style={styles.metaSep}>•</Text>
          <Text style={styles.metaTimeSmall}>◷ {tempo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // vertical: 1:1 imagem, card arredondado 16px, borda surface-variant
  vertical: {
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: arredondamento.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  vImageWrap: { position: "relative", aspectRatio: 1, overflow: "hidden" },
  vImage: { width: "100%", height: "100%" },
  vFav: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 20, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  favIconSmall: { color: cores.onSurfaceVariant, fontSize: 14 },
  favActive: { color: cores.primary },
  vConteudo: { padding: 10 },
  vTitulo: { fontSize: 14, fontWeight: "600", color: cores.onSurface, lineHeight: 18 },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  metaStar: { color: cores.primary, fontSize: 12, fontWeight: "600" },
  metaStarSmall: { color: cores.primary, fontSize: 11, fontWeight: "600" },
  metaSep: { color: cores.onSurfaceVariant, fontSize: 10 },
  metaTime: { color: cores.onSurfaceVariant, fontSize: 12 },
  metaTimeSmall: { color: cores.onSurfaceVariant, fontSize: 11 },

  // horizontal: thumb 80-96px à esquerda
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: arredondamento.lg,
    padding: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  hImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: cores.surfaceVariant },
  hConteudo: { flex: 1, gap: 4 },
  hTitulo: { fontSize: 16, fontWeight: "600", color: cores.onSurface },
  hFav: { padding: 8 },
  favIcon: { fontSize: 18, color: cores.onSurfaceVariant },
});
