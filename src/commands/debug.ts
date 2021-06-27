import discord, { Client, GuildMember, Message } from 'discord.js';
import { commandInterface } from '../interface/commandInterface';

class debug implements commandInterface {

    name: string = "debug";

    constructor() {

    }

    private executeFunc(msg: Message, args: string[], client: Client): void {
        const Embed = new discord.MessageEmbed();
        Embed.setTitle("Server Stats")
        Embed.addField("Server-Name:", msg.guild?.name);
        Embed.addField("Server-ID:", msg.guild?.id);
        Embed.addField("Server-Region:", msg.guild?.region)
        Embed.addField("MemberCount:", msg.guild?.memberCount);

        let members: string = "";

        msg.guild?.members.cache.each(member => {
            members += "Username: " + member.user.username + "\n" +
                "Nickname: " + member.nickname + "\n" +
                "ID: " + member.id + "\n" +
                "Permissions: " + member.permissions + "\n\n";
        })

        Embed.addField("Members (Currently on Server):", members);
        msg.channel.send(Embed);

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

module.exports = new debug();
