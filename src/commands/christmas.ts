import {Client, GuildMember, Message, VoiceConnection} from 'discord.js';
import {command} from '../command';
import ytdl from 'ytdl-core';

class christmas implements command{
    name: string = "christmas"; // !jutsu @Robin
    execute(msg: Message, args: string[], client : Client): void {

        if (!this.validation(msg)){
            return;
        }
        

        let member : GuildMember | null = msg.member;
        let botMember : GuildMember | undefined;
        member?.voice.channel?.join().then(() => {
            if(client?.user?.id !== undefined){
                botMember = msg.guild?.members.cache.get(client?.user?.id);
                client.user?.setAvatar('https://i.pinimg.com/600x315/e1/21/27/e12127c3afa81b2d8b095ee2061b3f49.jpg');
                botMember?.setNickname("Weihnachtolai");
            }

            

            function play (connection : VoiceConnection) {
                const soundStream = ytdl('https://www.youtube.com/watch?v=2SGpCmL_Hvc', { quality: 'highestaudio' });
                const dispatcher = connection.play(soundStream);
                dispatcher.on('finish', () => {
                    play(connection);
                })
            }


            if(botMember?.voice.connection !== undefined && botMember?.voice.connection !== null){
                play(botMember?.voice?.connection);
            }
        });  
        
    }
    validation(msg : Message) : boolean{
        return true;
    }
}

module.exports = new christmas;