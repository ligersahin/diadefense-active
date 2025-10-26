// /Users/mahmut/diadefense/components/MonsterAnim.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function MonsterAnim({ progress }: { progress: number }) {
  // progress: 0..1 arası (0-33% kırmızı, 34-66% sarı, 67-100% yeşil)
  const color =
    progress < 0.34 ? "#d32f2f" : progress < 0.67 ? "#f9a825" : "#2e7d32";

  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Canavar</Text>
      <Animated.View style={[s.circle, { backgroundColor: color, transform: [{ scale }] }]} />
      <Text style={s.sub}>
        Durum: {progress < 0.34 ? "Kırmızı" : progress < 0.67 ? "Sarı" : "Yeşil"} • %{Math.round(progress * 100)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    alignItems: "center"
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  circle: { width: 80, height: 80, borderRadius: 40 },
  sub: { marginTop: 8, fontSize: 12, opacity: 0.75 }
});