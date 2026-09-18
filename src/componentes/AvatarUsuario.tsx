import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons as Icone } from "@expo/vector-icons";
import { useAuth } from "../contexto/AuthContext";
import { cores } from "../tema/cores";

/**
 * Avatar do usuário — reutilizável em TopBar, Perfil, Menu etc.
 * P1: foto de perfil quando existir | P2: ícone de pessoa quando não existir
 */
export function AvatarUsuario({ tamanho = 32, onPress }: { tamanho?: number; onPress?: () => void }) {
  const { user } = useAuth();
  const raio = tamanho / 2;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: raio,
          borderWidth: tamanho >= 40 ? 2 : 1,
        },
      ]}
      onTouchEnd={onPress}
      onStartShouldSetResponder={() => false}
    >
      {user?.avatarUrl ? (
        <Image
          source={{ uri: user.avatarUrl }}
          style={{ width: tamanho - 4, height: tamanho - 4, borderRadius: raio - 2 }}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          accessibilityLabel="Foto de perfil"
        />
      ) : (
        <Icone name="account" size={tamanho * 0.55} color={cores.onSurfaceVariant} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", overflow: "hidden", borderColor: cores.outline, backgroundColor: cores.surfaceContainerHigh },
});