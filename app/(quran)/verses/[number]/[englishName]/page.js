'use client'
import Image from 'next/image';
// import { ChevronDown } from 'lucide-react';
import { surahs } from '../../../../helpers/surahs';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import Commentary from '../../../../components/Commentary';
import ReadMoreParagraph from '../../../../components/ReadMorePara';
import DelveQuran from '../../../../components/DelveQuran';
import ContentTabs from '../../../../components/ContentTab';
import { fatihaCommentary, surahFatiha } from '../../../../helpers/fatiha';
import SurahDisplay from '../../../../components/SurahDisplay';
import SurahNav from '../../../../components/SurahNav';
import { ChevronLeftCircleIcon, ChevronRightCircle } from 'lucide-react';
import Navbar from '../../../../components/Navbar';

const page = () => {
  const [selectedVerse, setSelectedVerse] = useState(null);
  const params = useParams();
    const chapterNumber = Number(params.number);
    const englishName = decodeURIComponent(params.englishName || '');
    const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';
  return (

    <div className=' dark:bg-dark-background' >
      <Navbar/>

    <SurahNav selectedVerse={selectedVerse} setSelectedVerse={setSelectedVerse}/>
    <div className='flex felx-col justify-center w-full ' >
     <div className="w-full max-w-3xl mx-auto mt-[75px] px-4">
     <p className='text-text-primary flex gap-2 font-lato dark:text-dark-text font-bold'>{chapterNumber}. {englishName} ({arabicRoman})
      <Image
      src='/speaker.svg'
      width={26.1}
      height={19}
      alt='speaker'

      />
      </p> 
      <SurahDisplay selectedVerse={selectedVerse}/>

      {/* <p className='text-surah font-lato dark:text-dark-text mt-10'>In the name of God, the Most Gracious, the Most Merciful </p>
      <p className='text-surah font-lato dark:text-dark-text mt-2'>   All praise    is due to God, the Lord of the Universe;        the Beneficent, the Merciful;        Lord of the Day of Judgement.      You alone we worship, and to You alone we turn for help.     Guide us to the straight path:     the path of those You
have blessed; not of those who have incurred Your wrath, nor of those who have gone astray.</p> */}

      <Commentary/>

      
<DelveQuran/>
<ContentTabs/>
 <div className="flex flex-col">
        <div className="flex justify-between mb-5 mt-5">
          <div className="text-gray-500 text-sm font-lato sm:text-base">
            Page 3 of 50
          </div>
          <div className="text-gray-500 font-lato text-sm sm:text-base">
            Completed 5%
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-[#C7BCAB] h-1 rounded-full"
              style={{ width: "5%" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-text-primary">
        <ChevronLeftCircleIcon className="w-[40px] h-[38px]" />
        <h2 className="text-lato font-bold text-2xl ">Chapter {chapterNumber}</h2>
        <ChevronRightCircle className="w-[40px] h-[38px]" />
      </div>
     </div>
    </div>
    </div>
  )
}

export default page
