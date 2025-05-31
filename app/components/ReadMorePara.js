import { useState } from "react";

const ReadMoreParagraph = ({ text, children, maxChars = 300, disableTruncation = false }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  if (disableTruncation || expanded) {
    return (
      <div className="my-6 text-surah text-lato dark:text-dark-text">
        {children || text}
        {!disableTruncation && (
          <button
            onClick={toggleExpand}
            className="ml-2 text-hoverclr text-lato font-bold hover:cursor-pointer focus:outline-none"
          >
            Read Less
          </button>
        )}
      </div>
    );
  }

  // Truncate rendered content
  const fullText = children
    ? children.map((c) => (typeof c === 'string' ? c : c.props?.children)).join('')
    : text;

  const truncated = fullText.slice(0, maxChars);

  return (
    <div className="my-6 text-surah text-lato dark:text-dark-text">
      {truncated}...
      <button
        onClick={toggleExpand}
        className="ml-2 text-hoverclr text-lato font-bold hover:cursor-pointer focus:outline-none"
      >
        Read More
      </button>
    </div>
  );
};
export default ReadMoreParagraph;