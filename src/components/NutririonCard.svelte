<script>
  import { foods, approximateCalories } from "../data/foodData";
  import OvernightOats3D from "./three/OvernightOats3D.svelte";
  import MoreFoodCard from "./MoreFoodCard.svelte";
</script>

<section class="container">
{#each foods as food}
  <div class="card card-option">
      <div class="food-3D">
        <OvernightOats3D />
    </div>
      <div class="info-container">
        <div class="nutrition-info">
          <h1 class="text-heading-base mb-2 md:mb-0">{food.name}</h1>
          <p class="text-heading-sm">Carb: {food.carbohydrates} g</p>
          <p class="text-heading-sm">Protein: {food.protein} g</p>
          <p class="text-heading-sm">Fat: {food.fat} g</p>
          <p class="text-heading-sm">Sugar: {food.sugar} g</p>
        </div>
        <div class="calories-info">
          <h1 class="text-heading-lg text-center md:text-left">
            {approximateCalories(
              food.carbohydrates,
              food.protein,
              food.fat,
              food.sugar
            )}
          </h1>
          <p class="text-heading-lg">calories</p>
        </div>
      </div>
  </div>
{/each}
</section>