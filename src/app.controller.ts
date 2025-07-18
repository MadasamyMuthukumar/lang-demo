import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LangChainIntro } from './practice/langchain-intro';
import { Prompts } from './practice/prompts';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }


  @Get()
  getMsg() {
    // const llm = new LangChainIntro();
    // llm.main("do you know about IPL?")
    // return llm;


    const prompts = new Prompts();
    prompts.promptTemplateWithMultiChain("India");
    return prompts;
  }
}
