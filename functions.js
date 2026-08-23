/* =====================================================================
   CHAPTER 2 — SQL Functions in PostgreSQL
   Merged from the "SQL Functions in PostgreSQL" reference handbook.
   Appends new units (10–16) to the deck defined in data.js.
   ===================================================================== */

/* employees demo table (used by every problem in this chapter) */
const _empCols=()=>[
  col("emp_id","integer",["PK","SER"]),
  col("name","varchar(100)"),
  col("email","varchar(100)"),
  col("salary","numeric(14,4)"),
  col("join_date","timestamp"),
  col("phone","varchar(15)"),
  col("city","varchar(50)")
];
const _empTbl=()=>[tbl("employees",_empCols())];

/* the raw sample data as a psql result grid (reused in a few outputs) */
const EMP_GRID=
` emp_id |     name      |       email        |   salary   |      join_date      |   phone    |   city
--------+---------------+--------------------+------------+---------------------+------------+-----------
      1 | john DOE      | john@gmail.com     | 45678.6789 | 2026-05-29 14:43:22 | NULL       | Bengaluru
      2 | asha rao      | asha.rao@yahoo.com | 38210.5000 | 2025-11-02 09:12:00 | 9912345670 | Hyderabad
      3 |   Ravi Kumar  | ravi@outlook.com   | 52300.1250 | 2024-07-15 18:05:44 | 9876543210 | Chennai
      4 | JANE smith    | jane@gmail.com     | 61999.9999 | 2026-01-09 11:30:10 | NULL       | Mumbai
      5 | JAKE Miller   | jake@company.co.in | 29500.0000 | 2025-03-21 08:00:00 | 9001122334 | Pune
(5 rows)`;

const FUNCTIONS_DECK=[
/* ---------------- Unit 10 — Setup ---------------- */
{
  unit:"Unit 10 — Setup (SQL Functions)",num:"10.1",title:"Create the demo table",
  question:"Create the messy <b>employees</b> export and load 5 sample rows — the data every function in this chapter cleans.",
  given:"no employees table yet.",
  code:
`CREATE TABLE employees (
    emp_id     SERIAL PRIMARY KEY,   -- auto-incrementing id
    name       VARCHAR(100),         -- messy casing + stray spaces
    email      VARCHAR(100),         -- needs domain extraction
    salary     NUMERIC(14, 4),       -- too many decimal places
    join_date  TIMESTAMP,            -- machine-readable timestamp
    phone      VARCHAR(15),          -- sometimes NULL (missing data)
    city       VARCHAR(50)
);

INSERT INTO employees (name, email, salary, join_date, phone, city) VALUES
    ('john DOE',      'john@gmail.com',     45678.6789, '2026-05-29 14:43:22', NULL,         'Bengaluru'),
    ('asha rao',      'asha.rao@yahoo.com', 38210.5000, '2025-11-02 09:12:00', '9912345670', 'Hyderabad'),
    ('  Ravi Kumar ', 'ravi@outlook.com',   52300.1250, '2024-07-15 18:05:44', '9876543210', 'Chennai'),
    ('JANE smith',    'jane@gmail.com',     61999.9999, '2026-01-09 11:30:10', NULL,         'Mumbai'),
    ('JAKE Miller',   'jake@company.co.in', 29500.0000, '2025-03-21 08:00:00', '9001122334', 'Pune');

SELECT * FROM employees;`,
  output:EMP_GRID,
  hints:[
    "Deliberately messy: mixed casing, stray spaces, 4-decimal salaries, machine timestamps and NULL phones.",
    "Run this once, then every query in this chapter works standalone.",
    "salary is NUMERIC(14,4); join_date is a TIMESTAMP; phone can be NULL."
  ]
},

/* ---------------- Unit 11 — Numeric ---------------- */
{
  unit:"Unit 11 — Numeric Functions",num:"11.1",title:"ROUND(value, precision)",
  question:"Round a number mathematically to N decimal places. Use for money display, percentages, report-ready numbers.",
  given:"salary has 4 decimals: 45678.6789",
  code:
`SELECT ROUND(45678.6789, 2);        -- 2 decimals
SELECT ROUND(45678.6789);           -- no precision = 0 decimals
SELECT ROUND(45.5), ROUND(45.4);    -- nearest value wins

SELECT name, salary AS raw_salary, ROUND(salary, 2) AS clean_salary
FROM employees;`,
  output:
`ROUND(45678.6789, 2)      → 45678.68
ROUND(45678.6789)         → 45679
ROUND(45.5) | ROUND(45.4) → 46 | 45

    name     | raw_salary | clean_salary
-------------+------------+--------------
 john DOE    | 45678.6789 |     45678.68
 asha rao    | 38210.5000 |     38210.50
 Ravi Kumar  | 52300.1250 |     52300.13
 JANE smith  | 61999.9999 |     62000.00
 JAKE Miller | 29500.0000 |     29500.00`,
  hints:[
    "The 2nd argument controls how many decimals survive.",
    "Negative precision rounds to the LEFT of the point: ROUND(45678.6789, -3) → 46000.",
    "ROUND is the fair, nearest-value default for maths and reporting."
  ]
},
{
  unit:"Unit 11 — Numeric Functions",num:"11.2",title:"TRUNC(value, precision)",
  question:"Cut the extra digits — never round up. Use in banking/finance, where showing more than the true value is wrong.",
  given:"value: 45.678",
  code:
`SELECT TRUNC(45.678, 2);        -- the 8 is dropped, not rounded
SELECT TRUNC(45.678);           -- all decimals removed
SELECT TRUNC(-45.678, 2);       -- truncates toward zero`,
  output:
`TRUNC(45.678, 2)   → 45.67
TRUNC(45.678)      → 45
TRUNC(-45.678, 2)  → -45.67   ← toward zero, so UP for negatives`,
  hints:[
    "TRUNC cuts; ROUND rounds. On 45.678: TRUNC → 45.67, ROUND → 45.68.",
    "Banks prefer TRUNC so a balance is never shown as more than it truly is.",
    "FLOOR also drops decimals, but only down to a whole number."
  ]
},
{
  unit:"Unit 11 — Numeric Functions",num:"11.3",title:"ROUND vs TRUNC",
  question:"The classic comparison — nearest value vs cutting down.",
  given:"value: 45.678",
  code:
`SELECT 45.678           AS actual_value,
       ROUND(45.678, 2) AS rounded,
       TRUNC(45.678, 2) AS truncated;`,
  output:
` actual_value | rounded | truncated
--------------+---------+-----------
       45.678 |   45.68 |     45.67`,
  hints:[
    "ROUND goes up to the nearest; TRUNC cuts down.",
    "TRUNC avoids over-crediting the customer — the finance default.",
    "For a fixed scale in the schema, cast instead: value::NUMERIC(10,2)."
  ]
},
{
  unit:"Unit 11 — Numeric Functions",num:"11.4",title:"FLOOR / CEIL / CEILING",
  question:"Fixed-direction rounding to whole numbers. FLOOR always down, CEIL always up.",
  given:"value: 45.678",
  code:
`SELECT FLOOR(45.678);                   -- always down
SELECT CEIL(45.678);                    -- always up
SELECT CEILING(45.678);                 -- identical to CEIL
SELECT FLOOR(-45.678), CEIL(-45.678);   -- direction, not size`,
  output:
`FLOOR(45.678)              → 45
CEIL(45.678)               → 46
CEILING(45.678)            → 46
FLOOR(-45.678) | CEIL(...) → -46 | -45`,
  hints:[
    "CEILING is just a longer spelling of CEIL.",
    "For negatives, FLOOR goes more negative, CEIL goes toward zero.",
    "Whole numbers only — no precision argument."
  ]
},
{
  unit:"Unit 11 — Numeric Functions",num:"11.5",title:"Integer division, DIV & MOD",
  question:"Dividing two INTEGERS truncates — a silent source of wrong maths.",
  given:"7 divided by 2",
  code:
`SELECT 7 / 2;        -- integer division truncates!
SELECT 7 / 2.0;      -- one decimal operand fixes it
SELECT DIV(7, 2);    -- explicit integer quotient
SELECT MOD(7, 2);    -- remainder`,
  output:
`7 / 2      → 3     ← integer division truncates!
7 / 2.0    → 3.5   ← one decimal operand fixes it
DIV(7, 2)  → 3
MOD(7, 2)  → 1`,
  hints:[
    "If both operands are integers, PostgreSQL throws away the fraction.",
    "Make one operand NUMERIC (e.g. 2.0) to get a real quotient.",
    "MOD gives the remainder; DIV gives the explicit integer quotient."
  ]
},
{
  unit:"Unit 11 — Numeric Functions",num:"11.6",title:"POWER(x, y)",
  question:"Raise x to the power of y — exponents inside SQL. Use for compound growth, scientific maths, areas.",
  given:"—",
  code:
`SELECT POWER(5, 2);     -- 5 squared
SELECT POWER(2, 10);
SELECT POWER(9, 0.5);   -- square root via a 0.5 power`,
  output:
`POWER(5, 2)   → 25
POWER(2, 10)  → 1024
POWER(9, 0.5) → 3     ← square root`,
  hints:[
    "A 0.5 power is a square root; 1/3 power is a cube root.",
    "SQRT(x) is the dedicated square-root function.",
    "Useful for compound-interest and dimension calculations."
  ]
},
{
  unit:"Unit 11 — Numeric Functions",num:"11.7",title:"ABS(x)",
  question:"Absolute value — the distance from zero, sign removed. Use for profit/loss magnitude, variance, distance.",
  given:"—",
  code:
`SELECT ABS(-250);
SELECT ABS(250);
SELECT ABS(-45.75);`,
  output:
`ABS(-250)   → 250
ABS(250)    → 250
ABS(-45.75) → 45.75`,
  hints:[
    "Returns the size of a value regardless of sign.",
    "Ideal for distances, variances, and how big a profit or loss is."
  ]
},

/* ---------------- Unit 12 — Date & Time ---------------- */
{
  unit:"Unit 12 — Date & Time Functions",num:"12.1",title:"NOW / CURRENT_DATE / CURRENT_TIME",
  question:"The current date and time. Use for logging, auditing, stamping transactions as they happen.",
  given:"—",
  code:
`SELECT NOW();            -- timestamp with time zone
SELECT CURRENT_DATE;     -- date only
SELECT CURRENT_TIME;     -- time only`,
  output:
`NOW()          → 2026-05-29 14:45:10+05:30
CURRENT_DATE   → 2026-05-29
CURRENT_TIME   → 14:45:10+05:30`,
  hints:[
    "NOW() returns a full timestamp WITH time zone.",
    "CURRENT_DATE / CURRENT_TIME give just the date or just the time."
  ]
},
{
  unit:"Unit 12 — Date & Time Functions",num:"12.2",title:"EXTRACT(field FROM source)",
  question:"Pull one component out of a date/timestamp — returns a number.",
  given:"join_date timestamps",
  code:
`SELECT EXTRACT(YEAR    FROM NOW());   -- 2026
SELECT EXTRACT(MONTH   FROM NOW());   -- 5
SELECT EXTRACT(QUARTER FROM NOW());   -- 2
SELECT EXTRACT(DOW     FROM NOW());   -- day of week, 0 = Sunday

SELECT name,
       EXTRACT(YEAR  FROM join_date) AS join_year,
       EXTRACT(MONTH FROM join_date) AS join_month
FROM employees;`,
  output:
`EXTRACT(YEAR  FROM NOW()) → 2026
EXTRACT(MONTH FROM NOW()) → 5

    name     | join_year | join_month
-------------+-----------+------------
 john DOE    |      2026 |          5
 asha rao    |      2025 |         11
 Ravi Kumar  |      2024 |          7
 JANE smith  |      2026 |          1
 JAKE Miller |      2025 |          3`,
  hints:[
    "Fields: YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, DOW, QUARTER, and more.",
    "EXTRACT returns a single number, not a date."
  ]
},
{
  unit:"Unit 12 — Date & Time Functions",num:"12.3",title:"INTERVAL — date arithmetic",
  question:"Add or subtract chunks of time. Use for trial/subscription expiry, delivery estimates, reminders.",
  given:"join_date timestamps",
  code:
`SELECT NOW() + INTERVAL '7 days';
SELECT NOW() - INTERVAL '1 month';
SELECT NOW() + INTERVAL '2 years 3 months';

-- A 30-day trial from the join date:
SELECT name, join_date, join_date + INTERVAL '30 days' AS trial_expiry
FROM employees;

-- Joined in the last 12 months:
SELECT name, join_date
FROM employees
WHERE join_date >= NOW() - INTERVAL '12 months';`,
  output:
`NOW() + INTERVAL '7 days'   → one week from now
NOW() - INTERVAL '1 month'  → one month ago

    name     |      join_date      |    trial_expiry
-------------+---------------------+---------------------
 john DOE    | 2026-05-29 14:43:22 | 2026-06-28 14:43:22
 asha rao    | 2025-11-02 09:12:00 | 2025-12-02 09:12:00`,
  hints:[
    "Combine units freely: INTERVAL '2 years 3 months'.",
    "Add/subtract an INTERVAL to any date or timestamp.",
    "Great for WHERE filters like 'the last 12 months'."
  ]
},
{
  unit:"Unit 12 — Date & Time Functions",num:"12.4",title:"DATE_TRUNC(unit, source)",
  question:"Snap a timestamp down to the start of a unit, but keep a full timestamp. This powers monthly reporting.",
  given:"join_date timestamps",
  code:
`SELECT DATE_TRUNC('month', NOW());   -- 2026-05-01 00:00:00
SELECT DATE_TRUNC('year',  NOW());   -- 2026-01-01 00:00:00

-- Group every row into its month bucket:
SELECT DATE_TRUNC('month', join_date) AS join_month, COUNT(*) AS joiners
FROM employees
GROUP BY DATE_TRUNC('month', join_date)
ORDER BY join_month;`,
  output:
`DATE_TRUNC('month', NOW()) → 2026-05-01 00:00:00

     join_month      | joiners
---------------------+---------
 2024-07-01 00:00:00 |       1
 2025-03-01 00:00:00 |       1
 2025-11-01 00:00:00 |       1
 2026-01-01 00:00:00 |       1
 2026-05-01 00:00:00 |       1`,
  hints:[
    "Units: 'year', 'quarter', 'month', 'day', 'hour', and more.",
    "It snaps down but returns a full timestamp — perfect for GROUP BY month."
  ]
},
{
  unit:"Unit 12 — Date & Time Functions",num:"12.5",title:"EXTRACT vs DATE_TRUNC",
  question:"EXTRACT returns one number; DATE_TRUNC returns a full timestamp rounded down.",
  given:"—",
  code:
`SELECT EXTRACT(MONTH FROM NOW())  AS extracted,   -- 5
       DATE_TRUNC('month', NOW())  AS truncated;   -- 2026-05-01 00:00:00`,
  output:
` extracted |      truncated
-----------+---------------------
         5 | 2026-05-01 00:00:00`,
  hints:[
    "EXTRACT → a number (5). DATE_TRUNC → a timestamp (2026-05-01 00:00:00).",
    "Use EXTRACT to compare/label a part; DATE_TRUNC to bucket rows."
  ]
},
{
  unit:"Unit 12 — Date & Time Functions",num:"12.6",title:"TO_CHAR(value, format)",
  question:"Format a date (or number) as readable text — machine to human.",
  given:"join_date timestamps",
  code:
`SELECT TO_CHAR(NOW(), 'DD Mon YYYY');       -- 29 May 2026
SELECT TO_CHAR(NOW(), 'DD/MM/YYYY');        -- 29/05/2026
SELECT TO_CHAR(45678.6789, '999G999D99');   -- 45,678.68  (numbers too)

SELECT name,
       TO_CHAR(join_date, 'Mon YYYY')    AS joined_month,
       TO_CHAR(join_date, 'DD Mon YYYY') AS joined_on
FROM employees;`,
  output:
`TO_CHAR(NOW(), 'DD Mon YYYY')     → 29 May 2026
TO_CHAR(45678.6789,'999G999D99')  → 45,678.68

    name     | joined_month |  joined_on
-------------+--------------+-------------
 john DOE    | May 2026     | 29 May 2026
 asha rao    | Nov 2025     | 02 Nov 2025
 Ravi Kumar  | Jul 2024     | 15 Jul 2024`,
  hints:[
    "Patterns: DD day, Mon short month, Month full month, YYYY year, HH24:MI time.",
    "TO_CHAR also formats numbers (G = group sep, D = decimal point).",
    "The result is TEXT — use it as the last step before display only."
  ]
},

/* ---------------- Unit 13 — String ---------------- */
{
  unit:"Unit 13 — String Functions",num:"13.1",title:"UPPER / LOWER / INITCAP",
  question:"Case normalisation — one consistent case everywhere. Use for login/search standardisation and reliable grouping.",
  given:"name: 'john DOE'",
  code:
`SELECT UPPER('john doe');    -- JOHN DOE
SELECT LOWER('ADMIN');       -- admin
SELECT INITCAP('john doe');  -- John Doe  (title case)

SELECT name, UPPER(name) AS upper_name, INITCAP(name) AS title_name
FROM employees;

-- Case-insensitive search done properly:
SELECT * FROM employees WHERE LOWER(name) = LOWER('JOHN doe');`,
  output:
`UPPER('john doe')   → JOHN DOE
LOWER('ADMIN')      → admin
INITCAP('john doe') → John Doe

    name     | upper_name  | title_name
-------------+-------------+------------
 john DOE    | JOHN DOE    | John Doe
 asha rao    | ASHA RAO    | Asha Rao
 JAKE Miller | JAKE MILLER | Jake Miller`,
  hints:[
    "Normalise both sides for case-insensitive matching: LOWER(a) = LOWER(b).",
    "INITCAP gives Title Case; it also handles O'Brien correctly."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.2",title:"LENGTH(text)",
  question:"Count characters in a string. Use for password/input validation, mobile-number checks, field limits.",
  given:"phone values, some NULL",
  code:
`SELECT LENGTH('PostgreSQL');        -- 10
SELECT LENGTH('   PostgreSQL   ');  -- 16  (spaces count!)

-- Find phone numbers that are not exactly 10 digits (bad data):
SELECT name, phone, LENGTH(phone) AS digits
FROM employees
WHERE LENGTH(phone) <> 10;`,
  output:
`LENGTH('PostgreSQL')       → 10
LENGTH('   PostgreSQL   ') → 16   ← spaces count!

(no rows — every present phone is exactly 10 digits;
 NULL phones are skipped because LENGTH(NULL) is NULL)`,
  hints:[
    "Spaces and punctuation count as characters.",
    "LENGTH(NULL) is NULL, so NULL rows drop out of the WHERE test.",
    "CHAR_LENGTH is a SQL-standard alias; OCTET_LENGTH counts bytes."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.3",title:"CONCAT and the || operator",
  question:"Join pieces of text. The catch: CONCAT ignores NULLs; || returns NULL if any part is NULL.",
  given:"—",
  code:
`SELECT CONCAT('John', ' ', 'Doe');   -- John Doe
SELECT 'John' || ' ' || 'Doe';       -- John Doe

SELECT CONCAT('John', NULL, 'Doe');  -- JohnDoe  (NULL skipped)
SELECT 'John' || NULL || 'Doe';      -- NULL     (|| poisons it)

SELECT CONCAT(INITCAP(name), ' — ', city) AS display_label FROM employees;`,
  output:
`CONCAT('John',' ','Doe') → John Doe
'John' || ' ' || 'Doe'   → John Doe
CONCAT('John',NULL,'Doe') → JohnDoe   ← NULL skipped
'John' || NULL || 'Doe'   → NULL      ← || poisons the whole result

     display_label
-----------------------
 John Doe — Bengaluru
 Asha Rao — Hyderabad`,
  hints:[
    "CONCAT is NULL-safe; || is not.",
    "Use CONCAT_WS(sep, ...) to join with a separator and skip NULLs cleanly."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.4",title:"SUBSTRING(string FROM start FOR length)",
  question:"Slice out a portion of text. Positions start at 1, not 0. Use for IDs, product codes, parsing.",
  given:"code: 'EMP2026'",
  code:
`SELECT SUBSTRING('EMP2026' FROM 1 FOR 3);   -- EMP
SELECT SUBSTRING('EMP2026' FROM 4 FOR 4);   -- 2026
SELECT SUBSTRING('EMP2026' FROM 4);         -- 2026  (to the end)
SELECT SUBSTR('PostgreSQL', 1, 4);          -- Post  (short form)`,
  output:
`SUBSTRING('EMP2026' FROM 1 FOR 3) → EMP
SUBSTRING('EMP2026' FROM 4 FOR 4) → 2026
SUBSTRING('EMP2026' FROM 4)       → 2026
SUBSTR('PostgreSQL', 1, 4)        → Post`,
  hints:[
    "Positions are 1-based.",
    "Omit FOR length to slice to the end.",
    "LEFT(s,n) and RIGHT(s,n) are handy shortcuts."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.5",title:"TRIM / LTRIM / RTRIM / BTRIM",
  question:"Remove leading and trailing spaces — messy form input, cleaned.",
  given:"name: '  Ravi Kumar '",
  code:
`SELECT TRIM('   PostgreSQL   ');          -- 'PostgreSQL'
SELECT LTRIM('   PostgreSQL');            -- left only
SELECT RTRIM('PostgreSQL   ');            -- right only
SELECT TRIM(BOTH 'x' FROM 'xxxDATAxxx');  -- 'DATA'  (any character)

SELECT name, LENGTH(name) AS raw_len, LENGTH(TRIM(name)) AS trimmed_len
FROM employees;`,
  output:
`TRIM('   PostgreSQL   ')         → 'PostgreSQL'
TRIM(BOTH 'x' FROM 'xxxDATAxxx') → 'DATA'

    name     | raw_len | trimmed_len
-------------+---------+-------------
   Ravi Kumar|      13 |          10
 john DOE    |       8 |           8`,
  hints:[
    "TRIM strips both sides; LTRIM/RTRIM one side.",
    "TRIM(BOTH 'x' FROM ...) removes any character, not just spaces.",
    "LPAD/RPAD do the opposite — pad a string to a fixed width."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.6",title:"REPLACE(source, old, new)",
  question:"Find and replace a substring everywhere it occurs. Use for rebranding, bulk cleanup, stripping characters.",
  given:"phone numbers",
  code:
`SELECT REPLACE('PostgreSQL', 'SQL', 'Database'); -- PostgreDatabase
SELECT REPLACE('99-88-77', '-', '');             -- 998877  (remove chars)

-- Mask the middle of each phone number:
SELECT name, REPLACE(phone, SUBSTRING(phone FROM 4 FOR 3), 'XXX') AS masked_phone
FROM employees
WHERE phone IS NOT NULL;`,
  output:
`REPLACE('PostgreSQL','SQL','Database') → PostgreDatabase
REPLACE('99-88-77','-','')             → 998877

    name     | masked_phone
-------------+--------------
 asha rao    | 991XXX5670
 Ravi Kumar  | 987XXX3210
 JAKE Miller | 900XXX2334`,
  hints:[
    "REPLACE changes EVERY occurrence.",
    "TRANSLATE maps character-by-character; REPLACE works on whole substrings."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.7",title:"LIKE vs ILIKE — pattern matching",
  question:"LIKE is case-sensitive; ILIKE is case-insensitive. % = any characters, _ = exactly one character.",
  given:"names: John, asha, Ravi, JANE, JAKE",
  code:
`-- Case-sensitive: matches 'John','Jane' — NOT 'john'
SELECT * FROM employees WHERE name LIKE  'J%';
-- Case-insensitive: matches 'John','john','JAKE'
SELECT * FROM employees WHERE name ILIKE 'j%';

SELECT 'Jan'  LIKE 'J_n' AS jan_matches,   -- true
       'Joan' LIKE 'J_n' AS joan_matches;  -- false`,
  output:
`name LIKE  'J%'  → JANE smith, JAKE Miller
name ILIKE 'j%'  → john DOE, JANE smith, JAKE Miller

 jan_matches | joan_matches
-------------+--------------
 t           | f            ← _ matches exactly ONE character`,
  hints:[
    "% matches any number of characters; _ matches exactly one.",
    "ILIKE is PostgreSQL-specific and case-insensitive.",
    "Use NOT LIKE / NOT ILIKE to negate."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.8",title:"SPLIT_PART(string, delimiter, position)",
  question:"Break a string on a delimiter and pick one piece (1-based). Use for email parsing, CSV, composite codes.",
  given:"email: 'john@gmail.com'",
  code:
`SELECT SPLIT_PART('john@gmail.com', '@', 1);  -- john      (username)
SELECT SPLIT_PART('john@gmail.com', '@', 2);  -- gmail.com (domain)

-- Domain of every email, counted:
SELECT SPLIT_PART(email, '@', 2) AS domain, COUNT(*) AS users
FROM employees
GROUP BY SPLIT_PART(email, '@', 2)
ORDER BY users DESC;`,
  output:
`SPLIT_PART('john@gmail.com','@',1) → john
SPLIT_PART('john@gmail.com','@',2) → gmail.com

    domain     | users
---------------+-------
 gmail.com     |     2
 yahoo.com     |     1
 outlook.com   |     1
 company.co.in |     1`,
  hints:[
    "Position is 1-based; a negative position counts from the end.",
    "Perfect for pulling the username or domain out of an email."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.9",title:"LEFT / RIGHT / LPAD / RPAD",
  question:"Take a slice from either end, or pad a string to a fixed width (invoice numbers, aligned codes).",
  given:"—",
  code:
`SELECT LEFT('PostgreSQL', 4);    -- Post
SELECT RIGHT('PostgreSQL', 3);   -- SQL
SELECT LEFT('PostgreSQL', -3);   -- Postgre  (negative = drop last 3)

SELECT LPAD('7', 3, '0');        -- 007   pad left
SELECT RPAD('7', 3, '0');        -- 700   pad right
SELECT LPAD('42', 8, '.');       -- ......42`,
  output:
`LEFT('PostgreSQL', 4)   → Post
RIGHT('PostgreSQL', 3)  → SQL
LEFT('PostgreSQL', -3)  → Postgre   ← negative drops from the end
LPAD('7', 3, '0')       → 007
RPAD('7', 3, '0')       → 700
LPAD('42', 8, '.')      → ......42`,
  hints:[
    "Negative length on LEFT/RIGHT drops characters from the far end.",
    "LPAD also TRUNCATES if the target width is smaller than the string.",
    "LPAD(id::TEXT, 5, '0') is the classic zero-padded id."
  ]
},
{
  unit:"Unit 13 — String Functions",num:"13.10",title:"TRANSLATE / REVERSE / REPEAT",
  question:"Character-by-character mapping, reversing, and repeating — the rest of the everyday text toolbox.",
  given:"—",
  code:
`SELECT TRANSLATE('12-34-56', '-', '/');   -- 12/34/56  (char map)
SELECT TRANSLATE('(999) 123', '() ', '');  -- 999123    (delete chars)
SELECT REVERSE('PostgreSQL');              -- LQSergtsoP
SELECT REPEAT('-', 20);                    -- --------------------`,
  output:
`TRANSLATE('12-34-56','-','/')   → 12/34/56
TRANSLATE('(999) 123','() ','') → 999123
REVERSE('PostgreSQL')           → LQSergtsoP
REPEAT('-', 20)                 → --------------------`,
  hints:[
    "TRANSLATE maps each source char to the matching target char.",
    "A shorter 'to' set than 'from' deletes the extra characters.",
    "REPEAT is handy for separators and test data."
  ]
},

/* ---------------- Unit 14 — NULL ---------------- */
{
  unit:"Unit 14 — NULL Handling",num:"14.1",title:"Understanding NULL",
  question:"NULL is not 0, not '' — it means missing/unknown. Because it is unknown, normal operators fail on it.",
  given:"—",
  code:
`SELECT NULL = NULL   AS equals_test;  -- NULL (not true!)
SELECT NULL = 0      AS zero_test;    -- NULL
SELECT NULL = ''     AS empty_test;   -- NULL
SELECT 100 + NULL    AS maths_test;   -- NULL (poisons arithmetic)
SELECT 'Hi' || NULL  AS concat_test;  -- NULL`,
  output:
`NULL = NULL   → NULL   ← unknown = unknown is still unknown
NULL = 0      → NULL
NULL = ''     → NULL
100 + NULL    → NULL   ← NULL poisons arithmetic
'Hi' || NULL  → NULL`,
  hints:[
    "Comparing anything to NULL with = gives NULL, never true/false.",
    "Any arithmetic or || touching NULL becomes NULL.",
    "Test for NULL only with IS NULL / IS NOT NULL."
  ]
},
{
  unit:"Unit 14 — NULL Handling",num:"14.2",title:"COALESCE(a, b, c, ...)",
  question:"Return the first non-NULL argument. Gracefully fills gaps.",
  given:"phone is NULL for John and Jane",
  code:
`SELECT COALESCE(NULL, 'Not Available');         -- Not Available
SELECT COALESCE(NULL, NULL, 'third', 'fourth'); -- third
SELECT COALESCE(NULL, 0) + 100;                 -- 100 (protects maths)

SELECT name, COALESCE(phone, 'Not Available') AS contact FROM employees;`,
  output:
`COALESCE(NULL,'Not Available')      → Not Available
COALESCE(NULL,NULL,'third','fourth') → third
COALESCE(NULL, 0) + 100             → 100

    name     |    contact
-------------+---------------
 john DOE    | Not Available
 asha rao    | 9912345670
 JANE smith  | Not Available`,
  hints:[
    "The first non-NULL argument wins; it short-circuits there.",
    "All arguments must be of compatible types.",
    "Wrap risky expressions to keep NULL out of arithmetic."
  ]
},
{
  unit:"Unit 14 — NULL Handling",num:"14.3",title:"IS NULL / IS NOT NULL",
  question:"The only correct way to test for NULL. Never use = or <>.",
  given:"phone NULL for 2 of 5 rows",
  code:
`-- WRONG — always returns zero rows, silently:
-- SELECT * FROM employees WHERE phone = NULL;

SELECT * FROM employees WHERE phone IS NULL;
SELECT COUNT(*)             AS total_rows,
       COUNT(phone)         AS phones_present,   -- COUNT skips NULL
       COUNT(*)-COUNT(phone) AS phones_missing
FROM employees;`,
  output:
` total_rows | phones_present | phones_missing
------------+----------------+----------------
          5 |              3 |              2`,
  hints:[
    "phone = NULL never matches anything — use IS NULL.",
    "COUNT(column) skips NULLs; COUNT(*) counts every row.",
    "COUNT(*) - COUNT(col) is a quick completeness check."
  ]
},
{
  unit:"Unit 14 — NULL Handling",num:"14.4",title:"NULLIF(a, b)",
  question:"Return NULL if a = b, otherwise a. Classic use: guard against divide-by-zero.",
  given:"—",
  code:
`SELECT NULLIF(10, 10);         -- NULL (equal)
SELECT NULLIF(10, 5);          -- 10   (not equal → a)

-- SELECT 100 / 0;             -- ERROR: division by zero
SELECT 100 / NULLIF(0, 0);     -- NULL — safe, no error

SELECT NULLIF('N/A', 'N/A');   -- NULL  (clean junk placeholders)`,
  output:
`NULLIF(10, 10)      → NULL
NULLIF(10, 5)       → 10
100 / NULLIF(0, 0)  → NULL   ← no division-by-zero error
NULLIF('N/A','N/A') → NULL`,
  hints:[
    "NULLIF turns an equal pair into NULL.",
    "NULLIF(divisor, 0) converts a zero divisor into a safe NULL.",
    "NULLIF compares with '=', so it is CASE-SENSITIVE on text."
  ]
},
{
  unit:"Unit 14 — NULL Handling",num:"14.5",title:"COALESCE + NULLIF — safe division",
  question:"Mirror images: NULLIF makes the NULL, COALESCE catches it. The most-used NULL idiom in production.",
  given:"order_count could be 0",
  code:
`-- Read inside-out: NULLIF turns 0 into NULL so the division
-- returns NULL instead of crashing; COALESCE turns that into 0.
SELECT COALESCE(total_sales / NULLIF(order_count, 0), 0) AS avg_order_value
FROM (SELECT 5000 AS total_sales, 0 AS order_count) AS demo;`,
  output:
` avg_order_value
-----------------
               0   ← no error: NULLIF → NULL, COALESCE → 0`,
  hints:[
    "COALESCE removes a NULL; NULLIF creates one — opposite directions.",
    "Pattern: COALESCE(a / NULLIF(b, 0), 0).",
    "This avoids the hard 'division by zero' error entirely."
  ]
},
{
  unit:"Unit 14 — NULL Handling",num:"14.6",title:"IS DISTINCT FROM",
  question:"NULL-safe comparison: treats two NULLs as equal instead of unknown.",
  given:"phone NULL for some rows",
  code:
`SELECT NULL IS DISTINCT FROM NULL;  -- false (two NULLs are NOT different)
SELECT NULL IS DISTINCT FROM 5;     -- true
SELECT 5    IS DISTINCT FROM 5;     -- false
SELECT NULL <> NULL AS plain;       -- NULL (unusable in WHERE)

-- Everyone whose phone is not 9912345670 — INCLUDING the NULL rows:
SELECT name, phone FROM employees
WHERE phone IS DISTINCT FROM '9912345670';`,
  output:
`NULL IS DISTINCT FROM NULL → false
NULL IS DISTINCT FROM 5    → true
NULL <> NULL               → NULL   ← the plain operator is unusable

    name     |   phone
-------------+------------
 john DOE    | NULL
 Ravi Kumar  | 9876543210
 JANE smith  | NULL
 JAKE Miller | 9001122334`,
  hints:[
    "IS DISTINCT FROM treats NULL as a normal, comparable value.",
    "Plain <> drops NULL rows; IS DISTINCT FROM keeps them.",
    "Use it when NULL should count as 'different from a value'."
  ]
},

/* ---------------- Unit 15 — Nesting & Report ---------------- */
{
  unit:"Unit 15 — Nesting & the Final Report",num:"15.1",title:"Function nesting",
  question:"Functions wrap inside each other; the innermost runs first.",
  given:"employees table",
  code:
`-- Clean spaces, then upper-case, in one pass:
SELECT UPPER(TRIM(name)) FROM employees;

-- Three layers: trim → take the domain → upper-case it
SELECT UPPER(SPLIT_PART(TRIM(email), '@', 2)) AS domain FROM employees;

-- Date + string: bucket by month, then format for humans
SELECT TO_CHAR(DATE_TRUNC('month', join_date), 'Mon YYYY') AS month_label
FROM employees;`,
  output:
`UPPER(TRIM('  Ravi Kumar ')) → RAVI KUMAR

     domain
-------------
 GMAIL.COM
 YAHOO.COM
 OUTLOOK.COM

 month_label
-------------
 May 2026
 Nov 2025`,
  hints:[
    "Evaluation is inside-out: the innermost call runs first.",
    "Nest across families — numeric inside NULL inside string, etc.",
    "Keep nesting readable; break very deep chains into steps."
  ]
},
{
  unit:"Unit 15 — Nesting & the Final Report",num:"15.2",title:"The final report",
  question:"Four families in one query: UPPER cleans the name, ROUND tidies salary, TO_CHAR makes a readable month, COALESCE fills the phone.",
  given:"raw employees export",
  code:
`SELECT
    UPPER(TRIM(name))              AS customer_name,  -- JOHN DOE
    ROUND(salary, 2)              AS salary,          -- 45678.68
    TO_CHAR(join_date, 'Mon YYYY') AS joined,         -- May 2026
    COALESCE(phone, 'N/A')        AS phone            -- N/A
FROM employees
ORDER BY join_date DESC;`,
  output:
` customer_name |  salary  | joined   |   phone
---------------+----------+----------+------------
 JOHN DOE      | 45678.68 | May 2026 | N/A
 JANE SMITH    | 62000.00 | Jan 2026 | N/A
 ASHA RAO      | 38210.50 | Nov 2025 | 9912345670
 JAKE MILLER   | 29500.00 | Mar 2025 | 9001122334
 RAVI KUMAR    | 52300.13 | Jul 2024 | 9876543210`,
  hints:[
    "Each column uses a different function family on the same row.",
    "COALESCE keeps missing phones from showing as blank cells.",
    "ORDER BY the raw join_date, not the formatted text."
  ]
},

/* ---------------- Unit 16 — Common Mistakes ---------------- */
{
  unit:"Unit 16 — Common Mistakes",num:"16.1",title:"Comparing with = NULL",
  question:"Using = NULL always returns nothing, silently.",
  given:"phone NULL for some rows",
  code:
`-- WRONG:
-- SELECT * FROM employees WHERE phone = NULL;

-- RIGHT:
SELECT * FROM employees WHERE phone IS NULL;`,
  output:
`WHERE phone = NULL     → 0 rows (always, silently)
WHERE phone IS NULL    → the rows with a missing phone`,
  hints:[
    "= NULL is never true — even for NULL values.",
    "Always test NULL with IS NULL / IS NOT NULL."
  ]
},
{
  unit:"Unit 16 — Common Mistakes",num:"16.2",title:"LIKE for a case-insensitive search",
  question:"LIKE is case-sensitive, so it misses differently-cased rows.",
  given:"names include 'john' and 'JAKE'",
  code:
`-- WRONG (misses 'john'):
SELECT * FROM employees WHERE name LIKE 'j%';
-- RIGHT:
SELECT * FROM employees WHERE name ILIKE 'j%';`,
  output:
`name LIKE  'j%' → (no rows — none start with lowercase 'j' after casing)
name ILIKE 'j%' → john DOE, JANE smith, JAKE Miller`,
  hints:[
    "LIKE respects case; ILIKE ignores it.",
    "Or normalise both sides: LOWER(name) LIKE 'j%'."
  ]
},
{
  unit:"Unit 16 — Common Mistakes",num:"16.3",title:"Confusing ROUND and TRUNC",
  question:"ROUND goes to the nearest; TRUNC just cuts. They differ on the last digit.",
  given:"value: 45.678",
  code:
`SELECT ROUND(45.678, 2) AS round_result,   -- 45.68 (nearest)
       TRUNC(45.678, 2) AS trunc_result;   -- 45.67 (cut)`,
  output:
` round_result | trunc_result
--------------+--------------
        45.68 |        45.67`,
  hints:[
    "ROUND(45.678,2)=45.68; TRUNC(45.678,2)=45.67.",
    "Pick TRUNC in finance so a value is never overstated."
  ]
},
{
  unit:"Unit 16 — Common Mistakes",num:"16.4",title:"Ignoring NULL inside calculations",
  question:"Any NULL makes the whole expression NULL. Wrap it in COALESCE.",
  given:"—",
  code:
`-- WRONG — any NULL makes the whole expression NULL:
SELECT salary + NULL AS broken_total FROM employees LIMIT 1;

-- RIGHT — wrap it in COALESCE:
SELECT ROUND(COALESCE(salary, 0) + COALESCE(NULL, 0), 2) AS safe_total
FROM employees LIMIT 1;`,
  output:
`salary + NULL                          → NULL
ROUND(COALESCE(salary,0)+COALESCE(NULL,0),2) → 45678.68`,
  hints:[
    "NULL poisons +, -, *, / and ||.",
    "COALESCE each nullable operand to a safe default first."
  ]
},
{
  unit:"Unit 16 — Common Mistakes",num:"16.5",title:"Dividing without a guard",
  question:"A zero divisor throws a hard error — guard it with NULLIF.",
  given:"—",
  code:
`-- SELECT 100 / 0;                     -- ERROR: division by zero
SELECT 100 / NULLIF(0, 0) AS safe_division;   -- NULL, no error`,
  output:
`100 / 0             → ERROR: division by zero
100 / NULLIF(0, 0)  → NULL   ← safe, no error`,
  hints:[
    "NULLIF(divisor, 0) turns 0 into NULL, so division returns NULL.",
    "Wrap with COALESCE(..., 0) to show a friendly 0 instead of NULL."
  ]
}
];

/* append the chapter to the deck */
DECK.push.apply(DECK,FUNCTIONS_DECK);

/* schema panel: every function problem runs against the employees table
   (structure never changes), except 10.1 which creates it */
FUNCTIONS_DECK.forEach(function(p){
  if(p.num==="10.1"){
    SCHEMA["10.1"]={before:[],after:_empTbl(),note:"Demo table created with 5 deliberately messy rows."};
  }else{
    SCHEMA[p.num]={before:_empTbl(),after:_empTbl(),note:"Function query — reads the employees table, structure unchanged."};
  }
});
