const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");

let CoderMarkPrinted = false;

const cl = {
  gr: "\x1b[32m",
  br: "\x1b[34m",
  red: "\x1b[31m",
  yl: "\x1b[33m",
  gb: "\x1b[4m",
  st: "\x1b[9m",
  or: "\x1b[35m",
  rt: "\x1b[0m",
};

function CoderMark() {
  if (!CoderMarkPrinted) {
    console.log(`
╭━━━╮╱╱╱╱╱╱╱╱╱╱╱╱╱╭━━━┳╮
┃╭━━╯╱╱╱╱╱╱╱╱╱╱╱╱╱┃╭━━┫┃${cl.gr}
┃╰━━┳╮╭┳━┳━━┳━━┳━╮┃╰━━┫┃╭╮╱╭┳━╮╭━╮
┃╭━━┫┃┃┃╭┫╭╮┃╭╮┃╭╮┫╭━━┫┃┃┃╱┃┃╭╮┫╭╮╮${cl.br}
┃┃╱╱┃╰╯┃┃┃╰╯┃╰╯┃┃┃┃┃╱╱┃╰┫╰━╯┃┃┃┃┃┃┃
╰╯╱╱╰━━┻╯╰━╮┣━━┻╯╰┻╯╱╱╰━┻━╮╭┻╯╰┻╯╰╯${cl.rt}
╱╱╱╱╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱╱╱╱╭━╯┃
╱╱╱╱╱╱╱╱╱╱╱╰╯╱╱╱╱╱╱╱╱╱╱╱╰━━╯
\n${cl.gb}${cl.gr}blessnetwork Bot ${cl.rt}${cl.gb}v0.1${cl.rt}
        `);
    CoderMarkPrinted = true;
  }
}

const BASE_API_URL = "https://gateway-run.bls.dev";

const HealthHeader = {
  Host: "gateway-run.bls.dev",
  Accept: "*/*",
  Origin: "chrome-extension://pljbjcehnhcnofmkdbjolghdcjnmekia",
  "Accept-Language": "en-US,en;q=0.9",
};

async function checkGlobalHealth() {
  const url = `${BASE_API_URL}/health`;
  try {
    const response = await axios.get(url, { headers: HealthHeader });
    const healthStatus = response.data.status;
    console.log(
      `${cl.yl})>${cl.rt} Global Health Check: ${cl.gr}${healthStatus}${cl.rt}`
    );
  } catch (error) {
    console.log(
      `Global Health Check Failed: ${error.response.status} ${error.response.statusText}`
    );
    console.log(`Response content: ${error.response.data}`);
  }
}

async function pingSession(nodeId, proxy, account) {
  const HEADERS = {
    Authorization: `Bearer ${account}`,
    "Content-Type": "application/json",
  };

  const url = `${BASE_API_URL}/api/v1/nodes/${nodeId}/ping`;
  let agent;

  if (proxy) {
    if (proxy.startsWith("socks://") || proxy.startsWith("socks5://")) {
      agent = new SocksProxyAgent(proxy);
    } else if (proxy.startsWith("http://") || proxy.startsWith("https://")) {
      agent = new HttpsProxyAgent(proxy);
    }
  }

  try {
    await axios.post(url, null, { headers: HEADERS, httpsAgent: agent });
    console.log(
      `${cl.yl})>${cl.or} Ping success ${cl.gr}-> ${cl.br}${nodeId}${cl.rt}`
    );
  } catch (error) {
    console.log(
      `${cl.yl})>${cl.rt} Ping failed ${cl.gr}-> ${cl.br}${nodeId}: ${cl.red} ${error.response.status} ${error.response.statusText}${cl.rt}`
    );
    console.log(`Response content: ${error.response.data}`);
  }
}

async function manageNode(nodeId, proxy, account) {
  try {
    while (true) {
      console.log(
        `${cl.yl})>${cl.rt} Pinging Node ${cl.gr}->${cl.br} ${nodeId}${cl.rt}`
      );
      await pingSession(nodeId, proxy, account);
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds between pings
    }
  } catch (error) {
    console.log(
      `${cl.red}An error occurred for Node ${nodeId}: ${error}${cl.rt}`
    );
  }
}

async function globalHealthMonitor() {
  try {
    while (true) {
      await checkGlobalHealth();
      await new Promise((resolve) => setTimeout(resolve, 300000)); // Check global health every 5 minutes
    }
  } catch (error) {
    console.log(
      `${cl.red}An error occurred in global health monitoring: ${error}${cl.rt}`
    );
  }
}

async function getProxyIP(proxy) {
  let agent;
  if (proxy.startsWith("socks://") || proxy.startsWith("socks5://")) {
    agent = new SocksProxyAgent(proxy);
  } else if (proxy.startsWith("http://") || proxy.startsWith("https://")) {
    agent = new HttpsProxyAgent(proxy);
  } else {
    console.log(`Unsupported proxy format: ${proxy}`);
    return null;
  }

  try {
    const response = await axios.get("https://ipinfo.io/json", {
      httpsAgent: agent,
    });
    const Ipinfo = response.data.ip;
    const maskedIp = Ipinfo.replace(/(\d+\.\d+\.\d+)\.(\d+)/, "$1.***");
    console.log(
      `${cl.yl})>${cl.rt} Connected through Ip: ${cl.gr}${cl.st} ${maskedIp}${cl.rt}`
    );
    return response.data;
  } catch (error) {
    console.log(
      `${cl.yl})>${cl.rt} Skipping proxy ${proxy} due to connection error: ${error.message}`
    );
    return null;
  }
}

async function main() {
  const nodeId = process.argv[2];
  const proxy = process.argv[3];

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

  const formattedProxies = [];

  const chunkSize = 5;
  for (let i = 0; i < PROXIES.length; i += chunkSize) {
    formattedProxies.push(PROXIES.slice(i, i + chunkSize));
  }

  CoderMark();

  while (true) {
    for (let i = 0; i < NODE_IDS.length; i++) {
      console.log("Start with node:", NODE_IDS[i]);
      const listProxies = formattedProxies[i];
      for (const proxy of listProxies) {
        if (proxy) {
          let proxyUrl;
          if (!proxy.startsWith("http://") && !proxy.startsWith("https://")) {
            proxyUrl = "http://" + proxy;
          } else {
            proxyUrl = proxy;
          }
          console.log(`Using proxy: ${proxyUrl}`);

          const proxyData = await getProxyIP(proxyUrl);

          if (proxyData) {
            await manageNode(NODE_IDS[i], proxyUrl, ACCOUNTS[i]);
          }
          await sleep(2000);
        }
      }
      await sleep(5000);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => console.log(`Unhandled error: ${error}`));

process.on("SIGINT", () => {
  console.log("Exiting script...");
  process.exit(0);
});
