const Botkit = require("botkit");

const tokuns = {
    "lang": "en",
    "token": {
      "slack": {
        "token": process.env.SLACK_TOKEN
      },
      "github": {
        "user": "kouares",
        "password": process.env.GITHUB_TOKEN
      }
    },
    "repository": "kouares/bottest"
  }
const dictionary = require("./conf/dictionary.json");

const gh = require("./client/github-client")(tokuns.repository);
const sl = require("./client/slack-client")("");

sl.setAuthData(tokuns.token.slack.token);
gh.setAuthData(tokuns.token.github);

let users = false;

Promise.resolve()
    .then(() => {
        return sl.getUsersList();
    })
    .then((data) => {
        users = data;
    })
    .catch((err) => {
        console.log("userList Get Error:" + err);
    });

const bot = Botkit.slackbot({
    debug: false
});

bot.spawn(tokuns.token.slack).startRTM();

bot.hears("(Create Issue)", ["direct_message", "direct_mention", "mention"], (bot, message) => {
    let elements = message.text.split("\n");
    let createUser = users.filter((user) => {
        return user.id == message.user;
    }) || {
        name: "Unknown"
    };

    let title = createUser[0].name + ": " + elements[1];
    let body = elements.filter((row, index) => {
        return index >= 2;
    }).join("\n");

    bot.reply(
        message,
        dictionary[tokuns.lang]["Processing"].replace(/{title}/, title)
    );

    Promise.resolve()
        .then(() => {
            return gh.createIssue(title, body);
        })
        .then((data) => {
            bot.reply(
                message,
                dictionary[tokuns.lang]["Success"].replace(/{title}/, title).replace(/{url}/, data.body.html_url)
            );
            console.log(data);
        })
        .catch((err) => {
            bot.reply(
                message,
                dictionary[tokuns.lang]["Error"].replace(/{error}/, err)
            );
            console.log(err);
        });
});
