//importes de react e react-native
import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

//importes de serviços e tipos
import { buscarReceitaPorId } from "../../servicos/api";
import { Receita } from "../../tipos/receita";

//componente principal
export default function ReceitaDetalhes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  //estado para armazenar a receita e o estado de carregamento
  const [receita, setReceita] = useState<Receita | null>(null);
  const [carregando, setCarregando] = useState(true);
  
  //useEffect para carregar a receita ao montar o componente
  useEffect(() => {
  
    //função assíncrona para buscar a receita pelo id
    async function carregarReceita() {
      try {
        if (!id) return;

        const resultado = await buscarReceitaPorId(id);

        setReceita(resultado); //atualiza o estado com a receita buscada
  
    } catch (error) { //aqui é a função que trata o erro caso a receita não seja encontrada
        console.error("Erro ao carregar receita:", error);
  
    } finally {//aqui é a função que atualiza o estado de carregamento para falso, indicando que a busca terminou
        setCarregando(false);
      }
    }
  
    //chama a função para carregar a receita
    carregarReceita();
  }, [id]);

  //renderiza a tela de carregamento enquanto a receita está sendo buscada
  if (carregando) {
    return (
      <View style={styles.container}>
        <Text>Carregando receita...</Text>
      </View>
    );
  }

  //renderiza a mensagem de erro caso a receita não seja encontrada
  if (!receita) {
    return (
      <View style={styles.container}>
        <Text>Receita não encontrada.</Text>
      </View>
    );
  }

  //renderiza os detalhes da receita quando a receita é encontrada
  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: receita.strMealThumb }}
        style={styles.imagem}
      />

      <View style={styles.conteudo}>
        <Text style={styles.titulo}>
          {receita.strMeal}
        </Text>

        <Text style={styles.categoria}>
          {receita.strCategory} • {receita.strArea}
        </Text>

        <Text style={styles.subtitulo}>
          Modo de preparo
        </Text>

        <Text style={styles.instrucoes}>
          {receita.strInstructions}
        </Text>
      </View>
    </ScrollView>
  );
}

//estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  imagem: {
    width: "100%",
    height: 300,
  },

  conteudo: {
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
  },

  categoria: {
    marginTop: 8,
    fontSize: 16,
  },

  subtitulo: {
    marginTop: 25,
    fontSize: 22,
    fontWeight: "bold",
  },

  instrucoes: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
  },
});