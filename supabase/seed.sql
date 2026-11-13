-- Seed data for buildings
INSERT INTO public.buildings (id, name, latitude, longitude)
VALUES 
    ('11111111-1111-4111-8111-111111111111', 'Grainger Engineering Library', 40.112688391025756, -88.22688501744561),
    ('11111111-1111-4111-8111-111111111112', 'Main Library', 40.1048931126562, -88.22905331929859),
    ('11111111-1111-4111-8111-111111111113', 'Illini Union', 40.109382388987356, -88.22720104628183),
    ('11111111-1111-4111-8111-111111111114', 'Thomas M. Siebel Center for Computer Science', 40.113975077351085, -88.2248837462816),
    ('11111111-1111-4111-8111-111111111115', 'Campus Instruction Facility', 40.11258306000972, -88.2283740904621),
    ('11111111-1111-4111-8111-111111111116', 'Caffe Paradiso', 40.105798349469396, -88.21932693729454),
    ('11111111-1111-4111-8111-111111111117', 'Sidney Lu Mechanical Engineering Building', 40.11096529580632, -88.22480139011947),
    ('11111111-1111-4111-8111-111111111118', 'Everitt Laboratory', 40.11110528462119, -88.22829931895457),
    ('11111111-1111-4111-8111-111111111119', 'Illinois Street Residence Halls', 40.11031047565066, -88.22186013244959),
    ('11111111-1111-4111-8111-11111111111a', 'Caffe Bene', 40.10667375235512, -88.22121833909253),
    ('11111111-1111-4111-8111-11111111111b', 'ACES Library, Information and Alumni Center', 40.102983798819885, -88.22512153244993)

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
    ('22222222-2222-4222-8222-222222222226', 'Caffe Paradiso', 'Independent cafe serving coffee and baked goods with informal seating for studying, meetings, and socializing.', '11111111-1111-4111-8111-111111111116', 40.105787432877285, -88.21932365957498, 'Cafe'),
    ('22222222-2222-4222-8222-222222222227', 'CIF', 'Open seating and tables in the Campus Instructional Facility for individual and group study between classes.', '11111111-1111-4111-8111-111111111115', 40.112574854810504, -88.22832044594453, 'Lounge'),
    ('22222222-2222-4222-8222-222222222228', 'MechE Building', 'Tables and seating throughout the Sidney Lu Mechanical Engineering Building for studying between classes.', '11111111-1111-4111-8111-111111111117', 40.11096529580632, -88.22480139011947, 'Lounge'),
    ('22222222-2222-4222-8222-222222222229', 'Everitt Lab', 'Seating in Everitt Laboratory for studying between classes.', '11111111-1111-4111-8111-111111111118', 40.11110528462119, -88.22829931895457, 'Lounge'),
    ('22222222-2222-4222-8222-22222222222a', 'ISR', 'First-floor space near TerraByte and InfiniTEA in the Illinois Street Residence Halls. Residents only, with I-Card access.', '11111111-1111-4111-8111-111111111119', 40.11031047565066, -88.22186013244959, 'University Housing'),
    ('22222222-2222-4222-8222-22222222222b', 'Cafe Bene', 'Cafe on S Gregory St serving coffee and drinks, with seating for studying and meeting friends.', '11111111-1111-4111-8111-11111111111a', 40.10667375235512, -88.22121833909253, 'Cafe'),
    ('22222222-2222-4222-8222-22222222222c', 'Funk', 'ACES Library study space with tables and seating for individual and group study.', '11111111-1111-4111-8111-11111111111b', 40.102983798819885, -88.22512153244993, 'Library')
ON CONFLICT (id) DO NOTHING;
