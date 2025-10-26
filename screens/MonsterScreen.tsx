// /screens/MonsterScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text as RNText, StyleSheet, Animated, Pressable, ScrollView } from "react-native";
import Svg, { Circle, Polygon, Defs, LinearGradient, Stop } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const STORAGE_KEY = "dd_progress_v1";
const ANCHOR_KEY  = "dd_menu_anchor_v1";
const TAKEN_PREFIX = "dd_supplements_taken_";
const WATER_KEY    = (iso: string) => `dd_water_ml_${iso}`;
const WATER_TARGET = (iso: string) => `dd_water_target_${iso}`;
const WALK_KEY     = (iso: string) => `dd_walk_done_${iso}`;
const WALK_DURATION= (iso: string) => `dd_walk_duration_${iso}`;

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

export default function MonsterScreen() {
  const [score, setScore] = useState(0);
  const [label, setLabel] = useState<"Sakin" | "Orta" | "Stresli">("Sakin");

  const [day, setDay] = useState<1 | 2 | 3>(1);
  const [suppTotal, setSuppTotal] = useState(0);
  const [suppTaken, setSuppTaken] = useState(0);
  const [missingSupps, setMissingSupps] = useState<string[]>([]);
  const [waterMl, setWaterMl] = useState(0);
  const [waterTarget, setWaterTarget] = useState(2000);
  const [walkDone, setWalkDone] = useState(false);
  const [walkMinutes, setWalkMinutes] = useState<0 | 15 | 30 | 45>(0);

  const nav = useNavigation<any>();
  const iso = useMemo(() => todayISO(), []);

  const computeAll = useCallback(async () => {
    try {
      const rawAnchor = await AsyncStorage.getItem(ANCHOR_KEY);
      if (rawAnchor) {
        const { anchor } = JSON.parse(rawAnchor);
        const [Y,M,D] = anchor.split("-").map((n: string) => Number(n));
        const base = new Date(Y, (M ?? 1) - 1, D ?? 1).getTime();
        const diff = Math.max(0, Math.floor((Date.now() - base) / 86400000));
        setDay(((diff % 3) + 1) as 1 | 2 | 3);
      } else setDay(1);
    } catch { setDay(1); }

    try {
      const rawMl = await AsyncStorage.getItem(WATER_KEY(iso));
      const rawTarget = await AsyncStorage.getItem(WATER_TARGET(iso));
      const rawWalk = await AsyncStorage.getItem(WALK_KEY(iso));
      const rawDur  = await AsyncStorage.getItem(WALK_DURATION(iso));
      setWaterMl(rawMl ? Number(rawMl) || 0 : 0);
      setWaterTarget(rawTarget ? Number(rawTarget) || 2000 : 2000);
      setWalkDone(rawWalk === "true");
      const d = rawDur ? Number(rawDur) : 0;
      setWalkMinutes(d === 15 || d === 30 || d === 45 ? (d as any) : 0);
    } catch { setWaterMl(0); setWaterTarget(2000); setWalkDone(false); setWalkMinutes(0); }

    let todayList: any[] = [];
    try {
      const j = require("../data/supplements.json");
      const arr = Array.isArray(j?.supplements) ? j.supplements : [];
      todayList = arr.filter((i: any) => Array.isArray(i.days) && i.days.includes(day));
      setSuppTotal(todayList.length);

      const rawTaken = await AsyncStorage.getItem(TAKEN_PREFIX + iso);
      const map = rawTaken ? JSON.parse(rawTaken) : {};
      const taken = todayList.reduce((acc: number, it: any) => acc + (map[it.id] ? 1 : 0), 0);
      setSuppTaken(taken);

      const missing = todayList.filter((it: any) => !map[it.id]).map((it: any) => it.name as string).slice(0, 5);
      setMissingSupps(missing);
    } catch { setSuppTotal(0); setSuppTaken(0); setMissingSupps([]); }

    const waterPct = (waterTarget || 2000) > 0 ? waterMl / (waterTarget || 2000) : 0;
    const dailyGoalDone = walkDone && waterPct >= 1;
    const supplementsPct = todayList.length > 0 ? (suppTaken / todayList.length) : 0;
    const nextScore = Math.round((dailyGoalDone ? 60 : 0) + supplementsPct * 40);
    setScore(nextScore);
    setLabel(nextScore >= 80 ? "Sakin" : nextScore >= 50 ? "Orta" : "Stresli");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, day, waterMl, waterTarget, walkDone, suppTaken, suppTotal]);

  useEffect(() => { computeAll(); }, [computeAll]);
  useFocusEffect(React.useCallback(() => { computeAll(); }, [computeAll]));

  const addWater = useCallback(async (ml: number) => {
    const next = (waterMl || 0) + ml;
    await AsyncStorage.setItem(WATER_KEY(iso), String(next));
    if (!waterTarget) await AsyncStorage.setItem(WATER_TARGET(iso), "2000");
    setWaterMl(next); computeAll();
  }, [iso, waterMl, waterTarget, computeAll]);

  const setWalk = useCallback(async (min: 15 | 30 | 45) => {
    await AsyncStorage.setItem(WALK_KEY(iso), "true");
    await AsyncStorage.setItem(WALK_DURATION(iso), String(min));
    setWalkDone(true); setWalkMinutes(min); computeAll();
  }, [iso, computeAll]);

  const mode: "green" | "yellow" | "red" = score >= 80 ? "green" : score >= 50 ? "yellow" : "red";
  const ringColor = mode === "green" ? "#2E7D5B" : mode === "yellow" ? "#FFCA85" : "#E76F51";
  const face = mode === "green" ? "(^‿^)" : mode === "yellow" ? "(•‿•)" : "(>_<)";

  const ringScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const min = mode === "green" ? 0.985 : mode === "yellow" ? 0.95 : 0.9;
    const max = mode === "green" ? 1.015 : mode === "yellow" ? 1.05 : 1.08;
    const dur = mode === "green" ? 1500 : mode === "yellow" ? 1100 : 750;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: max, duration: dur, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: min, duration: dur, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ringScale, mode]);

  const size = 280, stroke = 18;
  const r = (size - stroke) / 2, cx = size / 2, cy = size / 2;

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#FFFFFF" }} contentContainerStyle={{ padding:16, paddingBottom: 40 }}>
      {/* Geri ok */}
      <Pressable onPress={() => nav.navigate("Home")} style={{ alignSelf:"flex-start", paddingVertical: 4 }}>
        <RNText style={{ fontSize: 22, color: "#2E7D32" }}>←</RNText>
      </Pressable>

      <RNText style={styles.title}>Canavar İlerlemesi</RNText>
      <RNText style={styles.subtitle}>Durum: <RNText style={{fontWeight:"800"}}>{label}</RNText> • Skor: {score}</RNText>

      <View style={{ alignItems:"center", justifyContent:"center", marginTop: 16 }}>
        <Animated.View style={{ transform:[{ scale: ringScale }] }}>
          <Svg width={size} height={size}>
            <Defs>
              {mode === "green" && (
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#2E7D5B" />
                  <Stop offset="100%" stopColor="#D4AF37" />
                </LinearGradient>
              )}
              {mode === "yellow" && (
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#FFCA85" />
                  <Stop offset="100%" stopColor="#FF9F43" />
                </LinearGradient>
              )}
              {mode === "red" && (
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#E76F51" />
                  <Stop offset="100%" stopColor="#F28482" />
                </LinearGradient>
              )}
            </Defs>

            <Circle cx={cx} cy={cy} r={r} stroke="#EEE" strokeWidth={stroke} fill="white" />
            <Circle cx={cx} cy={cy} r={r} stroke="url(#grad)" strokeWidth={stroke} fill="none" />

            <Polygon points={`${cx-55},${cy-95} ${cx-38},${cy-48} ${cx-12},${cy-72}`} fill={ringColor} opacity={0.9} />
            <Polygon points={`${cx+55},${cy-95} ${cx+38},${cy-48} ${cx+12},${cy-72}`} fill={ringColor} opacity={0.9} />

            <Polygon points={`${cx},${cy+34} ${cx-9},${cy+52} ${cx+9},${cy+52}`} fill="#FFF" stroke={ringColor} strokeWidth={2} />
          </Svg>
        </Animated.View>

        <RNText style={[styles.face, { color: ringColor }]}>{face}</RNText>
      </View>

      {/* ÖNERİLER */}
      <View style={s.card}>
        <RNText style={s.h1}>Öneriler</RNText>

        {suppTotal > suppTaken ? (
          <View style={{ marginTop: 10 }}>
            <RNText style={s.p}>Takviyelerde <RNText style={s.bold}>{suppTotal - suppTaken}</RNText> eksik var.</RNText>
            {missingSupps.length > 0 && (
              <RNText style={[s.p, {opacity:0.8, marginTop:4}]}>Eksik: {missingSupps.join(", ")}</RNText>
            )}
            <Pressable onPress={() => nav.navigate("Supplements")} style={s.btn}>
              <RNText style={s.btnT}>Takviyeleri İşaretle</RNText>
            </Pressable>
          </View>
        ) : (
          <RNText style={[s.p, { marginTop: 10 }]}>Takviyelerin tamam! ✅</RNText>
        )}

        {(waterTarget || 2000) - (waterMl || 0) > 0 ? (
          <View style={{ marginTop: 12 }}>
            <RNText style={s.p}>Su hedefi için kalan: <RNText style={s.bold}>{(waterTarget || 2000) - (waterMl || 0)} ml</RNText></RNText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {[200, 500, 1000].map(ml => (
                <Pressable key={ml} onPress={() => addWater(ml)} style={s.pill}>
                  <RNText style={s.pillT}>+{ml} ml</RNText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <RNText style={[s.p, { marginTop: 12 }]}>Su hedefi tamam! 💧✅</RNText>
        )}

        {!walkDone ? (
          <View style={{ marginTop: 12 }}>
            <RNText style={s.p}>Bugünkü yürüyüşünü seç:</RNText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {[15, 30, 45].map((m) => (
                <Pressable key={m} onPress={() => setWalk(m as 15|30|45)} style={s.pill}>
                  <RNText style={s.pillT}>{m} dk</RNText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <RNText style={[s.p, { marginTop: 12 }]}>Yürüyüş tamamlandı {walkMinutes ? `(${walkMinutes} dk)` : ""} ✅</RNText>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#FFFFFF", padding:16 },
  title:{ fontSize:22, fontWeight:"800", color:"#1A1A1A", textAlign:"center" },
  subtitle:{ fontSize:12, color:"#666", textAlign:"center", marginTop:6 },
  face:{ position:"absolute", top: 118, fontSize:32, fontWeight:"800" },
});

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef1ee",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginTop: 16,
  },
  h1: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  p:  { fontSize: 14, lineHeight: 20, color: "#333" },
  bold: { fontWeight: "900", color: "#1A1A1A" },
  btn: { alignSelf: "flex-start", backgroundColor: "#2e7d32", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 8 },
  btnT: { color: "#fff", fontWeight: "800" },
  pill: { borderRadius: 12, borderWidth: 1, borderColor: "#e6eae6", paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff" },
  pillT: { fontWeight: "800", color: "#1A1A1A" },
});