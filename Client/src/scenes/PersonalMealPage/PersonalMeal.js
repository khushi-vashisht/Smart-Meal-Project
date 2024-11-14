import React, { useState, useEffect } from "react";
import { CircularProgress, Container, InputLabel } from "@material-ui/core";
import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useStyles from "../../components/style";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../services/helper";
import FlexCenter from "../../components/FlexCenter";
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast, ToastContainer } from "react-toastify";

const diets = [
  "Anything",
  "Gluten Free",
  "Ketogenic",
  "Vegetarian",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "Vegan",
  "Pescetarian",
  "Paleo",
  "Primal",
  "Low FODMAP",
  "Whole30",
];

const PersonalMeal = () => {
  const classes = useStyles();
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [inputValue, setInputValue] = useState("Default");
  const user = useSelector((state) => state.user);
  const [loadingGenerateMeal, setLoadingGenerateMeal] = useState(false);
  const [pastRecords, setPastRecords] = useState([])
  const [expandedRecord, setExpandedRecord] = useState(null)
  const navigate = useNavigate();

  useEffect(() => { // Runs automatically when the page loads
    if (user) {
      fetchPastRecords();
    } else {
      navigate("/login");
    }
  }, []);

  const fetchPastRecords = async () => {
    try {
      const response = await fetch(`${BASE_URL}/meal/getPastRecords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json()
      console.log(data);
      setPastRecords(data.records)
    } catch (error) {
      console.error('Error fetching past records:', error);
      toast.error('Error fetching past records');
    }
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const [diet, setDiet] = useState({
    monday: {
      meals: [],
      nutrients: {},
    },
    tuesday: {
      meals: [],
      nutrients: {},
    },
    wednesday: {
      meals: [],
      nutrients: {},
    },
    thursday: {
      meals: [],
      nutrients: {},
    },
    friday: {
      meals: [],
      nutrients: {},
    },
    saturday: {
      meals: [],
      nutrients: {},
    },
    sunday: {
      meals: [],
      nutrients: {},
    },
  });

  const [diet2, setDiet2] = useState({
    monday: {
      meals: [],
      nutrients: {},
    },
    tuesday: {
      meals: [],
      nutrients: {},
    },
    wednesday: {
      meals: [],
      nutrients: {},
    },
    thursday: {
      meals: [],
      nutrients: {},
    },
    friday: {
      meals: [],
      nutrients: {},
    },
    saturday: {
      meals: [],
      nutrients: {},
    },
    sunday: {
      meals: [],
      nutrients: {},
    },
  });

  const handleSubmit = async (event) => {
    console.log(user);
    if (user === null) {
      navigate("/login");
    }

    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!data.get("calories") || !selectedDiet) {
      // If either field is empty, show an error message
      alert("Please select a diet and enter your calorie goal.");
      return;
    }

    const newdata = {
      diet: selectedDiet,
      calories: data.get("calories"),
      exclude: data.get("exclude"),
    };

    setLoadingGenerateMeal(true);
    const dietResponse = await fetch(`${BASE_URL}/meal/generateMeal`, {
      method: "POST",
      body: JSON.stringify(newdata),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const Diet = await dietResponse.json();
    console.log("API DATA: ", Diet);
    setDiet(Diet);
    setDiet2(Diet.data.week);
    console.log("SET DATA: ", Diet);
    setLoadingGenerateMeal(false);
  };

  const saveMeal = async () => {
    const PushData = {
      name: inputValue,
      items: [],
      // publishAsPublic: false,
    }

    let numday = 0
    for (const day in diet2) {
      numday += 1
      let slot = 0
      for (const meal of diet2[day].meals) {
        slot += 1
        PushData.items.push({
          day: numday,
          slot: slot,
          position: 0,
          type: "RECIPE",
          value: {
            id: meal.id,
            servings: meal.servings,
            title: meal.title,
            imageType: meal.imageType,
          },
        })
      }
    }

    try {
      await fetch(`${BASE_URL}/meal/saveMeal`, {
        method: "POST",
        body: JSON.stringify({ PushData, email: user.email }),
        headers: {
          "Content-Type": "application/json",
        },
      })
      // Refresh past records after saving
      fetchPastRecords();
      console.log('Diet Saved');
    } catch (error) {
      console.error("Error saving meal plan:", error)
    }
  }

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId)
  }

  return (
    <Container
      className={classes.container}
      style={{ flexDirection: "column", background: "" }}
    >
      <ToastContainer />
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <Typography variant="h3" style={{ margin: "20px 0px" }}>
          Upgrade your Diet
        </Typography>
        <Typography variant="h2" style={{ margin: "20px 0px" }}>
          Personalized Meal Plans
        </Typography>

        <FlexCenter flexDirection="column">
          <Typography variant="h5">Select a diet</Typography>
          <Autocomplete
            disablePortal
            name="diet"
            id="combo-box-demo"
            options={diets}
            sx={{ width: 300, margin: "20px 0px" }}
            renderInput={(params) => (
              <TextField {...params} label="Choose Diet" />
            )}
            value={selectedDiet}
            onChange={(event, newValue) => {
              setSelectedDiet(newValue);
            }}
          />
          <Typography variant="h5">Enter your calories</Typography>
          <TextField
            label="Calories"
            name="calories"
            sx={{ margin: "20px 0px", width: 300 }}
          />
          <TextField
            label="Intolerant food (optional)"
            name="exclude"
            sx={{ margin: "12px", width: 300 }}
          />

          {diet2.monday.meals.length !== 0 ? (
            <Button
              variant="contained"
              style={{ margin: "12px" }}
              type="submit"
            >
              Regenerate meal plan
            </Button>
          ) : (
            <Button
              variant="contained"
              style={{ margin: "12px" }}
              type="submit"
            >
              Generate my meal plan
            </Button>
          )}
        </FlexCenter>
      </Box>
      <div
        style={{ backgroundColor: "#f5f5f5", width: "100%", padding: "20px" }}
      >
        <Box>
          {diet2.monday.meals.length !== 0 ? (
            <Box style={{ margin: "40px" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "12px",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h2" sx={{ margin: "40px" }}>
                  Generated Meal Plan
                </Typography>
                <InputLabel htmlFor="inputBox" sx={{ margin: "20px 0px" }}>
                  Give Meal Plan A Name
                </InputLabel>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "12px",
                  }}
                >
                  <br />

                  <input
                    id="inputBox"
                    type="text"
                    onChange={handleInputChange}
                    sx={{ borderRadius: "8px", padding: "8px", width: "400px" }}
                  />
                  <Button
                    onClick={() => saveMeal()}
                    variant="contained"
                    sx={{
                      borderRadius: "8px",
                      marginLeft: "8px",
                      textTransform: "none",
                    }}
                  >
                    Save Meal Plan
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!loadingGenerateMeal ? (
                <Typography variant="h3" style={{ padding: "120px" }}>
                  Click On Generate Meal Plan
                </Typography>
              ) : (
                <Box style={{ margin: "60px 0px" }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </Box>
        {console.log("Before Sending", diet2)}

        {diet2.monday.meals.length !== 0 && (
          <Box>
            {Object.keys(diet2).map((day, index) => {
              const meals = diet2[day].meals;
              return (
                <div key={index}>
                  <h2>{day}</h2>
                  <ul>
                    {meals.map((meal) => (
                      <li key={meal.id}>
                        <h3>{meal.title}</h3>
                        <p>Servings: {meal.servings}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </Box>
        )}
      </div>
      <Box sx={{ marginTop: "40px" }}>
        <Typography variant="h4" sx={{ marginBottom: "20px" }}>
          Past Meal Plans
        </Typography>
        {pastRecords.length > 0 ? (
          pastRecords.map((record, count) => (
            <Box
              key={record._id}
              sx={{
                marginBottom: "20px",
                padding: "16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => toggleRecordExpansion(record._id)}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {count + 1}. {record.name}
              </Typography>
              {expandedRecord === record._id && (
                <Box sx={{ marginTop: "12px" }}>
                  {Array.from(new Set(record.items.map((item) => item.day))).map((day) => {
                    const mealsForDay = record.items.filter((item) => item.day === day);
                    return (
                      <Box key={day} sx={{ marginBottom: "24px" }}>
                        <Typography
                          variant="h5"
                          sx={{
                            marginBottom: "12px",
                            fontWeight: "bold",
                            textDecoration: "underline",
                          }}
                        >
                          Day {day}
                        </Typography>
                        {["Morning", "Afternoon", "Night"].map((time, slotIndex) => {
                          const mealsForSlot = mealsForDay.filter((item) => item.slot === slotIndex + 1);
                          return mealsForSlot.length > 0 ? (
                            <Box key={slotIndex} sx={{ marginBottom: "16px" }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  padding: "8px",
                                  backgroundColor: "#f0f0f0",
                                  borderRadius: "4px",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                }}
                              >
                                {time}
                              </Typography>
                              {mealsForSlot.map((item, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    marginTop: "8px",
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    backgroundColor: "#fafafa",
                                  }}
                                >
                                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                    {item.value.title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "gray" }}>
                                    Servings: {item.value.servings}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : null;
                        })}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography>No past meal plans available.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default PersonalMeal;
