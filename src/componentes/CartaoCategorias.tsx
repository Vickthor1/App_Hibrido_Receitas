import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { cores } from "../tema/cores";
import { arredondamento } from "../tema/espacamentos";

const iconMap: Record<string, string> = {
  Beef: "🥩",
  Chicken: "🍗",
  Dessert: "🍰",
  Lamb: "🍖",
  Miscellaneous: "🍲",
  Pasta: "🍝",
  Pork: "🥓",
  Seafood: "🦐",
  Side: "🥗",
  Starter: "🍜",
  Vegan: "🥬",
  Vegetarian: "🥦",
  Breakfast: "☕",
  Goat: "🍛",
};

interface Props {
  nome: string;
  ativo?: boolean;
  onPress?: () => void;
}

export function CartaoCategorias({ nome, ativo, onPress }: Props) {
  const icon = iconMap[nome] ?? "🍽️";
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.circle, ativo && styles.circleAtivo]}>
        <Text style={[styles.icon, ativo && styles.iconAtivo]}>{icon}</Text>
      </View>
      <Text style={[styles.label, ativo && styles.labelAtivo]} numberOfLines={1}>
        {nome}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 8, width: 80 },
  circle: {
    width: 64,
    height: 64,
    borderRadius: arredondamento.lg,
    backgroundColor: cores.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 1,
  },
  circleAtivo: { backgroundColor: cores.primaryContainer, borderColor: cores.primary },
  icon: { fontSize: 28 },
  iconAtivo: {},
  label: { fontSize: 12, fontWeight: "500", color: cores.onSurface, textAlign: "center" },
  labelAtivo: { color: cores.primary, fontWeight: "700" },
});
