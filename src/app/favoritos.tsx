import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { Carregamento } from "../componentes/Carregamento";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { useFavoritos } from "../hooks/useFavoritos";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";
import { espacamentos, arredondamento } from "../tema/espacamentos";

export default function Favoritos() {
  const router = useRouter();
  const { favoritos, carregando, recarregar, removerFavorito } = useFavoritos();
  const { isAutenticado, carregando: authLoading } = useAuth();

  if (carregando || authLoading) return <Carregamento mensagem="Carregando favoritos..." />;
  if (!isAutenticado) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar titulo="Favoritos" />
        <View style={styles.locked}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Faça login para ver favoritos</Text>
          <Text style={styles.lockText}>Suas receitas salvas ficam protegidas.</Text>
          <TouchableOpacity style={styles.lockBtn} onPress={() => router.push("/login" as never)} activeOpacity={0.8}><Text style={styles.lockBtnText}>Entrar</Text></TouchableOpacity>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

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
  locked: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  lockIcon: { fontSize: 48 },
  lockTitle: { fontSize: 18, fontWeight: "700", color: cores.onSurface },
  lockText: { fontSize: 14, color: cores.onSurfaceVariant, textAlign: "center" },
  lockBtn: { backgroundColor: cores.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: arredondamento.pill, marginTop: 8 },
  lockBtnText: { color: cores.onPrimary, fontWeight: "700" },
});
