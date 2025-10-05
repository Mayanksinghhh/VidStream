"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileManagement({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
    socialLinks: {
      youtube: user?.socialLinks?.youtube || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || '',
      tiktok: user?.socialLinks?.tiktok || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setMessage('Profile updated successfully!');
        onUpdate();
        // Update the user context if needed
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, profileImage: data.url }));
        setMessage('Profile image updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to upload profile image');
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      setMessage('Failed to upload profile image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Profile Management</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {formData.profileImage ? (
              <img 
                src={formData.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Bio
          </label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                YouTube
              </label>
              <Input
                value={formData.socialLinks.youtube}
                onChange={(e) => setFormData({
                  ...formData, 
                  socialLinks: {...formData.socialLinks, youtube: e.target.value}
                })}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Twitter
              </label>
              <Input
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({
                  ...formData, 
                  socialLinks: {...formData.socialLinks, twitter: e.target.value}
                })}
                placeholder="https://twitter.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Instagram
              </label>
              <Input
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({
                  ...formData, 
                  socialLinks: {...formData.socialLinks, instagram: e.target.value}
                })}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                TikTok
              </label>
              <Input
                value={formData.socialLinks.tiktok}
                onChange={(e) => setFormData({
                  ...formData, 
                  socialLinks: {...formData.socialLinks, tiktok: e.target.value}
                })}
                placeholder="https://tiktok.com/@yourusername"
              />
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.subscribers?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.subscriptions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.watchLater?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Watch Later</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user?.playlists?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Playlists</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
