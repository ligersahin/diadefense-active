import React, { useEffect, useRef } from "react";
import { Image, StyleSheet, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const nav = useNavigation<any>();
  const gradientOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(gradientOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
    ]).start(() => {
      // >>> BURASI DEĞİŞTİ: Home değil MainTabs
      nav.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    });
  }, [gradientOpacity, nav]);

  return (
    <View style={styles.container}>
      {/* altta efekt */}
      <Animated.View style={[styles.gradientWrap, { opacity: gradientOpacity }]}>
        <LinearGradient colors={["#3CB371", "#D4AF37"]} style={styles.gradient} />
      </Animated.View>

      {/* üstte logo */}
      <View style={styles.center}>
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  gradientWrap: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  gradient: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", zIndex: 1 },
  logo: { width: 260, height: 260 },
});