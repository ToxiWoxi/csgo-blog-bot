console.clear()
import * as fs from 'fs';
import { Client, Events, IntentsBitField, EmbedBuilder } from 'discord.js';
import * as dotenv from 'dotenv'
dotenv.config()
// Bot token
const tokenENV = process.env.BLOGBOT_TOKEN
// User ID (DMs the owner)
const userENV = process.env.BLOGBOT_USER.toString()
// Channnel ID (must be announcement channel)
const channelENV = process.env.BLOGBOT_CHANNEL.toString()
const client = new Client({ intents: new IntentsBitField(36865) });
let current = Number(fs.readFileSync('./current', 'utf8'))

function incNum() {
    current++
    fs.writeFileSync('./current', current.toString(), { encoding: 'utf8', flag: 'w' })
}
function publicEmbed (id) {
    return new EmbedBuilder()
    .setColor(0x188fef)
    .setURL(`https://blog.counter-strike.net/index.php/0000/00/${id}/`)
    .setTitle('New public post detected!')
    .setDescription(`Id: \`${id}\``)
    .setThumbnail('https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/69f7ebe2735c366c65c0b33dae00e12dc40edbe4.jpg')
}
function hiddenEmbed (id) {
    return new EmbedBuilder()
    .setColor(0xffff00)
    .setThumbnail('https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/69f7ebe2735c366c65c0b33dae00e12dc40edbe4.jpg')
    .setTitle('New blog activity detected!')
    .setDescription(id.length >= 2 ? `Ids: \`${id[0]}\` - \`${id[id.length - 1]}\`` : `Id: \`${id}\``)
}

async function fetchCheck(id) {
    return new Promise (resolve => {
        fetch(`https://blog.counter-strike.net/wp-json/wp/v2/categories?post=${id}`)
            .then(res => res.json()) 
            .then(json => {
                if (json.data?.status) {
                    if (json.data.status === 400) {
                        resolve(0)
                    } else {
                        resolve(json.data.status)
                    }
                } else resolve(300)
            })
            .catch(err => {
                console.log(err)
                resolve(0)
            })
    })
}

/* 
    When ready, do the thing
*/
client.once(Events.ClientReady, async (bot) => {
    let user = await bot.users.fetch(userENV)
    let channel = await bot.channels.fetch(channelENV)

    let hiddenIds = []
    let recentDetection = false
    async function sendHidden () {
        new Promise(resolve => {
            if (hiddenIds.length) {
                let currentEmbed = hiddenEmbed(hiddenIds)
                hiddenIds = []
                user.send({embeds: [currentEmbed]})
                channel.send({embeds: [currentEmbed]}).then(message => {
                    message.crosspost()
                        .then(resolve())
                })
            } else {resolve()}
        })
    }

    async function sendPublic(id) {
        new Promise(resolve => {
            if (id) {
                let currentEmbed = publicEmbed(current)
                user.send({embeds: [currentEmbed]})
                channel.send({embeds: [currentEmbed]}).then(message => {
                    message.crosspost()
                        .then(resolve())
                })
            } else {resolve()}
        })
    }

    // Fetch loop
    setInterval(async () => {
        await fetchCheck(current).then(async (res) => {
            // Nothing with ID; check one further in case a number is skipped.
            if (!res) {
                await fetchCheck(current + 1).then((res) => {
                    if (res) {
                        incNum()
                        sendHidden()
                    }
                })
            }
            // Hidden activity
            if (res === 401) {
                console.log(`hidden - ${current}`)
                hiddenIds.push(current)
                recentDetection = true
                incNum()
            }
            // Public blog post
            if (res === 300) {
                console.log(`public - ${current}`)
                sendHidden().then(() => {
                    sendPublic(current)
                })
                incNum()
            }
        })

    }, 1000)
    
    // Send loop
    setInterval(async () => {
        if (recentDetection) {
            recentDetection = false
        } else {
            sendHidden()
        }
    }, 5000)
});

client.login(tokenENV);