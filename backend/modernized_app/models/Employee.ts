import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  position: string;
  spec: string;
  photo: string;
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    spec: { type: String, default: "", trim: true },
    photo: { type: String, default: "", trim: true },
  }
);

// Pymongo seeds "employees" collection, so Mongoose collection name should match it.
const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema, "employees");

export default Employee;
