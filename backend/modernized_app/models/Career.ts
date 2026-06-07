import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICareer extends Document {
  title: string;
  description: string;
  skills: string[];
  location: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema: Schema<ICareer> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    location: { type: String, default: "Kashmir, India", trim: true },
    type: { type: String, default: "full-time", trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
);

const Career: Model<ICareer> =
  mongoose.models.Career || mongoose.model<ICareer>("Career", CareerSchema, "careers");

export default Career;
