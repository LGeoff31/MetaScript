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
  CallExpr,
  MemberExpr,
  FunctionDeclaration,
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

      case TokenType.Fn:
        return this.parse_fn_declaration();
      default:
        return this.parse_expr();
    }
  }
  parse_fn_declaration(): Stmt {
    this.eat();
    const name = this.expect(
      TokenType.Identifier,
      "Expected function name following fn keyword"
    ).value;
    const args = this.parse_args();
    const params: string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        console.log(arg);
        throw "Inside of function declaration, expected parameters to be of type string.";
      }
      params.push((arg as Identifier).symbol);
    }

    this.expect(
      TokenType.OpenBrace,
      "Expected function body following declaration"
    );
    const body: Stmt[] = [];
    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace
    ) {
      body.push(this.parse_stmt());
    }
    this.expect(
      TokenType.CloseBrace,
      "Closing brace expected inside function declaration"
    );
    const fn = {
      body,
      name,
      parameters: params,
      kind: "FunctionDeclaration",
    } as FunctionDeclaration;

    return fn;
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
    this.expect(
      TokenType.CloseBracket,
      "Object literal missing closing brace."
    );
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
    let left = this.parse_call_member_expr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }
  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();
    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }
    return member;
  }
  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }
    return call_expr;
  }
  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis");
    const args =
      this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();
    this.expect(
      TokenType.CloseParen,
      "Missing closing parenthesis inside arguments list"
    );
    return args;
  }

  private parse_arguments_list(): Expr[] {
    const args = [this.parse_assignment_expr()];
    while (this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_expr());
    }
    return args;
  }

  private parse_member_expr(): Expr {
    let object = this.parse_primary_expr();
    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Expr;
      let computed: boolean;
      if (operator.type == TokenType.Dot) {
        computed = false;
        property = this.parse_primary_expr();
        if (property.kind != "Identifier") {
          throw `Cannot use dot operator without right hand side being a identifier`;
        }
      } else {
        computed = true;
        property = this.parse_expr();
        this.expect(
          TokenType.CloseBracket,
          "Missing closing bracket in computed value."
        );
      }
      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }
    return object;
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

    // Determine which token we are currently at and return literal value
    switch (tk) {
      // User defined values.
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;

      // Constants and Numeric Constants
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      // Grouping Expressions
      case TokenType.OpenParen: {
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis."
        ); // closing paren
        return value;
      }

      // Unidentified Tokens and Invalid Code Reached
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }
}
