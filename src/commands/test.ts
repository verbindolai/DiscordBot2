import {Client, Message} from 'discord.js';
import {command} from '../command';

class test implements command{
    name: string = "test";
    execute(msg: Message, args: string[], client : Client): void {

        if (!this.validation(msg)){
            return;
        }

        msg.channel.send("Test erfolgreich.");
    }
    validation(msg : Message) : boolean{
        return true;
    }
}

module.exports = new test;