import { Poll } from '../models/Poll';
import { Vote } from '../models/Vote';
import { Participant } from '../models/Participant';

export class PollService {
    /**
     * Create a new poll. Sets others to inactive.
     */
    async createPoll(question: string, options: { text: string; isCorrect: boolean }[], timeLimitSeconds: number) {
        // End any currently active polls
        await Poll.updateMany({ isActive: true }, { isActive: false });

        const newPoll = new Poll({
            question,
            options,
            timeLimitSeconds,
            isActive: true,
            startTime: new Date()
        });

        await newPoll.save();
        return newPoll;
    }

    /**
     * Get the currently active poll, if any.
     */
    async getActivePoll() {
        const poll = await Poll.findOne({ isActive: true });
        if (!poll) return null;

        // Check if time has expired based on startTime and limit
        if (poll.startTime) {
            const elapsedSeconds = (Date.now() - poll.startTime.getTime()) / 1000;
            if (elapsedSeconds >= poll.timeLimitSeconds) {
                poll.isActive = false;
                await poll.save();
                return null; // Expired, not active anymore
            }
        }

        return poll;
    }

    /**
     * Submit a vote for a poll. Throws error if double vote.
     */
    async submitVote(pollId: string, studentName: string, optionIdx: number) {
        const poll = await Poll.findOne({ _id: pollId, isActive: true });
        if (!poll) {
            throw new Error("Poll not found or not active");
        }

        // Check if time has expired
        if (poll.startTime) {
            const elapsedSeconds = (Date.now() - poll.startTime.getTime()) / 1000;
            if (elapsedSeconds >= poll.timeLimitSeconds) {
                throw new Error("Timer has expired");
            }
        }

        // This will throw a duplicate key error if they already voted because of unique compound index
        try {
            const newVote = new Vote({ pollId, studentName, optionIdx });
            await newVote.save();
            return newVote;
        } catch (err: any) {
            if (err.code === 11000) {
                throw new Error("Student has already voted for this poll");
            }
            throw err;
        }
    }

    /**
     * Get total results for a poll
     */
    async getPollResults(pollId: string) {
        const poll = await Poll.findById(pollId);
        if (!poll) return null;

        const votes = await Vote.find({ pollId });

        // Aggregate format: [ { optionIdx: 0, count: 5 }, ... ]
        const results = poll.options.map((opt: any, idx) => ({
            ...opt.toObject(),
            optionIdx: idx,
            count: votes.filter(v => v.optionIdx === idx).length
        }));

        return results;
    }

    /**
     * Get history of polls
     */
    async getPollHistory() {
        const polls = await Poll.find().sort({ createdAt: -1 });
        const history = [];

        for (const poll of polls) {
            const results = await this.getPollResults(poll._id.toString());
            history.push({
                ...poll.toObject(),
                results
            });
        }

        return history;
    }
}
