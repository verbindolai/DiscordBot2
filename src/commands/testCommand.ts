import {commandInterface} from "./commandInterface";
import {Message,Client} from "discord.js";
import {executor, ExecuteFunction, ValidateFunction} from "./executor";

export class testCommand implements commandInterface {
    ex: executor;
    name: string = "ballern"

    constructor() {
        this.ex = new executor(this.name, this.executeFunc, this.validateFunc);
    }
    executeFunc(msg: Message, args: string[], client: Client): void{

    }
    validateFunc(msg: Message): boolean{
        return false;
    }
}

module.exports = new testCommand().ex


