import { useState, useEffect, useCallback } from "react";
import {
  seguirUsuario,
  deixarDeSeguir,
  verificarSeSegue,
  contarSeguidores,
  contarSeguindo,
} from "../servicos/seguidores";
import { useAuth } from "../contexto/AuthContext";

export function useSeguidor(usuarioId: string) {
  const { isAutenticado, user } = useAuth();
  const [seguindo, setSeguindo] = useState(false);
  const [totalSeguidores, setTotalSeguidores] = useState(0);
  const [totalSeguindo, setTotalSeguindo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const éMinhaConta = user?.id === usuarioId;

  const atualizarStats = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const [s, seg, sig] = await Promise.all([
        verificarSeSegue(usuarioId),
        contarSeguidores(usuarioId),
        contarSeguindo(usuarioId),
      ]);
      setSeguindo(s);
      setTotalSeguidores(seg);
      setTotalSeguindo(sig);
    } catch {} finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    atualizarStats();
  }, [atualizarStats]);

  const alternarSeguir = async () => {
    if (!isAutenticado || éMinhaConta || processando) return;
    setProcessando(true);
    try {
      if (seguindo) {
        const res = await deixarDeSeguir(usuarioId);
        if (res.ok) {
          setSeguindo(false);
          setTotalSeguidores((prev) => Math.max(0, prev - 1));
        }
      } else {
        const res = await seguirUsuario(usuarioId);
        if (res.ok) {
          setSeguindo(true);
          setTotalSeguidores((prev) => prev + 1);
        }
      }
    } finally {
      setProcessando(false);
    }
  };

  return {
    seguindo,
    totalSeguidores,
    totalSeguindo,
    carregando,
    processando,
    éMinhaConta,
    alternarSeguir,
    atualizarStats,
  };
}
