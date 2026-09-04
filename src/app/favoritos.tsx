import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { Carregamento } from "../componentes/Carregamento";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { useFavoritos } from "../hooks/useFavoritos";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

export default function Favoritos() {
  const router = useRouter();
  const { favoritos, carregando, recarregar, removerFavorito } = useFavoritos();

  if (carregando) return <Carregamento mensagem="Carregando favoritos..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Favoritos" />
      {favoritos.length === 0 ? (
        <View style={styles.vazioWrap}>
          <EstadoVazio titulo="Nenhum favorito" mensagem="Salve receitas tocando no coração." icon="♡" acaoTexto="Explorar receitas" onAcao={() => router.push("/" as never)} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} colors={[cores.primary]} />}
        >
          <Text style={styles.titulo}>Salvas ({favoritos.length})</Text>
          {favoritos.map((r) => (
            <CartaoReceita
              key={r.idMeal}
              id={r.idMeal}
              titulo={r.strMeal}
              imagem={r.strMealThumb}
              variante="horizontal"
              favoritado
              onPress={() => router.push(`/receita/${r.idMeal}` as never)}
              onFavoritar={() => removerFavorito(r.idMeal)}
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
  vazioWrap: { flex: 1, justifyContent: "center" },
  lista: { padding: espacamentos.page, gap: 12, paddingBottom: 100 },
  titulo: { fontSize: 18, fontWeight: "600", color: cores.onSurface, marginBottom: 4 },
});
