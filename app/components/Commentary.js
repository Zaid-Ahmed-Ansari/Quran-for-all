import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import ReadMoreParagraph from './ReadMorePara';
import { fatihaCommentary } from '../helpers/fatiha';

const Commentary = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full">
      <div
        className="flex justify-between items-center dark:bg-dark-nav px-4 w-full mt-10 h-[70px] bg-navbg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex gap-2'>
          <p className='text-[#424547] dark:text-dark-text font-bold font-lato'>Commentary</p>
          <Image
            src='/speaker.svg'
            width={26}
            height={19}
            alt='speaker'
          />
        </div>
        <ChevronDown
          className={`text-text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Accordion content */}
      {isOpen && (
        <div className="p-4 ">
          {/* Put your commentary content here */}
          <ReadMoreParagraph text={fatihaCommentary[0]} maxChars={577}/>
        </div>
      )}
    </div>
  )
}

export default Commentary;
