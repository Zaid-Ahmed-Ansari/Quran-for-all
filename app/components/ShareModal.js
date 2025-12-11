'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const ShareModal = ({ showShareModal, setShowShareModal }) => {
  const [pageURL, setPageURL] = useState('');
  const [copied, setCopied] = useState(false);
   // starts open

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageURL(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="p-6 rounded shadow-lg w-[500px] relative bg-white">
            {/* Close Modal */}
            <button
              className="absolute top-2 right-2"
              onClick={() => setShowShareModal(false)}
              aria-label="Close Share Modal"
            >
              <X className="text-text-primary" />
            </button>

            <h2 className="text-lg font-lato text-surah font-bold mb-4">Share</h2>
            <div className="flex justify-between mb-4">
              {/* Original social button sizes preserved */}
              <div className="text-text-primary flex flex-col items-center justify-center">
                <div className="bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer">
                  <Image src="/facebook.svg" width={14} height={26} alt="Facebook" />
                </div>
                Facebook
              </div>
              <div className="text-text-primary flex flex-col items-center justify-center">
                <div className="bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer">
                  <Image src="/twitter.svg" width={23} height={23} alt="Twitter" />
                </div>
                Twitter
              </div>
              <div className="text-text-primary flex flex-col items-center justify-center">
                <div className="bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer">
                  <Image src="/instagram.svg" width={30} height={30} alt="Instagram" />
                </div>
                Instagram
              </div>
              <div className="text-text-primary flex flex-col items-center justify-center">
                <div className="bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer">
                  <Image src="/whatsapp.svg" width={30} height={30} alt="WhatsApp" />
                </div>
                WhatsApp
              </div>
              <div className="text-text-primary flex flex-col items-center justify-center">
                <div className="bg-[#DCE0E34D] rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer">
                  <Image src="/print.svg" width={25} height={25} alt="Print" />
                </div>
                Print
              </div>
            </div>

            <h2 className="text-lg font-lato text-surah font-bold mb-4">Page Link</h2>
            <div className="flex bg-[#DCE0E34D] rounded-xl items-center relative">
              <input
                className="w-full focus:outline-none font-lato text-[#6D7173] p-2 bg-transparent"
                readOnly
                value={pageURL}
              />
              <Image
                src="/copy.svg"
                width={17.29}
                height={17.29}
                alt="Copy"
                onClick={handleCopyLink}
                className="mr-2 hover:cursor-pointer"
              />
              {copied && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-hoverclr text-white font-lato font-bold w-[281px] h-[65px] flex items-center justify-center text-sm px-3 py-1 rounded-md shadow-md z-50">
                  Your Link has been copied!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareModal;
