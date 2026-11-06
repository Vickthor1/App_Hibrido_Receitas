import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { buscarSeguidores, buscarSeguindo, PerfilSocial } from "../servicos/seguidores";
import { useSeguidor } from "../hooks/useSeguidor";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { AvatarUsuario } from "../componentes/AvatarUsuario";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

export default function ListaSocialScreen() {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; tipo?: string }>();
  const usuarioId = typeof params.id === "string" ? params.id : "";
  const tipo = typeof params.tipo === "string" ? params.tipo : "seguidores";

  const [lista, setLista] = useState<PerfilSocial[]>([]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      const { data: p } = await supabase.from("perfis").select("nome").eq("id", usuarioId).maybeSingle();
      if (p?.nome) setNomeUsuario(p.nome);

      if (tipo === "seguindo") {
        const s = await buscarSeguindo(usuarioId);
        setLista(s);
      } else {
        const s = await buscarSeguidores(usuarioId);
        setLista(s);
      }
    } catch {} finally {
      setCarregando(false);
    }
  }, [usuarioId, tipo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo={tipo === "seguindo" ? `Seguindo · ${nomeUsuario}` : `Seguidores · ${nomeUsuario}`} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {carregando ? (
          <Text style={styles.msg}>Carregando...</Text>
        ) : lista.length === 0 ? (
          <Text style={styles.msg}>Nenhum usuário encontrado.</Text>
        ) : (
          lista.map((u) => (
            <ItemPerfil key={u.id} perfil={u} onPress={() => router.push(`/autor/${u.id}` as never)} />
          ))
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

function ItemPerfil({ perfil, onPress }: { perfil: PerfilSocial; onPress: () => void }) {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const { seguindo, alternarSeguir, éMinhaConta, processando } = useSeguidor(perfil.id);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }} onPress={onPress} activeOpacity={0.8}>
        <AvatarUsuario tamanho={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{perfil.nome}</Text>
          <Text style={styles.sub}>Ver perfil</Text>
        </View>
      </TouchableOpacity>

      {!éMinhaConta && (
        <TouchableOpacity
          style={[styles.btnSeguir, seguindo && styles.btnSeguindo]}
          onPress={alternarSeguir}
          disabled={processando}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnSeguirTxt, seguindo && styles.btnSeguindoTxt]}>
            {seguindo ? "Seguindo" : "Seguir"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: coresTema.background },
  scroll: { padding: espacamentos.page, gap: 12, paddingBottom: 100 },
  msg: { textAlign: "center", fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant, marginTop: 32 },
  card: { backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: coresTema.surfaceVariant },
  nome: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 14, color: coresTema.onSurface },
  sub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 11, color: coresTema.onSurfaceVariant },
  btnSeguir: { backgroundColor: coresTema.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 },
  btnSeguindo: { backgroundColor: coresTema.surfaceContainerHigh, borderWidth: 1, borderColor: coresTema.outlineVariant },
  btnSeguirTxt: { color: coresTema.onPrimary, fontFamily: "BeVietnamPro_600SemiBold", fontSize: 12 },
  btnSeguindoTxt: { color: coresTema.onSurface },
});