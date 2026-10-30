/**
 * Utilitário de validação e extração de ID de vídeo do YouTube.
 * Requisitos de segurança:
 * - Valida domínio oficial (youtube.com, youtu.be, youtube-nocookie.com)
 * - Extrai somente o ID alfanumérico (11 caracteres)
 * - Rejeita URLs arbitrárias ou maliciosas
 */
export function extrairIdYoutube(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Domínios permitidos
    const dominiosValidos = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"];
    if (!dominiosValidos.some((d) => host === d || host.endsWith("." + d))) {
      return null;
    }

    let videoId: string | null = null;

    if (host.includes("youtu.be")) {
      // Formato: https://youtu.be/VIDEO_ID
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        videoId = parts[0];
      }
    } else {
      // Formato: https://www.youtube.com/watch?v=VIDEO_ID ou /embed/VIDEO_ID
      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/v/")) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length > 1) {
          videoId = parts[1];
        }
      } else {
        videoId = parsed.searchParams.get("v");
      }
    }

    if (!videoId) return null;

    // IDs do YouTube possuem tipicamente 11 caracteres alfanuméricos, hífen ou underline
    const limpo = videoId.split("?")[0].split("&")[0];
    if (/^[a-zA-Z0-9_-]{10,12}$/.test(limpo)) {
      return limpo;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Gera a URL segura de incorporação (privacy-enhanced mode)
 */
export function gerarUrlEmbed(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
}
