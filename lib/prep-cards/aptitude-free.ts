// FREE Aptitude cards shown on the website (10 of the 24).
// The other 14 cards, the formula cheat sheet and the full PDF are NOT in this
// repo: they live only in the paid notes.
import type { PrepCard } from "./types";

export const aptitudeFreeCards: PrepCard[] = [
  {
    "id": "apt-pct-fractions",
    "group": "Percentages",
    "q": "How do I find 12.5%, 16.67% or 37.5% of a number without a calculator?",
    "say": "Memorise the fraction hiding behind the percentage, then divide instead of multiplying.",
    "picture": {
      "kind": "table",
      "head": [
        "Fraction",
        "Percent",
        "Example: of 720"
      ],
      "rows": [
        [
          "1/2",
          "50%",
          "360"
        ],
        [
          "1/3",
          "33.33%",
          "240"
        ],
        [
          "1/4",
          "25%",
          "180"
        ],
        [
          "1/5",
          "20%",
          "144"
        ],
        [
          "1/6",
          "16.67%",
          "120"
        ],
        [
          "1/8",
          "12.5%",
          "90"
        ],
        [
          "1/9",
          "11.11%",
          "80"
        ],
        [
          "1/12",
          "8.33%",
          "60"
        ],
        [
          "3/8",
          "37.5%",
          "270"
        ]
      ],
      "caption": "Learn these nine once and half of all percentage questions become one division."
    },
    "tryIt": {
      "prompt": "What is 37.5% of 880?",
      "options": [
        "310",
        "330",
        "350"
      ],
      "correct": 1,
      "why": "37.5% = 3/8. 880 ÷ 8 = 110, and 110 × 3 = 330."
    },
    "trap": "Converting everything to decimals and multiplying under time pressure. 16.67% of 480 is slow by hand; 480 ÷ 6 takes two seconds.",
    "sayIt": "A percentage is a fraction in disguise. Spot the fraction, divide, done."
  },
  {
    "id": "apt-successive-pct",
    "group": "Percentages",
    "q": "A price rises 20% and then falls 20%. Is it back where it started?",
    "say": "No. Percent changes multiply, they don't cancel. You end up 4% lower.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Start at 100",
          "text": "Use 100 as the base so percentages become plain numbers."
        },
        {
          "title": "Rise 20%",
          "text": "100 × 1.20 = 120."
        },
        {
          "title": "Fall 20% of the NEW price",
          "text": "20% of 120 is 24, so 120 − 24 = 96."
        },
        {
          "title": "Net change",
          "text": "96 against 100 is a 4% fall."
        }
      ],
      "caption": "Shortcut for two successive changes a% and b%: net = a + b + ab/100. Here 20 − 20 − 4 = −4%."
    },
    "tryIt": {
      "prompt": "A salary goes up 50% and then down 50%. What is the net change?",
      "options": [
        "0%",
        "−25%",
        "−50%"
      ],
      "correct": 1,
      "why": "1.5 × 0.5 = 0.75, so the salary ends 25% lower."
    },
    "trap": "Adding and subtracting the percents. +20 and −20 look like zero, but the second percent applies to a different base.",
    "sayIt": "Successive changes multiply: net = a + b + ab/100."
  },
  {
    "id": "apt-divisibility",
    "group": "Number system",
    "q": "Is 7,293 divisible by 11, without actually dividing?",
    "say": "Yes. Subtract alternate digits: 7 − 2 + 9 − 3 = 11, and a result of 0 or a multiple of 11 means it divides.",
    "picture": {
      "kind": "table",
      "head": [
        "Divisor",
        "Test",
        "Example"
      ],
      "rows": [
        [
          "3",
          "Digit sum divisible by 3",
          "462 → 4+6+2 = 12 ✓"
        ],
        [
          "4",
          "Last two digits divisible by 4",
          "7,316 → 16 ✓"
        ],
        [
          "6",
          "Even AND divisible by 3",
          "7,224 → even, sum 15 ✓"
        ],
        [
          "8",
          "Last three digits divisible by 8",
          "5,128 → 128 ✓"
        ],
        [
          "9",
          "Digit sum divisible by 9",
          "729 → 18 ✓"
        ],
        [
          "11",
          "Alternating digit sum is 0 or a multiple of 11",
          "7,293 → 7−2+9−3 = 11 ✓"
        ]
      ]
    },
    "tryIt": {
      "prompt": "Which of these is divisible by 8?",
      "options": [
        "5,324",
        "7,128",
        "9,462"
      ],
      "correct": 1,
      "why": "Check the last three digits: 128 ÷ 8 = 16. The others leave 324 ÷ 8 = 40.5 and 462 ÷ 8 = 57.75."
    },
    "trap": "Testing 'divisible by 6' with only one rule. The number has to pass BOTH the 2 test and the 3 test.",
    "sayIt": "Don't divide, test. Last digits for 4 and 8, digit sums for 3 and 9, alternating sum for 11."
  },
  {
    "id": "apt-profit-loss",
    "group": "Profit and loss",
    "q": "An item sold for ₹1,200 gives a 20% profit. What did it cost?",
    "say": "Profit percentage always sits on the cost price, so SP = CP × 1.20 and you divide to go back.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Name the base",
          "text": "Profit and loss percentages are on the cost price (CP) unless told otherwise."
        },
        {
          "title": "Write the relation",
          "text": "SP = CP × (1 + 20/100) = CP × 1.20."
        },
        {
          "title": "Reverse it",
          "text": "CP = 1,200 ÷ 1.20 = ₹1,000."
        },
        {
          "title": "Loss works the same way",
          "text": "SP = CP × (1 − loss%). A 10% loss means SP = CP × 0.90."
        }
      ]
    },
    "tryIt": {
      "prompt": "An item sold at a 10% loss fetches ₹1,260. What was the cost price?",
      "options": [
        "₹1,386",
        "₹1,400",
        "₹1,134"
      ],
      "correct": 1,
      "why": "SP = CP × 0.90, so CP = 1,260 ÷ 0.90 = ₹1,400."
    },
    "trap": "Taking 20% of the selling price (₹240) and subtracting it. The percentage belongs to the cost, not the selling price.",
    "sayIt": "Profit and loss are on cost price. SP = CP × (1 ± p/100)."
  },
  {
    "id": "apt-averages",
    "group": "Averages",
    "q": "The average of 5 numbers is 20. When one is removed, the average of the rest is 18. Which number was removed?",
    "say": "Work with totals, not averages. Total before minus total after.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Total of all five",
          "text": "5 × 20 = 100."
        },
        {
          "title": "Total of the remaining four",
          "text": "4 × 18 = 72."
        },
        {
          "title": "The removed number",
          "text": "100 − 72 = 28."
        }
      ],
      "caption": "Same idea in reverse: adding a number that is x above the old average lifts the average by x ÷ new count."
    },
    "tryIt": {
      "prompt": "The average of 6 numbers is 15. A 7th number is added and the average becomes 16. What is the new number?",
      "options": [
        "21",
        "22",
        "23"
      ],
      "correct": 1,
      "why": "New total = 7 × 16 = 112. Old total = 6 × 15 = 90. New number = 22."
    },
    "trap": "Averaging the averages, e.g. (20 + 18) ÷ 2. Groups of different sizes cannot be averaged directly.",
    "sayIt": "Average × count = total. Convert to totals, then subtract."
  },
  {
    "id": "apt-time-work",
    "group": "Time and work",
    "q": "A finishes a job in 12 days and B in 18 days. How long will they take together?",
    "say": "Pick the LCM as the total work. Everyone's daily output becomes a whole number.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Total work = LCM",
          "text": "LCM of 12 and 18 is 36 units."
        },
        {
          "title": "Daily output",
          "text": "A: 36 ÷ 12 = 3 units a day. B: 36 ÷ 18 = 2 units a day."
        },
        {
          "title": "Together",
          "text": "3 + 2 = 5 units a day."
        },
        {
          "title": "Time",
          "text": "36 ÷ 5 = 7.2 days."
        }
      ]
    },
    "tryIt": {
      "prompt": "A takes 8 days and B takes 24 days. How long together?",
      "options": [
        "5 days",
        "6 days",
        "16 days"
      ],
      "correct": 1,
      "why": "LCM 24: A does 3 a day, B does 1 a day, together 4. 24 ÷ 4 = 6 days."
    },
    "trap": "Adding or averaging the times (12 + 18, or 15). Add RATES, never times.",
    "sayIt": "Take the LCM as the work, turn each time into a rate, and add the rates."
  },
  {
    "id": "apt-avg-speed",
    "group": "Speed and distance",
    "q": "You drive to a city at 40 km/h and return at 60 km/h. Is your average speed 50 km/h?",
    "say": "No, it is 48 km/h. Over equal distances you spend more time at the slower speed.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Pick a distance",
          "text": "Take 120 km each way."
        },
        {
          "title": "Going",
          "text": "120 ÷ 40 = 3 hours."
        },
        {
          "title": "Returning",
          "text": "120 ÷ 60 = 2 hours."
        },
        {
          "title": "Average",
          "text": "240 km ÷ 5 hours = 48 km/h."
        }
      ],
      "caption": "Shortcut for equal distances: 2ab ÷ (a + b) = 2 × 40 × 60 ÷ 100 = 48."
    },
    "tryIt": {
      "prompt": "A cyclist climbs a hill at 30 km/h and returns down at 60 km/h. Average speed for the round trip?",
      "options": [
        "40 km/h",
        "45 km/h",
        "50 km/h"
      ],
      "correct": 0,
      "why": "2 × 30 × 60 ÷ (30 + 60) = 3,600 ÷ 90 = 40 km/h."
    },
    "trap": "Averaging the two speeds. That works only when equal TIMES, not equal distances, are spent at each speed.",
    "sayIt": "Equal distances: 2ab ÷ (a + b). Total distance over total time, always."
  },
  {
    "id": "apt-perm-comb",
    "group": "Permutation and combination",
    "q": "In how many ways can the letters of LEVEL be arranged?",
    "say": "Total arrangements divided by the repeats: 5! ÷ (2! × 2!) = 30.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "Permutation: order matters",
        "points": [
          "Arranging, ranking, passwords",
          "nPr = n! ÷ (n − r)!",
          "President, VP, Secretary from 10 people: 720"
        ]
      },
      "b": {
        "title": "Combination: order doesn't",
        "points": [
          "Choosing a team or a committee",
          "nCr = n! ÷ (r! × (n − r)!)",
          "A team of 3 from 10 people: 120"
        ]
      },
      "caption": "Repeated letters: divide by the factorial of each repeat. LEVEL has two Ls and two Es."
    },
    "tryIt": {
      "prompt": "In how many ways can the letters of APPLE be arranged?",
      "options": [
        "60",
        "120",
        "30"
      ],
      "correct": 0,
      "why": "5 letters with P repeated twice: 5! ÷ 2! = 120 ÷ 2 = 60."
    },
    "trap": "Using nPr when order doesn't matter. It over-counts every selection r! times.",
    "sayIt": "Ask: does swapping two choices make a new outcome? Yes means permutation, no means combination."
  },
  {
    "id": "apt-probability",
    "group": "Probability",
    "q": "What is the chance of at least one head in 3 coin tosses?",
    "say": "The words 'at least one' are a hint: work out 1 minus the chance of none.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Chance of NO heads",
          "text": "½ × ½ × ½ = 1/8."
        },
        {
          "title": "At least one head",
          "text": "1 − 1/8 = 7/8."
        },
        {
          "title": "Two dice, sum of 7",
          "text": "6 favourable outcomes out of 36 = 1/6."
        },
        {
          "title": "Independent events",
          "text": "Multiply probabilities for 'and'. Add for 'or' when events can't overlap."
        }
      ]
    },
    "tryIt": {
      "prompt": "Two dice are rolled. What is the probability that at least one shows a six?",
      "options": [
        "1/3",
        "11/36",
        "5/36"
      ],
      "correct": 1,
      "why": "1 − (5/6 × 5/6) = 1 − 25/36 = 11/36."
    },
    "trap": "Adding 1/6 + 1/6 = 1/3. That counts the outcome (6, 6) twice.",
    "sayIt": "'At least one' means 1 minus 'none'."
  },
  {
    "id": "apt-blood-relations",
    "group": "Reasoning",
    "q": "Pointing to a man, Riya says: 'His mother is the only daughter of my mother.' How is the man related to Riya?",
    "say": "Decode from the end of the sentence. 'The only daughter of my mother' is Riya herself.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Start at the end",
          "text": "'Only daughter of my mother' = me (Riya)."
        },
        {
          "title": "Substitute",
          "text": "So 'his mother' = Riya."
        },
        {
          "title": "Answer",
          "text": "The man is Riya's son."
        }
      ],
      "caption": "Draw a mini family tree: ♂ for male, ♀ for female, a horizontal line for siblings, a vertical line for parent and child."
    },
    "tryIt": {
      "prompt": "A is B's sister. C is B's mother. D is C's father. How is A related to D?",
      "options": [
        "Daughter",
        "Granddaughter",
        "Niece"
      ],
      "correct": 1,
      "why": "C is the mother of both A and B. D is C's father, so D is A's grandfather and A is D's granddaughter."
    },
    "trap": "Assuming a gender the question hasn't given. Only 'sibling', 'cousin' or 'child' hide it. Use what the statement tells you.",
    "sayIt": "Decode from the end, substitute 'me' where it fits, and draw the tree."
  }
];
