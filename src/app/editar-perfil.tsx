import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";

export default function EditarPerfil() {
  const router = useRouter();
  const { user } = useAuth();

  const [nome, setNome] = useState(user?.nome ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Editar Perfil</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome"
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={() => {
            console.log("Nome:", nome);
            console.log("Email:", email);
          }}
        >
          <Text style={styles.botaoTexto}>SALVAR ALTERAÇÕES</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: cores.background,
  },

  container: {
    padding: 24,
    gap: 10,
  },

  voltar: {
    color: cores.primary,
    fontSize: 14,
    marginBottom: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: cores.onSurface,
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: cores.onSurfaceVariant,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#000000",
  },

  botao: {
    backgroundColor: cores.primary,
    borderRadius: 999,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  botaoTexto: {
    color: "#fff",
    fontWeight: "700",
  },
});