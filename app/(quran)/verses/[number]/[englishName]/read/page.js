'use client'
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Share, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import ShareModal from '../../../../../components/ShareModal';

const CardReader = () => {
  const [currentCard, setCurrentCard] = useState(0);
  
  
  
 const cards = [
    { articleId:'0',
      title: "With every hardship there is ease",
      backgroundImage: "/nature3.jpg",
      content: {
        quote: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all",
        mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
        additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding,"
      }
    },
    { articleId:'1',
      title: "Praise be to God (Alhamd-o-lillah)",
      backgroundImage: "/nature2.jpg",
      content: {
        quote: "When man has an ocean of gratitude for God's innumerable blessings, he spontaneously utters words of praise in universal acknowledgement. This is true Alhamd-o-lillah",
        mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
        additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding,"
      }
    },
    { articleId:'2',
      title: "With every hardship there is ease",
      backgroundImage: "/nature.jpg",
      content: {
        quote: "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all",
        mainText: "The second verse of the Quran is, \"Praise be to God, the Lord of the Universe.\" (1:2) These are words which it takes but a moment to repeat. But if these words have to express true realization of God, their significance is so great that nothing can be greater. That is why, there is a Hadith which has this to say: \"Alham du Lillah, fills up man's balance (of good deeds) or scale of action.\" (Sahih Muslim, Hadith No. 223)",
        additionalText: "When one thinks that the universe came into being fifteen billion years ago, and that it is still expanding,"
      }
    },
    // Add more cards here as needed
  ];
const router = useRouter()
  const params = useParams()
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || "");
  const [showShareModal, setShowShareModal] = useState(false);
  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="min-h-screen bg-[#131313]/50 flex items-end  flex-col p-4">
        <div className="flex  m-2 mb-5  space-x-3 text-white">
            <div className='hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center'><Bookmark className="w-5 h-5 cursor-pointer " /></div>
            <div className='hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center'><Image
                src="/share.svg"
                width={26.1}
                height={19}
                alt="share"
                onClick={() => setShowShareModal(true)}
                className="w-5 h-5 cursor-pointer  "/></div>
            <div onClick={()=>{
              router.push(`/verses/${chapterNumber}/${englishName}/${cards[currentCard].articleId}`)
            }} className='hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center'><Maximize2 className="w-5 h-5 cursor-pointer " /></div>
            <div onClick={()=>{
            router.push(`/verses/${chapterNumber}/${englishName}`)
          }}
          className='hover:bg-hoverclr hover:cursor-pointer rounded-full w-9 h-9 flex items-center justify-center'><X className="w-5 h-5 cursor-pointer " 
          
          /></div>
{showShareModal && <ShareModal/>}
              
              
              
            </div>
            <div className='flex flex-col items-center justify-center w-full'>

            <button
              onClick={prevCard}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
      <div className="w-full max-w-[1258px] max-h-[723px]  bg-white rounded-lg shadow-2xl  relative">
        {/* Header */}
       

        {/* Card Content */}
        <div className="relative">
  {/* Background Image with Overlay */}
  <div className="relative w-full h-64">
    <Image
      src={cards[currentCard].backgroundImage}
      alt={cards[currentCard].title}
      layout="fill"
      objectFit="cover"
      className="rounded-t-lg"
      priority
    />
    {/* Dark overlay for better text readability */}
    {/* <div className="absolute inset-0 bg-black bg-opacity-50"></div> */}

    {/* Title */}
    <div className="absolute bottom-8 left-8 z-10">
      <h2 className="text-3xl font-merriweather font-bold text-white">
        {cards[currentCard].title}
      </h2>
    </div>
  </div>

  {/* Content Section */}
  <div className="p-8 bg-white">
    {/* Quote */}
    <div className="mb-6">
      <p className="text-gray-600 italic font-lato text-lg leading-relaxed">
        {cards[currentCard].content.quote}
      </p>
    </div>

    {/* Main Text */}
    <div className="mb-4">
      <p className="text-gray-800 text-base font-lato leading-relaxed">
        {cards[currentCard].content.mainText}
      </p>
    </div>

    {/* Additional Text */}
    <div>
      <p className="text-gray-800 text-base font-lato leading-relaxed">
        {cards[currentCard].content.additionalText}
      </p>
    </div>
  </div>
</div>

      </div>
    </div>
    <button
              onClick={nextCard}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className='flex flex-col items-center justify-center w-full mt-10'>
             <div className="flex justify-center pb-6">
            <div className="flex space-x-3">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentCard 
                      ? ' bg-white' 
                      : 'bg-text-primary'
                  }`}
                />
              ))}
            </div>
          </div>
            </div>
    </div>
  );
};

export default CardReader;