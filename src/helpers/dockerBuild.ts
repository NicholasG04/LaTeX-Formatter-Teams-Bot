import Docker from "dockerode";
import path from "path";
import fs from "fs";
import streamToPromise from "stream-to-promise";
import stream from "stream";
import type { Result } from "../types";

const dockerBuild = async (
  docID: string,
  tempDirRoot: string,
  outputDir: string
): Promise<Result> => {
  const tempAbsPath = path.join(tempDirRoot, docID);
  const outputAbsPath = path.join(outputDir, docID);

  const latexCmd =
    "timeout 5 latex -interaction nonstopmode -halt-on-error --no-shell-escape equation.tex";
  const dvipngCmd = "dvipng equation -o equation.png";

  const docker = new Docker();

  const imgName = "blang/latex:ubuntu";

  const result: Result = {};

  await streamToPromise(await docker.pull(imgName));

  let errorText = "";
  const writableStream = new stream.Writable();
  // eslint-disable-next-line no-underscore-dangle
  writableStream._write = (chunk, encoding, done) => {
    errorText += chunk.toString();
    done();
  };

  await docker.run(
    imgName,
    ["bash", "-c", `${latexCmd} && ${dvipngCmd}`],
    writableStream,
    {
      HostConfig: {
        Binds: [`${tempAbsPath}:/data`],
        AutoRemove: true,
      },
      NetworkDisabled: true,
    }
  );

  if (fs.existsSync(path.join(tempAbsPath, "equation.png"))) {
    fs.copyFileSync(
      path.join(tempAbsPath, "equation.png"),
      `${outputAbsPath}.png`
    );
    result.img = `${docID}.png`;
  } else {
    result.error =
      "Error converting LaTeX to image. Please check that the input is valid.";
    console.log(errorText);
  }

  fs.rmdirSync(tempAbsPath, { recursive: true });

  return result;
};

export default dockerBuild;
