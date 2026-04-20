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
