import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CabecalhoSecao,
  criarStyles as criarEstilosCompartilhados,
} from "../componentes/CabecalhoSecao";
import { useTema } from "../contexto/TemaContext";



const faqs = [
  { p: "Como encontrar uma receita?", r: "Use a busca na Home digitando o nome ou ingrediente (ex: 'frango', 'bolo'). Você também pode navegar pelas Categorias." },
  { p: "Como salvar uma receita nos favoritos?", r: "Abra a receita e toque no coração. Sua receita aparecerá em Favoritos." },
  { p: "Preciso criar uma conta?", r: "Não. Navegar e pesquisar funciona sem conta. Login é necessário para Favoritos na nuvem, Foto de Perfil, Minhas Receitas e Avaliações." },
  { p: "Como adicionar uma receita?", r: "Entre no menu (☰) → Minhas Receitas → '+ Adicionar'. Preencha os campos e salve." },
  { p: "Esqueci minha senha", r: "Na tela de login, toque em 'Esqueceu sua senha?', informe seu email e abra o link que enviaremos." },
];

export default function Ajuda() {
  const { coresTema } = useTema();
  const s = criarEstilosCompartilhados(coresTema);

  return (
    <SafeAreaView style={s.safe}>
      <CabecalhoSecao titulo="Ajuda" />
      <ScrollView contentContainerStyle={s.conteudo}>
        <Text style={{ fontFamily: "BeVietnamPro_700Bold", fontSize: 20, color: coresTema.onSurface }}>Guia do aplicativo</Text>
        <Text style={s.cardText}>Guia rápido para usar o Receita Fácil.</Text>
        {faqs.map((f, i) => (
          <View key={i} style={s.card}>
            <Text style={s.cardTitle}>{f.p}</Text>
            <Text style={s.cardText}>{f.r}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}