import {commandInterface} from "../commandInterface";
import discord, {Message,Client} from "discord.js";
import {executor, ExecuteFunction, ValidateFunction} from "./executor";


export class testCommand implements commandInterface {

    name: string = "ballern"

    constructor() {

    }
    private executeFunc(msg: Message, args: string[], client: Client): void{
        console.log(msg.guild?.members);
    }
    private validateFunc(msg: Message): boolean{
        return true;
    }

    execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)){
            this.executeFunc(msg, args, client);
        }
    }

}

module.exports = new testCommand();


