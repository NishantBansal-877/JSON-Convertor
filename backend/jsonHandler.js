import XLSX from "xlsx";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import mongoose from "mongoose";

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
const workbookData = [];

//initialize monogodb connection
await mongoose.connect(DB);
console.log("DB connected");

//creating schema
const dataSchema = new mongoose.Schema({
  workbookName: String,
  workbookCreatedAt: String,
  workbookData: Array,
});

//creating collections model
export const Data = mongoose.model("Data", dataSchema);

//current date function in format like--> 18/7/2025, 12:35:18 pm
function date() {
  const d = new Date();
  return d.toLocaleString();
}

//adding sheets function in JSON format
function addSheets(sheetsArray, sheetDataArray) {
  let i = 0;
  sheetsArray.forEach((sheetName) => {
    workbookData.push({
      sheetId: i,
      sheetName: sheetName,
      sheetCreatedAt: date(),
      sheetData: XLSX.utils.sheet_to_json(sheetDataArray[i++], { defval: null }),
    });
  });
}

//exporting handler
export async function handler(workbookJson) {
  //if workbook is empty
  if (workbookJson == "") {
    return;
  }

  let workbook = JSON.parse(workbookJson);

  let sheets = workbook.Sheets;
  const sheetsArray = Object.keys(sheets);
  const sheetDataArray = Object.values(sheets);

  //for adding files
  if (workbook.method == "Add") {
    let existing = await Data.findOne({
      workbookName: workbook.fileName,
      workbookData: { $ne: null },
    });

    if (existing) {
      return "already exist";
    }

    addSheets(sheetsArray, sheetDataArray);

    existing = await Data.findOne({ workbookName: workbook.fileName, workbookData: { $eq: null } });

    if (existing) {
      await Data.findOneAndUpdate(
        { workbookName: workbook.fileName },
        {
          workbookCreatedAt: date(),
          workbookData: workbookData,
        }
      );
    } else {
      await Data.create({
        workbookName: workbook.fileName,
        workbookCreatedAt: date(),
        workbookData: workbookData,
      });
    }

    return "Added";
  }

  //for updating files
  if (workbook.method == "Update") {
    let existing = await Data.findOne({
      workbookName: workbook.fileName,
    });

    if (!existing) {
      return "not exist";
    }

    addSheets(sheetsArray, sheetDataArray);

    await Data.findOneAndUpdate(
      { workbookName: workbook.fileName },
      {
        workbookCreatedAt: date(),
        workbookData: workbookData,
      }
    );

    return "Updated";
  }

  //for deleting files
  if (workbook.method == "Delete") {
    let existing = await Data.findOne({
      workbookName: workbook.fileName,
    });

    if (!existing) {
      return "not exist";
    }

    await Data.findOneAndUpdate(
      { workbookName: workbook.fileName },
      {
        workbookCreatedAt: date(),
        workbookData: null,
      }
    );

    return "Deleted";
  }
}
