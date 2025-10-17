-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_type TEXT NOT NULL CHECK (mood_type IN ('amazing', 'happy', 'okay', 'sad', 'stressed', 'anxious')),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  notes TEXT,
  detected_emotion TEXT,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Mood entries policies
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('breathing', 'journaling', 'puzzle', 'mindfulness', 'music', 'video')),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  mood_target TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for activities (public read)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some default activities
INSERT INTO public.activities (type, title, description, content, mood_target) VALUES
('breathing', '4-7-8 Breathing', 'Calm your mind with this simple breathing exercise', '{"steps": ["Breathe in for 4 seconds", "Hold for 7 seconds", "Exhale for 8 seconds", "Repeat 4 times"]}', ARRAY['stressed', 'anxious']),
('journaling', 'Gratitude Journal', 'Write down 3 things you''re grateful for today', '{"prompt": "What are three things that brought you joy today, no matter how small?"}', ARRAY['okay', 'sad']),
('mindfulness', '5-Minute Body Scan', 'Ground yourself with a quick body scan meditation', '{"steps": ["Find a comfortable position", "Close your eyes", "Notice sensations from head to toe", "Release any tension you find"]}', ARRAY['stressed', 'anxious']),
('puzzle', 'Word Association', 'Stimulate your mind with word puzzles', '{"type": "word_game", "difficulty": "easy"}', ARRAY['okay', 'happy']),
('music', 'Calming Playlist', 'Relax with soothing sounds', '{"playlist_type": "relaxation", "duration": "30min"}', ARRAY['sad', 'stressed', 'anxious']),
('video', 'Motivational Talk', 'Get inspired with uplifting content', '{"category": "motivation", "duration": "10min"}', ARRAY['sad', 'okay'])
ON CONFLICT DO NOTHING;