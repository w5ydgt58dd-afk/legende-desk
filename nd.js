(function(){const tb=document.createElement('div');tb.className='ndtabs';tb.innerHTML='<button id="t1" class="on">Legende</button><button id="t2">Night Desk</button>';
document.querySelector('.hero').after(tb);const sec=document.createElement('section');sec.id='nd';sec.hidden=true;document.getElementById('coin').before(sec);
const hero=document.querySelector('.hero'),home=document.getElementById('home');
function sw(n){$('t1').classList.toggle('on',!n);$('t2').classList.toggle('on',n);sec.hidden=!n;home.hidden=n;hero.hidden=n;$('coin').hidden=true;if(n)nd()}
$('t1').onclick=()=>sw(false);$('t2').onclick=()=>sw(true);
async function nd(){if(sec.hidden)return;let d;try{d=await j('nightdesk.json')}catch(e){sec.innerHTML='<div class="card">Night Desk : pas encore de données</div>';return}
const P=x=>`flow ${x.flow} · turn ${x.turnover} · move ${x.move} · spread ${x.spread} · win ${x.window}`;
sec.innerHTML=`<div class="card"><h3>🌙 Night Desk <small>${E(d.updated_at.slice(11,19))}</small></h3><b style="font-size:28px">$${f(d.stack)}</b> <small>départ $${d.start_stack} · ${d.mode} · LIVE ${d.live_locked?'🔒':'ON'}${d.test_daytime?' · test de jour':''}</small><br><small>Fenêtre ${E(d.night_window)} · ${d.counts.pools} pools · ${d.counts.verdicts} verdicts</small></div>
<div class="card"><h3>Position ouverte</h3>${d.open.length?d.open.map(o=>`${E(o.symbol)} $${f(o.ticket_usd)} @ ${(+o.fill_price).toPrecision(4)} · stop ${(+o.stop_price).toPrecision(4)}`).join('<br>'):'Aucune'}</div>
<div class="card"><h3>Ordres</h3><div class="log">${d.orders.map(o=>`${E(o.ts.slice(11,19))} ${E(o.symbol)} ${E(o.status)} ${o.ticket_usd!=null?'$'+f(o.ticket_usd):''} ${E(o.reason||'')}`).join('<br>')||'—'}</div></div>
<div class="card"><h3>Clôtures</h3><div class="log">${d.closes.map(c=>`${E(c.symbol)} ${E(c.rule)} ${f(c.pnl_usd)}$ (${f(c.pnl_pct)}%)`).join('<br>')||'—'}</div></div>
<div class="card"><h3>Scores Analyste</h3><div class="log">${d.scores.map(s=>`${s.pass?'✅':'❌'} ${E(s.symbol)} <b>${s.score}</b> · ${P(s.parts)}${s.reject_reason?'<br><small>'+E(s.reject_reason)+'</small>':''}`).join('<br>')}</div></div>
<div class="card"><h3>Verdicts Scanner</h3><div class="log">${d.verdicts.map(v=>`${v.pass?'✅':'✂️'} ${E(v.symbol)} · ${E(v.reason)}`).join('<br>')}</div></div>`}
setInterval(nd,30000)})();
