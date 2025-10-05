"use client";
import { useState } from 'react';
import { Share2, Copy, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

export default function ShareButton({ videoId, videoTitle, videoUrl }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/videos/${videoId}`;
  const shareText = `Check out this video: ${videoTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSocialShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm">Share</span>
      </button>

      {showShareMenu && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Share Video</h3>
            
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center space-x-3 p-2 hover:bg-muted/50 rounded transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="text-sm">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Social Media Shares */}
            <div className="space-y-1 mt-2">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-full flex items-center space-x-3 p-2 hover:bg-muted/50 rounded transition-colors"
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Share on Twitter</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('facebook')}
                className="w-full flex items-center space-x-3 p-2 hover:bg-muted/50 rounded transition-colors"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Share on Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-full flex items-center space-x-3 p-2 hover:bg-muted/50 rounded transition-colors"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                <span className="text-sm">Share on LinkedIn</span>
              </button>
            </div>

            {/* Native Share (if supported) */}
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center space-x-3 p-2 hover:bg-muted/50 rounded transition-colors mt-2 border-t border-border pt-2"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">More Options</span>
              </button>
            )}

            {/* Share URL Display */}
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground break-all">
              {shareUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
