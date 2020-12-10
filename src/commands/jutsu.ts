import {Client, GuildMember, Message} from 'discord.js';
import {command} from '../command';

class jutsu implements command{
    name: string = "jutsu"; // !jutsu @Robin
    execute(msg: Message, args: string[], client : Client): void {
        if(!this.validation(msg)){
            return;
        }

        let member : GuildMember | null = msg.member;
        let targetMember : GuildMember | undefined = msg.mentions.members?.first();

        if(targetMember?.voice.channel != undefined && member?.voice.channel != undefined) {
            msg.channel.send('変わり身の術!');
            let memberChannel = member?.voice.channel;
            member?.voice.setChannel(targetMember?.voice.channel);
            targetMember.voice.setChannel(memberChannel);
        } 
    }
    validation(msg : Message) : boolean{
        return true;
    }
}

module.exports = new jutsu;