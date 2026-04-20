import { StreamLanguage, StringStream } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

function qasmToken(stream: StringStream, state: any): string | null {
  if (stream.eatSpace()) return null;

  const ch = stream.next();

  if (ch === "/") {
    if (stream.eat("/")) {
      stream.skipToEnd();
      return "comment";
    }
  }

  if (ch === '"' || ch === "'") {
    stream.skipTo(ch) || stream.skipToEnd();
    stream.eat(ch);
    return "string";
  }

  if (/[0-9]/.test(ch!)) {
    stream.eatWhile(/[0-9\.]/);
    return "number";
  }

  if (/[a-zA-Z_]/.test(ch!)) {
    stream.eatWhile(/[a-zA-Z0-9_]/);
    const word = stream.current();
    if (["OPENQASM", "include", "qreg", "creg", "gate", "measure", "reset", "barrier", "if", "const"].includes(word)) {
      return "keyword";
    }
    if (["x", "y", "z", "h", "s", "sdg", "t", "tdg", "cx", "cz", "ccx", "rx", "ry", "rz", "u1", "u2", "u3", "id"].includes(word)) {
      return "function";
    }
    return "variableName";
  }

  if (/[\[\]\{\}\(\)\;\,]/.test(ch!)) {
    return "punctuation";
  }

  return null;
}

export const qasmLanguage = StreamLanguage.define({
  name: "qasm",
  startState: () => ({}),
  token: qasmToken,
  tokenTable: {
    comment: t.lineComment,
    string: t.string,
    number: t.number,
    keyword: t.keyword,
    function: t.function(t.variableName),
    variableName: t.variableName,
    punctuation: t.punctuation,
  }
});
