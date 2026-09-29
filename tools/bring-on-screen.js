// Run with: npm run bring-on-screen
// This clears saved summon-button position; restarting the app then places it safely.
const fs=require("fs"),path=require("path"),os=require("os");
const p=path.join(os.homedir(),"AppData","Roaming","tiny-desktop-pet","settings.json");
try{const s=JSON.parse(fs.readFileSync(p,"utf8"));s.button={x:0,y:0};fs.writeFileSync(p,JSON.stringify(s,null,2));console.log("Saved button position reset. Restart Tiny Pet.");}
catch{console.log("No saved settings found yet. Start Tiny Pet normally.");}
