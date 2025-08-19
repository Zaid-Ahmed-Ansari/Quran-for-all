'use client'

import { surahs } from '../../../../helpers/surahs';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import Commentary from '../../../../components/Commentary';

import DelveQuran from '../../../../components/DelveQuran';
import ContentTabs from '../../../../components/ContentTab';

import SurahDisplay from '../../../../components/SurahDisplay';
import SurahNav1 from '../../../../components/SurahNav';
import { ChevronLeftCircleIcon, ChevronRightCircle } from 'lucide-react';
import Navbar from '../../../../components/Navbar';
import AudioPlayer from '../../../../components/AudioPlayer';

const page = () => {
  // Existing state
  const [selectedVerse, setSelectedVerse] = useState(null);
  
  // Shared settings state from SurahNav
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [font, setFont] = useState('Lato');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);
  const [textAlign, setTextAlign] = useState('left');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [arabicView, setArabicView] = useState('Arabic'); // 'Arabic' or 'Roman Arabic'
  
  const params = useParams();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || '');
  const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';

  // Settings object to pass to components
  const settings = {
    selectedLanguage,
    setSelectedLanguage,
    font,
    setFont,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    textAlign,
    setTextAlign,
    letterSpacing,
    setLetterSpacing,
    arabicView,
    setArabicView
  };
  const [activePlayer, setActivePlayer] = useState(null) // 'translation' | 'commentary' | null
  const [currentTime, setCurrentTime] = useState(0)
  const handleTimeUpdate = (time) => {
    setCurrentTime(time)
  }

  const handleClose = () => {
    setActivePlayer(null)
    setCurrentTime(0)
  }

  return (
    <div data-theme={theme} className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className='dark:bg-dark-background min-h-screen'>
        <Navbar/>

        <SurahNav1
          selectedVerse={selectedVerse} 
          setSelectedVerse={setSelectedVerse}
          settings={settings}
        />
        
        <div className='flex flex-col justify-center w-full'>
          <div className="w-full max-w-3xl mx-auto mt-[75px] px-4">
           

            <SurahDisplay 
              selectedVerse={selectedVerse}
              setSelectedVerse={setSelectedVerse}
              settings={settings}
              chapterNumber={chapterNumber}
              onSpeakClick={() => setActivePlayer('translation')}
              currentTime={currentTime}
        isActive={activePlayer === 'translation'}
        onTimeUpdate={handleTimeUpdate}
        onClose={handleClose}
            />

            <Commentary 
              settings={settings}
              chapterNumber={chapterNumber}
              selectedVerse={selectedVerse}
              onSpeakClick={() => setActivePlayer('commentary')}
        currentTime={currentTime}
        isActive={activePlayer === 'commentary'}
        onTimeUpdate={handleTimeUpdate}
        onClose={handleClose}
            />
            {activePlayer && (
        <AudioPlayer
          key={activePlayer}
          isVisible={true}
          onClose={handleClose}
          onTimeUpdate={handleTimeUpdate}
          audioTitle={
            activePlayer === 'translation'
              ? 'Recitation of Surah Al-Fatiha'
              : 'Commentary on Surah Al-Fatiha'
          }
          audioSrc={
            activePlayer === 'translation' ? '/audio/fatiha translation.mp3' : '/audio/fatihacom.mp3'
          }
        />
      )}

            <DelveQuran settings={settings}/>
            <ContentTabs settings={settings}/>
            
            <div className="flex flex-col">
              <div className="flex justify-between mb-5 mt-5">
                <div className={`text-gray-500 text-sm sm:text-base ${
                  font === 'Lato' ? 'font-lato' : 'font-merriweather'
                }`}>
                  Page 3 of 50
                </div>
                <div className={`text-gray-500 text-sm sm:text-base ${
                  font === 'Lato' ? 'font-lato' : 'font-merriweather'
                }`}>
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

            <div className="mt-8 flex items-center justify-between text-text-primary dark:text-dark-text">
              <ChevronLeftCircleIcon className="w-[40px] h-[38px] cursor-pointer hover:text-hoverclr transition-colors" />
              <h2 className={`text-2xl font-bold ${
                font === 'Lato' ? 'font-lato' : 'font-merriweather'
              }`}>
                Chapter {chapterNumber}
              </h2>
              <ChevronRightCircle className="w-[40px] h-[38px] cursor-pointer hover:text-hoverclr transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page