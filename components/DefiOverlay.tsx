import React, { useEffect, useRef } from "react";
import { Modal, View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { useDefi } from "../providers/DefiProvider";

export default function DefiOverlay() {
  const { showDefi, closeDefi } = useDefi();
  const nav = useNavigation<NavigationProp<any>>();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showDefi) {
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const t = setTimeout(() => handleClose(), 6000);
      return () => clearTimeout(t);
    }
  }, [showDefi]);

  const handleClose = () => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      closeDefi();
      try { nav.navigate("Home" as never); } catch {}
    });
  };

  if (!showDefi) return null;

  return (
    <Modal visible={showDefi} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Defi</Text>
          <Text style={styles.msg}>
            “3 ayda metabolizmanı yeniden dengede kur. İnsülin direncini kır, fazla kilolardan kurtul.
            Bugün küçük bir adım: 15 dk yürüyüş + su hedefi.”
          </Text>
          <Pressable onPress={handleClose} style={styles.btn}>
            <Text style={styles.btnT}>Devam et</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  card: { width: "86%", borderRadius: 16, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  msg: { fontSize: 16, lineHeight: 22, marginBottom: 16 },
  btn: { alignSelf: "flex-end", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#2e7d32" },
  btnT: { color: "#fff", fontWeight: "700" }
});