'use client'
import { ChevronDown, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { surahs } from '../helpers/surahs'
import Image from 'next/image'
import Link from 'next/link'

const SurahNav = ({ selectedVerse, setSelectedVerse, settings }) => {
  const params = useParams();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || '');
  const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';
  const totalVerses = surahs[chapterNumber - 1]?.verses || 286;

  // Destructure settings
  const {
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
  } = settings;

  // Local dropdown states
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showArabicDropdown, setShowArabicDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [verseSearch, setVerseSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const [pageURL, setPageURL] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPageURL(window.location.href);
  }, []);

  const dropdownRefs = {
    chapter: useRef(null),
    verse: useRef(null),
    language: useRef(null),
    settings: useRef(null),
    arabic: useRef(null),
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Font size controls
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 10));
  };

  const increaseLetterSpacing = () => {
    setLetterSpacing(prev => Math.min(prev + 0.5, 3));
  };

  const setAlignment = (align) => {
    setTextAlign(align);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !dropdownRefs.chapter.current?.contains(e.target) &&
        !dropdownRefs.verse.current?.contains(e.target) &&
        !dropdownRefs.language.current?.contains(e.target) &&
        !dropdownRefs.settings.current?.contains(e.target) &&
        !dropdownRefs.arabic.current?.contains(e.target)
      ) {
        setShowChapterDropdown(false);
        setShowVerseDropdown(false);
        setShowLanguageDropdown(false);
        setShowSettingsDropdown(false);
        setShowArabicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = ['English', 'Urdu'];
  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(chapterSearch.toLowerCase())
  );
  const verses = Array.from({ length: totalVerses }, (_, i) => i + 1);
  const filteredVerses = verses.filter((v) => v.toString().includes(verseSearch));

  return (
    <div className="relative z-50">
      {/* Navbar */}
      <div className={`flex w-screen border border-gray-200 divide-x divide-gray-200 text-sm h-[50px] text-gray-800 ${
        theme === 'dark' 
          ? 'dark:bg-dark-background dark:divide-white dark:text-dark-text bg-dark-background' 
          : 'bg-white'
      }`}>
        {/* Chapter */}
        <button onClick={() => setShowChapterDropdown(!showChapterDropdown)} className="flex items-center justify-center flex-3 px-4 w-[300px] py-2 hover:cursor-pointer gap-1">
          <span>Chapter {chapterNumber}: {englishName}</span>
          <em className="text-gray-500">({arabicRoman})</em>
          <ChevronDown size={16} className="ml-1 text-gray-600" />
        </button>

        {/* Verse */}
        <button onClick={() => setShowVerseDropdown(!showVerseDropdown)} className="flex items-center justify-center flex-1 px-4 py-2 hover:cursor-pointer gap-1">
          <span>Verse</span>
          <ChevronDown size={16} className="text-gray-600" />
        </button>

        {/* Language */}
        <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} className="flex flex-1 justify-center items-center px-4 py-2 hover:cursor-pointer gap-1">
          <span>Language</span>
          <ChevronDown size={16} className="text-gray-600" />
        </button>

        {/* Arabic */}
        <button onClick={() => setShowArabicDropdown(!showArabicDropdown)} className="flex flex-1 justify-center items-center px-4 py-2 hover:cursor-pointer gap-1">
          <span>Arabic</span>
          <ChevronDown size={16} className="text-gray-600" />
        </button>

        {/* Settings */}
        <button onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} className="flex flex-1 justify-center items-center px-4 py-2 hover:cursor-pointer gap-1">
          <Image src='/settingssurahnav.svg' width={21} height={18} alt='settings' />
          <span>Settings</span>
        </button>

        {/* Share */}
        <button onClick={() => setShowShareModal(true)} className="flex flex-1 justify-center items-center hover:cursor-pointer px-4 py-2 gap-1">
          <Image src='/share.svg' width={18} height={18} alt='share' />
          <span>Share</span>
        </button>

        {/* Search */}
        <div className='flex flex-2 justify-center items-center px-4 hover:cursor-pointer py-2 gap-1'>
          <Image src='/searchicon.svg' width={18} height={18} alt='search' />
          <input type="text" placeholder='Search' className={`${theme === 'dark' ? 'dark:text-dark-text bg-transparent' : ''}`} />
        </div>
      </div>

      {/* Language Dropdown */}
      {showLanguageDropdown && (
        <div ref={dropdownRefs.language} className={`absolute top-[68px] left-[500px] w-[200px] border rounded shadow max-h-[300px] overflow-y-auto ${
          theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white'
        }`}>
          {languages.map((lang) => (
            <button key={lang} onClick={() => {
              setSelectedLanguage(lang);
              setShowLanguageDropdown(false);
            }} className={`flex items-center justify-between px-4 py-2 w-full hover:bg-gray-100 ${
              theme === 'dark' ? 'hover:bg-gray-700' : ''
            } ${selectedLanguage === lang ? 'text-hoverclr font-semibold' : ''}`}>
              {lang}
              {selectedLanguage === lang && (
                <div className="w-[16px] h-[16px] rounded-full bg-hoverclr flex items-center justify-center">
                  <div className="w-[8px] h-[8px] bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Arabic Dropdown */}
      {showArabicDropdown && (
        <div ref={dropdownRefs.arabic} className={`absolute top-[68px] left-[600px] w-[250px] border rounded shadow p-2 ${
          theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white'
        }`}>
          <button 
            onClick={() => {
              setArabicView('Arabic');
              setShowArabicDropdown(false);
            }}
            className={`flex justify-between items-center border-b-1 w-full px-4 py-2 hover:bg-gray-100 ${
              theme === 'dark' ? 'hover:bg-gray-700' : ''
            } ${arabicView === 'Arabic' ? 'text-hoverclr font-semibold' : 'text-text-primary'}`}
          >
            Arabic View <Image src="/arabic.svg" width={29} height={32} alt="lang" />
          </button>
          <button 
            onClick={() => {
              setArabicView('Roman Arabic');
              setShowArabicDropdown(false);
            }}
            className={`flex justify-between items-center w-full px-4 py-2 hover:bg-gray-100 ${
              theme === 'dark' ? 'hover:bg-gray-700' : ''
            } ${arabicView === 'Roman Arabic' ? 'text-hoverclr font-semibold' : 'text-text-primary'}`}
          >
            Roman Arabic View <Image src="/arabic.svg" width={29} height={32} alt="lang" />
          </button>
        </div>
      )}

      {/* Enhanced Settings Dropdown */}
      {showSettingsDropdown && (
  <div
    ref={dropdownRefs.settings}
    className={`absolute top-[68px] left-[700px] w-[400px] h-[235px] border rounded shadow p-3 ${
      theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white'
    }`}
  >
    <div className="grid grid-rows-[auto_auto_auto] h-full gap-4">
      {/* Row 1: Font Size Controls & Theme */}
      <div className="flex h-[70px]">
        {/* Font Size Controls */}
        <div className="flex-1 pr-2 border-r border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-4">
            {/* ↓A */}
            <button
              onClick={() => {
                const sizes = [14, 16, 18, 20];
                const i = sizes.indexOf(fontSize);
                setFontSize(i > 0 ? sizes[i - 1] : sizes[0]);
              }}
              className="text-md font-merriweather text-text-primary hover:text-hoverclr transition-colors"
              title="Decrease font size"
            >
              ↓A
            </button>

            {/* Dots */}
            <div className="flex flex-col gap-1">
              {[14, 16, 18, 20].map((size, index) => (
                <span
                  key={index}
                  className={`w-[7px] h-[7px] rounded-full ${
                    fontSize === size ? 'bg-hoverclr' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                ></span>
              ))}
            </div>

            {/* A↑ */}
            <button
              onClick={() => {
                const sizes = [14, 16, 18, 20];
                const i = sizes.indexOf(fontSize);
                setFontSize(i < sizes.length - 1 ? sizes[i + 1] : sizes[sizes.length - 1]);
              }}
              className="font-merriweather text-2xl text-text-primary hover:text-hoverclr transition-colors"
              title="Increase font size"
            >
              A↑
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex-1 flex justify-center items-center pl-2">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-xl"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Image src="/light.svg" height={100} width={100}/> : <Image src="/dark.svg" height={100} width={100}/>}
          </button>
        </div>
      </div>

      {/* Row 2: Line Spacing */}
      <div className="flex justify-between items-center px-1">
        {[
          { label: <Image src="/line0.svg" height={20} width={20} alt="Tight" />, value: 0 },
          { label: <Image src="/line1.svg" height={20} width={20} alt="Normal" />, value: 1 },
          { label: <Image src="/line3.svg" height={20} width={20} alt="Wide" />, value: 2 }
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setLetterSpacing(value)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              letterSpacing === value
                ? ' text-white bg-hoverclr'
                : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Row 3: Font Selection */}
      <div className="flex justify-between gap-2">
        {['Lato', 'Merriweather'].map((f) => (
          <button
            key={f}
            onClick={() => setFont(f)}
            className={`flex-1 py-1 flex flex-col items-center font-lato rounded text-sm ${
              font === f && f === 'Lato'
                ? ' text-hoverclr font-semibold font-lato'
                : ""
            }
            ${font === f && f === 'Merriweather'?"font-merriweather text-hoverclr font-semibold":""}
            `}
          >
            <span className=" text-3xl">Aa</span>
            <span>{f}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}


      {/* Other existing dropdowns... */}
      {/* Chapter Dropdown */}
      {showChapterDropdown && (
        <div ref={dropdownRefs.chapter} className={`absolute top-[68px] left-[20px] w-[400px] border rounded shadow max-h-[400px] overflow-y-auto p-2 ${
          theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <input type="text" placeholder="Search Chapter" value={chapterSearch} onChange={(e) => setChapterSearch(e.target.value)} className={`w-full font-lato focus:outline-none border-b border-gray-300 text-[#757575] p-2 ${
              theme === 'dark' ? 'bg-transparent text-white' : ''
            }`} />
            <button onClick={() => setChapterSearch('')}><X size={18} className='text-text-primary' /></button>
          </div>
          <div className="text-sm text-text-primary m-2 font-lato px-2">Introduction of the Quran</div>
          {filteredSurahs.map((s) => (
            <Link key={s.number} href={`/verses/${s.number}/${s.englishName}`} className={`flex justify-between group items-center px-4 py-2 hover:bg-navbg ${
              theme === 'dark' ? 'hover:bg-gray-700' : ''
            }`}>
              <div>
                <p className="text-text-primary font-lato group-hover:font-bold group-hover:text-hoverclr">{s.number}. {s.englishName}</p>
                <p className="text-xs text-text-primary font-lato group-hover:text-hoverclr">{s.arabicRoman}</p>
              </div>
              <span className="text-sm text-[#a6a6a6]">{s.verses} verses</span>
            </Link>
          ))}
        </div>
      )}

      {/* Verse Dropdown */}
      {showVerseDropdown && (
        <div ref={dropdownRefs.verse} className={`absolute top-[68px] left-[300px] w-[260px] border border-[#DCE0E3] rounded shadow p-2 z-50 ${
          theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <input type="text" placeholder="Search" value={verseSearch} onChange={(e) => setVerseSearch(e.target.value)} className={`w-full p-2 text-[#757575] border-b focus:outline-none border-gray-300 text-sm ${
              theme === 'dark' ? 'bg-transparent text-white' : ''
            }`} />
            <button onClick={() => setVerseSearch('')}><X size={18} className='text-text-primary' /></button>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
            {filteredVerses.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setShowVerseDropdown(false);
                  setSelectedVerse(v);
                  const verseElement = document.getElementById(`${v}`);
                  if (verseElement) {
                    verseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`w-10 h-10 flex items-center justify-center font-lato rounded-full hover:bg-hoverclr ${
                  selectedVerse === v ? 'bg-hoverclr text-white' : 'text-text-primary'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal - keeping existing implementation */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`p-6 rounded shadow-lg w-[500px] relative ${
            theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white'
          }`}>
            <button className="absolute top-2 right-2" onClick={() => setShowShareModal(false)}>
              <X className='text-text-primary' />
            </button>
            <h2 className="text-lg font-lato text-surah font-bold mb-4">Share</h2>
            <div className="flex justify-between mb-4">
              <div className='text-text-primary flex flex-col items-center justify-center'><div className='bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer'><Image src="/facebook.svg" width={14} height={26} alt="Facebook" /></div>Facebook</div>
              <div className='text-text-primary flex flex-col items-center justify-center'> <div className='bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer'><Image src="/twitter.svg" width={23} height={23} alt="Twitter" /></div>Twitter</div>
              <div className='text-text-primary flex flex-col items-center justify-center'><div className='bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer'><Image src="/instagram.svg" width={30} height={30} alt="Instagram" /></div>Instagram</div>
              <div className='text-text-primary flex flex-col items-center justify-center'><div className='bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer'><Image src="/whatsapp.svg" width={30} height={30} alt="WhatsApp" /></div>Whatsapp</div>
              <div className='text-text-primary flex flex-col items-center justify-center'><div className='bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer'><Image src="/print.svg" width={25} height={25} alt="Print" /></div>Print</div>
            </div>

            <h2 className="text-lg font-lato text-surah font-bold mb-4">Page Link</h2>
            <div className='flex bg-[#DCE0E34D] rounded-xl'>
              <input
                className="w-full focus:outline-none font-lato text-[#6D7173] p-2 bg-transparent"
                readOnly
                value={pageURL}
              />
              <Image
                src='/copy.svg'
                width={17.29}
                height={17.29}
                alt='copy'
                onClick={handleCopyLink}
                className="mr-2 hover:cursor-pointer hover:ring-0"
              />
              {copied && (
                <div className="absolute -top-20 left-1/2 text-center -translate-x-1/2 bg-hoverclr text-white font-lato font-bold w-[281px] h-[65px] flex items-center justify-center text-sm px-3 py-1 rounded-md shadow-md z-50">
                  Your Link has been copied!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahNav;