import discord, { Client, GuildMember, Message } from 'discord.js';
import { commandInterface } from '../interface/commandInterface';
import fs from "fs";
import { Schmuser } from '../lib/schmuser';

const MIN_VOTES_NEEDED = 2;

class Schmusi implements commandInterface {
    name: string = "schmusi";
    schmusis = new Map();

    constructor() {

    }

    private executeFunc(msg: Message, args: string[], client: Client): void {
        let recipient = msg.mentions.members?.first();

        if (!recipient) {
            this.listAllSchmusers(msg);
            return;
        }
        this.giveSchmusi(msg, recipient.id)
    }


    private giveSchmusi(msg: Message, recipientID: string) {
        msg.channel.send(`Give a Schmusi to <@${recipientID}>?`).then(

            async (message) => {

                await message.react('🥰').then(
                    async () => await message.react('🤮'));

                const filter = (reaction: any, user: any) => {
                    return ['🥰', '🤮'].includes(reaction.emoji.name);
                };

                message.awaitReactions(filter, { max: 100, time: 20000 })
                    .then(collected => {
                        let upVotes = 0;
                        let downVotes = 0;

                        collected.forEach((reaction) => {
                            console.log(reaction.emoji.name, reaction.count)
                            if (reaction?.emoji.name === '🥰') {
                                if (reaction.count) {
                                    upVotes += reaction.count;
                                }
                            } else if (reaction?.emoji.name === '🤮') {
                                if (reaction.count) {
                                    downVotes += reaction.count;
                                }
                            }
                        })

                        const votes = upVotes + downVotes;

                        if (votes >= MIN_VOTES_NEEDED) {
                            if (upVotes > downVotes) {
                                Schmuser.getSchmuserByID(recipientID).then(schmuser => {
                                    schmuser.addSchmusi(1);
                                }).catch(() => {
                                    Schmuser.createSchmuserInDB(recipientID).then(schmuser => {
                                        schmuser.addSchmusi(1);
                                    });

                                });

                                msg.channel.send(`<@${recipientID}> gets a Schmusi! 🥰`)
                            } else {
                                msg.channel.send(`<@${recipientID}> doesn't get a Schmusi.. 😟`)
                            }
                        } else {
                            msg.channel.send(`Not enough Votes to give <@${recipientID}> a Schmusi.`)
                        }
                    })
                    .catch(collected => {

                    });
            }
        )
    }

    private listAllSchmusers(msg: Message) {
        Schmuser.getAllSchmusers().then((allSchmusers: Schmuser[]) => {
            if (!allSchmusers || allSchmusers.length < 1) {
                msg.channel.send('Noone has a Schmusi yet..');
                return;
            }

            let message = new discord.MessageEmbed();
            message.setColor(1752220)
            message.description = 'Liste aller Schmusis:';
            message.setTitle('Schmusis')
            message.addFields(
                { name: 'Name', value: "\n", inline: true },
                { name: 'Schmusis', value: "\n", inline: true },
            )
            for (const schmuser of allSchmusers) {
                message.fields[0].value += `<@${schmuser.discordID}>` + '\n';
                message.fields[1].value += schmuser.schmusis + '\n';
            }
            message.setTimestamp()
            msg.channel.send(message)
        }).catch(err => console.error(err));
    }

    private validateFunc(msg: Message): boolean {
        return true;
    }

    public execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)) {
            this.executeFunc(msg, args, client);
        }
    }

}

module.exports = new Schmusi();
