// Centralized articles data for the app
// Each article should have: id, title, excerpt, image, link, isShort, and content fields

export const articles = [
  {
    id: '0',
    title: "With every hardship there is ease",
    excerpt: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
    image: "/nature3.jpg",
    link: (chapterNumber, englishName) => `/verses/${chapterNumber}/${englishName}/0`,
    isShort: true,
    content: {
      quote: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all",
      mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
      additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding,",
      moreText: "Then man thinks about how God sends him light and heat from the sun in the space and has provided him a continuous supply of oxygen through the air. The earth gives him a variety of produce. It also gives him stability through the force of gravity. In fact, a complete life support system has been established for his special benefit.",
      endText: "Thinking upon these things man feels that he owes oceans of gratitude to God. It is as if his soul has been engulfed by a huge divine storm, which has had a thrilling effect upon his mind. When man experiences these indescribably godly feelings, he spontaneously utters words of praise in universal acknowledgement. This is true gratitude to God. It is these feelings of praise to God which have been expressed thus in the Quran: “Praise be to God, the Lord of the Universe.” (1:2)",
      source: 'Love of God,pp.21-22',
      quranVerse: "1:2",
      hadithReference: "Sahih Muslim,Hadith No.223"
    }
  },
  {
    id: '1',
    title: "Praise be to God (Alhamd-o-lillah)",
    excerpt: "When man has an ocean of gratitude for God's innumerable blessings, he spontaneously utters words of praise in universal acknowledgement. This is true Alhamd-o-lillah...",
    image: "/nature2.jpg",
    link: (chapterNumber, englishName) => `/verses/${chapterNumber}/${englishName}/1`,
    isShort: false,
    content: {
      quote: "When man has an ocean of gratitude for God's innumerable blessings, he spontaneously utters words of praise in universal acknowledgement. This is true Alhamd-o-lillah",
      mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
      additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding,",
      moreText: "Then man thinks about how God sends him light and heat from the sun in the space and has provided him a continuous supply of oxygen through the air. The earth gives him a variety of produce. It also gives him stability through the force of gravity. In fact, a complete life support system has been established for his special benefit.",
      endText: "Thinking upon these things man feels that he owes oceans of gratitude to God. It is as if his soul has been engulfed by a huge divine storm, which has had a thrilling effect upon his mind. When man experiences these indescribably godly feelings, he spontaneously utters words of praise in universal acknowledgement. This is true gratitude to God. It is these feelings of praise to God which have been expressed thus in the Quran: “Praise be to God, the Lord of the Universe.” (1:2)",
      source: 'Love of God,pp.21-22',
      quranVerse: "1:2",
      hadithReference: "Sahih Muslim,Hadith No.223"
    }
  },
  // Add more articles as needed, following the same structure
]; 