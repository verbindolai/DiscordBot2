import { request } from "./comm";
import getISOWeek from 'date-fns/getISOWeek'
import isSameDay from 'date-fns/isSameDay'
import parseISO from 'date-fns/parseISO'
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import subMinutes from 'date-fns/subMinutes'
import discord, { Client, GuildChannel, TextChannel } from 'discord.js'
import { MAIN_SERVER_ID } from "../bot";


const MINUTES_BEFORE_LESSON_START = 15;
const MINUTES_IN_HOUR = 60;

const fakultät = "i"
let semsterID = "ss21"
let semester = 3;
const prüfungsOrdnung = "po18"

const splusEinsAPILink = "https://spluseins.de/api/splus/"

const medieninformatikID = `${fakultät}_mei_${prüfungsOrdnung}_${semester}_${semsterID}`
const softwareEngineeringID = `${fakultät}_soe_${prüfungsOrdnung}_${semester}_${semsterID}`
const computerEngineeringID = `${fakultät}_ce_${prüfungsOrdnung}_${semester}_${semsterID}`


async function getTimeTableForWeek(week: number) {
    const meiLessons = request(`${splusEinsAPILink}${medieninformatikID}/${week}`).then(res => JSON.parse(res))
    const soeLessons = request(`${splusEinsAPILink}${softwareEngineeringID}/${week}`).then(res => JSON.parse(res))
    const ceLessons = request(`${splusEinsAPILink}${computerEngineeringID}/${week}`).then(res => JSON.parse(res))

    const data = await Promise.all([meiLessons, soeLessons, ceLessons]);
    const combinedLessonArr = [...data[0].events, ...data[1].events, ...data[2].events];
    const res = Array.from(new Set(combinedLessonArr.map(lesson => lesson.id))).map(id => combinedLessonArr.find(lesson => lesson.id === id));
    return res;
}

function getCurrentTimeTable() {
    const week = getISOWeek(new Date())
    const table = getTimeTableForWeek(week);
    return table;
}

export function getLessonsForDay(day: Date): Promise<any[]> {
    const week = getISOWeek(day);
    const result: any = []
    return new Promise((resolve, reject) => {
        getTimeTableForWeek(week).then(table => {
            for (let lesson of table) {
                const lessonDate = parseISO(lesson.start)
                if (isSameDay(day, lessonDate)) {
                    result.push(lesson);
                }
            }
            resolve(result);
        }).catch(err => reject(err))
    });
}

function getTodaysLessons() {
    return getLessonsForDay(new Date())
}

export function startLessonTimers(client: Client) {
    getTodaysLessons().then(async (lessons) => {
        for (const lesson of lessons) {
            const millisecsTillMessage = differenceInMilliseconds(new Date(), subMinutes(parseISO(lesson.start), MINUTES_BEFORE_LESSON_START))

            let guild = await client.guilds.fetch(MAIN_SERVER_ID)
            let channelMng = guild.channels;

            channelMng.cache.forEach((guildChannel) => {
                let channel: TextChannel | undefined = undefined;
                if (guildChannel.type === "text" && checkMatch(lesson.title, guildChannel.name)) {
                    channel = (guildChannel as TextChannel)
                }

                if (!channel) {
                    return;
                }

                setTimeout(() => {
                    if (channel) {
                        channel.send(createTimeTableEmbed(lesson))
                    }
                }, millisecsTillMessage);
            })
        }
    })
}

function createTimeTableEmbed(lesson: any) {
    let message = new discord.MessageEmbed();

    message.setColor('#0099ff')
    message.setAuthor('Stundenplan')
    message.setTitle(`${lesson.title}`)
    message.description = `Diese Veranstaltung beginnt in ${MINUTES_BEFORE_LESSON_START} Minuten.`
    message.addFields(
        { name: 'Professor', value: lesson.meta.organiserName, inline: true },
        { name: 'Dauer', value: lesson.duration * MINUTES_IN_HOUR + " Minuten", inline: true },
        { name: 'Raum', value: lesson.location, inline: true })
    return message;
}

function checkMatch(a: String, b: String) {
    let result = true;
    let bArr = b.split('-');
    for (let string of bArr) {
        if (a.toUpperCase().match(string.toUpperCase()) == null) {
            result = false;
            break;
        }
    }
    return result
}