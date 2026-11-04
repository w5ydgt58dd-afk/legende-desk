const h=new URLSearchParams(location.hash.slice(1));if(h.get('d')){localStorage.dp=h.get('d');history.replaceState(null,'',location.pathname)}
const B='d/'+(localStorage.dp||'')+'/';const $=id=>document.getElementById(id);const f=n=>(+n).toFixed(2);
async function j(p){const r=await fetch(B+p+'?_='+Date.now());return r.json()}
function show(m){$('home').hidden=!!m;$('coin').hidden=!m;if(m)coin(m)}
async function tick(){try{const s=await j('state.json'),c=await j('chart.json'),a=await j('activity.json');
$('mode').textContent=s.mode+(s.paused?' · PAUSE':'');$('bal').textContent='$'+f(s.stack);const d=s.stack-s.start;$('pnl').innerHTML=`<span class="${d>=0?'up':'dn'}">${d>=0?'+':''}${f(d)} $</span> depuis $${s.start}`;
line($('chart'),c.map(r=>[r.ts,r.value]));
$('pos').innerHTML=s.open.length?s.open.map(p=>`<div class="row" onclick="show('${p.mint}')">${p.symbol} $${f(p.size_usd)} <span class="${p.upnl>=0?'up':'dn'}">${f(p.upnl)}</span><small>stop ${(+p.stop_price).toPrecision(4)}${p.trail_active?' · trail':''}</small></div>`).join(''):'<div class="row">Aucune</div>';
$('act').innerHTML=a.map(r=>`<div class="row" onclick="show('${r.mint}')">${r.title}<small>${new Date(r.ts*1000).toLocaleTimeString()} · ${r.agent} · ${r.subtitle||''}</small></div>`).join('')}catch(e){$('bal').textContent='hors ligne'}}
async function coin(m){const c=await j('coin/'+m+'.json');$('ctitle').textContent=(c.coin&&c.coin.symbol||'')+' '+m.slice(0,6)+'…';line($('cchart'),c.prices.map(p=>[p.ts,p.price]));
$('cbody').innerHTML=c.audits.map(a=>`<div class="row">${a.pass?'✅':'❌'} L${a.layer} ${a.name}<small>${a.value_text}</small></div>`).join('')+c.verdicts.map(v=>`<div class="row">Score ${v.score}<small>alive ${v.alive_6h} organic ${v.organic} flush ${v.flush} chase ${v.chase} · ${v.reason}</small></div>`).join('')}
tick();setInterval(tick,15000);
