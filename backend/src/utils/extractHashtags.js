const extractHashtags = (text = '') => {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

module.exports = extractHashtags;
