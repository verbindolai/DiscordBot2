import {commandInterface} from "../commandInterface";
import discord, {Message,Client} from "discord.js";
import {executor, ExecuteFunction, ValidateFunction} from "./executor";


export class testCommand implements commandInterface {
    ex: executor;
    name: string = "ballern"

    constructor() {
        this.ex = new executor(this.name, this.executeFunc, this.validateFunc);
    }
    executeFunc(msg: Message, args: string[], client: Client): void{
    
        console.log(msg.guild?.members);

    }
    validateFunc(msg: Message): boolean{
        return true;
    }
}

module.exports = new testCommand().ex


