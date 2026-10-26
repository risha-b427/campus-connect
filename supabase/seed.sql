-- Seed data for buildings
INSERT INTO public.buildings (id, name, latitude, longitude)
VALUES 
    ('11111111-1111-4111-8111-111111111111', 'Grainger Engineering Library', 40.112688391025756, -88.22688501744561),
    ('11111111-1111-4111-8111-111111111112', 'Main Library', 40.1048931126562, -88.22905331929859),
    ('11111111-1111-4111-8111-111111111113', 'Illini Union', 40.109382388987356, -88.22720104628183),
    ('11111111-1111-4111-8111-111111111114', 'Thomas M. Siebel Center for Computer Science', 40.113975077351085, -88.2248837462816),
    ('11111111-1111-4111-8111-111111111115', 'Campus Instruction Facility', 40.11258306000972, -88.2283740904621),
    ('11111111-1111-4111-8111-111111111116', 'Caffe Paradiso', 40.105798349469396, -88.21932693729454)

ON CONFLICT (id) DO NOTHING;

-- Seed data for spots
INSERT INTO public.spots (
    id, name, description, building_id, latitude, longitude, spot_type
)
VALUES
    ('22222222-2222-4222-8222-222222222221', 'Grainger Library First Floor', 'Engineering library floor with quiet study areas, group tables, computer workstations, and collaborative learning spaces.', '11111111-1111-4111-8111-111111111111', 40.112688, -88.226885, 'Library'),
    ('22222222-2222-4222-8222-222222222222', 'Orange Room', 'Bright library study room with tables and seating for individual work, reading, and small-group study.', '11111111-1111-4111-8111-111111111112', 40.10495787759158, -88.22842472266775, 'Library'),
    ('22222222-2222-4222-8222-222222222223', 'Illini Union Basement', 'Social recreation area with bowling, billiards, arcade games, food options, and space to gather with friends.', '11111111-1111-4111-8111-111111111113', 40.10940730843477, -88.22722444978815, 'Lounge'),
    ('22222222-2222-4222-8222-222222222224', 'Basement', 'Lower-level student space with informal seating for studying, collaborating, and taking a break between classes.', '11111111-1111-4111-8111-111111111114', 40.113975, -88.224883, 'Lounge'),
    ('22222222-2222-4222-8222-222222222225', 'Expresso Royale', 'Campus cafe serving coffee and light refreshments with seating for studying, meetings, and relaxing between classes.', '11111111-1111-4111-8111-111111111115', 40.11250959834841, -88.22823835557583, 'Cafe'),
    ('22222222-2222-4222-8222-222222222226', 'Caffe Paradiso', 'Independent cafe serving coffee and baked goods with informal seating for studying, meetings, and socializing.', '11111111-1111-4111-8111-111111111116', 40.105787432877285, -88.21932365957498, 'Cafe')
ON CONFLICT (id) DO NOTHING;
