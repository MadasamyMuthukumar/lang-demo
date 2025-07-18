import { ChatOpenAI } from "@langchain/openai";
                                                                                                import dotenv from "dotenv";


dotenv.config();

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});



const result = await llm.invoke("What is the capital of India?");

console.log("llm response", result.content);
