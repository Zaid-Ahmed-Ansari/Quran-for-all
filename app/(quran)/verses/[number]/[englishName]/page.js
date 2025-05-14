'use client'
import Image from 'next/image';
// import { ChevronDown } from 'lucide-react';
import { surahs } from '../../../../helpers/surahs';
import { useParams } from 'next/navigation';
import React from 'react'
import Commentary from '../../../../components/Commentary';
import ReadMoreParagraph from '../../../../components/ReadMorePara';
import DelveQuran from '../../../../components/DelveQuran';
import ContentTabs from '../../../../components/ContentTab';

const page = () => {
  const params = useParams();
    const chapterNumber = Number(params.number);
    const englishName = decodeURIComponent(params.englishName || '');
    const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';
  return (
    <div className='flex felx-col justify-center w-full mt-[75px]'>
     <div className='w-full max-w-1/2'>
     <p className='text-text-primary flex gap-2 font-lato font-bold'>{chapterNumber}. {englishName} ({arabicRoman})
      <Image
      src='/speaker.svg'
      width={26.1}
      height={19}
      alt='speaker'

      />
      </p> 
      <p className='text-surah font-lato mt-10'>In the name of God, the Most Gracious, the Most Merciful </p>
      <p className='text-surah font-lato mt-2'>   All praise    is due to God, the Lord of the Universe;        the Beneficent, the Merciful;        Lord of the Day of Judgement.      You alone we worship, and to You alone we turn for help.     Guide us to the straight path:     the path of those You
have blessed; not of those who have incurred Your wrath, nor of those who have gone astray.</p>

      <Commentary/>
      <ReadMoreParagraph text="The best way to begin any task is in the name of God, the Lord, the Being who
is the source of all blessings, and whose blessings and mercy are continually pouring upon His creation. To commence any undertaking in His name is to pray that God, in His infinite mercy, should come to one’s assistance and bring one’s work to a successful conclusion. This is man’s acknowledgement of the fact that he is God’s servant, and also brings divine assurance of success. The Quran has a special and characteristic way of expressing a believer’s inner sentiments in the most appropriate Not Given" maxChars={577}/>
<DelveQuran/>
<ContentTabs/>
     </div>
    </div>
  )
}

export default page
