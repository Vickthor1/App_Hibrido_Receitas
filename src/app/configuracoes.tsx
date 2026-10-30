
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AvatarUsuario } from "../componentes/AvatarUsuario";
import {
  CabecalhoSecao,
  criarStyles,
} from "../componentes/CabecalhoSecao";

import { useAuth } from "../contexto/AuthContext";
import { useTema } from "../contexto/TemaContext";

import {
  isSupabaseConfigured,
  supabase,
} from "../lib/supabase";

import {
  fazerUploadAvatar,
  selecionarImagem,
} from "../servicos/avatar";

export default function Configuracoes() {
  const router = useRouter();

  const { user, atualizarAvatar, logout } = useAuth();

  // Tema claro e escuro
  const { tema, coresTema, alternarTema } = useTema();

  // Estilos atualizados conforme o tema
  const s = criarStyles(coresTema);

  const [nome, setNome] = useState(user?.nome ?? "");
  const [enviando, setEnviando] = useState(false);

  // Salvar nome
  async function handleSalvarNome() {
    if (!nome.trim() || nome.trim().length < 2) {
      Alert.alert(
        "Nome inválido",
        "Informe um nome com pelo menos 2 caracteres."
      );
      return;
    }

    setEnviando(true);

    try {
      if (isSupabaseConfigured && user) {
        const { error } = await supabase
          .from("perfis")
          .upsert({
            id: user.id,
            nome: nome.trim(),
            avatar_url: user.avatarUrl ?? null,
          });

        if (error) {
          throw error;
        }
      }

      Alert.alert("Sucesso!", "Nome atualizado.");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível salvar o nome."
      );
    } finally {
      setEnviando(false);
    }
  }

  // Alterar foto
  async function handleTrocarFoto() {
    setEnviando(true);

    try {
      const asset = await selecionarImagem("galeria");

      if (!asset || !user) return;

      const res = await fazerUploadAvatar(
        user.id,
        asset
      );

      if (!res.ok || !res.url) {
        Alert.alert(
          "Erro",
          res.erro ?? "Falha no upload."
        );
        return;
      }

      const upd = await atualizarAvatar(res.url);

      if (!upd.ok) {
        Alert.alert(
          "Erro",
          upd.erro ?? "Erro ao salvar."
        );
        return;
      }

      Alert.alert(
        "Sucesso!",
        "Foto atualizada."
      );
    } catch (e) {
      Alert.alert(
        "Erro",
        e instanceof Error
          ? e.message
          : "Não foi possível trocar a foto."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Configurações da Conta" />

      <ScrollView
        contentContainerStyle={s.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* FOTO DE PERFIL */}
        <View style={[s.card, styles.fotoCard]}>
          <AvatarUsuario tamanho={88} />

          <TouchableOpacity
            style={[
              s.btnSecundario,
              { marginTop: 12 },
            ]}
            onPress={handleTrocarFoto}
            disabled={enviando}
            accessibilityRole="button"
          >
            {enviando ? (
              <ActivityIndicator
                color={coresTema.primary}
                size="small"
              />
            ) : (
              <Text style={s.btnSecundarioText}>
                Alterar foto
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* NOME DE EXIBIÇÃO */}
        <View style={s.card}>
          <Text style={s.cardTitle}>
            Nome de exibição
          </Text>

          <Text style={s.labelCampo}>
            Nome
          </Text>

          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor={
              coresTema.onSurfaceVariant
            }
            style={s.campo}
            maxLength={60}
          />

          <TouchableOpacity
            style={[
              s.btnPrimario,
              {
                opacity: enviando ? 0.6 : 1,
              },
            ]}
            onPress={handleSalvarNome}
            disabled={enviando}
            accessibilityRole="button"
          >
            <Text style={s.btnPrimarioText}>
              Salvar nome
            </Text>
          </TouchableOpacity>
        </View>

        {/* OPÇÕES */}
        <View style={s.card}>
          <Text style={s.cardTitle}>
            Suas opções
          </Text>

          {/* MODO ESCURO */}
          <TouchableOpacity
            style={s.row}
            onPress={alternarTema}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>
                Modo escuro
              </Text>

              <Text
                style={{
                  color: coresTema.onSurfaceVariant,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {tema === "escuro"
                  ? "Ativado"
                  : "Desativado"}
              </Text>
            </View>

            <Icone
              name={
                tema === "escuro"
                  ? "weather-night"
                  : "white-balance-sunny"
              }
              size={22}
              color={coresTema.primary}
            />
          </TouchableOpacity>

          {/* LOGIN BIOMÉTRICO */}
          <TouchableOpacity
            style={s.row}
            onPress={() => router.push("/biometria-config" as never)}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>Login biométrico</Text>
              <Text style={{ color: coresTema.onSurfaceVariant, fontSize: 13, marginTop: 4 }}>
                Impressão digital ou Face ID
              </Text>
            </View>
            <Icone name="fingerprint" size={22} color={coresTema.primary} />
          </TouchableOpacity>

          {/* PRIVACIDADE */}
          <TouchableOpacity
            style={s.row}
            onPress={() =>
              router.push("/privacidade")
            }
            accessibilityRole="button"
          >
            <Text style={s.rowLabel}>
              Privacidade e segurança
            </Text>

            <Icone
              name="chevron-right"
              size={18}
              color={
                coresTema.onSurfaceVariant
              }
            />
          </TouchableOpacity>

          {/* AJUDA */}
          <TouchableOpacity
            style={s.row}
            onPress={() =>
              router.push("/ajuda")
            }
            accessibilityRole="button"
          >
            <Text style={s.rowLabel}>
              Ajuda
            </Text>

            <Icone
              name="chevron-right"
              size={18}
              color={
                coresTema.onSurfaceVariant
              }
            />
          </TouchableOpacity>

          {/* SAIR DA CONTA */}
          <TouchableOpacity
            style={s.row}
            onPress={() => {
              logout();
              router.replace("/");
            }}
            accessibilityRole="button"
          >
            <Text
              style={[
                s.rowLabel,
                {
                  color: coresTema.error,
                },
              ]}
            >
              Sair
            </Text>

            <Icone
              name="logout"
              size={18}
              color={coresTema.error}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fotoCard: {
    alignItems: "center",
  },
});
