// /Users/mahmutsahin/Desktop/DiaDefense/active/diadefense/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import MealsScreen from "./screens/MealsScreen";
import SupplementsScreen from "./screens/SupplementsScreen";
import MonsterScreen from "./screens/MonsterScreen";
import TodayScreen from "./screens/TodayScreen";

const RootStack = createStackNavigator();
const HomeStackNav = createStackNavigator();
const Tab = createBottomTabNavigator();

/** Home sekmesi içindeki Stack:
 *  Home (header gizli) + Meals/Supplements/Monster/Today
 *  -> Bu sayede alt tab bar bu ekranların hepsinde görünür.
 */
function HomeStack() {
  return (
    <HomeStackNav.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerBackTitleVisible: false,
        headerTintColor: "#2e7d32",
        headerStyle: { backgroundColor: "#fff" },
      }}
    >
      <HomeStackNav.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStackNav.Screen
        name="Meals"
        component={MealsScreen}
        options={{ title: "Günün Menüsü" }}
      />
      <HomeStackNav.Screen
        name="Supplements"
        component={SupplementsScreen}
        options={{ title: "Gıda Takviyeleri" }}
      />
      <HomeStackNav.Screen
        name="Monster"
        component={MonsterScreen}
        options={{ title: "Canavar İlerlemesi" }}
      />
      <HomeStackNav.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: "Bugün" }}
      />
    </HomeStackNav.Navigator>
  );
}

/** Alt sekmeler (şimdilik sadece Home) */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,            // Tab içi header’ları HomeStack yönetiyor
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2e7d32",
        tabBarIcon: ({ focused, size, color }) => {
          const icon = route.name === "Ana" ? (focused ? "home" : "home-outline") : "ellipse";
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ana" component={HomeStack} />
      {/* İlerde Ayarlar vb. sekmeler burada eklenecek */}
    </Tab.Navigator>
  );
}

/** Root: Splash/Welcome sırasında tab görünmez; MainTabs’te görünür */
export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Welcome" component={WelcomeScreen} />
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}