import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";
import { CabecalhoSecao, styles as s } from "../componentes/CabecalhoSecao";
import { Carregamento } from "../componentes/Carregamento";
import { cores } from "../tema/cores";

interface Avaliacao {
  id: string;
  id_meal: string;
  nota: number;
  comentario: string | null;
  created_at: string;
}

export default function Avaliacoes() {
  const router = useRouter();
  const { user } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;
    setCarregando(true);
    try {
      const { data } = await supabase.from("avaliacoes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setAvaliacoes((data ?? []) as Avaliacao[]);
    } catch {} finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  if (carregando) return <Carregamento mensagem="Carregando avaliações..." />;

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Avaliações" />
      {avaliacoes.length === 0 ? (
        <View style={styles.center}>
          <Icone name="star-outline" size={48} color={cores.outlineVariant} />
          <Text style={styles.titulo}>Você ainda não avaliou nenhuma receita.</Text>
          <Text style={styles.texto}>Abra uma receita e, em breve, você poderá dar sua nota.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/" as never)} accessibilityRole="button">
            <Text style={styles.btnText}>Explorar receitas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.conteudo}>
          {avaliacoes.map((a) => (
            <View key={a.id} style={s.card}>
              <Text style={styles.estrelas}>{"★".repeat(a.nota)}{"☆".repeat(5 - a.nota)}</Text>
              <Text style={s.cardText}>{a.comentario ?? "Sem comentário."}</Text>
              <TouchableOpacity onPress={() => router.push(`/receita/${a.id_meal}` as never)} accessibilityRole="button">
                <Text style={styles.ver}>Ver receita</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  titulo: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.onSurface, textAlign: "center" },
  texto: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, textAlign: "center" },
  btn: { marginTop: 8, backgroundColor: cores.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  btnText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 13 },
  estrelas: { color: cores.star, fontSize: 18 },
  ver: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold", fontSize: 13, marginTop: 6 },
});