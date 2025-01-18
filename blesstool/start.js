const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const {
  getDataFromSheet,
  getDataProxyFromSheet,
} = require("./src/googlesheet");

const writeToFile = (fileName, data) => {
  fs.writeFileSync(path.resolve(__dirname, fileName), data, "utf8");
};

const ACCOUNTS = fs
  .readFileSync(path.resolve(__dirname, "config.txt"), "utf-8")
  .split("\n")
  .filter(Boolean);

const NODE_IDS = fs
  .readFileSync(path.resolve(__dirname, "idnode.txt"), "utf-8")
  .split("\n")
  .filter(Boolean);

const PROXIES = fs
  .readFileSync(path.resolve(__dirname, "proxy.txt"), "utf-8")
  .split("\n")
  .filter(Boolean);

if (ACCOUNTS.length !== NODE_IDS.length) {
  console.log("Số lượng account và node không bằng nhau");
  process.exit(1);
}

if (PROXIES.length < ACCOUNTS.length * 5) {
  console.log("Số lượng proxy không đủ");
  process.exit(1);
}

async function main() {
  try {
    console.log("clear");
    console.log(
      "🚀 \x1b[Bless Bot\x1b[0m - \x1b[32mStart processing...\x1b[0m"
    );

    const formattedProxies = [];

    const chunkSize = 5;
    for (let i = 0; i < PROXIES.length; i += chunkSize) {
      formattedProxies.push(PROXIES.slice(i, i + chunkSize));
    }

    for (let i = 0; i < NODE_IDS.length; i++) {
      const listProxiee = formattedProxies[i];
      for (const proxy of listProxiee) {
        let proxyUrl;
        if (!proxy.startsWith("http://") && !proxy.startsWith("https://")) {
          proxyUrl = "http://" + proxy;
        } else {
          proxyUrl = proxy;
        }

        const name = `bless-${proxyUrl}`;

        execSync(
          `node bless.js --name ${name} -- ${NODE_IDS[i]} ${proxyUrl}`
        );
        console.log(`-> Started ${NODE_IDS[i]} with proxy ${proxyUrl}`);
      }
    }

    console.log(
      `-> √ Proxy start ${PROXIES[0]} to ${PROXIES[PROXIES.length - 1]}`
    );
    console.log("-> √ All proxies started!");

    // // pm2 status
    // execSync("pm2 status");
  } catch (error) {
    console.log("Error main", error || "unknown error");
  }
}

main().catch((error) => console.log(`❌ ${error.message}`.red));
