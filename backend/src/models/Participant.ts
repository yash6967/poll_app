import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant extends Document {
    name: string;
    socketId: string;
    isActive: boolean;
    lastSeen: Date;
}

const ParticipantSchema = new Schema({
    name: { type: String, required: true, unique: true },
    socketId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now }
});

export const Participant = mongoose.model<IParticipant>('Participant', ParticipantSchema);
