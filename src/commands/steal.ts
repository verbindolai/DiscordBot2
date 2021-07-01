import { Client, GuildMember, Message } from 'discord.js';
import { commandInterface } from '../interface/commandInterface';
import { Schmuser } from '../lib/schmuser';

class Steal implements commandInterface {
    name: string = "steal";

    constructor() {
    }
    private executeFunc(msg: Message, args: string[], client: Client): void {
        let member: GuildMember | null = msg.member;
        let targetMember: GuildMember | undefined = msg.mentions.members?.first();

        if (!member) {
            return;
        }

        const schmuserPromise = Schmuser.getSchmuserByID(member?.id)
        schmuserPromise.then((schmuser) => {
            if (targetMember) {
                schmuser.stealSchmusi(targetMember.id).then(stolen => {
                    if (stolen) {
                        msg.channel.send(`${member?.nickname} stole a Schmusi from ${targetMember?.nickname} 😱`);
                    } else {
                        msg.channel.send(`${member?.nickname} tried to steal a Schmusi from ${targetMember?.nickname} but failed 😏`);
                    }
                }).catch(err => msg.channel.send(`Couldn't find that user, maybe he hasn't got a Schmusi yet ... :/`))
            }
        }).catch(err => console.log(err))
    }

    private validateFunc(msg: Message): boolean {
        return true;
    }

    execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)) {
            this.executeFunc(msg, args, client);
        }
    }
}
module.exports = new Steal();
