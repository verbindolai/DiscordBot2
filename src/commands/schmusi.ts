import discord, {Client, GuildMember, Message} from 'discord.js';
import { commandInterface } from '../commandInterface';
import fs from "fs";
import {PoolConnection} from "mariadb";
const mariadb = require('mariadb');
const DB = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const pool = mariadb.createPool({
    host: DB.host,
    user: DB.user,
    password: DB.passw,
    database: DB.db,
})

export class Schmuser {

    private id : string;
    private schmusiCount : number;
    private lastSchmusiDate : number;
    private dailySchmusis : number;

    constructor(id : string, schmusiCount : number, lastSchmusiDate : number, dailySchmusis : number) {
        this.id = id;
        this.schmusiCount = schmusiCount;
        this.lastSchmusiDate = lastSchmusiDate;
        this.dailySchmusis = dailySchmusis;
    }

}

class schmusi implements commandInterface{

    name: string = "schmusi";
    schmusis = new Map();

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
                            if (this.checkSchmusi(this.getSchmuser(recipientID), pool.getConnection(), recipientID)) {
                                this.addSchmusi(recipientID,1);
                            }
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

    /**
     * Returns all Schmuser from the DB
     * @private
     */
    private async getAllSchmusis() {
        let conn = await pool.getConnection()
        let data = await conn.query(`SELECT * FROM schmusis`)
        return data;
    }

    /**
     * Gets a specific Schmuser by ID
     * @param id
     * @private
     */
    private async getSchmuser(id : string){
        let conn = await pool.getConnection()
        let data = await conn.query(`SELECT * FROM schmusis WHERE name='${id}'`)
        let schmuser = data[0];

        return schmuser;
    }

    /**
     * Adds or removes Schmusis from the Schmuser
     * @param id DiscordID of the user
     * @param num Numbers of Schmusis which should be added, can be negative.
     * @private
     */
    private async addSchmusi (id : string, num : number) {
        let conn = await pool.getConnection()
        let data = await conn.query(`SELECT * FROM schmusis WHERE name='${id}'`);
        let schmuser = data[0]

        if (!schmuser){
            conn.query(`INSERT INTO schmusis (name, count) VALUES ('${id}',${num})`);
        } else {
            conn.query(`UPDATE schmusis SET count=${schmuser.count + num} WHERE name=${id}`);
        }
    }

    /**
     *
     * @param schmuser
     * @param conn
     * @param id
     * @private
     */
    private checkSchmusi(schmuser : any, conn : PoolConnection, id : string) : boolean{

        const date = schmuser.date;
        const DAY_IN_MS = 86400000;

        if (date) { //User has give a Schmusi some time before;
            if (schmuser.dailys > 0) {
                this.changeDailys(conn, id,schmuser.dailys - 1);
                return true;
            } else {
                if (Date.now() <= date + DAY_IN_MS) {
                    this.changeDailys(conn, id,1);
                    return true;
                } else {
                    return false;
                }
            }
        } else { //User has never give a Schmusi
            this.changeDailys(conn, id,schmuser.dailys - 1);
            return true;
        }
    }

    /**
     *
     * @param conn
     * @param id
     * @param num
     * @private
     */
    private changeDailys(conn : PoolConnection, id : string, num : number){
        conn.query(`UPDATE schmusis SET dailys=${num} WHERE name=${id}`);
        conn.query(`UPDATE schmusis SET date=${Date.now()} WHERE name=${id}`);
    }

    /**
     * Validates if the user can use the Command.
     * @param msg
     * @private
     */
    private validateFunc(msg : Message) : boolean {
        return true;
    }

    /**
     * Executes the command if the user is allowed.
     * @param msg
     * @param args
     * @param client
     */
    public execute(msg: Message, args: string[], client: Client) {
        if (this.validateFunc(msg)){
            this.executeFunc(msg, args, client);
        }
    }
}

module.exports = new schmusi();
