import { useCallback, useEffect, useState } from "react";
import { Receita } from "../tipos/receita";
import {
  carregarFavoritos,
  salvarFavoritos,
  alternarFavorito as alternarNoStorage,
  isFavoritoNaLista,
  Favorito,
} from "../armazenamento/favoritos";

interface UseFavoritosRetorno {
  favoritos: Favorito[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  isFavorito: (idMeal: string) => boolean;
  alternarFavorito: (receita: Favorito) => Promise<boolean>;
  adicionarFavorito: (receita: Favorito) => Promise<void>;
  removerFavorito: (idMeal: string) => Promise<void>;
  limpar: () => Promise<void>;
}

/**
 * Hook para gerenciar favoritos com persistência via AsyncStorage.
 * Requisitos: adicionar/remover, persistir localmente, exibir loading.
 */
export function useFavoritos(): UseFavoritosRetorno {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await carregarFavoritos();
      setFavoritos(dados);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar favoritos.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const isFavorito = useCallback(
    (idMeal: string) => isFavoritoNaLista(favoritos, idMeal),
    [favoritos]
  );

  const alternarFavorito = useCallback(
    async (receita: Favorito): Promise<boolean> => {
      try {
        const { favoritos: novos, isFavorito: novoEstado } = await alternarNoStorage(receita);
        setFavoritos(novos);
        return novoEstado;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao atualizar favorito.";
        setErro(msg);
        return isFavoritoNaLista(favoritos, receita.idMeal);
      }
    },
    [favoritos]
  );

  const adicionarFavorito = useCallback(
    async (receita: Favorito) => {
      if (isFavoritoNaLista(favoritos, receita.idMeal)) return;
      const novos = [...favoritos, receita];
      setFavoritos(novos);
      try {
        await salvarFavoritos(novos);
      } catch (e) {
        setFavoritos(favoritos); // rollback
        const msg = e instanceof Error ? e.message : "Erro ao adicionar favorito.";
        setErro(msg);
      }
    },
    [favoritos]
  );

  const removerFavorito = useCallback(
    async (idMeal: string) => {
      const novos = favoritos.filter((f) => f.idMeal !== idMeal);
      const anteriores = favoritos;
      setFavoritos(novos);
      try {
        await salvarFavoritos(novos);
      } catch (e) {
        setFavoritos(anteriores);
        const msg = e instanceof Error ? e.message : "Erro ao remover favorito.";
        setErro(msg);
      }
    },
    [favoritos]
  );

  const limpar = useCallback(async () => {
    setFavoritos([]);
    try {
      await salvarFavoritos([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao limpar favoritos.";
      setErro(msg);
    }
  }, []);

  return {
    favoritos,
    carregando,
    erro,
    recarregar,
    isFavorito,
    alternarFavorito,
    adicionarFavorito,
    removerFavorito,
    limpar,
  };
}
