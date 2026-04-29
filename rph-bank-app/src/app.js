import express from "express";
import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";


// dotenv
import dotenv from "dotenv";
dotenv.config();




const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            console.log(`${routePath} does not export an Express router (skipping file)...`);
            continue;
        }

        app.use(`/api/${version}/${routeName}`, module.default);
        console.log(`Mounted: /api/${version}/${routeName} -> ${file}`);
    }
}

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});