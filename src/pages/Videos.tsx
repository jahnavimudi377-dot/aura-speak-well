import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  embedId: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const Videos = () => {
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Fetch videos from JSON file
    fetch("/data/videos.json")
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => {
        console.error("Error loading videos:", error);
        toast({
          title: "Error",
          description: "Failed to load videos",
          variant: "destructive",
        });
      });
  }, [toast]);

  const handlePlay = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const categories = ["All", ...new Set(videos.map((v) => v.category))];
  const filteredVideos = filter === "All" ? videos : videos.filter((v) => v.category === filter);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Motivational Videos</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Inspire your mind and uplift your spirit with powerful content
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              onClick={() => setFilter(category)}
              className="transition-smooth"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-mood transition-smooth group cursor-pointer"
              onClick={() => handlePlay(video)}
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button size="icon" variant="secondary" className="w-16 h-16 rounded-full">
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
                <Badge className="absolute top-3 right-3 bg-primary">
                  {video.category}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {video.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{video.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Player Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedVideo?.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(`https://www.youtube.com/watch?v=${selectedVideo?.embedId}`, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in YouTube
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="space-y-4">
                <div className="aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                <p className="text-muted-foreground">{selectedVideo.description}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Admin Note */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Admin: Update Videos
          </h3>
          <p className="text-sm text-muted-foreground">
            To add or modify videos, edit the <code className="bg-background px-2 py-1 rounded">public/data/videos.json</code> file in your GitHub repository.
            Each video requires: id, title, description, embedId, thumbnail, duration, and category.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Videos;
