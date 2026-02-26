# Resilient Live Polling System

A real-time, interactive Live Polling System designed with a focus on state recovery, timer synchronization, and robust user experiences. The application supports two distinct roles: Teacher (Admin) and Student.

## Features

### Teacher Persona
*   **Poll Creation:** Ability to create dynamic questions, add multiple options, designate correct answers, and set a specific timer duration (e.g., 15s, 30s, 60s).
*   **Live Dashboard:** View real-time polling updates as students submit their votes, with live percentage synchronization.
*   **Participant Management:** See a live list of active students and the ability to kick out individual participants.

### Student Persona
*   **Onboarding:** Simple entry by providing a name to join the session.
*   **Synchronized Polling:** Accurately synchronized timers based on the server's master clock, ensuring late joiners start at the correct remaining time.
*   **Live Engagement:** Vote on active polls and see the live percentage distribution of the classroom once a vote is cast.

### Resilience & State Recovery
*   **Connection Drops & Refreshes:** The system is built to handle mid-poll browser refreshes or network drops seamlessly. If a student or teacher refreshes, the application immediately restores the active poll state, options, timer, and participant lists from the server.
*   **Duplicate Vote Prevention:** Server-side validation guarantees that a user (based on their socket connection and unique name within the session) can only vote once per poll.

## Technology Stack

*   **Frontend:** React.js, Vite, TypeScript, React Router Dom
*   **Backend:** Node.js, Express, TypeScript
*   **Real-time Communication:** Socket.io
*   **Database:** MongoDB (via Mongoose)
*   **Styling:** Custom vanilla CSS adhering to specific design tokens and modern aesthetic principles (glassmorphism, clean layouts).

## Prerequisites

*   Node.js (v18+ recommended)
*   MongoDB Instance (Local or Atlas)

## Local Development Setup

1. **Clone the repository** (or navigate to the project root).

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   *   Ensure you have a `.env` file in the `backend` directory.
   *   Example `.env`:
       ```env
       PORT=3000
       MONGO_URI=mongodb://127.0.0.1:27017/live-polling-db
       ```
       *(Note: Update the URI if using MongoDB Atlas).*
   *   Start the backend development server:
       ```bash
       npm run dev
       ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```
   *   Start the frontend development server:
       ```bash
       npm run dev
       ```

4. **Access the Application:**
   *   Open your browser and navigate to the local Vite URL provided in your terminal (typically `http://localhost:5173` or `http://localhost:5174`).

## Architecture

*   **Models:** `Poll`, `Vote`, and `Participant` Mongoose schemas manage the state in the database.
*   **Controllers/Services:** The business logic (creating polls, calculating results) is decoupled into `PollService.ts` to keep the Socket handlers clean.
*   **Socket Handlers:** `PollSocketHandler.ts` manages all real-time events (`join_session`, `create_poll`, `submit_vote`, etc.).
*   **Hooks:** The frontend uses robust custom hooks like `useSocket.ts` to manage the Socket.io lifecycle and reactive state, and `usePollTimer.ts` for strict client-server time reconciliation.

## Future Enhancements
*   Poll History View for Teachers (fetching past aggregates).
*   Live Classroom Chat integration.
