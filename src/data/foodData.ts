interface foodNutrition {
    name: string;
    fat: number;
    carbohydrates: number;
    protein: number;
    sugar: number;
    description?: string;
}

const foods : foodNutrition[] = [
    {
        name: "Overnight Oats",
        fat: 5,
        carbohydrates: 50,
        protein: 10,
        sugar: 20,        
    },
]

const approximateCalories = (carbs :number, protein : number , fat : number, sugar:number) => {return Math.round(carbs * 4 + protein * 4 + fat * 9 + sugar * 4);};

export { foods, approximateCalories }