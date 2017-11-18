# DiscordBot
___________________________________________________

## Installation

* Install the latest nodejs https://nodejs.org/en/download/
* clone the project
* edit [config files](#config-files) with your tokens
* Go to the DiscordBot Directory and open a command prompt and type:
 ```
  npm install
```
```
  node app.js
```


## config files:

* #### config.json
   discord token, and prefix string

```
    { "token"  : "YOUR_DISCORD_TOKEN",
      "prefix" : "/"
    }
```

* ### oauth_info.json
   reddit tokens and twitch client_id

```
    {
      "user_agent": "YOUR_USER_AGENT",
      "client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET",
      "username": "YOUR_USERNAME",
      "password": "YOUR_PASSWORD",
      "twitch_id": "YOUR_TWITCH_CLIENTID"
    }
```
