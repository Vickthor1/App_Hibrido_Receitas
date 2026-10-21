import { createContext, ReactNode, useContext, useState } from "react";
import { cores, Cores, coresEscuras } from "../tema/cores";

type Tema = "claro" | "escuro";

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

  function alternarTema() {
    setTema((atual) => (atual === "claro" ? "escuro" : "claro"));
  }

  function definirTema(novoTema: Tema) {
    setTema(novoTema);
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
    throw new Error("useTema deve ser usado dentro de um TemaProvider");
  }

  return contexto;
}