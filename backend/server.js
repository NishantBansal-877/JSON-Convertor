import { main } from "./AzureBot.js";
import http from "http";
import { update } from "./jsonHandler.js";

const request = [];
let reply;
//modify or add local host according to your chatbot and excelupload http://127.0.0.1:your_portnumber
const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5500",
  "http://192.168.181.130:3000",
  "http://127.0.0.1:3001",
  "http://192.168.181.130:57119",
];

const server = http.createServer(function (req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }
  const pathName = req.url;

  if (pathName == "/user") {
    let textContent = "";

    req.on("data", (chunk) => {
      textContent += chunk.toString();
    });
    req.on("end", () => {
      main(JSON.stringify(textContent)).then((data) => {
        if (allowedOrigins.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        }

        res.writeHead(200, {
          "content-type": "text/html",
        });
        res.end(data);
      });
    });
  }

  if (pathName == "/json") {
    let workbookJson = "";

    req.on("data", (chunk) => {
      workbookJson += chunk.toString();
    });

    req.on("end", async () => {
      request.push(workbookJson);
      continousFunction(res);
    });
  }
});

async function continousFunction(res) {
  if (request.length > 0) {
    const data = request.shift();
    try {
      reply = await update(data);
      console.log("reply:", reply);
    } catch (err) {
      console.error("Update error:", err);
    }
    res.end(reply);
  }
  setTimeout(continousFunction, 1000);
}

server.listen(5000, "127.0.0.1", function () {
  console.log("listening ......");
});
