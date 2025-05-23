'use client'
import { useParams } from 'next/navigation';
import React from 'react'

const page = () => {
  const params = useParams()
  const article = Number(params.articleId)
   const cards = [
    { articleId:'0',
      title: "With every hardship there is ease",
      backgroundImage: "/api/placeholder/800/300",
      content: {
        quote: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all",
        mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
        additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding, one finds this extremely frightening. Then, when man thinks about his own creation, he finds that his existence is a miracle, no part of which can be reproduced, however minute.",
        moreText: "Then man thinks about how God sends him light and heat from the sun in the space and has provided him a continuous supply of oxygen through the air. The earth gives him a variety of produce. It also gives him stability through the force of gravity. In fact, a complete life support system has been established for his special benefit. ",
        endText: "Thinking upon these things man feels that he owes oceans of gratitude to God. It is as if his soul has been engulfed by a huge divine storm, which has had a thrilling effect upon his mind. When man experiences these indescribably godly feelings, he spontaneously utters words of praise in universal acknowledgement. This is true gratitude to God. It is these feelings of praise to God which have been expressed thus in the Quran: “Praise be to God, the Lord of the Universe.” (1:2)",
        source: 'Love of God,pp.21-22',
        quranVerse: "1:2",
        hadithReference: "Sahih Muslim,Hadith No.223"
      }
    },
    { articleId:'1',
      title: "With every hardship there is ease",
      backgroundImage: "/api/placeholder/800/300",
      content: {
        quote: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all",
        mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
        additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding, one finds this extremely frightening. Then, when man thinks about his own creation, he finds that his existence is a miracle, no part of which can be reproduced, however minute.",
        moreText: "Then man thinks about how God sends him light and heat from the sun in the space and has provided him a continuous supply of oxygen through the air. The earth gives him a variety of produce. It also gives him stability through the force of gravity. In fact, a complete life support system has been established for his special benefit. ",
        endText: "Thinking upon these things man feels that he owes oceans of gratitude to God. It is as if his soul has been engulfed by a huge divine storm, which has had a thrilling effect upon his mind. When man experiences these indescribably godly feelings, he spontaneously utters words of praise in universal acknowledgement. This is true gratitude to God. It is these feelings of praise to God which have been expressed thus in the Quran: “Praise be to God, the Lord of the Universe.” (1:2)",
        source: 'Love of God,pp.21-22',
        quranVerse: "1:2",
        hadithReference: "Sahih Muslim,Hadith No.223"
      }
    },
    { articleId:'2',
      title: "With every hardship there is ease",
      backgroundImage: "/api/placeholder/800/300",
      content: {
        quote: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all",
        mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
        additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding, one finds this extremely frightening. Then, when man thinks about his own creation, he finds that his existence is a miracle, no part of which can be reproduced, however minute.",
        moreText: "Then man thinks about how God sends him light and heat from the sun in the space and has provided him a continuous supply of oxygen through the air. The earth gives him a variety of produce. It also gives him stability through the force of gravity. In fact, a complete life support system has been established for his special benefit. ",
        endText: "Thinking upon these things man feels that he owes oceans of gratitude to God. It is as if his soul has been engulfed by a huge divine storm, which has had a thrilling effect upon his mind. When man experiences these indescribably godly feelings, he spontaneously utters words of praise in universal acknowledgement. This is true gratitude to God. It is these feelings of praise to God which have been expressed thus in the Quran: “Praise be to God, the Lord of the Universe.” (1:2)",
        source: 'Love of God,pp.21-22',
        quranVerse: "1:2",
        hadithReference: "Sahih Muslim,Hadith No.223"
        
      }
    },
    // Add more cards here as needed
  ];
  return (
    <div className='flex felx-col justify-center w-full ' >
     <div className="w-full max-w-3xl mx-auto mt-[30px] px-4 text-text-primary font-lato">
      <p>

      {cards[article].content.mainText}
      </p>
      <p className='mt-10'>
      {cards[article].content.additionalText}

      </p>
      <p className='mt-10'>

      {cards[article].content.moreText}
      </p>
      <p className='mt-10'> {cards[article].content.endText}</p>
      
      <div className='mt-10 '>
        <p className='mb-2'>Source: <span className='text-hoverclr'>{cards[article].content.source}</span></p> 
        <p className='mb-2'>Quran Verses: <span className='text-hoverclr'>{cards[article].content.quranVerse}</span></p>
        <p>Hadith Reference: <span className='text-hoverclr'>{cards[article].content.hadithReference}</span></p>
      </div>
      </div>
      </div>
  )
}

export default page
