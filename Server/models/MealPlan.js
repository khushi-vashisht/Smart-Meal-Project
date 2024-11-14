import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    items: [
        {
            day: { type: Number, required: true },
            slot: { type: Number, required: true },
            position: { type: Number, default: 0 },
            value: {
                id: { type: Number, required: true },
                servings: { type: Number, required: true },
                title: { type: String, required: true },
                imageType: { type: String, required: true },
            },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("MealPlan", mealPlanSchema);
