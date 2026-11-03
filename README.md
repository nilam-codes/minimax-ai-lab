# MINIMAX AI LAB — AI in Tic-Tac-Toe Using the Minimax Algorithm

> An interactive AI-powered Tic-Tac-Toe laboratory demonstrating the Minimax decision-making algorithm, featuring an animated robot companion named MINI, real-time candidate move evaluation, interactive decision tree visualizations, and educational demonstration modes.

---

## 📌 Project Overview

**MINIMAX AI LAB** is an educational software application engineered to demystify Artificial Intelligence and Game Theory principles for students and educators. Built with React and Vite, the platform transforms the classical game of Tic-Tac-Toe into an interactive AI telemetry simulator.

Rather than relying on static lookup tables or heuristic approximations, the system executes the authentic **recursive Minimax algorithm** from first principles in real time. Players face **MINI**, an animated robotic opponent capable of expressing thoughts, voicing strategic assessments, physically moving towards the board to draw its moves, and reacting dynamically to every player action.

The application serves both as a competitive game and as an interactive seminar tool, equipped with a dedicated **Seminar Presentation Mode**, **Board-by-Board Simulation Scrubbers**, and a specialized **Force AI Move** demonstration mode designed for live classroom analysis.

---

## ✨ Key Features

### 1. Human vs. AI Gameplay
- Seamless turn-based interaction on an arcade-styled 3×3 matrix.
- Symmetrical AI logic: MINI plays flawlessly whether assigned **X** (First Turn) or **O** (Second Turn).
- Responsive win line highlights, draw detection, and live session scoreboard tracking (Wins, Losses, Draws).

### 2. Unbeatable Minimax Algorithm
- Full state-space exploration across all 255,168 possible leaf game trajectories.
- Depth-penalized evaluation function ($+10 - \text{depth}$ for swift wins, $-10 + \text{depth}$ for prolonged defense, $0$ for draws) ensuring the AI always pursues the fastest victory path and most resilient defense.
- Mathematically proven 0% loss rate against optimal human play.

### 3. Real-Time AI Move Evaluation
- Evaluates every legal empty square from the current board state simultaneously.
- Renders real candidate evaluation scores, normalized outcomes (`AI WIN`, `DRAW`, `AI LOSS`), and tactical explanations (e.g., immediate win, counter-blocking, fork defense).

### 4. Interactive Decision Tree Visualization
- Step-by-step visual inspection of decision branches, contrasting alternating **MAX** plies (AI decisions) and **MIN** plies (Human counters).
- Visual node indicators displaying sub-board positions, depth indicators, and highlighted optimal backtracking paths.
- Interactive node inspector to analyze ancestral decision logic and score guarantees.

### 5. Optimal Move Selection
- Automatic extraction and highlighting of the candidate with the maximum guaranteed mathematical payoff.
- Clear, audience-friendly breakdown: *"These are the possibilities → I'm comparing them → This is my best move."*

### 6. Force AI Move Demonstration Mode
- A dedicated demonstration toggle enabling presenters to override the algorithm and force MINI to execute **any legal square** (even suboptimal blunders).
- Displays real-time comparison dialogs showing what the optimal move was versus the forced move, complete with predicted outcomes.
- Ideal for college lectures to demonstrate how Minimax exploits human mistakes or recovers from forced suboptimal positions.

### 7. MINI — Animated Robot Companion
- Adorable custom-styled robot mascot featuring SVG vector styling, reactive electric-blue LED eyes, and multi-state emotional animations:
  - `idle`: Friendly floating bobbing animation.
  - `thinking`: Head tilt with glowing antenna and contemplative eyes.
  - `analysing`: Rapid eye scan across candidate board coordinates.
  - `drawing`: Physical forward glide with extended digital stylus arm.
  - `excited` / `winning`: Joyful bounce and celebratory LED fireworks.
  - `losing` / `draw`: Playful disappointed shrug or friendly handshake expression.
- Smooth CSS translation that physically glides MINI out of its docking bay towards targeted cells to draw its symbol via progressive SVG stroke animations.

### 8. Personalized Player Interaction
- Customizable player name stored in browser local storage and referenced dynamically in dialogue bubbles.
- Interactive click responses: presenters can click directly on MINI at any time to receive educational hints, algorithmic fun facts, and playful banter.

### 9. Voice Synthesis & Sound Effects
- Built-in speech synthesis using the Web Speech API with customized robotic pitch and rate curves.
- Synchronized subtitles and speech-completion guards ensuring MINI speaks before physical drawing begins.
- Authentic arcade SFX (chirps, clicks, digital stylus strokes, loss sounds, and victory fanfares) with independent toggle controls.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Modular component architecture, custom hooks, and reactive UI state management |
| **JavaScript (ES6+)** | Minimax recursive traversal, state evaluation, and asynchronous animation chains |
| **Vite 6** | Modern, high-performance frontend build pipeline and lightning-fast HMR dev server |
| **HTML5 & SVG** | Accessible semantic structure and progressive vector path stroke rendering |
| **CSS3** | Dark futuristic cyber aesthetic, neon glow filters, responsive flex/grid layouts, and GPU keyframes |
| **Lucide React** | Clean, modern iconography |
| **Web Speech API** | Hardware-accelerated robotic text-to-speech voice synthesis |

---

## 🧠 How the Minimax Algorithm Works

Minimax is a recursive decision-making algorithm formulated in **Game Theory** for two-player, zero-sum, perfect-information games. In Tic-Tac-Toe, every board state is mutually visible, and a win for one player directly equates to a loss for the other.

### 1. Two-Player Maximization & Minimization
- **MAX (The AI)**: Strives to maximize the terminal utility score.
- **MIN (The Human Opponent)**: Strives to minimize the AI's score (maximizing human advantage).

```
          [ ROOT: MAX (AI) ]               <- AI chooses MAXIMUM score
            /      |       \
        Move A   Move B   Move C
          /        |         \
     [ MIN ]    [ MIN ]    [ MIN ]         <- Human chooses MINIMUM score
      /   \      /   \      /   \
    Win  Draw  Loss Draw  Loss  Win
```

### 2. Recursive Backtracking Formulation
For any game state $s$:

$$\text{Minimax}(s) = \begin{cases} 
\text{Utility}(s) & \text{if } s \text{ is a terminal state} \\
\max_{a \in \text{Actions}(s)} \text{Minimax}(\text{Result}(s, a)) & \text{if } \text{Player}(s) = \text{MAX} \\
\min_{a \in \text{Actions}(s)} \text{Minimax}(\text{Result}(s, a)) & \text{if } \text{Player}(s) = \text{MIN}
\end{cases}$$

### 3. Depth-Adjusted Scoring
To prioritize faster wins and delay inevitable losses against suboptimal defense, the terminal score incorporates tree depth:
- **AI Wins at Depth $d$**: $\text{Score} = +10 - d$
- **Human Wins at Depth $d$**: $\text{Score} = -10 + d$
- **Draw**: $\text{Score} = 0$

---

## 📂 Project Structure

```
minimax-ai-lab/
├── index.html                   # HTML5 document template & web fonts
├── package.json                 # Project dependencies & npm run scripts
├── vite.config.js               # Vite build configuration
├── jsconfig.json                # JavaScript path alias configuration
├── .gitignore                   # Excluded build artifacts & node_modules
├── README.md                    # Project documentation & presentation guide
└── src/
    ├── main.jsx                 # Application bootstrapping & DOM mount
    ├── App.jsx                  # Main orchestrator dashboard & modals
    ├── algorithms/
    │   ├── gameLogic.js         # 3x3 rules, terminal checks, winning line indices
    │   ├── minimax.js           # Recursive Minimax engine & candidate evaluations
    │   └── decisionTrace.js     # Decision tree node builders & trace structures
    ├── components/
    │   ├── GameBoard.jsx        # High-contrast 3x3 grid with targeted reticles & SVG drawing
    │   ├── ForegroundGameWindow.jsx # Floating arcade window with scoreboard & controls
    │   ├── PresentationMode.jsx # Projector-optimized guided seminar presenter mode
    │   ├── SimpleMinimaxExplanation.jsx # 3-step audience-facing explanation cards
    │   ├── AIThinkingPanel.jsx  # Telemetry counters (Nodes explored, search time, etc.)
    │   ├── DecisionTree.jsx     # Visual SVG/canvas decision tree renderer
    │   ├── DecisionNode.jsx     # Individual decision node card with mini-grid
    │   ├── SimulationPanel.jsx  # Board-by-board candidate move playback scrubbers
    │   ├── ExplanationPanel.jsx # 5-stage conceptual AI breakdown
    │   ├── GameStatus.jsx       # Status banners and turn indicators
    │   ├── Navbar.jsx           # Top telemetry bar & navigation controls
    │   ├── WelcomeModal.jsx     # Initial player welcome & name onboarding modal
    │   ├── Confetti.jsx         # Celebration confetti burst upon game completion
    │   └── Robot/
    │       ├── MiniRobot.jsx    # Vector robot mascot with animated LED eyes
    │       ├── MiniRobot.css    # Keyframe animations for idle bob, glance & drawing
    │       ├── RobotDialogue.jsx# Speech dialogue bubble anchored above MINI
    │       ├── RobotVoice.js    # Web Speech API engine & synthesizer singleton
    │       └── RobotCompanionPanel.jsx # Companion dock widget
    ├── hooks/
    │   ├── useGame.js           # Comprehensive game state machine & move handlers
    │   └── useSimulation.js     # Step-by-step trace playback & timeline scrubbers
    └── styles/
        ├── global.css           # Futuristic cyber aesthetic, color tokens & typography
        ├── game.css             # Board cell styling, neon glow, target indicators
        ├── foregroundWindow.css # Floating arcade window, scoreboard & confirm modals
        ├── simpleExplanation.css# Projector-sized 3-step explanation layouts
        ├── decisionTree.css     # Tree layout styling, MAX/MIN badges, connectors
        ├── dashboard.css        # Responsive multi-column layout wrappers
        ├── simulation.css       # Candidate card grids & playback controls
        ├── modal.css            # Telemetry walkthrough modal styles
        └── welcomeModal.css     # Name onboarding dialog styling
```

---

## 💻 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (Version `18.x` or higher recommended)
- `npm` (bundled with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/nilamagarwal/minimax-ai-lab.git
cd minimax-ai-lab
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```
Once the dev server starts, open your browser and navigate to:
```
http://localhost:5173
```

### 4. Build for Production
To generate a production-ready, minified bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 👥 Project Team

This project was conceived, designed, and developed by:

- **Dia**
- **Aaralyn**
- **Nilam Agarwal**

---

## 🎓 Academic Context

- **Program**: Bachelor of Computer Applications (BCA)
- **Institution**: Ramaiah University of Applied Sciences (RUAS)
- **Course**: Introduction to Artificial Intelligence (AI)
- **Academic Year**: 2026

---

## 📄 License

This project is released under the **MIT License**. Feel free to use, modify, and distribute this codebase for educational and academic purposes.
