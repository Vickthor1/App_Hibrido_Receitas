import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { buscarCategorias } from "../servicos/api";
import { Categoria } from "../tipos/receita";
import { Carregamento } from "../componentes/Carregamento";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function Categorias() {
  const router = useRouter();
  const [cats, setCats] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarCategorias()
      .then(setCats)
      .catch((e: unknown) => setErro((e as { mensagem?: string })?.mensagem ?? "Erro ao carregar"))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <Carregamento mensagem="Carregando categorias..." />;
  if (erro) return <View style={styles.erro}><EstadoVazio titulo="Erro" mensagem={erro} icon="⚠️" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar mostrarVoltar onVoltar={() => router.back()} titulo="Categorias" />
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {cats.map((c) => (
          <TouchableOpacity
            key={c.idCategory}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/busca?termo=${encodeURIComponent(c.strCategory)}` as never)}
          >
            <Image source={{ uri: c.strCategoryThumb }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.nome}>{c.strCategory}</Text>
              <Text style={styles.desc} numberOfLines={2}>{c.strCategoryDescription}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  erro: { flex: 1, justifyContent: "center", backgroundColor: cores.background },
  grid: { padding: espacamentos.page, gap: 12, paddingBottom: 100 },
  card: {
    flexDirection: "row",
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
  thumb: { width: 96, height: 96, backgroundColor: cores.surfaceVariant },
  info: { flex: 1, padding: 12, gap: 4, justifyContent: "center" },
  nome: { fontSize: 16, fontWeight: "600", color: cores.onSurface },
  desc: { fontSize: 12, color: cores.onSurfaceVariant, lineHeight: 16 },
});
