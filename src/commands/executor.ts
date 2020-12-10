import {Client, Message} from "discord.js";

export type ValidateFunction = (msg: Message) => boolean
export type ExecuteFunction = (msg: Message, args: string[], client : Client) => void

export class executor {
    name : string
    funcExecute : ExecuteFunction;
    funcValidate : ValidateFunction;

    constructor(name : string, funcEx : ExecuteFunction, funcValid : ValidateFunction) {
        this.name = name;
        this.funcValidate = funcValid;
        this.funcExecute = funcEx;
    }

    execute(msg: Message, args: string[], client : Client) : void{
       if(!this.funcValidate(msg)){
           return;
       }
       this.funcExecute(msg,args,client);
    }
}

