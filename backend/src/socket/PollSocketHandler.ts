import { Server, Socket } from 'socket.io';
import { PollService } from '../services/PollService';
import { Participant } from '../models/Participant';

const pollService = new PollService();

export const handleSocketConnections = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`New connection: ${socket.id}`);

        // Join App Session
        socket.on('join_session', async (data: { name: string, role: string }) => {
            if (data.role === 'student') {
                try {
                    // Update or insert participant
                    await Participant.findOneAndUpdate(
                        { name: data.name },
                        { socketId: socket.id, isActive: true, lastSeen: new Date() },
                        { upsert: true, new: true }
                    );
                } catch (err) {
                    console.error("Failed to join session", err);
                }
            }

            // Check for active poll and send to newly connected client to ensure resilience
            const activePoll = await pollService.getActivePoll();
            if (activePoll) {
                socket.emit('poll_active', activePoll);

                // Return their current vote if they have one so UI reflects they voted already
                // Implementation note: we need their vote info.
            } else {
                socket.emit('poll_inactive');
            }

            // Send the participant list update to Teachers
            if (data.role === 'student' || data.role === 'teacher') {
                const participants = await Participant.find({ isActive: true });
                io.emit('participants_update', participants);
            }
        });

        // Create a new poll (Teacher only)
        socket.on('create_poll', async (data: { question: string, options: any[], timeLimitSeconds: number }) => {
            try {
                const newPoll = await pollService.createPoll(data.question, data.options, data.timeLimitSeconds);
                io.emit('poll_created', newPoll);
            } catch (err: any) {
                socket.emit('error', { message: err.message || "Failed to create poll" });
            }
        });

        // Submit a vote (Student only)
        socket.on('submit_vote', async (data: { pollId: string, studentName: string, optionIdx: number }) => {
            try {
                await pollService.submitVote(data.pollId, data.studentName, data.optionIdx);
                // Acknowledge to student
                socket.emit('vote_success', { message: 'Vote submitted successfully' });

                // Broadcast updated results to teacher instantly
                const results = await pollService.getPollResults(data.pollId);
                io.emit('poll_results_update', { pollId: data.pollId, results });

            } catch (err: any) {
                socket.emit('vote_error', { message: err.message || "Failed to submit vote" });
            }
        });

        // Chat functionality
        socket.on('send_chat', (data: { sender: string, message: string }) => {
            io.emit('receive_chat', { sender: data.sender, message: data.message, timestamp: new Date() });
        });

        // Request history
        socket.on('request_history', async () => {
            try {
                const history = await pollService.getPollHistory();
                socket.emit('poll_history', history);
            } catch (err: any) {
                console.error("Failed to fetch history:", err);
            }
        });

        // Teacher manual get results
        socket.on('request_results', async ({ pollId }) => {
            try {
                const results = await pollService.getPollResults(pollId);
                socket.emit('poll_results_update', { pollId, results });
            } catch (err) {
                // ignore error
            }
        });

        // Handle kick request
        socket.on('kick_student', async (data: { studentName: string }) => {
            const participant = await Participant.findOne({ name: data.studentName });
            if (participant) {
                io.to(participant.socketId).emit('kicked_out', { message: "You have been removed by the teacher." });
                participant.isActive = false;
                await participant.save();
                const participants = await Participant.find({ isActive: true });
                io.emit('participants_update', participants);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`Disconnected: ${socket.id}`);
            // Mark participant inactive
            await Participant.updateMany({ socketId: socket.id }, { isActive: false });
            const participants = await Participant.find({ isActive: true });
            io.emit('participants_update', participants);
        });
    });
};
