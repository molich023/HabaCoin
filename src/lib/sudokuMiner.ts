export class SudokuMiner {
  private startTime: number;
  private moveLog: { timestamp: number, cell: number }[] = [];

  constructor() {
    this.startTime = Date.now();
  }

  // Record every digit entered to analyze "Human Rhythm"
  recordMove(cellIndex: number) {
    this.moveLog.push({ timestamp: Date.now(), cell: cellIndex });
  }

  async validateAndClaimReward(board: number[][], difficulty: string) {
    const totalTime = (Date.now() - this.startTime) / 1000; // in seconds

    // --- SECURITY CHECKS ---
    // 1. Human Speed Check: No human solves an Expert Sudoku in < 120 seconds.
    if (difficulty === 'EXPERT' && totalTime < 120) {
      return { success: false, reason: "Inhuman Speed Detected (Possible Bot)" };
    }

    // 2. Rhythm Check: Bots fill cells at perfect intervals (e.g., exactly every 100ms)
    const intervals = this.moveLog.map((m, i, arr) => i > 0 ? m.timestamp - arr[i-1].timestamp : 0);
    const isBotRhythm = new Set(intervals).size < 5; // Too consistent = Bot
    if (isBotRhythm && this.moveLog.length > 20) {
      return { success: false, reason: "Pattern Injection Detected" };
    }

    // 3. Oracle Verification: Send to Neon DB for payout
    const response = await fetch('/api/claim-sudoku-reward', {
      method: 'POST',
      body: JSON.stringify({ 
        timeTaken: totalTime, 
        difficulty,
        log: this.moveLog 
      })
    });

    return await response.json();
  }
}
