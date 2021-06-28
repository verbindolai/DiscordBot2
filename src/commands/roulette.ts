import { Client, GuildMember, Message, Snowflake } from 'discord.js';
import { commandInterface } from '../interface/commandInterface';
import { letOut, lockUp } from '../lib/prison';
import { callWithProbability } from '../lib/probability';

class Roulette implements commandInterface {
    name: string = "roulette";

    private prisonProbability: number = 0.1;

    constructor() {

    }


    private executeFunc(msg: Message, args: string[], client: Client): void {

        let member: GuildMember | null = msg.member;
        let vChannelOfMember = member?.voice.channel;

        if (vChannelOfMember) {
            const size = vChannelOfMember.members.size;
            let winningNames = "";
            vChannelOfMember.members.forEach((guildMember: GuildMember) => {
                if (callWithProbability(this.prisonProbability, () => lockUp(guildMember))) {
                    this.reduceProbability(size);
                    if (guildMember.nickname != null) {
                        winningNames += guildMember.nickname;
                    } else {
                        winningNames += guildMember.user.username;
                    }
                    winningNames += ", ";
                } else {
                    this.increaseProbability(size);
                }
            })
            if (winningNames === "") {
                winningNames = "Nobody"
            }
            else {
                winningNames = winningNames.substring(0, winningNames.lastIndexOf(", "));
            }

            msg.channel.send(winningNames + ' won the Jackpot! Chance of winning the Jackpot is now ' + Math.floor(this.prisonProbability * 100) + "%!");
        }
    }


    private reduceProbability(memberCount: number) {
        const reduceVal = 0.12;

        if (this.prisonProbability - reduceVal < 0) {
            this.prisonProbability = 0;
        } else {
            this.prisonProbability -= reduceVal;
        }

    }

    private increaseProbability(memberCount: number) {
        const increaseVal = 0.05;

        if (this.prisonProbability + increaseVal > 1) {
            this.prisonProbability = 1;
        } else {
            this.prisonProbability += increaseVal;
        }
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

module.exports = new Roulette();
