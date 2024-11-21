import React, { useState, useEffect } from 'react';

interface TimelapseProps {
  images: string[];
  interval?: number; 
}

const Timelapse: React.FC<TimelapseProps> = ({ images, interval = 1500 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    if (images.length === 0 || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval / speedMultiplier);

    return () => clearInterval(timer);
  }, [images, interval, isPlaying, speedMultiplier]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentImageIndex(Number(event.target.value));
  };

  const handleSpeedChange = (multiplier: number) => {
    setSpeedMultiplier(multiplier);
  };

  if (images.length === 0) {
    return <div className="text-gray-500">No images available for timelapse.</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Image Display */}
      <div className="w-full max-w-2xl">
        <img
          src={images[currentImageIndex]}
          alt={`Timelapse ${currentImageIndex + 1}`}
          className="w-full h-auto rounded-md shadow-md"
          onError={(e) => {
            console.error('Error loading image:', e);
            (e.target as HTMLImageElement).src = '/path/to/fallback-image.png';
          }}
        />
      </div>

      {/* Controls */}
      <div className="mt-4 w-full max-w-2xl flex max-sm:flex-col items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            onClick={handlePlayPause}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          {/* Speed Controls */}
          <div className="flex gap-1">
            {[1, 2, 4, 8].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-1 rounded ${
                  speedMultiplier === speed
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Slider for Manual Navigation */}
        <input
          type="range"
          min="0"
          max={images.length - 1}
          value={currentImageIndex}
          onChange={handleSliderChange}
          className="w-full mx-4"
        />

        {/* Current Image Index */}
        <div className="text-gray-700 font-medium whitespace-nowrap dark:text-gray-300">
          Image <span className="font-bold">{currentImageIndex + 1}</span> of{' '}
          <span className="font-bold">{images.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Timelapse;