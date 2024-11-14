import mongoose from "mongoose";
import crypto from "crypto";

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
    },
    spoonacularUsername: {
      type: String,
      unique: true,
    },
    spoonacularHash: {
      type: String,
    },
    mealPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "MealPlan" }],
  },
  { timestamps: true }
);

// Hook to generate unique spoonacularUsername and spoonacularHash
UserSchema.pre("save", function (next) {
  if (this.isNew) {
    this.spoonacularUsername = `${this.email.split("@")[0]}_${Date.now()}`;
    this.spoonacularHash = crypto
      .createHash("sha256")
      .update(this.email + Date.now())
      .digest("hex");
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;