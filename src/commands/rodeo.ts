import {Client, GuildMember, Message, Snowflake} from 'discord.js';
import { commandInterface } from '../commandInterface';
import { executor } from './executor';

class rodeo implements commandInterface{
    ex: executor;
    name: string = "rodeo";
    constructor() {
        this.ex = new executor(this.name, this.executeFunc, this.validateFunc);
    }


    executeFunc(msg: Message, args: string[], client : Client): void {
        let channelIDs : Snowflake[] = [];
        
        msg.guild?.channels.cache.each(channel => {

            if (channel.type === "voice"){
                channelIDs.push(channel.id);
            }

        });

        let member : GuildMember | undefined = msg.mentions.members?.first();

        msg.channel.send(member?.user.username + " is going on a Rodeo!");

        let moving = setInterval( ()=>  {
            let random : number = Math.floor(Math.random() * channelIDs.length)
            
            let changeChannels =  member?.voice.setChannel(channelIDs[random]);

            changeChannels?.catch(()=>{
                console.log("Something went wrong.")
                return;
            })

        }, 150);


        setTimeout(()  => {
            clearInterval(moving);
        }, 2500)

    }
    validateFunc(msg : Message) : boolean{
        if(msg?.member?.hasPermission('ADMINISTRATOR')){
            return true;
        }
        msg.channel.send("You dont have the permission to use this command.")
        return false;
    }
}

module.exports = new rodeo().ex;