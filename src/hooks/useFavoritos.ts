import { useCallback, useEffect, useState } from "react";
import { Favorito, carregarFavoritos, salvarFavoritos, alternarFavorito as alternarNoStorage, isFavoritoNaLista } from "../armazenamento/favoritos";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";

interface Retorno {
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

export function useFavoritos(): Retorno {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      if (isSupabaseConfigured && user) {
        const { data, error } = await supabase.from("favoritos").select("id_meal,str_meal,str_thumb").eq("user_id", user.id);
        if (error) throw error;
        const mapped: Favorito[] = (data ?? []).map((r: { id_meal: string; str_meal: string; str_thumb: string }) => ({
          idMeal: r.id_meal,
          strMeal: r.str_meal,
          strMealThumb: r.str_thumb,
        } as Favorito));
        setFavoritos(mapped);
      } else {
        const dados = await carregarFavoritos();
        setFavoritos(dados);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar favoritos.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const isFavorito = useCallback((idMeal: string) => isFavoritoNaLista(favoritos, idMeal), [favoritos]);

  const alternarFavorito = useCallback(
    async (receita: Favorito): Promise<boolean> => {
      // Se Supabase + logado, usa Supabase
      if (isSupabaseConfigured && user) {
        const existe = favoritos.some((f) => f.idMeal === receita.idMeal);
        try {
          if (existe) {
            const { error } = await supabase.from("favoritos").delete().eq("user_id", user.id).eq("id_meal", receita.idMeal);
            if (error) throw error;
            setFavoritos((prev) => prev.filter((f) => f.idMeal !== receita.idMeal));
            return false;
          } else {
            const { error } = await supabase.from("favoritos").insert({ user_id: user.id, id_meal: receita.idMeal, str_meal: receita.strMeal, str_thumb: receita.strMealThumb });
            if (error) throw error;
            setFavoritos((prev) => [...prev, receita]);
            return true;
          }
        } catch (e) {
          setErro(e instanceof Error ? e.message : "Erro ao atualizar favorito.");
          return existe ? true : false;
        }
      }
      // fallback local
      try {
        const { favoritos: novos, isFavorito: novoEstado } = await alternarNoStorage(receita);
        setFavoritos(novos);
        return novoEstado;
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao atualizar favorito.");
        return isFavoritoNaLista(favoritos, receita.idMeal);
      }
    },
    [favoritos, user]
  );

  const adicionarFavorito = useCallback(
    async (receita: Favorito) => {
      if (isFavoritoNaLista(favoritos, receita.idMeal)) return;
      if (isSupabaseConfigured && user) {
        const { error } = await supabase.from("favoritos").insert({ user_id: user.id, id_meal: receita.idMeal, str_meal: receita.strMeal, str_thumb: receita.strMealThumb });
        if (!error) setFavoritos((prev) => [...prev, receita]);
        else setErro(error.message);
        return;
      }
      const novos = [...favoritos, receita];
      setFavoritos(novos);
      try {
        await salvarFavoritos(novos);
      } catch (e) {
        setFavoritos(favoritos);
        setErro(e instanceof Error ? e.message : "Erro ao adicionar favorito.");
      }
    },
    [favoritos, user]
  );

  const removerFavorito = useCallback(
    async (idMeal: string) => {
      if (isSupabaseConfigured && user) {
        const { error } = await supabase.from("favoritos").delete().eq("user_id", user.id).eq("id_meal", idMeal);
        if (!error) setFavoritos((prev) => prev.filter((f) => f.idMeal !== idMeal));
        else setErro(error.message);
        return;
      }
      const novos = favoritos.filter((f) => f.idMeal !== idMeal);
      const anteriores = favoritos;
      setFavoritos(novos);
      try {
        await salvarFavoritos(novos);
      } catch (e) {
        setFavoritos(anteriores);
        setErro(e instanceof Error ? e.message : "Erro ao remover favorito.");
      }
    },
    [favoritos, user]
  );

  const limpar = useCallback(async () => {
    if (isSupabaseConfigured && user) {
      await supabase.from("favoritos").delete().eq("user_id", user.id);
      setFavoritos([]);
      return;
    }
    setFavoritos([]);
    try {
      await salvarFavoritos([]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao limpar favoritos.");
    }
  }, [user]);

  return { favoritos, carregando, erro, recarregar, isFavorito, alternarFavorito, adicionarFavorito, removerFavorito, limpar };
}
