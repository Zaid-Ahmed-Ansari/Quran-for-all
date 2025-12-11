// components/InspirationCard.tsx
import Image from "next/image";



export default function InspirationCard({
  backgroundImage,
  title,
  quote,
  quoteReference,
  content,
  source,
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg text-gray-800 w-full max-w-md mx-auto"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 m-4 rounded-md">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="italic text-sm text-sky-700 mb-4">
          “{quote}”<br />
          <span className="block text-right font-medium not-italic text-slate-600">
            {quoteReference}
          </span>
        </p>
        <p className="text-sm leading-relaxed mb-4 whitespace-pre-line">{content}</p>
        <p className="text-[11px] text-gray-500">{source}</p>
      </div>
    </div>
  );
}
