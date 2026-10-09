import { useRouter } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "../componentes/BottomNav";
import { Carregamento } from "../componentes/Carregamento";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { EstadoVazio } from "../componentes/EstadoVazio";
import { TopBar } from "../componentes/TopBar";

import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { useFavoritos } from "../hooks/useFavoritos";
import { Cores } from "../tema/cores";
import { arredondamento, espacamentos } from "../tema/espacamentos";

export default function Favoritos() {
  const router = useRouter();
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);

  const { favoritos, carregando, recarregar, removerFavorito } = useFavoritos();
  const { isAutenticado, carregando: authLoading } = useAuth();

  if (carregando || authLoading) {
    return <Carregamento mensagem="Carregando favoritos..." />;
  }

  if (!isAutenticado) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar titulo="Favoritos" />

        <View style={styles.locked}>
          <Text style={styles.lockIcon}>🔒</Text>

          <Text style={styles.lockTitle}>
            Faça login para ver favoritos
          </Text>

          <Text style={styles.lockText}>
            Suas receitas salvas ficam protegidas.
          </Text>

          <TouchableOpacity
            style={styles.lockBtn}
            onPress={() => router.push("/login" as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.lockBtnText}>Entrar</Text>
          </TouchableOpacity>
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
          <EstadoVazio
            titulo="Nenhum favorito"
            mensagem="Salve receitas tocando no coração."
            icon="♡"
            acaoTexto="Explorar receitas"
            onAcao={() => router.push("/" as never)}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={recarregar}
              colors={[coresTema.primary]}
            />
          }
        >
          <Text style={styles.titulo}>
            Salvas ({favoritos.length})
          </Text>

          {favoritos.map((r) => (
            <CartaoReceita
              key={r.idMeal}
              id={r.idMeal}
              titulo={r.strMeal}
              imagem={r.strMealThumb}
              variante="horizontal"
              favoritado
              onPress={() =>
                router.push(`/receita/${r.idMeal}` as never)
              }
              onFavoritar={() => removerFavorito(r.idMeal)}
            />
          ))}
        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: coresTema.background,
    },

    vazioWrap: {
      flex: 1,
      justifyContent: "center",
    },

    lista: {
      padding: espacamentos.page,
      gap: 12,
      paddingBottom: 100,
    },

    titulo: {
      fontSize: 18,
      fontWeight: "600",
      color: coresTema.onSurface,
      marginBottom: 4,
    },

    locked: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },

    lockIcon: {
      fontSize: 48,
    },

    lockTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: coresTema.onSurface,
    },

    lockText: {
      fontSize: 14,
      color: coresTema.onSurfaceVariant,
      textAlign: "center",
    },

    lockBtn: {
      backgroundColor: coresTema.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: arredondamento.pill,
      marginTop: 8,
    },

    lockBtnText: {
      color: coresTema.onPrimary,
      fontWeight: "700",
    },
  });