"use client";
import { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';

export default function WatchLaterButton({ videoId, initialInWatchLater = false }) {
  const [inWatchLater, setInWatchLater] = useState(initialInWatchLater);
  const [loading, setLoading] = useState(false);

  const handleToggleWatchLater = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/videos/${videoId}/watch-later`, {
        method: inWatchLater ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: 'current-user-id' }) // In real app, get from auth context
      });

      if (response.ok) {
        setInWatchLater(!inWatchLater);
      }
    } catch (error) {
      console.error('Error toggling watch later:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleWatchLater}
      disabled={loading}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        inWatchLater
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={inWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
    >
      {inWatchLater ? (
        <Check className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span className="text-sm">
        {inWatchLater ? 'Added' : 'Watch Later'}
      </span>
    </button>
  );
}
