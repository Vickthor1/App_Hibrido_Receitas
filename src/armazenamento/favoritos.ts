//importando o AsyncStorage para salvar e carregar os favoritos
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Receita} from "../tipos/receita";

//chave para salvar os favoritos no AsyncStorage
const CHAVE_FAVORITOS = "@receita_facil:favoritos";

//função para salvar os favoritos no AsyncStorage
export async function salvarFavoritos(
    favoritos: Receita[]
) {
    await AsyncStorage.setItem(
        CHAVE_FAVORITOS,
        JSON.stringify(favoritos)
    );
}

//função para carregar os favoritos do AsyncStorage
export async function carregarFavoritos(): Promise<Receita[]> {
    const dados = await AsyncStorage.getItem(CHAVE_FAVORITOS);

    if (!dados) {
        return [];
    }

    return JSON.parse(dados);
}