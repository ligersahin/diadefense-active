// /screens/TodayScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTodayPlan } from "../hooks/useTodayPlan";

const TAKEN_PREFIX = "dd_supplements_taken_";
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export default function TodayScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerH = useHeaderHeight();
  const { day } = useTodayPlan();

  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const loadProgress = useCallback(async () => {
    try {
      const json = require("../data/supplements.json");
      const all = Array.isArray(json?.supplements) ? json.supplements : [];
      const todayList = all.filter((i: any) => Array.isArray(i.days) && i.days.includes(day));
      setTotal(todayList.length);

      const raw = await AsyncStorage.getItem(TAKEN_PREFIX + todayISO());
      const takenMap = raw ? JSON.parse(raw) : {};
      const takenCount = todayList.reduce(
        (acc: number, it: any) => acc + (takenMap[it.id] ? 1 : 0),
        0
      );
      setProgress(takenCount);
    } catch {
      setProgress(0);
      setTotal(0);
    }
  }, [day]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const pct = total > 0 ? progress / total : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerH + 20,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 96,
        }}
      >
        {/* Geri ok */}
        <Pressable onPress={() => nav.goBack()} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>

        <Text style={{ fontSize: 22, fontWeight: "800", color: "#2e7d32" }}>
          Bugün — Gün {day}
        </Text>

        {/* İlerleme çubuğu */}
        <View
          style={{
            height: 26,
            backgroundColor: "#eee",
            borderRadius: 14,
            marginTop: 18,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${pct * 100}%`,
              height: "100%",
              backgroundColor: "#2e7d32",
            }}
          />
        </View>

        <Text style={{ marginTop: 8, fontSize: 14, textAlign: "center", color: "#333" }}>
          {progress} / {total} takviye alındı
        </Text>

        {/* Kısa rehber */}
        <View style={card}>
          <Text style={h1}>Bugün neler yapabilirsin:</Text>
          <Text style={p}>• Gıda takviyelerini işaretle</Text>
          <Text style={p}>• Günlük yürüyüşünü tamamla</Text>
          <Text style={p}>• Motivasyon mesajını oku</Text>
          <Text style={p}>• Canavarın ilerlemesini gör</Text>
        </View>
      </ScrollView>

      {/* Alt sabit Ana Menü butonu */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 28,
          alignSelf: "center",
          backgroundColor: "#2e7d32",
          borderRadius: 50,
          paddingHorizontal: 22,
          paddingVertical: 10,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Pressable onPress={() => nav.navigate("Home")}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>🏠 Ana Menü</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const card = {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: "#eef1ee",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  marginTop: 20,
} as const;
const h1 = { fontSize: 18, fontWeight: "800", color: "#1A1A1A" } as const;
const p = { fontSize: 14, lineHeight: 20, opacity: 0.9, marginTop: 4 } as const;