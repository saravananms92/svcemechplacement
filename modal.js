const modal = document.getElementById("instructionModal");
const btn = document.getElementById("openInstructions");
const closeBtn = document.querySelector(".close");
const frame = document.getElementById("instructionFrame");

btn.onclick = () => {
  frame.src = "instructions.html";
  modal.style.display = "block";
};

closeBtn.onclick = () => {
  modal.style.display = "none";
  frame.src = "";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    frame.src = "";
  }
};

