"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import VideoCard from '@/component/VideoCard';

export default function InfiniteScroll({ 
  initialVideos = [], 
  fetchMoreVideos, 
  hasMore = true,
  loading = false 
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreVideos, setHasMoreVideos] = useState(hasMore);
  const observerRef = useRef();

  const lastVideoElementRef = useCallback((node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreVideos) {
        loadMoreVideos();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMoreVideos]);

  const loadMoreVideos = async () => {
    if (isLoading || !hasMoreVideos) return;
    
    setIsLoading(true);
    try {
      const newVideos = await fetchMoreVideos(videos.length);
      if (newVideos && newVideos.length > 0) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setHasMoreVideos(false);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset videos when initialVideos change (e.g., category filter)
  useEffect(() => {
    setVideos(initialVideos);
    setHasMoreVideos(hasMore);
  }, [initialVideos, hasMore]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => (
          <div
            key={video._id}
            ref={index === videos.length - 1 ? lastVideoElementRef : null}
          >
            <VideoCard video={video} />
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
      
      {!hasMoreVideos && videos.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end of the video feed!</p>
        </div>
      )}
      
      {videos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos found. Try adjusting your filters or check back later!</p>
        </div>
      )}
    </div>
  );
}
