// FREE DBMS cards shown on /prep-trek/dbms.
// The premium cards are NOT in this repo: they live only in the paid PDF.
import type { PrepCard } from "./types";

export const dbmsFreeCards: PrepCard[] = [
  {
    "id": "dbms-vs-files",
    "group": "Basics",
    "q": "What is a DBMS, and why not just use files?",
    "say": "A DBMS is software that stores data and lets many users safely read, change and protect it at once.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "File system",
        "points": [
          "Same data repeated in many files",
          "No safe multi-user editing",
          "You write your own search",
          "A crash can corrupt data"
        ]
      },
      "b": {
        "title": "DBMS",
        "points": [
          "One shared copy of the data",
          "Locks and transactions",
          "Query it with SQL",
          "Recovers after a crash"
        ]
      }
    },
    "tryIt": {
      "prompt": "Two people edit the same file at the same time. What usually goes wrong?",
      "options": [
        "The last save silently wins",
        "The file gets faster",
        "Both edits merge perfectly"
      ],
      "correct": 0,
      "why": "Plain files have no locking or transactions, so one person's changes can be overwritten. A DBMS handles this for you."
    },
    "trap": "Saying a DBMS is just 'a place to store data'. Storage is the easy part. The point is safe sharing, security and querying.",
    "sayIt": "A DBMS gives many users one safe, shared copy of the data, with querying, security and crash recovery built in."
  },
  {
    "id": "keys",
    "group": "Keys",
    "q": "Explain primary, candidate and foreign keys.",
    "say": "A key is a column (or set of columns) that identifies rows or links tables.",
    "picture": {
      "kind": "chips",
      "items": [
        {
          "label": "Candidate key",
          "note": "Any column set that could uniquely identify a row. Example: email, roll_no."
        },
        {
          "label": "Primary key",
          "note": "The one candidate you pick. Unique and never NULL. Example: roll_no."
        },
        {
          "label": "Foreign key",
          "note": "A column that points to another table's primary key. Example: orders.customer_id."
        }
      ]
    },
    "tryIt": {
      "prompt": "A table has id and email, and both are unique. You choose id as the primary key. What is email?",
      "options": [
        "A candidate key that wasn't chosen as primary",
        "A foreign key",
        "Not a key at all"
      ],
      "correct": 0,
      "why": "Both id and email could identify a row, so both are candidate keys. You picked one as primary; the other stays a candidate (alternate) key."
    },
    "trap": "Saying a primary key can be NULL. It can't. Also, a table has only one primary key (which can span several columns).",
    "sayIt": "Candidates are the options, the primary key is the one I chose, and a foreign key links to another table's primary key."
  },
  {
    "id": "primary-vs-unique",
    "group": "Keys",
    "q": "Primary key vs unique key?",
    "say": "Both prevent duplicates, but a primary key identifies the row and a unique key only blocks repeats.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "Primary key",
        "points": [
          "One per table",
          "Never NULL",
          "Identifies each row"
        ]
      },
      "b": {
        "title": "Unique key",
        "points": [
          "Many per table",
          "Usually allows NULL",
          "Only stops duplicates"
        ]
      }
    },
    "tryIt": {
      "prompt": "You need email to be unique, but some users have no email. Which fits?",
      "options": [
        "Primary key",
        "Unique key",
        "Foreign key"
      ],
      "correct": 1,
      "why": "A unique key allows NULL in most databases, so users without an email still fit. A primary key never allows NULL."
    },
    "trap": "Saying a unique column can never hold NULL. Most databases allow it; SQL Server allows just one.",
    "sayIt": "A primary key identifies the row: one per table, no NULL. A unique key only prevents duplicates, and a table can have many."
  },
  {
    "id": "why-normalization",
    "group": "Normalization",
    "q": "What is normalization, and why do we do it?",
    "say": "Splitting data into smaller tables so each fact is stored only once.",
    "picture": {
      "kind": "table",
      "head": [
        "order_id",
        "customer",
        "customer_phone",
        "item"
      ],
      "rows": [
        [
          "1",
          "Asha",
          "98xxx",
          "Pen"
        ],
        [
          "2",
          "Asha",
          "98xxx",
          "Book"
        ],
        [
          "3",
          "Ravi",
          "97xxx",
          "Pen"
        ]
      ],
      "caption": "Asha's phone number is stored twice. Change one row and the data now disagrees with itself."
    },
    "tryIt": {
      "prompt": "Asha changes her phone number. In the table above, what is the risk?",
      "options": [
        "An update anomaly: one row gets updated, the other is missed",
        "Nothing, it is fine",
        "The table becomes faster"
      ],
      "correct": 0,
      "why": "Repeated data can be updated in one place and missed in another. Normalization removes the repetition."
    },
    "trap": "Saying normalization is only to save space. The real goal is avoiding update, insert and delete anomalies.",
    "sayIt": "Normalization stores each fact once, so an update can't leave the data contradicting itself."
  },
  {
    "id": "normal-forms",
    "group": "Normalization",
    "q": "Explain 1NF, 2NF and 3NF.",
    "say": "Each form removes one kind of repetition. Every column should depend on the key, the whole key, and nothing but the key.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "1NF",
          "text": "One value per cell. No lists like 'Pen, Book' in one column."
        },
        {
          "title": "2NF",
          "text": "Already 1NF, and no column depends on only part of a composite key."
        },
        {
          "title": "3NF",
          "text": "Already 2NF, and no column depends on another non-key column."
        }
      ],
      "caption": "Memory line: the key, the whole key, and nothing but the key."
    },
    "tryIt": {
      "prompt": "students(roll_no, name, dept_id, dept_name): dept_name depends on dept_id, not on roll_no. Which form is broken?",
      "options": [
        "1NF",
        "2NF",
        "3NF"
      ],
      "correct": 2,
      "why": "dept_name depends on dept_id, which is a non-key column. That is a transitive dependency and breaks 3NF. Fix: move dept_id and dept_name into a separate departments table."
    },
    "trap": "Mixing up 2NF and 3NF. 2NF is about partial dependency on a composite key. 3NF is about one non-key column depending on another.",
    "sayIt": "1NF means atomic values, 2NF means no partial dependencies, and 3NF means no transitive dependencies."
  },
  {
    "id": "acid",
    "group": "Transactions",
    "q": "What is ACID?",
    "say": "Four guarantees that keep a transaction safe, even if the system crashes.",
    "picture": {
      "kind": "chips",
      "items": [
        {
          "label": "A  Atomicity",
          "note": "All or nothing. In a Rs.500 transfer, the debit and credit both happen, or neither does."
        },
        {
          "label": "C  Consistency",
          "note": "The rules stay true. A balance can't go below the allowed minimum."
        },
        {
          "label": "I  Isolation",
          "note": "Parallel transactions don't see each other's half-finished work."
        },
        {
          "label": "D  Durability",
          "note": "Once committed, the change survives a crash."
        }
      ]
    },
    "tryIt": {
      "prompt": "Money leaves account A, then the server crashes before B is credited. Which property rolls it back?",
      "options": [
        "Atomicity",
        "Durability",
        "Isolation"
      ],
      "correct": 0,
      "why": "Atomicity means a transaction is all or nothing, so the half-done debit is undone."
    },
    "trap": "Mixing up Consistency and Isolation. Consistency is about rules staying valid. Isolation is about concurrent transactions not interfering.",
    "sayIt": "Atomicity rolls back half-done work, and durability keeps committed work."
  },
  {
    "id": "joins",
    "group": "SQL",
    "q": "INNER JOIN vs LEFT JOIN?",
    "say": "INNER keeps only rows that match in both tables. LEFT keeps every row from the left table.",
    "picture": {
      "kind": "table",
      "head": [
        "Join",
        "Keeps",
        "Unmatched rows"
      ],
      "rows": [
        [
          "INNER JOIN",
          "Only rows that match in both",
          "Dropped"
        ],
        [
          "LEFT JOIN",
          "All rows from the left table",
          "Right side shows NULL"
        ],
        [
          "RIGHT JOIN",
          "All rows from the right table",
          "Left side shows NULL"
        ],
        [
          "FULL JOIN",
          "All rows from both tables",
          "NULL on the missing side"
        ]
      ]
    },
    "tryIt": {
      "prompt": "customers has 5 rows but only 3 have orders. You want all 5 customers, with orders where they exist. Which join?",
      "options": [
        "INNER JOIN",
        "LEFT JOIN from customers",
        "CROSS JOIN"
      ],
      "correct": 1,
      "why": "LEFT JOIN keeps every customer. The 2 without orders get NULL in the order columns."
    },
    "trap": "Using INNER JOIN and wondering where the customers with no orders went. INNER drops anything unmatched.",
    "sayIt": "INNER keeps matches only. LEFT keeps everything from the left table and fills NULL where there's no match."
  },
  {
    "id": "delete-truncate-drop",
    "group": "SQL",
    "q": "DELETE vs TRUNCATE vs DROP?",
    "say": "DELETE removes chosen rows, TRUNCATE empties the table, DROP removes the table itself.",
    "picture": {
      "kind": "table",
      "head": [
        "",
        "DELETE",
        "TRUNCATE",
        "DROP"
      ],
      "rows": [
        [
          "Removes",
          "Chosen rows",
          "All rows",
          "The whole table"
        ],
        [
          "Can use WHERE",
          "Yes",
          "No",
          "No"
        ],
        [
          "Table structure",
          "Stays",
          "Stays",
          "Gone"
        ],
        [
          "Type",
          "DML",
          "DDL",
          "DDL"
        ],
        [
          "Rollback",
          "Yes, in a transaction",
          "Depends on the database",
          "Depends on the database"
        ]
      ]
    },
    "tryIt": {
      "prompt": "You want to empty a table but keep its structure for reuse. What is usually fastest?",
      "options": [
        "DROP",
        "TRUNCATE",
        "DELETE one row at a time"
      ],
      "correct": 1,
      "why": "TRUNCATE empties the table and keeps the structure. It is usually faster than DELETE because it doesn't work through the rows one by one."
    },
    "trap": "Calling DROP 'delete everything'. DROP removes the table itself, structure included.",
    "sayIt": "DELETE removes chosen rows, TRUNCATE empties the table, and DROP removes the table itself."
  },
  {
    "id": "index",
    "group": "Indexing",
    "q": "What is an index, and what is the catch?",
    "say": "A sorted lookup structure that lets the database find rows without scanning the whole table.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "With an index",
        "points": [
          "Jumps straight to matching rows",
          "Searches on that column get much faster"
        ]
      },
      "b": {
        "title": "The cost",
        "points": [
          "Takes extra storage",
          "Slows INSERT, UPDATE and DELETE",
          "Pointless on tiny tables"
        ]
      }
    },
    "tryIt": {
      "prompt": "A column is searched in almost every query, and the table has 10 million rows. Good candidate for an index?",
      "options": [
        "Yes",
        "No, indexes only slow things down",
        "Only if the table is tiny"
      ],
      "correct": 0,
      "why": "Frequent searches on a big table are exactly where an index pays off. The extra write cost is usually worth it."
    },
    "trap": "Saying 'index every column'. Each index slows writes and costs space, so index only what you search, join or sort on.",
    "sayIt": "An index speeds up reads by avoiding a full scan, but it costs storage and makes writes slower."
  },
  {
    "id": "sql-vs-nosql",
    "group": "Basics",
    "q": "SQL vs NoSQL?",
    "say": "SQL stores related data in fixed tables. NoSQL trades that structure for flexibility and easy scaling out.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "SQL (relational)",
        "points": [
          "Tables with a fixed schema",
          "Strong joins and transactions",
          "Best for structured, related data"
        ]
      },
      "b": {
        "title": "NoSQL",
        "points": [
          "Flexible schema",
          "Scales out across many servers",
          "Best for huge or varied data"
        ]
      }
    },
    "tryIt": {
      "prompt": "A banking app needs safe transfers between accounts. Which is the classic fit?",
      "options": [
        "SQL, for its transaction guarantees",
        "NoSQL, for its flexible schema"
      ],
      "correct": 0,
      "why": "Transfers need ACID guarantees. Relational databases are the classic fit for that."
    },
    "trap": "Saying NoSQL is 'better' or 'faster'. It is a trade-off: flexibility and scale versus joins and strict structure.",
    "sayIt": "I'd pick SQL for structured, related data that needs transactions, and NoSQL when the schema varies or scale-out matters most."
  }
];
