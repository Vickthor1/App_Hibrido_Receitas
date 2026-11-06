import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { cores, Cores, coresEscuras } from "../tema/cores";

type Tema = "claro" | "escuro";

const CHAVE_TEMA = "@receita_facil:tema";

interface TemaContextData {
  tema: Tema;
  coresTema: Cores;
  alternarTema: () => void;
  definirTema: (tema: Tema) => void;
}

const TemaContext = createContext<TemaContextData | undefined>(undefined);

interface TemaProviderProps {
  children: ReactNode;
}

export function TemaProvider({ children }: TemaProviderProps) {
  const [tema, setTema] = useState<Tema>("claro");

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TEMA)
      .then((salvo) => {
        if (salvo === "claro" || salvo === "escuro") setTema(salvo);
      })
      .catch(() => {});
  }, []);

  function definirTema(novoTema: Tema) {
    setTema(novoTema);
    AsyncStorage.setItem(CHAVE_TEMA, novoTema).catch(() => {});
  }

  function alternarTema() {
    definirTema(tema === "claro" ? "escuro" : "claro");
  }

  const coresTema = tema === "claro" ? cores : coresEscuras;

  return (
    <TemaContext.Provider
      value={{
        tema,
        coresTema,
        alternarTema,
        definirTema,
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}
export function useTema() {
  const contexto = useContext(TemaContext);

  if (!contexto) {
    console.error(
      "ERRO: useTema chamado fora do TemaProvider",
      new Error().stack
    );

    throw new Error(
      "useTema deve ser usado dentro de um TemaProvider"
    );
  }

  return contexto;
}