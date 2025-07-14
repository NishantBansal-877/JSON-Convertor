const fileInput = document.querySelector("#fileInput");
const fileDiv = document.querySelectorAll(".file-div");
const optionsDiv = document.querySelector(".options");
const optionsList = document.querySelectorAll(".options a");
const sendBtn = document.querySelector("#sendAll");

let i = -1;
let j = -1;
let k = -1;
let option;
let filesName = [];
let filesData = [];
let allCheckbox = [];
let allDeleteBtn = [];
let request = [];
let uploadFileQueue = [];
const event = new Event("fileDiv-changed");

optionsDiv.addEventListener("click", (e) => {
  if (!e.target.hasAttribute("href")) {
    return;
  }
  optionsList.forEach((optn) => {
    if (e.target == optn) {
      if (e.target.style.opacity == 1) {
        e.target.style.opacity = 0.5;
        sendBtn.style.visibility = "hidden";
        sendBtn.textContent = ``;
      } else {
        optn.style.opacity = 1;
        sendBtn.style.visibility = "visible";
        sendBtn.textContent = `${optn.textContent} All to Server`;
        return;
      }
    }
    optn.style.opacity = 0.5;
  });
});

fileInput.addEventListener("change", (e) => {
  const currFiles = Object.values(e.target.files);

  currFiles.forEach((file, idx) => {
    if (filesData.some((f) => f.name === file.name)) {
      return;
    }
    i++;
    filesName.push(file.name);
    filesData.push(e.target.files[idx]);
    const fileContainer = document.createElement("div");
    fileContainer.classList.add("file-container");
    fileContainer.setAttribute("idNo", `${i}`);
    fileContainer.innerHTML = `<button type="button" btnNo="${i}"></button><p id="pid">${file.name}</p><input type="checkbox" name="checkbox" chkNo=${i} checked/>`;
    fileDiv[0].insertAdjacentElement("beforeend", fileContainer);

    allCheckbox.push(
      document.querySelector(
        `.file-container[idNo="${i}"]>input[type="checkbox"]`
      )
    );
    allDeleteBtn.push(
      document.querySelector(
        `.file-container[idNO="${i}"]>button[type="button"]`
      )
    );
  });
  fileDiv[0].dispatchEvent(event);
});

fileDiv[0].addEventListener("fileDiv-changed", (e) => {
  if (e) {
    e.preventDefault();
  }
  allDeleteBtn.forEach((btn) => {
    btn.addEventListener("click", (btn) => {
      const idNo = btn.target.getAttribute("btnNo");
      const child = document.querySelector(`.file-container[idNo="${idNo}"]`);
      fileDiv[0].removeChild(child);
      const index = allDeleteBtn.indexOf(btn.target);
      allDeleteBtn.splice(index, 1);
      allCheckbox.splice(index, 1);
      filesName.splice(index, 1);
      filesData.splice(index, 1);
    });
  });
});

sendBtn.addEventListener("click", function (e) {
  e.preventDefault();
  for (let i = allCheckbox.length - 1; i >= 0; i--) {
    const chk = allCheckbox[i];
    if (chk.checked == true) {
      k++;
      const fileContainer = document.createElement("div");
      fileContainer.classList.add("file-container");
      fileContainer.setAttribute("idNo", `${k}`);
      const chkNo = Number(chk.getAttribute("chkNO"));
      const idx = allCheckbox.indexOf(chk);
      fileContainer.innerHTML = `<p>❖</p>
              <p id="pid">${filesName[idx]}</p>
              <p>Sent</p>`;
      fileDiv[1].insertAdjacentElement("afterbegin", fileContainer);
      const child = document.querySelector(`.file-container[idNo="${chkNo}"]`);
      fileDiv[0].removeChild(child);
      allCheckbox.splice(idx, 1);
      allDeleteBtn.splice(idx, 1);
      file = filesData[idx];
      sendToServer(filesData[idx], filesName[idx]);
      filesName.splice(idx, 1);
      filesData.splice(idx, 1);
    }
  }
});

document.querySelectorAll(".options a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
  });
});

document.querySelectorAll(".left-nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
  });
});

window.addEventListener("beforeunload", (e) => {
  console.warn("Page is reloading!");
});

function sendToServer(file, fileName) {
  option = sendBtn.textContent.split(" ")[0];
  const reader = new FileReader();
  const client = new XMLHttpRequest();
  reader.onload = (event) => {
    const arrayBuffer = event.target.result;
    const workbook = XLSX.read(arrayBuffer, { type: arrayBuffer });
    workbook.fileName = fileName;
    workbook.method = option;

    const workbookJson = JSON.stringify(workbook);

    client.open("POST", "http://127.0.0.1:5000/json", true);
    client.setRequestHeader("content-type", "application/json");
    client.send(workbookJson);
    client.onreadystatechange = function () {
      if (client.readyState === 4) {
        if (client.status === 200) {
          console.log("Response received:", client.responseText);
        } else {
          console.error("Error:", client.status, client.statusText);
        }
      }
    };
  };
  reader.readAsArrayBuffer(file);
}
