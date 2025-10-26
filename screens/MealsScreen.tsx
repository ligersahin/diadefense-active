// /screens/MealsScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTodayPlan } from "../hooks/useTodayPlan";

type MealType = "breakfast" | "lunch" | "dinner";
type Meal = {
  day: number;
  mealType: MealType;
  name: string;        // "Kahvaltı", "Öğle Yemeği", "Akşam Yemeği"
  description: string; // metin
  carbs?: number;
};

function loadMeals(): Meal[] {
  try {
    const mod = require("../data/meals.json");
    const arr = Array.isArray(mod?.meals) ? mod.meals : [];
    // basit doğrulama
    return arr.filter((m: any) => typeof m?.day === "number" && typeof m?.mealType === "string");
  } catch {
    return [];
  }
}

export default function MealsScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerH = useHeaderHeight();
  const { day: today } = useTodayPlan();

  const allMeals = useMemo(() => loadMeals(), []);
  const days = useMemo(
    () => Array.from(new Set(allMeals.map(m => m.day))).sort((a, b) => a - b),
    [allMeals]
  );

  const initialDay = useMemo(() => {
    if (days.includes(today ?? 1)) return today!;
    return days[0] ?? 1;
  }, [days, today]);

  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  const forDay = useMemo(() => allMeals.filter(m => m.day === selectedDay), [allMeals, selectedDay]);

  // sabit sıra
  const order: MealType[] = ["breakfast", "lunch", "dinner"];
  const titleMap: Record<MealType, string> = {
    breakfast: "Kahvaltı",
    lunch: "Öğle Yemeği",
    dinner: "Akşam Yemeği",
  };

  // seçili güne göre sıralı liste
  const dayMeals = useMemo(
    () => order
      .map(mt => forDay.find(m => m.mealType === mt))
      .filter(Boolean) as Meal[],
    [forDay]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: headerH + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator
      >
        {/* Geri ok */}
        <Pressable onPress={() => nav.goBack()} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>

        <Text style={{ fontSize: 22, fontWeight: "800", color: "#2e7d32" }}>Günün Menüsü</Text>

        {/* Gün seçici */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {days.map(d => {
            const isSel = d === selectedDay;
            const isToday = d === (today ?? -1);
            return (
              <Pressable
                key={d}
                onPress={() => setSelectedDay(d)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSel ? "#2e7d32" : "#e6eae6",
                  backgroundColor: isSel ? "#e7f2ea" : "#fff",
                }}
              >
                <Text style={{ fontWeight: "800", color: "#1A1A1A" }}>
                  Gün {d}{isToday ? " (Bugün)" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* İçerik kartları */}
        {dayMeals.length === 0 ? (
          <View style={card}>
            <Text style={h1}>İçerik yok</Text>
            <Text style={p}>Bu gün için menü bulunamadı.</Text>
          </View>
        ) : (
          dayMeals.map((m, idx) => (
            <View key={idx} style={card}>
              <Text style={h1}>{titleMap[m.mealType] ?? m.name}</Text>
              <Text style={{ ...p, marginTop: 8 }}>{m.description}</Text>
              {typeof m.carbs === "number" ? (
                <Text style={{ ...p, opacity: 0.6, marginTop: 6 }}>Karbonhidrat (tahmini): {m.carbs}g</Text>
              ) : null}
            </View>
          ))
        )}
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