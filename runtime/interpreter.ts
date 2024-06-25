import { ValueType, RuntimeVal, NumberVal, MK_NULL } from "./values.ts";
import {
  AssignmentExpr,
  BinaryExpr,
  Identifier,
  NodeType,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import {
  eval_assignment,
  eval_binary_expr,
  eval_identifier,
  eval_object_expr,
} from "./eval/expression.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;

    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    // Handle statements
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      Deno.exit(0);
  }
}
