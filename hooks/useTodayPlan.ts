import { useState } from "react";
import { todayDayIndex } from "../utils/day";
import type { Meal, Supplement } from "../types";

// React Native'de JSON importu require ile daha stabil
const mealsJson = require("../data/meals.json");
const supplementsJson = require("../data/supplements.json");

export function useTodayPlan() {
  const [day] = useState<number>(todayDayIndex());

  const meals: Meal[] = Array.isArray(mealsJson?.meals)
    ? mealsJson.meals.filter((m: Meal) => m.day === day)
    : [];

  const supplements: Supplement[] = Array.isArray(supplementsJson?.supplements)
    ? supplementsJson.supplements.filter((s: Supplement) => s.day === day)
    : [];

  return { day, meals, supplements };
}