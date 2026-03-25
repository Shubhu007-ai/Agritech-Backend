const moderateContent = async (text) => {
  const bannedWords = ["movie", "gaming", "politics", "crypto"];

  const lowerText = text.toLowerCase();

  const flagged = bannedWords.some(word =>
    lowerText.includes(word)
  );

  return flagged;
};

module.exports = moderateContent;
