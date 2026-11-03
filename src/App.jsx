import React, { useState } from 'react';
import { GitBranch, Eye, HelpCircle, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { useGame } from './hooks/useGame.js';
import { useSimulation } from './hooks/useSimulation.js';
import { Navbar } from './components/Navbar.jsx';
import { GameBoard } from './components/GameBoard.jsx';
import { GameStatus } from './components/GameStatus.jsx';
import { AIThinkingPanel } from './components/AIThinkingPanel.jsx';
import { SimpleMinimaxExplanation } from './components/SimpleMinimaxExplanation.jsx';
import { DecisionTree } from './components/DecisionTree.jsx';
import { SimulationPanel } from './components/SimulationPanel.jsx';
import { ExplanationPanel } from './components/ExplanationPanel.jsx';
import { StatisticsPanel } from './components/StatisticsPanel.jsx';
import { PresentationMode } from './components/PresentationMode.jsx';
import { AIThinkingModal } from './components/AIThinkingModal.jsx';
import { RobotCompanionPanel } from './components/Robot/RobotCompanionPanel.jsx';
import { RobotAudio } from './components/Robot/RobotVoice.js';
import { Confetti } from './components/Confetti.jsx';
import { WelcomeModal } from './components/WelcomeModal.jsx';
import { ForegroundGameWindow } from './components/ForegroundGameWindow.jsx';

import './styles/global.css';
import './styles/dashboard.css';
import './styles/game.css';
import './styles/decisionTree.css';
import './styles/simulation.css';
import './styles/modal.css';
import './styles/welcomeModal.css';
import './styles/foregroundWindow.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('simple'); // 'simple' | 'candidates' | 'tree' | 'stats'
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [selectedCandidateMove, setSelectedCandidateMove] = useState(null);

  const game = useGame();
  const simulation = useSimulation(game.aiAnalysis?.traceSteps || []);

  // Welcome screen / Player name entry modal state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => !game.playerName);
  // Foreground Game Arena window state (open by default, can be minimized to inspect background lab)
  const [isForegroundOpen, setIsForegroundOpen] = useState(true);

  const handleResetAll = () => {
    RobotAudio.stopSpeaking();
    game.resetGame();
    simulation.reset();
    setSelectedCandidateMove(null);
  };

  const handleStartGame = (name) => {
    game.setPlayerName(name);
    setIsWelcomeOpen(false);
    setIsForegroundOpen(true);
    // Cheerful greeting matching the welcome modal
    const greeting = `Yayyy! Nice to meet you, ${name}! Let's play! 🤖✨`;
    game.setRobotDialogue(greeting);
    game.setRobotExpression('excited');
  };

  const handleChangePlayerName = () => {
    setIsWelcomeOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Futuristic Command Navigation */}
      <Navbar
        onReset={handleResetAll}
        isPresentationMode={isPresentationMode}
        onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
        isAITurn={game.isAITurn}
        gameStatus={game.gameStatus}
        playerName={game.playerName}
        isForegroundOpen={isForegroundOpen}
        onOpenGameArena={() => setIsForegroundOpen(true)}
      />

      {/* Main Command Centre Workspace (Visible behind foreground window with dimmed backdrop) */}
      <main className="main-workspace">
        {/* Top Split: Game Board & AI Thinking Engine */}
        <div className="dashboard-grid-top">
          {/* Left Panel: Interactive Tic-Tac-Toe Game */}
          <section className="cyber-panel" aria-label="Tic-Tac-Toe Match Panel">
            <div className="panel-header">
              <div className="panel-title">
                <ShieldCheck size={18} style={{ color: 'var(--accent-blue-bright)' }} />
                <span>INTERACTIVE TIC-TAC-TOE MATRIX</span>
              </div>
              <div className="badge badge-blue">
                PLAYING AS {game.humanPlayer}
              </div>
            </div>

            <div className="panel-body">
              <GameBoard
                board={game.board}
                onCellClick={game.handleCellClick}
                disabled={
                  game.currentTurn !== game.humanPlayer ||
                  game.isAIThinking ||
                  game.gameStatus === 'AI_THINKING' ||
                  game.gameStatus === 'WON' ||
                  game.gameStatus === 'DRAW'
                }
                winningLine={game.winningLine}
                aiPreviewMove={game.aiAnalysis?.bestMove}
                humanPlayer={game.humanPlayer}
                aiPlayer={game.aiPlayer}
                drawingCell={game.drawingCell}
                drawingSymbol={game.drawingSymbol}
                aiTargetCell={game.aiTargetCell}
                isForcedSelecting={game.isForcedSelecting}
                pendingForcedCell={game.pendingForcedCell}
                onSelectForcedCell={game.handleSelectForcedCell}
              />

              <GameStatus
                humanPlayer={game.humanPlayer}
                aiPlayer={game.aiPlayer}
                currentTurn={game.currentTurn}
                firstPlayer={game.firstPlayer}
                gameStatus={game.gameStatus}
                winner={game.winner}
                onReset={game.resetGame}
                onChangeHumanPlayer={game.changeHumanPlayer}
                onChangeFirstPlayer={game.changeFirstPlayer}
                onApplyAIMove={game.applyBestMove}
                onOpenModal={() => game.setIsAnalysisModalOpen(true)}
                autoApplyAIMove={game.autoExecuteModal}
                setAutoApplyAIMove={game.setAutoExecuteModal}
                isAITurn={game.isAITurn}
              />
            </div>
          </section>

          {/* Middle Panel: MINI AI Robot Companion */}
          <section aria-label="MINI AI Opponent Companion">
            <RobotCompanionPanel
              gameStatus={game.gameStatus}
              currentTurn={game.currentTurn}
              aiPlayer={game.aiPlayer}
              humanPlayer={game.humanPlayer}
              winner={game.winner}
              lastHumanMove={game.moveHistory[game.moveHistory.length - 1]}
              onOpenAnalysisModal={() => game.setIsAnalysisModalOpen(true)}
              playerName={game.playerName}
              robotExpression={game.robotExpression}
              robotDialogue={game.robotDialogue}
              voiceEnabled={game.voiceEnabled}
              onToggleVoice={game.handleToggleVoice}
              sfxEnabled={game.sfxEnabled}
              onToggleSfx={game.handleToggleSfx}
              onRobotClick={game.handleRobotClick}
              robotLookDirection={game.robotLookDirection}
            />
          </section>

          {/* Right Panel: AI Thinking Process & Telemetry */}
          <section aria-label="AI Thinking Engine Telemetry">
            <AIThinkingPanel
              aiAnalysis={game.aiAnalysis}
              gameStatus={game.gameStatus}
              aiPlayer={game.aiPlayer}
              currentTraceStep={simulation.currentStep}
              simulationStats={game.aiAnalysis?.stats}
              onOpenModal={() => game.setIsAnalysisModalOpen(true)}
            />
          </section>
        </div>

        {/* Bottom Section: Tabs for Decision Tree, Simulation, Explanation, Statistics */}
        <section className="cyber-panel" style={{ padding: '20px' }}>
          {/* Tab Navigation */}
          <div className="bottom-section-tabs">
            <button
              className={`tab-btn ${activeTab === 'simple' ? 'active' : ''}`}
              onClick={() => setActiveTab('simple')}
            >
              <Sparkles size={16} />
              🌟 3-Step Seminar Explanation
            </button>

            <button
              className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
              onClick={() => setActiveTab('candidates')}
            >
              <Eye size={16} />
              Board-by-Board Simulation ({game.aiAnalysis?.candidateMoves?.length || 0})
            </button>

            <button
              className={`tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
              onClick={() => setActiveTab('tree')}
            >
              <GitBranch size={16} />
              🔬 Technical Decision Tree (Optional)
            </button>

            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <BarChart3 size={16} />
              Simulation Statistics
            </button>
          </div>

          {/* Tab Content Panels */}
          <div style={{ marginTop: '20px' }}>
            {activeTab === 'simple' && (
              <SimpleMinimaxExplanation
                board={game.board}
                aiAnalysis={game.aiAnalysis}
                aiPlayer={game.aiPlayer}
                humanPlayer={game.humanPlayer}
                onExecuteMove={game.isAITurn ? game.applyBestMove : undefined}
              />
            )}

            {activeTab === 'candidates' && (
              <SimulationPanel
                candidateMoves={game.aiAnalysis?.candidateMoves || []}
                bestMove={game.aiAnalysis?.bestMove}
                currentBoard={game.board}
                onSelectCandidate={(cand) => setSelectedCandidateMove(cand.move)}
                selectedMoveIndex={selectedCandidateMove}
                simulationControls={simulation}
                aiPlayer={game.aiPlayer}
              />
            )}

            {activeTab === 'tree' && (
              <DecisionTree
                rootNode={game.aiAnalysis?.treeData}
                activeStepNodeId={simulation.currentStep?.nodeId}
                aiPlayer={game.aiPlayer}
              />
            )}

            {activeTab === 'stats' && (
              <StatisticsPanel
                aiAnalysis={game.aiAnalysis}
                aiPlayer={game.aiPlayer}
              />
            )}
          </div>
        </section>
      </main>

      {/* =====================================================================
          1. WELCOME / PLAYER NAME ENTRY MODAL
          Greets the player and personalizes the session with their name
          ===================================================================== */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onStartGame={handleStartGame}
        initialName={game.playerName}
      />

      {/* =====================================================================
          2. FOREGROUND FLOATING GAME WINDOW WITH OVERLAPPING MINI
          Large centered gaming window with dimmed background, scoreboard,
          direct Minimax move execution & overlapping robot companion.
          ===================================================================== */}
      {!isWelcomeOpen && isForegroundOpen && (
        <ForegroundGameWindow
          isOpen={isForegroundOpen}
          onToggleMinimize={() => setIsForegroundOpen(false)}
          playerName={game.playerName}
          onChangePlayerName={handleChangePlayerName}
          board={game.board}
          onCellClick={game.handleCellClick}
          disabled={
            game.currentTurn !== game.humanPlayer ||
            game.isAIThinking ||
            game.gameStatus === 'AI_THINKING' ||
            game.gameStatus === 'WON' ||
            game.gameStatus === 'DRAW'
          }
          winningLine={game.winningLine}
          aiPreviewMove={game.aiAnalysis?.bestMove}
          humanPlayer={game.humanPlayer}
          aiPlayer={game.aiPlayer}
          firstPlayer={game.firstPlayer}
          currentTurn={game.currentTurn}
          gameStatus={game.gameStatus}
          winner={game.winner}
          scores={game.scores}
          onReset={game.resetGame}
          onChangeHumanPlayer={game.changeHumanPlayer}
          onChangeFirstPlayer={game.changeFirstPlayer}
          onOpenMinimaxModal={() => game.setIsAnalysisModalOpen(true)}
          robotExpression={game.robotExpression}
          robotDialogue={game.robotDialogue}
          voiceEnabled={game.voiceEnabled}
          onToggleVoice={game.handleToggleVoice}
          sfxEnabled={game.sfxEnabled}
          onToggleSfx={game.handleToggleSfx}
          onRobotClick={game.handleRobotClick}
          isAIThinking={game.isAIThinking}
          aiTargetCell={game.aiTargetCell}
          drawingCell={game.drawingCell}
          drawingSymbol={game.drawingSymbol}
          isReachingCell={game.isReachingCell}
          robotLookDirection={game.robotLookDirection}
          // Two AI Play Modes & Forced Move
          aiPlayMode={game.aiPlayMode}
          onChangeAiPlayMode={game.setAiPlayMode}
          isForcedSelecting={game.isForcedSelecting}
          pendingForcedCell={game.pendingForcedCell}
          lastMoveDetails={game.lastMoveDetails}
          onSelectForcedCell={game.handleSelectForcedCell}
          onConfirmForcedMove={game.confirmPendingForcedMove}
          onCancelForcedMove={game.cancelPendingForcedMove}
          aiAnalysis={game.aiAnalysis}
        />
      )}

      {/* Playful Confetti Celebration on Win */}
      <Confetti active={game.gameStatus === 'WON'} />

      {/* 7-Stage Walkthrough AI Decision Pop-up Modal */}
      <AIThinkingModal
        isOpen={game.isAnalysisModalOpen}
        onClose={() => game.setIsAnalysisModalOpen(false)}
        board={game.board}
        aiAnalysis={game.aiAnalysis}
        aiPlayer={game.aiPlayer}
        humanPlayer={game.humanPlayer}
        onExecuteMove={game.applyBestMove}
        autoExecute={game.autoExecuteModal}
        onToggleAutoExecute={game.setAutoExecuteModal}
      />

      {/* Fullscreen Presentation Mode for Seminar / Projector */}
      {isPresentationMode && (
        <PresentationMode
          onClose={() => setIsPresentationMode(false)}
          board={game.board}
          onCellClick={game.handleCellClick}
          disabled={
            game.currentTurn !== game.humanPlayer ||
            game.isAIThinking ||
            game.gameStatus === 'AI_THINKING' ||
            game.gameStatus === 'WON' ||
            game.gameStatus === 'DRAW'
          }
          winningLine={game.winningLine}
          aiAnalysis={game.aiAnalysis}
          aiPlayer={game.aiPlayer}
          humanPlayer={game.humanPlayer}
          currentTurn={game.currentTurn}
          gameStatus={game.gameStatus}
          onApplyAIMove={game.applyBestMove}
          onOpenModal={() => game.setIsAnalysisModalOpen(true)}
          simulationControls={simulation}
          onReset={handleResetAll}
          drawingCell={game.drawingCell}
          drawingSymbol={game.drawingSymbol}
          aiTargetCell={game.aiTargetCell}
          aiPlayMode={game.aiPlayMode}
          onChangeAiPlayMode={game.setAiPlayMode}
          isForcedSelecting={game.isForcedSelecting}
          pendingForcedCell={game.pendingForcedCell}
          lastMoveDetails={game.lastMoveDetails}
          onSelectForcedCell={game.handleSelectForcedCell}
          onConfirmForcedMove={game.confirmPendingForcedMove}
          onCancelForcedMove={game.cancelPendingForcedMove}
        />
      )}
    </div>
  );
}
