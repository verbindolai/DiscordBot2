import {Client, Message} from "discord.js";

export interface commandInterface {
    name : string
    execute(msg: Message, args: string[], client: Client) : void;
}

