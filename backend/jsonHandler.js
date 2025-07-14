import fs from "fs";
import XLSX from "xlsx";

export function update(workbookJson) {
  let additionalData = JSON.parse(fs.readFileSync("./database/additional.json", "utf-8"));
  if (workbookJson == "") {
    return;
  }
  let workbook = JSON.parse(workbookJson);

  let jsonData = JSON.parse(fs.readFileSync("./database/JSONDATA.json", "utf-8"));
  const workbookData = [];

  let sheets = workbook.Sheets;
  const sheetsArray = Object.keys(sheets);
  const sheetDataArray = Object.values(sheets);
  console.log(workbook.method);
  if (workbook.method == "Add") {
    const idx = additionalData[0].workbookName.indexOf(workbook.fileName);
    if (
      additionalData[0].workbookName.includes(workbook.fileName) &&
      jsonData[idx].workbookData != null
    ) {
      return "already exist";
    }

    let i = 0;
    sheetsArray.forEach((sheetName) => {
      workbookData.push({
        sheetId: i,
        sheetName: sheetName,
        sheetCreatedAt: Date.now(),
        sheetData: XLSX.utils.sheet_to_json(sheetDataArray[i++], { defval: null }),
      });
    });
    if (
      additionalData[0].workbookName.includes(workbook.fileName) &&
      jsonData[idx].workbookData == null
    ) {
      const booKdata = {
        id: idx,
        workbookName: workbook.fileName,
        workbookCreatedAt: Date.now(),
        workbookData: workbookData,
      };
      jsonData.splice(idx, 1, booKdata);
    } else {
      jsonData = Array.from(jsonData);
      const id = jsonData.length;
      const booKdata = {
        id: id,
        workbookName: workbook.fileName,
        workbookCreatedAt: Date.now(),
        workbookData: workbookData,
      };
      additionalData[0].workbookName.push(workbook.fileName);
      jsonData.push(booKdata);
    }
    fs.writeFileSync("./database/additional.json", JSON.stringify(additionalData));
    fs.writeFileSync("./database/JSONDATA.json", JSON.stringify(jsonData), () => {
      return;
    });
    return "Added";
  }
  if (workbook.method == "Update") {
    const idx = additionalData[0].workbookName.indexOf(workbook.fileName);
    if (idx == -1) {
      return "not exist";
    }
    let i = 0;
    sheetsArray.forEach((sheetName) => {
      workbookData.push({
        sheetId: i,
        sheetName: sheetName,
        sheetCreatedAt: Date.now(),
        sheetData: XLSX.utils.sheet_to_json(sheetDataArray[i++], { defval: null }),
      });
    });
    jsonData = Array.from(jsonData);

    const booKdata = {
      id: idx,
      workbookName: workbook.fileName,
      workbookUpdatedAt: Date.now(),
      workbookData: workbookData,
    };
    jsonData.splice(idx, 1, booKdata);
    fs.writeFileSync("./database/JSONDATA.json", JSON.stringify(jsonData), () => {
      return;
    });
    return "Updated";
  }
  if (workbook.method == "Delete") {
    jsonData = Array.from(jsonData);
    const idx = additionalData[0].workbookName.indexOf(workbook.fileName);
    if (idx == -1) {
      return "not exist";
    }
    const booKdata = {
      id: idx,
      workbookName: workbook.fileName,
      workbookDeletedAt: Date.now(),
      workbookData: null,
    };
    jsonData.splice(idx, 1, booKdata);
    fs.writeFileSync("./database/JSONDATA.json", JSON.stringify(jsonData), () => {
      return;
    });
    return "Deleted";
  }
}
