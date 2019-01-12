
const { WebhookClient } = require('dialogflow-fulfillment');

const { webhook_actions } = require("./webhook_actions")

const { webhook_dialogflow } = require("./webhook_dialogflow")

export const dialogflowFulfillment = (request: Express.Request, response: Express.Response) => {
    const agent = new WebhookClient({ request, response });
    console.log("agent.requestSource", agent.requestSource)
    if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
        webhook_actions(request, response)
    } else {
        webhook_dialogflow(request, response)
    }
}
