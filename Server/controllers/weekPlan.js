import fetch from "node-fetch";
import dotenv from "dotenv";
import { getUserByEmail } from "../services/userService.js";
import MealPlan from "../models/MealPlan.js";

dotenv.config();

/* DELETE MEAL PLAN  */
export const deleteMealPlan = async (req, res) => {
  console.log("delete Meal Plan");
  try {
    const { user, id } = req.body;

    const response = await fetch(
      `https://api.spoonacular.com/mealplanner/${user.spoonacularUsername}/templates/${id}?hash=${user.spoonacularHash}&apiKey=${process.env.SPOONACULAR_API_KEY}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete meal plan. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log({ data });
    return res.status(200).json({ message: "Meal plan deleted successfully", data });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

/* SAVE PERSONAL WEEK PLAN  */
export const saveWeekPlan = async (req, res) => {
  try {
    const { PushData, email } = req.body;

    if (!PushData || !email) {
      return res.status(400).json({ message: "Invalid data provided." });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const newMealPlan = new MealPlan({
      userId: user._id,
      name: PushData.name,
      items: PushData.items,
    });

    await newMealPlan.save();
    res.status(201).json({ message: "Meal plan saved successfully." });
  } catch (error) {
    console.error("Error saving meal plan:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/* CREATE PERSONAL WEEK PLAN  */
export const createWeekPlan = async (req, res) => {
  console.log("Started creating week plan");
  try {
    const { calories, diet, exclude } = req.body;

    if (!calories || !diet) {
      return res.status(400).json({ error: { message: "Calories and diet are required." } });
    }

    const response = await fetch(
      `https://api.spoonacular.com/mealplanner/generate?timeFrame=week&targetCalories=${encodeURIComponent(
        calories
      )}&diet=${encodeURIComponent(diet)}&exclude=${encodeURIComponent(
        exclude
      )}&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to create week plan. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log({ data });
    return res.status(200).json({ message: "Week plan created successfully", data });
  } catch (error) {
    console.error("Error creating week plan:", error);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

/* PERSONAL WEEK PLAN FETCH */
export const weekPlan = async (req, res) => {
  console.log("Started fetching week plan");
  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: { message: "ID and email are required." } });
    }

    const user = await getUserByEmail(email);

    const response = await fetch(
      `https://api.spoonacular.com/mealplanner/${user.spoonacularUsername}/templates/${id}?apiKey=${process.env.SPOONACULAR_API_KEY}&hash=${user.spoonacularHash}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch week plan. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log({ data });
    return res.status(200).json({ message: "Week plan fetched successfully", data });
  } catch (error) {
    console.error("Error fetching meal plan details:", error);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

/* ALL SAVED MEAL PLAN FETCH */
export const allMealPlans = async (req, res) => {
  console.log("Started fetching all meal plans");
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { message: "Email is required." } });
    }

    const user = await getUserByEmail(email);

    const response = await fetch(
      `https://api.spoonacular.com/mealplanner/${user.spoonacularUsername}/templates?apiKey=${process.env.SPOONACULAR_API_KEY}&hash=${user.spoonacularHash}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch meal plans. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log({ data });
    return res.status(200).json({ message: "All meal plans fetched successfully", data });
  } catch (error) {
    console.error("Error fetching meal plan details:", error);
    res.status(500).json({
      error: {
        message: "An error occurred during your request.",
      },
    });
  }
};

export const getPastRecords = async (req, res) => {
  // When the req is made first userId is fetched, then in the mealPlan DB all past meals related to that user will be fetched and then displayed.
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const records = await MealPlan.find({ userId: user._id });
    res.status(200).json({ records });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    res.status(500).json({ message: "Server error." });
  }
}