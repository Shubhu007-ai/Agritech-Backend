const agricultureKeywords = [
  "farming",
  "harvesting",
  "crops",
  "soil",
  "irrigation",
  "seeds",
  "organic",
  "pesticide",
  "tractor",
  "greenhouse",
  "livestock",
  "dairy",
  "agriculture",
  "fertilizer",
  "cultivation",
  "plant",
  "farm",
  "watering",
  "field"
];

module.exports = (req, res, next) => {
  const { title = "", description = "", category = "" } = req.body;

  // Prevent empty content bypass
  if (!title.trim() || !description.trim()) {
    return res.status(400).json({
      message: "Title and description are required."
    });
  }

  const content =
    `${title} ${description} ${category}`.toLowerCase();

  const isRelevant = agricultureKeywords.some(keyword =>
    content.includes(keyword)
  );

  if (!isRelevant) {
    return res.status(400).json({
      message: "Only agriculture-related content is allowed."
    });
  }

  next();
};
