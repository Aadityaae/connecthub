import mongoose, { Schema, Document } from "mongoose";

export interface IReel extends Document {
  author: mongoose.Types.ObjectId;
  videoUrl: string;
  caption: string;
  likes: mongoose.Types.ObjectId[];
  category: string;
  tags: string[];
  createdAt: Date;
}

const ReelSchema: Schema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videoUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    category: { type: String, default: "General" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IReel>("Reel", ReelSchema);
