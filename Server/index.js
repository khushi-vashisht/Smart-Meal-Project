import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";

/* Configurations */
// CHAT BOT Text, Rest Terms data to api
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());  //! Adds security-related headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common")); //! Log HTTP requests
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors(
  {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }
));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/meal", mealRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });