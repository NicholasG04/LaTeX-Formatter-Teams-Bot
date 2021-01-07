import Docker from "dockerode";
import path from "path";
import fs from "fs";
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
  const dvipngCmd = "dvipng equation -D 600 -T tight -o equation.png";
  const imgmagickCmd =
    "convert -border 10 -bordercolor white equation.png equation.png";

  const docker = new Docker();

  const imgName = "nicholasg/latex:ubuntu";

  const result: Result = {};

  const images = await docker.listImages();
  if (!images.find((i) => i.RepoTags.includes(imgName))) {
    console.error(
      "Error, build image first with docker build -t nicholasg/latex:ubuntu container/"
    );
    result.error = "Error, contact developer. Issue with getting docker image";
    return result;
  }

  let output = "";
  const writableStream = new stream.Writable();
  // eslint-disable-next-line no-underscore-dangle
  writableStream._write = (chunk, encoding, done) => {
    output += chunk.toString();
    done();
  };

  await docker.run(
    imgName,
    ["bash", "-c", `${latexCmd} && ${dvipngCmd} && ${imgmagickCmd}`],
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
    console.log(output);
  }

  fs.rmdirSync(tempAbsPath, { recursive: true });

  return result;
};

export default dockerBuild;
