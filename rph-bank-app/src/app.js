import express from "express";
import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { errorHandler } from "./middleware/errorHandler.js";
import { getApiHelp } from "./controllers/help.controller.js";
import { getBankInfo } from "./controllers/info.controller.js";
import { getAllAccounts } from "./controllers/account.controller.js";
import {
  getIncomingAcknowledgments,
  getOutgoingAcknowledgments,
} from "./controllers/acknowledgment.controller.js";
import pingfinCompatibilityRouter from "./routes/pingfinCompatibility.js";

// dotenv
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8070;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = path.join(__dirname, "..", "public");

app.use(express.json());
app.use(express.static(publicPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const versionsPath = path.join(__dirname, "routes");
const versions = await fs.readdir(versionsPath);

for (const version of versions) {
  const versionPath = path.join(versionsPath, version);
  const stats = await fs.lstat(versionPath);

  if (!stats.isDirectory()) {
    console.error("[ERROR] invalid item in routes directory.");
    continue;
  }

  const routesFiles = await fs.readdir(versionPath);
  routesFiles.sort();
  for (const file of routesFiles) {
    if (path.extname(file) !== ".js") continue;

    const routeName = file.replace(".js", "");
    const routePath = path.join(versionPath, file);
    const module = await import(pathToFileURL(routePath).href);

    if (!module.default?.use || !module.default?.stack) {
      console.log(
        `${routePath} does not export an Express router (skipping file)...`,
      );
      continue;
    }

    app.use(`/api/${version}/${routeName}`, module.default);
    console.log(`Mounted: /api/${version}/${routeName} -> ${file}`);
  }
}

app.get("/api/help", getApiHelp);
app.get("/api/info", getBankInfo);
app.get("/api/accounts", getAllAccounts);
app.get("/api/v1/acknowledgments/incoming", getIncomingAcknowledgments);
app.get("/api/v1/acknowledgments/outgoing", getOutgoingAcknowledgments);
app.use("/api", pingfinCompatibilityRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
