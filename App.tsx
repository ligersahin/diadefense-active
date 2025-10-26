// /Users/mahmut/diadefense/diadefense/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import MealsScreen from "./screens/MealsScreen";
import SupplementsScreen from "./screens/SupplementsScreen";
import MonsterScreen from "./screens/MonsterScreen";
import TodayScreen from "./screens/TodayScreen"; // dursun; istersen kullanırız

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, gestureEnabled: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Meals" component={MealsScreen} />
        <Stack.Screen name="Supplements" component={SupplementsScreen} />
        <Stack.Screen name="Monster" component={MonsterScreen} />
        <Stack.Screen name="Today" component={TodayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}