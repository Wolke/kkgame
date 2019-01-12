import { get_question } from "./gather-data"
import { welcome } from "./intents/welcome"

import { fail } from "./intents/fail"
import { dialogflow, MediaObject, Image, Suggestions } from "actions-on-google";

exports.webhook_actions = (request: Express.Request, response: Express.Response) => {
    const app = dialogflow({ debug: false });
    app.intent('Default Welcome Intent', (conv) => { // must not be async for i18n
        conv.ask(welcome());
        // conv.followup("ask_event")
    });
    app.intent('Default Fallback Intent', (conv) => { // must not be async for i18n
        conv.ask(fail());
    });

    app.intent("ask", async (conv: any) => {
        let question: { singers: Array<any>, selected: string, media_url: string } = await get_question("en");
        let s = "";
        let singers: Array<string> = [];
        question.singers.map((i, index) => {
            singers.push(i.name)
            s += `  ${i.name},`;
        })
        conv.ask("who sing this song? " + s)
        conv.data.selected = question.selected;
        conv.ask(new Suggestions(singers));
        conv.ask(new MediaObject({
            name: 'who sing this song?',
            url: question.media_url,
            description: s,
        }));

    })
    app.intent("ask - custom", async (conv: any) => {

        console.log(conv.query, conv.data.selected)
        if (conv.query === conv.data.selected) {
            conv.ask("correct answer! ")
        } else {
            conv.ask("wrong answer! ")
        }
        conv.ask("you said " + conv.query + ", answer is " + conv.data.selected)

        conv.close()


    })



    app(request, response)
}