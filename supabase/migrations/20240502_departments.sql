-- Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- slug like 'design', 'visual'
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- React icon name or image URL
    achievements JSONB DEFAULT '[]'::jsonb,
    works JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    role TEXT, -- Lead, Member, etc.
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    bio TEXT,
    image TEXT,
    social_links JSONB DEFAULT '{}'::jsonb, -- { facebook: '', instagram: '', portfolio: '' }
    works JSONB DEFAULT '[]'::jsonb, -- Array of objects { title: '', image: '', type: '' }
    is_alumni BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Initial Departments
INSERT INTO departments (name, display_name, description, icon) VALUES
('design', 'Design', 'Crafting the visual identity and branding of UIUPC.', 'FaPalette'),
('visual', 'Visual', 'Capturing and producing high-quality cinematic content.', 'FaCamera'),
('hr', 'Human Resource', 'Managing our community and internal relations.', 'FaUsers'),
('pr', 'Public Relations', 'Connecting UIUPC with the world and managing partnerships.', 'FaGlobe'),
('event', 'Event', 'Strategizing and executing our flagship workshops and exhibitions.', 'FaCalendarStar'),
('organizing', 'Organizing', 'Ensuring smooth logistics and on-ground operations.', 'FaClipboardList')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create SELECT Policies (Allow public read access)
CREATE POLICY "Allow public select on departments" ON departments
    FOR SELECT USING (true);

CREATE POLICY "Allow public select on members" ON members
    FOR SELECT USING (true);
