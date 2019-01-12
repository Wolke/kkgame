
import { welcome } from "./intents/welcome"

import { fail } from "./intents/fail"
import { get_question } from "./gather-data"
const { WebhookClient } = require('dialogflow-fulfillment');

exports.webhook_dialogflow = async (request: Express.Request, response: Express.Response) => {
    const agent = new WebhookClient({ request, response });
    // console.log(agent)
    function wel() {
        agent.add(welcome());
    }

    function fallback() {
        agent.add(fail());
    }



    async function ask(conv: any) {
        // console.log(conv)
        let l = conv.locale.substr(0, 2);
        console.log(l)
        let question: { singers: Array<any>, selected: string, media_url: string } = await get_question(l);

        let s = "";
        question.singers.map((i, index) => {
            s += `  ${i.name},`;
        })
        let q = "這首歌是誰唱的? ";
        if (l === "en") {
            q = "who sing this song?"
        }
        agent.add(q + s);
        agent.setContext({
            name: 'selected',
            lifespan: 1,
            parameters: { selected: question.selected }
        });
        agent.add(question.media_url);

    }
    function ask_custom(conv: any) {
        let l = conv.locale.substr(0, 2);
        console.log(l)
        let p = agent.getContext('selected');
        let selected = p.parameters.selected
        let ans = ["答對啦", "答錯啦", "你答", "正解是"];
        if (l === "en") {
            ans = ["correct!", "wrong!", "you said:", "right answer is "];
        }

        agent.add((conv.query == selected) ? ans[0] : ans[1]);

        agent.add(ans[2] + conv.query);
        agent.add(ans[3] + selected);
        agent.setContext({
            name: 'selected',
            lifespan: 0
        });
        return;

    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', wel);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('ask', ask);
    intentMap.set('ask - custom', ask_custom);

    agent.handleRequest(intentMap);

}