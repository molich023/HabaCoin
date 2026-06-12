/**
 * HabaCoin Global Community Chat Moderation Engine
 * Enforces a clean, constructive environment for the Ubuntu Token ($UBUNTU) ecosystem
 */
export const HabaRules = {
  forbiddenPatterns: [
    /porn|sex|xxx|naked/i,
    /vulgarslang1|vulgarslang2/i, 
    /scam|invest|doubleyourmoney|freecrypto/i
  ],
  
  /**
   * Validates incoming chat text strings against forbidden patterns
   */
  validate: (text: string): boolean => {
    return !HabaRules.forbiddenPatterns.some(pattern => pattern.test(text));
  }
};

/**
 * Validates, filters, and dispatches encrypted text chunks to the network matrix
 */
async function sendMessage(text: string, roomId: string, matrixClient: any) {
  if (!HabaRules.validate(text)) {
    alert("Message contains restricted content. Keep the Ubuntu community hustle clean!");
    return;
  }
  
  // Clear validation checkpoint: Encrypt and route to decentralised matrix nodes
  await matrixClient.sendTextMessage(roomId, text);
}
