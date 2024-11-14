import fetch from "node-fetch";
import OpenAI from 'openai';
import dotenv from "dotenv";
import User from "../models/User.js";
import { GoogleGenerativeAI} from '@google/generative-ai'

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_PROMPTS = [
  "foods",
  "food",
  "recipes",
  "lose weight",
  "weight",
  "Hello",
  "hello",
  "Hi",
  "How are you",
  "What's up",
  "health",
  "nutrition",
  "diet",
  "meal",
  "recipe",
  "grocery",
  "navigation",
  "meal plan",
  "grocery list",
  "grocery list",
  "navigation",
  "Live Support",
  "drink",
  "water",
  "diet",
  "support",
  "Dietician",
];

//? CHAT GPT INTEGRATION
export const askGPT = async (req, res) => {
  console.log("Started asking GPT");

  try {
    const { prompt } = req.body;

    const isAllowedPrompt = ALLOWED_PROMPTS.some((keyword) =>
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );

    if (["live support", "dietician"].some((term) => prompt.toLowerCase().includes(term))) {
      return res.status(200).json({
        result: `Support page link: ${process.env.BASE_URL}/support`,
      });
    }

    if (prompt.toLowerCase().includes("my meal plan")) {
      return res.status(200).json({
        result: `Meal plan page link: ${process.env.BASE_URL}/mealplan`,
      });
    }

    if (!isAllowedPrompt) {
      return res.status(200).json({
        result:
          "Sorry, I can only help you with health/recipe-related questions and navigating the app",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    })

    const response = await model.generateContent(prompt);

    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-3.5-turbo',
    //   messages: [{ role: 'user', content: prompt }],
    //   temperature: 0.6,
    //   max_tokens: 500,
    // });

    const urls = response.response.candidates[0].content.parts[0].text.match(
      /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif))/
    );
    let result = response.response.candidates[0].content.parts[0].text; // In Markdown

    // If image URLs were found, append them to the response
    if (urls) {
      const imgTags = urls
        .map((url) => `<img src="${url}" alt="related image" width="300">`)
        .join("");
      result += "\n" + imgTags;
    }

    console.log({ result });
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error with OpenAI API request:', error);
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
};

/*//? SEARCH RECIPE LIST */
export const findRecipes = async (req, res) => {
  try {
    console.log("Started fetching recipe details");
    const { searchTerm } = req.body;
    console.log(searchTerm);
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}&query=${searchTerm}&number=2`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results)) {
      return res.status(400).json({
        error: "Invalid response from recipe API",
        details: data,
      });
    }
    console.log(data.results);
    return res.status(200).json({ data: data.results });
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

/*//? SINGLE RECIPE SEARCH */
export const searchRecipe = async (req, res) => {
  try {
    console.log("Started fetching recipe details");
    const { recipeId } = req.body;

    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${process.env.SPOONACULAR_API_KEY}&includeNutrition=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    const imageUrl = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.png?apiKey=${process.env.SPOONACULAR_API_KEY}&defaultCss=true`;
    const imageResponse = await fetch(imageUrl);

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    res.set('Content-Type', 'image/png');
    res.send({ data, imageData });
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

/*//? GENERATE MEAL FOR USER */
export const generateMeal = async (req, res) => {
  console.log("Started generating meal");

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const body = {
      timeFrame: "day",
      targetCalories: 2000,
      diet: "vegetarian",
      exclude: "shellfish",
    };

    const genMealResponse = await fetch(
      "https://api.spoonacular.com/mealplanner/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SPOONACULAR_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!genMealResponse.ok) {
      throw new Error("Failed to connect to Spoonacular API");
    }

    const generatedMeal = await genMealResponse.json();
    res.status(200).json(generatedMeal);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getRecipeImage = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Construct the URL using the Spoonacular API
    const imageUrl = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.png?apiKey=${process.env.SPOONACULAR_API_KEY}`;

    // Fetch the image from the API
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch recipe image: ${imageResponse.statusText}`
      );
    }

    // Convert the response to a Buffer for the image
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // Set the response headers to indicate image data
    res.set("Content-Type", "image/png");
    res.send(imageData);
  } catch (error) {
    console.error("Error fetching recipe image:", error.message);
    res.status(500).json({
      error: {
        message:
          "An error occurred while fetching the image. Check the recipe ID and API key.",
      },
    });
  }
};