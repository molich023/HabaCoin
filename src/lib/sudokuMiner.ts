interface InputLog {
  timestamp: number;
  cell: number;
}

export class SudokuMiner {
  private startTime: number;
  private moveLog: InputLog[] = [];

  constructor() {
    this.startTime = Date.now();
  }

  public recordMove(cellIndex: number): void {
    // Defense against client memory freezes: bound log tracking lengths
    if (this.moveLog.length < 200) {
      this.moveLog.push({ timestamp: Date.now(), cell: cellIndex });
    }
  }

  public async validateAndClaimReward(board: number[][], difficulty: string, secretHandshakeToken: string) {
    const totalTimeElapsedSeconds = (Date.now() - this.startTime) / 1000;

    // Structural sanitization prior to routing payloads
    if (this.moveLog.length === 0) {
      return { success: false, reason: "Invalid execution footprint: Empty user telemetry log." };
    }

    try {
      // Securely stream raw telemetry directly to the backend gatekeeper for deep validation
      const response = await fetch('/api/claim-sudoku-reward', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          timeTaken: totalTimeElapsedSeconds, 
          difficulty: difficulty.toUpperCase(),
          log: this.moveLog,
          boardSignature: board.flat().slice(0, 10), // Verify board consistency
          handshakeToken: secretHandshakeToken // Binds API route calls to an active session challenge
        })
      });

      if (!response.ok) {
        return { success: false, reason: `Server returned validation error status: ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      return { success: false, reason: "Internal sync error occurred during network transit." };
    }
  }
}
