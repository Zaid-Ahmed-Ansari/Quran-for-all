'use client'
import { ChevronDown, ChevronDownCircle } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import ContentTabs from './ContentTab'

const DelveQuran = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      <div className="flex justify-between  dark:bg-dark-nav items-center rounded-xl px-4 w-full mt-10 h-[70px] bg-navbg"
      onClick={() => setIsOpen(!isOpen)}
      >
      
        <div className='flex gap-2'>
          <p className='text-[#424547] font-bold dark:text-dark-text font-lato'>Delve Deep into the Quran</p>
          
        </div>
        <div>
          <ChevronDown className={`text-text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
        </div>
        {/* {isOpen &&(
          // <ContentTabs/>
        )} */}
      </div>
    </div>
  )
}

export default DelveQuran
