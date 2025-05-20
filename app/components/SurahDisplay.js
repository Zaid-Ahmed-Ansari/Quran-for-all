import React from 'react'
import { surahFatiha } from '../helpers/fatiha'

const SurahDisplay = ({selectedVerse}) => {
  return (
    <div>
      <p className='text-surah font-lato dark:text-dark-text mt-10 '><sup className='text-[#42454778]'>{surahFatiha[0].number}</sup>{surahFatiha[0].english}</p>
  <p className={`text-surah font-lato dark:text-dark-text mt-5 `}>
    {surahFatiha.slice(1).map((fatiha, index) => (
      <span key={fatiha.number}
      id={fatiha.number}
      
      >
        <sup className="text-[#42454778]">{fatiha.number}</sup> {fatiha.english}
        
      </span>
    ))}
  </p>
    </div>
  )
}

export default SurahDisplay
