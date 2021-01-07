import { BotFrameworkAdapter, TurnContext } from "botbuilder";
import sizeOf from "image-size";
import path from "path";

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

      const { width, height } = sizeOf(
        path.join(path.resolve(), "img-output", output.img as string)
      );

      return turnContext.sendActivity(
        `<img src="${process.env.BASE_URL}/img-output/${output.img}" height="${height}" width="${width}" />`
      );
    }
  });
};

export default latex;
