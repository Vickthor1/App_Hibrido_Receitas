//importa o axios para fazer requisições HTTP
import axios from 'axios';

import {
    Receita,
    RespostaReceitas,
    Categoria,
    RespostaCategorias,    
} from "../tipos/receitas";

//cria uma instância do axios com a URL base da API
const api = axios.create({
    baseURL: "https://www.themealdb.com/api/json/v1/1",
});

//busca todas as receitas
export async function busccarReceitas(
    nome: string,
): Promise<Receita[]> {
    const response = await api.get<RespostaReceitas>("/search.php", {
    params: {
        s: nome,
    },
});
 return response.data.meals ?? [];
}

//busca todas as receitas por ID
export async function buscarReceitaPorId(
    id: string,
): Promise<Receita | null> {
    const response = await api.get<RespostaReceitas>("/lookup.php", {
        params: {
            i: id,
        },
    });
    return response.data.meals?.[0] ?? null;
}

//busca todas as categorias
export async function buscarCategorias(): Promise<Categoria[]> {
    const response = await api.get<RespostaCategorias>("/categories.php");

    return response.data.categories ?? [];
}

