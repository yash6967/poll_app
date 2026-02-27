import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';

export interface MessageData {
    sender: string;
    message: string;
    timestamp: string;
}

export const useSocket = (role: 'student' | 'teacher', name: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activePoll, setActivePoll] = useState<any | null>(null);
    const [pollResults, setPollResults] = useState<any | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<MessageData[]>([]);
    const [kickedOut, setKickedOut] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!name) return;

        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_session', { name, role });
        });

        newSocket.on('poll_active', (poll) => {
            setActivePoll(poll);
            setPollResults(null);
        });

        newSocket.on('poll_inactive', () => {
            setActivePoll(null);
        });

        newSocket.on('poll_created', (poll) => {
            setActivePoll(poll);
            setPollResults(null);
        });

        newSocket.on('poll_results_update', (data) => {
            // Teachers see this live, Students see this after voting
            setPollResults({ id: data.pollId, results: data.results });
        });

        newSocket.on('participants_update', (data) => {
            setParticipants(data);
        });

        newSocket.on('receive_chat', (msg: MessageData) => {
            setChatMessages((prev) => [...prev, msg]);
        });

        newSocket.on('kicked_out', () => {
            setKickedOut(true);
            newSocket.disconnect();
        });

        newSocket.on('poll_history', (data) => {
            setHistory(data);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [name, role]);

    return {
        socket,
        activePoll,
        pollResults,
        participants,
        chatMessages,
        kickedOut,
        history
    };
};
