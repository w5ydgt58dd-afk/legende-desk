/* build 11 */
(function(){const tb=document.createElement('div');tb.className='ndtabs';tb.innerHTML='<button type="button" id="t1" class="on">Legende</button><button type="button" id="t2">Night Desk</button>';
document.querySelector('.hero').after(tb);const sec=document.createElement('section');sec.id='nd';sec.hidden=true;document.getElementById('coin').before(sec);
const hero=document.querySelector('.hero'),home=document.getElementById('home');
function sw(n){
  $('t1').classList.toggle('on',!n);$('t2').classList.toggle('on',n);
  sec.hidden=!n;home.hidden=!!n;hero.hidden=!!n;$('coin').hidden=true;
  if(n){try{history.replaceState(null,'',location.pathname+location.search+'#tab=nd')}catch(e){}
    nd()}
  else{try{history.replaceState(null,'',location.pathname+location.search+(localStorage.dp?'#d='+localStorage.dp:''))}catch(e){}}
}
$('t1').onclick=()=>sw(false);$('t2').onclick=()=>sw(true);
async function nd(){if(sec.hidden)return;
  try{
    const r=await fetch('nightdesk.json?_='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw r.status;
    const d=await r.json();
    const P=x=>`flow ${x.flow} · turn ${x.turnover} · move ${x.move} · spread ${x.spread} · win ${x.window}`;
    const openHtml=d.open&&d.open.length?d.open.map(o=>{
      const px=+(o.fill_price!=null?o.fill_price:o.fills_price);
      const stop=+o.stop_price;
      return `<div class="row"><b>${E(o.symbol)}</b> $${f(o.ticket_usd)} @ ${px?px.toPrecision(4):'–'} · stop ${stop?stop.toPrecision(4):'–'}<small>${E(o.opened_at||'')}</small></div>`;
    }).join(''):'<div class="row">Aucune</div>';
    sec.innerHTML=`<div class="card"><h3>🌙 Night Desk <small>${E((d.updated_at||'').slice(11,19))}</small></h3><b style="font-size:28px">$${f(d.stack)}</b> <small>départ $${d.start_stack} · ${E(d.mode)} · LIVE ${d.live_locked?'🔒':'ON'}${d.test_daytime?' · test de jour':''}</small><br><small>Fenêtre ${E(d.night_window)} · ${d.counts&&d.counts.pools||0} pools · ${d.counts&&d.counts.verdicts||0} verdicts</small></div>
<div class="card"><h3>Positions ouvertes (${(d.open||[]).length})</h3>${openHtml}</div>
<div class="card"><h3>Ordres</h3><div class="log">${(d.orders||[]).map(o=>`<div class="row">${E((o.ts||'').slice(11,19))} <b>${E(o.symbol)}</b> ${E(o.status)} ${o.ticket_usd!=null?'$'+f(o.ticket_usd):''}<small>${E(o.reason||'')}</small></div>`).join('')||'<div class="row">—</div>'}</div></div>
<div class="card"><h3>Clôtures</h3><div class="log">${(d.closes||[]).map(c=>`<div class="row">${E(c.symbol)} ${E(c.rule)} ${f(c.pnl_usd)}$ (${f(c.pnl_pct)}%)</div>`).join('')||'<div class="row">—</div>'}</div></div>
<div class="card"><h3>Scores Analyste</h3><div class="log">${(d.scores||[]).map(s=>`<div class="row">${s.pass?'✅':'❌'} ${E(s.symbol)} <b>${s.score}</b> · ${P(s.parts||{})}${s.reject_reason?'<br><small>'+E(s.reject_reason)+'</small>':''}</div>`).join('')||'<div class="row">—</div>'}</div></div>
<div class="card"><h3>Verdicts Scanner</h3><div class="log">${(d.verdicts||[]).map(v=>`<div class="row">${v.pass?'✅':'✂️'} ${E(v.symbol)} · ${E(v.reason)}</div>`).join('')||'<div class="row">—</div>'}</div></div>`;
  }catch(e){sec.innerHTML='<div class="card">Night Desk : pas encore de données</div>'}
}
setInterval(nd,5000);
const boot=new URLSearchParams(location.hash.slice(1));
const bootq=new URLSearchParams(location.search);
if(boot.get('tab')==='nd'||bootq.get('tab')==='nd')sw(true);
})();
