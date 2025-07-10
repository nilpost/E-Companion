import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share, Bookmark, Camera, Video, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Post, User, Pet, Comment } from "@shared/schema";

type PostWithDetails = Post & {
  user: User;
  pet?: Pet;
  commentCount: number;
  likesCount: number;
  isLiked?: boolean;
};

export default function SocialFeedView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState("");

  const { data: posts = [] } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/posts", { content });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      toast({
        title: "Post created",
        description: "Your post has been shared with the community",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate(newPostContent);
  };

  const handleLike = (postId: number) => {
    likeMutation.mutate(postId);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-dark-slate">Community Feed</h2>
      
      {/* Post Creation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{user?.firstName?.[0]}</span>
            </div>
            <Textarea
              placeholder="Share your pet's moment..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="flex-1 min-h-[80px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                <Camera className="h-4 w-4 text-accent" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4 text-secondary" />
              </Button>
              <Button variant="ghost" size="sm">
                <MapPin className="h-4 w-4 text-primary" />
              </Button>
            </div>
            <Button 
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || createPostMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{post.user.firstName[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-slate">
                          {post.user.firstName} {post.user.lastName}
                        </h3>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt!)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <span className="text-gray-400">⋯</span>
                    </Button>
                  </div>
                  <p className="text-dark-slate mb-3">{post.content}</p>
                </div>
                
                {post.images && post.images.length > 0 && (
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src={post.images[0]} 
                      alt="Post image" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likesCount}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{post.commentCount}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600">
                        <Share className="h-4 w-4" />
                        <span className="text-sm">Share</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
