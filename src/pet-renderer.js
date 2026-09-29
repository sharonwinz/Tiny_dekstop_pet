const pet = document.getElementById("pet"), bubble = document.getElementById("bubble"), chat = document.getElementById("chat");
const messages = document.getElementById("messages"), input = document.getElementById("input");
let settings = {}, visitTimer;

const builtIn = {
  hi:"Hi! I'm happy to see you. 🌸",
  hello:"Hello! I'm right here with you.",
  "nice to meet you":"Nice to meet you too! I'll be your tiny desk companion.",
  "how are you":"I'm doing well—just quietly keeping you company.",
  tired:"You sound tired. Maybe take a tiny break and stretch your shoulders?",
  water:"Water time! Take a few sips for me. 💧",
  stressed:"Take one slow breath. You don't have to solve everything at once.",
  stretch:"A quick stretch sounds good. Roll your shoulders and relax your neck."
};
const fallback = "I'm here with you. Take a small breath and keep going.";

function addMsg(text, who){ const d=document.createElement("div"); d.className=`msg ${who}`; d.textContent=text; messages.appendChild(d); messages.scrollTop=messages.scrollHeight; }
function choose(reason){
  const m={
    greeting:["Hi, how are you doing?","Hi, checking in.","Hi, still doing okay?"],
    water:["Hi, want some water?","Hi, water check."],
    stretch:["Hi, quick stretch?"],
    break:["Hi, need a break?"],
    mood:["How are you feeling?","Still doing okay?"]
  };
  const a=m[reason]||m.greeting; return a[Math.floor(Math.random()*a.length)];
}
async function showVisit(reason="greeting"){
  bubble.textContent=choose(reason); bubble.style.display="block";
  pet.classList.remove("enter","leave"); void pet.offsetWidth; pet.classList.add("enter");
  setTimeout(()=>pet.classList.remove("enter"),850);
  setTimeout(()=>{bubble.style.display="none"; pet.classList.add("leave");}, Math.max(10000, Math.min(30000, (settings.visitSeconds||15)*1000)));
  setTimeout(()=>{pet.classList.remove("leave"); bubble.style.display="none"; window.petAPI.hidePet();}, 32000);
}
function openChat(){ bubble.style.display="none"; chat.classList.remove("hidden"); input.focus(); }
async function reply(text){
  const t=text.toLowerCase().trim(); addMsg(text,"user");
  let r=null;
  if(settings.aiChat){
    try{
      const key=await window.petAPI.getApiKey();
      if(key){
        const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:"gpt-5-mini",input:[{role:"system",content:[{type:"input_text",text:"You are a tiny desktop companion. You are friendly, slightly playful and concise. Help with water, stretching and breaks. Most responses 1-2 sentences."}]},{role:"user",content:[{type:"input_text",text:t}]}]})});
        const data=await res.json(); r=data.output_text||null;
      }
    }catch{}
  }
  if(!r){
    for(const k of Object.keys(builtIn)) if(t.includes(k)){r=builtIn[k];break}
    if(!r) r=fallback;
  }
  addMsg(r,"bot");
}
document.getElementById("closeChat").onclick=()=>chat.classList.add("hidden");
document.getElementById("send").onclick=()=>{if(input.value.trim()){reply(input.value);input.value=""}};
input.addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("send").click()});
let petDragging = false, dragMoved = false, dragStartX = 0, dragStartY = 0, petStartX = 0, petStartY = 0;

pet.addEventListener("pointerdown", async (e) => {
  if (e.button !== 0) return;
  petDragging = true;
  dragMoved = false;
  dragStartX = e.screenX;
  dragStartY = e.screenY;
  const p = await window.petAPI.getPetPosition();
  petStartX = p.x;
  petStartY = p.y;
  pet.setPointerCapture?.(e.pointerId);
});

window.addEventListener("pointermove", async (e) => {
  if (!petDragging) return;
  const dx = e.screenX - dragStartX;
  const dy = e.screenY - dragStartY;
  if (Math.abs(dx) + Math.abs(dy) > 5) dragMoved = true;
  if (dragMoved) await window.petAPI.movePet({x: petStartX + dx, y: petStartY + dy});
});

window.addEventListener("pointerup", (e) => {
  if (!petDragging) return;
  petDragging = false;
  if (!dragMoved) openChat();
  try { pet.releasePointerCapture?.(e.pointerId); } catch {}
});

window.petAPI.getSettings().then(s=>settings=s);
window.petAPI.on("summon", d=>{settings={...settings,...(d||{})};showVisit(d?.reason||"greeting")});
window.petAPI.on("open-chat",openChat);
