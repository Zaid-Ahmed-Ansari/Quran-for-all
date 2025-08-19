"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronLeftCircle,
  ChevronRightCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { articles } from "../helpers/articles";

export default function ContentTabs() {
  const params = useParams();
  const router = useRouter();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || "");
  const [activeTab, setActiveTab] = useState("read");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);



  // Preview cards for 'watch' and 'listen' tabs (two each)
  const videoPreviews = [
    {
      title: "Watch Quranic Videos",
      image: "/nature3.jpg",
      description: "Explore Quranic wisdom through curated video content.",
      route: `/verses/${chapterNumber}/${englishName}/watch`,
      cta: "WATCH NOW"
    },
    {
      title: "Special Video Lecture",
      image: "/nature.jpg",
      description: "Dive deeper with a special lecture on the Quran.",
      route: `/verses/${chapterNumber}/${englishName}/watch`,
      cta: "WATCH LECTURE"
    }
  ];
  const audioPreviews = [
    {
      title: "Listen to Quranic Audio",
      image: "/nature2.jpg",
      description: "Listen to Quranic recitations and commentary.",
      route: `/verses/${chapterNumber}/${englishName}/listen`,
      cta: "LISTEN NOW"
    },
    {
      title: "Special Audio Reflection",
      image: "/nature3.jpg",
      description: "Reflect with a special audio session on the Quran.",
      route: `/verses/${chapterNumber}/${englishName}/listen`,
      cta: "LISTEN REFLECTION"
    }
  ];

  const filteredArticles = articles;
  const cards = filteredArticles.map(article => ({
    ...article,
    link: article.link(chapterNumber, englishName),
  }));
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

      {/* Carousel or Preview */}
      <div className="relative flex items-center gap-4">
        {/* Left arrow */}
        <button
          onClick={prevPage}
          className="p-2  rounded-full text-[#DCE0E3] hover:text-black transition"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Cards container or preview */}
        <div className="flex flex-1 gap-6">
          {(activeTab === "watch" ? videoPreviews : activeTab === "listen" ? audioPreviews : null) ?
            (activeTab === "watch" ? videoPreviews : audioPreviews).map((preview, idx) => (
              <div
                key={idx}
                className="group flex-1 h-[532px] rounded-[12px] relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => router.push(preview.route)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url(${preview.image})` }}
                ></div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold font-lato mb-2 decoration-2 underline-offset-4">
                    {preview.title}
                  </h3>
                  <p className="text-gray-200 mb-4 font-lato">{preview.description}</p>
                  <span className="inline-flex items-center font-lato font-semibold group-hover:text-white px-3 py-1.5 rounded transition-all duration-300 border-b-2 w-fit">
                    {preview.cta}
                    <span className="ml-2 font-lato group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </div>
              </div>
            ))
          : (
            visibleCards.map((card, index) => (
              <div
                key={startIndex + index}
                className="group flex-1 h-[532px] rounded-[12px] relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => router.push(`/verses/${chapterNumber}/${englishName}/read?article=${startIndex + index}`)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background image */}
                <div
                  className="absolute hover:cursor-pointer inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage:`url(${card.image})` }}
                ></div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300"></div>
                {/* Text content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold font-lato mb-2 decoration-2 underline-offset-4">
                    {card.title}
                  </h3>
                  <p className="text-gray-200 mb-4 font-lato">{card.excerpt}</p>
                  <span className="inline-flex items-center font-lato font-semibold group-hover:text-white px-3 py-1.5 rounded transition-all duration-300 border-b-2 w-fit">
                    READ MORE
                    <span className="ml-2 font-lato group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                </div>
              </div>
            ))
          )}
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
      {activeTab === "read" && (
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
      )}

      {/* Pagination and Chapter navigation */}
    </div>
  );
}