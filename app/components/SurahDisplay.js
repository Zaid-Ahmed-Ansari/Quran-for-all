import React, { useState } from 'react';
import { surahFatiha } from '../helpers/fatiha';
import AudioPlayer from './AudioPlayer';
import Image from 'next/image';
import { on } from 'events';
import { useParams } from 'next/navigation';
import { surahs } from '../helpers/surahs';

const SurahDisplay = ({ selectedVerse, settings,onSpeakClick, currentTime, isActive }) => {
  const {
    font,
    fontSize,
    letterSpacing,
    textAlign,
    theme
  } = settings;

  const params = useParams();
    const chapterNumber = Number(params.number);
    const englishName = decodeURIComponent(params.englishName || '');
    const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';
  
  

 
  const timeInRange = (time, start, end) => time >= start && time < end;

  const currentIndex = isActive
    ? surahFatiha.findIndex((entry) =>
        timeInRange(currentTime, entry.startTime, entry.endTime)
      )
    : -1;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center dark:bg-dark-nav px-4 w-full  h-[70px]  cursor-pointer">
        <div className="flex gap-2 items-center">
          <p className={`text-text-primary flex gap-2 dark:text-dark-text font-bold text-xl ${
                        font === 'Lato' ? 'font-lato ' : 'font-merriweather'
                      }`}>{chapterNumber}. {englishName} ({arabicRoman})</p>
          <Image
            src="/speaker.svg"
            width={26}
            height={19}
            alt="speaker"
            onClick={onSpeakClick}
            className="cursor-pointer hover:opacity-75 transition-opacity duration-150"
          />
        </div>
      </div>

      <div
        className={`mt-4 px-4 text-surah ${font === 'Lato' ? 'font-lato' : 'font-merriweather'} dark:text-dark-text`}
        style={{
          fontSize: `${fontSize}px`,
          letterSpacing: `${letterSpacing}px`,
          textAlign
        }}
      >
        {surahFatiha.map((ayah, index) => (
          <span
            key={ayah.number}
            id={ayah.number}
            className={`transition-colors duration-500 rounded-md p-1 mr-1 ${
              index === currentIndex
                ? 'bg-yellow-50 text-black dark:bg-yellow-600'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <sup className="text-[#42454778]">{ayah.number}</sup> {ayah.english}
          </span>
        ))}
      </div>

      
    </div>
  );
};

export default SurahDisplay;
