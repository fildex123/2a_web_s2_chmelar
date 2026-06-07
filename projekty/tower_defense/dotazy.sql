
==============================================================================
KATEGORIE: Jednoduchý SELECT s podmínkem WHERE a ORDER BY
==============================================================================
1. Vypiš uživatelská jména všech hráčů, kteří mají na své základně více než 1000 mincí (coins), seřazené od nejbohatšího.

select u.username,b.coins from nt_users u join nt_base b on (b.nt_users_user_id = u.user_id)
where b.coins > 1000
order by b.coins;

2. Najdi všechny živé nepřátele na mapě, kteří jsou na level 3 a více, a seřaď je podle souřadnice Y vzestupně pro hráče s username filip
select * from nt_enemies;
SELECT * FROM nt_enemies e 
join nt_users u on (u.user_id = e.NT_BASE_NT_USERS_USER_ID)
WHERE e."level" >= 3 AND u.username = 'filip'
ORDER BY e.y ASC;

3. Zobraz všechny šablony věží z nt_tower_types, jejichž název (name) není 'spikes', seřazené abecedně.

select * from nt_tower_types
where name != 'spikes'
order by name


==============================================================================
KATEGORIE: Složitý SELECT s podmínkou WHERE, aliasy a agregační funkcí
==============================================================================
4. Zjisti průměrné poškození hrdiny (hero_attak) u hráčů, kteří dosáhli alespoň 2. levelu, seskupené podle aktuálního levelu.
select * from nt_base;

select "level",avg(hero_attak) from nt_base
group by("level")
having ("level" > 1)

5. Vypiš ID základen, na kterých je aktuálně postaveno více než 2 věže.
select * from nt_towers;

select b.nt_users_user_id, count(t.x) from nt_base b join nt_towers t on(t.NT_BASE_NT_USERS_USER_ID = b.nt_users_user_id)
group by(b.nt_users_user_id)
having (count(t.x)>2);

6. Zjisti maximální dosažené zdraví hrdiny (hero_health) na jednotlivých levelech, ale zobraz jen ty úrovně, kde je toto maximum větší než 50.

select "level", max(hero_health) from nt_base
group by "level"
having max(hero_health)>50
order by "level";


==============================================================================
KATEGORIE: INSERT, UPDATE, DELETE
==============================================================================
7. Zaregistruj nového uživatele s jménem 'SniperGod' a hashem hesla: heslo123.

insert into nt_users 
(username, pasword_hash) VALUES ('SniperGod', 'heslo123');

8. Přidej všem hráčům, kteří jsou momentálně v levelu 1, bonusových 500 mincí.

UPDATE nt_base
SET coins = coins + 500
WHERE "level" = 1;


9. Vymaž z mapy všechny živé nepřátele, kteří se nacházejí na základně hráče s ID 4.

DELETE FROM nt_enemies
WHERE nt_base_nt_users_user_id = 4;




==============================================================================
KATEGORIE: Funkce pro práci s čísly
==============================================================================
10. Vypiš všechny postavené věže, jejichž souřadnice X po zaokrouhlení nahoru (CEIL) dává přesně hodnotu 40.

select * from nt_towers
where (ceil(x)=40)

11. Najdi všechny uživatele, jejichž ID (user_id) je liché číslo (modulo 2 je rovno 1).

select * from nt_users
where mod(user_id,2) = 1; 


12. Zobraz absolutní hodnotu (ABS) rozdílu mezi maximálními a aktuálními životy hrdiny u všech základen.

select abs(b.hero_max_health - b.hero_health), u.username from nt_base b join nt_users u on(b.nt_users_user_id = u.user_id);

==============================================================================
KATEGORIE: Funkce pro práci s datumy
==============================================================================
13. Vypiš aktuální datum a čas spuštění tohoto kontrolního dotazu nad žebříčkem (využití SYSDATE).

SELECT SYSDATE FROM dual;


14. Vypiš rok, ve kterém provádíš obhajobu této databáze (vytažení roku z aktuálního systémového data pomocí EXTRACT).

select EXTRACT(YEAR FROM SYSDATE) as year FROM dual;

==============================================================================
KATEGORIE: Funkce pro práci s řetězci
==============================================================================


16. Najdi všechny uživatele, jejichž uživatelské jméno obsahuje text 'master' (využití operátoru LIKE s divokými znaky).

SELECT * FROM nt_users WHERE username LIKE '%master%';


17. Vypiš názvy typů věží převedené na velká písmena (UPPER) a spočítej počet znaků v jejich názvu (LENGTH).

select UPPER(name), length(name) from nt_tower_types;

18. Najdi uživatele, jejichž první tři písmena jména odpovídají řetězci 'tho' (využití ořezové funkce SUBSTR).

SELECT * FROM nt_users WHERE username LIKE 'tho%';


==============================================================================
KATEGORIE: Různé typy joinů (alespoň 6 různých typů spojení)
==============================================================================
19. Vypiš uživatelská jména hráčů a k nim přiřazené životy základny (INNER JOIN).

select u.username, b.base_health from nt_users u join nt_base b on (b.nt_users_user_id = u.user_id)

20. Vypiš všechny uživatele z databáze a jejich záznamy v žebříčku. Pokud hráč ještě v žebříčku zápis nemá, vypiš u něj prázdné hodnoty (LEFT OUTER JOIN).

select u.username, l.score  from nt_users u left outer join nt_lead l on(u.user_id = l.nt_users_user_id)

22. Spoj tabulky uživatelů a žebříčku tak, aby se zobrazili úplně všichni uživatelé i všechny osamocené záznamy v žebříčku, pokud by existovaly (FULL OUTER JOIN).

select * from nt_users u full outer join nt_lead l on(u.user_id = l.nt_users_user_id);

23. Propoj tabulky levely a nepřátele přes spojovací tabulku, aby bylo vidět, jací nepřátelé patří do jakého levelu (JOIN přes asociační tabulku M:N).

select * from nt_en_typ;
select * from nt_wave_enemies;
select * from nt_waves;

select w.wave, e.name from nt_waves w 
join nt_wave_enemies we on (w.wave_id = we.NT_WAVES_WAVE_ID)
join nt_en_typ e on(e.name = we.NT_EN_TYP_NAME)

24. Vypiš kartézský součin všech uživatelů a všech typů věží pro vygenerování kompletní matice možností (CROSS JOIN).

select * from nt_users u cross join nt_tower_types

==============================================================================
KATEGORIE: Souhrnné dotazy
==============================================================================
25. Zjisti celkový počet registrovaných hráčů v systému (COUNT).

select count(*) from nt_users;

26. Vypiš celkovou sumu mincí (coins), kterou mají všichni aktivní hráči momentálně na svých základnách (SUM).

select sum(coins) from nt_base;

27. Najdi nejvyšší a nejnižší skóre, jaké kdy bylo zaznamenáno v historickém žebříčku (MAX a MIN).

select min(score) min, max(score) max from nt_lead;

==============================================================================
KATEGORIE: Skupinové dotazy
==============================================================================
28. Vypiš, kolik nepřátel je aktuálně živých na mapách jednotlivých hráčů. Výsledek seskup podle ID hráče (GROUP BY).

select * from nt_enemies

select count(*) from nt_users u join nt_enemies e on(e.NT_BASE_NT_USERS_USER_ID = u.user_id)
group by (u.user_id);

29. Spočítej, kolik typů nepřátel je přiřazeno k jednotlivým levelech v tabulce nt_wave_enemies, a seskup to podlelevel id (GROUP BY).

select * from nt_en_typ;
select * from nt_wave_enemies;
select * from nt_waves;

select w.wave_id ,count(DISTINCT et.name) from nt_waves w 
join nt_wave_enemies we on(we.NT_WAVES_WAVE_ID = w.WAVE_ID)
join nt_en_typ et on(et.name = we.NT_EN_TYP_NAME)
group by w.wave_id;

==============================================================================
KATEGORIE: Poddotazy (jednořádkový, víceřádkový, korelovaný)
==============================================================================
30. Vypiš všechny informace o základnách, které mají stejný nebo vyšší level než hráč s jménem 'filip' (Jednořádkový poddotaz).

SELECT * FROM nt_base
WHERE "level" >= (
    SELECT "level" FROM nt_base 
    WHERE nt_users_user_id = (SELECT user_id FROM nt_users WHERE username = 'filip')
);

31. Vypiš všechny uživatele, kteří mají alespoň jeden záznam v tabulce žebříčku (Víceřádkový poddotaz s operátorem IN).

SELECT * FROM nt_users
WHERE user_id IN (SELECT DISTINCT nt_users_user_id FROM nt_lead);

32. Najdi uživatele, kteří mají na své základně více mincí, než je průměrný počet mincí u všech základen (Korelovaný poddotaz).

SELECT u.user_id, u.username
FROM nt_users u
WHERE (SELECT b.coins FROM nt_base b WHERE b.nt_users_user_id = u.user_id) > 
    (SELECT AVG(coins) FROM nt_base)
;

==============================================================================
KATEGORIE: Pohledy (jednoduchý, komplexní, in-line)
==============================================================================
33. Vytvoř jednoduchý pohled, který bude ukazovat pouze ID uživatele a jeho herní jméno (Jednoduchý pohled nad jednou tabulkou).

CREATE OR REPLACE VIEW v_jednoduchy_prehled AS 
SELECT user_id, username FROM nt_users;

select * from v_jednoduchy_prehled;


34. Vytvoř komplexní pohled, který spojí uživatele, jejich základnu a pomocí poddotazu dopočítá aktuální počet věží každého hráče (Komplexní pohled se spojením a agregací).

CREATE OR REPLACE VIEW v_komplexni_statistika AS
SELECT 
    u.username,
    b."level" AS aktualni_level,
    b.score AS aktualni_skore,
    (SELECT COUNT(*) FROM nt_towers t WHERE t.nt_base_nt_users_user_id = u.user_id) AS pocet_vezi
FROM nt_users u
JOIN nt_base b ON u.user_id = b.nt_users_user_id;

SELECT * FROM v_komplexni_statistika;

35. Vypiš jména hráčů a jejich skóre z žebříčku, ale pouze těch, kteří překonali průměrné skóre celé tabulky žebříčku (Použití In-line pohledu v klauzuli FROM).

SELECT myview.username, myview.score
FROM (
    SELECT u.username, l.score, (SELECT AVG(score) FROM nt_lead) AS prumer
    FROM nt_lead l
    JOIN nt_users u ON l.nt_users_user_id = u.user_id
) myview
WHERE myview.score > myview.prumer
order by score desc;
