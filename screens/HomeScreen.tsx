// /screens/HomeScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, Easing } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTodayPlan } from "../hooks/useTodayPlan";

/** ---- Günlük anahtar yardımcıları ---- */
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const TAKEN_PREFIX = "dd_supplements_taken_";         // SupplementsScreen ile uyumlu
const WATER_KEY    = (iso: string) => `dd_water_ml_${iso}`;
const WATER_TARGET = (iso: string) => `dd_water_target_${iso}`; // varsayılan 2000
const WALK_KEY     = (iso: string) => `dd_walk_done_${iso}`;    // boolean
const WALK_DURATION= (iso: string) => `dd_walk_duration_${iso}`; // "15" | "30" | "45"

/** ---- Basit ilerleme barı ---- */
function Bar({ ratio }: { ratio: number }) {
  const pct = Math.max(0, Math.min(1, ratio));
  return (
    <View style={{ height: 10, backgroundColor: "#eee", borderRadius: 6, overflow: "hidden" }}>
      <View style={{ width: `${pct*100}%`, height: "100%", backgroundColor: "#2e7d32" }} />
    </View>
  );
}

/** ---- Mini Canavar (animasyonlu + halo) ---- */
function MiniMonster({ score }: { score: number }) {
  const nav = useNavigation<any>();
  const mode: "green" | "yellow" | "red" =
    score >= 80 ? "green" : score >= 50 ? "yellow" : "red";
  const ringColor = mode === "green" ? "#2E7D5B" : mode === "yellow" ? "#FF9F43" : "#E76F51";
  const face = mode === "green" ? "(^‿^)" : mode === "yellow" ? "(•‿•)" : "(>_<)";

  // 🫁 Nefes/pulse animasyonu
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const min = mode === "green" ? 0.96 : mode === "yellow" ? 0.93 : 0.90;
    const max = mode === "green" ? 1.04 : mode === "yellow" ? 1.07 : 1.10;
    const dur = mode === "green" ? 2800 : mode === "yellow" ? 2000 : 1200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: max, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: min, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mode, scaleAnim]);

  return (
    <Pressable
      onPress={() => nav.navigate("Monster")}
      style={{ alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 6, marginBottom: 6 }}
    >
      <View style={{ width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
        {/* Halo (arka plan) */}
        <Animated.View
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: ringColor,
            opacity: 0.12,
            transform: [{ scale: scaleAnim }],
          }}
        />
        {/* Canavar gövdesi */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "#fff",
            borderWidth: 10,
            borderColor: ringColor,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: ringColor,
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "900", color: ringColor }}>{face}</Text>
        </Animated.View>
      </View>

      <Text style={{ fontSize: 12, color: "#555", fontWeight: "700", marginTop: 4 }}>
        Canavar Durumu • Skor: {score}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { day } = useTodayPlan();
  const insets = useSafeAreaInsets();
  const headerH = useHeaderHeight();
  const iso = useMemo(() => todayISO(), []);

  // Özet durumlar
  const [suppTotal, setSuppTotal] = useState(0);
  const [suppTaken, setSuppTaken] = useState(0);
  const [waterMl, setWaterMl] = useState(0);
  const [waterTarget, setWaterTarget] = useState(2000);
  const [walkDone, setWalkDone] = useState(false);
  const [walkMinutes, setWalkMinutes] = useState<15 | 30 | 45 | 0>(0);

  /** Verileri yükle */
  const loadSupplements = useCallback(async () => {
    try {
      const json = require("../data/supplements.json");
      const arr = Array.isArray(json?.supplements) ? json.supplements : [];
      const todayList = arr.filter((i: any) => Array.isArray(i.days) && i.days.includes(day));
      setSuppTotal(todayList.length);

      const raw = await AsyncStorage.getItem(TAKEN_PREFIX + iso);
      const takenMap = raw ? JSON.parse(raw) : {};
      const taken = todayList.reduce((acc: number, it: any) => acc + (takenMap[it.id] ? 1 : 0), 0);
      setSuppTaken(taken);
    } catch {
      setSuppTotal(0);
      setSuppTaken(0);
    }
  }, [day, iso]);

  const loadWaterWalk = useCallback(async () => {
    try {
      const rawMl = await AsyncStorage.getItem(WATER_KEY(iso));
      const rawTarget = await AsyncStorage.getItem(WATER_TARGET(iso));
      const rawWalk = await AsyncStorage.getItem(WALK_KEY(iso));
      const rawDur = await AsyncStorage.getItem(WALK_DURATION(iso));

      setWaterMl(rawMl ? Number(rawMl) || 0 : 0);
      setWaterTarget(rawTarget ? Number(rawTarget) || 2000 : 2000);
      setWalkDone(rawWalk === "true");
      const dur = rawDur ? Number(rawDur) : 0;
      setWalkMinutes(dur === 15 || dur === 30 || dur === 45 ? (dur as any) : 0);
    } catch {
      setWaterMl(0);
      setWaterTarget(2000);
      setWalkDone(false);
      setWalkMinutes(0);
    }
  }, [iso]);

  const reloadAll = useCallback(() => { loadSupplements(); loadWaterWalk(); }, [loadSupplements, loadWaterWalk]);
  useEffect(() => { reloadAll(); }, [reloadAll]);
  useFocusEffect(React.useCallback(() => { reloadAll(); }, [reloadAll]));

  /** Mini Canavar skoru */
  const supplementsPct = suppTotal > 0 ? suppTaken / suppTotal : 0;
  const waterPct = (waterTarget || 2000) > 0 ? waterMl / (waterTarget || 2000) : 0;
  const dailyGoalDone = walkDone && waterPct >= 1;
  const miniScore = Math.round((dailyGoalDone ? 60 : 0) + supplementsPct * 40);

  /** Etkileşimler */
  const setWalk = async (min: 15 | 30 | 45) => {
    await AsyncStorage.setItem(WALK_KEY(iso), "true");
    await AsyncStorage.setItem(WALK_DURATION(iso), String(min));
    setWalkDone(true);
    setWalkMinutes(min);
  };
  const addWater = async (ml: number) => {
    const next = waterMl + ml;
    await AsyncStorage.setItem(WATER_KEY(iso), String(next));
    if (!waterTarget) await AsyncStorage.setItem(WATER_TARGET(iso), "2000");
    setWaterMl(next);
    if (!waterTarget) setWaterTarget(2000);
  };
  const resetWater = async () => { await AsyncStorage.setItem(WATER_KEY(iso), "0"); setWaterMl(0); };

  // Navigasyonlar
  const goMeals   = () => nav.navigate("Meals");
  const goSupp    = () => nav.navigate("Supplements");
  const goMonster = () => nav.navigate("Monster");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: headerH + 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 40, gap: 16 }}
      >
        {/* Başlık */}
        <Text style={{ fontSize: 36, fontWeight: "900", color: "#2e7d32" }}>DiaDefense</Text>
        <Text style={{ marginTop: 6, fontSize: 16, color: "#777" }}>Bugün: Gün {day}</Text>

        {/* Mini Canavar */}
        <MiniMonster score={miniScore} />

        {/* --- Bugünün İlerlemesi --- */}
        <View style={card}>
          <Text style={h1}>Bugünün İlerlemesi</Text>
          <View style={{ marginTop: 10 }}>
            <Text style={label}>Takviyeler: {suppTaken} / {suppTotal}</Text>
            <Bar ratio={suppTotal > 0 ? suppTaken / suppTotal : 0} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={label}>Yürüyüş: {walkDone ? `✅ tamamlandı (${walkMinutes || "-" } dk)` : "⬜️ henüz işaretlenmedi"}</Text>
            <Bar ratio={walkDone ? 1 : 0} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={label}>Su: {waterMl} / {waterTarget || 2000} ml</Text>
            <Bar ratio={(waterTarget || 2000) > 0 ? waterMl / (waterTarget || 2000) : 0} />
          </View>
        </View>

        {/* --- Günün Menüsü --- */}
        <Pressable onPress={goMeals} style={card}>
          <Text style={h1}>Günün Menüsü</Text>
          <Text style={p}>Kahvaltı / Öğle / Akşam — gör</Text>
        </Pressable>

        {/* --- Gıda Takviyeleri --- */}
        <Pressable onPress={goSupp} style={card}>
          <Text style={h1}>Gıda Takviyeleri</Text>
          <Text style={p}>Takviyeleri işaretle.</Text>
        </Pressable>

        {/* --- Yürüyüş Kartı --- */}
        <View style={card}>
          <Text style={h1}>Yürüyüş Süresi Seç</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {[15, 30, 45].map((m) => {
              const sel = walkMinutes === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setWalk(m as 15 | 30 | 45)}
                  style={{
                    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1,
                    borderColor: sel ? "#2e7d32" : "#e6eae6", backgroundColor: sel ? "#e7f2ea" : "#fff",
                  }}
                >
                  <Text style={{ fontWeight: "800", color: "#1A1A1A" }}>{sel ? "✅ " : "⬜️ "}{m} dk</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ ...p, marginTop: 8 }}>Seçtiğinde yürüyüş tamamlandı sayılır ve ilerleme güncellenir.</Text>
        </View>

        {/* --- Su Kartı --- */}
        <View style={card}>
          <Text style={h1}>Su Takibi</Text>
          <Text style={{ ...p, marginTop: 6 }}>Hızlı ekleme:</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {[200, 500, 1000].map((ml) => (
              <Pressable
                key={ml}
                onPress={() => addWater(ml)}
                style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e6eae6", backgroundColor: "#fff" }}
              >
                <Text style={{ fontWeight: "800", color: "#1A1A1A" }}>+{ml} ml</Text>
              </Pressable>
            ))}
            <Pressable onPress={resetWater} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e6eae6", backgroundColor: "#fff" }}>
              <Text style={{ fontWeight: "800", color: "#a33" }}>Sıfırla</Text>
            </Pressable>
          </View>
          <Text style={{ ...p, marginTop: 8 }}>Toplam: <Text style={{ fontWeight: "900" }}>{waterMl}</Text> / {waterTarget || 2000} ml</Text>
        </View>

        {/* --- Canavar İlerlemesi (tam ekran) --- */}
        <Pressable onPress={() => nav.navigate("Monster")} style={card}>
          <Text style={h1}>Canavar İlerlemesi</Text>
          <Text style={p}>Genel skorunu gör.</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const card = { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eef1ee", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8 } as const;
const h1 = { fontSize: 22, fontWeight: "900", color: "#1A1A1A" } as const;
const p  = { fontSize: 14, lineHeight: 20, opacity: 0.9 } as const;
const label = { fontSize: 13, marginBottom: 6, color: "#333", fontWeight: "700" } as const;