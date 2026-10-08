// FREE SQL cards shown on the website.
// The premium cards are NOT in this repo: they live only in the paid PDF.
import type { PrepCard } from "./types";

export const sqlFreeCards: PrepCard[] = [
  {
    "id": "sql-order",
    "group": "Basics",
    "q": "In what order does SQL actually run a query?",
    "say": "Not the order you write it. The database filters first, groups next, and only then picks columns.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "FROM / JOIN",
          "text": "Pick the tables and combine them."
        },
        {
          "title": "WHERE",
          "text": "Filter individual rows."
        },
        {
          "title": "GROUP BY",
          "text": "Collapse rows into groups."
        },
        {
          "title": "HAVING",
          "text": "Filter the groups."
        },
        {
          "title": "SELECT",
          "text": "Now choose columns and create aliases."
        },
        {
          "title": "ORDER BY, LIMIT",
          "text": "Sort the result, then cut it down."
        }
      ],
      "caption": "Some databases let GROUP BY or HAVING use aliases, but WHERE never can."
    },
    "tryIt": {
      "prompt": "Why does WHERE total > 100 fail when total is an alias defined in SELECT?",
      "options": [
        "WHERE runs before SELECT, so the alias doesn't exist yet",
        "Aliases only work with numbers",
        "WHERE can't use columns"
      ],
      "correct": 0,
      "why": "SELECT is processed after WHERE, so the alias hasn't been created yet. Repeat the expression in WHERE, or wrap the query in a subquery or CTE."
    },
    "trap": "Assuming SQL runs in the order you type it. That is why aliases fail in WHERE and aggregates fail in WHERE.",
    "sayIt": "SQL runs FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT, so WHERE can't see aliases or aggregates."
  },
  {
    "id": "sql-command-groups",
    "group": "Basics",
    "q": "DDL, DML, DCL and TCL: what are they?",
    "say": "SQL commands fall into four groups by what they do: define, change, permit, or control transactions.",
    "picture": {
      "kind": "table",
      "head": [
        "Group",
        "Does what",
        "Examples"
      ],
      "rows": [
        [
          "DDL",
          "Defines structure",
          "CREATE, ALTER, DROP, TRUNCATE"
        ],
        [
          "DML",
          "Changes data",
          "INSERT, UPDATE, DELETE"
        ],
        [
          "DCL",
          "Controls access",
          "GRANT, REVOKE"
        ],
        [
          "TCL",
          "Controls transactions",
          "COMMIT, ROLLBACK, SAVEPOINT"
        ]
      ],
      "caption": "SELECT is often listed as DQL (query), or inside DML. Say which one you mean."
    },
    "tryIt": {
      "prompt": "Which group does GRANT belong to?",
      "options": [
        "DDL",
        "DML",
        "DCL",
        "TCL"
      ],
      "correct": 2,
      "why": "GRANT and REVOKE decide who may do what. That is access control, which is DCL."
    },
    "trap": "Putting TRUNCATE under DML. Most sources class it as DDL, though a few say DML, so know which you'd defend.",
    "sayIt": "DDL defines structure, DML changes data, DCL controls access, and TCL controls transactions."
  },
  {
    "id": "sql-filtering",
    "group": "Filtering & grouping",
    "q": "How do you filter with IN, BETWEEN, LIKE and IS NULL?",
    "say": "IN checks a list, BETWEEN checks a range, LIKE matches a pattern, and NULL needs IS NULL.",
    "picture": {
      "kind": "chips",
      "items": [
        {
          "label": "IN",
          "note": "Matches any value in a list. customer_id IN (1, 2, 3)."
        },
        {
          "label": "BETWEEN",
          "note": "Includes both ends. amount BETWEEN 100 AND 500 includes 100 and 500."
        },
        {
          "label": "LIKE",
          "note": "Pattern match. % means any text, _ means exactly one character. name LIKE 'A%'."
        },
        {
          "label": "IS NULL",
          "note": "The only way to test for NULL. = NULL never matches."
        }
      ],
      "code": "SELECT order_id\nFROM orders\nWHERE amount BETWEEN 100 AND 500\n  AND customer_id IN (1, 2, 3);"
    },
    "tryIt": {
      "prompt": "Amounts are 100, 250, 500 and 501. How many rows match amount BETWEEN 100 AND 500?",
      "options": [
        "2",
        "3",
        "4"
      ],
      "correct": 1,
      "why": "BETWEEN includes both ends, so 100, 250 and 500 match. Only 501 is left out."
    },
    "trap": "Thinking BETWEEN leaves out the end values. It includes both.",
    "sayIt": "IN checks a list, BETWEEN includes both ends, LIKE uses % and _, and NULL needs IS NULL."
  },
  {
    "id": "sql-group-by",
    "group": "Filtering & grouping",
    "q": "How does GROUP BY work?",
    "say": "It puts rows with the same value together and gives you one result row per group.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Rows",
          "text": "Start with every row left after WHERE."
        },
        {
          "title": "Group",
          "text": "Rows with the same dept_id go into one bucket."
        },
        {
          "title": "Aggregate",
          "text": "COUNT, SUM or AVG runs once per bucket."
        },
        {
          "title": "Result",
          "text": "One row per group."
        }
      ],
      "code": "SELECT dept_id, COUNT(*) AS headcount\nFROM employees\nGROUP BY dept_id;"
    },
    "tryIt": {
      "prompt": "SELECT dept_id, name, COUNT(*) FROM employees GROUP BY dept_id. What is wrong?",
      "options": [
        "name is neither grouped nor aggregated",
        "COUNT can't be used with GROUP BY",
        "Nothing is wrong"
      ],
      "correct": 0,
      "why": "Each group becomes one row, so every selected column must be a group column or an aggregate. Which name should a group of five people show?"
    },
    "trap": "Selecting a column that isn't grouped. Some MySQL settings let it through and return an arbitrary value, which hides the bug.",
    "sayIt": "GROUP BY makes one row per group, so every selected column must be grouped or aggregated."
  },
  {
    "id": "sql-aggregates",
    "group": "Filtering & grouping",
    "q": "COUNT, SUM, AVG, MIN, MAX: what do they return?",
    "say": "Aggregates squeeze many rows into one value, and they skip NULLs.",
    "picture": {
      "kind": "table",
      "head": [
        "Function",
        "What it returns"
      ],
      "rows": [
        [
          "COUNT(*)",
          "The number of rows"
        ],
        [
          "COUNT(col)",
          "The number of non-NULL values"
        ],
        [
          "COUNT(DISTINCT col)",
          "The number of different non-NULL values"
        ],
        [
          "SUM / AVG",
          "Total / average, ignoring NULL"
        ],
        [
          "MIN / MAX",
          "Smallest / largest"
        ]
      ]
    },
    "tryIt": {
      "prompt": "Salary values are 10, 20, 20 and NULL. What does COUNT(DISTINCT salary) return?",
      "options": [
        "2",
        "3",
        "4"
      ],
      "correct": 0,
      "why": "DISTINCT keeps 10 and 20 once each, and NULL is ignored, so the answer is 2."
    },
    "trap": "Expecting AVG to treat NULL as 0. It skips NULL rows, so the average comes out higher than you'd guess.",
    "sayIt": "Aggregates skip NULLs, COUNT(*) counts rows, and COUNT(DISTINCT col) counts different values."
  },
  {
    "id": "sql-case",
    "group": "Filtering & grouping",
    "q": "How do you write if-else in SQL?",
    "say": "CASE WHEN checks conditions from top to bottom and returns the first one that matches.",
    "picture": {
      "kind": "table",
      "head": [
        "salary",
        "band"
      ],
      "rows": [
        [
          "95000",
          "High"
        ],
        [
          "60000",
          "Mid"
        ],
        [
          "30000",
          "Low"
        ]
      ],
      "code": "SELECT name,\n  CASE WHEN salary >= 80000 THEN 'High'\n       WHEN salary >= 50000 THEN 'Mid'\n       ELSE 'Low' END AS band\nFROM employees;"
    },
    "tryIt": {
      "prompt": "What band does a salary of 60000 get?",
      "options": [
        "High",
        "Mid",
        "Low"
      ],
      "correct": 1,
      "why": "60000 fails the first test (>= 80000), then passes the second (>= 50000), so it is Mid."
    },
    "trap": "Putting a broad condition first. If >= 50000 came before >= 80000, everyone above 50000 would be Mid, because CASE stops at the first match.",
    "sayIt": "CASE returns the first matching branch, so I order conditions from most specific to least."
  },
  {
    "id": "sql-anti-join",
    "group": "Joins & subqueries",
    "q": "How do you find rows that have no match, like customers with no orders?",
    "say": "Three ways: LEFT JOIN then IS NULL, NOT EXISTS, or NOT IN. NOT IN has a NULL trap.",
    "picture": {
      "kind": "chips",
      "items": [
        {
          "label": "LEFT JOIN ... IS NULL",
          "note": "Keep every customer, then keep only the rows where the order side is NULL."
        },
        {
          "label": "NOT EXISTS",
          "note": "True when the inner query finds no matching row. Safe with NULLs."
        },
        {
          "label": "NOT IN",
          "note": "Compares against a list. One NULL in the list makes every row fail."
        }
      ],
      "code": "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;"
    },
    "tryIt": {
      "prompt": "customers NOT IN (SELECT customer_id FROM orders) returns zero rows, even though some customers have no orders. Likely cause?",
      "options": [
        "orders.customer_id contains a NULL",
        "The table is too big",
        "NOT IN doesn't work with numbers"
      ],
      "correct": 0,
      "why": "A value NOT IN a list containing NULL evaluates to unknown, so no row passes. Prefer NOT EXISTS or LEFT JOIN with IS NULL."
    },
    "trap": "Using NOT IN on a column that can contain NULL. It silently returns nothing.",
    "sayIt": "To find rows with no match I use LEFT JOIN with IS NULL or NOT EXISTS, and I avoid NOT IN when NULLs are possible."
  },
  {
    "id": "sql-window-intro",
    "group": "Window functions",
    "q": "What is a window function?",
    "say": "It calculates across related rows without collapsing them, and PARTITION BY says which rows are related.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "GROUP BY",
        "points": [
          "One row per group",
          "The original rows disappear",
          "Good for totals and counts"
        ]
      },
      "b": {
        "title": "Window function (OVER)",
        "points": [
          "Keeps every row",
          "Adds a calculated column",
          "Good for comparing a row to its group"
        ]
      },
      "code": "SELECT name, dept_id, salary,\n  AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg\nFROM employees;"
    },
    "tryIt": {
      "prompt": "You want each employee's salary shown next to their department average. Which fits?",
      "options": [
        "GROUP BY dept_id",
        "AVG(salary) OVER (PARTITION BY dept_id)",
        "HAVING AVG(salary)"
      ],
      "correct": 1,
      "why": "A window function adds the department average to every row without removing any employee."
    },
    "trap": "Thinking OVER() removes rows like GROUP BY does. It never does.",
    "sayIt": "A window function calculates across related rows without collapsing them."
  },
  {
    "id": "sql-ranking",
    "group": "Window functions",
    "q": "ROW_NUMBER vs RANK vs DENSE_RANK?",
    "say": "All three number rows. They differ in what they do when two rows tie.",
    "picture": {
      "kind": "table",
      "head": [
        "salary",
        "ROW_NUMBER",
        "RANK",
        "DENSE_RANK"
      ],
      "rows": [
        [
          "90",
          "1",
          "1",
          "1"
        ],
        [
          "90",
          "2",
          "1",
          "1"
        ],
        [
          "80",
          "3",
          "3",
          "2"
        ]
      ],
      "caption": "After the tie on 90, RANK skips to 3. DENSE_RANK carries on with 2."
    },
    "tryIt": {
      "prompt": "Salaries are 90, 90 and 80. What is DENSE_RANK for 80?",
      "options": [
        "2",
        "3",
        "1"
      ],
      "correct": 0,
      "why": "DENSE_RANK doesn't leave gaps after a tie, so 80 is rank 2. RANK would say 3."
    },
    "trap": "Using RANK or ROW_NUMBER for 'Nth highest salary'. Ties and gaps pick the wrong row. Use DENSE_RANK.",
    "sayIt": "ROW_NUMBER never ties, RANK skips after a tie, and DENSE_RANK doesn't skip, so it's the one for Nth highest."
  },
  {
    "id": "sql-cte",
    "group": "Writing real queries",
    "q": "What is a CTE, and why use one?",
    "say": "A named, temporary result you define with WITH and use in the query that follows.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Name it",
          "text": "WITH dept_avg AS (...) gives a subquery a name."
        },
        {
          "title": "Use it",
          "text": "Treat dept_avg like a table in the main query."
        },
        {
          "title": "It disappears",
          "text": "It exists only for that one statement."
        }
      ],
      "code": "WITH dept_avg AS (\n  SELECT dept_id, AVG(salary) AS avg_sal\n  FROM employees GROUP BY dept_id\n)\nSELECT e.name\nFROM employees e\nJOIN dept_avg d ON d.dept_id = e.dept_id\nWHERE e.salary > d.avg_sal;"
    },
    "tryIt": {
      "prompt": "How long does a CTE exist?",
      "options": [
        "Only for the one statement that follows",
        "Until you drop it",
        "For the whole session"
      ],
      "correct": 0,
      "why": "A CTE is not stored anywhere. It exists only while that single statement runs."
    },
    "trap": "Thinking a CTE is stored like a view, or always faster. It is mainly for readability, and speed depends on the database.",
    "sayIt": "A CTE names a subquery so the query reads top to bottom, and it only lives for that one statement."
  }
];
