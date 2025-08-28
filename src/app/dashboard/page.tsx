'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/useToast';
import { useAuth } from '@/lib/store';
import { professionalCareerProfileService } from '@/services/professionalCareerProfileService';
import { jobHuntingSettingsService } from '@/services/jobHuntingSettingsService';
import jobSubscriptionService from '@/services/jobSubscriptionService';
import { userService } from '@/services/userService';
import { getFullImageUrl } from '@/lib/utils';
import { 
  User, 
  Briefcase, 
  Download, 
  Search, 
  Activity, 
  Settings, 
  Crown,
  FileText,
  Award,
  GraduationCap,
  Users,
  TrendingUp,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Calendar,
  MapPin,
  ShieldCheck,
  Heart, 
  MessageCircle, 
  ThumbsUp, 
  Lightbulb, 
  PartyPopper,
  Image as ImageIcon,
  Send,
  Loader2,
  MoreHorizontal,
  Trash2,
  Smile,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MessageSquare } from 'lucide-react'
import { ProfileSwitcher } from '@/components/ui/profile-switcher';
import Link from 'next/link';
import { networkingService } from '@/services/networkingService';
import { postService } from '@/services/postService';
import { serviceService } from '@/services/serviceService';

// Full Posts functionality for dashboard
function DashboardPosts() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [collapsedPosts, setCollapsedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState<any>({
    content: '',
    image: undefined
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Word helpers
  const WORD_LIMIT = 1500;
  const PREVIEW_WORDS = 30;
  const countWords = (text: string): number => {
    if (!text) return 0;
    return (text.trim().match(/\S+/g) || []).length;
  };
  const truncateWords = (text: string, maxWords: number): string => {
    const words = (text.trim().match(/\S+/g) || []);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
  };
  const isLongPost = (text: string): boolean => countWords(text) > PREVIEW_WORDS;
  const getPreview = (text: string): string => truncateWords(text, PREVIEW_WORDS);
  
  // Comment pagination state
  const [commentPages, setCommentPages] = useState<Record<string, number>>({});
  const [loadingMoreComments, setLoadingMoreComments] = useState<Set<string>>(new Set());
  const COMMENTS_PER_PAGE = 10;

  // Load posts
  const loadPosts = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await postService.getPosts(page);
      
      if (append) {
        setPosts(prev => [...prev, ...response.data.posts]);
      } else {
        setPosts(response.data.posts);
      }
      // Default-collapse long posts
      const idsToCollapse = new Set<string>();
      (response.data.posts || []).forEach((p: any) => {
        if (p?.id && isLongPost(p?.content || '')) idsToCollapse.add(p.id);
      });
      setCollapsedPosts(idsToCollapse);
      
      setHasNextPage(response.data.pagination.hasNextPage);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (error) {
      console.error('Error loading posts:', error);
      showError("Failed to load posts", "Error");
    } finally {
      setLoading(false);
    }
  };

  // Load more posts
  const loadMore = () => {
    if (hasNextPage && !loading) {
      loadPosts(currentPage + 1, true);
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      showError("Post content is required", "Error");
      return;
    }
    if (countWords(newPost.content) > WORD_LIMIT) {
      showError(`Post exceeds ${WORD_LIMIT} words. Please shorten it.`, "Too long");
      return;
    }

    try {
      setCreating(true);
      const postData = {
        content: newPost.content.trim(),
        image: selectedImage || undefined
      };

      const response = await postService.createPost(postData);
      
      // Add new post to the beginning of the list
      setPosts(prev => [response.data, ...prev]);
      
      // Reset form
      setNewPost({ content: '', image: undefined });
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateForm(false);
      
      showSuccess("Post created successfully", "Success");
    } catch (error) {
      console.error('Error creating post:', error);
      showError("Failed to create post", "Error");
    } finally {
      setCreating(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError("Image size must be less than 5MB", "Error");
        return;
      }

      if (!file.type.startsWith('image/')) {
        showError("Please select a valid image file", "Error");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Toggle reaction
  const handleReaction = async (postId: string, type: 'like' | 'love' | 'insightful' | 'celebrate') => {
    try {
      const response = await postService.toggleReaction(postId, type);
      
      // Update post reactions in the list
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const newReactionCounts = { ...post.reactionCounts };
          
          if (response.data.action === 'added') {
            newReactionCounts[type]++;
          } else if (response.data.action === 'removed') {
            newReactionCounts[type] = Math.max(0, newReactionCounts[type] - 1);
          }
          
          return {
            ...post,
            reactionCounts: newReactionCounts,
            totalReactions: (Object.values(newReactionCounts as Record<string, number>) as number[]).reduce((a: number, b: number) => a + b, 0)
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling reaction:', error);
      showError("Failed to update reaction", "Error");
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await postService.deletePost(postToDelete);
      setPosts(prev => prev.filter(post => post.id !== postToDelete));
      showSuccess("Post deleted successfully", "Success");
    } catch (error) {
      console.error('Error deleting post:', error);
      showError("Failed to delete post", "Error");
    } finally {
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  // Toggle comments section
  const toggleComments = async (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
        // Fetch comments when expanding
        loadCommentsForPost(postId);
      }
      return newSet;
    });
  };

  // Load comments for a specific post
  const loadCommentsForPost = async (postId: string) => {
    try {
      setLoadingComments(prev => new Set(prev).add(postId));
      const response = await postService.getComments(postId, 1);
      
      // Update post with comments
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: response.data.comments,
            totalComments: post.commentCount ?? response.data.pagination?.total ?? response.data.pagination?.totalCount ?? response.data.comments.length,
            hasMoreComments: (post.commentCount ?? response.data.pagination?.total ?? response.data.pagination?.totalCount ?? response.data.comments.length) > response.data.comments.length
          };
        }
        return post;
      }));
      
      // Set initial page
      setCommentPages(prev => ({ ...prev, [postId]: 1 }));
    } catch (error) {
      console.error('Error loading comments:', error);
      showError("Failed to load comments", "Error");
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };
  
  // Load more comments for a post
  const loadMoreComments = async (postId: string) => {
    try {
      setLoadingMoreComments(prev => new Set(prev).add(postId));
      const currentPage = commentPages[postId] || 1;
      const nextPage = currentPage + 1;
      
      const response = await postService.getComments(postId, nextPage);
      
      // Update post with additional comments
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, ...response.data.comments],
            hasMoreComments: (post.totalComments ?? post.commentCount ?? 0) > ([...post.comments, ...response.data.comments].length)
          };
        }
        return post;
      }));
      
      // Update page count
      setCommentPages(prev => ({ ...prev, [postId]: nextPage }));
    } catch (error) {
      console.error('Error loading more comments:', error);
      showError("Failed to load more comments", "Error");
    } finally {
      setLoadingMoreComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Handle comment input change
  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // Submit comment
  const handleSubmitComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) {
      showError("Comment content is required", "Error");
      return;
    }

    try {
      setSubmittingComments(prev => new Set(prev).add(postId));
      
      const commentData = { content };
      const response = await postService.addComment(postId, commentData);
      
      // Update post with new comment
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, response.data],
            commentCount: post.commentCount + 1
          };
        }
        return post;
      }));
      
      // Clear comment input
      setCommentInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[postId];
        return newInputs;
      });
      
      showSuccess("Comment added successfully", "Success");
    } catch (error) {
      console.error('Error adding comment:', error);
      showError("Failed to add comment", "Error");
    } finally {
      setSubmittingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await postService.deleteComment(commentId);
      
      // Update the post's comments
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter((comment: any) => comment.id !== commentId),
            commentCount: Math.max(0, (post.commentCount || 0) - 1)
          };
        }
        return post;
      }));
      
      showSuccess("Comment deleted successfully", "Success");
    } catch (error) {
      console.error('Error deleting comment:', error);
      showError("Failed to delete comment", "Error");
    }
  };

  // Get reaction icon
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like': return <ThumbsUp className="h-4 w-4" />;
      case 'love': return <Heart className="h-4 w-4" />;
      case 'insightful': return <Lightbulb className="h-4 w-4" />;
      case 'celebrate': return <PartyPopper className="h-4 w-4" />;
      default: return <ThumbsUp className="h-4 w-4" />;
    }
  };

  // Get reaction color
  const getReactionColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-blue-600';
      case 'love': return 'text-red-600';
      case 'insightful': return 'text-yellow-600';
      case 'celebrate': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Post Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Create a Post</CardTitle>
        </CardHeader>
        <CardContent>
          {!showCreateForm ? (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full h-12 sm:h-14 text-base"
              variant="outline"
            >
              What's on your mind?
            </Button>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <Textarea
                placeholder="Share your thoughts, achievements, or updates..."
                value={newPost.content}
                onChange={(e) => {
                  const next = e.target.value;
                  // Soft-enforce 1500-word limit: trim extra words
                  const words = (next.trim().match(/\S+/g) || []);
                  if (words.length > WORD_LIMIT) {
                    const trimmed = words.slice(0, WORD_LIMIT).join(' ');
                    setNewPost((prev: any) => ({ ...prev, content: trimmed }));
                  } else {
                    setNewPost((prev: any) => ({ ...prev, content: next }));
                  }
                }}
                className="min-h-[100px] text-sm sm:text-base"
              />
              
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded-lg"
                  />
                  <Button
                    onClick={removeImage}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" size="sm" asChild className="text-sm">
                      <span>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </span>
                    </Button>
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {countWords(newPost.content)}/{WORD_LIMIT} words
                  </span>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={creating || !newPost.content.trim()}
                    size="sm"
                    className="text-sm"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4 sm:space-y-6">
        {posts && posts.length > 0 ? posts
          .filter(post => post && post.author) // Filter out posts without author data
          .map((post) => {
          
          return (
            <Card key={post.id}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src={post.author.profilePicture} />
                      <AvatarFallback className="text-sm">
                        {post.author.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base truncate">
                        {post.author.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {user?.id === post.userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">
                  {collapsedPosts.has(post.id) && isLongPost(post.content)
                    ? getPreview(post.content) + '...'
                    : post.content}
                </div>
                {isLongPost(post.content) && (
                  <button
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => setCollapsedPosts(prev => {
                      const next = new Set(prev);
                      if (next.has(post.id)) next.delete(post.id); else next.add(post.id);
                      return next;
                    })}
                  >
                    {collapsedPosts.has(post.id) ? 'Read more' : 'Show less'}
                  </button>
                )}
                
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post image" 
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
                
                <Separator />
                
                {/* Reactions Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
                    {post.reactionCounts && (Object.entries(post.reactionCounts as Record<string, number>) as [string, number][]) .map(([type, count]) => (
                      count > 0 && (
                        <div key={type} className="flex items-center space-x-1">
                          {getReactionIcon(type)}
                          <span className="text-xs sm:text-sm text-gray-600">{count as number}</span>
                        </div>
                      )
                    ))}
                    {post.commentCount > 0 && (
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs sm:text-sm text-gray-600">{post.commentCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Action Buttons - Single React Button with Dropdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-sm"
                        >
                          <Smile className="h-4 w-4" />
                          <span>React</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {(['like', 'love', 'insightful', 'celebrate'] as const).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => handleReaction(post.id, type)}
                            className={`flex items-center space-x-2 ${getReactionColor(type)}`}
                          >
                            {getReactionIcon(type)}
                            <span className="capitalize">{type}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-sm"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Comment</span>
                      {expandedComments.has(post.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="space-y-3 pt-3 border-t">
                    {/* Comment Input */}
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="text-sm">
                          {user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                          className="min-h-[60px] text-sm resize-none"
                          maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {(commentInputs[post.id] || '').length}/500
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={submittingComments.has(post.id) || !commentInputs[post.id]?.trim()}
                          >
                            {submittingComments.has(post.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    {loadingComments.has(post.id) ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
                      </div>
                    ) : post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3">
                        {/* Show only latest 10 comments initially */}
                        {post.comments
                          .filter((comment: any) => comment && comment.author) // Filter out comments without author data
                          .map((comment: any) => (
                            <div key={comment.id} className="flex items-start space-x-2">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={comment.author.profilePicture} />
                                <AvatarFallback className={`text-sm ${!comment.author.id ? 'bg-gray-300' : ''}`}>
                                  {!comment.author.id ? 'D' : (comment.author.name?.[0] || '?')}
                                </AvatarFallback>
                              </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className={`rounded-lg p-3 ${!comment.author.id ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`font-medium text-sm ${!comment.author.id ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {comment.author.name}
                                    {!comment.author.id && <span className="text-xs text-gray-400 ml-1">(deleted)</span>}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                              </div>
                              {user?.id === comment.userId && comment.author.id && (
                                <div className="mt-1 flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-gray-500 hover:text-red-600"
                                    onClick={() => handleDeleteComment(comment.id, post.id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Load more comments button */}
                        {(post.totalComments ?? post.commentCount ?? 0) > (post.comments?.length || 0) && (
                          <div className="text-center pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadMoreComments(post.id)}
                              disabled={loadingMoreComments.has(post.id)}
                              className="text-sm"
                            >
                              {loadingMoreComments.has(post.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                `Load ${Math.min(COMMENTS_PER_PAGE, Math.max(0, (post.totalComments ?? post.commentCount ?? 0) - (post.comments?.length || 0)))} more comments`
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
        }) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm sm:text-base">No posts found</p>
          </div>
        )}
        
        {/* Load More Button */}
        {hasNextPage && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Load More Posts'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setPostToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeletePost}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
  const toast = useToast();
  const router = useRouter();
  const { user, refreshUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [jobSettings, setJobSettings] = useState<any>(null);
  const [subscriptionEligibility, setSubscriptionEligibility] = useState<any>(null);
  const [stats, setStats] = useState({
    profileComplete: 0,
    jobApplications: 0,
    interviews: 0,
    offers: 0
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [connectionsCount, setConnectionsCount] = useState<number>(0);
  const [bannerUploading, setBannerUploading] = useState<boolean>(false);
  const [showBannerModal, setShowBannerModal] = useState(false);

  // Guard: redirect recruiters to recruiters dashboard
  useEffect(() => {
    if (user?.role === 'recruiter') {
      router.replace('/recruiters/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Ensure user data is refreshed when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  // Update userProfile when user changes
  useEffect(() => {
    if (user) {
      setUserProfile(user);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Always refresh user data to ensure we have the latest information
      if (user) {
        setUserProfile(user);
      } else {
        await refreshUser();
        // The user state will be updated after refreshUser
      }
      
      // Load professional profile
      const profileResponse = await professionalCareerProfileService.getProfile();
      if (profileResponse.success && profileResponse.data.profile) {
        setProfile(profileResponse.data.profile);
      }

      // Load job hunting settings
      const jobResponse = await jobHuntingSettingsService.getSettings();
      if (jobResponse.success && jobResponse.data.settings) {
        setJobSettings(jobResponse.data.settings);
      }

      // Load subscription eligibility
      try {
        const eligibilityResponse = await jobSubscriptionService.checkEligibility();
        setSubscriptionEligibility(eligibilityResponse);
      } catch (error) {
        // User not eligible, that's okay
        setSubscriptionEligibility({ isEligible: false });
      }

      // Calculate profile completion percentage
      if (profileResponse.success && profileResponse.data.profile) {
        const profileData = profileResponse.data.profile;
        const fields = [
          profileData.fullName,
          profileData.gender,
          profileData.dateOfBirth,
          profileData.phoneNumber,
          profileData.emailAddress,
          profileData.address,
          profileData.lgaOfResidence,
          profileData.stateOfResidence,
          profileData.professionalSummary,
          profileData.persona,
          (profileData.expertiseCompetencies?.length || 0) > 0,
          (profileData.softwareSkills?.length || 0) > 0,
          (profileData.workExperiences?.length || 0) > 0,
          (profileData.higherEducations?.length || 0) > 0,
          (profileData.basicEducations?.length || 0) > 0,
          (profileData.professionalMemberships?.length || 0) > 0,
          (profileData.trainingCertifications?.length || 0) > 0,
          profileData.nyscStatus,
          (profileData.referenceDetails?.length || 0) > 0
        ];
        
        const completedFields = fields.filter(Boolean).length;
        setStats(prev => ({
          ...prev,
          profileComplete: Math.round((completedFields / fields.length) * 100)
        }));
      }

      // Networking stats for connections
      try {
        const statsRes = await networkingService.getStats();
        if (statsRes && typeof statsRes.connections === 'number') {
          setConnectionsCount(statsRes.connections);
        }
      } catch {}

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: get most recent/current work experience
  const getMostRecentWorkExperience = () => {
    const experiences = profile?.workExperiences;
    if (!Array.isArray(experiences) || experiences.length === 0) return null;
    const toTs = (val: any) => {
      if (!val) return null;
      const t = new Date(val).getTime();
      return Number.isFinite(t) ? t : null;
    };
    const isCurrent = (e: any) => Boolean(e?.isCurrentJob) || !e?.exitDate && !e?.endDate;
    const endTs = (e: any) => toTs(e?.exitDate ?? e?.endDate) ?? Date.now();
    const startTs = (e: any) => toTs(e?.entryDate ?? e?.startDate) ?? 0;
    const sorted = [...experiences].sort((a: any, b: any) => {
      const aCurrent = isCurrent(a);
      const bCurrent = isCurrent(b);
      if (aCurrent !== bCurrent) return aCurrent ? -1 : 1; // current roles first
      const aEnd = endTs(a);
      const bEnd = endTs(b);
      if (aEnd !== bEnd) return bEnd - aEnd; // latest end date first
      const aStart = startTs(a);
      const bStart = startTs(b);
      return bStart - aStart; // latest start date as tie-breaker
    });
    return sorted[0] || null;
  };


  const handleDownloadProfile = () => {
    // Check if profile is complete
    if (stats.profileComplete < 100) {
      toast.showError('Please complete your career profile before downloading', 'Profile Incomplete');
      return;
    }
    
    // Redirect to payment page
    router.push('/dashboard/career/resume-payment');
  };

  const handleProfilePictureClick = () => {
    setShowProfileModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await userService.uploadCareerProfilePicture(formData);
      if (response.success) {
        toast.showSuccess('Profile picture updated successfully!', 'Success');
        
        // Refresh user data in auth store to get the updated profile picture
        await refreshUser();
      } else {
        toast.showError(response.message || 'Failed to update profile picture', 'Error');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.showError('Failed to update profile picture', 'Error');
    }
    setShowProfileModal(false);
  };

  const handleDeleteProfilePicture = async () => {
    try {
      const response = await userService.deleteCareerProfilePicture();
      if (response.success) {
        toast.showSuccess('Profile picture deleted successfully!', 'Success');
        
        // Refresh user data in auth store to reflect the deletion
        await refreshUser();
      } else {
        toast.showError(response.message || 'Failed to delete profile picture', 'Error');
      }
    } catch (error) {
      console.error('Profile picture deletion error:', error);
      toast.showError('Failed to delete profile picture', 'Error');
    }
    setShowProfileModal(false);
  };

  // Banner upload handlers
  const handleBannerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    if (!isValidType) {
      toast.showError('Only JPG and PNG files are allowed', 'Invalid file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.showError('File size must be less than 50MB', 'Too large');
      return;
    }
    handleBannerUpload(file);
  };

  const handleBannerUpload = async (file: File) => {
    try {
      setBannerUploading(true);
      const formData = new FormData();
      formData.append('banner', file);
      const response = await userService.uploadCareerBannerPicture(formData);
      if (response.success) {
        toast.showSuccess('Banner updated successfully!', 'Success');
        setUserProfile((prev:any) => ({ ...(prev || {}), careerBannerPicture: (response as any).data?.careerBannerPicture || (prev?.careerBannerPicture) }));
        await refreshUser();
      } else {
        toast.showError(response.message || 'Failed to update banner', 'Error');
      }
    } catch (e) {
      toast.showError('Failed to update banner', 'Error');
    } finally {
      setBannerUploading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.fullName,
      profile.gender,
      profile.dateOfBirth,
      profile.phoneNumber,
      profile.emailAddress,
      profile.address,
      profile.lgaOfResidence,
      profile.stateOfResidence,
      profile.professionalSummary,
      profile.persona,
      (profile.expertiseCompetencies?.length || 0) > 0,
      (profile.softwareSkills?.length || 0) > 0,
      (profile.workExperiences?.length || 0) > 0,
      (profile.higherEducations?.length || 0) > 0,
      (profile.basicEducations?.length || 0) > 0,
      (profile.professionalMemberships?.length || 0) > 0,
      (profile.trainingCertifications?.length || 0) > 0,
      profile.nyscStatus,
      (profile.referenceDetails?.length || 0) > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getMissingFields = () => {
    if (!profile) return [];
    
    const missingFields = [];
    
    if (!profile.fullName) missingFields.push({ field: 'Full Name', section: 'Personal Information' });
    if (!profile.gender) missingFields.push({ field: 'Gender', section: 'Personal Information' });
    if (!profile.dateOfBirth) missingFields.push({ field: 'Date of Birth', section: 'Personal Information' });
    if (!profile.phoneNumber) missingFields.push({ field: 'Phone Number', section: 'Contact Information' });
    if (!profile.emailAddress) missingFields.push({ field: 'Email Address', section: 'Contact Information' });
    if (!profile.address) missingFields.push({ field: 'Address', section: 'Contact Information' });
    if (!profile.lgaOfResidence) missingFields.push({ field: 'LGA of Residence', section: 'Contact Information' });
    if (!profile.stateOfResidence) missingFields.push({ field: 'State of Residence', section: 'Contact Information' });
    if (!profile.professionalSummary) missingFields.push({ field: 'Professional Summary', section: 'Professional Information' });
    if (!profile.persona) missingFields.push({ field: 'Persona', section: 'Professional Information' });
    if (!profile.expertiseCompetencies?.length) missingFields.push({ field: 'Areas of Expertise', section: 'Skills' });
    if (!profile.softwareSkills?.length) missingFields.push({ field: 'Software Skills', section: 'Skills' });
    if (!profile.workExperiences?.length) missingFields.push({ field: 'Work Experience', section: 'Experience' });
    if (!profile.higherEducations?.length) missingFields.push({ field: 'Higher Education', section: 'Education' });
    if (!profile.basicEducations?.length) missingFields.push({ field: 'Basic Education', section: 'Education' });
    if (!profile.professionalMemberships?.length) missingFields.push({ field: 'Professional Memberships', section: 'Memberships' });
    if (!profile.trainingCertifications?.length) missingFields.push({ field: 'Training & Certifications', section: 'Certifications' });
    if (!profile.nyscStatus) missingFields.push({ field: 'NYSC Status', section: 'Certifications' });
    if (!profile.referenceDetails?.length) missingFields.push({ field: 'Reference Details', section: 'References' });
    
    return missingFields;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading career dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - User Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* User Profile Card */}
            <Card>
              {/* <CardHeader>
                <CardTitle className="flex items-center text-[18px] font-bold">Profile</CardTitle>
              </CardHeader> */}
              <CardContent className="space-y-4 p-0">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <div className="w-full h-28 sm:h-40 bg-gray-100 flex items-center justify-center relative cursor-pointer" onClick={() => setShowBannerModal(true)}>
                     {userProfile?.careerBannerPicture ? (
                       <img
                         src={getFullImageUrl(userProfile.careerBannerPicture)}
                         alt="Banner"
                         className="w-full h-full object-cover object-center block"
                         onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                       />
                     ) : null}
                     <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
                    <div className="absolute top-2 right-2 z-10">
                      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} />
                      {/* <Button size="sm" variant="outline" className="h-8 bg-white/90 hover:bg-white" onClick={(e) => { e.stopPropagation(); bannerInputRef.current?.click(); }} disabled={bannerUploading}>
                        {bannerUploading ? 'Uploading...' : 'Change Banner'}
                      </Button> */}
                    </div>
                    <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6 z-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200 cursor-pointer shadow" onClick={handleProfilePictureClick}>
                        {userProfile?.careerProfilePicture ? (
                          <img src={getFullImageUrl(userProfile.careerProfilePicture)} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  </div>
                </div>
                  <div className="px-4 sm:px-6 pt-8 sm:pt-10 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-900 w-full">{user?.name || 'User'}</h2>
                        {(user as any)?.isVerified && (
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                        )}
                  </div>
                      {(() => { const exp = getMostRecentWorkExperience(); return exp ? (
                        <p className="text-base text-gray-800 font-medium">{`${exp.designation || exp.jobTitle || ''}${exp.companyName ? ` at ${exp.companyName}` : ''}`}</p>
                      ) : null; })()}
                      {profile?.stateOfResidence && (
                        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.stateOfResidence}</p>
                      )}
                      <p className="text-sm text-gray-700">{connectionsCount >= 500 ? '500+ connections' : `${connectionsCount} connections`}</p>
                      <div className="pt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                        <Link href="/dashboard/professional-career-profile" className="w-full sm:w-auto">
                          <Button size="sm" className="w-full justify-center sm:justify-start">View Career Profile</Button>
                        </Link>
                        {/* <Link href="/dashboard/profile" className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full justify-center sm:justify-start">Edit Profile</Button>
                        </Link> */}
                      </div>
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Career Profile */}
                {/* trimmed per spec: removed Career Profile & Download Profile */}

                {/* AppAI */}
                <Link href="/dashboard/appai" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                    <Settings className="mr-2 h-4 w-4" />
                    AppAI
                  </Button>
                </Link>

                {/* Email */}
                <Link href="/dashboard/email-campaigns" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </Link>

                {/* Messaging */}
                <Link href="/dashboard/chat" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messaging
                  </Button>
                </Link>

                {/* Networking */}
                <Link href="/dashboard/networking" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                    <Users className="mr-2 h-4 w-4" />
                    Networking
                  </Button>
                </Link>

                {/* Earn */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50"
                  onClick={async () => {
                    try {
                      const res = await serviceService.mine();
                      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                        // User has at least one service → go to Services home
                        router.push('/dashboard/earn/services');
                      } else {
                        // No services yet → go to Earn landing to set up
                        router.push('/dashboard/earn');
                      }
                    } catch {
                      router.push('/dashboard/earn');
                    }
                  }}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Earn
                </Button>

                {/* Meeting */}
                <Link href="/dashboard/meetings" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                    <Calendar className="mr-2 h-4 w-4" />
                    Meeting
                  </Button>
                </Link>

                {/* Posts */}
                <Link href="/dashboard/posts" className="block">
                  <Button variant="outline" className="w-full justify-start h-12">
                    <FileText className="mr-2 h-4 w-4" />
                    Posts
                  </Button>
                </Link>

                {/* Divider */}
                <div className="border-t pt-2" />

                <div className="mt-2">
                  <div className="text-sm sm:text-base font-bold text-gray-900 mb-2">BUSINESS</div>
                  <div className="space-y-2">
                    <Link href="/recruiters/dashboard" className="block">
                      <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Recruiter / Employer
                  </Button>
                </Link>
                    <Link href="/dashboard/vendor" className="block">
                      <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Vendor
                  </Button>
                </Link>
                    <Link href="/dashboard/advertise" className="block">
                      <Button variant="outline" className="w-full justify-start h-12 border-[#d3d3d3] hover:bg-gray-50">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Advertise
                  </Button>
                </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t pt-2" />

                {/* trimmed utilities per spec */}
              </CardContent>
            </Card>

            {/* Profile Completion Indicator */}
            {profile && getCompletionPercentage() < 100 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800 text-sm sm:text-base">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Profile Completion: {getCompletionPercentage()}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-700 text-sm mb-3">
                    Complete your profile to unlock all features. Here's what's missing:
                  </p>
                  <div className="space-y-2">
                    {getMissingFields().slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-yellow-800 truncate flex-1 mr-2">{item.field}</span>
                        <Link href="/dashboard/professional-career-profile/edit">
                          <Button variant="outline" size="sm" className="h-8 px-2 text-xs flex-shrink-0">
                            Complete
                          </Button>
                        </Link>
                      </div>
                    ))}
                    {getMissingFields().length > 5 && (
                      <div className="text-yellow-700 text-xs mt-2">
                        +{getMissingFields().length - 5} more fields to complete
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Posts Section replacing removed cards */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Posts</CardTitle>
                  <Link href="/dashboard/posts"><Button variant="outline" size="sm">Open</Button></Link>
                      </div>
              </CardHeader>
              <CardContent>
                <DashboardPosts />
              </CardContent>
            </Card>
                  </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
            
            {userProfile?.careerProfilePicture && (
              <div className="mb-4">
                <img
                  src={getFullImageUrl(userProfile.careerProfilePicture)}
                  alt="Current Profile"
                  className="w-32 h-32 object-cover rounded-full mx-auto"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12"
              >
                Upload New Picture
              </Button>
              
              {userProfile?.careerProfilePicture && (
                <Button
                  variant="outline"
                  onClick={handleDeleteProfilePicture}
                  className="w-full h-12"
                >
                  Remove Picture
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowProfileModal(false)}
                className="w-full h-12"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Banner</DialogTitle>
            <DialogDescription>Preview and manage your profile banner.</DialogDescription>
          </DialogHeader>
          <div className="rounded-md overflow-hidden border bg-gray-50">
            {userProfile?.careerBannerPicture ? (
              <img src={getFullImageUrl(userProfile.careerBannerPicture)} alt="Banner preview" className="w-full h-48 object-contain bg-white" />
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-gray-500">No banner set</div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { setShowBannerModal(false); handleBannerSelect(e as any); }} />
            <Button variant="default" onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading}>{bannerUploading ? 'Uploading...' : 'Upload New Banner'}</Button>
            {userProfile?.careerBannerPicture && (
              <Button variant="destructive" onClick={async () => { await userService.deleteCareerBannerPicture(); await refreshUser(); setShowBannerModal(false); }}>Remove Banner</Button>
            )}
            <Button variant="outline" onClick={() => setShowBannerModal(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}