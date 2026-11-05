/* build terminal-v1 */
(function(){
const slot=document.querySelector('.ndtabs-slot')||document.querySelector('.hero');
const tb=document.createElement('div');tb.className='ndtabs';
tb.innerHTML='<button type="button" id="t1">Legende</button><button type="button" id="t2" class="on">Night Desk</button>';
if(slot&&slot.classList.contains('ndtabs-slot')) slot.replaceWith(tb); else if(slot) slot.after(tb); else document.body.prepend(tb);
let sec=document.getElementById('nd');
if(!sec){sec=document.createElement('section');sec.id='nd';document.getElementById('coin').before(sec)}
const hero=document.querySelector('.hero'),home=document.getElementById('home');
let anim={from:0,to:0,t0:0,el:null,raf:0};
let uptimeTimer=0;

function sw(n){
  $('t1').classList.toggle('on',!n);$('t2').classList.toggle('on',n);
  sec.hidden=!n; if(home) home.hidden=!!n; if(hero) hero.hidden=!!n; $('coin').hidden=true;
  document.body.classList.toggle('nd-on',!!n);
  if(n){try{history.replaceState(null,'',location.pathname+location.search+'#tab=nd')}catch(e){} nd()}
  else{try{const d=localStorage.dp;history.replaceState(null,'',location.pathname+location.search+(d?'#d='+d:''))}catch(e){}}
}
$('t1').onclick=()=>sw(false);$('t2').onclick=()=>sw(true);

function parisTime(iso){
  if(!iso) return '—';
  try{
    const d=new Date(iso.includes('T')?iso:iso.replace(' ','T')+'+01:00');
    return d.toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }catch(e){return String(iso).slice(11,19)||'—'}
}
function money(n){if(n==null||n==='')return '—';return (n<0?'-':'')+'$'+Math.abs(+n).toFixed(2)}
function pct(n){if(n==null||n==='')return '—';const v=+n;return (v>=0?'+':'')+v.toFixed(2)+'%'}
function px(v){return v==null?'—':(+v).toPrecision(4)}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')}
function dash(v){return (v==null||v==='')?'—':v}
function ease(p){return 1-Math.pow(1-p,3)}
function setStack(el, target){
  const to=+target;
  if(!el) return;
  if(anim.raf) cancelAnimationFrame(anim.raf);
  const from=el.dataset.v!=null?+el.dataset.v:to;
  anim={from,to,t0:performance.now(),el,raf:0};
  const dur=700;
  function frame(now){
    const p=Math.min(1,(now-anim.t0)/dur);
    const cur=anim.from+(anim.to-anim.from)*ease(p);
    el.textContent=money(cur);
    el.dataset.v=cur;
    const delta=anim.to-anim.from;
    el.className='ndt-bal '+(Math.abs(delta)<0.005?'flat':delta>0?'up':'dn');
    if(p<1) anim.raf=requestAnimationFrame(frame);
    else{el.textContent=money(anim.to);el.dataset.v=anim.to;
      const start=+(el.dataset.start||0);
      const vs=anim.to-start;
      el.className='ndt-bal '+(Math.abs(vs)<0.005?'flat':vs>0?'up':'dn');
    }
  }
  anim.raf=requestAnimationFrame(frame);
}
function heldMin(iso){const m=Math.max(0,(Date.now()-new Date(iso).getTime())/60000);return m<60?Math.round(m)+' min':Math.floor(m/60)+'h'+String(Math.round(m%60)).padStart(2,'0')}

function fmtUptime(sec){
  if(sec==null||!isFinite(sec)||sec<0) return '—';
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function parseStart(iso){
  if(!iso) return null;
  try{
    if(iso.includes('T')) return new Date(iso).getTime();
    // 'YYYY-MM-DD HH:MM:SS' assumed Europe/Paris wall clock
    return new Date(iso.replace(' ','T')+'+01:00').getTime();
  }catch(e){return null}
}
function startUptimeClock(startedAt){
  if(uptimeTimer) clearInterval(uptimeTimer);
  const t0=parseStart(startedAt);
  const el=document.getElementById('ndtUptime');
  function tick(){
    if(!el) return;
    if(!t0){el.textContent='—';return}
    el.textContent=fmtUptime((Date.now()-t0)/1000);
  }
  tick();
  uptimeTimer=setInterval(tick,1000);
}

function agentIcon(name){
  const m={Scanner:'📡','Rug check':'🛡',Sizer:'📐',Executor:'⚡',Logger:'📝',Equity:'📈'};
  return m[name]||'•';
}
function statusClass(st){
  const s=(st||'').toUpperCase();
  if(s==='BLOCK'||s==='FAIL') return 'bad';
  if(s==='PASS'||s==='SCAN'||s==='WRITE'||s==='SIZE'||s==='OPEN') return 'ok';
  if(s==='FLAT'||s==='IDLE') return 'idle';
  return 'idle';
}
function tagClass(t){
  t=(t||'').toUpperCase();
  if(t==='ENTER') return 'enter';
  if(t==='EXIT') return 'exit';
  if(t==='FILTERED') return 'filt';
  if(t==='SKIP') return 'skip';
  return '';
}

function renderSettings(d){
  const b=document.getElementById('ndSettings'); if(!b) return;
  const s=d.settings||{};
  const active=!!s.momentum_gate_active;
  const rows=[
    ['Stop', s.STOP_PCT!=null?(s.STOP_PCT+' %'):'—'],
    ['Trailing', s.TRAIL_PCT!=null?(s.TRAIL_PCT+' %'):'—'],
    ['Max open', s.MAX_OPEN!=null?String(s.MAX_OPEN):'—'],
    ['Score mini', s.ANALYST_PASS!=null?String(s.ANALYST_PASS):'—'],
    ['Mise', s.POSITION_PCT!=null?(s.POSITION_PCT+' %'):'—'],
    ['Momentum', s.MOMENTUM_TOP_PCT!=null?('top '+s.MOMENTUM_TOP_PCT+' %'+(s.MOMENTUM_WINDOW?' · '+s.MOMENTUM_WINDOW:'')):'—'],
    ['Gate mom.', active?'actif':'off'],
  ];
  b.innerHTML=rows.map(([k,v])=>`<div class="st"><i>${esc(k)}</i><b class="${k==='Gate mom.'?(active?'up':''):''}">${esc(v)}</b></div>`).join('');
}
function renderPos(d){
  const b=$('ndPos');if(!b)return;const o=d.open||[];
  if(!o.length){b.innerHTML='<div class="ndt-empty">Aucune position ouverte</div>';return}
  b.innerHTML=o.map(p=>{const has=p.upnl_usd!=null;const cls=has?(+p.upnl_usd>=0?'up':'dn'):'';
    return `<div class="ndf-pcard"><div class="l"><b>${esc(p.symbol)}</b><small>ticket ${money(p.ticket_usd)} · ${heldMin(p.opened_at)}</small><small>entrée ${px(p.fill_price)} → ${has?px(p.last_price):'pas de prix'}${p.peak_pct!=null?' · pic '+pct(p.peak_pct):''}</small></div><div class="r"><b class="${cls}">${has?money(p.upnl_usd):'—'}</b><small class="${cls}">${has?pct(p.upnl_pct):''}</small></div></div>`}).join('');
}

function renderAgents(d){
  const b=$('ndtAgents'); if(!b) return;
  const list=d.agents||[];
  if(!list.length){b.innerHTML='<div class="ndt-empty">—</div>';return}
  b.innerHTML=list.map(a=>{
    const st=a.status||'IDLE';
    return `<div class="ndt-agent"><div class="ah"><span class="ico">${agentIcon(a.name)}</span><b>${esc(a.name)}</b><span class="pill ${statusClass(st)}">${esc(st)}</span></div><div class="ad">${esc(a.desc||'')}</div><div class="al">${esc(dash(a.last))}</div></div>`;
  }).join('');
  const nEl=$('ndtAgentsN'); if(nEl) nEl.textContent=String(list.length)+' online';
}

function renderFlow(d){
  const b=$('ndtFlow'); if(!b) return;
  const flow=d.flow||[];
  if(!flow.length){b.innerHTML='<div class="ndt-empty">pas de candidats</div>';return}
  b.innerHTML=flow.map(f=>{
    const bit=f.pass?('score '+f.score):(f.reject_reason||('score '+dash(f.score)));
    return `<div class="ndt-coin ${f.pass?'ok':'no'}"><b>$${esc(f.symbol)}</b><small>${esc(bit)}</small></div>`;
  }).join('');
}

function renderTiles(d){
  const b=$('ndtTiles'); if(!b) return;
  const c=d.counts||{};
  const lt=d.latest_trade;
  const lastEq=lt&&lt.pnl_usd!=null?((lt.pnl_usd>=0?'+':'')+Number(lt.pnl_usd).toFixed(2)):'—';
  const sizer=d.settings&&d.settings.POSITION_PCT!=null?(d.settings.POSITION_PCT+'% eq'):'—';
  const logLine=d.tail&&d.tail.length?('line · '+(d.tail[0].slice(0,24)+'…')):'—';
  b.innerHTML=`
    <div class="ndt-tile"><i>FILTERED</i><b>${c.filtered!=null?c.filtered:'—'}</b><small>${c.dropped!=null?(c.dropped+' dropped'):'—'}</small></div>
    <div class="ndt-tile"><i>SIZER</i><b>${esc(sizer)}</b><small>position pct</small></div>
    <div class="ndt-tile"><i>LOGGER</i><b>${(d.log||[]).length||'—'}</b><small>${esc(logLine)}</small></div>
    <div class="ndt-tile"><i>EQUITY</i><b class="${lt&&lt.pnl_usd!=null?(lt.pnl_usd>=0?'up':'dn'):''}">${esc(lastEq)}</b><small>last close</small></div>`;
}

function renderTrade(d){
  const b=$('ndtTrade'); if(!b) return;
  const t=d.latest_trade;
  if(!t){b.innerHTML='<div class="ndt-empty">pas encore de close</div>';return}
  const win=t.pnl_usd!=null&&+t.pnl_usd>=0;
  const slip=t.slippage_bps!=null?(Number(t.slippage_bps)/100).toFixed(2)+'%':'—';
  const size=t.pct_of_stack!=null?(Number(t.pct_of_stack).toFixed(0)+'% of equity'):(t.ticket_usd!=null?money(t.ticket_usd):'—');
  b.innerHTML=`<div class="ndt-th"><div><b class="${win?'up':'dn'}">$${esc(t.symbol)}</b> <span class="side">[${esc(t.side||'LONG')}]</span></div><b class="${win?'up':'dn'}">${t.pnl_usd!=null?money(t.pnl_usd):'—'}</b></div>
    <div class="ndt-tg">
      <div><i>entry</i><b>${px(t.entry)}</b></div>
      <div><i>exit</i><b>${px(t.exit)}</b></div>
      <div><i>pnl</i><b class="${win?'up':'dn'}">${pct(t.pnl_pct)}</b></div>
      <div><i>slip</i><b>${esc(slip)}</b></div>
      <div><i>size</i><b>${esc(size)}</b></div>
      <div><i>held</i><b>${t.held_min!=null?(Number(t.held_min).toFixed(1)+'m'):'—'}</b></div>
    </div>
    <div class="ndt-tr">exit: ${esc(t.rule||'—')}${t.ts?' · '+parisTime(t.ts):''}</div>`;
}

function renderTail(d){
  const b=$('ndtTail'); if(!b) return;
  const lines=d.tail||[];
  if(!lines.length){b.innerHTML='<div class="ndt-empty">log vide</div>';return}
  b.innerHTML=lines.map(l=>`<div>${esc(l)}</div>`).join('')+'<div class="ndt-cursor">█</div>';
}

function renderResult(d){
  const b=$('ndtResult'); if(!b) return;
  const start=+d.start_stack, equity=(d.equity!=null)?+d.equity:+d.stack;
  const c=d.counts||{};
  const w=c.wins||0, l=c.losses||0, tot=w+l;
  const wp=tot?Math.round(w/tot*100):0;
  b.innerHTML=`<div class="ndt-resrow"><div><i>START</i><b>${money(start)}</b></div><div class="now"><i>NOW</i><b class="${equity>=start?'up':'dn'}">${money(equity)}</b></div></div>
    <div class="ndt-bar"><span class="w" style="width:${wp}%"></span><span class="l" style="width:${tot?100-wp:0}%"></span></div>
    <div class="ndt-wl"><span class="up">${w} W</span> / <span class="dn">${l} L</span></div>`;
}

function renderLog(d){
  const b=$('ndtLog'); if(!b) return;
  const rows=d.log||[];
  if(!rows.length){b.innerHTML='<div class="ndt-empty">Aucun événement</div>';return}
  b.innerHTML=rows.slice(0,30).map(r=>{
    const tc=tagClass(r.tag);
    const outCls=(r.pnl_usd!=null?(+r.pnl_usd>=0?'up':'dn'):'');
    return `<div class="ndt-logrow ${tc}"><span class="t">${esc(parisTime(r.ts))}</span><span class="tag ${tc}">${esc(r.tag||'—')}</span><span class="sym">$${esc(r.symbol||'?')}</span><span class="why">${esc(r.reason||'—')}</span><span class="out ${outCls}">${esc(r.outcome||'—')}</span></div>`;
  }).join('');
}

async function nd(){
  if(sec.hidden) return;
  try{
    const r=await fetch('nightdesk.json?_='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw r.status;
    const d=await r.json();
    const start=+d.start_stack, stack=+d.stack, pnl=stack-start;
    const equity=(d.equity!=null)?+d.equity:stack, unr=+(d.unrealized_usd||0);
    const c=d.counts||{};
    const trades=c.fills!=null?c.fills:((d.fills||[]).length);
    const wins=c.wins!=null?c.wins:null;
    const losses=c.losses!=null?c.losses:null;

    if(!sec.querySelector('.ndt')){
      sec.innerHTML=`<div class="ndt">
        <div class="ndt-win">
          <div class="ndt-titlebar"><span class="dots"><i></i><i></i><i></i></span><span class="tt">Night Desk Terminal</span><span class="tr">overnight · six agents · log first</span></div>
          <div class="ndt-head">
            <div class="logo">GB</div>
            <div class="who">
              <div class="title">Night Desk <span class="ver">v1.1-night</span></div>
              <div class="run"><span class="dot"></span> running · <span id="ndtUptime">—</span></div>
              <div class="chip" id="ndtChip">—</div>
              <div class="sub">every trade gets a reason</div>
            </div>
            <div class="kpi">
              <div class="ndt-bal flat" id="ndStack" data-v="${equity}" data-start="${start}">${money(equity)}</div>
              <div class="badges"><span class="pap">${esc(d.mode||'PAPER')}</span><span class="lk">LIVE ${d.live_locked?'🔒':'ON'}</span></div>
              <div class="cnt"><span id="ndtTrades">${trades}</span> trades · <span class="up" id="ndtWins">${wins!=null?wins:'—'}</span> wins · <span class="dn" id="ndtLosses">${losses!=null?losses:'—'}</span> losses</div>
            </div>
          </div>

          <div class="ndt-grid">
            <div class="ndt-col">
              <div class="ndt-sec"><b>AGENTS</b> <small id="ndtAgentsN">—</small></div>
              <div id="ndtAgents"></div>
            </div>
            <div class="ndt-main">
              <div class="ndt-sec"><b>LIVE FLOW</b> <small>scan → check → size → exec → log</small></div>
              <div class="ndt-flowline" id="ndtFlow"></div>
              <div class="ndt-pipeline">
                <span>SCAN</span><i>→</i><span>CHECK</span><i>→</i><span>SIZE</span><i>→</i><span>EXEC</span><i>→</i><span>LOG</span>
              </div>
              <div class="ndt-tiles" id="ndtTiles"></div>

              <div class="ndt-sec"><b>TRADE · ENTRY VS EXIT</b></div>
              <div class="ndt-card" id="ndtTrade"></div>

              <div class="ndt-sec"><b>$ tail -f night.log</b></div>
              <div class="ndt-tail" id="ndtTail"></div>

              <div class="ndt-sec"><b>RESULT · start vs now</b></div>
              <div class="ndt-card" id="ndtResult"></div>
            </div>
          </div>

          <div class="ndt-sec"><b>Réglages</b> <small>papier · live</small></div>
          <div class="ndf-stats ndf-settings" id="ndSettings"></div>

          <div class="ndt-sec"><b>Positions</b> <small>prix live Risk · hors frais</small></div>
          <div class="ndf-pos" id="ndPos"></div>

          <div class="ndt-sec"><b>LOG</b> <small>Paris · newest first</small></div>
          <div class="ndt-log" id="ndtLog"></div>
        </div>
      </div>`;
      startUptimeClock(d.started_at);
    } else {
      // refresh uptime base if changed
      startUptimeClock(d.started_at);
    }

    const el=$('ndStack');
    if(el){el.dataset.start=start; setStack(el, equity)}
    const chip=$('ndtChip');
    if(chip){
      if(d.status_chip&&d.status_chip.text){
        chip.textContent=d.status_chip.text;
        chip.className='chip '+(d.status_chip.kind==='block'?'bad':'ok');
      } else {
        chip.textContent=d.test_daytime?'TEST DAYTIME':'NIGHT WINDOW';
        chip.className='chip idle';
      }
    }
    if($('ndtTrades')) $('ndtTrades').textContent=String(trades);
    if($('ndtWins')) $('ndtWins').textContent=wins!=null?String(wins):'—';
    if($('ndtLosses')) $('ndtLosses').textContent=losses!=null?String(losses):'—';
    const pap=sec.querySelector('.badges .pap'); if(pap) pap.textContent=d.mode||'PAPER';
    const lk=sec.querySelector('.badges .lk'); if(lk) lk.textContent='LIVE '+(d.live_locked?'🔒':'ON');

    renderAgents(d);
    renderFlow(d);
    renderTiles(d);
    renderTrade(d);
    renderTail(d);
    renderResult(d);
    renderSettings(d);
    renderPos(d);
    renderLog(d);
  }catch(e){
    if(!sec.querySelector('.ndt')) sec.innerHTML='<div class="ndt"><div class="ndt-empty">Night Desk : pas encore de données</div></div>';
  }
}
setInterval(nd,5000);

const boot=new URLSearchParams(location.hash.slice(1));
const bootq=new URLSearchParams(location.search);
const wantLeg=boot.get('tab')==='legende'||bootq.get('tab')==='legende';
if(wantLeg) sw(false); else sw(true);
})();
