import {Client, Message} from "discord.js";

export type ValidateFunction = (msg: Message) => boolean;
export type ExecuteFunction = (msg: Message, args: string[], client : Client) => void;

export class executor {
    funcExecute : ExecuteFunction;
    funcValidate : ValidateFunction;

    constructor(funcEx : ExecuteFunction, funcValid : ValidateFunction) {
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

