-- Seed Initial Campus
INSERT INTO campuses (id, name, timezone) 
VALUES ('11111111-1111-1111-1111-111111111111', 'VIT Chennai', 'Asia/Kolkata') 
ON CONFLICT DO NOTHING;

-- Seed Initial Building
INSERT INTO buildings (id, campus_id, name) 
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Academic Block 1') 
ON CONFLICT DO NOTHING;

-- Seed Initial Resources
INSERT INTO resources (id, building_id, name, resource_type, capacity, approval_required, active) 
VALUES 
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Computer Lab 101', 'LAB', 60, false, true),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Seminar Hall A', 'AUDITORIUM', 150, true, true) 
ON CONFLICT DO NOTHING;

-- Support additional schema fields
ALTER TABLE resources ADD COLUMN IF NOT EXISTS building_name VARCHAR(255);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE resources ALTER COLUMN building_id DROP NOT NULL;

-- Seed More Campus Resources
INSERT INTO resources (id, name, resource_type, capacity, building_name, approval_required, created_at, updated_at) VALUES 
(gen_random_uuid(), 'Design Studio', 'LAB', 20, 'Arts & Media Center', false, NOW(), NOW()),
(gen_random_uuid(), 'Focus Room A', 'MEETING', 8, 'Library West', false, NOW(), NOW()),
(gen_random_uuid(), 'Focus Room B', 'MEETING', 6, 'Library West', false, NOW(), NOW()),
(gen_random_uuid(), 'Graduate Reading Room', 'STUDY ROOM', 18, 'Library West', false, NOW(), NOW()),
(gen_random_uuid(), 'Innovation Lab 204', 'LAB', 24, 'North Academic Block', true, NOW(), NOW()),
(gen_random_uuid(), 'Senate Hall', 'AUDITORIUM', 150, 'Admin Block', true, NOW(), NOW()),
(gen_random_uuid(), 'Multimedia Lab', 'LAB', 30, 'Arts & Media Center', false, NOW(), NOW()),
(gen_random_uuid(), 'Discussion Room 1', 'MEETING', 4, 'Student Center', false, NOW(), NOW()),
(gen_random_uuid(), 'Discussion Room 2', 'MEETING', 4, 'Student Center', false, NOW(), NOW()),
(gen_random_uuid(), 'Main Auditorium', 'AUDITORIUM', 500, 'Central Block', true, NOW(), NOW());

