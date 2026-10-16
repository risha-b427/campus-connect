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
    ('22222222-2222-4222-8222-222222222221', 'Grainger Engineering Library', 'Building-level map pin; exact indoor study area is not mapped.', '11111111-1111-4111-8111-111111111111', 40.112688, -88.226885, 'Library'),
    ('22222222-2222-4222-8222-222222222222', 'Main Library', 'Building-level map pin; exact indoor study area is not mapped.', '11111111-1111-4111-8111-111111111112', 40.104893, -88.229053, 'Library'),
    ('22222222-2222-4222-8222-222222222223', 'Illini Union', 'Building-level map pin; exact indoor lounge is not mapped.', '11111111-1111-4111-8111-111111111113', 40.109382, -88.227201, 'Lounge'),
    ('22222222-2222-4222-8222-222222222224', 'Thomas M. Siebel Center for Computer Science', 'Building-level map pin; exact indoor study area is not mapped.', '11111111-1111-4111-8111-111111111114', 40.113975, -88.224883, 'Lounge'),
    ('22222222-2222-4222-8222-222222222225', 'Campus Instructional Facility', 'Building-level map pin; exact indoor study area is not mapped.', '11111111-1111-4111-8111-111111111115', 40.112583, -88.228374, 'Lounge'),
    ('22222222-2222-4222-8222-222222222226', 'Caffe Paradiso', 'Building-level map pin; exact indoor seating area is not mapped.', '11111111-1111-4111-8111-111111111116', 40.105798, -88.219327, 'Cafe')
ON CONFLICT (id) DO NOTHING;
