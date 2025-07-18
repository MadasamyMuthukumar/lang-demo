

import { ChatOpenAI, ChatOpenAIResponseFormat, ChatOpenAIResponses } from "@langchain/openai";
import * as dotenv from "dotenv";
import { ChatPromptTemplate, FewShotPromptTemplate, MessagesPlaceholder, PromptTemplate } from "@langchain/core/prompts";

dotenv.config();

export class LangChainIntro {
    private model: ChatOpenAI;


    constructor() {
        this.model = new ChatOpenAI({
            temperature: 0.5,
            model: "gpt-4o-mini",
        });
    }

    // 1.SIMPLE PROMPT TEMPLATE
    simplePrompt = PromptTemplate.fromTemplate("What is the capital of {country}?");

    // 2.CHAT PROMPT TEMPLATE
    chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant."],
        ["user", "Give me title for this description: {description}"],
    ]);


    //3. Message placeholder - Allows injecting an arbitrary list of messages into a ChatPromptTemplate — great for conversation context.

    chatPrompt2 = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant."],
        new MessagesPlaceholder("history"),
        ["user", "Give me title for this description: {description}"],
    ]);

    //4. few Shot template
    // useful for providing examples:

    /* It will look like below
    // A beautiful sunset over the ocean > Sunset over the ocean

    // A beautiful river in the mountains > River in the mountains

    // Give me title for this description: A beautiful river in the mountains
    */

    fewShotPrompt = new FewShotPromptTemplate({
        examples: [
            {
                input: "A beautiful sunset over the ocean",
                output: "Sunset over the ocean"
            },
            {
                input: "A beautiful river in the mountains",
                output: "River in the mountains"
            }
        ], // provide examples
        examplePrompt: PromptTemplate.fromTemplate("Input: {input} => Output: {output}"), // prompt template for each example
        suffix: "Give me title for this description: {description}", // suffix for the prompt
        inputVariables: ["description"], // input variables for the prompt
    })

    async main(prompt: string) {
        try {
            console.log("Prompt: ", prompt);
            const response = await this.model.invoke(
                // await this.chatPrompt.invoke({ description: "A beautiful sunset over the ocean" })

                // await this.simplePrompt.format({ country: "India" });

                // await this.chatPrompt2.invoke({
                //     description: "A beautiful river in the mountains",
                //     history: [
                //         ["user", "Hello"],
                //         ["assistant", "Hello, how can I help you today?"],
                //     ],
                // })


                await this.fewShotPrompt.invoke({ description: "A beautiful river in the mountains" })
            );
            console.log(response.content);
        } catch (error) {
            console.log("Error: ", error);
        }
    }



}

// Example usage:
const langChain = new LangChainIntro();
(async () => {
    await langChain.main("Say hello to the world!");
})();