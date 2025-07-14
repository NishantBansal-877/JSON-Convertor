const inputText = document.querySelector("#input-text");
const submitBtn = document.querySelector("#submit");

submitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const messageBot = [...document.querySelectorAll(".bot")].at(-1);
  const inputMessage = inputText.value;
  inputText.value = "";
  const newUserMessage = document.createElement("div");
  newUserMessage.className = " message user ";
  newUserMessage.textContent = "" + inputMessage;
  messageBot.insertAdjacentElement("afterend", newUserMessage);

  const request = new XMLHttpRequest();
  request.open("POST", "http://127.0.0.1:5000/user", true);
  request.setRequestHeader("content-type", "plain/text");
  let responseBoxText = "";
  request.addEventListener("load", function () {
    responseBoxText += this.responseText;
    const messageUser = [...document.querySelectorAll(".user")].at(-1);
    const newBotMessage = document.createElement("div");
    newBotMessage.className = " message bot ";
    newBotMessage.innerHTML = responseBoxText;
    messageUser.insertAdjacentElement("afterend", newBotMessage);
  });
  request.send(inputMessage);
});
