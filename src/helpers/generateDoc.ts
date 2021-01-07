import fs from "fs";
import path from "path";
import dockerBuild from "./dockerBuild";
import type { Result } from "../types";

const generateID = () => {
  // Generate a random 16-char hexadecimal ID
  let output = "";
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 16; i++) {
    output += "0123456789abcdef".charAt(Math.floor(Math.random() * 16));
  }
  return output;
};

export default async (equation: string): Promise<Result> => {
  const eqnInput = equation
    .split("\n")
    .filter((line) => line.match(/\w+/g))
    .map((line) => (line.endsWith("\\\\") ? line : `${line}\\\\`))
    .join("\n");
  const docText = `
  \\documentclass[12pt]{article}
  \\usepackage{amsmath}
  \\usepackage{amssymb}
  \\usepackage{amsfonts}
  \\usepackage[utf8]{inputenc}
  \\thispagestyle{empty}

  \\begin{document}
  \\begin{align*}
  ${eqnInput}
  \\end{align*}
  \\end{document}
  `;
  const docID = generateID();

  const tempDirRoot = path.join(path.resolve(), "temp");
  const outputDir = path.join(path.resolve(), "img-output");

  if (!fs.existsSync(tempDirRoot)) {
    fs.mkdirSync(tempDirRoot);
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const folderName = path.join(tempDirRoot, docID);

  fs.mkdirSync(folderName);
  fs.writeFileSync(path.join(folderName, "equation.tex"), docText);

  return dockerBuild(docID, tempDirRoot, outputDir);
};
