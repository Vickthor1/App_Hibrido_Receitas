import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { contarSeguidores, contarSeguindo } from "../servicos/seguidores";
import { useSeguidor } from "../hooks/useSeguidor";
import { useAuth } from "../contexto/AuthContext";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { AvatarUsuario } from "../componentes/AvatarUsuario";
import { CartaoReceita } from "../componentes/CartaoReceita";
import { Receita } from "../tipos/receita";
import { cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

interface PerfilAutor {
  id: string;
  nome: string;
  avatar_url: string | null;
}

export default function AutorPerfilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const autorId = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();

  const [autor, setAutor] = useState<PerfilAutor | null>(null);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(true);

  const {
    seguindo,
    totalSeguidores,
    totalSeguindo,
    éMinhaConta,
    alternarSeguir,
    processando,
  } = useSeguidor(autorId);

  const carregarDadosAutor = useCallback(async () => {
    if (!autorId) return;
    setCarregando(true);
    try {
      const { data: p } = await supabase.from("perfis").select("id, nome, avatar_url").eq("id", autorId).maybeSingle();
      if (p) setAutor(p as PerfilAutor);

      const { data: recs } = await supabase
        .from("receitas")
        .select("id, nome, categoria, tempo, ingredientes, modo, created_at")
        .eq("user_id", autorId)
        .order("created_at", { ascending: false });

      const formatadas: Receita[] = (recs ?? []).map((r: { id: string; nome: string; categoria: string | null; tempo: string | null; ingredientes: string | null; modo: string | null }) => ({
        idMeal: r.id,
        strMeal: r.nome,
        strCategory: r.categoria ?? "Geral",
        strArea: "Caseira",
        strInstructions: r.modo ?? "",
        strMealThumb: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        strTags: null,
        strYoutube: null,
        strIngredient1: r.ingredientes,
        strMeasure1: r.tempo ? `${r.tempo} min` : null,
      } as unknown as Receita));

      setReceitas(formatadas);
    } catch {} finally {
      setCarregando(false);
    }
  }, [autorId]);

  useEffect(() => {
    if (éMinhaConta && user) {
      router.replace("/perfil" as never);
      return;
    }
    carregarDadosAutor();
  }, [carregarDadosAutor, éMinhaConta, user, router]);

  if (carregando) return null;
  if (!autor) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar titulo="Autor" />
        <View style={styles.center}><Text style={styles.msg}>Autor não encontrado.</Text></View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo={autor.nome} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <AvatarUsuario tamanho={96} />
          <Text style={styles.nome}>{autor.nome}</Text>
          <Text style={styles.handle}>@criador_receitafacil</Text>

          <View style={styles.stats}>
            <TouchableOpacity style={styles.stat} onPress={() => router.push(`/social-lista?id=${autor.id}&tipo=seguidores` as never)}>
              <Text style={styles.statVal}>{totalSeguidores}</Text><Text style={styles.statLabel}>SEGUIDORES</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => router.push(`/social-lista?id=${autor.id}&tipo=seguindo` as never)}>
              <Text style={styles.statVal}>{totalSeguindo}</Text><Text style={styles.statLabel}>SEGUINDO</Text>
            </TouchableOpacity>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{receitas.length}</Text><Text style={styles.statLabel}>RECEITAS</Text>
            </View>
          </View>

          {!éMinhaConta && (
            <TouchableOpacity
              style={[styles.btnSeguir, seguindo && styles.btnSeguindo]}
              onPress={alternarSeguir}
              disabled={processando}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnSeguirTxt, seguindo && styles.btnSeguindoTxt]}>
                {seguindo ? "Seguindo" : "+ Seguir"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.secTitle}>Receitas Publicadas ({receitas.length})</Text>
        {receitas.length === 0 ? (
          <Text style={styles.msg}>Este autor ainda não publicou nenhuma receita.</Text>
        ) : (
          <View style={styles.grid}>
            {receitas.map((r) => (
              <View key={r.idMeal} style={styles.gridItem}>
                <CartaoReceita
                  id={r.idMeal}
                  titulo={r.strMeal}
                  imagem={r.strMealThumb}
                  onPress={() => router.push(`/receita/${r.idMeal}` as never)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: espacamentos.page, gap: 16, paddingBottom: 100 },
  headerCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 20, alignItems: "center", gap: 8, borderWidth: 1, borderColor: cores.surfaceVariant },
  nome: { fontFamily: "BeVietnamPro_700Bold", fontSize: 22, color: cores.onSurface },
  handle: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant },
  stats: { flexDirection: "row", gap: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: cores.outlineVariant + "30", paddingTop: 12, width: "100%" },
  stat: { alignItems: "center", flex: 1 },
  statVal: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.primary },
  statLabel: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 10, color: cores.onSurfaceVariant, letterSpacing: 0.5 },
  btnSeguir: { marginTop: 12, backgroundColor: cores.primary, paddingHorizontal: 32, paddingVertical: 10, borderRadius: 9999, width: "100%", alignItems: "center" },
  btnSeguindo: { backgroundColor: cores.surfaceContainerHigh, borderWidth: 1, borderColor: cores.outlineVariant },
  btnSeguirTxt: { color: cores.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13 },
  btnSeguindoTxt: { color: cores.onSurface },
  secTitle: { fontFamily: "BeVietnamPro_700Bold", fontSize: 18, color: cores.onSurface, marginTop: 8 },
  msg: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, fontStyle: "italic" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "48%" },
});