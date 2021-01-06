import { BotFrameworkAdapter, TurnContext } from "botbuilder";

import type { Request, Response } from "express";
import generateDoc from "../helpers/generateDoc";
import { Result } from "../types";

const latex = (req: Request, res: Response): void => {
  const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
  });

  adapter.processActivity(req, res, async (turnContext) => {
    if (turnContext.activity.type === "message") {
      const msg = TurnContext.removeMentionText(
        turnContext.activity,
        turnContext.activity.recipient.id
      );
      if (!msg.startsWith("latex")) return;
      const parsed = msg
        .split(" ")
        .slice(1)
        .join(" ")
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "");

      const output: Result = await generateDoc(parsed);

      if (output.error) {
        return turnContext.sendActivity(output.error);
      }
      console.log(`${process.env.BASE_URL}/img-output/${output.img}`);
      return turnContext.sendActivity({
        text: "Output:",
        attachments: [
          {
            contentType: "image/png",
            contentUrl: `${process.env.BASE_URL}/img-output/${output.img}`,
            name: "Output of your LaTeX",
          },
        ],
      });
    }
  });
};

export default latex;
