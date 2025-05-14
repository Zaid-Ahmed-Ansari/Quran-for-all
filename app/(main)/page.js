'use client';

import { useState } from 'react';
import { surahs } from '../helpers/surahs';
import Image from 'next/image';
import Link from 'next/link';

const Page = () => {
  const [query, setQuery] = useState('');

  const handleClear = () => setQuery('');

  // Optional: Filter based on query
  const filteredSurahs = query
    ? surahs.filter((surah) =>
        surah.englishName.toLowerCase().includes(query.toLowerCase()) ||
        surah.arabicRoman.toLowerCase().includes(query.toLowerCase())
      )
    : surahs;

  return (
    <div className="flex flex-col items-center px-4">
      {/* Search Box */}
      <div className="flex items-center rounded-full border hover:border-hoverclr border-gray-300 mt-[79px] px-4 py-2 shadow-sm w-full max-w-[677px] h-[61px]">
        <Image
          height={20.49}
          width={20.49}
          src="/searchicon.svg"
          alt="Search"
          className="text-gray-500"
        />

        <input
          type="text"
          placeholder="Search Chapter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-1 outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />

        {query && (
          <button onClick={handleClear} className="focus:outline-none">
            <Image
              height={13.29}
              width={13.29}
              src="/X icon.svg"
              alt="Clear"
              className="text-gray-500 hover:opacity-70 transition-opacity"
            />
          </button>
        )}
      </div>

      {/* Quran Intro Box */}
      <div className="bg-[#DCE0E34D] font-lato text-black w-[263px] h-[49px] flex items-center justify-center mt-[38px] mb-[79px]">
        Introduction of the Quran
      </div>

      {/* Surah Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 shadow-md w-full max-w-[800px]">
        {filteredSurahs.map((surah) => (
          <Link
            href={`/verses/${surah.number}/${encodeURIComponent(surah.englishName)}`}
            key={surah.number}
          >
            <div className="border border-white group shadow-sm justify-between hover:bg-[#f9f9f9] p-4 rounded flex items-center text-black transition-all">
              <div className="flex items-center">
                <div className="w-[43.79px] font-lato font-bold flex items-center justify-center rounded-lg h-[40.35px] group-hover:bg-hoverclr bg-[#DCE0E34D] transition">
                  {surah.number}
                </div>
                <div className="ml-2">
                  <p className="text-[#545454] group-hover:text-hoverclr font-lato font-bold">
                    {surah.englishName}
                  </p>
                  <p className="text-text-secondary">{surah.arabicRoman}</p>
                </div>
              </div>
              <div className="text-text-secondary text-right">{surah.verses} Verses</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
