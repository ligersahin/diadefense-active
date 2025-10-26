// /Users/mahmut/diadefense/diadefense/screens/SplashScreen.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated, Image, Easing, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const nav = useNavigation<any>();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo efekt animasyonu
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 2 saniye sonra ana ekrana geç
    const t = setTimeout(() => {
      nav.reset({ index: 0, routes: [{ name: "Home" }] });
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const glowSize = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 1.3],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#e9e4b1", alignItems: "center", justifyContent: "center" }}>
      {/* Arka sarı ışık efekti */}
      <Animated.View
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: 999,
          backgroundColor: "#fce46d",
          opacity: 0.35,
          top: height / 2 - width * 0.65,
          left: width / 2 - width * 0.65,
        }}
      />

      {/* Ortada DiaDefense logosu */}
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require("../assets/logo.png")} // logo dosyan burada olmalı
          style={{ width: 180, height: 180, resizeMode: "contain" }}
        />
      </Animated.View>
    </View>
  );
}