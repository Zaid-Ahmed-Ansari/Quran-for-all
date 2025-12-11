import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { fatihaCommentary } from '../helpers/fatiha';
import AudioPlayer from './AudioPlayer';

import ReadMoreParagraph from './ReadMorePara';

const Commentary = ({ settings ,onSpeakClick, currentTime, isActive}) => {
  const {
    font,
    fontSize,
    letterSpacing,
    textAlign,
    theme
  } = settings;

  const [isOpen, setIsOpen] = useState(true);
  
  
  

  
  const timeInRange = (time, start, end) => time >= start && time < end;

  const currentIndex = isActive
    ? fatihaCommentary.findIndex((entry) =>
        timeInRange(currentTime, entry.startTime, entry.endTime)
      )
    : -1;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center dark:bg-dark-nav px-4 w-full mt-10 h-[70px] bg-navbg cursor-pointer">
        <div className="flex gap-2 items-center">
          <p className="text-[#424547] dark:text-dark-text font-bold font-lato">Commentary</p>
          <Image
            src="/speaker.svg"
            width={26}
            height={19}
            title='Press Read more to see the highlighting'
            alt="speaker"
            onClick={onSpeakClick}
            className="cursor-pointer hover:opacity-75 transition-opacity duration-150"
          />
        </div>
        <ChevronDown
          onClick={() => setIsOpen(!isOpen)}
          className={`text-text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
  <div className="px-4">
    <ReadMoreParagraph maxLines={5}>
      {fatihaCommentary.map((segment, i) => (
        <span
          key={i}
          className={`transition-colors duration-500 ${
            i === currentIndex
              ? 'bg-yellow-50 text-black dark:bg-yellow-600'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {segment.text + ' '}
        </span>
      ))}
    </ReadMoreParagraph>
  </div>
)}


      
    </div>
  );
};

export default Commentary;
