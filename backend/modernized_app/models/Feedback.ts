import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  phone: string;
  project: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    project: { type: String, required: true, trim: true },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Pymongo collection name: "feedbacks"
const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema, "feedbacks");

export default Feedback;
