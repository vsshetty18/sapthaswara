/* ============================================================
   SVARAVERSE AI — Community Page
   Feed | Members | Post Creation | Likes/Comments | Collabs
   ============================================================ */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Heart, MessageCircle, Share2, Plus, Search, Users,
  Music, Mic2, UserPlus, UserCheck, Send, Image,
  Video, X, MoreHorizontal, Sparkles, Trophy,
  MapPin, Star, Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth }     from '@/context/AuthContext'
import { UserRole, SubscriptionPlan, PostType, type CommunityPost, type CommunityMember } from '@/types'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_MEMBERS: CommunityMember[] = [
  {
    id: 'm1', displayName: 'Arjun Mehta',   username: 'arjunmelody',
    role: UserRole.CREATOR, plan: SubscriptionPlan.PRO,
    city: 'Delhi', instruments: ['voice', 'guitar'], genres: ['bollywood', 'indie'],
    followers: 4200, totalSongs: 87, isFollowing: false,
    photoURL: undefined,
  },
  {
    id: 'm2', displayName: 'Kavitha Nair',   username: 'kavitha_carnatic',
    role: UserRole.PREMIUM, plan: SubscriptionPlan.PREMIUM,
    city: 'Bangalore', instruments: ['voice', 'veena'], genres: ['carnatic', 'classical'],
    followers: 12500, totalSongs: 142, isFollowing: true,
    photoURL: undefined,
  },
  {
    id: 'm3', displayName: 'Rohit Verma',    username: 'rohit_beats',
    role: UserRole.CREATOR, plan: SubscriptionPlan.BASIC,
    city: 'Pune', instruments: ['tabla', 'keyboard'], genres: ['folk', 'fusion'],
    followers: 890, totalSongs: 34, isFollowing: false,
    photoURL: undefined,
  },
  {
    id: 'm4', displayName: 'Sneha Patel',    username: 'snehavocals',
    role: UserRole.CREATOR, plan: SubscriptionPlan.PRO,
    city: 'Ahmedabad', instruments: ['voice', 'harmonium'], genres: ['bhajan', 'bollywood'],
    followers: 5600, totalSongs: 67, isFollowing: false,
    photoURL: undefined,
  },
  {
    id: 'm5', displayName: 'Vikram Singh',   username: 'vikramraaga',
    role: UserRole.PREMIUM, plan: SubscriptionPlan.PREMIUM,
    city: 'Varanasi', instruments: ['voice', 'sitar'], genres: ['classical', 'ghazal'],
    followers: 28000, totalSongs: 210, isFollowing: true,
    photoURL: undefined,
  },
  {
    id: 'm6', displayName: 'Preethi Sharma', username: 'preethi_music',
    role: UserRole.USER, plan: SubscriptionPlan.FREE,
    city: 'Chennai', instruments: ['voice', 'flute'], genres: ['carnatic', 'folk'],
    followers: 320, totalSongs: 18, isFollowing: false,
    photoURL: undefined,
  },
]

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'p1', userId: 'm2', type: PostType.AUDIO,
    user: { id: 'm2', displayName: 'Kavitha Nair', username: 'kavitha_carnatic',
            photoURL: undefined, role: UserRole.PREMIUM, plan: SubscriptionPlan.PREMIUM },
    content: 'Just finished recording my rendition of Raga Bhairavi 🎶 This has been a 3-month journey. The taans in the middle section were the hardest to perfect. What do you think? Feedback welcome!',
    tags: ['carnatic', 'bhairavi', 'classical'],
    likesCount: 142, commentsCount: 28, sharesCount: 14,
    isLiked: false,
    createdAt: '2024-01-22T14:30:00',
    updatedAt: '2024-01-22T14:30:00',
  },
  {
    id: 'p2', userId: 'm1', type: PostType.TEXT,
    user: { id: 'm1', displayName: 'Arjun Mehta', username: 'arjunmelody',
            photoURL: undefined, role: UserRole.CREATOR, plan: SubscriptionPlan.PRO },
    content: 'Looking for a female vocalist for a Bollywood duet cover! 🎤 Preferably someone comfortable in the D-E scale range. We can do this remotely — I\'ll handle mixing. Drop a comment if interested! 🙏',
    tags: ['collab', 'bollywood', 'duet'],
    likesCount: 67, commentsCount: 41, sharesCount: 8,
    isLiked: true,
    createdAt: '2024-01-22T10:00:00',
    updatedAt: '2024-01-22T10:00:00',
  },
  {
    id: 'p3', userId: 'm5', type: PostType.TEXT,
    user: { id: 'm5', displayName: 'Vikram Singh', username: 'vikramraaga',
            photoURL: undefined, role: UserRole.PREMIUM, plan: SubscriptionPlan.PREMIUM },
    content: 'Pro tip for improving your riyaz consistency 🔥\n\n1. Practice at the same time every day\n2. Start with 10 minutes — build to 60\n3. Record yourself weekly and compare\n4. Focus on ONE weakness per week\n\n365 days later, you won\'t recognize your own voice (in a good way)! 💪',
    tags: ['tips', 'riyaz', 'practice', 'consistency'],
    likesCount: 389, commentsCount: 56, sharesCount: 92,
    isLiked: false,
    createdAt: '2024-01-21T18:00:00',
    updatedAt: '2024-01-21T18:00:00',
  },
  {
    id: 'p4', userId: 'm4', type: PostType.COLLAB,
    user: { id: 'm4', displayName: 'Sneha Patel', username: 'snehavocals',
            photoURL: undefined, role: UserRole.CREATOR, plan: SubscriptionPlan.PRO },
    content: 'Just dropped my Bhajan collab with @rohit_beats 🙏✨ We worked on this for 2 weeks remotely. His tabla arrangement is absolutely divine! Link in bio.',
    tags: ['bhajan', 'collab', 'devotional'],
    likesCount: 234, commentsCount: 33, sharesCount: 45,
    isLiked: false,
    createdAt: '2024-01-20T09:00:00',
    updatedAt: '2024-01-20T09:00:00',
  },
]

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function Avatar({
  member, size = 'md',
}: {
  member: Pick<CommunityMember, 'displayName' | 'photoURL' | 'plan'>
  size?:  'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl' }
  const isPremium = member.plan === SubscriptionPlan.PREMIUM || member.plan === SubscriptionPlan.PRO

  return (
    <div className={`relative flex-shrink-0`}>
      <div className={`${sizes[size]} rounded-xl overflow-hidden
                       ${isPremium ? 'ring-2 ring-gold-400/60' : ''}`}>
        {member.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photoURL} alt={member.displayName}
               className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-300 to-gold-500
                          flex items-center justify-center">
            <span className="font-display font-bold text-cream-50">
              {member.displayName[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {isPremium && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500
                        flex items-center justify-center border-2 border-cream-50
                        dark:border-walnut-900">
          <Star size={8} className="text-cream-50" />
        </div>
      )}
    </div>
  )
}

// ─── CREATE POST ─────────────────────────────────────────────────────────────

function CreatePost({ onPost }: { onPost: (content: string, type: PostType) => void }) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [content,  setContent]  = useState('')
  const [posting,  setPosting]  = useState(false)

  const handlePost = async () => {
    if (!content.trim()) return
    setPosting(true)
    await new Promise(r => setTimeout(r, 800))
    onPost(content, PostType.TEXT)
    setContent('')
    setExpanded(false)
    setPosting(false)
    toast.success('Post shared with the community! 🎵')
  }

  return (
    <div className="card-premium p-4">
      <div className="flex gap-3">
        {user && (
          <Avatar
            member={{ displayName: user.displayName, photoURL: user.photoURL, plan: user.plan }}
          />
        )}

        <div className="flex-1">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-left px-4 py-2.5 rounded-xl bg-sand-50/80
                         dark:bg-walnut-800/40 border border-sand-200/60
                         dark:border-walnut-700/40 text-sm text-brown-400
                         dark:text-cream-600 hover:border-gold-300/50
                         transition-all duration-200"
            >
              Share something with the community... 🎵
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                autoFocus
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind? Share a tip, collab request, or your latest creation..."
                rows={4}
                className="w-full form-input resize-none text-sm
                           dark:bg-walnut-800/60 dark:border-walnut-600/60
                           dark:text-cream-100"
              />

              {/* Post type quick buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-ui text-brown-400 dark:text-cream-500">
                  Add:
                </span>
                {[
                  { icon: Music,  label: 'Song',   color: 'text-blue-500'   },
                  { icon: Image,  label: 'Image',  color: 'text-green-500'  },
                  { icon: Video,  label: 'Video',  color: 'text-purple-500' },
                  { icon: Users,  label: 'Collab', color: 'text-teal-500'   },
                ].map(item => (
                  <button
                    key={item.label}
                    className="flex items-center gap-1 text-xs font-ui px-2.5 py-1
                               rounded-lg border border-sand-200 dark:border-walnut-600/50
                               text-brown-400 dark:text-cream-500 hover:border-gold-300/50
                               transition-colors"
                  >
                    <item.icon size={12} className={item.color} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => { setExpanded(false); setContent('') }}
                  className="text-xs font-ui text-brown-400 hover:text-walnut-700
                             dark:hover:text-cream-200 transition-colors px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!content.trim() || posting}
                  className="btn-primary text-sm px-5 py-2 flex items-center gap-2
                             disabled:opacity-60"
                >
                  {posting ? (
                    <div className="w-4 h-4 border-2 border-cream-200/50
                                    border-t-cream-50 rounded-full animate-spin" />
                  ) : <Send size={14} />}
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── POST CARD ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onLike,
  onComment,
}: {
  post:      CommunityPost
  onLike:    (id: string) => void
  onComment: (id: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentText,  setCommentText]  = useState('')

  const typeColors: Record<string, string> = {
    [PostType.AUDIO]:  'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    [PostType.VIDEO]:  'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    [PostType.IMAGE]:  'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    [PostType.COLLAB]: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    [PostType.TEXT]:   '',
  }

  const typeLabels: Record<string, string> = {
    [PostType.AUDIO]:  '🎵 Audio',
    [PostType.VIDEO]:  '🎬 Video',
    [PostType.IMAGE]:  '📸 Image',
    [PostType.COLLAB]: '🤝 Collab Request',
    [PostType.TEXT]:   '',
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1)  return 'Just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <div className="card-premium p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {post.user && (
            <Avatar member={post.user} />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-ui font-semibold text-walnut-800
                            dark:text-cream-100">
                {post.user?.displayName}
              </p>
              {post.user?.plan === SubscriptionPlan.PREMIUM && (
                <span className="premium-badge text-2xs">PRO</span>
              )}
              {post.type !== PostType.TEXT && (
                <span className={`text-2xs font-ui font-semibold px-2 py-0.5
                                  rounded-full ${typeColors[post.type]}`}>
                  {typeLabels[post.type]}
                </span>
              )}
            </div>
            <p className="text-2xs text-brown-400 dark:text-cream-500 font-ui">
              @{post.user?.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="text-brown-300 dark:text-cream-600 hover:text-brown-500
                           transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-walnut-700 dark:text-cream-200 leading-relaxed mb-3
                    font-ui">
        {renderContent(post.content)}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map(tag => (
            <span key={tag} className="text-2xs font-ui text-primary
                                       hover:text-primary-hover cursor-pointer
                                       transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-sand-100/80
                      dark:border-walnut-700/30">
        {/* Like */}
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                       font-ui font-medium transition-all duration-200
                       ${post.isLiked
                         ? 'text-red-500 bg-red-50 dark:bg-red-900/10'
                         : 'text-brown-400 dark:text-cream-500 hover:bg-sand-100 dark:hover:bg-walnut-700/40'
                       }`}
        >
          <Heart size={14} className={post.isLiked ? 'fill-red-500' : ''} />
          {post.likesCount}
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                     font-ui font-medium text-brown-400 dark:text-cream-500
                     hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
        >
          <MessageCircle size={14} />
          {post.commentsCount}
        </button>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied!')
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                     font-ui font-medium text-brown-400 dark:text-cream-500
                     hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
        >
          <Share2 size={14} />
          {post.sharesCount}
        </button>

        {/* Collab button */}
        {post.type === PostType.COLLAB && (
          <button
            onClick={() => toast.success('Collaboration request sent! 🤝')}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                       text-xs font-ui font-medium bg-teal-100 dark:bg-teal-900/20
                       text-teal-600 dark:text-teal-400 hover:bg-teal-200
                       dark:hover:bg-teal-900/30 transition-colors"
          >
            <Users size={12} />
            Collaborate
          </button>
        )}
      </div>

      {/* Comment input */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-sand-100/80
                        dark:border-walnut-700/30 flex gap-2 animate-fade-down">
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && commentText.trim()) {
                onComment(post.id)
                setCommentText('')
                setShowComments(false)
                toast.success('Comment added!')
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 form-input text-xs py-2 dark:bg-walnut-800/60
                       dark:border-walnut-600/60 dark:text-cream-100
                       dark:placeholder-cream-600"
          />
          <button
            onClick={() => {
              if (commentText.trim()) {
                onComment(post.id)
                setCommentText('')
                setShowComments(false)
                toast.success('Comment added!')
              }
            }}
            className="btn-primary px-3 py-2 text-xs"
          >
            <Send size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MEMBER CARD ─────────────────────────────────────────────────────────────

function MemberCard({
  member,
  onFollow,
}: {
  member:   CommunityMember
  onFollow: (id: string) => void
}) {
  return (
    <div className="card-premium p-4 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-center gap-3">
        <Avatar member={member} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-ui font-semibold text-walnut-800
                        dark:text-cream-100 truncate">
            {member.displayName}
          </p>
          <p className="text-2xs text-brown-400 dark:text-cream-500 truncate">
            @{member.username}
          </p>
          {member.city && (
            <p className="text-2xs text-brown-400 dark:text-cream-500 flex items-center
                          gap-0.5 mt-0.5">
              <MapPin size={9} /> {member.city}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center py-1.5 rounded-lg bg-sand-50/80
                        dark:bg-walnut-800/40">
          <p className="text-sm font-display font-bold text-walnut-700
                        dark:text-cream-200">
            {member.followers >= 1000
              ? `${(member.followers / 1000).toFixed(1)}K`
              : member.followers}
          </p>
          <p className="text-2xs font-ui text-brown-400 dark:text-cream-500">
            Followers
          </p>
        </div>
        <div className="text-center py-1.5 rounded-lg bg-sand-50/80
                        dark:bg-walnut-800/40">
          <p className="text-sm font-display font-bold text-walnut-700
                        dark:text-cream-200">
            {member.totalSongs}
          </p>
          <p className="text-2xs font-ui text-brown-400 dark:text-cream-500">
            Songs
          </p>
        </div>
      </div>

      {/* Genres */}
      {member.genres && member.genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {member.genres.slice(0, 3).map(g => (
            <span key={g} className="tag text-2xs capitalize">{g}</span>
          ))}
        </div>
      )}

      {/* Follow button */}
      <button
        onClick={() => onFollow(member.id)}
        className={`
          w-full py-2 rounded-xl text-xs font-ui font-semibold
          flex items-center justify-center gap-1.5 transition-all duration-200
          ${member.isFollowing
            ? 'bg-sand-100 dark:bg-walnut-700/50 text-brown-500 dark:text-cream-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-error'
            : 'btn-primary'
          }
        `}
      >
        {member.isFollowing
          ? <><UserCheck size={13} /> Following</>
          : <><UserPlus  size={13} /> Follow</>
        }
      </button>
    </div>
  )
}

// ─── COLLAB MATCHING CARD ─────────────────────────────────────────────────────

function CollabMatchCard() {
  const matches = [
    { name: 'Arjun Mehta',   match: 94, scale: 'D/E', genre: 'Bollywood',  icon: '🎸' },
    { name: 'Rohit Verma',   match: 87, scale: 'C#',  genre: 'Folk Fusion', icon: '🥁' },
    { name: 'Preethi Sharma',match: 81, scale: 'F',   genre: 'Carnatic',   icon: '🎤' },
  ]

  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-purple-500" />
        <p className="text-sm font-ui font-semibold text-walnut-800
                      dark:text-cream-100">
          AI Collab Matches
        </p>
      </div>
      <p className="text-2xs text-brown-400 dark:text-cream-500 font-ui mb-3">
        Based on your scale and genre preferences
      </p>

      <div className="flex flex-col gap-2.5">
        {matches.map((m, i) => (
          <div key={i}
               className="flex items-center gap-3 p-2.5 rounded-xl
                          bg-sand-50/60 dark:bg-walnut-800/30
                          hover:bg-gold-50/40 dark:hover:bg-gold-900/10
                          transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-200
                            to-gold-400 dark:from-gold-800 dark:to-walnut-700
                            flex items-center justify-center text-base flex-shrink-0">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-ui font-semibold text-walnut-700
                            dark:text-cream-200">
                {m.name}
              </p>
              <p className="text-2xs text-brown-400 dark:text-cream-500">
                Key: {m.scale} · {m.genre}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-display font-bold text-green-600
                            dark:text-green-400">
                {m.match}%
              </p>
              <p className="text-2xs text-brown-300 dark:text-cream-600">match</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => toast.success('Exploring more matches...')}
        className="mt-3 w-full text-xs font-ui text-primary hover:text-primary-hover
                   transition-colors flex items-center justify-center gap-1.5"
      >
        See all matches →
      </button>
    </div>
  )
}

// ─── COMMUNITY PAGE ───────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { user } = useAuth()

  const [posts,        setPosts]        = useState<CommunityPost[]>(MOCK_POSTS)
  const [members,      setMembers]      = useState<CommunityMember[]>(MOCK_MEMBERS)
  const [activeTab,    setActiveTab]    = useState<'feed' | 'members'>('feed')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [memberFilter, setMemberFilter] = useState<'all' | 'following'>('all')

  // Handle like
  const handleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        isLiked:    !p.isLiked,
        likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
      }
    }))
  }, [])

  // Handle comment
  const handleComment = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
    ))
  }, [])

  // Handle new post
  const handleNewPost = useCallback((content: string, type: PostType) => {
    const newPost: CommunityPost = {
      id:           `p${Date.now()}`,
      userId:       user?.uid || '',
      type,
      user: {
        id:          user?.uid || '',
        displayName: user?.displayName || '',
        username:    user?.username || '',
        photoURL:    user?.photoURL,
        role:        user?.role || UserRole.USER,
        plan:        user?.plan || SubscriptionPlan.FREE,
      },
      content,
      likesCount:   0,
      commentsCount:0,
      sharesCount:  0,
      isLiked:      false,
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
    }
    setPosts(prev => [newPost, ...prev])
  }, [user])

  // Handle follow
  const handleFollow = useCallback((memberId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m
      const following = !m.isFollowing
      toast.success(following ? `Following ${m.displayName}!` : `Unfollowed ${m.displayName}`)
      return { ...m, isFollowing: following }
    }))
  }, [])

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (memberFilter === 'following' && !m.isFollowing) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return m.displayName.toLowerCase().includes(q) ||
               m.username.toLowerCase().includes(q) ||
               m.city?.toLowerCase().includes(q) ||
               m.genres?.some(g => g.includes(q))
      }
      return true
    })
  }, [members, memberFilter, searchQuery])

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-walnut-900
                         dark:text-cream-100">
            Community 👥
          </h1>
          <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
            Connect, collaborate, and grow with Indian music creators
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-sand-100 dark:bg-walnut-800/60
                        rounded-2xl p-1.5 w-fit">
          {[
            { key: 'feed'    as const, label: 'Feed',    icon: Music },
            { key: 'members' as const, label: 'Creators',icon: Users },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-ui
                font-medium transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                  : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                }
              `}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed tab */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Posts */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <CreatePost onPost={handleNewPost} />
              {posts.map((post, i) => (
                <div key={post.id}
                     className="animate-fade-up"
                     style={{ animationDelay: `${i * 0.06}s` }}>
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* AI Collab matches */}
              <CollabMatchCard />

              {/* Suggested members */}
              <div className="card-premium p-4">
                <p className="text-sm font-ui font-semibold text-walnut-800
                              dark:text-cream-100 mb-3">
                  Suggested Creators
                </p>
                <div className="flex flex-col gap-2.5">
                  {members.filter(m => !m.isFollowing).slice(0, 3).map(member => (
                    <div key={member.id}
                         className="flex items-center gap-3 py-1">
                      <Avatar member={member} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-ui font-semibold text-walnut-700
                                     dark:text-cream-200 truncate">
                          {member.displayName}
                        </p>
                        <p className="text-2xs text-brown-400 dark:text-cream-500">
                          {member.followers.toLocaleString('en-IN')} followers
                        </p>
                      </div>
                      <button
                        onClick={() => handleFollow(member.id)}
                        className="text-2xs font-ui font-semibold text-primary
                                   hover:text-primary-hover transition-colors
                                   flex items-center gap-0.5"
                      >
                        <UserPlus size={12} /> Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending tags */}
              <div className="card-premium p-4">
                <p className="text-sm font-ui font-semibold text-walnut-800
                              dark:text-cream-100 mb-3">
                  Trending Topics
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { tag: '#riyaz',        posts: 1420 },
                    { tag: '#bollywood',    posts: 8900 },
                    { tag: '#collab',       posts: 650  },
                    { tag: '#carnatic',     posts: 2100 },
                    { tag: '#practicestreak',posts: 890 },
                  ].map(item => (
                    <button key={item.tag}
                            className="flex items-center justify-between py-1.5
                                       hover:text-primary transition-colors group">
                      <span className="text-sm font-ui font-medium text-primary
                                       group-hover:text-primary-hover">
                        {item.tag}
                      </span>
                      <span className="text-2xs text-brown-400 dark:text-cream-500">
                        {item.posts.toLocaleString('en-IN')} posts
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members tab */}
        {activeTab === 'members' && (
          <div className="flex flex-col gap-4">

            {/* Search + filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                            text-brown-400 dark:text-cream-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search creators..."
                  className="form-input w-full pl-9 text-sm py-2
                             dark:bg-walnut-800/60 dark:border-walnut-600/60
                             dark:text-cream-100 dark:placeholder-cream-600"
                />
              </div>
              <div className="flex items-center gap-1 bg-sand-100 dark:bg-walnut-800/60
                              rounded-xl p-1">
                {(['all', 'following'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setMemberFilter(f)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-ui font-medium
                      transition-all duration-200 capitalize
                      ${memberFilter === f
                        ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                        : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                      }
                    `}
                  >
                    {f === 'all' ? 'All Creators' : 'Following'}
                  </button>
                ))}
              </div>
            </div>

            {/* Members grid */}
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users size={40} className="text-brown-300 dark:text-cream-600" />
                <p className="text-sm font-ui text-brown-400 dark:text-cream-500">
                  No creators found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                              xl:grid-cols-4 gap-4">
                {filteredMembers.map((member, i) => (
                  <div
                    key={member.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <MemberCard
                      member={member}
                      onFollow={handleFollow}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
