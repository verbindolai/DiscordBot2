import {Client, GuildMember, Message} from 'discord.js';
import { commandInterface } from '../commandInterface';
import { executor } from './executor';

class jutsu implements commandInterface{
    name: string = "jutsu";
    ex: executor;

    constructor(){
        this.ex = new executor(this.executeFunc, this.validateFunc);
    }
    private executeFunc(msg: Message, args: string[], client : Client): void {
        let member : GuildMember | null = msg.member;
        let targetMember : GuildMember | undefined = msg.mentions.members?.first();

        if(targetMember?.voice.channel != undefined && member?.voice.channel != undefined) {
            msg.channel.send('変わり身の術!');
            let memberChannel = member?.voice.channel;
            member?.voice.setChannel(targetMember?.voice.channel);
            targetMember.voice.setChannel(memberChannel)
                .then(r => {})
                .catch(c => {});
        } 
    }
    validateFunc(msg : Message) : boolean{
        return true;
    }
}
module.exports = new jutsu();
