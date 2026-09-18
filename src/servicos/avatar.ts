import * as ImagePicker from "expo-image-picker";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { checkRateLimit } from "../utils/seguranca";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ResultadoAvatar {
  ok: boolean;
  url?: string | null;
  erro?: string;
}

/**
 * Seleciona uma imagem da galeria ou câmera
 */
export async function selecionarImagem(origem: "galeria" | "camera"): Promise<ImagePicker.ImagePickerAsset | null> {
  if (origem === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      throw new Error("Permissão para usar a câmera é necessária.");
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return result.assets[0];
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      throw new Error("Permissão para acessar a galeria é necessária.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return result.assets[0];
  }
}

/**
 * Valida o tamanho e formato do asset selecionado
 */
export function validarAssetAvatar(asset: ImagePicker.ImagePickerAsset): { valido: boolean; motivo?: string } {
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
    return { valido: false, motivo: "A imagem excede o limite de 5MB." };
  }
  if (asset.mimeType && !ALLOWED_MIME_TYPES.includes(asset.mimeType.toLowerCase())) {
    return { valido: false, motivo: "Formato inválido. Use JPEG, PNG ou WebP." };
  }
  return { valido: true };
}

/**
 * Envia o arquivo de avatar para o Supabase Storage ou gera URI local
 */
export async function fazerUploadAvatar(
  userId: string,
  asset: ImagePicker.ImagePickerAsset
): Promise<ResultadoAvatar> {
  const rl = checkRateLimit(`upload:${userId}`, 5, 60000);
  if (!rl.allowed) {
    return { ok: false, erro: "Muitos uploads em pouco tempo. Aguarde 1 minuto." };
  }

  const v = validarAssetAvatar(asset);
  if (!v.valido) {
    return { ok: false, erro: v.motivo };
  }

  if (isSupabaseConfigured) {
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Extensão sanitizada
      let ext = "jpg";
      if (asset.mimeType?.includes("png")) ext = "png";
      else if (asset.mimeType?.includes("webp")) ext = "webp";

      const fileName = `${userId}/avatar_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: asset.mimeType ?? "image/jpeg",
          upsert: true,
        });

      if (error) {
        return { ok: false, erro: `Falha no upload: ${error.message}` };
      }

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(data.path);
      return { ok: true, url: publicData.publicUrl };
    } catch (e) {
      return { ok: false, erro: e instanceof Error ? e.message : "Erro ao processar imagem." };
    }
  } else {
    // Modo offline / mock -> usa URI da imagem diretamente
    return { ok: true, url: asset.uri };
  }
}
