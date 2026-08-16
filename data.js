/* SQL Practice Workbook — PostgreSQL
   Presenter deck data. Each entry is one problem/slide. */

const DECK = [
  {
    unit: "Unit 0 — Creating a Database",
    num: "0.1",
    title: "Create and connect",
    question: "Create a new database named <b>university</b> and connect to it.",
    given:
`\\l
    Name    | Owner
------------+----------
 postgres   | postgres
 template0  | postgres
 template1  | postgres`,
    code:
`CREATE DATABASE university;
\\c university`,
    output:
`\\l
    Name    | Owner
------------+----------
 postgres   | postgres
 template0  | postgres
 template1  | postgres
 university | postgres    ← new

SELECT current_database();
 current_database
------------------
 university`,
    hints: [
      "The first statement starts with CREATE.",
      "The second is a psql shortcut beginning with a backslash. In pgAdmin, you instead open a Query Tool on the university database."
    ]
  },
  {
    unit: "Unit 1 — Creating a Table (CREATE)",
    num: "1.1",
    title: "Create the students table",
    question: "Create table <b>students</b> with <b>roll_no</b> as PRIMARY KEY, <b>name</b> (max 50, cannot be empty), <b>branch</b> (max 20), and <b>marks</b> restricted to values between 0 and 100.",
    given: "no tables exist.",
    code:
`CREATE TABLE students (
  roll_no INT PRIMARY KEY,
  name    VARCHAR(50) NOT NULL,
  branch  VARCHAR(20),
  marks   INT,
  CONSTRAINT chk_marks CHECK (marks BETWEEN 0 AND 100)
);`,
    output:
`\\d students
  Column  |         Type          | Nullable
----------+-----------------------+----------
 roll_no  | integer               | not null
 name     | character varying(50) | not null
 branch   | character varying(20) |
 marks    | integer               |
Indexes:
    "students_pkey" PRIMARY KEY (roll_no)
Check constraints:
    "chk_marks" CHECK (marks BETWEEN 0 AND 100)

-- this insert is correctly rejected:
INSERT INTO students VALUES (1, 'Amit', 'CSE', 105);
ERROR: new row violates check constraint "chk_marks"`,
    hints: [
      "CREATE TABLE students ( ... ); — the columns go inside the brackets, separated by commas.",
      "Each column line reads column_name TYPE constraint.",
      "Name the check so the error message is readable: CONSTRAINT chk_marks CHECK ( ... ).",
      "No comma after the last item inside the brackets."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.1",
    title: "Add a unique column",
    question: "Add an <b>email VARCHAR(100)</b> column that must be unique, keeping existing rows.",
    given: "students(roll_no, name, branch, marks)",
    code:
`ALTER TABLE students
ADD COLUMN email VARCHAR(100) UNIQUE;`,
    output:
`students(roll_no, name, branch, marks, email)

email is UNIQUE; NULL for all existing rows`,
    hints: [
      "Starts with ALTER TABLE students.",
      "The action is ADD COLUMN, then name and type.",
      "The uniqueness rule is one extra word at the end of the same line."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.2",
    title: "Add a plain column",
    question: "Add a <b>phone VARCHAR(15)</b> column.",
    given: "students(roll_no, name, branch, marks)",
    code:
`ALTER TABLE students
ADD COLUMN phone VARCHAR(15);`,
    output:
`students(roll_no, name, branch, marks, phone)

phone is nullable`,
    hints: [
      "Same shape as 2.1, minus the constraint.",
      "A column with no rules attached is nullable by default."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.3",
    title: "Change a column's type",
    question: "Longer branch names are now needed. Widen <b>branch</b> from VARCHAR(20) to VARCHAR(100).",
    given: "branch | character varying(20)",
    code:
`ALTER TABLE students
ALTER COLUMN branch TYPE VARCHAR(100);`,
    output: "branch | character varying(100)",
    hints: [
      "Two words after the table name: ALTER COLUMN.",
      "Then the column name, then the keyword TYPE, then the new type.",
      "Widening is always safe. Narrowing would fail if longer values already exist."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.4",
    title: "Rename a column",
    question: "Rename <b>branch</b> to <b>department</b>.",
    given: "students(roll_no, name, branch, marks)",
    code:
`ALTER TABLE students
RENAME COLUMN branch TO department;`,
    output: "students(roll_no, name, department, marks)",
    hints: [
      "The keyword is RENAME COLUMN.",
      "Join the old and new names with TO."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.5",
    title: "Make a column compulsory",
    question: "<b>branch</b> must never be empty from now on.",
    given: "branch | character varying(20) |    ← nullable",
    code:
`ALTER TABLE students
ALTER COLUMN branch SET NOT NULL;`,
    output: "branch | character varying(20) | not null",
    hints: [
      "Use ALTER COLUMN branch, then SET.",
      "This fails if any existing row already has branch as NULL — fill those rows first."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.6",
    title: "Make a column optional again",
    question: "Allow <b>name</b> to be empty again.",
    given: "name | character varying(50) | not null",
    code:
`ALTER TABLE students
ALTER COLUMN name DROP NOT NULL;`,
    output: "name | character varying(50) |    ← nullable",
    hints: [
      "The opposite of 2.5.",
      "Where 2.5 used SET, this one uses DROP."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.7",
    title: "Set a default value",
    question: "Most students are in CSE. Set the default value of <b>branch</b> to <b>'CSE'</b>.",
    given: "branch | character varying(20) |    ← no default",
    code:
`ALTER TABLE students
ALTER COLUMN branch SET DEFAULT 'CSE';`,
    output: "branch | character varying(20) | default 'CSE'",
    hints: [
      "ALTER COLUMN branch SET ...",
      "The default applies only to rows inserted afterwards. Existing NULLs are not filled in."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.8",
    title: "Delete a column",
    question: "Remove the <b>phone</b> column.",
    given: "students(roll_no, name, branch, marks, phone)",
    code:
`ALTER TABLE students
DROP COLUMN phone;`,
    output: "students(roll_no, name, branch, marks)",
    hints: [
      "The action is DROP COLUMN.",
      "This deletes the column and all data inside it. There is no undo once committed."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.9",
    title: "Several actions in one statement",
    question: "In a single statement, add <b>email VARCHAR(100)</b> and set <b>branch</b>'s default to <b>'CSE'</b>.",
    given:
`no email column;
branch has no default`,
    code:
`ALTER TABLE students
ADD COLUMN email VARCHAR(100),
ALTER COLUMN branch SET DEFAULT 'CSE';`,
    output:
`email column added;
branch default is 'CSE'`,
    hints: [
      "Write ALTER TABLE students once, on its own line.",
      "Then list the two actions, separated by a comma.",
      "Only the last action gets the semicolon."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.10",
    title: "Add a primary key",
    question: "Table <b>courses(course_id, title)</b> has no key. Make <b>course_id</b> the primary key.",
    given:
`\\d courses
  Column   |         Type
-----------+-----------------------
 course_id | integer
 title     | character varying(50)
(no primary key)`,
    code:
`ALTER TABLE courses
ADD PRIMARY KEY (course_id);`,
    output:
`Indexes:
    "courses_pkey" PRIMARY KEY (course_id)`,
    hints: [
      "ALTER TABLE courses ADD ...",
      "The column name goes in brackets at the end.",
      "This fails if course_id contains duplicates or NULLs."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.11",
    title: "Add a unique constraint",
    question: "No two students may share an email address.",
    given:
`email | character varying(100)
        ← no unique rule`,
    code:
`ALTER TABLE students
ADD CONSTRAINT uq_email UNIQUE (email);`,
    output: "constraint uq_email UNIQUE (email)",
    hints: [
      "Use ADD CONSTRAINT, then the name you are giving it.",
      "Then the rule type, then the column in brackets."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.12",
    title: "Add a check constraint",
    question: "<b>marks</b> must never exceed 100.",
    given: "no ceiling constraint on marks",
    code:
`ALTER TABLE students
ADD CONSTRAINT chk_m CHECK (marks <= 100);`,
    output: "constraint chk_m CHECK (marks <= 100)",
    hints: [
      "Same shape as 2.11 — ADD CONSTRAINT, a name, then the rule.",
      "The condition goes inside brackets after the keyword CHECK.",
      "This fails if any existing row already breaks the rule."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.13",
    title: "Add a foreign key",
    question: "Link <b>students.branch_id</b> to <b>branches.id</b>.",
    given:
`students.branch_id — unconstrained
branches(id PRIMARY KEY, bname)`,
    code:
`ALTER TABLE students
ADD CONSTRAINT fk_branch
FOREIGN KEY (branch_id) REFERENCES branches(id);`,
    output:
`constraint fk_branch — branch_id
must exist in branches(id)`,
    hints: [
      "ADD CONSTRAINT fk_branch, then the rule on the next line.",
      "The rule reads FOREIGN KEY (column) REFERENCES other_table(column).",
      "This fails if any existing branch_id has no matching row in branches."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.14",
    title: "Drop a constraint",
    question: "Remove the <b>chk_m</b> check constraint.",
    given: "constraint chk_m exists",
    code:
`ALTER TABLE students
DROP CONSTRAINT chk_m;`,
    output: "chk_m no longer exists",
    hints: [
      "In PostgreSQL, one command drops every kind of constraint: DROP CONSTRAINT.",
      "You only need the constraint's name, not its type. (MySQL is different — there you must write DROP CHECK or DROP FOREIGN KEY.)"
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.15",
    title: "Rename a constraint",
    question: "Rename the constraint <b>chk_m</b> to <b>chk_marks</b>.",
    given: "constraint chk_m",
    code:
`ALTER TABLE students
RENAME CONSTRAINT chk_m TO chk_marks;`,
    output: "constraint chk_marks",
    hints: [
      "Same pattern as renaming a column, but with the word CONSTRAINT.",
      "Old name, then TO, then new name."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.16",
    title: "Rename the table",
    question: "Rename <b>students</b> to <b>learners</b>.",
    given: "table students",
    code:
`ALTER TABLE students
RENAME TO learners;`,
    output: "table learners",
    hints: [
      "RENAME TO — no word COLUMN this time, because you are renaming the table itself."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.17",
    title: "Convert text to number",
    question: "<b>marks</b> was created as TEXT but holds numbers. Convert the column to INT.",
    given:
`marks | text
values: '88', '91', '79'`,
    code:
`ALTER TABLE students
ALTER COLUMN marks TYPE INT
USING marks::integer;`,
    output:
`marks | integer
values: 88, 91, 79`,
    hints: [
      "Start as in 2.3: ALTER COLUMN marks TYPE INT.",
      "PostgreSQL will not convert text to a number on its own — you must tell it how, using USING.",
      "The cast is written marks::integer."
    ]
  },
  {
    unit: "Unit 2 — Changing a Table (ALTER)",
    num: "2.18",
    title: "Safely add a NOT NULL column to a table with data",
    question: "Add a <b>NOT NULL email</b> column to <b>students</b>, which already has rows. Adding NOT NULL directly would fail, because existing rows would have no value.",
    given:
`students — 2 rows (Amit, Riya),
no email column`,
    code:
`-- 1. add it as nullable
ALTER TABLE students ADD COLUMN email VARCHAR(100);

-- 2. fill every row
UPDATE students SET email = LOWER(name) || '@univ.edu';

-- 3. tighten to NOT NULL
ALTER TABLE students ALTER COLUMN email SET NOT NULL;`,
    output:
`email | character varying(100) | not null
every row filled — e.g.
amit@univ.edu, riya@univ.edu`,
    hints: [
      "Step 1 is exactly problem 2.2.",
      "Step 2 is an UPDATE with no WHERE, because every row needs a value. This is the rare case where omitting WHERE is correct.",
      "In PostgreSQL, || joins two pieces of text together. LOWER() converts to lowercase.",
      "Step 3 is exactly problem 2.5."
    ]
  },
  {
    unit: "Unit 3 — Emptying and Removing (TRUNCATE / DROP)",
    num: "3.1",
    title: "Empty the table, keep it",
    question: "Remove all rows but keep the table ready for new data.",
    given:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | ECE    |  91
    3    | Arjun | CSE    |  79`,
    code: "TRUNCATE TABLE students;",
    output:
`SELECT COUNT(*) FROM students;
 count
-------
     0

The table still exists.`,
    hints: [
      "This empties the bucket without throwing it away.",
      "It takes no WHERE clause — it is all rows, every time."
    ]
  },
  {
    unit: "Unit 3 — Emptying and Removing (TRUNCATE / DROP)",
    num: "3.2",
    title: "Remove the table completely",
    question: "Delete the <b>students</b> table entirely.",
    given: "table students exists with 3 rows",
    code: "DROP TABLE students;",
    output:
`SELECT * FROM students;
ERROR: relation "students"
       does not exist`,
    hints: [
      "This throws the bucket away.",
      "Two words plus the table name."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.1",
    title: "Named columns",
    question: "Insert one student — roll 1, Amit, CSE, 88 — listing the column names.",
    given: "0 rows",
    code:
`INSERT INTO students (roll_no, name, branch, marks)
VALUES (1, 'Amit', 'CSE', 88);`,
    output:
` roll_no | name | branch | marks
---------+------+--------+------
    1    | Amit | CSE    |  88`,
    hints: [
      "INSERT INTO students (columns) VALUES (values);",
      "Text needs single quotes. Numbers do not.",
      "This is the safest form — it still works if someone adds a column later."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.2",
    title: "Without column names",
    question: "Insert the same student without listing the columns.",
    given: "0 rows",
    code:
`INSERT INTO students
VALUES (1, 'Amit', 'CSE', 88);`,
    output:
` roll_no | name | branch | marks
---------+------+--------+------
    1    | Amit | CSE    |  88`,
    hints: [
      "Drop the bracketed column list from 4.1.",
      "The values must then be in exactly the table's column order.",
      "Shorter, but it breaks the day a column is added."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.3",
    title: "Many rows in one statement",
    question: "Insert three students at once, using a single statement.",
    given: "0 rows",
    code:
`INSERT INTO students (roll_no, name, branch, marks) VALUES
  (1, 'Amit',  'CSE', 88),
  (2, 'Riya',  'ECE', 91),
  (3, 'Arjun', 'CSE', 79);`,
    output:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | ECE    |  91
    3    | Arjun | CSE    |  79`,
    hints: [
      "Same start as 4.1, with VALUES at the end of the first line.",
      "Each row is its own bracketed group.",
      "Commas between the groups. Only the last one gets the semicolon."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.4",
    title: "Copy from another table",
    question: "Copy every student scoring 90 or above into a <b>toppers(roll_no, name, marks)</b> table.",
    given:
`students:
  1 | Amit  | CSE | 88
  2 | Riya  | ECE | 91
  3 | Arjun | CSE | 79

toppers: 0 rows`,
    code:
`INSERT INTO toppers (roll_no, name, marks)
SELECT roll_no, name, marks FROM students WHERE marks >= 90;`,
    output:
`toppers:
 roll_no | name | marks
---------+------+------
    2    | Riya |  91`,
    hints: [
      "Start as usual: INSERT INTO toppers (columns).",
      "There is no VALUES keyword here.",
      "A SELECT on the second line supplies the rows instead."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.5",
    title: "See the inserted id",
    question: "Insert Sneha and get back the automatically generated <b>roll_no</b> in the same statement.",
    given:
`students(roll_no SERIAL PRIMARY KEY,
         name, branch, marks)
last generated roll_no was 0`,
    code:
`INSERT INTO students (name, branch, marks)
VALUES ('Sneha', 'CSE', 84)
RETURNING roll_no;`,
    output:
` roll_no
---------
       1
(1 row)

row inserted`,
    hints: [
      "A normal INSERT, but skip roll_no — the database generates it.",
      "Add one more clause on the second line to ask for the value back.",
      "That keyword is RETURNING, followed by the column you want."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.6",
    title: "Skip a duplicate",
    question: "Insert (1, 'Amit'), but do nothing silently if <b>roll_no</b> 1 already exists — no error.",
    given:
` roll_no | name
---------+------
    1    | Amit`,
    code:
`INSERT INTO students (roll_no, name) VALUES (1, 'Amit')
ON CONFLICT (roll_no) DO NOTHING;`,
    output:
` roll_no | name
---------+------
    1    | Amit

INSERT 0 0    ← no error, no change`,
    hints: [
      "Write the normal INSERT on line one.",
      "Line two starts with ON CONFLICT, then the clashing column in brackets.",
      "End with DO NOTHING."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.7",
    title: "Update on duplicate",
    question: "Insert (1, 'Amit Kumar'). If <b>roll_no</b> 1 already exists, update its name instead of failing.",
    given:
` roll_no | name
---------+------
    1    | Amit`,
    code:
`INSERT INTO students (roll_no, name) VALUES (1, 'Amit Kumar')
ON CONFLICT (roll_no) DO UPDATE SET name = EXCLUDED.name;`,
    output:
` roll_no | name
---------+------------
    1    | Amit Kumar`,
    hints: [
      "Same shape as 4.6, but end with DO UPDATE SET instead of DO NOTHING.",
      "To refer to the value you tried to insert, use the special table name EXCLUDED — so name = EXCLUDED.name.",
      "This pattern is called an \"upsert\" — update if present, insert if not."
    ]
  },
  {
    unit: "Unit 4 — Adding Rows (INSERT)",
    num: "4.8",
    title: "Skip columns",
    question: "Insert only <b>roll_no</b> and <b>name</b>. Leave <b>branch</b> and <b>marks</b> unset.",
    given: "table with 4 columns",
    code:
`INSERT INTO students (roll_no, name)
VALUES (4, 'Sneha');`,
    output:
` roll_no | name  | branch | marks
---------+-------+--------+------
    4    | Sneha | NULL   | NULL`,
    hints: [
      "Name only the two columns you are supplying.",
      "Omitted columns get NULL, or their DEFAULT if one is set.",
      "This fails if an omitted column is NOT NULL with no default.",
      "Quoting: number 88 (no quotes) · text 'Amit' (single quotes) · date '2026-08-14' · nothing NULL · apostrophe inside text 'O''Brien'"
    ]
  },
  {
    unit: "Unit 5 — Reading Rows (SELECT)",
    num: "5.1",
    title: "Show all rows",
    question: "Return every row in <b>students</b> without changing anything.",
    given:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | ECE    |  91
    3    | Arjun | CSE    |  79`,
    code: "SELECT * FROM students;",
    output:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | ECE    |  91
    3    | Arjun | CSE    |  79
(3 rows)

The table itself is unchanged.`,
    hints: [
      "Only two keywords.",
      "* means all columns.",
      "This is the only command in the workbook that changes nothing."
    ]
  },
  {
    unit: "Unit 6 — Changing Rows (UPDATE)",
    num: "6.1",
    title: "Fix one row",
    question: "Riya (roll_no 2) is in CSE, not ECE. Correct only her row.",
    given:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | ECE    |  91   ← wrong
    3    | Arjun | CSE    |  79`,
    code:
`UPDATE students
SET branch = 'CSE'
WHERE roll_no = 2;`,
    output:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | CSE    |  91
    3    | Arjun | CSE    |  79

UPDATE 1    ← must be 1, not 3`,
    hints: [
      "Three keywords in order: UPDATE, SET, WHERE.",
      "SET names the column and its new value.",
      "Without WHERE, this changes every student in the table. Write the WHERE part first, then go back and add the SET."
    ]
  },
  {
    unit: "Unit 7 — Removing Rows (DELETE)",
    num: "7.1",
    title: "Delete one row",
    question: "Arjun (roll_no 3) has left the university. Remove only his record.",
    given:
` roll_no | name  | branch | marks
---------+-------+--------+------
    1    | Amit  | CSE    |  88
    2    | Riya  | CSE    |  91
    3    | Arjun | CSE    |  79`,
    code:
`DELETE FROM students
WHERE roll_no = 3;`,
    output:
` roll_no | name | branch | marks
---------+------+--------+------
    1    | Amit | CSE    |  88
    2    | Riya | CSE    |  91

DELETE 1`,
    hints: [
      "DELETE FROM students — there is no column list, because you delete whole rows.",
      "A condition is required to target just one row.",
      "Use the primary key. Without WHERE, the whole table is emptied."
    ]
  },
  {
    unit: "Unit 8 — Protecting Multi-Step Work (TCL)",
    num: "8.1",
    title: "Transfer money atomically",
    question: "Transfer 5,000 from account A to account B. It must fully succeed or not happen at all — a crash halfway through must not lose the money.",
    given:
` acc_id | holder | balance
--------+--------+--------
   A    | Amit   | 10000
   B    | Riya   |  8000`,
    code:
`BEGIN;

UPDATE accounts SET balance = balance - 5000 WHERE acc_id = 'A';

UPDATE accounts SET balance = balance + 5000 WHERE acc_id = 'B';

COMMIT;`,
    output:
` acc_id | holder | balance
--------+--------+--------
   A    | Amit   |  5000
   B    | Riya   | 13000

SAVED PERMANENTLY`,
    hints: [
      "A transaction opens with BEGIN;.",
      "Two UPDATE statements go in the middle — one subtracts, one adds. Each needs its own WHERE.",
      "Write the new balance as arithmetic on the old one: balance - 5000.",
      "The closing command makes the change permanent and visible to everyone else."
    ]
  },
  {
    unit: "Unit 9 — Controlling Access (DCL)",
    num: "9.1",
    title: "Create a read-only user",
    question: "Create a user <b>faculty_user</b> who can only read the <b>students</b> table.",
    given: "faculty_user does not exist",
    code:
`CREATE USER faculty_user WITH PASSWORD 'StrongPass123!';

GRANT USAGE ON SCHEMA public TO faculty_user;

GRANT SELECT ON students TO faculty_user;`,
    output:
`   grantee    | privilege_type
--------------+---------------
 faculty_user | SELECT

(SELECT only — no INSERT, UPDATE or DELETE)`,
    hints: [
      "CREATE USER name WITH PASSWORD ' ... ';",
      "In PostgreSQL a user also needs USAGE on the schema before they can see anything inside it. Without this step the grant appears to work but the user still cannot read the table.",
      "The last line grants one privilege on one table: GRANT SELECT ON students TO ..."
    ]
  },
  {
    unit: "Unit 9 — Controlling Access (DCL)",
    num: "9.2",
    title: "Revoke delete access",
    question: "Take away <b>intern_user</b>'s permission to delete from <b>students</b>.",
    given:
`intern_user → DELETE on students
              = allowed`,
    code: "REVOKE DELETE ON students FROM intern_user;",
    output:
`intern_user → DELETE on students
              = blocked`,
    hints: [
      "The mirror image of a GRANT.",
      "The last keyword changes: you grant TO a user, but revoke FROM one."
    ]
  }
];

/* ---- PSQL Tool sessions ----
   Problems using psql backslash meta-commands (\c, \l, \d …) must run in
   pgAdmin's PSQL Tool, not the Query Tool. These render as a terminal. */
const PSQL={
  "0.1":{
    banner:'psql (18.0)\nType "help" for help.\n',
    steps:[
      {prompt:"postgres=#",cmd:"CREATE DATABASE university;",out:"CREATE DATABASE"},
      {prompt:"postgres=#",cmd:"\\c university",out:'You are now connected to database "university" as user "postgres".'},
      {prompt:"university=#",cmd:"SELECT current_database();",out:" current_database\n------------------\n university\n(1 row)"}
    ],
    endPrompt:"university=#"
  }
};

/* ---- live schema/design state per problem ----
   before  = table structure before the query
   after   = table structure after the query (diffed automatically:
             new column -> green, changed -> amber, removed -> red)
   note    = short caption about data / privilege changes            */
function col(n,t,b){return{n:n,t:t,b:b||[]};}
function tbl(name,cols){return{name:name,cols:cols};}
const _RN=function(){return col("roll_no","integer",["PK"]);};
const _NM=function(nn){return col("name","varchar(50)",nn?["NN"]:[]);};
const _BR=function(t,b){return col("branch",t||"varchar(20)",b||[]);};
const _MK=function(b){return col("marks","integer",b||[]);};
const stuBase=function(){return [tbl("students",[_RN(),_NM(true),_BR(),_MK()])];};

const SCHEMA={
  "0.1":null,
  "1.1":{before:[],after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(["CHK"])])],note:"New table created — every column is new."},
  "2.1":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("email","varchar(100)",["UQ"])])]},
  "2.2":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("phone","varchar(15)")])]},
  "2.3":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR("varchar(100)"),_MK()])]},
  "2.4":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),col("department","varchar(20)"),_MK()])],note:"<b>branch</b> renamed to <b>department</b>."},
  "2.5":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR("varchar(20)",["NN"]),_MK()])]},
  "2.6":{before:stuBase(),after:[tbl("students",[_RN(),_NM(false),_BR(),_MK()])]},
  "2.7":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR("varchar(20)",["DEF"]),_MK()])],note:"branch default set to 'CSE'."},
  "2.8":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("phone","varchar(15)")])],after:stuBase()},
  "2.9":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR("varchar(20)",["DEF"]),_MK(),col("email","varchar(100)")])],note:"Two actions in one statement: email added, branch default set."},
  "2.10":{before:[tbl("courses",[col("course_id","integer"),col("title","varchar(50)")])],after:[tbl("courses",[col("course_id","integer",["PK"]),col("title","varchar(50)")])]},
  "2.11":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("email","varchar(100)")])],after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("email","varchar(100)",["UQ"])])]},
  "2.12":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(["CHK"])])]},
  "2.13":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("branch_id","integer")]),tbl("branches",[col("id","integer",["PK"]),col("bname","varchar(50)")])],after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("branch_id","integer",["FK"])]),tbl("branches",[col("id","integer",["PK"]),col("bname","varchar(50)")])],note:"<b>branch_id</b> now references branches(id)."},
  "2.14":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK(["CHK"])])],after:stuBase(),note:"Check constraint chk_m removed from marks."},
  "2.15":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK(["CHK"])])],after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(["CHK"])])],note:"Constraint renamed <b>chk_m → chk_marks</b> (structure unchanged)."},
  "2.16":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK()])],after:[tbl("learners",[_RN(),_NM(true),_BR(),_MK()])],note:"Table renamed <b>students → learners</b>."},
  "2.17":{before:[tbl("students",[_RN(),_NM(true),_BR(),col("marks","text")])],after:stuBase(),note:"marks converted text → integer."},
  "2.18":{before:stuBase(),after:[tbl("students",[_RN(),_NM(true),_BR(),_MK(),col("email","varchar(100)",["NN"])])],note:"Added nullable, filled every row, then set NOT NULL."},
  "3.1":{before:stuBase(),after:stuBase(),note:"Rows removed (3 → 0); table structure kept."},
  "3.2":{before:stuBase(),after:[],note:"Entire table dropped."},
  "4.1":{before:stuBase(),after:stuBase(),note:"1 row inserted (schema unchanged)."},
  "4.2":{before:stuBase(),after:stuBase(),note:"1 row inserted (schema unchanged)."},
  "4.3":{before:stuBase(),after:stuBase(),note:"3 rows inserted (schema unchanged)."},
  "4.4":{before:[tbl("students",[_RN(),_NM(true),_BR(),_MK()]),tbl("toppers",[col("roll_no","integer"),col("name","varchar(50)"),col("marks","integer")])],after:[tbl("students",[_RN(),_NM(true),_BR(),_MK()]),tbl("toppers",[col("roll_no","integer"),col("name","varchar(50)"),col("marks","integer")])],note:"Rows copied into toppers where marks ≥ 90."},
  "4.5":{before:[tbl("students",[col("roll_no","integer",["PK","SER"]),_NM(true),_BR(),_MK()])],after:[tbl("students",[col("roll_no","integer",["PK","SER"]),_NM(true),_BR(),_MK()])],note:"roll_no is SERIAL — generated automatically."},
  "4.6":{before:[tbl("students",[_RN(),_NM(true)])],after:[tbl("students",[_RN(),_NM(true)])],note:"Duplicate roll_no ignored (ON CONFLICT DO NOTHING)."},
  "4.7":{before:[tbl("students",[_RN(),_NM(true)])],after:[tbl("students",[_RN(),_NM(true)])],note:"Upsert — existing row updated in place."},
  "4.8":{before:stuBase(),after:stuBase(),note:"Row inserted; branch & marks left NULL."},
  "5.1":{before:stuBase(),after:stuBase(),note:"Read-only — nothing changes."},
  "6.1":{before:stuBase(),after:stuBase(),note:"1 row updated (schema unchanged)."},
  "7.1":{before:stuBase(),after:stuBase(),note:"1 row deleted (schema unchanged)."},
  "8.1":{before:[tbl("accounts",[col("acc_id","varchar(4)",["PK"]),col("holder","varchar(50)"),col("balance","integer")])],after:[tbl("accounts",[col("acc_id","varchar(4)",["PK"]),col("holder","varchar(50)"),col("balance","integer")])],note:"Two balances updated atomically inside a transaction."},
  "9.1":{before:stuBase(),after:stuBase(),note:"Privilege change — <b>faculty_user</b> granted SELECT on students."},
  "9.2":{before:stuBase(),after:stuBase(),note:"Privilege change — DELETE revoked from intern_user."}
};
