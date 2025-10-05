"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function DraftsScheduling({ userId, onRefresh }) {
  const [drafts, setDrafts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drafts');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDraftsAndScheduled();
  }, [userId]);

  const fetchDraftsAndScheduled = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [draftsRes, scheduledRes] = await Promise.all([
        fetch(`/api/dashboard/drafts?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`/api/dashboard/scheduled?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (draftsRes.ok) {
        const draftsData = await draftsRes.json();
        setDrafts(draftsData.drafts || []);
      }

      if (scheduledRes.ok) {
        const scheduledData = await scheduledRes.json();
        setScheduled(scheduledData.scheduled || []);
      }
    } catch (error) {
      console.error('Failed to fetch drafts and scheduled videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async (draftData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...draftData, userId })
      });

      if (response.ok) {
        const newDraft = await response.json();
        setDrafts([newDraft, ...drafts]);
        setShowCreateModal(false);
        onRefresh();
      } else {
        alert('Failed to create draft');
      }
    } catch (error) {
      console.error('Failed to create draft:', error);
      alert('Failed to create draft');
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDrafts(drafts.filter(draft => draft._id !== draftId));
        onRefresh();
      } else {
        alert('Failed to delete draft');
      }
    } catch (error) {
      console.error('Failed to delete draft:', error);
      alert('Failed to delete draft');
    }
  };

  const handleScheduleVideo = async (draftId, scheduleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ draftId, ...scheduleData, userId })
      });

      if (response.ok) {
        const scheduledVideo = await response.json();
        setScheduled([scheduledVideo, ...scheduled]);
        setDrafts(drafts.filter(draft => draft._id !== draftId));
        onRefresh();
      } else {
        alert('Failed to schedule video');
      }
    } catch (error) {
      console.error('Failed to schedule video:', error);
      alert('Failed to schedule video');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading drafts and scheduled videos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Drafts & Scheduling</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Draft
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'drafts'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Drafts ({drafts.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Scheduled ({scheduled.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'drafts' && (
        <DraftsList
          drafts={drafts}
          onDelete={handleDeleteDraft}
          onSchedule={handleScheduleVideo}
        />
      )}

      {activeTab === 'scheduled' && (
        <ScheduledList scheduled={scheduled} />
      )}

      {/* Create Draft Modal */}
      {showCreateModal && (
        <CreateDraftModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDraft}
        />
      )}
    </div>
  );
}

function DraftsList({ drafts, onDelete, onSchedule }) {
  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No drafts yet</h3>
        <p className="text-muted-foreground">Create your first draft to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <DraftCard
          key={draft._id}
          draft={draft}
          onDelete={onDelete}
          onSchedule={onSchedule}
        />
      ))}
    </div>
  );
}

function DraftCard({ draft, onDelete, onSchedule }) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {draft.title || 'Untitled Draft'}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {draft.description || 'No description'}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>📅 Created {new Date(draft.createdAt).toLocaleDateString()}</span>
              <span>📝 {draft.status || 'Draft'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              size="sm"
              onClick={() => setShowScheduleModal(true)}
            >
              Schedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(draft._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <ScheduleModal
          draft={draft}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={onSchedule}
        />
      )}
    </>
  );
}

function ScheduledList({ scheduled }) {
  if (scheduled.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No scheduled videos</h3>
        <p className="text-muted-foreground">Schedule your drafts to publish automatically</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduled.map((video) => (
        <div key={video._id} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {video.title || 'Untitled Video'}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {video.description || 'No description'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>⏰ Scheduled for {new Date(video.scheduledFor).toLocaleString()}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  new Date(video.scheduledFor) > new Date()
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {new Date(video.scheduledFor) > new Date() ? 'Pending' : 'Published'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateDraftModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: '',
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-foreground">Create Draft</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Video title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Video description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categories
                </label>
                <Input
                  value={formData.categories}
                  onChange={(e) => setFormData({...formData, categories: e.target.value})}
                  placeholder="Gaming, Tech, Music"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="tutorial, review, unboxing"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Draft
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({ draft, onClose, onSchedule }) {
  const [formData, setFormData] = useState({
    scheduledFor: '',
    isPublic: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(draft._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-foreground">Schedule Video</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Schedule Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm text-foreground">
                Make video public when published
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Schedule Video
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
