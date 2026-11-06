export type DadosLinkRecuperacao = {
  accessToken: string | null;
  refreshToken: string | null;
  codigo: string | null;
  erro: string | null;
};

/** Lê os dados que o Supabase coloca no link enviado por e-mail. */
export function lerLinkRecuperacao(url: string): DadosLinkRecuperacao {
  const inicioConsulta = url.indexOf("?");
  const inicioFragmento = url.indexOf("#");

  const consulta =
    inicioConsulta >= 0
      ? url.slice(inicioConsulta + 1, inicioFragmento > inicioConsulta ? inicioFragmento : undefined)
      : "";
  const fragmento = inicioFragmento >= 0 ? url.slice(inicioFragmento + 1) : "";

  const dados = new URLSearchParams(`${consulta}&${fragmento}`);

  return {
    accessToken: dados.get("access_token"),
    refreshToken: dados.get("refresh_token"),
    codigo: dados.get("code"),
    erro: dados.get("error_description") ?? dados.get("error"),
  };
}
