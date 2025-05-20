'use client';
import { useState } from 'react';

const ReadMoreParagraph = ({ text, maxChars }) => {
  const [expanded, setExpanded] = useState(false);
  console.log(text.length)
  const toggleExpand = () => setExpanded(!expanded);

  const displayText = expanded ? text : text.slice(0, maxChars);

  return (
    <div className="my-6 text-surah text-lato">
      <p className='dark:text-dark-text'>
        {displayText}
        {!expanded && text.length > maxChars ? '...' : ''}
        {text.length > maxChars && (
        <button
          onClick={toggleExpand}
          className="ml-2 text-hoverclr text-lato text-bold hover:cursor-pointer focus:outline-none"
        >
          {expanded ? 'Read Less' : 'Read More'}
        </button>
      )}
      </p>
      
    </div>
  );
};

export default ReadMoreParagraph;
