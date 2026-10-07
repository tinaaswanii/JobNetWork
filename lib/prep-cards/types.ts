// Shape of one interview-prep card. Every subject (DBMS, SQL, OS...) is just
// an array of these, rendered by components/PrepCards.tsx.

export type Side = { title: string; points: string[] };

export type Picture = {
  caption?: string; // one line under the picture
  code?: string; // optional SQL / code block
} & (
  | { kind: "chips"; items: { label: string; note: string }[] } // tap each chip
  | { kind: "compare"; a: Side; b: Side } // A vs B
  | { kind: "steps"; steps: { title: string; text: string }[] } // step-through
  | { kind: "table"; head: string[]; rows: string[][] }
);

export type PrepCard = {
  id: string;
  group: string; // small label, e.g. "Keys"
  q: string; // the question, in an interviewer's words
  say: string; // the one-line answer to say first
  picture: Picture;
  tryIt: {
    prompt: string;
    options: string[];
    correct: number; // index into options
    why: string;
  };
  trap: string; // the common mistake
  sayIt: string; // a sentence to say out loud in the interview
};
