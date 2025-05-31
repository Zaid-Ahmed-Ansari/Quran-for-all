"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronLeftCircle,
  ChevronRightCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function ContentTabs() {
  const params = useParams();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || "");
  const [activeTab, setActiveTab] = useState("read");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const contentData = {
    read: [
      {
        title: "With every hardship there is ease",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature.jpg"
      },
      {
        title: "Praise be to God (Alhamd-o-lillah)",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link:`/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature2.jpg"
      },
      {
        title: "With every ha",
        excerpt:
          "The Quran introduces God as  community or group. He is the God of all...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature3.jpg"
      },
      {
        title: "Praise be to God (Alhamd-o-lillah)",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature.jpg"
      },
      {
        title: "With every hardship there is ease",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature2.jpg"
      },
      {
        title: "Praise be to God (Alhamd-o-lillah)",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature3.jpg"
      },
      
    ],
    watch: [
      {
        title: "Video Content 1",
        excerpt: "Sample video content description...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature.jpg"
      },
       {
        title: "Video Content 1",
        excerpt: "Sample video content description...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature2.jpg"
      },
    ],
    listen: [
      {
        title: "Audio Content 1",
        excerpt: "Sample audio content description...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature3.jpg"
      },
      {
        title: "Audio Content 1",
        excerpt: "Sample audio content description...",
        link: `/verses/${chapterNumber}/${englishName}/${activeTab}`,
        image: "/nature.jpg"
      },
    ],
  };

  const cards = contentData[activeTab];
  const cardsPerPage = 2;
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Reset current index to 0 whenever tab changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const startIndex = currentPage * cardsPerPage;
  const visibleCards = cards.slice(startIndex, startIndex + cardsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-4 mt-10">
      {/* Tabs */}
      <div className="flex w-full border-b border-gray-200 mb-8">
        <button
          className={`py-2 px-4 flex-1 flex items-center justify-center gap-2 font-medium text-lg capitalize ${
            activeTab === "read"
              ? "text-hoverclr border-b-2 border-hoverclr"
              : "text-text-primary hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("read")}
        >
          <Image src="/Book.svg" width={19} height={19} alt="Book" />
          Read
        </button>

        <button
          className={`py-2 px-4 flex-1 flex items-center justify-center gap-2 font-medium text-lg capitalize ${
            activeTab === "watch"
              ? "text-hoverclr border-b-2 border-hoverclr"
              : "text-text-primary hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("watch")}
        >
          <Image src="/watch.svg" width={19} height={19} alt="watch" />
          Watch
        </button>

        <button
          className={`py-2 px-4 flex-1 flex items-center justify-center gap-2 font-medium text-lg capitalize ${
            activeTab === "listen"
              ? "text-hoverclr border-b-2 border-hoverclr"
              : "text-text-primary hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("listen")}
        >
          <Image src="/speaker.svg" width={19} height={19} alt="speaker" />
          Listen
        </button>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center gap-4">
        {/* Left arrow */}
        <button
          onClick={prevPage}
          className="p-2  rounded-full text-[#DCE0E3] hover:text-black transition"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Cards container */}
        <div className="flex flex-1 gap-6">
          {visibleCards.map((card, index) => (

            <div
              key={startIndex + index}
              className="group flex-1 h-[532px] rounded-[12px] relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
            <Link
              href={card.link}
              className="absolute inset-0 bg-cover bg-center">
              {/* Background image */}
              <div
                className="absolute hover:cursor-pointer inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage:`url(${card.image})`,
                  
                }}
                ></div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300"></div>

              {/* Text content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold font-lato mb-2 decoration-2 underline-offset-4">
                  {card.title}
                </h3>
                <p className="text-gray-200 mb-4 font-lato">{card.excerpt}</p>
                <a
                  href={card.link}
                  className="inline-flex items-center font-lato font-semibold group-hover:text-white px-3 py-1.5 rounded transition-all duration-300 border-b-2 w-fit"
                >
                  READ MORE
                  <span className="ml-2 font-lato group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </a>
              </div>
                  </Link>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={nextPage}
          className="p-2 text-[#DCE0E3] hover:text-black transition"
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`w-3 h-3 rounded-full bg-white border  ${
              currentPage === idx ? "border-black border" : "border border-[#DCE0E3] "
            }`}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Pagination and Chapter navigation */}
     
    </div>
  );}