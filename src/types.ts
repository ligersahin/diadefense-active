cat > ~/diadefense/src/types.ts << 'EOF'
export type MealType = "breakfast"|"lunch"|"dinner"|"snack";
export interface Meal { day:number; mealType:MealType; name:string; description?:string; carbs?:number; }
export interface Supplement { id:string; day:number; name:string; dose:string; note?:string; }
export interface Motivation { when:"morning"|"evening"; text:string; }
export interface Activity { day:number; title:string; minutes:number; intensity:"low"|"medium"; }
EOF