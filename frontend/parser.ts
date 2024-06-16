import {
  Stmt,
  Program,
  Expr,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  NullLiteral,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

// Produce a valid AST from file input
export default class Parser {
  private tokens: Token[] = [];

  // Check if parsing is complete
  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  // Return currently available token
  private at() {
    return this.tokens[0] as Token;
  }

  // Return currently available token and delete it
  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  // Same as eat() except it throws a error if the token type is not as expected
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error: \n", err, prev, "Expecting: ", type);
      Deno.exit(1);
    }
    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [], //array of statements
    };

    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  // Handle complex statement types
  private parse_stmt(): Stmt {
    // Skip to parse_expr for now
    return this.parse_expr();
  }

  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_additive_expr();
  }

  // Handle addition & subtraction operations
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Handle multiplication, division, and modulo operations
  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Order of Prescidence

  // AssignmentExpr
  // MemberExpr
  // FunctionCall
  // LogicalExpr -> (AND / OR)
  // ComparisonExpr
  // AdditiveExpr
  // MultiplicataveExpr
  // UnaryExpr
  // PrimaryExpr -> first

  // Parse literal values & grouping expressions
  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Null:
        this.eat(); // Advance past null keyword
        return { kind: "NullLiteral", value: "null" } as NullLiteral;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen: {
        this.eat();
        const value = this.parse_expr();
        this.expect(TokenType.CloseParen, "Expected closing parenthesis ");
        return value;
      }
      default:
        console.error("Unexpected token foudn during parsing!", this.at());
        Deno.exit(1);
    }
  }
}
