"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const AudioPlayer = ({ audioSrc, audioTitle, onClose,onTimeUpdate,isVisible }) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const animationFrame = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // Update time and buffer via requestAnimationFrame
  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isDragging) setCurrentTime(audio.currentTime);

    const bufferedEnd = audio.buffered.length
      ? audio.buffered.end(audio.buffered.length - 1)
      : 0;

    setBuffered((bufferedEnd / audio.duration) * 100 || 0);

    animationFrame.current = requestAnimationFrame(updateProgress);
  }, [isDragging]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), duration);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = () => {
    setIsDragging(true);
    const handleMouseMove = (e) => {
      const progress = progressRef.current;
      const audio = audioRef.current;
      if (!progress || !audio) return;

      const rect = progress.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const newTime = Math.min(Math.max((moveX / rect.width) * duration, 0), duration);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Load metadata
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioSrc]);

  // Sync playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
      animationFrame.current = requestAnimationFrame(updateProgress);
    } else {
      audio.pause();
      cancelAnimationFrame(animationFrame.current);
    }

    return () => cancelAnimationFrame(animationFrame.current);
  }, [isPlaying, updateProgress]);

  // Reset player on audioSrc change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsLoading(true);
    setCurrentTime(0);
    setBuffered(0);
    setDuration(0);
    setIsPlaying(false);
    audio.load();
  }, [audioSrc]);
  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const timeUpdateHandler = () => {
    if (onTimeUpdate) {
      onTimeUpdate(audio.currentTime);
    }
  };

  audio.addEventListener('timeupdate', timeUpdateHandler);
  return () => {
    audio.removeEventListener('timeupdate', timeUpdateHandler);
  };
}, [onTimeUpdate]);

  const progressPercent = (currentTime / duration) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full bg-white dark:bg-dark-nav shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          onTimeUpdate={() => onTimeUpdate(audioRef.current.currentTime)}
          
        />

        {/* Progress bar */}
        <div className="">
          <div 
            ref={progressRef}
            className="h-1   bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            {/* Buffered progress */}
            <div 
              className="absolute h-full bg-gray-300 dark:bg-gray-600 rounded-full"
              style={{ width: `${Math.min(100, buffered)}%` }}
            />
            
            {/* Current progress */}
            <div 
              className="absolute h-full bg-hoverclr rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            >
              <div 
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-hoverclr  rounded-full shadow-lg transition-opacity duration-150 ${
                  isDragging || progressPercent > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Main player content */}
        <div className="flex items-center justify-between pl-2 pr-2 pt-2 pb-2">
          {/* Left section - Album art and title */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0">
              QURAN
              <br />
              COMMENTARY
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-lato font-bold text-text-primary dark:text-dark-text mb-1 truncate">
                {audioTitle}
              </h3>
              {isLoading && (
                <p className="text-sm text-blue-500 dark:text-blue-400">Loading...</p>
              )}
            </div>
          </div>

          {/* Center section - Controls */}
          <div className="flex items-center space-x-4 mx-8">
            {/* Skip backward */}
            <button
              onClick={() => skipTime(-10)}
              className="hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Skip back 10 seconds"
              disabled={isLoading || !duration}
            >
              <Image
                src="/previous.svg"
                alt="Previous"
                width={20}
                height={20}
              />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="disabled:opacity-50 hover:scale-105 disabled:cursor-not-allowed"
              title={isPlaying ? "Pause" : "Play"}
              disabled={isLoading || !audioSrc}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Image
                  src="/pauseb.svg"
                  alt="Pause"
                  width={50}
                  height={50}
                  className="p-2"
                />
              ) : (
                <Image
                  src="/play2.svg"
                  alt="Play"
                  width={50}
                  height={50}
                />
              )}
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skipTime(10)}
              className="hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Skip forward 10 seconds"
              disabled={isLoading || !duration}
            >
              <Image
                src="/next.svg"
                alt="next"
                width={20}
                height={20}
              />
            </button>
          </div>

          {/* Right section - Time and additional controls */}
          <div className="flex items-center space-x-4 flex-1 justify-end min-w-0">
            {/* Time display */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-mono">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            {/* Additional controls */}
            <div className="flex items-center space-x-2">
              <button
                className="py-1 px-3 rounded-full flex gap-2 border border-[#DCE0E3] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                title="Library"
              >
                <Image src="/library.svg" alt="Library" width={13} height={16} />
                <span className="text-text-primary font-lato">Library</span>
              </button>
              
              <button
                className="py-1 px-3 rounded-full flex gap-2 border border-[#DCE0E3] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                title="Save"
              >
                <Image src="/bookmark.svg" alt="Save" width={13} height={13} />
                <span className="text-text-primary font-lato">Save</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;