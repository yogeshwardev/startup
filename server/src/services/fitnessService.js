const goalSuggestions = {
  "muscle gain": {
    meals: ["Paneer rice bowl", "Egg wrap with yogurt", "Peanut butter banana oats"],
    workouts: ["Prioritize compound lifts", "Add post-workout protein", "Keep a 200-300 kcal surplus"],
  },
  "fat loss": {
    meals: ["Grilled tofu salad", "Dal with sauteed vegetables", "Greek yogurt fruit bowl"],
    workouts: ["Use interval cardio", "Keep protein high", "Track steps after classes"],
  },
};

export const buildFitnessPlan = ({ goal, activity, ingredients = [] }) => {
  const normalizedGoal = goal?.toLowerCase() || "fat loss";
  const basePlan = goalSuggestions[normalizedGoal] || goalSuggestions["fat loss"];
  const ingredientText = ingredients.length ? `Use available ingredients: ${ingredients.join(", ")}.` : "";

  return {
    meals: basePlan.meals.map((meal) => `${meal}. ${ingredientText}`.trim()),
    workoutTips: basePlan.workouts.map((tip) => `${tip} for ${activity || "your session"}.`),
  };
};
