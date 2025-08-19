'use client'
import { useParams } from 'next/navigation';
import React from 'react'
import { articles } from '../../../../../helpers/articles';

const page = () => {
  const params = useParams()
  const articleIndex = Number(params.articleId)
  const article = articles[articleIndex]
  if (!article) return <div>Article not found</div>;

  // Render differently based on isShort
  if (article.isShort) {
    // Short article full-window appearance
    return (
      <div className='flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-blue-100 to-white'>
        <div className="w-full max-w-md mx-auto mt-[30px] px-4 text-text-primary font-lato bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
          <p className="italic text-sky-700 mb-4">“{article.content.quote}”</p>
          <p className="mb-4">{article.content.mainText}</p>
          <p className='mb-4'>{article.content.additionalText}</p>
          <p className='mb-4'>{article.content.moreText}</p>
          <p className='mb-4'>{article.content.endText}</p>
          <div className='mt-6 text-xs text-gray-500'>
            <p>Source: <span className='text-hoverclr'>{article.content.source}</span></p>
            <p>Quran Verses: <span className='text-hoverclr'>{article.content.quranVerse}</span></p>
            <p>Hadith Reference: <span className='text-hoverclr'>{article.content.hadithReference}</span></p>
          </div>
        </div>
      </div>
    );
  }
  // Long article full-window appearance
  return (
    <div className='flex flex-col items-center justify-center w-full min-h-screen bg-white'>
      <div className="w-full max-w-3xl mx-auto mt-[30px] px-4 text-text-primary font-lato">
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        <p className="italic text-sky-700 mb-4">“{article.content.quote}”</p>
        <p>{article.content.mainText}</p>
        <p className='mt-10'>{article.content.additionalText}</p>
        <p className='mt-10'>{article.content.moreText}</p>
        <p className='mt-10'>{article.content.endText}</p>
        <div className='mt-10'>
          <p className='mb-2'>Source: <span className='text-hoverclr'>{article.content.source}</span></p>
          <p className='mb-2'>Quran Verses: <span className='text-hoverclr'>{article.content.quranVerse}</span></p>
          <p>Hadith Reference: <span className='text-hoverclr'>{article.content.hadithReference}</span></p>
        </div>
      </div>
    </div>
  )
}

export default page
