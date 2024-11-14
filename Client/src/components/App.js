import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Contact from "../scenes/Contact/Contact";
import Footer from "./Footer";
import Navbar from "../scenes/NavBar/Navbar";
import WelcomePage from "../scenes/HomePage/WelcomePage";
import Login from "../scenes/Login/Login";
import Register from "../scenes/Register/Register";
import PersonalMeal from "../scenes/PersonalMealPage/PersonalMeal";
import Recipe from "../scenes/RecipeManagment/Recipe";
import SingleRecipe from "../scenes/RecipeManagment/SingleRecipe";
import MyMealPlans from "../scenes/MyMealPlans/MyMealPlans";
import MealPlanDetails from "../scenes/MyMealPlans/MealPlanDetails";
import Agora from "../scenes/VideoCalling/Agora";
import ChatBot from "../scenes/ChatBot/ChatBot";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);

  if (!user) {
    return <Navigate to='/login' replace />
  }

  return children;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/*//? Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<WelcomePage />} />

          {/*//? Protected Routes */}
          <Route
            path="/meal"
            element={
              <ProtectedRoute>
                <PersonalMeal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipe"
            element={
              <ProtectedRoute>
                <Recipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipe/:recipeId"
            element={
              <ProtectedRoute>
                <SingleRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myMealPlans"
            element={
              <ProtectedRoute>
                <MyMealPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/videoCall"
            element={
              <ProtectedRoute>
                <Agora />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatBot"
            element={
              <ProtectedRoute>
                <ChatBot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myMealPlans/:id"
            element={
              <ProtectedRoute>
                <MealPlanDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;