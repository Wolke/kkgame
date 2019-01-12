
import { get_question } from "./gather-data"
import { MongoDbStorage } from "botbuilder-mongodb-storage"
var { mongodb_url } = require("./const");
var builder = require("botbuilder")
var LineConnector = require("botbuilder-linebot-connector");


// var express = require('express');
// var server = express();

var { channelId, channelSecret, channelAccessToken } = require("./const")

// server.listen(process.env.port || process.env.PORT || 3980, function () {
//     console.log("listening to");
// });


export const connector = new LineConnector.LineConnector({
    hasPushApi: false, //you have to pay for push api >.,<
    autoGetUserProfile: true, //default is false
    // your line
    channelId,
    channelSecret,
    channelAccessToken
});

// server.post('/line', connector.listen());

// (mongodb_url === 'mongodb://localhost:27017')
console.log("mongodb_url", mongodb_url)
var bot = new builder.UniversalBot(connector)
    .set("storage", new MongoDbStorage({
        DatabaseName: "songs",
        collectionName: "botState",
        mongoIp: (mongodb_url === 'mongodb://localhost:27017') ? "localhost" : "mongo",
        mongoPort: "27017",
        // mongoIp: "ds125578.mlab.com",
        // mongoPort: "255xx",
        // username: "myUserAdmin",
        // password: "testtest123"
    }));
// bot.dialog("/", [
//     (s: any) => {
//         builder.Prompts.text(s, "go");
//     },
//     (s: any, r: any) => {
//         s.send("oh!" + r.response)
//         s.endDialog()
//     }
// ])
bot.dialog("readme", async (s: any) => {
    s.send(new builder.Message(s)
        .addAttachment(
            new builder.HeroCard(s)
                .title("猜猜誰唱的")
                .subtitle("要玩嗎？請點開始吧")
                .text("要玩 猜猜誰唱的 嗎？　請輸入[開始玩猜猜誰唱的]")
                .buttons([
                    //left text message
                    builder.CardAction.imBack(s, "開始玩猜猜誰唱的", "開始玩"),
                ])
        )
    )
})

bot.dialog("play",
    [
        async (s: any, p: any) => {
            console.log(p.question)
            if (p.question === undefined) {
                let question: { singers: Array<any>, selected: string, media_url: string } = await get_question("zh");
                s.dialogData.question = question;
            } else {
                s.dialogData.question = p.question
            }
            let question: { singers: Array<any>, selected: string, media_url: string } = s.dialogData.question;

            // let t = "";
            let btns: Array<any> = [];
            question.singers.map((i, index) => {
                // t += `  ${i.name},`;
                let label: string = question.singers[index].name.substr(0, 18);

                btns.push(new builder.HeroCard(s)
                    .text(question.singers[index].name)
                    .images([builder.CardImage.create(s, question.singers[index].image_url)])
                    .buttons([
                        builder.CardAction.imBack(s, label, label),
                    ])
                )
            })

            if (p.first) {
                s.send("歡迎加入本linebot，以後若想玩此遊戲，只需打 play ，就可以喚出了！")

            }

            var msg = new builder.Message(s);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.addAttachment(
                new builder.AudioCard(s).media([{
                    url: question.media_url, //file place must be https
                    "type": "audio",
                    "duration": 1000,
                }])
            ).attachments(btns);
            s.send(msg)

            s.send(new builder.Message(s)
                /* Audio file */
                .addAttachment(
                    new builder.AudioCard(s).media([{
                        url: question.media_url, //file place must be https
                        "type": "audio",
                        "duration": 1000,
                    }])
                ))


            builder.Prompts.choice(s, "這首誰唱的？", [question.singers[0].name, question.singers[1].name, question.singers[2].name])


        }, async (s: any, result: any) => {
            // console.log(" s.message.from", s.message.from.)
            // console.log(s.dialogData.question.song)
            if (s.dialogData.question.selected === result.response.entity) {
                s.send(new builder.Message(s)
                    .addAttachment(
                        new LineConnector.Sticker(s, 1, 2)
                    )
                )
                s.send(`${s.message.from.name} 答對了`)
                s.dialogData.question === null;

            } else {
                s.send(new builder.Message(s)
                    .addAttachment(
                        new LineConnector.Sticker(s, 1, 3)
                    )
                )
                s.send(`${s.message.from.name} 答錯了`)
                // s.replaceDialog()
                s.replaceDialog("play", { question: s.dialogData.question })
                return;

            }

            let song = s.dialogData.question.song;
            let images = song.album.images
            let image_url = (images[1]) ? images[1].url : images[0].url;

            s.endDialog(new builder.Message(s)
                .addAttachment(
                    new builder.HeroCard(s)

                        .title(`${s.dialogData.question.selected} ${song.name}`.substr(0, 30))
                        .subtitle(`專輯 ${song.album.name} 發行日期 ${song.album.release_date} `.substr(0, 30))
                        .text(` 專輯 ${song.album.name} 發行日期 ${song.album.release_date} `.substr(0, 30))
                        .images([builder.CardImage.create(s, image_url)])

                        .buttons([
                            //left text message
                            //open irl
                            builder.CardAction.openUrl(s, song.url, `🎵${song.name.substr(0, 18)}`),
                            builder.CardAction.openUrl(s, song.album.url, `🎶${song.album.name.substr(0, 18)}`),
                            builder.CardAction.openUrl(s, song.album.artist.url, `🎤${s.dialogData.question.selected}`),
                            builder.CardAction.imBack(s, "play", `⏭️下一題`),
                        ])
                )
            )
            s.endDialog()
            //
        }]
).triggerAction({ matches: /play/i });



bot.on('conversationUpdate', function (message: any) {
    // detect event
    switch (message.text) {
        case 'follow':
            break;
        case 'unfollow':
            return;
        // break;
        case 'join':
            break;
        case 'leave':
            return;
        // break;
    }
    bot.beginDialog(message.address, "play", { first: true })


});