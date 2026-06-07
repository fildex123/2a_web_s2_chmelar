SET DEFINE OFF; -- Vypne otravné dotazy Oracle na zadávání proměnných, pokud by v textu bylo znaménko ampersand

-- ============================================================================
-- 1. ŠABLONY VĚŽÍ (nt_tower_types)
-- ============================================================================
INSERT INTO nt_tower_types (name, classes, stats_config, animation_config) VALUES 
('basicNinja', '["shooter", "targeting", "healthBar"]', '{"health": 20, "attackDamage": 1}', '{"sheet": "tower", "defaultAnimation": "walking"}');
INSERT INTO nt_tower_types (name, classes, stats_config, animation_config) VALUES 
('spikes', '["puncher", "fastpuncher", "untouchable"]', '{"health": 50, "attackDamage": 3}', '{"sheet": "tower", "defaultAnimation": "walking"}');
INSERT INTO nt_tower_types (name, classes, stats_config, animation_config) VALUES 
('archer_tower', '["shooter", "long_range"]', '{"health": 150, "attackDamage": 5}', '{"sheet": "main", "defaultAnimation": "standing"}');
INSERT INTO nt_tower_types (name, classes, stats_config, animation_config) VALUES 
('cannon', '["aoe_damage", "slow_attack"]', '{"health": 200, "attackDamage": 25}', '{"sheet": "main", "defaultAnimation": "standing"}');
INSERT INTO nt_tower_types (name, classes, stats_config, animation_config) VALUES 
('ice_mage', '["freezer", "support"]', '{"health": 80, "attackDamage": 2}', '{"sheet": "tower", "defaultAnimation": "walking"}');

-- ============================================================================
-- 2. ŠABLONY NEPŘÁTEL (nt_en_typ)
-- ============================================================================
INSERT INTO nt_en_typ (name, classes, stats_config, animation_config) VALUES 
('blob', '["speeder", "onDieRemove", "shadow"]', '{"isEnemy": true, "health": 100, "attackDamage": 30}', '{"sheet": "enemy", "defaultAnimation": "walking"}');
INSERT INTO nt_en_typ (name, classes, stats_config, animation_config) VALUES 
('orc', '["tank", "heavy"]', '{"isEnemy": true, "health": 350, "attackDamage": 15}', '{"sheet": "enemy", "defaultAnimation": "walking"}');
INSERT INTO nt_en_typ (name, classes, stats_config, animation_config) VALUES 
('goblin', '["fast", "low_hp"]', '{"isEnemy": true, "health": 40, "attackDamage": 5}', '{"sheet": "enemy", "defaultAnimation": "walking"}');
INSERT INTO nt_en_typ (name, classes, stats_config, animation_config) VALUES 
('skeleton', '["normal"]', '{"isEnemy": true, "health": 120, "attackDamage": 10}', '{"sheet": "enemy", "defaultAnimation": "walking"}');
INSERT INTO nt_en_typ (name, classes, stats_config, animation_config) VALUES 
('dragon_boss', '["boss", "flying"]', '{"isEnemy": true, "health": 2500, "attackDamage": 80}', '{"sheet": "enemy", "defaultAnimation": "walking"}');

-- ============================================================================
-- 3. VLNY NEPŘÁTEL (nt_waves)
-- ============================================================================
INSERT INTO nt_waves (wave, budget, bonus_classes) VALUES (1, 100, '["basic"]');
INSERT INTO nt_waves (wave, budget, bonus_classes) VALUES (2, 250, '["basic"]');
INSERT INTO nt_waves (wave, budget, bonus_classes) VALUES (3, 500, '["speedrun"]');
INSERT INTO nt_waves (wave, budget, bonus_classes) VALUES (4, 1000, '["armored"]');
INSERT INTO nt_waves (wave, budget, bonus_classes) VALUES (5, 5000, '["boss_fight"]');

-- ============================================================================
-- 4. PROPOJENÍ NEPŘÁTEL DO VLN (nt_wave_enemies)
-- ============================================================================
-- Vlna 1: Goblini a Blobové
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (1, 'goblin');
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (1, 'blob');
-- Vlna 2: Blobové a Kostlivci
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (2, 'blob');
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (2, 'skeleton');
-- Vlna 3: Kostlivci a Orci
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (3, 'skeleton');
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (3, 'orc');
-- Vlna 4: Orci a Goblini ve velkém
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (4, 'orc');
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (4, 'goblin');
-- Vlna 5: Všichni + Drak
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (5, 'orc');
INSERT INTO nt_wave_enemies (nt_waves_wave_id, nt_en_typ_name) VALUES (5, 'dragon_boss');

-- ============================================================================
-- 5. 25 REÁLNÝCH UŽIVATELŮ (nt_users)
-- ============================================================================
INSERT INTO nt_users    
INSERT INTO nt_users (username, pasword_hash) VALUES ('tomas_pro', 'hash_tomas456');
INSERT INTO nt_users (username, pasword_hash) VALUES ('lucia_td', 'hash_lucia789');
INSERT INTO nt_users (username, pasword_hash) VALUES ('ninja_master', 'hash_ninja111');
INSERT INTO nt_users (username, pasword_hash) VALUES ('gandalf_grey', 'hash_magic222');
INSERT INTO nt_users (username, pasword_hash) VALUES ('destroyer99', 'hash_destr333');
INSERT INTO nt_users (username, pasword_hash) VALUES ('speedy_gonzales', 'hash_fast444');
INSERT INTO nt_users (username, pasword_hash) VALUES ('shadow_hunter', 'hash_dark555');
INSERT INTO nt_users (username, pasword_hash) VALUES ('queen_bee', 'hash_honey666');
INSERT INTO nt_users (username, pasword_hash) VALUES ('king_arthur', 'hash_sword777');
INSERT INTO nt_users (username, pasword_hash) VALUES ('player_one', 'hash_ready888');
INSERT INTO nt_users (username, pasword_hash) VALUES ('matrix_neo', 'hash_one999');
INSERT INTO nt_users (username, pasword_hash) VALUES ('cyber_punk', 'hash_2077abc');
INSERT INTO nt_users (username, pasword_hash) VALUES ('alpha_wolf', 'hash_howl000');
INSERT INTO nt_users (username, pasword_hash) VALUES ('lucky_strike', 'hash_clover7');
INSERT INTO nt_users (username, pasword_hash) VALUES ('phoenix_rise', 'hash_fire88');
INSERT INTO nt_users (username, pasword_hash) VALUES ('iron_man', 'hash_stark3000');
INSERT INTO nt_users (username, pasword_hash) VALUES ('black_widow', 'hash_spy123');
INSERT INTO nt_users (username, pasword_hash) VALUES ('captain_cz', 'hash_shield99');
INSERT INTO nt_users (username, pasword_hash) VALUES ('thor_thunder', 'hash_hammer4');
INSERT INTO nt_users (username, pasword_hash) VALUES ('loki_mischief', 'hash_trick88');
INSERT INTO nt_users (username, pasword_hash) VALUES ('hulk_smash', 'hash_green999');
INSERT INTO nt_users (username, pasword_hash) VALUES ('hawkeye', 'hash_arrow1');
INSERT INTO nt_users (username, pasword_hash) VALUES ('starlord', 'hash_music80s');
INSERT INTO nt_users (username, pasword_hash) VALUES ('groot', 'hash_iamgroot');

-- ============================================================================
-- 6. ZÁKLADNY PRO VŠECHNY HRÁČE (nt_base) - ID od 1 do 25
-- ============================================================================
-- Top hráči s vysokým skóre a levelem
INSERT INTO nt_base (nt_users_user_id, base_health, base_max_health, base_classes, heroX, heroY, hero_classes, hero_health, hero_max_health, coins, score, "level", base_attak, hero_attak) VALUES 
(1, 100, 100, '["baseBasic"]', 120, 140, '["playerBasic", "shooter"]', 50, 50, 450, 8500, 5, 2, 4);
INSERT INTO nt_base (nt_users_user_id, base_health, base_max_health, base_classes, heroX, heroY, hero_classes, hero_health, hero_max_health, coins, score, "level", base_attak, hero_attak) VALUES 
(2, 85, 100, '["baseBasic", "regenerates"]', 80, 80, '["playerBasic", "shadow"]', 40, 50, 1200, 12400, 5, 3, 5);
INSERT INTO nt_base (nt_users_user_id, base_health, base_max_health, base_classes, heroX, heroY, hero_classes, hero_health, hero_max_health, coins, score, "level", base_attak, hero_attak) VALUES 
(3, 100, 100, '["baseBasic"]', 95, 210, '["playerBasic", "regenerates"]', 50, 50, 20, 9100, 4, 2, 2);
INSERT INTO nt_base (nt_users_user_id, base_health, base_max_health, base_classes, heroX, heroY, hero_classes, hero_health, hero_max_health, coins, score, "level", base_attak, hero_attak) VALUES 
(4, 40, 100, '["baseBasic"]', 45, 55, '["playerBasic"]', 15, 50, 80, 4300, 3, 2, 3);
INSERT INTO nt_base (nt_users_user_id, base_health, base_max_health, base_classes, heroX, heroY, hero_classes, hero_health, hero_max_health, coins, score, "level", base_attak, hero_attak) VALUES 
(5, 100, 120, '["baseBasic", "shielded"]', 150, 150, '["playerBasic", "shooter"]', 60, 60, 2500, 15000, 5, 4, 6);

-- Středně pokročilí (Level 2-3)
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (6, 150, 2100, 2);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (7, 340, 3400, 3);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (8, 0, 1800, 2);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (9, 890, 4900, 3);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (10, 420, 5200, 3);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (11, 110, 2500, 2);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (12, 670, 6100, 4);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (13, 230, 3000, 3);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (14, 50, 1200, 2);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (15, 710, 4400, 3);

-- Začátečníci nebo čerstvě resetovaní (Level 1)
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (16, 0, 0, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (17, 10, 200, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (18, 50, 500, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (19, 0, 150, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (20, 120, 650, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (21, 35, 400, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (22, 0, 0, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (23, 200, 900, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (24, 15, 300, 1);
INSERT INTO nt_base (nt_users_user_id, coins, score, "level") VALUES (25, 0, 50, 1);

-- ============================================================================
-- 7. POSTAVENÉ VĚŽE NA MAPĚ (nt_towers) - Ukázka pro první hráče
-- ============================================================================
-- Hráč 1 (filip) - má postaveno pár věží
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (40, 50, '["frontline"]', 1, 1, 'basicNinja');
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (40, 70, '["frontline"]', 1, 1, 'spikes');
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (100, 100, '["backline"]', 2, 1, 'archer_tower');

-- Hráč 2 (tomas_pro) - silná obrana
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (30, 30, '["chokepoint"]', 3, 2, 'cannon');
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (35, 60, '["slowzone"]', 2, 2, 'ice_mage');
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (35, 80, '["trap"]', 1, 2, 'spikes');

-- Hráč 5 (gandalf_grey) - pokročilé věže
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (50, 50, '["magic"]', 2, 5, 'ice_mage');
INSERT INTO nt_towers (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_tower_types_name) VALUES (120, 30, '["artillery"]', 1, 5, 'cannon');

-- ============================================================================
-- 8. ŽIVÍ NEPŘÁTELÉ V PROBÍHAJÍCÍCH HRÁCH (nt_enemies)
-- ============================================================================
-- U hráče 1 (filip) zrovna útočí na mapě 2 goblini a 1 blob
INSERT INTO nt_enemies (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_en_typ_name) VALUES (10.5, 20.0, '["sprint"]', 1, 1, 'goblin');
INSERT INTO nt_enemies (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_en_typ_name) VALUES (12.0, 25.5, '["sprint"]', 1, 1, 'goblin');
INSERT INTO nt_enemies (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_en_typ_name) VALUES (5.0, 40.0, '["wounded"]', 1, 1, 'blob');

-- U hráče 4 (ninja_master) teče do bot, útočí na něj silný Orc
INSERT INTO nt_enemies (x, y, extra_classes, "level", nt_base_nt_users_user_id, nt_en_typ_name) VALUES (40.0, 42.0, '["enraged"]', 2, 4, 'orc');

-- ============================================================================
-- 9. HISTORIE GLOBÁLNÍHO ŽEBŘÍČKU (nt_lead) - Simulace starých dohraných her
-- ============================================================================
-- Někteří top hráči už hry dokončili/prohráli a zapsali rekordy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (25000, 2);  -- tomas_pro drží top 1 historicky
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (18400, 5);  -- gandalf_grey
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (11200, 1);  -- filipův starý rekord
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (9500, 12);  -- matrix_neo
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (8400, 3);   -- lucia_td
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (6200, 10);  -- king_arthur
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (4100, 7);   -- speedy_gonzales
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (3000, 17);  -- iron_man
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1500, 20);  -- thor_thunder
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (500, 25);   -- groot prohrál brzo

-- ============================================================================
-- 10. SOCIÁLNÍ SÍŤ / PŘÁTELÉ (nt_user_friends)
-- ============================================================================
-- Filip (ID 1) se přátelí s Tomášem (2), Lucií (3) a Iron Manem (17)
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (1, 2);
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (1, 3);
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (1, 17);

-- Tomáš (ID 2) se přátelí s Lucií (3) a Gandalfem (5)
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (2, 3);
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (2, 5);

-- Avengers drží spolu (Iron Man, Black Widow, Thor)
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (17, 18);
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (17, 20);
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (18, 20);

-- Loki a Thor (rivalové/přátelé)
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (20, 21);

-- Strážci galaxie (Starlord a Groot)
INSERT INTO nt_user_friends (nt_users_user_id, nt_users_user_id2) VALUES (24, 25);

SET DEFINE OFF;

-- ============================================================================
-- DOPLŇKOVÉ HISTORICKÉ ZÁZNAMY PRO ŽEBŘÍČEK (nt_lead)
-- ============================================================================

-- Uživatel 1 (filip) - už má 1 záznam, přidáme další 3
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (4200, 1);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (6800, 1);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (10500, 1);

-- Uživatel 2 (tomas_pro) - už má 1, přidáme další 2
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (15200, 2);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (21000, 2);

-- Uživatel 3 (lucia_td) - už má 1, přidáme další 4
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1200, 3);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (3500, 3);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (5900, 3);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (7800, 3);

-- Uživatel 4 (ninja_master) - zatím nemá nic, dostane 3 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (900, 4);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2400, 4);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (4100, 4);

-- Uživatel 5 (gandalf_grey) - už má 1, přidáme 1
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (13500, 5);

-- Uživatel 6 (destroyer99) - dostane 2 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (850, 6);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1900, 6);

-- Uživatel 7 (speedy_gonzales) - už má 1, přidáme 3
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (400, 7);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1500, 7);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2900, 7);

-- Uživatel 8 (shadow_hunter) - dostane 1 záznam
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1650, 8);

-- Uživatel 9 (queen_bee) - dostane 4 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1100, 9);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2300, 9);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (3400, 9);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (4600, 9);

-- Uživatel 10 (king_arthur) - už má 1, přidáme 2
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2100, 10);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (4800, 10);

-- Uživatel 11 (player_one) - schválně 0 záznamů (nováček bez historie)

-- Uživatel 12 (matrix_neo) - už má 1, přidáme 3
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (3100, 12);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (5400, 12);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (8900, 12);

-- Uživatel 13 (cyber_punk) - dostane 2 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1200, 13);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2800, 13);

-- Uživatel 14 (alpha_wolf) - dostane 1 záznam
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (950, 14);

-- Uživatel 15 (lucky_strike) - dostane 5 záznamů (hodně hraje)
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (300, 15);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1100, 15);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2150, 15);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (3200, 15);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (4100, 15);

-- Uživatel 16 (phoenix_rise) - schválně 0 záznamů

-- Uživatel 17 (iron_man) - už má 1, přidáme 4
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (500, 17);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1200, 17);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2200, 17);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (2900, 17);

-- Uživatel 18 (black_widow) - dostane 2 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (450, 18);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (600, 18);

-- Uživatel 19 (captain_cz) - dostane 1 záznam
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (120, 19);

-- Uživatel 20 (thor_thunder) - už má 1, přidáme 1
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (600, 20);

-- Uživatel 21 (loki_mischief) - dostane 3 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (800, 21);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (1900, 21);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (3100, 21);

-- Uživatel 22 (hulk_smash) - dostane 1 záznam
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (0, 22); -- hned umřel v 1. vlně

-- Uživatel 23 (hawkeye) - dostane 2 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (400, 23);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (850, 23);

-- Uživatel 24 (starlord) - dostane 3 záznamy
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (150, 24);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (280, 24);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (420, 24);

-- Uživatel 25 (groot) - už má 1, přidáme další 2
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (100, 25);
INSERT INTO nt_lead (score, nt_users_user_id) VALUES (450, 25);


COMMIT; -- Definitivně uloží všechna nasimulovaná data do Oraclu