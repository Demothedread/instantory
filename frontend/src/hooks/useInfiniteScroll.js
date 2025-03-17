import { useEffect, useState } from 'react';

const useInfiniteScroll = (callback, options = {}) => {
  const {
    threshold = 100,
    enabled = true,
    dependencies = []
  } = options;

  const [isFetching, setIsFetching] = useState(false);
  // Removed unused observerRef

  useEffect(() => {
    const handleScroll = async () => {
      if (!enabled || isFetching) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setIsFetching(true);
        await callback();
        setIsFetching(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, enabled, isFetching, threshold, ...dependencies]);

  return { isFetching };
};

export default useInfiniteScroll;
