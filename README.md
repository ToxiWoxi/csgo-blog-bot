# [Deprecated]
With the anouncement of Counter-Strike 2, Valve finally switched to a new blog website. This does not use WordPress and therefore can't be watched in the same way. As of now, I do not intend on making a new blog tracker.

# CSGO Blog Activity Discord Bot
Uses [discord.js](https://discord.js.org/#/), which does not currently work with Bun.

## How it works
Every second, the next 2 IDs are checked from `https://blog.counter-strike.net/wp-json/wp/v2/categories?post=<ID>`.  
If the request returns no error, a public post is detected.  
If the request returns with a `400` error, no post is detected.  
If the request returns with a `401` error, hidden activity is detected. It is then ran through a second endpoint (`https://blog.counter-strike.net/wp-json/wp/v2/posts/<ID>`). If this request returns with a `401` error, that activity is a new hidden post.   


CSGO's blog uses wordpress, which works with a revision system. Any time any blogpost is updated in any way, a new ID is formed.

## Usage
You can join our public server ***[here](https://discord.gg/sbpYNDKgHW)***, or run the bot yourself.

If you want to run it yourself, clone this repository and create a `.env` file containing:  
`BLOGBOT_TOKEN` - the token of your discord bot  
`BLOGBOT_USER` - YOUR discord user ID (you must be in a server with the bot)  
`BLOGBOT_CHANNEL` - A channel where you want the bot to send messages.  
