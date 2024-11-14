import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./recipestyle.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../services/helper";

const SingleRecipe = () => {
  const [recipe, setRecipe] = useState({});
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }

    fetch(`${BASE_URL}/meal/recipeSearch`, {
      method: "POST",
      body: JSON.stringify({ recipeId }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then(({ data }) => {
        console.log(data);
        setRecipe(data);
      })
      .catch((error) => console.error("Error:", error));
  }, [recipeId, user, navigate]);

  return (
    <section id="recipe">
      <h1 class="h-primary">{recipe.title}</h1>
      <img src={recipe.image} alt={recipe.title} />

      <div class="content">
        <h3 class="h-tertiary">Ingredients:</h3>
        <table>
          <thead>
            <tr>
              <th>Items</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {recipe.extendedIngredients &&
              recipe.extendedIngredients.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`}
                      alt={item.originalName}
                      style={{
                        height: "50px",
                        width: "45px",
                      }}
                    />
                    {item.originalName}
                  </td>
                  <td>{`${item.amount} ${item.unit}`}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {recipe.nutrition && (
          <div class="page-wrap">
            <h3 class="h-tertiary">Nutrition:</h3>
            <table>
              <thead>
                <tr>
                  <th>Nutrient</th>
                  <th>Amount</th>
                  <th>% Daily Value</th>
                </tr>
              </thead>
              <tbody>
                {recipe.nutrition.nutrients.map((nutrient) => (
                  <tr key={nutrient.name}>
                    <td>{nutrient.name}</td>
                    <td>{nutrient.amount}</td>
                    <td>{nutrient.percentOfDailyNeeds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div class="page-wrap">
          <h3 class="h-tertiary">Instructions:</h3>
          <dl class="faq">
            {recipe.analyzedInstructions &&
              recipe.analyzedInstructions[0].steps.map((step) => (
                <dt key={step.number}>{step.step}</dt>
              ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default SingleRecipe;
