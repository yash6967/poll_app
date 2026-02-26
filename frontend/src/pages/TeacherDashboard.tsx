import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';

export default function TeacherDashboard() {
    const { socket, activePoll, pollResults, participants } = useSocket('teacher', 'Teacher');
    const timeLeft = usePollTimer(activePoll?.startTime || null, activePoll?.timeLimitSeconds || 60);

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([
        { text: 'Mars', isCorrect: false },
        { text: 'Venus', isCorrect: false }
    ]);
    const [timeLimit, setTimeLimit] = useState(60);

    const handleAddOption = () => {
        setOptions([...options, { text: '', isCorrect: false }]);
    };

    const handleOptionChange = (idx: number, text: string) => {
        const newOpts = [...options];
        newOpts[idx].text = text;
        setOptions(newOpts);
    };

    const handleCorrectChange = (idx: number, isCorrect: boolean) => {
        const newOpts = [...options];
        newOpts[idx].isCorrect = isCorrect;
        setOptions(newOpts);
    };

    const handleAskQuestion = () => {
        if (!socket || !question.trim()) return;
        const validOptions = options.filter(o => o.text.trim());
        if (validOptions.length < 2) return alert("Need at least 2 options");

        socket.emit('create_poll', {
            question,
            options: validOptions,
            timeLimitSeconds: timeLimit
        });

        // reset form
        setQuestion('');
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    };

    const handleKick = (studentName: string) => {
        if (!socket) return;
        socket.emit('kick_student', { studentName });
    };

    const isFormValid = question.trim() && options.filter(o => o.text.trim()).length >= 2;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '40px', padding: '40px' }}>

            {/* LEFT PANEL : Poll Creation OR Active Poll */}
            <div style={{ flex: 1 }}>
                {!activePoll && (
                    <div>
                        <div className="badge" style={{ marginBottom: '24px' }}>
                            <span>✨</span> Intervue Poll
                        </div>
                        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
                            Let's <span style={{ fontWeight: 800 }}>Get Started</span>
                        </h1>
                        <p style={{ color: 'var(--text-light)', marginBottom: '40px', lineHeight: 1.5 }}>
                            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 600 }}>Enter your question</h3>
                            <select
                                value={timeLimit}
                                onChange={e => setTimeLimit(Number(e.target.value))}
                                style={{ padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-color)', fontWeight: 600, cursor: 'pointer' }}
                            >
                                <option value={15}>15 seconds</option>
                                <option value={30}>30 seconds</option>
                                <option value={60}>60 seconds</option>
                                <option value={90}>90 seconds</option>
                            </select>
                        </div>

                        <textarea
                            placeholder="e.g. Which planet is known as the Red Planet?"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-color)', fontSize: '16px', minHeight: '120px', resize: 'vertical', marginBottom: '32px'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 600 }}>Edit Options</h3>
                            <h3 style={{ fontWeight: 600 }}>Is it Correct?</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            {options.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        placeholder="Option Text"
                                        style={{ flex: 1, padding: '16px', border: 'none', borderRadius: '4px', backgroundColor: 'var(--bg-color)', fontSize: '16px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '16px', minWidth: '120px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                            <input type="radio" checked={opt.isCorrect} onChange={() => handleCorrectChange(idx, true)} /> Yes
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                            <input type="radio" checked={!opt.isCorrect} onChange={() => handleCorrectChange(idx, false)} /> No
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '4px' }} onClick={handleAddOption}>
                            + Add More option
                        </button>

                        <div style={{ marginTop: '40px', borderTop: '1px solid #E5E5E5', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                style={{ padding: '14px 40px' }}
                                disabled={!isFormValid}
                                onClick={handleAskQuestion}
                            >
                                Ask Question
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVE POLL VIEW */}
                {activePoll && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Question</h2>
                            <div style={{ color: '#D32F2F', fontWeight: 600 }}>
                                ⏳ {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="card" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '24px', backgroundColor: 'var(--text-dark)', color: 'white', fontWeight: 600 }}>
                                {activePoll.question}
                            </div>

                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {activePoll.options.map((opt: any, idx: number) => {
                                    let percentage = 0;
                                    if (pollResults && pollResults.id === activePoll._id) {
                                        const resultsArr = pollResults.results;
                                        const totalVotes = resultsArr.reduce((acc: number, val: any) => acc + val.count, 0);
                                        const optVotes = resultsArr[idx].count;
                                        percentage = totalVotes === 0 ? 0 : Math.round((optVotes / totalVotes) * 100);
                                    }

                                    return (
                                        <div key={idx} style={{
                                            position: 'relative', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E5E5E5', overflow: 'hidden', display: 'flex', justifyContent: 'space-between'
                                        }}>
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percentage}%`, backgroundColor: 'var(--primary-light)', zIndex: 0, transition: 'width 0.5s ease'
                                            }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', border: '1px solid var(--primary-light)'
                                                }}>
                                                    {idx + 1}
                                                </div>
                                                <span style={{ fontWeight: 500, color: percentage > 0 ? 'white' : 'var(--text-dark)' }}>{opt.text}</span>
                                            </div>
                                            <span style={{ position: 'relative', zIndex: 1, fontWeight: 'bold' }}>{percentage}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {timeLeft === 0 && (
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn" onClick={() => window.location.reload()}>Finish / Ask New</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT PANEL : Chat & Participants */}
            <div style={{ width: '300px' }} className="card">
                <div style={{ display: 'flex', borderBottom: '1px solid #E5E5E5' }}>
                    <div style={{ flex: 1, padding: '16px', textAlign: 'center', cursor: 'pointer', borderBottom: '2px solid var(--primary)', fontWeight: 600 }}>
                        Participants
                    </div>
                </div>

                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)', fontSize: '12px', marginBottom: '16px' }}>
                        <span>Name</span>
                        <span>Action</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {participants.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500 }}>
                                <span>{p.name}</span>
                                <span style={{ color: 'var(--primary-light)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleKick(p.name)}>
                                    Kick out
                                </span>
                            </div>
                        ))}
                        {participants.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>No active participants</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
