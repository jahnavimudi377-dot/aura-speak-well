import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Music, Play, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist: string;
  type: string;
  url: string;
  embedId: string;
  thumbnail: string;
  duration: string;
}

const Playlist = () => {
  const [user, setUser] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    // Fetch playlist from JSON file
    fetch("/data/playlist.json")
      .then((response) => response.json())
      .then((data) => setSongs(data))
      .catch((error) => {
        console.error("Error loading playlist:", error);
        toast({
          title: "Error",
          description: "Failed to load playlist",
          variant: "destructive",
        });
      });
  }, [toast]);

  const handlePlay = (song: Song) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Calming Playlist</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Relax and unwind with our curated collection of peaceful music
          </p>
        </div>

        {/* Playlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <Card
              key={song.id}
              className="overflow-hidden hover:shadow-mood transition-smooth group cursor-pointer"
              onClick={() => handlePlay(song)}
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                  <Button size="icon" variant="secondary" className="w-16 h-16 rounded-full">
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{song.title}</CardTitle>
                <CardDescription>{song.artist}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{song.duration}</span>
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
                <span>{selectedSong?.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(selectedSong?.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in YouTube
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedSong && (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedSong.embedId}?autoplay=1`}
                  title={selectedSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Admin Note */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Admin: Update Playlist
          </h3>
          <p className="text-sm text-muted-foreground">
            To add or modify songs, edit the <code className="bg-background px-2 py-1 rounded">public/data/playlist.json</code> file in your GitHub repository.
            Each song requires: id, title, artist, type, url, embedId, thumbnail, and duration.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Playlist;
