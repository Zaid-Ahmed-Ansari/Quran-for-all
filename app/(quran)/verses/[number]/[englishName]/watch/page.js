'use client'
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Share, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

const LongVideos = () => {
  const [currentCard, setCurrentCard] = useState(0);
  
  const cards = [
    {
      title: "With every hardship there is ease",
      videoUrl: "https://www.youtube.com/embed/Rv6AjEFe6MI?si=gbAZ8XliOYhx6jGJ"
    },
    {
      title: "Praise be to God (Alhamd-o-lillah)",
      videoUrl: "https://www.youtube.com/embed/2ofXb60tibU?si=I9FDUZ8qghhnxRD7"
    },
    
    // Add more cards here as needed
  ];
const router = useRouter()
  const params = useParams()
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || "");
  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="min-h-screen bg-[#13131380] flex items-end  flex-col p-4">
        <div className="flex  m-2 mb-5  space-x-3 text-white">
            <div className='hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center'><Bookmark className="w-5 h-5 cursor-pointer " /></div>
            <div className='hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center'><Image
                src="/share.svg"
                width={26.1}
                height={19}
                alt="speaker"
                className="w-5 h-5 cursor-pointer  "/></div>
            
            <div onClick={()=>{
                        router.push(`/verses/${chapterNumber}/${englishName}`)
                      }} className='hover:bg-hoverclr hover:cursor-pointer rounded-full w-9 h-9 flex items-center justify-center'><X className="w-5 h-5 cursor-pointer " 
                      
                      /></div>
        </div>
        
        <div className='flex flex-col items-center justify-center w-full'>
            <button
              onClick={prevCard}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <div className="w-full max-w-[1258px] max-h-[723px]   relative">
                {/* YouTube Iframe */}
                <div className="w-full h-full flex items-center justify-center p-4">
                    <iframe 
                        width="100%" 
                        height="480" 
                        src={cards[currentCard].videoUrl}
                        title="YouTube video player" 
                        
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                       
                    />
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
    </div>
  );
};

export default LongVideos;