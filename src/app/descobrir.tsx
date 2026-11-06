import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { descobrirUsuarios, PerfilSocial } from "../servicos/seguidores";
import { TopBar } from "../componentes/TopBar";
import { BottomNav } from "../componentes/BottomNav";
import { AvatarUsuario } from "../componentes/AvatarUsuario";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";
import { espacamentos } from "../tema/espacamentos";

export default function DescobrirUsuariosScreen() {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [usuarios, setUsuarios] = useState<PerfilSocial[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    descobrirUsuarios(termo).then((res) => {
      if (ativo) {
        setUsuarios(res);
        setCarregando(false);
      }
    });
    return () => {
      ativo = false;
    };
  }, [termo]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Descobrir Autores" />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={coresTema.onSurfaceVariant} />
        <TextInput
          style={styles.input}
          placeholder="Buscar criadores por nome..."
          placeholderTextColor={coresTema.onSurfaceVariant}
          value={termo}
          onChangeText={setTermo}
          autoCapitalize="none"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {carregando ? (
          <Text style={styles.msg}>Buscando autores...</Text>
        ) : usuarios.length === 0 ? (
          <Text style={styles.msg}>Nenhum usuário encontrado.</Text>
        ) : (
          usuarios.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={styles.card}
              onPress={() => router.push(`/autor/${u.id}` as never)}
              activeOpacity={0.8}
            >
              <AvatarUsuario tamanho={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{u.nome}</Text>
                <Text style={styles.sub}>Ver perfil e receitas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={coresTema.onSurfaceVariant} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: coresTema.background },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: coresTema.surfaceContainerLow, margin: 16, paddingHorizontal: 12, height: 44, borderRadius: 9999, borderWidth: 1, borderColor: coresTema.outlineVariant + "40", gap: 8 },
  input: { flex: 1, fontFamily: "BeVietnamPro_400Regular", fontSize: 14, color: coresTema.onSurface },
  scroll: { padding: espacamentos.page, gap: 12, paddingBottom: 100 },
  msg: { textAlign: "center", fontFamily: "BeVietnamPro_400Regular", fontSize: 13, color: coresTema.onSurfaceVariant, marginTop: 32 },
  card: { backgroundColor: coresTema.surfaceContainerLowest, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: coresTema.surfaceVariant },
  nome: { fontFamily: "BeVietnamPro_600SemiBold", fontSize: 15, color: coresTema.onSurface },
  sub: { fontFamily: "BeVietnamPro_400Regular", fontSize: 12, color: coresTema.onSurfaceVariant },
});
