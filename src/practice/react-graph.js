//create reasoning and acting agent
import { HumanMessage, SystemMessage, isAIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";


import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

//CHAT MODEL
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

//     {
//         type: "function",
//         function: {
//             name: "add",
//             description: "Add two numbers",
//             parameters: {
//                 type: "object",
//                 properties: {
//                     a: { type: "number", description: "The first number" },
//                     b: { type: "number", description: "The second number" }
//                 },
//                 required: ["a", "b"]
//             }
//         },
//         func: ({ a, b }) => a + b,
//     },
//     {
//         type: "function",
//         function: {
//             name: "subtract",
//             description: "Subtract two numbers",
//             parameters: {
//                 type: "object",
//                 properties: {
//                     a: { type: "number", description: "The first number" },
//                     b: { type: "number", description: "The second number" }
//                 },
//                 required: ["a", "b"]
//             }
//         },
//         func: ({ a, b }) => a - b,
//     },
//     {
//         type: "function",
//         function: {
//             name: "multiply",
//             description: "Multiply two numbers",
//             parameters: {
//                 type: "object",
//                 properties: {
//                     a: { type: "number", description: "The first number" },
//                     b: { type: "number", description: "The second number" }
//                 },
//                 required: ["a", "b"]
//             }
//         },
//         func: ({ a, b }) => a * b,
//     },
//     {
//         type: "function",
//         function: {
//             name: "divide",
//             description: "Divide two numbers",
//             parameters: {
//                 type: "object",
//                 properties: {
//                     a: { type: "number", description: "The numerator" },
//                     b: { type: "number", description: "The denominator" }
//                 },
//                 required: ["a", "b"]
//             }
//         },
//         func: ({ a, b }) => a / b,
//     },
// ];
//TOOLS
const add = tool(({ a, b }) => {
    return a + b;
}, {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
        a: z.number(),
        b: z.number()
    })
})

const subtract = tool(({ a, b }) => {
    return a - b;
}, {
    name: "subtract",
    description: "Add two numbers",
    schema: z.object({
        a: z.number(),
        b: z.number()
    })
})

const multiply = tool(({ a, b }) => {
    return a * b;
}, {
    name: "multiply",
    description: "Add two numbers",
    schema: z.object({
        a: z.number(),
        b: z.number()
    })
})

const divide = tool(({ a, b }) => {
    return a / b;
}, {
    name: "divide",
    description: "Divide two numbers",
    schema: z.object({
        a: z.number(),
        b: z.number()
    })
})

const tools = [add, subtract, multiply, divide]

//TOOL NODE - USED TO INVOKE THE TOOLS
const toolNode = new ToolNode(tools)

//LLM WITH TOOLS - BINDIGN THE TOOLS TO THE LLM
const llmWithTools = llm.bindTools(tools)




//CONDITIONAL EDGES - USED TO DETERMINE THE NEXT NODE TO BE EXECUTED OR NOT
const shouldContinue = async (state) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];

    // if (isAIMessage(lastMessage) && lastMessage.tool_calls?.length) {
    //     return "tools";
    //   }
    //   return "__end__";

    // console.log("--- LAST MESSAGE ---", lastMessage)
    if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
        //IF TOOL CALL PRESENT IN THE RECENT MESSAGE, THEN GO TO THE TOOL NODE
        return "tools";
    }
    //IF NO TOOL CALL PRESENT IN THE RECENT MESSAGE, THEN GO TO THE END NODE
    return END;
}

const systemPrompt = new SystemMessage({
    content: `You are a helpful assistant that can use the calculator. STRICLTY FOLLOW THE BODMAS RULE
    BODMAS RULE:
    1. B: Brackets
    2. O: Orders (Powers and Square Roots, etc.)
    3. D: Division
    4. M: Multiplication
    5. A: Addition
    6. S: Subtraction

    EXAMPLE:
    3+4*2/5+10-11
    = 3+8/5+10-11
    = 3+1.6+10-11
    = 14.6-11
    = 3.6
    `
})

//ASSISTANT NODE - USED TO GENERATE THE RESPONSE (LLM BASED REASONING SETUP)
async function assistant(state) {

    const { messages } = state;
    const msgs = [systemPrompt, ...messages]
    // console.log("--- MESSAGES ---", messages)                                                                                                                                                                                                                               
    const aiResponse = await llmWithTools.invoke(msgs)
    // console.log("--- AI RESPONSE ---", [
    //     ...state.messages,
    //     aiResponse
    // ])
    return { //RETURNING THE AI RESPONSE
        messages: [
            // ...messages,
            aiResponse
        ]
    }
}

// async function toolNodeWithAppend(state) {
//     // Call the tool node as usual
//     const toolResult = await toolNode.invoke(state);
//     // toolResult.messages is an array of ToolMessage(s)
//     return {
//         messages: [...state.messages, ...toolResult.messages]
//     };
// }



// BUILD THE GRAPH
const builder = new StateGraph(MessagesAnnotation)

//ADDING THE NODES TO THE GRAPH
builder.addNode("assistant", assistant)
builder.addNode("tools", toolNode)

//ADDING THE EDGES TO THE GRAPH

builder.addEdge(START, "assistant") // strat from the assistant node

builder.addConditionalEdges("assistant", shouldContinue, ["tools", END]) // if the assistant node returns a 'tools', then go to the tool node, otherwise go to the end node

builder.addEdge("tools", "assistant") //after the tool completes, it sends it result back to assistant


const graph = builder.compile() //compiling the final graph

const query = {
    messages: [new HumanMessage({
        content: "Add 3 and 4. Multiply the output by 2. Divide the output by 5, then addd 10 and subtract 11 from the output"
    })]
}


// const result = await graph.invoke(query)?

//Stream the response
const answerStream = await graph.stream(
    {
        messages: [{
            role: "user", content: "4+10/5*8-6"
        }]
    },
    {
        streamMode: "values", //Emits the entire updated state object (all state fields) after each node in the graph finishes.
    }
)

let i = 0;
for await (const chunk of answerStream) {
    const lastMessage = chunk.messages[chunk.messages.length - 1];
    const type = lastMessage.getType();
    const content = lastMessage.content;
    const toolCalls = lastMessage.tool_calls;
    console.dir({
        i: i++,
        type,
        content,
        toolCalls
    }, { depth: null });
}