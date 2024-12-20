# MetaScript 🌟

MetaScript is a lightweight scripting language designed for educational purposes. It demonstrates fundamental concepts of language design, including tokenizing, parsing, and interpretation.

## Features 🛠️

** Tokenizer 🔍  
Built a lexer to convert source code into an array of tokens. Tokens are categorized into keywords, identifiers, operators, and literals.

** AST Definitions 🌳  
Define the Abstract Syntax Tree (AST) structure. The AST represents the hierarchical syntax of the code, derived from the tokens produced by the lexer.

** Parser 🧩  
Parser to convert tokens into the AST. This component checks code validity and ensures proper syntax based on the language's grammar.

** Interpreter 🚀  
Interpreter to execute code based on the AST. It will handle expression evaluation, statement execution, and control flow management.

## Example Code 💻

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
