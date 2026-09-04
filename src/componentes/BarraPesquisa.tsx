import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";
import { sanitizarEntrada } from "../utils/seguranca";

interface Props {
  valorInicial?: string;
  placeholder?: string;
  onBuscar: (termo: string) => void;
  onFiltroPress?: () => void;
}

export function BarraPesquisa({ valorInicial = "", placeholder = "Buscar receitas, ingredientes...", onBuscar, onFiltroPress }: Props) {
  const [texto, setTexto] = useState(valorInicial);

  function handleSubmit() {
    const limpo = sanitizarEntrada(texto, 60);
    onBuscar(limpo);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.iconSearch}>⌕</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={cores.onSurfaceVariant}
          value={texto}
          onChangeText={(v) => setTexto(v.slice(0, 60))}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          maxLength={60}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {texto.length > 0 && (
          <TouchableOpacity onPress={() => setTexto("")} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.filterBtn} onPress={onFiltroPress ?? handleSubmit} activeOpacity={0.8}>
        <Text style={styles.filterIcon}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacamentos.sm,
    marginBottom: espacamentos.lg,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: arredondamento.pill,
    borderWidth: 1,
    borderColor: cores.surfaceVariant,
    paddingHorizontal: 14,
    height: 48,
    // sombra card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  iconSearch: { fontSize: 18, color: cores.onSurfaceVariant, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: cores.onSurface, paddingVertical: 0 },
  clearBtn: { padding: 4, marginLeft: 6 },
  clearText: { color: cores.onSurfaceVariant, fontSize: 12 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: cores.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  filterIcon: { color: cores.onPrimary, fontSize: 18, fontWeight: "700" },
});
