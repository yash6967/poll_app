import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const name = localStorage.getItem('studentName') || '';

    const { socket, activePoll, pollResults, kickedOut } = useSocket('student', name);
    const timeLeft = usePollTimer(activePoll?.startTime || null, activePoll?.timeLimitSeconds || 60);

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (!name) navigate('/');
    }, [name, navigate]);

    useEffect(() => {
        if (kickedOut) {
            alert("You have been removed by the teacher.");
            localStorage.removeItem('studentName');
            navigate('/');
        }
    }, [kickedOut, navigate]);

    // Reset vote state when a new poll comes in
    useEffect(() => {
        if (activePoll) {
            setHasVoted(false);
            setSelectedOption(null);
        }
    }, [activePoll?._id]);

    const submitVote = () => {
        if (selectedOption === null || !socket || !activePoll) return;

        socket.emit('submit_vote', {
            pollId: activePoll._id,
            studentName: name,
            optionIdx: selectedOption
        });
        setHasVoted(true);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!activePoll) {
        return (
            <div style={{ textAlign: 'center' }}>
                <div className="badge" style={{ marginBottom: '40px' }}>
                    <span>✨</span> Intervue Poll
                </div>
                <div style={{
                    width: '64px', height: '64px',
                    border: '6px solid var(--primary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    margin: '0 auto 24px auto',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: '24px' }}>Wait for the teacher to ask questions..</h2>
            </div>
        );
    }

    // Active Poll
    return (
        <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Question</h2>
                <div style={{ color: '#D32F2F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⏳ {formatTime(timeLeft)}
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '24px', backgroundColor: 'var(--text-dark)', color: 'white', fontWeight: 600 }}>
                    {activePoll.question}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activePoll.options.map((opt: any, idx: number) => {
                        // Calculate percentage for results view
                        let percentage = 0;
                        if (pollResults && pollResults.id === activePoll._id) {
                            const resultsArr = pollResults.results;
                            const totalVotes = resultsArr.reduce((acc: number, val: any) => acc + val.count, 0);
                            const optVotes = resultsArr[idx].count;
                            percentage = totalVotes === 0 ? 0 : Math.round((optVotes / totalVotes) * 100);
                        }

                        const isVoted = hasVoted || timeLeft === 0;

                        return (
                            <div
                                key={idx}
                                onClick={() => !isVoted && setSelectedOption(idx)}
                                style={{
                                    position: 'relative',
                                    padding: '16px 20px',
                                    backgroundColor: selectedOption === idx || (isVoted && selectedOption === idx) ? 'var(--primary-light)' : 'var(--bg-color)',
                                    color: selectedOption === idx || (isVoted && selectedOption === idx) ? 'white' : 'var(--text-dark)',
                                    borderRadius: '8px',
                                    cursor: isVoted ? 'default' : 'pointer',
                                    border: selectedOption === idx ? '2px solid var(--primary)' : '1px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {/* Progress Bar Background for Results */}
                                {isVoted && pollResults && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0, top: 0, bottom: 0,
                                        width: `${percentage}%`,
                                        backgroundColor: 'var(--primary)',
                                        opacity: selectedOption === idx ? 1 : 0.6,
                                        zIndex: 0
                                    }} />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1, width: '100%' }}>
                                    <div style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: selectedOption === idx ? 'white' : '#A0A0A0',
                                        color: selectedOption === idx ? 'var(--primary)' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: 'bold'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{opt.text}</span>
                                </div>

                                {isVoted && pollResults && (
                                    <span style={{ position: 'relative', zIndex: 1, fontWeight: 'bold' }}>
                                        {percentage}%
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {!hasVoted && timeLeft > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button
                        className="btn"
                        style={{ padding: '12px 48px' }}
                        disabled={selectedOption === null}
                        onClick={submitVote}
                    >
                        Submit
                    </button>
                </div>
            )}

            {(hasVoted || timeLeft === 0) && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Wait for the teacher to ask a new question..</h3>
                </div>
            )}

            {/* Basic Chat UI toggle */}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
                <button className="btn" style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    💬
                </button>
            </div>
        </div>
    );
}
