import {Client, Message} from 'discord.js';

import { commandInterface } from '../commandInterface';
import { executor } from './executor';

class ehre implements commandInterface{
    name: string = "ehre";
    ex: executor;

    constructor(){
        this.ex = new executor(this.executeFunc, this.validateFunc)
    }
    private executeFunc(msg: Message, args: string[], client : Client): void {
        msg.channel.send("TEST!!!11233.");
    }
    validateFunc(msg : Message) : boolean{
        return true;
    }
}
module.exports = new ehre();