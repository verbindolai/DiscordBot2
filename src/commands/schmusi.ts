import discord, {Client, GuildMember, Message} from 'discord.js';
import { commandInterface } from '../commandInterface';
import fs from "fs";
const mariadb = require('mariadb');
const DB = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const pool = mariadb.createPool({
    host: DB.host,
    user: DB.user,
    password: DB.passw,
    database: DB.db,
})

class schmusi implements commandInterface{
    name: string = "schmusi";
    schmusis = new Map();

    constructor(){

    }

    private executeFunc(msg: Message, args: string[], client: Client) : void {
        let recipient = msg.mentions.members?.first();

        if (!recipient){
            this.getAllSchmusis().then((schmusis) => {
                let message = new discord.MessageEmbed();
                message.setColor(1752220)
                message.description = 'Liste aller Schmusis:';
                message.setTitle('Schmusis')
                message.addFields(
                    { name: 'Name', value: "\n", inline: true },
                        { name: 'Schmusis', value: "\n", inline: true },
                )
                for (let schmuser of schmusis){
                    message.fields[0].value += `<@${schmuser.name}>` + '\n';
                    message.fields[1].value += schmuser.count + '\n';
                }
                message.setTimestamp()
                msg.channel.send(message)
            })
            return;
        }

        let recipientID = recipient?.id

        msg.channel.send(`Give a Schmusi to <@${recipientID}>?`).then(async (message) => {
            await message.react('🥰').then(async () => await message.react('🤮'));

            const filter = (reaction : any, user : any) => {
                return ['🥰', '🤮'].includes(reaction.emoji.name);
            };

            message.awaitReactions(filter, {max:100, time: 10000})
                .then(collected => {
                    let upVotes = 0;
                    let downVotes = 0;

                    collected.forEach((reaction) => {
                        console.log(reaction.emoji.name, reaction.count)
                        if (reaction?.emoji.name === '🥰') {
                            if (reaction.count){
                                upVotes += reaction.count;
                            }
                        } else {
                            if (reaction.count) {
                                downVotes += reaction.count;
                            }
                        }
                    })

                    const votes = upVotes + downVotes;



                    if (votes >= 2){
                        if (upVotes > downVotes){
                            this.addSchmusi(recipientID);
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
        })
    }

    private async getAllSchmusis() {
        let conn = await pool.getConnection()
        let data = await conn.query(`SELECT * FROM schmusis`)
        return data;
    }

    private validateFunc(msg : Message) : boolean {
        return true;
    }

    public execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)){
            this.executeFunc(msg, args, client);
        }
    }

    private async getSchmusisFromDB (id : string) {
        let conn = await pool.getConnection()
        let data = await conn.query(`SELECT * FROM schmusis WHERE name='${id}'`)
        let schmuser = data[0];

        if (!schmuser){
            return;
        }
        return schmuser.count;
    }

    private async addSchmusi (id : string) {
        let conn = await pool.getConnection()
        let data = await conn.query(`SELECT * FROM schmusis WHERE name='${id}'`);
        let schmuser = data[0]

        if (!schmuser){
            conn.query(`INSERT INTO schmusis (name, count) VALUES ('${id}',1)`);
        } else {
            conn.query(`UPDATE schmusis SET count=${schmuser.count + 1} WHERE name=${id}`);
        }
    }

}

module.exports = new schmusi();
