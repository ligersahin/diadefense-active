// /screens/SupplementsScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTodayPlan } from "../hooks/useTodayPlan";

type Supp = { id?: string; name: string; time?: string; days?: number[] };

const TAKEN_PREFIX = "dd_supplements_taken_";
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

function getId(it: Supp) {
  return (it?.id || it?.name || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 50);
}

function loadSupps(): Supp[] {
  try {
    const mod = require("../data/supplements.json");
    if (Array.isArray(mod?.supplements)) return mod.supplements;
  } catch {}
  return [];
}

export default function SupplementsScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerH = useHeaderHeight();
  const { day: today } = useTodayPlan();

  const all = useMemo(() => loadSupps(), []);
  const list = useMemo(
    () => all.filter(s => Array.isArray(s.days) ? s.days.includes(today ?? 1) : true),
    [all, today]
  );

  const [takenMap, setTakenMap] = useState<Record<string, boolean>>({});
  const todayKey = useMemo(() => TAKEN_PREFIX + todayISO(), []);

  // Açılışta bugüne ait işaretleri yükle
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(todayKey);
        const map = raw ? JSON.parse(raw) : {};
        setTakenMap(map && typeof map === "object" ? map : {});
      } catch {
        setTakenMap({});
      }
    })();
  }, [todayKey]);

  const toggle = useCallback(async (id: string) => {
    setTakenMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(todayKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [todayKey]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerH + 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 96
        }}
        showsVerticalScrollIndicator
      >
        {/* Geri ok */}
        <Pressable onPress={() => nav.goBack()} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>

        <Text style={{ fontSize: 22, fontWeight: "800", color: "#2e7d32" }}>
          Gıda Takviyeleri — Gün {today}
        </Text>

        {list.length === 0 && (
          <View style={card}>
            <Text style={h1}>Bugün için tanımlı takviye yok</Text>
            <Text style={p}>Veriyi /data/supplements.json dosyasından yönetebilirsin.</Text>
          </View>
        )}

        {list.map((s, idx) => {
          const id = getId(s);
          const checked = !!takenMap[id];
          return (
            <Pressable
              key={id + "_" + idx}
              onPress={() => toggle(id)}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: checked ? "#2e7d32" : "#eef1ee",
                backgroundColor: checked ? "#e7f2ea" : "#fff",
                padding: 12,
                marginTop: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A" }}>
                {checked ? "✅ " : "⬜️ "} {s.name}
              </Text>
              {s.time ? <Text style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Zaman: {s.time}</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Alt sabit Home butonu */}
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

const card = { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eef1ee", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, marginTop: 14 } as const;
const h1 = { fontSize: 18, fontWeight: "800", color: "#1A1A1A" } as const;
const p  = { fontSize: 14, lineHeight: 20, opacity: 0.9 } as const;