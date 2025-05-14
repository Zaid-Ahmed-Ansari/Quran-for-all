import { ChevronDown, ChevronDownCircle } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const Commentary = () => {
  return (
    <div>
      <div className="flex justify-between items-center rounded-xl px-4 w-full mt-10 h-[70px] bg-navbg">
        <div className='flex gap-2'>
          <p className='text-[#424547] font-bold font-lato'>Commentary</p>
          <Image
          src='/speaker.svg'
          width={26.1}
          height={19}
          alt='speaker'
          />
        </div>
        <div>
          <ChevronDown className='text-text-primary'/>
        </div>
      </div>
    </div>
  )
}

export default Commentary
