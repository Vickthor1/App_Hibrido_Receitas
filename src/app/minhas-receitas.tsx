import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";
import { CabecalhoSecao, styles as s } from "../componentes/CabecalhoSecao";
import { Carregamento } from "../componentes/Carregamento";
import { cores } from "../tema/cores";

interface ReceitaCriada {
  id: string;
  nome: string;
  categoria: string | null;
  tempo: string | null;
  ingredientes: string | null;
  modo: string | null;
}

export default function MinhasReceitas() {
  const router = useRouter();
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<ReceitaCriada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [detalhe, setDetalhe] = useState<ReceitaCriada | null>(null);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;
    setCarregando(true);
    try {
      const { data } = await supabase.from("receitas").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setReceitas((data ?? []) as ReceitaCriada[]);
    } catch {} finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function handleApagar(id: string) {
    Alert.alert("Apagar receita", "Tem certeza que deseja apagar esta receita?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          if (!user) return;
          await supabase.from("receitas").delete().eq("id", id).eq("user_id", user.id);
          setReceitas((prev) => prev.filter((r) => r.id !== id));
        },
      },
    ]);
  }

  if (carregando) return <Carregamento mensagem="Carregando suas receitas..." />;

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Minhas Receitas" />

      <TouchableOpacity style={styles.novaBtn} onPress={() => router.push("/adicionar" as never)} accessibilityRole="button">
        <Icone name="plus" size={18} color={cores.onPrimary} />
        <Text style={styles.novaText}>Adicionar Receita</Text>
      </TouchableOpacity>

      {receitas.length === 0 ? (
        <View style={styles.center}>
          <Icone name="book-outline" size={48} color={cores.outlineVariant} />
          <Text style={styles.tituloCenter}>Você ainda não criou nenhuma receita.</Text>
          <Text style={styles.textCenter}>Toque no botão acima para criar a primeira.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.conteudo}>
          {receitas.map((r) => (
            <TouchableOpacity key={r.id} style={s.card} onPress={() => setDetalhe(r)} activeOpacity={0.8} accessibilityRole="button">
              <Text style={s.cardTitle}>{r.nome}</Text>
              <Text style={s.cardText}>{r.categoria ? `Categoria: ${r.categoria}` : "Sem categoria"}{r.tempo ? ` · ${r.tempo} min` : ""}</Text>
              <View style={styles.rowAcoes}>
                <TouchableOpacity onPress={() => setDetalhe(r)} accessibilityRole="button"><Text style={styles.linkVer}>Ver</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleApagar(r.id)} accessibilityRole="button"><Text style={styles.linkApagar}>Apagar</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!detalhe} transparent animationType="slide" onRequestClose={() => setDetalhe(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={s.cardTitle}>{detalhe?.nome}</Text>
            <Text style={s.cardText}>Categoria: {detalhe?.categoria ?? "—"}</Text>
            <Text style={s.cardText}>Tempo: {detalhe?.tempo ? `${detalhe.tempo} min` : "—"}</Text>
            <Text style={{ ...s.cardTitle, marginTop: 8 }}>Ingredientes</Text>
            <Text style={s.cardText}>{detalhe?.ingredientes ?? "Não informado"}</Text>
            <Text style={{ ...s.cardTitle, marginTop: 8 }}>Modo de preparo</Text>
            <Text style={s.cardText}>{detalhe?.modo ?? "Não informado"}</Text>
            <TouchableOpacity style={s.btnPrimario} onPress={() => setDetalhe(null)} accessibilityRole="button">
              <Text style={s.btnPrimarioText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  novaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: cores.primary, borderRadius: 10, paddingVertical: 13, margin: 16 },
  novaText: { color: cores.onPrimary, fontFamily: "BeVietnamPro_700Bold", fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  tituloCenter: { fontFamily: "BeVietnamPro_700Bold", fontSize: 16, color: cores.onSurface, textAlign: "center" },
  textCenter: { fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: cores.onSurfaceVariant, textAlign: "center" },
  rowAcoes: { flexDirection: "row", gap: 16, marginTop: 8 },
  linkVer: { color: cores.primary, fontFamily: "BeVietnamPro_700Bold", fontSize: 13 },
  linkApagar: { color: cores.error, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: cores.surfaceContainerLowest, borderRadius: 16, padding: 20, gap: 6, maxHeight: "80%" },
});