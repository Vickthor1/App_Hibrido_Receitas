import AsyncStorage from "@react-native-async-storage/async-storage";

// Obfuscacao simples (nao é criptografia real, mas impede leitura direta em AsyncStorage)
// Para produção web, ideal seria expo-secure-store ou criptografia AES
const CHAVE_SALT = "receita_facil_v1_";

function b64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(CHAVE_SALT + str)));
  } catch { return btoa(CHAVE_SALT + str); }
}
function b64Decode(b64: string): string | null {
  try {
    const decoded = decodeURIComponent(escape(atob(b64)));
    if (!decoded.startsWith(CHAVE_SALT)) return null;
    return decoded.slice(CHAVE_SALT.length);
  } catch { return null; }
}

export async function setItemSeguro(key: string, value: string): Promise<void> {
  const encoded = b64Encode(value);
  await AsyncStorage.setItem(key, encoded);
}

export async function getItemSeguro(key: string): Promise<string | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const decoded = b64Decode(raw);
  // se falhou decode, pode ser dado legado não-encoded -> retorna raw e migra
  if (decoded === null) {
    // tenta validar JSON legado
    try { JSON.parse(raw); return raw; } catch { return null; }
  }
  return decoded;
}

export async function removeItemSeguro(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
