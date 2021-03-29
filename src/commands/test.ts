import {Client, Message} from 'discord.js';

import { commandInterface } from '../commandInterface';
import { executor } from './executor';

class test implements commandInterface{
    name: string = "test";

    constructor(){
    }
    private executeFunc(msg: Message, args: string[], client : Client): void {
        msg.channel.send("Test erfolgreich....");
    }
    private validateFunc(msg : Message) : boolean{
        return true;
    }
    execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)){
            this.executeFunc(msg, args, client);
        }
    }
}

module.exports = new test();
