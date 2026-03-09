import mongoose, { Schema, Document } from 'mongoose';

// Body document interface
export interface IBody extends Document {
  body: unknown;
  created_at: Date;
}

// Body schema for MongoDB
const BodySchema = new Schema<IBody>({
  body: {
    type: Schema.Types.Mixed,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Body model
export const BodyModel = mongoose.model<IBody>('Body', BodySchema);
