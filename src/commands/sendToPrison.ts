import { Client, GuildMember, Message, Snowflake } from 'discord.js';
import { commandInterface } from '../interface/commandInterface';
import { lockUp } from '../lib/prison';

class SendToPrison implements commandInterface {
    name: string = "prison";

    constructor() {
    }


    private executeFunc(msg: Message, args: string[], client: Client): void {

        let member: GuildMember | undefined = msg.mentions.members?.first();

        if (member) { lockUp(member); }

    }
    private validateFunc(msg: Message): boolean {
        if (msg?.member?.hasPermission('ADMINISTRATOR')) {
            return true;
        }
        msg.channel.send("You dont have the permission to use this command.")
        return false;
    }

    execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)) {
            this.executeFunc(msg, args, client);
        }
    }

}

module.exports = new SendToPrison();
