'use client';
import { ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { surahs } from '../helpers/surahs';
import Image from 'next/image';

const SurahNav = () => {
  const params = useParams();
  const chapterNumber = Number(params.number);
  const englishName = decodeURIComponent(params.englishName || '');
  const arabicRoman = surahs[chapterNumber - 1]?.arabicRoman || '';

  return (
    <div className="flex w-screen border border-gray-200 text-sm text-text-primary font-lato overflow-x-auto divide-x h-[65px] divide-gray-200">
      {/* Chapter Dropdown */}
      <button className="flex items-center justify-center px-4 py-2 gap-1 flex-3 min-w-0 hover:bg-gray-100">
        <span className="truncate">
          Chapter {chapterNumber}: {englishName}{' '}
          <em className="text-gray-500">({arabicRoman})</em>
        </span>
        <ChevronDown size={16} className="text-gray-600" />
      </button>

      {/* Verse Dropdown */}
      <button className="flex items-center justify-center px-4 py-2 gap-1 flex-1 min-w-0 hover:bg-gray-100">
        <span className="truncate">Verse</span>
        <ChevronDown size={16} className="text-gray-600" />
      </button>

      {/* Language Dropdown */}
      <button className="flex items-center justify-center px-4 py-2 gap-1 flex-1 min-w-0 hover:bg-gray-100">
        <span className="truncate">Language</span>
        <ChevronDown size={16} className="text-gray-600" />
      </button>

      {/* Arabic Dropdown */}
      <button className="flex items-center justify-center px-4 py-2 gap-1 flex-1 min-w-0 hover:bg-gray-100">
        <span className="truncate">Arabic</span>
        <ChevronDown size={16} className="text-gray-600" />
      </button>

      {/* Settings */}
      <button className="flex items-center justify-center px-4 py-2 gap-2 flex-1 min-w-0 hover:bg-gray-100">
        <Image src="/settingssurahnav.svg" width={21.41} height={17.87} alt="settings" />
        <span className="truncate">Settings</span>
      </button>

      {/* Share */}
      <button className="flex items-center justify-center px-4 py-2 gap-2 flex-1 min-w-0 hover:bg-gray-100">
        <Image src="/share.svg" width={18.34} height={18.34} alt="share" />
        <span className="truncate">Share</span>
      </button>

      {/* Search */}
      <div className="flex items-center px-4 py-2 gap-2 flex-2 min-w-0 hover:bg-gray-100">
        <Image src="/searchicon.svg" width={18.48} height={18.48} alt="search" />
        <input
          placeholder="Search"
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>
    </div>
  );
};

export default SurahNav;
