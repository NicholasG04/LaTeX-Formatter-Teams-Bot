import crypto from 'crypto';
import type express from 'express'
const botbuilder = require('botbuilder');

export default (req: express.Request, res: express.Response) => {
  const adapter = new botbuilder.BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
  })

  adapter.processActivity(req, res, async (turnContext: any) => {
    if (turnContext.activity.type === 'message') {
      const msg = turnContext.activity.text;
      await turnContext.sendActivity(`Echo: ${msg}`)
    }
  })
}