document.getElementById("openInstructions").onclick = () => {
  document.getElementById("instructionFrame").src = "instructions.html";
  document.getElementById("instructionModal").style.display = "block";
};

document.querySelector(".close").onclick = () => {
  document.getElementById("instructionModal").style.display = "none";
  document.getElementById("instructionFrame").src = "";
};

window.onclick = (e) => {
  if (e.target.id === "instructionModal") {
    document.getElementById("instructionModal").style.display = "none";
    document.getElementById("instructionFrame").src = "";
  }
};
