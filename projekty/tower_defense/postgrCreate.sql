------------------------------------------------------------
-- DROP EXISTING NT_ TABLES
------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name LIKE 'nt_%') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || t || ' CASCADE';
    END LOOP;
END;
$$;

------------------------------------------------------------
-- DROP EXISTING NT_ SEQUENCES
------------------------------------------------------------
DO $$
DECLARE
    s TEXT;
BEGIN
    FOR s IN (SELECT sequence_name FROM information_schema.sequences
              WHERE sequence_schema = 'public' AND sequence_name LIKE 'nt_%') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || s;
    END LOOP;
END;
$$;

------------------------------------------------------------
-- CREATE TABLES
------------------------------------------------------------

CREATE TABLE nt_levels (
    level_id      SERIAL PRIMARY KEY,
    level_number  INTEGER NOT NULL,
    enemy_budget  INTEGER NOT NULL CHECK (enemy_budget >= 0)
);

CREATE TABLE nt_users (
    user_id        SERIAL PRIMARY KEY,
    username       VARCHAR(50) NOT NULL UNIQUE,
    password_hash  VARCHAR(200) NOT NULL,
    level_id       INTEGER DEFAULT 1,
    base_hp        INTEGER DEFAULT 100 CHECK (base_hp >= 0),
    max_base_hp    INTEGER DEFAULT 100 CHECK (max_base_hp >= 0),
    base_damage    INTEGER DEFAULT 10 CHECK (base_damage >= 0),
    base_fire_rate INTEGER DEFAULT 1 CHECK (base_fire_rate >= 0),
    score          INTEGER DEFAULT 0,
    best_score     INTEGER DEFAULT 0,
    CONSTRAINT fk_user_level FOREIGN KEY (level_id)
        REFERENCES nt_levels(level_id)
);

CREATE TABLE nt_enemy_type (
    enemy_type_id  SERIAL PRIMARY KEY,
    min_level      INTEGER NOT NULL,
    health         INTEGER NOT NULL CHECK (health >= 0),
    speed          NUMERIC NOT NULL CHECK (speed >= 0),
    damage         INTEGER NOT NULL CHECK (damage >= 0),
    reward         INTEGER NOT NULL CHECK (reward >= 0),
    cost           INTEGER NOT NULL CHECK (cost >= 0),
    CONSTRAINT fk_enemy_level FOREIGN KEY (min_level)
        REFERENCES nt_levels(level_id)
);

CREATE TABLE nt_tower_type (
    tower_type_id  SERIAL PRIMARY KEY,
    range_radius   NUMERIC NOT NULL CHECK (range_radius >= 0),
    damage         INTEGER NOT NULL CHECK (damage >= 0),
    fire_rate      NUMERIC NOT NULL CHECK (fire_rate >= 0),
    cost           INTEGER NOT NULL CHECK (cost >= 0)
);

CREATE TABLE nt_player_towers (
    tower_id       SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL,
    tower_type_id  INTEGER NOT NULL,
    pos_x          NUMERIC NOT NULL,
    pos_y          NUMERIC NOT NULL,
    CONSTRAINT fk_pt_user FOREIGN KEY (user_id)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_type FOREIGN KEY (tower_type_id)
        REFERENCES nt_tower_type(tower_type_id)
);

CREATE TABLE nt_leaderboard (
    leaderboard_id SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL,
    score          INTEGER NOT NULL,
    achieved_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lb_user FOREIGN KEY (user_id)
        REFERENCES nt_users(user_id)
);

CREATE TABLE nt_friend_users (
    user_id_1      INTEGER NOT NULL,
    user_id_2      INTEGER NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_friend PRIMARY KEY (user_id_1, user_id_2),
    CONSTRAINT fk_friend_u1 FOREIGN KEY (user_id_1)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_u2 FOREIGN KEY (user_id_2)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_not_self CHECK (user_id_1 <> user_id_2)
);

CREATE TABLE nt_items (
    item_id        SERIAL PRIMARY KEY,
    name           VARCHAR(50) NOT NULL UNIQUE,
    description    VARCHAR(200),
    rarity         VARCHAR(20),
    effect_type    VARCHAR(30),
    effect_value   NUMERIC DEFAULT 0
);

CREATE TABLE nt_player_items (
    player_item_id SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL,
    item_id        INTEGER NOT NULL,
    quantity       INTEGER DEFAULT 1 CHECK (quantity >= 0),
    CONSTRAINT fk_pi_user FOREIGN KEY (user_id)
        REFERENCES nt_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_item FOREIGN KEY (item_id)
        REFERENCES nt_items(item_id)
);