"use client";
import { useState, useEffect } from 'react';
import { Plus, List, Check } from 'lucide-react';

export default function PlaylistButton({ videoId, userPlaylists = [] }) {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState(userPlaylists);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/playlists/${playlistId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoId })
      });

      if (response.ok) {
        setPlaylists(prev => prev.map(playlist => 
          playlist._id === playlistId 
            ? { ...playlist, videos: [...playlist.videos, videoId] }
            : playlist
        ));
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  const handleRemoveFromPlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/playlists/${playlistId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPlaylists(prev => prev.map(playlist => 
          playlist._id === playlistId 
            ? { ...playlist, videos: playlist.videos.filter(id => id !== videoId) }
            : playlist
        ));
      }
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || creatingPlaylist) return;

    setCreatingPlaylist(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newPlaylistName,
          description: '',
          videos: [videoId]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(prev => [data.playlist, ...prev]);
        setNewPlaylistName('');
        setShowPlaylists(false);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const isVideoInPlaylist = (playlist) => {
    return playlist.videos.includes(videoId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPlaylists(!showPlaylists)}
        className="flex items-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
      >
        <List className="h-4 w-4" />
        <span className="text-sm">Add to Playlist</span>
      </button>

      {showPlaylists && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Add to Playlist</h3>
            
            {/* Create New Playlist */}
            <form onSubmit={handleCreatePlaylist} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Create new playlist..."
                  className="flex-1 px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || creatingPlaylist}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {creatingPlaylist ? '...' : 'Create'}
                </button>
              </div>
            </form>

            {/* Existing Playlists */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map(playlist => {
                const isInPlaylist = isVideoInPlaylist(playlist);
                return (
                  <div
                    key={playlist._id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => isInPlaylist ? handleRemoveFromPlaylist(playlist._id) : handleAddToPlaylist(playlist._id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                        <List className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{playlist.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {playlist.videos.length} videos
                        </p>
                      </div>
                    </div>
                    {isInPlaylist && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                );
              })}
            </div>

            {playlists.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No playlists yet. Create one above!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
