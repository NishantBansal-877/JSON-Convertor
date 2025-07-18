import { main } from "./AzureBot.js";
import http from "http";
import { handler } from "./jsonHandler.js";

const request = [];
let reply;
//modify or add local host according to your chatbot and excelupload http://127.0.0.1:your_portnumber
const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5500",
  "http://192.168.181.130:3000",
  "http://127.0.0.1:3001",
  "http://192.168.0.103:62726",
  "https://json-convertor-chat.onrender.com",
  "https://json-convertor-excelupload.onrender.com",
  "https://azurechat.netlify.app",
  "https://exceload.netlify.app",
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

  //for chat
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

  //for excel
  if (pathName == "/json") {
    let workbookJson = "";

    req.on("data", (chunk) => {
      workbookJson += chunk.toString();
    });

    req.on("end", async () => {
      console.log("got requesst");
      request.push(workbookJson);
      continousFunction(res);
    });
  }
});

async function continousFunction(res) {
  if (request.length > 0) {
    const data = request.shift();
    try {
      reply = await handler(data);
      // console.log("reply:", reply);
    } catch (err) {
      // console.error("Update error:", err);
    }
    res.end(reply);
  }
  setTimeout(continousFunction, 1000);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", function () {
  console.log("Server is listening on port " + PORT);
});
