const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
require("dotenv").config();

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  process.env.SHEET_ID, //sheet id
  serviceAccountAuth
);

async function getDataFromSheet() {
  console.log("Loading document info...");
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByTitle[process.env.SHEET_TITLE]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  const rows = await sheet.getRows();

  let result = [];

  let number = 0;
  for (let index = 0; index < rows.length; index++) {
    if (number + 1 > (parseInt(process.env.NUMBER_ACCOUNT) || 6)) {
      break;
    }
    const status = rows[index].get(process.env.SHEET_COLUMN_STATUS);
    const isDone = status?.toLowerCase()?.trim() !== "done";
    if (
      isDone &&
      rows[index].get(process.env.SHEET_COLUMN_TOKEN) &&
      rows[index].get(process.env.SHEET_COLUMN_PUBKEY) &&
      rows[index].get(process.env.SHEET_COLUMN_TOKEN) != "" &&
      rows[index].get(process.env.SHEET_COLUMN_PUBKEY) != ""
    ) {
      result.push({
        email: rows[index].get("Email"),
        token: rows[index].get(process.env.SHEET_COLUMN_TOKEN),
        pubKey: rows[index].get(process.env.SHEET_COLUMN_PUBKEY),
      });
      number++;
    }
  }
  console.log("Fetch data from sheet successfully");
  return result;
}

async function getDataProxyFromSheet(count) {
  console.log("Loading document proxy info...");
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByTitle[process.env.SHEET_PROXY]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
  const rows = await sheet.getRows();

  let result = [];

  let number = 0;
  for (let index = 0; index < rows.length; index++) {
    if (number + 1 > count) {
      break;
    }
    const status = rows[index].get(process.env.SHEET_COLUMN_STATUS_PROXY);
    const isDone = status?.toLowerCase()?.trim() !== "done";
    if (isDone && rows[index].get("Proxy")) {
      result.push(rows[index].get("Proxy"));
      number++;
    }
  }
  console.log("Fetch data from sheet proxy successfully");
  return result;
}

async function updateStatusNode(email) {
  try {
    console.log("Loading document info...");
    await doc.loadInfo(); // loads document properties and worksheets
    console.log("Document info loaded.");

    const sheet = doc.sheetsByTitle[process.env.SHEET_TITLE]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    console.log(`Sheet '${process.env.SHEET_TITLE}' selected.`);

    const rows = await sheet.getRows();
    console.log("Rows fetched.");

    const rowIndex = _findRowMatchEmail(email, rows);
    console.log("Row index found:", rowIndex);

    if (rowIndex != null) {
      console.log("Updating row at email:", email);
      rows[rowIndex].set("Cài node", "Done");
      rows[rowIndex].set("Người cài node", process.env.NAME_SETUP);
      await rows[rowIndex].save();
      console.log("Row saved.");
    } else {
      console.log("No matching row found for email:", email);
    }
  } catch (error) {
    throw new Error("Update sheet failed", error);
  }
}

async function updateStatusProxy(proxy) {
  try {
    console.log("Loading document info...");
    await doc.loadInfo(); // loads document properties and worksheets
    console.log("Document info loaded.");

    const sheet = doc.sheetsByTitle[process.env.SHEET_PROXY]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    console.log("Sheet 'Dawn' selected.");

    const rows = await sheet.getRows();
    console.log("Rows fetched.");

    const rowIndex = _findRowMatchProxy(proxy, rows);
    console.log("Row index found:", rowIndex);

    if (rowIndex != null) {
      console.log("Updating row at proxy:", proxy);
      rows[rowIndex].set("Status", "Done");
      await rows[rowIndex].save();
      console.log("Row saved.");
    } else {
      console.log("No matching row found for proxy:", proxy);
    }
  } catch (error) {
    throw new Error("Update sheet failed", error);
  }
}

function _findRowMatchEmail(email, rows) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].get("Email") === email) {
      return i;
    }
  }
  return null;
}

function _findRowMatchProxy(proxy, rows) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].get("Proxy") === proxy) {
      return i;
    }
  }
  return null;
}

module.exports = {
  getDataFromSheet,
  updateStatusNode,
  getDataProxyFromSheet,
  updateStatusProxy,
};
