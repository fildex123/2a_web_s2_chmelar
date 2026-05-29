--- Jednoduchý SELECT s WHERE a ORDER BY ---
1. Vypiš všechny uživatele, kteří mají skóre vyšší než 500, seřazené podle skóre sestupně.
SELECT * FROM nt_users
WHERE score > 500
ORDER BY score DESC;

2. Najdi všechny věže hráče s ID 10 a seřaď je podle souřadnice X vzestupně.
SELECT * FROM nt_player_towers
WHERE user_id = 10
ORDER BY pos_x ASC;

3. Zobraz všechny předměty s raritou „Epic“, seřazené podle názvu.
SELECT * FROM nt_items
WHERE rarity = 'Epic'
ORDER BY name;


--- Složitý SELECT s WHERE, aliasy a agregační funkcí ---
4. Zjisti průměrné skóre hráčů na jednotlivých levelech a vypiš jen levely, kde je průměr vyšší než 1000.
SELECT level_id, AVG(score) AS avg_score FROM nt_users
GROUP BY level_id
HAVING AVG(score) > 1000;

5. Vypiš počet věží, které vlastní každý hráč, a zobraz jen ty, kteří mají více než 5 věží.
SELECT user_id, COUNT(*) AS tower_count
FROM nt_player_towers
GROUP BY user_id
HAVING COUNT(*) > 5;


6. Zjisti celkový počet předmětů (součet quantity) u každého hráče a vypiš jen hráče s více než 20 předměty.
SELECT user_id, SUM(quantity) AS total_items
FROM nt_player_items
GROUP BY user_id
HAVING SUM(quantity) > 20;

--- INSERT, UPDATE, DELETE ---
7. Vlož nového uživatele s uživatelským jménem „PlayerX“ a základním HP 150.
INSERT INTO nt_users (username, password_hash, base_hp)
VALUES ('PlayerX', 'hash123', 150);

8. Aktualizuj skóre všech hráčů tak, aby se zvýšilo o 100 bodů.
UPDATE nt_users
SET score = score + 100;

9. Smaž všechny věže hráče s ID 5.
DELETE FROM nt_player_towers
WHERE user_id = 5;


--- Funkce pro práci s čísly ---
10. Vypiš všechny hráče, jejichž základní poškození zaokrouhlené nahoru je větší než 15.
SELECT * FROM nt_users
WHERE CEIL(base_damage) > 15;

11. Najdi všechny věže, jejichž souřadnice X modulo 2 je rovna 0.
SELECT * FROM nt_player_towers
WHERE MOD(pos_x, 2) = 0;

12. Zobraz hráče, jejichž skóre je rovno odmocnině jejich nejlepšího skóre.
SELECT * FROM nt_users
WHERE score = SQRT(best_score);


--- Funkce pro práci s datumy ---
13. Vypiš všechny záznamy v žebříčku vytvořené během posledních 7 dní.
SELECT * FROM nt_leaderboard
WHERE achieved_at >= SYSDATE - 7;

14. Najdi všechna přátelství vytvořená v roce 2024.
SELECT * FROM nt_friend_users
WHERE EXTRACT(YEAR FROM created_at) = 2024;

15. Zobraz hráče, kteří dosáhli skóre v žebříčku dříve než před 30 dny.
select * from nt_users u join nt_leaderboard l on(u.user_id = l.user_id)
where(achieved_at > Sysdate-30)

--- Funkce pro práci s řetězci ---
16. Najdi všechny hráče, jejichž uživatelské jméno začíná na „pla“.

select * from nt_users
where username like 'pla%'
17. Vypiš všechny předměty, jejichž popis obsahuje slovo „damage“.

select * from nt_items
where description LIKE '%damage%';

18. Zobraz hráče, jejichž uživatelské jméno má více než 8 znaků.

select * from nt_users
where length(username)>8;

--- Různé typy JOINů (alespoň 6) ---
19. Vypiš všechny hráče a jejich level (INNER JOIN).
select * from nt_users u join nt_levels l on (u.level_id = l.level_id)

20. Zobraz všechny hráče a jejich věže, i když žádné nevlastní (LEFT JOIN).
select * from nt_users u left join nt_player_towers t on(u.user_id = t.user_id)

21. Zobraz všechny věže a jejich majitele, i když uživatel již neexistuje (RIGHT JOIN).

select * from nt_users u right join nt_player_towers t on(u.user_id = t.user_id)

22. Najdi všechny dvojice přátel včetně těch, kteří nemají zpětné přátelství (FULL OUTER JOIN).

SELECT 
    u1.user_id_1 AS user_a,
    u1.user_id_2 AS user_b,
    u2.user_id_1 AS reverse_a,
    u2.user_id_2 AS reverse_b
FROM nt_friend_users u1
FULL OUTER JOIN nt_friend_users u2
    ON u1.user_id_1 = u2.user_id_2
   AND u1.user_id_2 = u2.user_id_1;


23. Vypiš všechny hráče a předměty, které vlastní (JOIN přes spojovací tabulku).

select * from nt_users u 
join nt_player_items pi on(u.user_id = pi.user_id)
join nt_items i on(pi.item_id = i.item_id);

24. Najdi všechny typy nepřátel, které mohou být generovány na levelech s rozpočtem vyšším než 300 (JOIN enemy_type → levels).
INSERT INTO nt_levels (level_number, enemy_budget) VALUES (11, 450);
select * from nt_enemy_type e left join nt_levels l on(l.level_id = e.min_level)
where(l.enemy_budget > 300)

--- Souhrnné dotazy ---
25. Zjisti celkový počet hráčů v databázi.
select count(*) from nt_users;
26. Zjisti celkový počet věží všech hráčů dohromady.
select count(*) from nt_player_towers;
27. Zjisti nejvyšší dosažené skóre v žebříčku.
select max(score) from nt_leaderboard;

--- Skupinové dotazy ---
28. Vypiš počet přátel, které má každý hráč, seskupené podle user_id.

select u.username, count(*) from nt_users u left join nt_friend_users f on(u.user_id = f.user_id_1 OR u.user_id = f.user_id_2)
group by(u.username)

29. Zjisti, kolik předmětů existuje v každé raritě.
select rarity ,count(*) from nt_items
group by rarity;

--- Poddotazy (jednořádkový, víceřádkový, korelovaný) ---
30. Vypiš všechny hráče, kteří mají vyšší skóre než hráč s uživatelským jménem „Admin“. (jednořádkový)

INSERT INTO nt_users (username, password_hash, level_id) VALUES ('Admin',  'adminHeslo',  11);

select * from nt_users u
where(u.score > (select score from nt_users where(username like 'Admin')))

31. Najdi všechny hráče, kteří vlastní některý z předmětů s raritou „Legendary“. (víceřádkový)

select * from nt_users u
where u.user_id in(
    select pi.user_id from nt_player_items pi join nt_items i on(i.item_id = pi.item_id)
    where(rarity='Legendary')
)

32. Najdi všechny hráče, kteří mají více předmětů než je průměrný počet předmětů všech hráčů. (korelovaný)

SELECT u.user_id, u.username
FROM nt_users u
WHERE (
    SELECT COUNT(*)
    FROM nt_player_items pi
    WHERE pi.user_id = u.user_id
) >
(
    SELECT AVG(item_count)
    FROM (
        SELECT COUNT(*) AS item_count
        FROM nt_player_items
        GROUP BY user_id
    )
);



--- Jednoduchý pohled ---
33. Vytvoř pohled, který zobrazuje hráče a jejich aktuální skóre.
create or replace view Player_score_view 
as select username, score from nt_users;

select * from Player_score_view;

--- Komplexní pohled ---
34. Vytvoř pohled, který zobrazuje hráče, jejich level, počet věží a celkový počet předmětů.
create or replace view player_closer_look
as select 
    u.username, 
    u.level_id, 
    COALESCE(t.tower_count, 0) AS tower_count,
    COALESCE(i.item_count, 0) AS item_count  

FROM nt_users u
LEFT JOIN (
    SELECT user_id, COUNT(*) AS tower_count
    FROM nt_player_towers
    GROUP BY user_id
) t ON u.user_id = t.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS item_count
    FROM nt_player_items
    GROUP BY user_id
) i ON u.user_id = i.user_id;

select * from player_closer_look;
--- In-line pohled ---
35. Vypiš hráče, kteří mají více věží, než je průměrný počet věží všech hráčů (in-line view ve FROM).

SELECT u.user_id, u.username, t.tower_count
FROM nt_users u
JOIN (
    SELECT user_id, COUNT(*) AS tower_count
    FROM nt_player_towers
    GROUP BY user_id
) t ON u.user_id = t.user_id
WHERE t.tower_count >
(
    SELECT AVG(t2.tower_count)
    FROM (
        SELECT user_id, COUNT(*) AS tower_count
        FROM nt_player_towers
        GROUP BY user_id
    ) t2
);
