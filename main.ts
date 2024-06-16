import Parser from "./frontend/parser.ts";
import Environment from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { NumberVal, MK_NUMBER, MK_BOOL, MK_NULL } from "./runtime/values.ts";

repl();

function repl() {
  const parser = new Parser();
  const env = new Environment();
  // Create some default global enviroment
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  console.log("\nRepl v0.1");
  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }
    const program = parser.produceAST(input);
    // console.log(program);
    const result = evaluate(program, env);
    console.log(result);
  }
}
