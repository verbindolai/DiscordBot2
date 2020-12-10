import {Client, Message} from 'discord.js';

import { commandInterface } from '../commandInterface';
import { executor } from './executor';

class test implements commandInterface{
    name: string = "test";
    ex: executor;

    constructor(){
        this.ex = new executor(this.name, this.executeFunc, this.validateFunc)
    }
    executeFunc(msg: Message, args: string[], client : Client): void {
        msg.channel.send("Test erfolgreich.");
    }
    validateFunc(msg : Message) : boolean{
        return true;
    }
}

module.exports = new test().ex;