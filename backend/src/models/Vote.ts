import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentName: string;
    optionIdx: number;
    createdAt: Date;
}

const VoteSchema = new Schema({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    studentName: { type: String, required: true },
    optionIdx: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// A student can only vote once per poll
VoteSchema.index({ pollId: 1, studentName: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
