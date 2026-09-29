const btn = document.getElementById("btn");

let dragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let startButtonX = 0;
let startButtonY = 0;

btn.addEventListener("mousedown", async (e) => {
  if (e.button !== 0) return;

  dragging = true;
  moved = false;
  startX = e.screenX;
  startY = e.screenY;

  const settings = await window.petAPI.getSettings();
  startButtonX = Number(settings.button?.x ?? 0);
  startButtonY = Number(settings.button?.y ?? 0);
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  const dx = e.screenX - startX;
  const dy = e.screenY - startY;

  if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;

  if (moved) {
    window.petAPI.moveButton({
      x: startButtonX + dx,
      y: startButtonY + dy
    });
  }
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

btn.addEventListener("click", () => {
  if (!moved) window.petAPI.summon("greeting");
  moved = false;
});
