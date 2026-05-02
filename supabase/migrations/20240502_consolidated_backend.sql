-- Consolidated Database Migration for UIUPC
-- Target: Supabase PostgreSQL

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- slug like 'design', 'visual'
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- React icon name or image URL
    achievements JSONB DEFAULT '[]'::jsonb, -- Local achievements for the department
    works JSONB DEFAULT '[]'::jsonb, -- Portfolio pieces for the department
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Achievements Table (Platform-wide Hall of Fame)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    year TEXT NOT NULL, -- e.g., '2024'
    category TEXT, -- 'Award', 'Exhibition', 'Milestone'
    image_url TEXT,
    recipient TEXT, -- e.g., 'UIUPC' or a specific member name
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Members Table (Linked to Departments)
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    role TEXT, -- Lead, Member, etc.
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    bio TEXT,
    image TEXT,
    social_links JSONB DEFAULT '{}'::jsonb, -- { facebook: '', instagram: '', portfolio: '' }
    works JSONB DEFAULT '[]'::jsonb, -- Array of objects { title: '', image: '', type: '' }
    is_alumni BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Update Events Table for Geographical Mapping
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='latitude') THEN
        ALTER TABLE events ADD COLUMN latitude NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='longitude') THEN
        ALTER TABLE events ADD COLUMN longitude NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='map_icon_type') THEN
        ALTER TABLE events ADD COLUMN map_icon_type TEXT; -- workshop, photowalk, exhibition, contest
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='is_mapped') THEN
        ALTER TABLE events ADD COLUMN is_mapped BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 4. Initial Departments Data
INSERT INTO departments (name, display_name, description, icon) VALUES
('design', 'Design', 'Crafting the visual identity and branding of UIUPC.', 'FaPalette'),
('visual', 'Visual', 'Capturing and producing high-quality cinematic content.', 'FaCamera'),
('hr', 'Human Resource', 'Managing our community and internal relations.', 'FaUsers'),
('pr', 'Public Relations', 'Connecting UIUPC with the world and managing partnerships.', 'FaGlobe'),
('event', 'Event', 'Strategizing and executing our flagship workshops and exhibitions.', 'FaStar'),
('organizing', 'Organizing', 'Ensuring smooth logistics and on-ground operations.', 'FaClipboardList')
ON CONFLICT (name) DO NOTHING;

-- 5. Enable RLS and Policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 6. Create Policies (Conditional to avoid errors on re-run)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on departments') THEN
        CREATE POLICY "Allow public read on departments" ON departments FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on achievements') THEN
        CREATE POLICY "Allow public read on achievements" ON achievements FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on members') THEN
        CREATE POLICY "Allow public read on members" ON members FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin all on departments') THEN
        CREATE POLICY "Allow admin all on departments" ON departments USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin all on achievements') THEN
        CREATE POLICY "Allow admin all on achievements" ON achievements USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin all on members') THEN
        CREATE POLICY "Allow admin all on members" ON members USING (auth.role() = 'authenticated');
    END IF;
END $$;
