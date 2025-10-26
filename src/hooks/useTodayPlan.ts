import { useState } from "react";
import { todayDayIndex } from "../utils/date";
import mealsJson from "../data/meals.json";
import supplementsJson from "../data/supplements.json";
import type { Meal, Supplement } from "../types";

export function useTodayPlan() {
  const [day] = useState<number>(todayDayIndex());

  const meals: Meal[] = (mealsJson as any).meals?.filter((m: Meal) => m.day === day) ?? [];
  const supplements: Supplement[] =
    (supplementsJson as any).supplements?.filter((s: Supplement) => s.day === day) ?? [];

  return { day, meals, supplements };
}