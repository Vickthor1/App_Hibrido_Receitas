import { useCallback, useEffect, useState } from "react";

import {
  traducaoConhecida,
  traduzirCurto,
  traduzirLongo,
} from "../servicos/traducao";

type Opcoes = {
  ativo?: boolean;
  longo?: boolean;
};

type Resultado = {
  original: string;
  tentativa: number;
  traducao: string;
};

/** Mostra o texto original até a tradução chegar. */
export function useTraducao(
  texto: string | null | undefined,
  { ativo = true, longo = false }: Opcoes = {}
) {
  const original = texto ?? "";
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!ativo || !original) return;

    let atual = true;
    const traduzir = longo ? traduzirLongo : traduzirCurto;

    traduzir(original).then((traducao) => {
      if (atual) setResultado({ original, tentativa, traducao });
    });

    return () => {
      atual = false;
    };
  }, [original, ativo, longo, tentativa]);

  const tentarNovamente = useCallback(() => {
    setTentativa((atual) => atual + 1);
  }, []);

  if (!ativo) {
    return { texto: original, traduzido: false, carregando: false, tentarNovamente };
  }

  const pronto = resultado?.original === original && resultado.tentativa === tentativa;
  const traducao = pronto ? resultado.traducao : traducaoConhecida(original.trim());

  return {
    texto: traducao ?? original,
    traduzido: !!traducao && traducao !== original,
    carregando: !!original && !pronto && !traducao,
    tentarNovamente,
  };
}
