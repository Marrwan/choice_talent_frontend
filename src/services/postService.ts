import { apiClient } from '@/lib/api';

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  comments: Comment[];
  reactions: Reaction[];
  reactionCounts: {
    like: number;
    love: number;
    insightful: number;
    celebrate: number;
  };
  totalReactions: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'love' | 'insightful' | 'celebrate';
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

export interface CreatePostData {
  content: string;
  image?: File;
}

export interface CreateCommentData {
  content: string;
}

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SinglePostResponse {
  success: boolean;
  data: Post;
}

export interface CommentResponse {
  success: boolean;
  data: Comment;
}

export interface ReactionResponse {
  success: boolean;
  data: {
    action: 'added' | 'removed' | 'updated';
    type: string;
  };
}

class PostService {
  // Create a new post
  async createPost(data: CreatePostData): Promise<SinglePostResponse> {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.post<SinglePostResponse>('/posts', formData, true);
    return response;
  }

  // Get all posts with pagination
  async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(`/posts`, true, { page, limit });
    return response;
  }

  // Get a single post
  async getPost(id: string, page: number = 1, limit: number = 10): Promise<SinglePostResponse> {
    const response = await apiClient.get<SinglePostResponse>(`/posts/${id}`, true, { page, limit });
    return response;
  }

  // Update a post
  async updatePost(id: string, data: { content: string }): Promise<SinglePostResponse> {
    const response = await apiClient.patch<SinglePostResponse>(`/posts/${id}`, data, true);
    return response;
  }

  // Delete a post
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/posts/${id}`, true);
    return response;
  }

  // Add a comment to a post
  async addComment(postId: string, data: CreateCommentData): Promise<CommentResponse> {
    const response = await apiClient.post<CommentResponse>(`/posts/${postId}/comments`, data, true);
    return response;
  }

  // Get comments for a post
  async getComments(postId: string, page: number = 1, limit: number = 10): Promise<{ success: boolean; data: { comments: Comment[]; pagination: any } }> {
    const response = await apiClient.get<{ success: boolean; data: { comments: Comment[]; pagination: any } }>(`/posts/${postId}/comments`, true, { page, limit });
    return response;
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/posts/comments/${commentId}`, true);
    return response;
  }

  // Toggle reaction on a post
  async toggleReaction(postId: string, type: 'like' | 'love' | 'insightful' | 'celebrate'): Promise<ReactionResponse> {
    const response = await apiClient.post<ReactionResponse>(`/posts/${postId}/reactions`, { type }, true);
    return response;
  }

  // Get user's posts
  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(`/posts/user/${userId}`, true, { page, limit });
    return response;
  }
}

export const postService = new PostService();
