-- Create profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "email" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "username" TEXT UNIQUE,
    "bio" TEXT,
    "website" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    "preferences" JSONB DEFAULT '{}'::jsonb,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY ("id"),
    CONSTRAINT "profiles_user_id_unique" UNIQUE ("user_id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "profiles_user_id_idx" ON "public"."profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "profiles_username_idx" ON "public"."profiles" ("username");
CREATE INDEX IF NOT EXISTS "profiles_email_idx" ON "public"."profiles" ("email");
CREATE INDEX IF NOT EXISTS "profiles_created_at_idx" ON "public"."profiles" ("created_at");

-- Enable RLS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON "public"."profiles"
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON "public"."profiles"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "public"."profiles"
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON "public"."profiles"
    FOR DELETE USING (auth.uid() = user_id);

-- Public profiles can be viewed by everyone (optional - uncomment if needed)
-- CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles"
--     FOR SELECT USING (true);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();