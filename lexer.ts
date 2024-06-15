// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

// Supported types
export enum TokenType {
  Number,
  Identifier,
  Equals,
  OpenParen,
  CloseParen,
  BinaryOperator,
  Let,
}

// Variable / User defined types
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
};

export interface Token {
  value: string;
  type: TokenType;
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

// Check if its word
function isAlpha(src: string) {
  return src.toUpperCase() != src.toLocaleLowerCase();
}

// Check if there is excess whitespace
function isSkippable(str: string) {
  return str == " " || str == "\n" || str == "\t";
}

// Check if its a integer
function isInt(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

// Given a text file, return an array of objects which represent each token
export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  // Extract each character one by one
  while (src.length > 0) {
    // Handling tokens of a single character
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else {
      // Handling tokens of multiple characters
      if (isInt(src[0])) {
        let num = "";
        while (src.length > 0 && isInt(src[0])) {
          num += src.shift();
        }
        tokens.push(token(num, TokenType.Number));
      } else if (isAlpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isAlpha(src[0])) {
          ident += src.shift();
        }
        // Check for reversed keywords (Ex. Let)
        const reserved = KEYWORDS[ident];
        if (reserved == undefined) {
          tokens.push(token(ident, TokenType.Identifier));
        } else {
          tokens.push(token(ident, reserved));
        }
      } else if (isSkippable(src[0])) {
        src.shift();
      } else {
        console.log("Unrecognized character found in source: ", src[0]);
        Deno.exit(1);
      }
    }
  }
  return tokens;
}

const source = await Deno.readTextFile("./test.txt");
for (const token of tokenize(source)) {
  console.log(token);
}
