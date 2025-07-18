//create reasoning and acting agent
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";

import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

import { createReactAgent } from "@langchain/langgraph/prebuilt";

import dotenv from "dotenv";

dotenv.config();

//CHAT MODEL
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});


//TOOLS
const calculator = new Calculator()

const search = new DuckDuckGoSearch({ maxResults: 2 })

//TOOLS CONFIG FOR AGENT
const tools = [calculator, search]


//CREATING THE REACT AGENT
const agent = createReactAgent({
    llm,
    tools,
    prompt: "You are a helpful assistant that can use the calculator and search tools to answer questions.",
    verbose: true,
    agentConfig: {
        maxIterations: 1,
        verbose: true,
    },
    toolConfig: {
        verbose: true,
    }
})



const query = "Who is winner of ipl 2025 in india clear"

const answer = await agent.invoke({ messages: [["human", query]]})


console.log('FULL ANWER', answer)