import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarraPesquisa } from "../componentes/BarraPesquisa";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { Carregamento } from "../componentes/Carregamento";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { buscarReceitas, buscarReceitasPorIngrediente } from "../servicos/api";
import { Receita } from "../tipos/receita";
import { useFavoritos } from "../hooks/useFavoritos";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

type Filtro = "Todas" | "Receitas" | "Ingredientes" | "Categorias";

const filtros: Filtro[] = ["Todas", "Receitas", "Ingredientes", "Categorias"];

export default function Busca() {
  const router = useRouter();
  const params = useLocalSearchParams<{ termo?: string }>();
  const termoInicial = typeof params.termo === "string" ? params.termo : Array.isArray(params.termo) ? params.termo[0] : "";
  const [termo, setTermo] = useState(termoInicial ?? "");
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [resultados, setResultados] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { isFavorito, alternarFavorito } = useFavoritos();

  async function executarBusca(q: string, f: Filtro = filtro) {
    const t = q.trim();
    if (!t) { setResultados([]); return; }
    setCarregando(true);
    setErro(null);
    try {
      if (f === "Ingredientes") {
        const resumos = await buscarReceitasPorIngrediente(t);
        // converte resumos → busca detalhes para card
        const detalhes = await Promise.all(resumos.slice(0, 10).map((r) => buscarReceitas(r.strMeal).then((a) => a[0]).catch(() => null)));
        setResultados(detalhes.filter(Boolean) as Receita[]);
      } else {
        const res = await buscarReceitas(t);
        setResultados(res);
      }
    } catch (e: unknown) {
      const m = (e as { mensagem?: string })?.mensagem ?? "Erro ao buscar.";
      setErro(m);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (termoInicial) {
      setTermo(termoInicial);
      executarBusca(termoInicial);
    }
  }, [termoInicial]);

  function handleBuscar(novo: string) {
    setTermo(novo);
    executarBusca(novo);
  }

  function handleFiltroPress(f: Filtro) {
    setFiltro(f);
    if (termo) executarBusca(termo, f);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar mostrarVoltar onVoltar={() => router.back()} />
      <View style={styles.header}>
        <BarraPesquisa valorInicial={termo} onBuscar={handleBuscar} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {filtros.map((f) => (
            <TouchableOpacity key={f} style={[styles.chip, filtro === f && styles.chipAtivo]} onPress={() => handleFiltroPress(f)} activeOpacity={0.7}>
              <Text style={[styles.chipText, filtro === f && styles.chipTextAtivo]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {termo ? <Text style={styles.titulo}>Resultados para "{termo}"</Text> : null}
      </View>

      {carregando ? (
        <Carregamento mensagem="Buscando receitas..." />
      ) : erro ? (
        <EstadoVazio titulo="Erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={() => executarBusca(termo)} icon="⚠️" />
      ) : resultados.length === 0 && termo ? (
        <EstadoVazio titulo="Nenhum resultado" mensagem={`Não encontramos receitas para "${termo}". Tente outro termo.`} icon="🔎" />
      ) : resultados.length === 0 ? (
        <EstadoVazio titulo="Busque receitas" mensagem="Digite um nome ou ingrediente acima." icon="🍳" />
      ) : (
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          {resultados.map((r) => (
            <CartaoReceita
              key={r.idMeal}
              id={r.idMeal}
              titulo={r.strMeal}
              imagem={r.strMealThumb}
              variante="horizontal"
              favoritado={isFavorito(r.idMeal)}
              onPress={() => router.push(`/receita/${r.idMeal}` as never)}
              onFavoritar={() => alternarFavorito(r)}
            />
          ))}
        </ScrollView>
      )}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  header: { paddingHorizontal: espacamentos.page, paddingTop: espacamentos.md, gap: 12, backgroundColor: cores.surface },
  chips: { gap: 8, paddingRight: espacamentos.page },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: arredondamento.pill, backgroundColor: cores.surfaceContainerLowest, borderWidth: 1, borderColor: cores.outlineVariant },
  chipAtivo: { backgroundColor: cores.primary, borderColor: cores.primary },
  chipText: { fontSize: 12, fontWeight: "500", color: cores.onSurface },
  chipTextAtivo: { color: cores.onPrimary },
  titulo: { fontSize: 18, fontWeight: "600", color: cores.onSurface, marginTop: 4 },
  lista: { padding: espacamentos.page, gap: 12, paddingBottom: 100 },
});
