//import das receitas
import { buscarReceitas } from "../servicos/api";
import { Receita } from "../tipos/receita";

// Função para pesquisar receitas por nome
async function pesquisar(nome: string){
    try {
        // Chamada da função buscarReceitas para obter as receitas correspondentes ao nome fornecido
        const receitas: Receita[] = await buscarReceitas(nome);
        
        // Exibe as receitas no console
        console.log(receitas);

        // Itera sobre cada receita e exibe informações relevantes
        receitas.forEach((receita) => {
            console.log(receita.strMeal); // Nome da receita
            console.log(receita.strMealThumb); // URL da imagem da receita para exibição
            console.log(receita.strInstructions); // Instruções da receita
        }); 
    } catch (error) { // Tratamento de erro
        console.error("Erro ao buscar receitas:", error);
    }
}
