"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share,
  Maximize2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

const LongVideos = () => {
  const [isSpotify, setIsSpotify] = useState(true);
  const [currentCard, setCurrentCard] = useState(0);

  const cards = [
    {
      title: "With every hardship there is ease",
      spotifyUrl:
        "https://open.spotify.com/embed/show/24qgbEnXSfIHLp4RQYp9aQ?utm_source=generator",
      soundcloudUrl:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1161725383&color=%23b3b3b3&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
    },
    {
      title: "Praise be to God (Alhamd-o-lillah)",
      spotifyUrl:
        "https://open.spotify.com/embed/show/2dp9T8xG3t8ufFvzCKgl0f?utm_source=generator",
      soundcloudUrl:
        "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1165108159&color=%23b3b3b3&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
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
        <div className="hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center">
          <Bookmark className="w-5 h-5 cursor-pointer " />
        </div>
        <div className="hover:bg-hoverclr rounded-full w-9 h-9 flex items-center justify-center">
          <Image
            src="/share.svg"
            width={26.1}
            height={19}
            alt="speaker"
            className="w-5 h-5 cursor-pointer  "
          />
        </div>

        <div onClick={()=>{
            router.push(`/verses/${chapterNumber}/${englishName}`)
          }} className="hover:bg-hoverclr  hover:cursor-pointer rounded-full w-9 h-9 flex items-center justify-center">
          <X className="w-5 h-5 cursor-pointer " 
          
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        <button
          onClick={prevCard}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="w-full flex flex-col max-w-[1088px]    relative">
          <div className="">
            <div className="w-full h-full flex items-center mt-30 justify-center pt-4">
              {isSpotify && (
                <iframe
                  src={cards[currentCard].spotifyUrl}
                  width="100%"
                  height="248"
                  
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              )}
            </div>
            <div className="w-full h-full pb-5 ">
              {!isSpotify && (
              <iframe
                width="100%"
                height="248"
                allow="autoplay"
                src={cards[currentCard].soundcloudUrl}
                loading="lazy"
                className=" "
              ></iframe>
            )}
            </div>
            
          </div>
          <div className="flex items-end justify-end gap-2 w-full ">
            <button
              onClick={() => setIsSpotify(true)}
              className={`px-4 rounded-full py-2 font-lato font-bold flex gap-2  ${
                isSpotify
                  ? "bg-[#12C64B] text-white"
                  : "bg-[#A6A6A6]/50 text-[#A6A6A6]"
              }`}
            >
              
              <Image 
              src='/spotify.svg'
              width={27}
              height={27}
              /> SPOTIFY
            </button>
            <button
              onClick={() => setIsSpotify(false)}
              className={`px-4 font-bold flex gap-2 font-lato py-2 rounded-full ${
                !isSpotify
                  ? "bg-[#ED6D2D] text-white"
                  : "bg-[#A6A6A6]/50 text-[#A6A6A6]"
              }`}
            >
              <Image
                src='/soundcloud.svg'
                width={27}
                height={27}
              />
              SOUNDCLOUD
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={nextCard}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="flex flex-col items-center justify-center w-full mt-10">
        <div className="flex justify-center pb-6">
          <div className="flex space-x-3">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentCard ? " bg-white" : "bg-text-primary"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongVideos;
