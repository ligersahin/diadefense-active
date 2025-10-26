import AsyncStorage from "@react-native-async-storage/async-storage";

const K = {
  mealDone: (day: number, mealType: string) => `meal:${day}:${mealType}:done`,
  suppDone: (day: number, id: string) => `supp:${day}:${id}:done`,
  water: (day: number) => `water:${day}:ml`,
};

export async function setBool(key: string, val: boolean) {
  await AsyncStorage.setItem(key, val ? "1" : "0");
}
export async function getBool(key: string) {
  return (await AsyncStorage.getItem(key)) === "1";
}

export async function setNumber(key: string, val: number) {
  await AsyncStorage.setItem(key, String(val));
}
export async function getNumber(key: string) {
  const v = await AsyncStorage.getItem(key);
  return v ? Number(v) : 0;
}

export const Keys = K;