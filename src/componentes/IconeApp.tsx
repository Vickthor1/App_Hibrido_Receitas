import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTema } from "../contexto/TemaContext";
import { Cores } from "../tema/cores";

export default function IconeApp({ size = 80 }: { size?: number }) {
  const { coresTema } = useTema();
  const styles = criarStyles(coresTema);
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80" }}
        style={styles.img}
        contentFit="cover"
      />
    </View>
  );
}

const criarStyles = (coresTema: Cores) =>
  StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: coresTema.primaryContainer, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: coresTema.surfaceVariant },
  img: { width: "100%", height: "100%" },
});
