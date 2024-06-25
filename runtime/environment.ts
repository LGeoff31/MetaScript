import { MK_BOOL, MK_NULL, RuntimeVal } from "./values.ts";

export function createGlobalEnv() {
  const env = new Environment();
  // This is reference updating
  // Create default global environment
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);
  return env;
}
export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it is already defined`;
    }
    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    // Cannot reassign a constant
    if (env.constants.has(varname)) {
      throw `Cannot reassign to variable ${varname} as it was declared constant.`;
    }
    env.variables.set(varname, value);

    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  private resolve(varname: string): Environment {
    // Check current scope has it
    if (this.variables.has(varname)) {
      return this;
    }

    // If no parent to go up to, it does not exist in global scope
    if (this.parent == undefined) {
      throw `Cannot resolve ${varname} as it does not exist.`;
    }

    // Otherwise, go to parent scope and repeat
    return this.parent.resolve(varname);
  }
}
