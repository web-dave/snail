import "./style.css";

type ICommand = "run" | "left" | "right" | "setAngle";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = 800;
canvas.height = 600;

const commands: { command: ICommand; value: number }[] = [];
const cmdList = document.querySelector(".sortable-list") as HTMLOListElement;
let draggedItem: HTMLLIElement | null = null;

document
  .querySelector(".play")
  ?.addEventListener("click", () => replayCommands());

document.querySelectorAll(".command").forEach((elem: Element) => {
  const cmd = elem.getAttribute("data-command") as ICommand;
  console.log("cmd => ", cmd);
  elem.addEventListener("click", () => addCommand(cmd));
});

let x = canvas.width / 2;
let y = canvas.height / 2;
let degrees = 0;
const size = 10;

function addCommand(command: ICommand) {
  const msg = {
    run: "Wie viele Schritte willst du gehen?",
    left: "Um wie viel Grad willst du dich gegen den Uhrzeigersinn drehen?",
    right: "Um wie viel Grad willst du dich im Uhrzeigersinn drehen?",
    setAngle: "Um wie viel Grad willst du dich im Uhrzeigersinn drehen?",
  };
  const ret = window.prompt(msg[command], "10");
  if (!!ret) {
    const value = parseInt(ret, 10);
    if (!isNaN(value)) {
      createCommand(command, value);
    }
  }
}

function createCommand(command: ICommand, value: number) {
  const li = document.createElement("li");
  li.classList.add(command);
  li.innerText = `${command} => ${value}`;
  li.draggable = true;
  cmdList?.appendChild(li);
  commands.push({ command, value });
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
      case "setAngle":
        degrees = cmd.value;
        break;
    }
    console.log(degrees);
  });
  drawSnail();
}
let keyDegrees = 0;
function moveSnail(direction: string) {
  let value = 0;

  switch (direction) {
    case "ArrowUp":
      value = -90;
      break;
    case "ArrowDown":
      value = 90;
      break;
    case "ArrowLeft":
      value = 180;
      break;
    case "ArrowRight":
      value = 0;
      break;
  }
  if (keyDegrees != value) {
    createCommand("setAngle", value);
    keyDegrees = value;
  }
  createCommand("run", 10);
}

document.addEventListener("keydown", (event) => {
  moveSnail(event.key);
});

cmdList.addEventListener("dragstart", (e: DragEvent) => {
  draggedItem = e.target as HTMLLIElement;
  (e.target as HTMLLIElement).style.opacity = "0.5";
});

cmdList.addEventListener("dragend", (e: DragEvent) => {
  (e.target as HTMLLIElement).style.opacity = "";
  draggedItem = null;
});

cmdList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(cmdList, e.clientY);
  if (afterElement == null) {
    cmdList.appendChild(draggedItem as HTMLLIElement);
  } else {
    cmdList.insertBefore(draggedItem as HTMLLIElement, afterElement);
  }
});

function getDragAfterElement(container: HTMLUListElement, y: number) {
  const draggableElements: any[] = [
    ...container.querySelectorAll<HTMLLIElement>('li:not([draggable="false"])'),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

drawSnail();
