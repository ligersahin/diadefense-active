import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const nav = useNavigation<any>();

  const goNext = () => {
    // >>> BURASI DEĞİŞTİ: Home değil MainTabs
    nav.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    // alternatif: nav.navigate("MainTabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DiaDefense’e Hoş Geldin</Text>
      <Text style={styles.p}>Başlamak için devam et.</Text>

      <Pressable style={styles.btn} onPress={goNext}>
        <Text style={styles.btnT}>Devam</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#1a1a1a", marginBottom: 8 },
  p: { fontSize: 16, color: "#555", marginBottom: 24 },
  btn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  btnT: { color: "#fff", fontSize: 16, fontWeight: "700" },
});