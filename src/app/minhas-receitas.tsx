
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CabecalhoSecao,
  styles as s,
} from "../componentes/CabecalhoSecao";
import { Carregamento } from "../componentes/Carregamento";
import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { Cores } from "../tema/cores";

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
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const { user } = useAuth();

  const [receitas, setReceitas] = useState<ReceitaCriada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [detalhe, setDetalhe] = useState<ReceitaCriada | null>(null);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setReceitas([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase
        .from("receitas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar receitas:", error.message);
        setReceitas([]);
        return;
      }

      setReceitas((data ?? []) as ReceitaCriada[]);
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
      setReceitas([]);
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function handleApagar(id: string) {
    Alert.alert(
      "Apagar receita",
      "Tem certeza que deseja apagar esta receita?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            if (!user) return;

            const { error } = await supabase
              .from("receitas")
              .delete()
              .eq("id", id)
              .eq("user_id", user.id);

            if (error) {
              Alert.alert("Erro", "Não foi possível apagar a receita.");
              console.error("Erro ao apagar receita:", error.message);
              return;
            }

            setReceitas((prev) =>
              prev.filter((r) => r.id !== id)
            );

            if (detalhe?.id === id) {
              setDetalhe(null);
            }
          },
        },
      ]
    );
  }

  if (carregando) {
    return <Carregamento mensagem="Carregando suas receitas..." />;
  }

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Minhas Receitas" />

      <TouchableOpacity
        style={styles.novaBtn}
        onPress={() => router.push("/adicionar" as never)}
        accessibilityRole="button"
      >
        <Icone name="plus" size={18} color={coresTema.onPrimary} />
        <Text style={styles.novaText}>Adicionar Receita</Text>
      </TouchableOpacity>

      {receitas.length === 0 ? (
        <View style={styles.center}>
          <Icone
            name="book-outline"
            size={48}
            color={coresTema.outlineVariant}
          />
          <Text style={styles.tituloCenter}>
            Você ainda não criou nenhuma receita.
          </Text>
          <Text style={styles.textCenter}>
            Toque no botão acima para criar a primeira.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.conteudo}>
          {receitas.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={s.card}
              onPress={() => setDetalhe(r)}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={s.cardTitle}>{r.nome}</Text>

              <Text style={s.cardText}>
                {r.categoria
                  ? `Categoria: ${r.categoria}`
                  : "Sem categoria"}
                {r.tempo ? ` · ${r.tempo} min` : ""}
              </Text>

              <View style={styles.rowAcoes}>
                <TouchableOpacity
                  onPress={() => setDetalhe(r)}
                  accessibilityRole="button"
                >
                  <Text style={styles.linkVer}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApagar(r.id)}
                  accessibilityRole="button"
                >
                  <Text style={styles.linkApagar}>Apagar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={!!detalhe}
        transparent
        animationType="slide"
        onRequestClose={() => setDetalhe(null)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={s.cardTitle}>{detalhe?.nome}</Text>

              <Text style={s.cardText}>
                Categoria: {detalhe?.categoria ?? "—"}
              </Text>

              <Text style={s.cardText}>
                Tempo: {detalhe?.tempo ? `${detalhe.tempo} min` : "—"}
              </Text>

              <Text style={styles.subtitulo}>Ingredientes</Text>
              <Text style={styles.textoDetalhe}>
                {detalhe?.ingredientes ?? "Não informado"}
              </Text>

              <Text style={styles.subtitulo}>Modo de preparo</Text>
              <Text style={styles.textoDetalhe}>
                {detalhe?.modo ?? "Não informado"}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.fecharBtn}
              onPress={() => setDetalhe(null)}
              accessibilityRole="button"
            >
              <Text style={styles.fecharText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
    novaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: coresTema.primary,
      borderRadius: 10,
      paddingVertical: 13,
      margin: 16,
    },
    novaText: {
      color: coresTema.onPrimary,
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 14,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 8,
    },
    tituloCenter: {
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 16,
      color: coresTema.onSurface,
      textAlign: "center",
    },
    textCenter: {
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 13,
      color: coresTema.onSurfaceVariant,
      textAlign: "center",
    },
    rowAcoes: {
      flexDirection: "row",
      gap: 16,
      marginTop: 8,
    },
    linkVer: {
      color: coresTema.primary,
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 13,
    },
    linkApagar: {
      color: coresTema.error,
      fontFamily: "BeVietnamPro_600SemiBold",
      fontSize: 13,
    },
    modalBg: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: coresTema.surfaceContainerLowest,
      borderRadius: 16,
      padding: 20,
      gap: 12,
      maxHeight: "80%",
      borderWidth: 1,
      borderColor: coresTema.surfaceVariant,
    },
    subtitulo: {
      marginTop: 8,
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 15,
      color: coresTema.onSurface,
    },
    textoDetalhe: {
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 14,
      color: coresTema.onSurfaceVariant,
      lineHeight: 21,
    },
    fecharBtn: {
      backgroundColor: coresTema.primary,
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
    },
    fecharText: {
      color: coresTema.onPrimary,
      fontFamily: "BeVietnamPro_700Bold",
      fontSize: 14,
    },
  });
