import { ChevronDown, ChevronDownCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const DelveQuran = () => {
  return (
    <div>
      <div className="flex justify-between items-center rounded-xl px-4 w-full mt-10 h-[70px] bg-navbg">
        <div className='flex gap-2'>
          <p className='text-[#424547] font-bold font-lato'>Delve Deep into the Quran</p>
          
        </div>
        <div>
          <ChevronDown className='text-text-primary'/>
        </div>
      </div>
    </div>
  )
}

export default DelveQuran
