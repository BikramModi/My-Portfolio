import { ragTool }
from "./rag.tool.js";

import { calculatorTool }
from "./calculator.tool.js";

import { githubTool }
from "./github.tool.js";

const registry=new Map();

registry.set(ragTool.name,ragTool);

registry.set(calculatorTool.name,
calculatorTool);

registry.set(githubTool.name,
githubTool);

export function getTool(name){

    return registry.get(name);

}