import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplication extends Document {
  name: string;
  email: string;
  phone: string;
  resume?: string;
  message?: string;
  jobId?: string;
  jobTitle?: string;
  createdAt: Date;
}

const ApplicationSchema: Schema<IApplication> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    resume: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    jobId: { type: String, default: "" },
    jobTitle: { type: String, default: "General Application", trim: true },
    createdAt: { type: Date, default: Date.now },
  }
);

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema, "applications");

export default Application;
