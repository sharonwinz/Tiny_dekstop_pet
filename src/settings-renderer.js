const ids=["enabled","visitMinutes","waterMinutes","checkIns","sound","animationSpeed","petSize","aiChat","launchOnStartup","alwaysOnTop"];
const $=id=>document.getElementById(id);
window.petAPI.getSettings().then(s=>{ids.forEach(id=>{const e=$(id);if(!e)return;if(e.type==="checkbox")e.checked=!!s[id];else e.value=s[id]});window.petAPI.getApiKey().then(k=>$("apiKey").value=k)});
$("save").onclick=async()=>{const s={};ids.forEach(id=>{const e=$(id);s[id]=e.type==="checkbox"?e.checked:Number(e.value)});s.animationSpeed=Number($("animationSpeed").value);s.petSize=Number($("petSize").value);await window.petAPI.saveSettings(s);await window.petAPI.secureApiKey($("apiKey").value);$("status").textContent="Saved ✓";setTimeout(()=>$("status").textContent="",1800)};
document.querySelectorAll("[data-pause]").forEach(b=>b.onclick=()=>window.petAPI.pauseFor(Number(b.dataset.pause)));
$("resume").onclick=()=>window.petAPI.resume();
$("tomorrow").onclick=()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(0,0,0,0);window.petAPI.saveSettings({quietUntil:d.getTime()})};
