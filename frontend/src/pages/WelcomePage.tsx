import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
    const navigate = useNavigate();
    const [role, setRole] = useState<'student' | 'teacher' | null>(null);
    const [name, setName] = useState('');
    const [step, setStep] = useState(1);

    const handleContinue = () => {
        if (step === 1) {
            if (role === 'teacher') {
                navigate('/teacher');
            } else if (role === 'student') {
                setStep(2);
            }
        } else if (step === 2) {
            if (name.trim()) {
                localStorage.setItem('studentName', name);
                navigate('/student');
            }
        }
    };

    return (
        <div className="welcome-container" style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '20px' }}>
            <div className="badge" style={{ marginBottom: '24px' }}>
                <span>✨</span> Intervue Poll
            </div>

            {step === 1 && (
                <>
                    <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>
                        Welcome to the <span style={{ fontWeight: 800 }}>Live Polling System</span>
                    </h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>
                        Please select the role that best describes you to begin using the live polling system
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
                        <div
                            className={`card ${role === 'student' ? 'selected' : ''}`}
                            style={{ padding: '24px', cursor: 'pointer', border: role === 'student' ? '2px solid var(--primary)' : '1px solid #E5E5E5' }}
                            onClick={() => setRole('student')}
                        >
                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>I'm a Student</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: 1.5 }}>
                                Submit answers and view live poll results in real-time.
                            </p>
                        </div>

                        <div
                            className={`card ${role === 'teacher' ? 'selected' : ''}`}
                            style={{ padding: '24px', cursor: 'pointer', border: role === 'teacher' ? '2px solid var(--primary)' : '1px solid #E5E5E5' }}
                            onClick={() => setRole('teacher')}
                        >
                            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>I'm a Teacher</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: 1.5 }}>
                                Create polls, ask questions, and monitor your students' responses.
                            </p>
                        </div>
                    </div>

                    <button
                        className="btn"
                        style={{ padding: '14px 48px', fontSize: '18px' }}
                        disabled={!role}
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </>
            )}

            {step === 2 && role === 'student' && (
                <>
                    <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>
                        Let's <span style={{ fontWeight: 800 }}>Get Started</span>
                    </h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>
                        If you're a student, you'll be able to <span style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
                    </p>

                    <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 40px auto' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Enter your Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Rahul Bajaj"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-color)',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <button
                        className="btn"
                        style={{ padding: '14px 48px', fontSize: '18px' }}
                        disabled={!name.trim()}
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                </>
            )}
        </div>
    );
}
