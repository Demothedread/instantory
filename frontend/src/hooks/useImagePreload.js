import { useEffect, useRef, useState } from 'react';

const useImagePreload = (imageUrls, options = {}) => {
  const {
    batchSize = 5,
    preloadThreshold = 3,
    enabled = true
  } = options;

  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isPreloading, setIsPreloading] = useState(false);
  const currentBatchRef = useRef(0);

  useEffect(() => {
    if (!enabled || !Array.isArray(imageUrls) || imageUrls.length === 0) return;

    const preloadBatch = async () => {
      setIsPreloading(true);
      const startIdx = currentBatchRef.current * batchSize;
      const endIdx = Math.min(startIdx + batchSize, imageUrls.length);
      const batch = imageUrls.slice(startIdx, endIdx);

      await Promise.all(
        batch.map(url => {
          if (!url || loadedImages.has(url)) return Promise.resolve();
          
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImages(prev => new Set([...prev, url]));
              resolve();
            };
            img.onerror = resolve; // Continue even if image fails
            img.src = url;
          });
        })
      );

      currentBatchRef.current++;
      setIsPreloading(false);

      // Preload next batch if we're close to the end
      if (endIdx + preloadThreshold >= imageUrls.length) {
        currentBatchRef.current = 0; // Reset for next round
      }
    };

    preloadBatch();
  }, [imageUrls, batchSize, enabled, preloadThreshold, loadedImages]);

  const isImageLoaded = (url) => {
    return loadedImages.has(url);
  };

  return {
    isPreloading,
    isImageLoaded,
    loadedCount: loadedImages.size
  };
};

export default useImagePreload;
