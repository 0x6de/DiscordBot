// Load up libraries
const Discord = require('discord.js');
const snoowrap = require('snoowrap');
const request = require('request');

//config files
const config = require("./config.json");
const confInfo = require("./oauth_info.json");
const confBanlist = require("./banlist.json");
// Var testbot
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');
var xhr = new XMLHttpRequest();
var CurrentUrl = 'currenturl';
var LastUrl = 'lasturl';
var LastUrlBanned = 'lasturlbanned';
var CurrentStream = 'currentstream';
var LastStream = 'laststream';
var CurrentPatch = "CurrentPatch";
var LastPatch = "LastPatch";
var CurrentBan = 0;
var cacheTitre;
var urlfin;


//Reddit auth
const r = new snoowrap({
  userAgent: confInfo.user_agent,
  clientId: confInfo.client_id,
  clientSecret: confInfo.client_secret,
  username: confInfo.username,
  password: confInfo.password
});
//Discord Client
const client = new Discord.Client();

//
// BOT START
//
  // This event will run if the bot starts, and logs in, successfully.
client.on("ready", () => {
  // client.channels.get('337987760025763840').send(` :white_check_mark:  Bip Bop ! - ${client.readyAt}` );
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds. - ${client.readyAt} `);

  //
  // Reddit games Function
  //
  function checkLink() {
  tickRate2 = 60000

  //check new post
    r.getSubreddit('FreeGameFindings').getNew({limit: 1}).then(posts => {
     CurrentTitle = posts.map(post => post.title);
     CurrentUrl = posts.map(post => post.url);
     CurrentPermalink = posts.map(post => post.permalink);
     if (CurrentUrl[0].toString() === LastUrl.toString() || CurrentUrl[0].toString() === LastUrlBanned.toString()) {
     } else if (CurrentUrl[0].toString() !== LastUrl.toString()) {  
        if (CurrentUrl[0].toLowerCase().indexOf("humblebundle.com/store/") > -1  || CurrentUrl[0].toLowerCase().indexOf("gog.com") > -1 || CurrentUrl[0].toLowerCase().indexOf("store.steampowered.com/app") > -1 )  {
          for ( i = 0; i < confBanlist.length; i++ ) {                
            if (CurrentTitle[0].toLowerCase().indexOf(confBanlist[i]) > -1 ){
              console.log("banned : " + CurrentTitle[0]);
              LastUrlBanned = CurrentUrl[0];
              CurrentBan = 1;               
            }
          }
          if (CurrentBan == 0 ) {
            if (CurrentTitle[0].toLowerCase().indexOf("dlc") > -1) {
              client.channels.get('337987760025763840').send( " @everyone Nouveau DLC gratuit :   \n " + CurrentUrl[0] );
              console.log("message DLC: " + CurrentUrl[0]+"\ntitle: "+CurrentTitle[0]+"\nlink: "+ CurrentPermalink[0]);
              LastUrl = CurrentUrl[0];
            } else {
               // send message in channel and set lasturl           
               if(CurrentUrl[0].toLowerCase().indexOf("store.steampowered.com/app") > -1){
                 var UrlParts = CurrentUrl[0].split("/");
                 var InstallUrl = "steam://store/" + UrlParts[4];
                client.channels.get('337987760025763840').send( " @everyone Nouveau jeu steam gratuit :   \n " + CurrentUrl[0] + "\n Ouvrir avec steam : " + InstallUrl );
                console.log("message jeu steam: " + CurrentUrl[0]+"\ntitle: "+CurrentTitle[0]+"\nlink: "+ CurrentPermalink[0]);
                console.log("steam id url : " + InstallUrl);
                LastUrl = CurrentUrl[0];
               }else {
                client.channels.get('337987760025763840').send( " @everyone Nouveau jeu gratuit :   \n " + CurrentUrl[0] );
                console.log("message jeu: " + CurrentUrl[0]+"\ntitle: "+CurrentTitle[0]+"\nlink: "+ CurrentPermalink[0]);
                LastUrl = CurrentUrl[0];
               }
            }
          } else {
            CurrentBan = 0;
          }
        }
      }
  }).catch({statusCode: 401}, e => {
    console.log("oauth games error !");
  });
  setTimeout(checkLink, tickRate2);
};

checkLink();
  //
  // Reddit Patch Function
  //
  function checkPatch() {
    PatchRate = 60000
    r._get({uri:
      'r/DotA2/search?q=Dota%202%20Update%20AND%20(author:sirbelvedere%20OR%20author:Magesunite%20OR%20author:Cyborgmatt)&restrict_sr=on&sort=new&t=week'
    }).map(post => post.url).then((Patch) => {
        CurrentPatch = Patch[0] ;
        Patchfix = Patch.toString().split(',');
        if (CurrentPatch.toString() === LastPatch.toString()) {

        } else if (CurrentPatch.toString() !== LastPatch.toString()) {
          // send message in channel and set LastPatch
          Patchfin = Patchfix[0];
          client.channels.get('381493167981199361').send( " Nouveau patchnote :  :notepad_spiral:  \n " + Patchfin );

          LastPatch = CurrentPatch;
        }
      }).catch({statusCode: 401}, e => {
        console.log("oauth checkpatch error !");
      });
    setTimeout(checkPatch, PatchRate);
    };
  // checkPatch();


  //
  //Twitch Functions
  //
  function checkStream() {
    tickRate = 30000
    var xhr = new XMLHttpRequest()
    xhr.open("GET", "https://api.twitch.tv/kraken/streams/"+ confInfo.twitch_stream +"?client_id="+confInfo.twitch_id, true)
    xhr.onreadystatechange = function () {
      if(xhr.readyState == 4) {
        try {
        var data = JSON.parse(xhr.responseText)
        if(data["stream"] != null && data["stream"] != undefined){
          CurrentStream = data["stream"]["created_at"];
          if (CurrentStream.toString() === LastStream.toString()) {

          } else if (CurrentStream.toString() != LastStream.toString()) {
              cacheJeu = data["stream"]["game"];
              cacheLien = data["stream"]["channel"]["url"];
              cacheTitre = data["stream"]["channel"]["status"];
              client.channels.get('387261264084074497').send( cacheTitre + "\n" + cacheJeu + "\n" + cacheLien );
              console.log("message stream ON !");

              LastStream = CurrentStream;
          }
        } else if (data["stream"] === undefined) {
          console.log("twitch api down !");
        }
      } catch (e) {
          console.log("failed to parse json");
        }
      setTimeout(checkStream, tickRate)
      }
    }
    xhr.send()
  }
  checkStream();

  // Set the bot Name's and game's
  client.user.setGame(`Bot Simulator ${client.guilds.size} `);
  client.user.setUsername(`George Abitbol`);

});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setGame(`Bot Simulator ${client.guilds.size} `);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setGame(`Bot Simulator ${client.guilds.size} `);
});


//
// BOT COMMANDS
//

// This event will run on every single message received, from any channel or DM.
client.on("message", async message => {
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  // Also good practice to ignore any message that does not start with our prefix
  if(message.content.indexOf(config.prefix) !== 0) return;
  // separate our "command" name, and our "arguments" for the command.
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  // return commands
  if(command === "help") {
    message.reply("\
     \n :small_blue_diamond: /ping -> Ping the bot to check the latency.\
     \n :small_blue_diamond: /uptime -> Bot uptime in a clean format.\
     \n :small_blue_diamond: /banlist -> Show the current banlist.\
     \n :small_blue_diamond: /banlistadd -> Add a game to the banlist.\
     \n :small_blue_diamond: /random -> Random la classe americaine.");
  }
  // return bot uptime
  if (command === "uptime") {
    message.reply(`The bot is up since :  ${client.readyAt}`);
  }
  // LUL
  if(command === "random") {
    Array.prototype.sample = function(){
      return this[Math.floor(Math.random()*this.length)];
    }
     var tabVideos = ['https://www.youtube.com/watch?v=2OXAFqcQAfo', 'https://www.youtube.com/watch?v=XtOijCGdjsc',
     'https://www.youtube.com/watch?v=ZwzHYSWBU_U', 'https://www.youtube.com/watch?v=4TKWJCobTjY',
     'https://www.youtube.com/watch?v=CZuPA9fYSWA', 'https://www.youtube.com/watch?v=libbF4h_BbM',
     'https://www.youtube.com/watch?v=bjEgTxh30Pk', 'https://www.youtube.com/watch?v=CbwIbHe5IGM',
     'https://www.youtube.com/watch?v=Wvi2I8YzNk0', 'https://www.youtube.com/watch?v=2zRxahDtjCY',
     'https://www.youtube.com/watch?v=_UU0uxaJoR4', 'https://www.youtube.com/watch?v=2tq6zzM1KDc',
     'https://www.youtube.com/watch?v=zNjmnd9rYjI', 'https://www.youtube.com/watch?v=hVytko7quO4',].sample();

    message.reply(tabVideos);
  }

  if(command === "banlist"){
    message.reply("banlist actuelle : "+ confBanlist);
  }

  if(command === "banlistadd"){
    if(!message.member.roles.some(r=>["OP", "Modérateur", "Authentifié"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    const banMessage = args.join(" ");
    confBanlist.push(banMessage);
    var json = JSON.stringify(confBanlist);
    fs.writeFile('banlist.json', json);
    
    console.log("jeux ajouté à la banlist : " + banMessage);
    console.log("banlist : " + confBanlist);
    
    message.channel.send(banMessage + " ajouté à la banlist avec succès.");
    message.channel.send("banlist actuelle : " + confBanlist);

  }

  if(command === "say") {
    // This command must be limited to OP and mod
    if(!message.member.roles.some(r=>["OP", "Modérateur", "Authentifié"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    // makes the bot say something and delete the message. As an example, it's open to anyone to use.
    // To get the "message" itself we join the `args` back into a string with spaces:
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{});
    // And we get the bot to say the thing:
    message.channel.send(sayMessage);
  }

  if(command === "kick") {
    // This command must be limited to OP and mod
    if(!message.member.roles.some(r=>["OP", "Modérateur"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable)
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

    // slice(1) removes the first part, which here should be the user mention!
    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the kick!");

    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }

  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["OP"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable)
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the ban!");

    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }

  if(command === "purge") {
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);

    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({count: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }

});

client.login(config.token);
