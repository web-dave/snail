import "./style.css";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

const commands: { command: "run" | "left" | "right"; value: number }[] = [];
const cmdList = document.querySelector("ol") as HTMLOListElement;

document
  .querySelector(".play")
  ?.addEventListener("click", () => replayCommands());

document.querySelectorAll(".command").forEach((elem: Element) => {
  const cmd = elem.getAttribute("data-command") as "run" | "left" | "right";
  console.log("cmd => ", cmd);
  elem.addEventListener("click", () => addCommand(cmd));
});

let x = canvas.width / 2;
let y = canvas.height / 2;
let degrees = 0;
const size = 10;

function addCommand(command: "run" | "left" | "right") {
  const msg = {
    run: "Wie viele Schritte willst du gehen?",
    left: "Um wie viel Grad willst du dich gegen den Uhrzeigersinn drehen?",
    right: "Um wie viel Grad willst du dich im Uhrzeigersinn drehen?",
  };
  const ret = window.prompt(msg[command], "10");
  console.log(ret);
  if (!!ret) {
    const value = parseInt(ret, 10);
    if (!isNaN(value)) {
      const li = document.createElement("li");
      li.classList.add(command);
      li.innerText = `${command} => ${value}`;
      cmdList?.appendChild(li);
      commands.push({ command, value });
    }
  }
  console.log(commands);
}

const trail: { x: number; y: number }[] = [{ x, y }];
function drawSnail() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrail();
  ctx.beginPath();

  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = "green";
  ctx.stroke();
  ctx.fill();
}

function drawTrail() {
  ctx.beginPath();
  for (const point of trail) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function replayCommands() {
  commands.forEach((cmd) => {
    switch (cmd.command) {
      case "run":
        const newX = x + cmd.value * Math.cos((2 * Math.PI * degrees) / 360);
        const newY = y + cmd.value * Math.sin((2 * Math.PI * degrees) / 360);
        trail.push({
          x: newX,
          y: newY,
        });
        x = newX;
        y = newY;
        break;
      case "left":
        degrees -= cmd.value;
        break;
      case "right":
        degrees += cmd.value;
        break;
    }
  });
  drawSnail();
}

function moveSnail(direction: string) {
  const step = 5;
  switch (direction) {
    case "ArrowUp":
      y -= step;
      break;
    case "ArrowDown":
      y += step;
      break;
    case "ArrowLeft":
      x -= step;
      break;
    case "ArrowRight":
      x += step;
      break;
  }

  trail.push({ x, y });
  drawSnail();
}

document.addEventListener("keydown", (event) => {
  moveSnail(event.key);
});

drawSnail();
