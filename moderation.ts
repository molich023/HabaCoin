export const HabaRules = {
  forbiddenPatterns: [
    /porn|sex|xxx|naked/i,
    /vulgarslang1|vulgarslang2/i, // Add your list here
    /scam|invest|doubleyourmoney/i
  ],
  
  validate: (text: string): boolean => {
    return !HabaRules.forbiddenPatterns.some(pattern => pattern.test(text));
  }
};
async function sendMessage(text: string) {
    if (!HabaRules.validate(text)) {
        alert("Message contains restricted content. Keep the hustle clean!");
        return;
    }
    
    // If safe, encrypt and send to Matrix
    await matrixClient.sendTextMessage(roomId, text);
}

