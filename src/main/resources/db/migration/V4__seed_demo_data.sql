-- =====================================================
-- V4: Seed demo data for development
-- Passwords are BCrypt of 'password123'
-- =====================================================

-- Admin user
INSERT INTO users (first_name, last_name, username, email, password, email_verified)
VALUES ('Admin', 'User', 'admin', 'admin@animalwelfare.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);

-- Regular users
INSERT INTO users (first_name, last_name, username, email, password, email_verified)
VALUES ('Aayush', 'Shah', 'aayush', 'aayush@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);

INSERT INTO users (first_name, last_name, username, email, password, email_verified)
VALUES ('Manthan', 'Patel', 'manthan', 'manthan@example.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true);

-- Assign roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_USER';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username IN ('aayush', 'manthan') AND r.name = 'ROLE_USER';

-- Demo animals
INSERT INTO animals (name, category, breed, age_months, gender, color, location, description,
                     health_status, vaccinated, neutered, status, posted_by_id)
SELECT 'Bruno', 'DOG', 'Labrador', 18, 'MALE', 'Black', 'Mumbai, Maharashtra',
       'Friendly and playful Labrador found near the park. Loves children.',
       'Healthy', true, false, 'AVAILABLE', u.id
FROM users u WHERE u.username = 'aayush';

INSERT INTO animals (name, category, breed, age_months, gender, color, location, description,
                     health_status, vaccinated, neutered, status, posted_by_id)
SELECT 'Whiskers', 'CAT', 'Persian', 8, 'FEMALE', 'Orange and white', 'Delhi, NCR',
       'Sweet Persian cat found abandoned. Very gentle and calm.',
       'Healthy', true, true, 'AVAILABLE', u.id
FROM users u WHERE u.username = 'manthan';

INSERT INTO animals (name, category, breed, age_months, gender, color, location, description,
                     health_status, vaccinated, neutered, status, posted_by_id)
SELECT 'Max', 'DOG', 'German Shepherd', 36, 'MALE', 'Brown and black', 'Bangalore, Karnataka',
       'Trained German Shepherd looking for an active family.',
       'Healthy', true, false, 'AVAILABLE', u.id
FROM users u WHERE u.username = 'aayush';
