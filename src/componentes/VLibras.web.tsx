
import { useEffect } from "react";

export default function VLibras() {
  useEffect(() => {
    const id = "vlibras-script";

    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Mantém o widget durante a navegação.
    };
  }, []);

  return null;
}
