------------------------------------------------------------
-- DROP EXISTING NT_ TABLES
------------------------------------------------------------
BEGIN
    FOR t IN (SELECT table_name FROM user_tables WHERE table_name LIKE 'NT_%') LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

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

