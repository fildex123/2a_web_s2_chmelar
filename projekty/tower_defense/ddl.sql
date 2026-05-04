------------------------------------------------------------
-- DROP EXISTING TABLES (SAFE ORDER)
------------------------------------------------------------
BEGIN EXECUTE IMMEDIATE 'DROP TABLE leaderboard CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE friends CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE player_towers CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE tower_types CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE enemy_types CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE players CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE levels CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

------------------------------------------------------------
-- CREATE TABLES
------------------------------------------------------------

-- LEVELS
CREATE TABLE levels (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level_number NUMBER NOT NULL UNIQUE,
    enemy_budget NUMBER NOT NULL CHECK (enemy_budget >= 0)
);

-- PLAYERS
CREATE TABLE players (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    level_id NUMBER NOT NULL,
    main_tower_hp NUMBER NOT NULL CHECK (main_tower_hp >= 0),
    main_tower_hp_max NUMBER NOT NULL CHECK (main_tower_hp_max >= 0),
    main_tower_damage NUMBER NOT NULL CHECK (main_tower_damage >= 0),
    main_tower_fire_rate NUMBER(10,2) NOT NULL CHECK (main_tower_fire_rate >= 0),
    score NUMBER DEFAULT 0 CHECK (score >= 0),
    best_score NUMBER DEFAULT 0 CHECK (best_score >= 0),

    CONSTRAINT fk_players_levels
        FOREIGN KEY (level_id) REFERENCES levels(id)
);

-- ENEMY TYPES
CREATE TABLE enemy_types (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_appearance_level NUMBER NOT NULL CHECK (first_appearance_level >= 1),
    hp NUMBER NOT NULL CHECK (hp >= 0),
    speed NUMBER(10,2) NOT NULL CHECK (speed >= 0),
    damage NUMBER NOT NULL CHECK (damage >= 0),
    reward NUMBER NOT NULL CHECK (reward >= 0),
    cost NUMBER NOT NULL CHECK (cost >= 0)
);

-- TOWER TYPES
CREATE TABLE tower_types (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    range NUMBER NOT NULL CHECK (range >= 0),
    damage NUMBER NOT NULL CHECK (damage >= 0),
    fire_rate NUMBER(10,2) NOT NULL CHECK (fire_rate >= 0),
    cost NUMBER NOT NULL CHECK (cost >= 0)
);

-- PLAYER TOWERS
CREATE TABLE player_towers (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    player_id NUMBER NOT NULL,
    tower_type_id NUMBER NOT NULL,
    x NUMBER NOT NULL,
    y NUMBER NOT NULL,

    CONSTRAINT fk_pt_player
        FOREIGN KEY (player_id) REFERENCES players(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pt_tower_type
        FOREIGN KEY (tower_type_id) REFERENCES tower_types(id)
);

-- FRIENDS
CREATE TABLE friends (
    player_id NUMBER NOT NULL,
    friend_id NUMBER NOT NULL,

    CONSTRAINT pk_friends PRIMARY KEY (player_id, friend_id),

    CONSTRAINT fk_friends_player
        FOREIGN KEY (player_id) REFERENCES players(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_friends_friend
        FOREIGN KEY (friend_id) REFERENCES players(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_friends_not_self CHECK (player_id <> friend_id)
);

-- LEADERBOARD
CREATE TABLE leaderboard (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    player_id NUMBER NOT NULL,
    score NUMBER NOT NULL CHECK (score >= 0),
    finished_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lb_player
        FOREIGN KEY (player_id) REFERENCES players(id)
        ON DELETE CASCADE
);

------------------------------------------------------------
-- DONE
------------------------------------------------------------
S