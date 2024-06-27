// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------

// Supported types
export enum TokenType {
  // Literal Types
  Number,
  Identifier,

  // Keywords
  Let,
  Const,

  //Grouping + Operators
  Equals,
  Comma,
  Dot,
  Colon,
  Semicolon,
  OpenParen, //(
  CloseParen, //)
  OpenBrace, //[]
  CloseBrace, //]
  OpenBracket, //[]
  CloseBracket, //]
  BinaryOperator,
  EOF,
}

// Variable / User defined types
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
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
  return str == " " || str == "\n" || str == "\t" || str == "\r";
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
    } else if (src[0] == "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace));
    } else if (src[0] == "[") {
      tokens.push(token(src.shift(), TokenType.OpenBracket));
    } else if (src[0] == "]") {
      tokens.push(token(src.shift(), TokenType.CloseBracket));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/" ||
      src[0] == "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] == ";") {
      tokens.push(token(src.shift(), TokenType.Semicolon));
    } else if (src[0] == ":") {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (src[0] == ",") {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else if (src[0] == ".") {
      tokens.push(token(src.shift(), TokenType.Dot));
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
        if (typeof reserved == "number") {
          tokens.push(token(ident, reserved));
        } else {
          tokens.push(token(ident, TokenType.Identifier));
        }
      } else if (isSkippable(src[0])) {
        src.shift();
      } else {
        console.log("Unrecognized character found in source: ", src[0]);
        Deno.exit(1);
      }
    }
  }
  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
