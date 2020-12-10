
import discord, { Client, GuildMember, Message } from 'discord.js';

 export interface command {
    name : string;
    execute(msg : Message, args: string[] , client : Client) : void;
    validation(msg : Message) : boolean;
} 
 