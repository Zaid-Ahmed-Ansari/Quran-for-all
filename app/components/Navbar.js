// components/Navbar.js
'use client'

import Image from 'next/image'
import JoinCPSDropdown from './JoinCPSDropdown'  // adjust path if needed

const Navbar = () => {
  return (
    <nav className="bg-navbg dark:bg-dark-nav w-full px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row justify-between items-center h-auto md:h-[98px]">
      
      {/* Logo */}
      <div className="mb-4 md:mb-0">
        <Image
          alt="logo"
          src="/Logo.svg"
          height={44}
          width={270}
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 text-black">
        
        {/* Get Quran */}
        <div className="flex items-center gap-2">
          <Image
            alt="getquran"
            src="/getquran.svg"
            height={24}
            width={22}
          />
          <p className="font-lato text-text-primary dark:text-hoverclr text-sm md:text-base">
            Get Quran
          </p>
        </div>

        {/* Join Us Dropdown */}
        <JoinCPSDropdown />

        {/* Donate Button */}
        <button className="border rounded-md h-[36px] w-full md:w-[110px] font-bold text-hoverclr text-sm md:text-base">
          DONATE
        </button>
      </div>
    </nav>
  )
}

export default Navbar
