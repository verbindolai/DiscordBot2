import discord, {Client, GuildMember, Message} from 'discord.js';
import { commandInterface } from '../commandInterface';
import { ExecuteFunction, executor, ValidateFunction } from './executor';

class debug implements commandInterface{
    ex: executor;
    name: string = "debug";

    constructor(){
        this.ex = new executor(this.name, this.executeFunc, this.validateFunc);
    }

    executeFunc(msg: Message, args: string[], client: Client) : void {
        const Embed = new discord.MessageEmbed();
        Embed.setTitle("Server Stats")
        Embed.addField("Server-Name:", msg.guild?.name);
        Embed.addField("Server-ID:", msg.guild?.id);
        Embed.addField("Server-Region:", msg.guild?.region)
        Embed.addField("MemberCount:", msg.guild?.memberCount);
        
        let members : string = "";

        msg.guild?.members.cache.each(member => {
            members += "Username: "+member.user.username + "\n" + 
            "Nickname: "+member.nickname + "\n" + 
            "ID: "+member.id + "\n" +
            "Permissions: "+member.permissions + "\n\n";
        })

        Embed.addField("Members (Currently on Server):", members);
        msg.channel.send(Embed);
    }
    validateFunc(msg : Message) : boolean {
        return true;
    }
}

module.exports = new debug().ex;