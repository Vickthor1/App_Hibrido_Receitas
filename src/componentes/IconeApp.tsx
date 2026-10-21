import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { cores } from "../tema/cores";

export default function IconeApp({ size = 80 }: { size?: number }) {
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

const styles = StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: cores.primaryContainer, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: cores.surfaceVariant },
  img: { width: "100%", height: "100%" },
});
