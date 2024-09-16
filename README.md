# MetaScript 🌟

MetaScript is a lightweight scripting language designed for educational purposes. It demonstrates fundamental concepts of language design, including lexing, parsing, and interpretation.

## Currently Building 🛠️

MetaScript is in active development. Here’s what’s on the roadmap:

** Create a Lexer 🔍  
Develop a lexer to convert source code into an array of tokens. Tokens are categorized into keywords, identifiers, operators, and literals.

** Provide AST Definitions 🌳  
Define the Abstract Syntax Tree (AST) structure. The AST represents the hierarchical syntax of the code, derived from the tokens produced by the lexer.

** Implement a Parser 🧩  
Construct the parser to convert tokens into the AST. This component checks code validity and ensures proper syntax based on the language's grammar.

** Build an Interpreter 🚀  
Create an interpreter to execute code based on the AST. It will handle expression evaluation, statement execution, and control flow management.

## Example Code 💻

Here’s a simple Fibonacci function written in MetaScript:

```plaintext
fn fibonacci (n) {
    if |n <= 2| { return 1 }
    let prev = 1; let curr = 1;
    from 2 to n with i {
        let next_value = prev + curr
        prev = curr 
        curr = next_value
    }
    return curr
}
