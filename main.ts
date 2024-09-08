import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { NumberVal, MK_NUMBER, MK_BOOL, MK_NULL } from "./runtime/values.ts";

run("./test_if.txt");

async function run(filename: string) {
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = await Deno.readTextFile(filename);
  const program = parser.produceAST(input);
  const result = evaluate(program, env);
  // console.log(result);
}

function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();

  console.log("\nRepl v0.1");

  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }
    const program = parser.produceAST(input);
    // console.log(program);
    const result = evaluate(program, env);
    // console.log(result);
  }
}
