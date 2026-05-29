-- LEVELS
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (1, 50);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (2, 75);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (3, 100);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (4, 150);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (5, 200);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (6, 250);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (7, 300);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (8, 350);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (9, 400);
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (10, 500);

-- USERS
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player1',  'hash1',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player2',  'hash2',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player3',  'hash3',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player4',  'hash4',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player5',  'hash5',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player6',  'hash6',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player7',  'hash7',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player8',  'hash8',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player9',  'hash9',  1);
INSERT INTO nt_users (username, password_hash, level_id) VALUES ('player10', 'hash10', 1);

-- ENEMY TYPES
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (1,  10,  1, 1,  1,  5);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (2,  20,  2, 2,  2,  10);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (3,  30,  2, 3,  3,  15);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (4,  40,  3, 4,  4,  20);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (5,  50,  3, 5,  5,  25);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (6,  60,  4, 6,  6,  30);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (7,  70,  4, 7,  7,  35);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (8,  80,  5, 8,  8,  40);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (9,  90,  5, 9,  9,  45);
INSERT INTO nt_enemy_type (min_level, health, speed, damage, reward, cost) VALUES (10, 100, 6, 10, 10, 50);

-- TOWER TYPES
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (3,  5,  1, 20);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (4,  7,  1, 30);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (5,  10, 2, 40);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (6,  12, 2, 50);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (7,  15, 3, 60);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (8,  18, 3, 70);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (9,  20, 4, 80);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (10, 25, 4, 90);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (11, 30, 5, 100);
INSERT INTO nt_tower_type (range_radius, damage, fire_rate, cost) VALUES (12, 35, 5, 120);

-- PLAYER TOWERS
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (1,  2,  2,  3);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (2,  3,  4,  6);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (3,  4,  6,  9);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (4,  5,  8,  12);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (5,  6,  10, 15);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (6,  7,  12, 18);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (7,  8,  14, 21);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (8,  9,  16, 24);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (9,  10, 18, 27);
INSERT INTO nt_player_towers (user_id, tower_type_id, pos_x, pos_y) VALUES (10, 1,  20, 30);

-- LEADERBOARD
INSERT INTO nt_leaderboard (user_id, score) VALUES (1,  100);
INSERT INTO nt_leaderboard (user_id, score) VALUES (2,  200);
INSERT INTO nt_leaderboard (user_id, score) VALUES (3,  300);
INSERT INTO nt_leaderboard (user_id, score) VALUES (4,  400);
INSERT INTO nt_leaderboard (user_id, score) VALUES (5,  500);
INSERT INTO nt_leaderboard (user_id, score) VALUES (6,  600);
INSERT INTO nt_leaderboard (user_id, score) VALUES (7,  700);
INSERT INTO nt_leaderboard (user_id, score) VALUES (8,  800);
INSERT INTO nt_leaderboard (user_id, score) VALUES (9,  900);
INSERT INTO nt_leaderboard (user_id, score) VALUES (10, 1000);

-- FRIEND USERS
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (1,  2);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (2,  3);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (3,  4);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (4,  5);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (5,  6);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (6,  7);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (7,  8);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (8,  9);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (9,  10);
INSERT INTO nt_friend_users (user_id_1, user_id_2) VALUES (10, 1);

-- ITEMS
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Health Potion',  'Restores HP',        'Common',   'HP',     20);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Mana Potion',    'Restores mana',      'Common',   'MP',     15);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Damage Boost',   'Increases damage',   'Rare',     'DMG',    5);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Speed Boost',    'Increases speed',    'Rare',     'SPD',    3);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Fire Bomb',      'Deals AoE damage',   'Epic',     'AOE',    50);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Shield',         'Temporary shield',   'Common',   'SHIELD', 30);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Critical Charm', 'Boosts crit chance', 'Rare',     'CRIT',   10);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Gold Coin',      'Extra gold',         'Common',   'GOLD',   5);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('XP Scroll',      'Extra XP',           'Uncommon', 'XP',     25);
INSERT INTO nt_items (name, description, rarity, effect_type, effect_value) VALUES ('Mega Potion',    'Large heal',         'Epic',     'HP',     100);

-- PLAYER ITEMS
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (1,  2,  1);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (2,  3,  2);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (3,  4,  3);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (4,  5,  4);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (5,  6,  5);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (6,  7,  1);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (7,  8,  2);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (8,  9,  3);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (9,  10, 4);
INSERT INTO nt_player_items (user_id, item_id, quantity) VALUES (10, 1,  5);

COMMIT;