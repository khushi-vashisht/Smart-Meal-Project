import { Paper } from "@mui/material";
import React, { useState } from "react";
import initialData from "./data";
import Dish from "./Dish";
import { Link } from "react-router-dom";
import "./singlerecipe.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../services/helper";

function Recipe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    if (user === null) {
      navigate("/login");
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/meal/findRecipe`, {
        method: "POST",
        body: JSON.stringify({ searchTerm }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (response.ok && responseData.data) {
        console.log(responseData.data);
        setData(responseData.data);
      } else {
        setError("No recipes found. Please try another search term.");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="test" style={{ textAlign: "center" }}>
        Recipes
      </h1>
      <form style={{ textAlign: "center" }} onSubmit={handleSearchSubmit}>
        <label htmlFor="search">
          <strong fontWeight="400px" style={{ fontSize: '20px' }}>Search for a recipe:</strong>
        </label>
        <input type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            marginLeft: '12px',
            marginRight: '12px',
            height: '30px',
            paddingLeft: '2px',
            paddingRight: '2px'
          }}
        />
        <button type="submit" style={{ padding: '4px', borderRadius: '4px' }}>Search</button>
      </form>

      <Paper
        sx={{
          margin: "20px 30px",
          padding: "40px 50px",
          border: "1px solid gray",
        }}
      >
        {data && data.length > 0 ? (
          data.map((dish) => (
            <Link to={`/recipe/${dish.id}`} key={dish.id}>
              <Dish title={dish.title} image={dish.image} id={dish.id}></Dish>
            </Link>
          ))
        ) : (
          <div>No results found.</div>
        )}
      </Paper>
    </div>
  );
}

export default Recipe;
