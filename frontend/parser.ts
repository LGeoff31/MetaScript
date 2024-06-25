import {
  Stmt,
  Program,
  Expr,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
  Property,
  ObjectLiteral,
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
    switch (this.at().type) {
      case TokenType.Let:

      case TokenType.Const:
        return this.parse_var_declaration();

      default:
        return this.parse_expr();
    }
  }

  // CONST | LET followed by IDENTIFIER; or =
  parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected Identifier name following let | const keyword."
    ).value;
    if (this.at().type == TokenType.Semicolon) {
      this.eat();
      if (isConstant) {
        throw "Must assign value to constant expression. No value provided.";
      }
      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }
    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration."
    );
    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;
    // If want language to end in semi colon
    this.expect(
      TokenType.Semicolon,
      "Variable declaration statement must end with semi colon"
    );
    return declaration;
  }

  // Handle expressions
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }
  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();
    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assignment_expr(); // x = foo = bar (chaining)
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }
    return left;
  }
  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }
    this.eat();
    const properties = new Array<Property>();
    while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
      // {key: val, key2: val}
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected"
      ).value;
      // Allows shothand key: pair -> key -> {key,}
      if (this.at().type == TokenType.Comma) {
        this.eat();
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } else if (this.at().type == TokenType.CloseBrace) {
        //{key}
        properties.push({ key, kind: "Property" });
        continue;
      }

      // {key: val}
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExpr"
      );
      const value = this.parse_expr();
      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property"
        );
      }
    }
    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
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
