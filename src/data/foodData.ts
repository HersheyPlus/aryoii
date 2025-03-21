export interface FoodNutrition {
    name: string;
    fat: number;
    carbohydrates: number;
    protein: number;
    sugar: number;
    notice?: string;
}

const foods : FoodNutrition[] = [
    {
        name: "Overnight Oats",
        fat: 7,
        carbohydrates: 45,
        protein: 32,
        sugar: 10,  
        notice: "Almost sugar is natural sugar"      
    },
]

const approximateCalories = (carbs :number, protein : number , fat : number, sugar:number) => {return Math.round(carbs * 4 + protein * 4 + fat * 9 + sugar * 4);};

export { foods, approximateCalories }

/*
remain banana, strawberry, yogurth, honey

banana : fat, carbohydrates, protein, sugar
strawberry : fat, carbohydrates, protein, sugar
yogurth : fat, carbohydrates, protein, sugar
honey : fat, carbohydrates, protein, sugar


*/ 