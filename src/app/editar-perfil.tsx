import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";

export default function EditarPerfil() {
  const router = useRouter();
  const { user } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const salvarPerfil = async () => {
    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();

    if (!nomeTratado) {
      Alert.alert("Atenção", "Digite seu nome.");
      return;
    }

    if (!emailTratado) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTratado);

    if (!emailValido) {
      Alert.alert("Atenção", "Digite um e-mail válido.");
      return;
    }

    try {
      setSalvando(true);

      // TODO:
      // Aqui você chama sua API / banco / Firebase
      // await atualizarPerfil({
      //   nome: nomeTratado,
      //   email: emailTratado,
      // });

      console.log("Nome:", nomeTratado);
      console.log("Email:", emailTratado);

      Alert.alert(
        "Perfil atualizado",
        "Suas informações foram salvas com sucesso.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);

      Alert.alert(
        "Erro",
        "Não foi possível salvar suas alterações. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.botaoVoltar}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Text style={styles.voltar}>← Voltar</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.titulo}>Editar Perfil</Text>
              <Text style={styles.subtitulo}>
                Atualize suas informações pessoais.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.campo}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  returnKeyType="next"
                  accessibilityLabel="Nome"
                />
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>E-mail</Text>

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  accessibilityLabel="E-mail"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.botao,
                  salvando && styles.botaoDesabilitado,
                ]}
                onPress={salvarPerfil}
                disabled={salvando}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Salvar alterações"
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botaoTexto}>
                    SALVAR ALTERAÇÕES
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: cores.background,
  },

  flex: {
    flex: 1,
  },

  container: {
    padding: 24,
    paddingBottom: 40,
  },

  botaoVoltar: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingRight: 12,
    marginBottom: 20,
  },

  voltar: {
    color: cores.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  header