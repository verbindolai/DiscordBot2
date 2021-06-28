import { GuildMember, Role, VoiceChannel } from "discord.js";

const PRISONER_ROLE_ID = "859019961254281237"
const PRISON_CHANNEL_ID = "858323218086363146"
const PRISON_DURATION = 1000 * 20;

export async function lockUp(member: GuildMember) {

    const roles = member.roles.cache
    const currChannel = member.voice.channel;
    const prisonerRole = member.guild.roles.cache.find(role => role.name === "prisoner")


    if (!roles || !currChannel || !prisonerRole) { return };

    roles.forEach(async (role) => {

        if (role.name !== "@everyone") {
            await member.roles.remove(role).catch(() => console.log("Couldn't remove role."));
        }
    })

    await member.roles.add(prisonerRole).catch(() => { console.log("Couldn't add Prison-Role.") })
    await member.voice.setChannel(PRISON_CHANNEL_ID)

    setTimeout(() => { letOut(member, currChannel, roles, prisonerRole) }, PRISON_DURATION)

}

export async function letOut(member: GuildMember, channel: VoiceChannel, roles: any, prisonerRole: Role) {

    await roles.forEach(async (role: Role) => {

        if (role.name !== "@everyone") {
            await member.roles.add(role).catch(() => { console.log("Couldn't add Role.") });
        }
    })
    await member.roles.remove(prisonerRole).catch(() => { console.log("Couldn't remove Prison-Role.") })

    member.voice.setChannel(channel);
}