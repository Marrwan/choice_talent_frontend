'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { postService, Post, CreatePostData } from '@/services/postService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/useToast';
import { 
  Heart, 
  MessageCircle, 
  ThumbsUp, 
  Lightbulb, 
  PartyPopper,
  Image as ImageIcon,
  Send,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Smile
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Using native Date methods instead of date-fns

export default function PostsPage() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState<CreatePostData>({
    content: '',
    image: undefined
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    try {
      setCreating(true);
      const postData: CreatePostData = {
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
            totalReactions: Object.values(newReactionCounts).reduce((a, b) => a + b, 0)
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
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      showSuccess("Post deleted successfully", "Success");
    } catch (error) {
      console.error('Error deleting post:', error);
      showError("Failed to delete post", "Error");
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

  // Get user's current reaction for a post
  const getUserReaction = (post: Post) => {
    // This would need to be implemented based on your backend response
    // For now, we'll return null as the backend doesn't seem to include user's reaction
    return null;
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
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
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  maxLength={1500}
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
                      {newPost.content.length}/1500
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
          {posts && posts.length > 0 ? posts.map((post) => post && post.author ? (
            <Card key={post.id}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage src={post.author.profilePicture} />
                      <AvatarFallback className="text-sm">
                        {post.author.name[0]}
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
                  <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{post.content}</p>
                  
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
                      {Object.entries(post.reactionCounts).map(([type, count]) => (
                        count > 0 && (
                          <div key={type} className="flex items-center space-x-1">
                            {getReactionIcon(type)}
                            <span className="text-xs sm:text-sm text-gray-600">{count}</span>
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
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Comment</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null) : (
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
      </div>
    </div>
  );
}
