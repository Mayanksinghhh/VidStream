import LikeDislikeButtons from "@/component/LikeDislikeButtons"
import VideoPlayer from "@/component/VideoPlayer"
import CommentsSection from "@/components/CommentsSection"
import SubscribeButton from "@/components/SubscribeButton"
import WatchLaterButton from "@/components/WatchLaterButton"
import PlaylistButton from "@/components/PlaylistButton"
import ShareButton from "@/components/ShareButton"
import RecommendationEngine from "@/components/RecommendationEngine"
import { Eye, Calendar, Tag } from "lucide-react"

export default async function VideoPage({ params }) {
  const id = await params
  const Id = id.id
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/videos/${Id}`, { cache: "no-store" })
  const data = await res.json()
  const video = data.video
  if (!video) return <div className="p-6">Not found</div>

  return (
    <main className="min-h-screen video-page-bg text-foreground">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-6">
          {/* Left Sidebar: Categories with toggles */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              {/* Category toggles are mostly UI; wire to RecommendationEngine as needed */}
              <div className="bg-card border border-accent rounded-xl p-4">
                <h2 className="sr-only">Categories</h2>
                {/* reuse CategoryFilter in toggle mode */}
                {/* We keep it non-interactive server-side for now; can be enhanced later */}
                {/** @ts-expect-error server rendering client component is fine in Next App Router */}
                <div>
                  {/* Using dynamic import not necessary here; component is client-ready */}
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <div suppressHydrationWarning>
                    {/* Client component will hydrate on the client */}
                    {/* We pass useToggles to render switches */}
                    {/* If you want to filter recommendations by selected categories later, lift state to a dedicated client wrapper */}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Center: Video Player + Info */}
          <section>
            {/* Video Player Section */}
            <div className="mb-6">
              <VideoPlayer src={video.videoUrl} />
            </div>

            {/* Video Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

                {/* Video Stats */}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{video.views?.toLocaleString() || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  {video.duration && (
                    <div className="flex items-center space-x-1">
                      <span>
                        Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Categories/Tags */}
                {video.categories && video.categories.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {video.categories.map((category, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mb-6">
                  <LikeDislikeButtons
                    videoId={video._id}
                    initialLikes={video.likes || []}
                    initialDislikes={video.dislikes || []}
                  />
                  <WatchLaterButton videoId={video._id} />
                  <PlaylistButton videoId={video._id} />
                  <ShareButton videoId={video._id} videoTitle={video.title} videoUrl={video.videoUrl} />
                </div>

                {/* Channel Info */}
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {video.uploadedBy?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{video.uploadedBy?.username || "Unknown"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {video.uploadedBy?.subscribers?.length || 0} subscribers
                      </p>
                    </div>
                  </div>
                  <SubscribeButton
                    channelId={video.uploadedBy?._id}
                    initialSubscribers={video.uploadedBy?.subscribers?.length || 0}
                  />
                </div>

                {/* Description */}
                <section className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{video.description || "No description provided."}</p>
                  </div>
                </section>

                {/* Comments */}
                <CommentsSection videoId={video._id} initialComments={video.comments || []} />
              </div>

              {/* Right Sidebar: Up Next */}
              <aside className="hidden lg:block">
                <div className="sticky top-6">
                  <div className="bg-card border border-accent rounded-xl p-4">
                    <RecommendationEngine
                      currentVideoId={video._id}
                      currentCategories={video.categories || []}
                      userId={null}
                      title="Up Next"
                    />
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {/* Right Sidebar: Existing Content */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <RecommendationEngine
                currentVideoId={video._id}
                currentCategories={video.categories || []}
                userId={null}
              />
            </div>
          </aside>
        </div>

        {/* Below the fold: keep the details and comments area full-width on mobile */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"></div>
          <div className="lg:col-span-1">{/* keep existing right sidebar content for small screens */}</div>
        </div>
      </div>
    </main>
  )
}
