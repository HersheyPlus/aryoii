<script lang="ts">
  import { foods, approximateCalories } from "../data/foodData";
  import OvernightOats3D from "./three/OvernightOats3D.svelte";
</script>

<section class="container">
{#each foods as food}
  <div class="card card-option">
      <div class="food-3D">
        <OvernightOats3D />
    </div>
      <div class="info-container">
        <div class="nutrition-info">
          <h1 class="text-heading-lg mb-2 md:mb-0">{food.name}</h1>
          <p class="text-heading-base">Carb: {food.carbohydrates} g</p>
          <p class="text-heading-base">Protein: {food.protein} g</p>
          <p class="text-heading-base">Fat: {food.fat} g</p>
          <p class="text-heading-base">Sugar: {food.sugar} g</p>
          <p class="text-heading-sm mt-1">* {food.notice}</p>
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