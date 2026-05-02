-- First, get the IDs of the departments
DO $$
DECLARE
    design_id UUID;
    visual_id UUID;
BEGIN
    SELECT id INTO design_id FROM departments WHERE name = 'design';
    SELECT id INTO visual_id FROM departments WHERE name = 'visual';

    -- Insert Mock Designers
    INSERT INTO members (name, username, role, department_id, bio, image, social_links, works, is_alumni, order_index) VALUES
    ('Jonayed Rakib', 'jonayed', 'Design Lead', design_id, 'Passionate about minimalist branding and cinematic layouts. Leading the visual identity of UIUPC since 2024.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', '{"facebook": "#", "instagram": "#", "portfolio": "#"}', '[{"title": "UIUPC Rebrand 2024", "image": "https://images.unsplash.com/photo-1561070791-2526d30994b5", "type": "Branding"}, {"title": "Flagship 2024 Poster", "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d", "type": "Print"}]', FALSE, 1),
    ('Sarah Ahmed', 'sarah', 'UI/UX Designer', design_id, 'Transforming digital experiences through user-centric design.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', '{"facebook": "#", "instagram": "#"}', '[{"title": "Event Map Interface", "image": "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c", "type": "UI/UX"}]', FALSE, 2),
    ('Adnan Kabir', 'adnan', 'Senior Designer', design_id, 'Former lead who shaped the early aesthetics of the club.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', '{"portfolio": "#"}', '[{"title": "UIUPC Classic Logo", "image": "https://images.unsplash.com/photo-1551033406-611cf9a28f67", "type": "Logo"}]', TRUE, 10);

    -- Insert Mock Visual Artists
    INSERT INTO members (name, username, role, department_id, bio, image, social_links, works, is_alumni, order_index) VALUES
    ('Abrar Fahim', 'abrar', 'Visual Lead', visual_id, 'Director and cinematographer focused on visual storytelling and high-impact club promos.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6', '{"instagram": "#", "portfolio": "#"}', '[{"title": "2024 Promo Film", "image": "https://images.unsplash.com/photo-1536240478700-b869070f9279", "type": "Cinematography"}]', FALSE, 1);
END $$;

-- Update Department Achievements
UPDATE departments SET 
    achievements = '["Best Branding Award 2024", "Designed 10+ Major Exhibition Identities"]',
    works = '[{"title": "Summer Exhibition 2024", "image": "https://images.unsplash.com/photo-1492691523567-30730029ad0a"}]'
WHERE name = 'design';

UPDATE departments SET 
    achievements = '["Produced 20+ High-End Promo Videos", "Official Cinematography Partner of UIU Fest"]',
    works = '[{"title": "Cinematic Club Intro", "image": "https://images.unsplash.com/photo-1478720568477-152d9b164e26"}]'
WHERE name = 'visual';
