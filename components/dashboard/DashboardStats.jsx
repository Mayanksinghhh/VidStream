"use client";
import { useState } from 'react';

export default function DashboardStats({ data, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Videos',
      value: data.totalVideos || 0,
      icon: '🎥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Total Views',
      value: data.totalViews || 0,
      icon: '👁️',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Total Likes',
      value: data.totalLikes || 0,
      icon: '❤️',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Subscribers',
      value: data.subscribers || 0,
      icon: '👥',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-border/50`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Videos</h3>
          <div className="space-y-3">
            {data.recentVideos && data.recentVideos.length > 0 ? (
              data.recentVideos.slice(0, 3).map((video) => (
                <div key={video._id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-12 h-8 bg-primary/20 rounded flex items-center justify-center">
                    <span className="text-xs">📹</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {video.title || 'Untitled Video'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No videos uploaded yet</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
              <span>📤</span>
              <span className="text-sm font-medium">Upload New Video</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              <span>📝</span>
              <span className="text-sm font-medium">Create Draft</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              <span>⚙️</span>
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
