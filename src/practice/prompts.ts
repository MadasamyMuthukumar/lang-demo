import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { LLMChain, SimpleSequentialChain } from "langchain/chains";
import { finalizeIssue } from "zod/v4/core/util.cjs";
dotenv.config();

export class Prompts {
    private model: ChatOpenAI;
    constructor() {
        this.model = new ChatOpenAI({
            temperature: 0.5,
            model: "gpt-4o-mini",
        });
    }


    async promptTemplateWithMultiChain(country: string) {

        const promptTemplate1 = PromptTemplate.fromTemplate("What is the capital of {country}?. return exactly just name of the city");
        const promptTemplate2 = PromptTemplate.fromTemplate("List top 3 tourist or must visit places in the {city}. in bullet points");


        const chain1 = promptTemplate1.pipe(this.model);

        // Mapping step: take the output and wrap it as { city: ... }
        const mapToCity = async (capital: any) => {
            // If using OpenAI, the result is usually in capital.content
            const city = typeof capital === "string" ? capital : capital.content;
            return { city };
        };

        const chain2 = promptTemplate2.pipe(this.model);

        const overallChain = RunnableSequence.from([
            chain1,
            mapToCity,
            chain2
        ]);

        try {
            const response = await overallChain.invoke({ country: country })
            console.log(response.content);
        } catch (error) {
            console.error(error);
        }

    }


}