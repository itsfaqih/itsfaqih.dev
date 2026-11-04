import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/x.js");
const { chromium } = require("playwright");
const b = await chromium.launch(); const p = await b.newPage();
await p.setContent(`<div id=o style="width:100px;height:100px;overflow:scroll"><div style="height:400px"></div></div>`);
console.log("headless scrollbar width", await p.evaluate(() => { const o = document.getElementById("o"); return o.offsetWidth - o.clientWidth; }), b.version());
await b.close();
