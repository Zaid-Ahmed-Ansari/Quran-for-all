'use client'
import { ChevronDown, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { surahs } from '../helpers/surahs'
import Image from 'next/image'
import Link from 'next/link'

const SurahNav = ({selectedVerse,setSelectedVerse}) => {
  const params = useParams();
  // const router = useRouter();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || '');
  const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';
  const totalVerses = surahs[chapterNumber - 1]?.verses || 286;


  
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showVerseDropdown, setShowVerseDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showArabicDropdown, setShowArabicDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [verseSearch, setVerseSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const [font, setFont] = useState('Lato');
  const [theme, setTheme] = useState('light');
  const [pageURL, setPageURL] = useState('');
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
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // hide modal after 2s
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
    <div className="relative z-50 ">
      {/* Navbar */}
      <div className="flex w-screen border border-gray-200 dark:bg-dark-background divide-x divide-gray-200 dark:divide-white text-sm h-[66.17px] text-gray-800 dark:text-dark-text bg-white">
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
        <button onClick={() => setShowArabicDropdown(!showArabicDropdown)} className="flex flex-1 justify-center items-center px-4 py-2 hover:cursor-pointer  gap-1">
          <span>Arabic</span>
          <ChevronDown size={16} className="text-gray-600" />
        </button>

        {/* Settings */}
        <button onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} className="flex flex-1 justify-center items-center px-4 py-2 hover:cursor-pointer gap-1">
          <Image src='/settingssurahnav.svg' width={21} height={18} alt='settings' />
          <span>Settings</span>
        </button>

        {/* Share */}
        <button onClick={() => setShowShareModal(true)} className="flex flex-1 justify-center items-center hover:cursor-pointer px-4 py-2  gap-1">
          <Image src='/share.svg' width={18} height={18} alt='share' />
          <span>Share</span>
        </button>

        {/* Search */}
        <div className='flex flex-2 justify-center items-center px-4 hover:cursor-pointer py-2  gap-1'>
          <Image src='/searchicon.svg' width={18} height={18} alt='search' />
          <input type="text" placeholder='Search' className='dark:text-dark-text' />
        </div>
      </div>

      {/* Chapter Dropdown */}
      {showChapterDropdown && (
        <div ref={dropdownRefs.chapter} className="absolute top-[68px] left-[20px] w-[400px] bg-white border rounded shadow max-h-[400px] overflow-y-auto p-2">
          <div className="flex justify-between items-center mb-2">
            <input type="text" placeholder="Search Chapter" value={chapterSearch} onChange={(e) => setChapterSearch(e.target.value)} className="w-full font-lato focus:outline-none border-b border-gray-300 text-[#757575] p-2" />
            <button onClick={() => setChapterSearch('')}><X size={18} className='text-text-primary' /></button>
          </div>
          <div className="text-sm text-text-primary m-2 font-lato px-2">Introduction of the Quran</div>
          {filteredSurahs.map((s) => (
            <Link key={s.number} href={`/verses/${s.number}/${s.englishName}`} className="flex justify-between group items-center px-4 py-2 hover:bg-navbg">
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
        <div ref={dropdownRefs.verse} className="absolute top-[68px] left-[300px] w-[260px] bg-white border rounded shadow p-2 z-50">
          <div className="flex justify-between items-center mb-2">
            <input type="text" placeholder="Search" value={verseSearch} onChange={(e) => setVerseSearch(e.target.value)} className="w-full p-2 text-[#757575] border-b focus:outline-none border-gray-300 text-sm" />
            <button onClick={() => setVerseSearch('')}><X size={18} className='text-text-primary' /></button>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
            {filteredVerses.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setShowVerseDropdown(false); // close dropdown
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

      {/* Language Dropdown */}
      {showLanguageDropdown && (
        <div ref={dropdownRefs.language} className="absolute top-[68px] left-[500px] w-[200px] bg-white border rounded shadow max-h-[300px] overflow-y-auto">
          {languages.map((lang) => (
            <button key={lang} onClick={() => setSelectedLanguage(lang)} className={`flex items-center justify-between px-4 py-2 w-full hover:bg-gray-100 ${selectedLanguage === lang ? 'text-hoverclr font-semibold' : 'text-black'}`}>
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
        <div ref={dropdownRefs.arabic} className="absolute top-[68px] left-[600px] w-[250px] bg-white border rounded shadow p-2">
          <button className="flex justify-between text-text-primary items-center border-b-1 w-full px-4 py-2 hover:bg-gray-100">
            Arabic View <Image src="/arabic.svg" width={29} height={32} alt="lang" />
          </button>
          <button className="flex justify-between items-center w-full px-4 py-2 text-text-primary hover:bg-gray-100">
            Roman Arabic View <Image src="/arabic.svg" width={29} height={32} alt="lang" />
          </button>
        </div>
      )}

      {/* Settings Dropdown
      {showSettingsDropdown && (
        <div ref={dropdownRefs.settings} className="absolute top-[68px] left-[700px] w-[210px] bg-white border rounded shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <button className="text-lg">↓A</button>
            <button className="text-lg">A•</button>
            <button className="text-lg">A↑</button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
          </div>
          <div className="flex justify-between mb-4">
            {['left', 'center', 'right'].map((align) => (
              <button key={align} className="w-6 h-6 rounded hover:bg-gray-200 text-xs">≡</button>
            ))}
          </div>
          <div className="flex justify-between">
            {['Lato', 'Merriweather'].map((f) => (
              <button key={f} onClick={() => setFont(f)} className={`flex flex-col items-center ${font === f ? 'text-[#66A3B6] font-semibold' : ''}`}>
                <span className="text-xl">Aa</span>
                <span className="text-sm">{f}</span>
              </button>
            ))}
          </div>
        </div>
      )} */}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-[500px] relative">
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
            <div className='flex bg-[#DCE0E34D] rounded-xl '>

              <input
                className="w-full focus:outline-none font-lato  text-[#6D7173]  p-2 "
                readOnly
                value={pageURL}
              />
              <Image
                src='/copy.svg'
                width={17.29}
                height={17.29}
                alt='copy'
                onClick={handleCopyLink}
                className="mr-2 hover:cursor-pointer hover:ring-0 "
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
