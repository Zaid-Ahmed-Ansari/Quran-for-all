// components/ContentTabs.js
"use client";

import { ChevronLeft, ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ContentTabs() {
  const params = useParams();
    const chapterNumber = Number(params.number);
  const [activeTab, setActiveTab] = useState("read");

  const contentData = {
    read: [
      {
        title: "With every hardship there is ease",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link: "#",
      },
      {
        title: "Praise be to God (Alhamd-o-lillah)",
        excerpt:
          "The Quran introduces God as the 'Lord of the Universe' not just the God of some community or group. He is the God of all...",
        link: "#",
      },
    ],
    watch: [
      {
        title: "Video Content 1",
        excerpt: "Sample video content description...",
        link: "#",
      },
    ],
    listen: [
      {
        title: "Audio Content 1",
        excerpt: "Sample audio content description...",
        link: "#",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-10">
      

      <div className="flex  w-full border-b border-gray-200 mb-8">
        <button
          className={`py-2 px-4 flex-1 items-center justify-center flex gap-2 font-medium text-lg capitalize ${
            activeTab === "read"
              ? "text-hoverclr border-b-2 border-hovevrclr"
              : "text-text-primary hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("read")}
        >
          <Image src="/Book.svg" width={19} height={19} alt="Book" />
          Read
        </button>

        <button
          className={`py-2 px-4 flex-1 items-center justify-center flex gap-2 font-medium text-lg capitalize ${
            activeTab === "watch"
              ? "text-hoverclr border-b-2 border-hovevrclr"
              : "text-text-primary hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("watch")}
        >
          <Image src="/watch.svg" width={19} height={19} alt="watch" />
          Watch
        </button>

        <button
          className={`py-2 px-4 flex-1 items-center justify-center flex gap-2 font-medium text-lg capitalize ${
            activeTab === "listen"
              ? "text-hoverclr border-b-2 border-hovevrclr"
              : "text-text-primary hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("listen")}
        >
          <Image src="/speaker.svg" width={19} height={19} alt="speaker" />
          Listen
        </button>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {contentData[activeTab].map((card, index) => (
    <div
      key={index}
      className="group h-[532px] rounded-[12px] relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Background Image with zoom effect */}
      <div
        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=2070&auto=format&fit=crop')",
        }}
      ></div>
      
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300"></div>
      
      {/* Text Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <h3 className="text-xl font-bold font-lato mb-2  decoration-2 underline-offset-4">
          {card.title}
        </h3>
        <p className="text-gray-200 mb-4 font-lato">{card.excerpt}</p>
        <a
          href={card.link}
          className="inline-flex items-center font-lato font-semibold group-hover:text-white  px-3 py-1.5 rounded transition-all duration-300 border-b-2  w-fit"
        >
          READ MORE
          <span className="ml-2 font-lato group-hover:translate-x-1 transition-transform duration-300">
            →
          </span>
        </a>
      </div>
    </div>
  ))}
</div>

      {/* Pagination - matches your image exactly */}
        {/* <div className="text-gray-500 text-sm sm:text-base">Page 3 of 50</div>
         <div className="text-gray-500 text-sm sm:text-base">Completed 5%</div>
      <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full max-w-md bg-gray-200 rounded-full h-1">
          <div
            className="bg-[#C7BCAB] h-1 rounded-full"
            style={{ width: "5%" }}
          ></div>
        </div>
       
      </div> */}
      <div className="flex flex-col">
        <div className="flex  justify-between mb-5 mt-5">
<div className="text-gray-500 text-sm font-lato sm:text-base">Page 3 of 50</div>
         <div className="text-gray-500 font-lato text-sm sm:text-base">Completed 5%</div>
        </div>
        <div className="flex items-center justify-center ">
          <div className="w-full  bg-gray-200 rounded-full h-1">
          <div
            className="bg-[#C7BCAB] h-1 rounded-full"
            style={{ width: "5%" }}
          ></div>
        </div>
        </div>
      </div>

      {/* Chapter - matches your image */}
      <div className="mt-8 flex items-center justify-between text-text-primary">
        <ChevronLeftCircle className="w-[40px] h-[38px]"/>
        <h2 className="text-lato font-bold text-2xl ">Chapter {chapterNumber}</h2>
        <ChevronRightCircle  className="w-[40px] h-[38px]"/>
      </div>
    </div>
  );
}
