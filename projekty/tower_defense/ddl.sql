------------------------------------------------------------
-- DROP EXISTING NT_ TABLES
------------------------------------------------------------
BEGIN
    FOR t IN (SELECT table_name FROM user_tables WHERE table_name LIKE 'NT_%') LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- ============================================================================
-- 1. DROPOVÁNÍ STARÝCH TABULEK (Smazání databáze s ošetřením vazeb)
-- ============================================================================
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_wave_enemies CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_waves CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_user_friends CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_towers CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_tower_types CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_lead CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_enemies CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_en_typ CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_base CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE nt_users CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -942 THEN RAISE; END IF; END;
/

-- ============================================================================
-- 2. VYTVOŘENÍ NOVÝCH TABULEK S AUTO-INCREMENTY (IDENTITY)
-- ============================================================================

-- UŽIVATELÉ (ID se generuje automaticky)
CREATE TABLE nt_users (
    user_id      NUMBER GENERATED ALWAYS AS IDENTITY,
    username     VARCHAR2(40) NOT NULL,
    pasword_hash VARCHAR2(400),
    CONSTRAINT nt_users_PK PRIMARY KEY (user_id),
    CONSTRAINT nt_users_username_UN UNIQUE (username)
);

-- ZÁKLADNA HRÁČE (PK je sdílené s nt_users, takže tady auto-increment není schválně, aby to sedělo 1:1)
CREATE TABLE nt_base (
    nt_users_user_id INTEGER NOT NULL,
    base_health      FLOAT(2) DEFAULT 100,
    base_max_health  FLOAT(2) DEFAULT 100,
    base_classes     VARCHAR2(300),
    heroX            FLOAT(2) DEFAULT 80,
    heroY            FLOAT(2) DEFAULT 80,
    hero_classes     VARCHAR2(300),
    hero_health      INTEGER DEFAULT 50,
    hero_max_health  INTEGER DEFAULT 50,
    coins            INTEGER DEFAULT 0,
    score            INTEGER DEFAULT 0,
    "level"          INTEGER DEFAULT 1,
    base_attak       INTEGER DEFAULT 2,
    hero_attak       INTEGER DEFAULT 2,
    CONSTRAINT nt_base_PK PRIMARY KEY (nt_users_user_id)
);

-- ŠABLONY NEPŘÁTEL
CREATE TABLE nt_en_typ (
    name             VARCHAR2(40) NOT NULL,
    classes          VARCHAR2(300) NOT NULL,
    stats_config     VARCHAR2(200) NOT NULL,
    animation_config VARCHAR2(1000) NOT NULL,
    CONSTRAINT nt_en_typ_PK PRIMARY KEY (name)
);

-- ŽIVÍ NEPŘÁTELÉ NA MAPĚ
CREATE TABLE nt_enemies (
    x                        FLOAT(2) NOT NULL,
    y                        FLOAT(2) NOT NULL,
    extra_classes            VARCHAR2(300),
    "level"                  INTEGER NOT NULL,
    nt_base_nt_users_user_id INTEGER NOT NULL,
    nt_en_typ_name           VARCHAR2(40) NOT NULL,
    CONSTRAINT nt_enemies_PK PRIMARY KEY (nt_en_typ_name, nt_base_nt_users_user_id)
);

-- ŽEBŘÍČEK (ID řádku se generuje automaticky)
CREATE TABLE nt_lead (
    row_id           NUMBER GENERATED ALWAYS AS IDENTITY,
    score            INTEGER NOT NULL,
    nt_users_user_id INTEGER NOT NULL,
    CONSTRAINT nt_lead_PK PRIMARY KEY (row_id)
);

-- ŠABLONY VĚŽÍ
CREATE TABLE nt_tower_types (
    name             VARCHAR2(40) NOT NULL,
    classes          VARCHAR2(300) NOT NULL,
    stats_config     VARCHAR2(200) NOT NULL,
    animation_config VARCHAR2(1000) NOT NULL,
    CONSTRAINT nt_tower_types_PK PRIMARY KEY (name)
);

-- POSTAVENÉ VĚŽE NA MAPĚ
CREATE TABLE nt_towers (
    x                        FLOAT(2) NOT NULL,
    y                        FLOAT(2) NOT NULL,
    extra_classes            VARCHAR2(300),
    "level"                  INTEGER NOT NULL,
    nt_base_nt_users_user_id INTEGER NOT NULL,
    nt_tower_types_name      VARCHAR2(40) NOT NULL
);

-- PŘÁTELÉ (Vazební tabulka M:N)
CREATE TABLE nt_user_friends (
    nt_users_user_id  INTEGER NOT NULL,
    nt_users_user_id2 INTEGER NOT NULL,
    CONSTRAINT nt_user_friends_PK PRIMARY KEY (nt_users_user_id, nt_users_user_id2)
);

-- VLNY NEPŘÁTEL (ID vlny se generuje automaticky)
CREATE TABLE nt_waves (
    wave_id       NUMBER GENERATED ALWAYS AS IDENTITY,
    wave          INTEGER NOT NULL,
    budget        INTEGER NOT NULL,
    bonus_classes VARCHAR2(300),
    CONSTRAINT nt_waves_PK PRIMARY KEY (wave_id)
);

-- NEPŘÁTELÉ VE VLNÁCH (Vazební tabulka M:N)
CREATE TABLE nt_wave_enemies (
    nt_waves_wave_id INTEGER NOT NULL,
    nt_en_typ_name   VARCHAR2(40) NOT NULL,
    CONSTRAINT nt_wave_enemies_PK PRIMARY KEY (nt_waves_wave_id, nt_en_typ_name)
);

-- ============================================================================
-- 3. DEFINICE CIZÍCH KLÍČŮ (FOREIGN KEYS)
-- ============================================================================
ALTER TABLE nt_base ADD CONSTRAINT nt_base_nt_users_FK FOREIGN KEY (nt_users_user_id) REFERENCES nt_users (user_id);
ALTER TABLE nt_enemies ADD CONSTRAINT nt_enemies_nt_base_FK FOREIGN KEY (nt_base_nt_users_user_id) REFERENCES nt_base (nt_users_user_id);
ALTER TABLE nt_enemies ADD CONSTRAINT nt_enemies_nt_en_typ_FK FOREIGN KEY (nt_en_typ_name) REFERENCES nt_en_typ (name);
ALTER TABLE nt_lead ADD CONSTRAINT nt_lead_nt_users_FK FOREIGN KEY (nt_users_user_id) REFERENCES nt_users (user_id);
ALTER TABLE nt_towers ADD CONSTRAINT nt_towers_nt_base_FK FOREIGN KEY (nt_base_nt_users_user_id) REFERENCES nt_base (nt_users_user_id);
ALTER TABLE nt_towers ADD CONSTRAINT nt_towers_nt_tower_types_FK FOREIGN KEY (nt_tower_types_name) REFERENCES nt_tower_types (name);
ALTER TABLE nt_user_friends ADD CONSTRAINT nt_user_friends_nt_users_FK FOREIGN KEY (nt_users_user_id) REFERENCES nt_users (user_id);
ALTER TABLE nt_user_friends ADD CONSTRAINT nt_user_friends_nt_users_FKv2 FOREIGN KEY (nt_users_user_id2) REFERENCES nt_users (user_id);
ALTER TABLE nt_wave_enemies ADD CONSTRAINT nt_wave_enemies_nt_en_typ_FK FOREIGN KEY (nt_en_typ_name) REFERENCES nt_en_typ (name);
ALTER TABLE nt_wave_enemies ADD CONSTRAINT nt_wave_enemies_nt_waves_FK FOREIGN KEY (nt_waves_wave_id) REFERENCES nt_waves (wave_id);




















/*
------------------------------------------------------------
-- DROP EXISTING NT_ SEQUENCES
------------------------------------------------------------
BEGIN
    FOR s IN (SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE 'NT_%') LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    END LOOP;
END;
/

------------------------------------------------------------
-- CREATE TABLES
------------------------------------------------------------

CREATE TABLE nt_levels (
    level_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level_number  NUMBER NOT NULL,
    enemy_budget  NUMBER NOT NULL CHECK (enemy_budget >= 0)
);


CREATE TABLE nt_users (
    user_id        NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username       VARCHAR2(50) NOT NULL UNIQUE,
    password_hash  VARCHAR2(200) NOT NULL,
    level_id       NUMBER DEFAULT 1,
    base_hp        NUMBER DEFAULT 100 CHECK (base_hp >= 0),
    max_base_hp    NUMBER DEFAULT 100 CHECK (max_base_hp >= 0),
    base_damage    NUMBER DEFAULT 10 CHECK (base_damage >= 0),
    base_fire_rate NUMBER DEFAULT 1 CHECK (base_fire_rate >= 0),
    score          NUMBER DEFAULT 0,
    best_score     NUMBER DEFAULT 0,
    CONSTRAINT fk_user_level FOREIGN KEY (level_id)
        REFERENCES nt_levels(level_id)
);

CREATE TABLE nt_enemy_type (
    enemy_type_id  NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    min_level      NUMBER NOT NULL,
    health         NUMBER NOT NULL CHECK (health >= 0),
    speed          NUMBER NOT NULL CHECK (speed >= 0),
    damage         NUMBER NOT NULL CHECK (damage >= 0),
    reward         NUMBER NOT NULL CHECK (reward >= 0),
    cost           NUMBER NOT NULL CHECK (cost >= 0),
    CONSTRAINT fk_enemy_level FOREIGN KEY (min_level)
        REFERENCES nt_levels(level_id)
);

CREATE TABLE nt_tower_type (
    tower_type_id  NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    range_radius   NUMBER NOT NULL CHECK (range_radius >= 0),
    damage         NUMBER NOT NULL CHECK (damage >= 0),
    fire_rate      NUMBER NOT NULL CHECK (fire_rate >= 0),
    cost           NUMBER NOT NULL CHECK (cost >= 0)
);

CREATE TABLE nt_player_towers (
    tower_id       NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        NUMBER NOT NULL,
    tower_type_id  NUMBER NOT NULL,
    pos_x          NUMBER NOT NULL,
    pos_y          NUMBER NOT NULL,
    CONSTRAINT fk_pt_user FOREIGN KEY (user_id)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_type FOREIGN KEY (tower_type_id)
        REFERENCES nt_tower_type(tower_type_id)
);

CREATE TABLE nt_leaderboard (
    leaderboard_id NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        NUMBER NOT NULL,
    score          NUMBER NOT NULL,
    achieved_at    DATE DEFAULT SYSDATE,
    CONSTRAINT fk_lb_user FOREIGN KEY (user_id)
        REFERENCES nt_users(user_id)
);

CREATE TABLE nt_friend_users (
    user_id_1      NUMBER NOT NULL,
    user_id_2      NUMBER NOT NULL,
    created_at     DATE DEFAULT SYSDATE,
    CONSTRAINT pk_friend PRIMARY KEY (user_id_1, user_id_2),
    CONSTRAINT fk_friend_u1 FOREIGN KEY (user_id_1)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_u2 FOREIGN KEY (user_id_2)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_not_self CHECK (user_id_1 <> user_id_2)
);

CREATE TABLE nt_items (
    item_id        NUMBER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           VARCHAR2(50) NOT NULL UNIQUE,
    description    VARCHAR2(200),
    rarity         VARCHAR2(20),
    effect_type    VARCHAR2(30),
    effect_value   NUMBER DEFAULT 0
);

CREATE TABLE nt_player_items (
    player_item_id NUMBER GENERATED ALWAYS AS IDENTITY  PRIMARY KEY,
    user_id        NUMBER NOT NULL,
    item_id        NUMBER NOT NULL,
    quantity       NUMBER DEFAULT 1 CHECK (quantity >= 0),
    CONSTRAINT fk_pi_user FOREIGN KEY (user_id)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_item FOREIGN KEY (item_id)
        REFERENCES nt_items(item_id)
);

*/