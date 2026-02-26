import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
    text: string;
    isCorrect: boolean;
}

export interface IPoll extends Document {
    question: string;
    timeLimitSeconds: number;
    options: IOption[];
    startTime: Date | null;
    isActive: boolean;
    createdAt: Date;
}

const OptionSchema = new Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false }
});

const PollSchema = new Schema({
    question: { type: String, required: true },
    timeLimitSeconds: { type: Number, required: true, default: 60 },
    options: [OptionSchema],
    startTime: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
