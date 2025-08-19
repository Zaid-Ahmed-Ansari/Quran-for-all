'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Share, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import ShareModal from '../../../../../components/ShareModal';
import { articles } from '../../../../../helpers/articles';
import ShortArticle from '../../../../../components/ShortArticle';

const CardReader = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const router = useRouter();
  const params = useParams();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || "");
  const [showShareModal, setShowShareModal] = useState(false);

  const cards = articles.map(article => ({
    ...article,
    link: article.link(chapterNumber, englishName),
  }));
  
  // Set currentCard from query param on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const articleIndex = searchParams.get('article');
      if (articleIndex && !isNaN(Number(articleIndex))) {
        setCurrentCard(Number(articleIndex));
      }
    }
  }, []);

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
              router.push(cards[currentCard].link)
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
            {/* Conditionally render ShortArticle or the long article card */}
            {cards[currentCard].isShort ? (
              <ShortArticle
                backgroundImage={cards[currentCard].image}
                title={cards[currentCard].title}
                quote={cards[currentCard].content.quote}
                quoteReference={cards[currentCard].content.quranVerse}
                content={cards[currentCard].content.mainText}
                source={cards[currentCard].content.source}
              />
            ) : (
              <div className="w-full max-w-[1258px] max-h-[723px]  bg-white rounded-lg shadow-2xl  relative">
                <div className="relative">
                  <div className="relative w-full h-64">
                    <Image
                      src={cards[currentCard].image}
                      alt={cards[currentCard].title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      priority
                    />
                    <div className="absolute bottom-8 left-8 z-10">
                      <h2 className="text-3xl font-merriweather font-bold text-white">
                        {cards[currentCard].title}
                      </h2>
                    </div>
                  </div>
                  <div className="p-8 bg-white">
                    <div className="mb-6">
                      <p className="text-gray-600 italic font-lato text-lg leading-relaxed">
                        {cards[currentCard].content.quote}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-800 text-base font-lato leading-relaxed">
                        {cards[currentCard].content.mainText}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-800 text-base font-lato leading-relaxed">
                        {cards[currentCard].content.additionalText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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


{/* <div className="w-full max-w-[1258px] max-h-[723px]  bg-white rounded-lg shadow-2xl  relative">
       
       

        
        <div className="relative">
  
  <div className="relative w-full h-64">
    <Image
      src={cards[currentCard].backgroundImage}
      alt={cards[currentCard].title}
      layout="fill"
      objectFit="cover"
      className="rounded-t-lg"
      priority
    />
    
    

    
    <div className="absolute bottom-8 left-8 z-10">
      <h2 className="text-3xl font-merriweather font-bold text-white">
        {cards[currentCard].title}
      </h2>
    </div>
  </div>

  
  <div className="p-8 bg-white">
    
    <div className="mb-6">
      <p className="text-gray-600 italic font-lato text-lg leading-relaxed">
        {cards[currentCard].content.quote}
      </p>
    </div>

   
    <div className="mb-4">
      <p className="text-gray-800 text-base font-lato leading-relaxed">
        {cards[currentCard].content.mainText}
      </p>
    </div>

    
    <div>
      <p className="text-gray-800 text-base font-lato leading-relaxed">
        {cards[currentCard].content.additionalText}
      </p>
    </div>
  </div>
</div>

      </div> */}