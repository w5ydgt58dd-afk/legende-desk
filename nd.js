/* build settings-mom-2 */
(function(){
const slot=document.querySelector('.ndtabs-slot')||document.querySelector('.hero');
const tb=document.createElement('div');tb.className='ndtabs';
tb.innerHTML='<button type="button" id="t1">Legende</button><button type="button" id="t2" class="on">Night Desk</button>';
if(slot&&slot.classList.contains('ndtabs-slot')) slot.replaceWith(tb); else if(slot) slot.after(tb); else document.body.prepend(tb);
let sec=document.getElementById('nd');
if(!sec){sec=document.createElement('section');sec.id='nd';document.getElementById('coin').before(sec)}
const hero=document.querySelector('.hero'),home=document.getElementById('home');
let anim={from:0,to:0,t0:0,el:null,raf:0};

function sw(n){
  $('t1').classList.toggle('on',!n);$('t2').classList.toggle('on',n);
  sec.hidden=!n; if(home) home.hidden=!!n; if(hero) hero.hidden=!!n; $('coin').hidden=true;
  document.body.classList.toggle('nd-on',!!n);
  if(n){try{history.replaceState(null,'',location.pathname+location.search+'#tab=nd')}catch(e){} nd()}
  else{try{const d=localStorage.dp;history.replaceState(null,'',location.pathname+location.search+(d?'#d='+d:''))}catch(e){}}
}
$('t1').onclick=()=>sw(false);$('t2').onclick=()=>sw(true);

function parisTime(iso){
  if(!iso) return '–';
  try{
    const d=new Date(iso);
    return d.toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }catch(e){return String(iso).slice(11,19)}
}
function money(n){return (n<0?'-':'')+'$'+Math.abs(+n).toFixed(2)}
function pct(n){const v=+n;return (v>=0?'+':'')+v.toFixed(2)+'%'}
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
    const delta=anim.to-(anim.from);
    el.className='ndf-stack '+(Math.abs(delta)<0.005?'flat':delta>0?'up':'dn');
    if(p<1) anim.raf=requestAnimationFrame(frame);
    else{el.textContent=money(anim.to);el.dataset.v=anim.to;
      const start=+(el.dataset.start||0);
      const vs=anim.to-start;
      el.className='ndf-stack '+(Math.abs(vs)<0.005?'flat':vs>0?'up':'dn');
    }
  }
  anim.raf=requestAnimationFrame(frame);
}

function buildLog(d){
  const rows=[];
  (d.fills||[]).forEach(o=>{
    if(!o||!o.ts) return;
    rows.push({ts:o.ts,symbol:o.symbol,kind:'buy',ticket:o.ticket_usd,pnl_pct:null,note:'buy'});
  });
  (d.closes||[]).forEach(c=>{
    if(!c||!c.ts) return;
    rows.push({ts:c.ts,symbol:c.symbol,kind:'sell',ticket:c.ticket_usd,pnl_pct:c.pnl_pct,pnl_usd:c.pnl_usd,note:c.rule||'sell'});
  });
  rows.sort((a,b)=> (a.ts<b.ts?1:a.ts>b.ts?-1:0));
  return rows;
}

function heldMin(iso){const m=Math.max(0,(Date.now()-new Date(iso).getTime())/60000);return m<60?Math.round(m)+' min':Math.floor(m/60)+'h'+String(Math.round(m%60)).padStart(2,'0')}
function px(v){return v==null?'–':(+v).toPrecision(4)}
function renderSettings(d){
  const b=document.getElementById('ndSettings'); if(!b) return;
  const s=d.settings||{};
  const active=!!s.momentum_gate_active;
  const esc=typeof E==='function'?E:(x=>String(x??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'));
  const rows=[
    ['Stop', s.STOP_PCT!=null?(s.STOP_PCT+' %'):'–'],
    ['Trailing', s.TRAIL_PCT!=null?(s.TRAIL_PCT+' %'):'–'],
    ['Max open', s.MAX_OPEN!=null?String(s.MAX_OPEN):'–'],
    ['Score mini', s.ANALYST_PASS!=null?String(s.ANALYST_PASS):'–'],
    ['Mise', s.POSITION_PCT!=null?(s.POSITION_PCT+' %'):'–'],
    ['Momentum', s.MOMENTUM_TOP_PCT!=null?('top '+s.MOMENTUM_TOP_PCT+' %'+(s.MOMENTUM_WINDOW?' · '+s.MOMENTUM_WINDOW:'')):'–'],
    ['Gate mom.', active?'actif':'off'],
  ];
  b.innerHTML=rows.map(([k,v])=>`<div class="st"><i>${esc(k)}</i><b class="${k==='Gate mom.'?(active?'up':''):''}">${esc(v)}</b></div>`).join('');
}
function renderPos(d){
  const b=$('ndPos');if(!b)return;const o=d.open||[];
  if(!o.length){b.innerHTML='<div class="ndf-empty">Aucune position ouverte</div>';return}
  b.innerHTML=o.map(p=>{const has=p.upnl_usd!=null;const cls=has?(+p.upnl_usd>=0?'up':'dn'):'';
    return `<div class="ndf-pcard"><div class="l"><b>${E(p.symbol)}</b><small>ticket ${money(p.ticket_usd)} · ${heldMin(p.opened_at)}</small><small>entrée ${px(p.fill_price)} → ${has?px(p.last_price):'pas de prix'}${p.peak_pct!=null?' · pic '+pct(p.peak_pct):''}</small></div><div class="r"><b class="${cls}">${has?money(p.upnl_usd):'–'}</b><small class="${cls}">${has?pct(p.upnl_pct):''}</small></div></div>`}).join('');
}
async function nd(){
  if(sec.hidden) return;
  try{
    const r=await fetch('nightdesk.json?_='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw r.status;
    const d=await r.json();
    const start=+d.start_stack, stack=+d.stack, pnl=stack-start;
    const equity=(d.equity!=null)?+d.equity:stack, unr=+(d.unrealized_usd||0);
    const mult=start?stack/start:0;
    const nOpen=(d.open||[]).length;
    const pnlCls=pnl>0.005?'up':pnl<-0.005?'dn':'';
    const log=buildLog(d);
    const upd=parisTime(d.updated_at);

    if(!sec.querySelector('.ndf')||!document.getElementById('ndSettings')){
      sec.innerHTML=`<div class="ndf">
        <div class="ndf-top">
          <div class="mark">GB</div>
          <div class="who"><b>Grok Bot</b><small>Night Desk · ${E(d.night_window||'')}</small></div>
          <div class="ndf-badges"><span class="pap">${E(d.mode||'PAPER')}</span><span class="lk">LIVE ${d.live_locked?'🔒':'ON'}</span></div>
        </div>
        <div class="ndf-stack flat" id="ndStack" data-v="${equity}" data-start="${start}">${money(equity)}</div>
        <div class="ndf-sub" id="ndSub">à jour ${E(upd)}${d.test_daytime?' · test de jour':''}</div>
        <div class="ndf-stats">
          <div class="st"><i>Put in</i><b id="ndPut">${money(start)}</b></div>
          <div class="st"><i>On paper</i><b id="ndPaper">${money(stack)}</b></div>
          <div class="st"><i>PnL</i><b id="ndPnl" class="${pnlCls}">${money(pnl)} (${pct(start?pnl/start*100:0)})</b></div>
          <div class="st"><i>Multiple</i><b id="ndMult">${mult.toFixed(2)}x</b></div>
          <div class="st"><i>Latent</i><b id="ndUnr">${money(unr)}</b></div>
          <div class="st"><i>Goal</i><b id="ndGoal">${d.goal_usd?money(stack)+' / '+money(+d.goal_usd):'—'}</b></div>
          <div class="st"><i>Open</i><b id="ndOpen">${nOpen}</b></div>
          <div class="st"><i>Trades</i><b id="ndTrades">${(d.counts&&d.counts.fills!=null)?d.counts.fills:((d.fills||[]).length)}</b></div>
        </div>
        <div class="ndf-logh"><b>Réglages</b><small>papier · live</small></div>
        <div class="ndf-stats ndf-settings" id="ndSettings"></div>
        <div class="ndf-logh"><b>Positions</b><small>prix live Risk · hors frais</small></div>
        <div class="ndf-pos" id="ndPos"></div>
        <div class="ndf-logh"><b>Copy log</b><small>Paris · newest first</small></div>
        <div class="ndf-log" id="ndLog"></div>
      </div>`;
    }
    const el=$('ndStack');
    if(el){el.dataset.start=start; setStack(el, equity)}
    if($('ndSub')) $('ndSub').textContent=`equity (stack ${money(stack)} + latent ${money(unr)})${d.equity_partial?' partiel':''} · à jour ${upd}${d.test_daytime?' · test de jour':''}`;
    if($('ndUnr')){$('ndUnr').textContent=money(unr);$('ndUnr').className=unr>0.005?'up':unr<-0.005?'dn':''}
    renderPos(d);
    if($('ndPut')) $('ndPut').textContent=money(start);
    if($('ndPaper')) $('ndPaper').textContent=money(stack);
    if($('ndPnl')){$('ndPnl').textContent=`${money(pnl)} (${pct(start?pnl/start*100:0)})`;$('ndPnl').className=pnlCls}
    if($('ndMult')) $('ndMult').textContent=mult.toFixed(2)+'x';
    if($('ndOpen')) $('ndOpen').textContent=String(nOpen);
    if($('ndGoal')) $('ndGoal').textContent=d.goal_usd?money(stack)+' / '+money(+d.goal_usd):'—';
    if($('ndTrades')) $('ndTrades').textContent=String((d.counts&&d.counts.fills!=null)?d.counts.fills:(d.fills||[]).length);
    // badges stay in sync
    const pap=sec.querySelector('.ndf-badges .pap'); if(pap) pap.textContent=d.mode||'PAPER';
    const lk=sec.querySelector('.ndf-badges .lk'); if(lk) lk.textContent='LIVE '+(d.live_locked?'🔒':'ON');

    const box=$('ndLog');
    if(box){
      if(!log.length){box.innerHTML='<div class="ndf-empty">Aucun trade pour l’instant</div>'}
      else{
        box.innerHTML=log.slice(0,40).map(row=>{
          const isBuy=row.kind==='buy';
          const side=isBuy?'BUY':'SELL';
          const sideCls=isBuy?'buy':'sell';
          let rightMain, rightCls='';
          if(isBuy){
            rightMain=row.ticket!=null?money(row.ticket):'–';
          }else{
            if(row.pnl_pct!=null){rightMain=pct(row.pnl_pct);rightCls=(+row.pnl_pct>=0)?'up':'dn'}
            else if(row.pnl_usd!=null){rightMain=money(row.pnl_usd);rightCls=(+row.pnl_usd>=0)?'up':'dn'}
            else rightMain='–';
          }
          const sub=isBuy
            ?(row.ticket!=null?`ticket ${money(row.ticket)}`:'buy')
            :(`${E(row.note||'sell')}${row.ticket!=null?' · '+money(row.ticket):''}${row.pnl_usd!=null?' · '+money(row.pnl_usd):''}`);
          return `<div class="ndf-row"><div class="side ${sideCls}">${side}</div><div class="mid"><b>${E(row.symbol)}</b><small>${parisTime(row.ts)} · ${sub}</small></div><div class="right"><b class="${rightCls}">${rightMain}</b><small>${isBuy?'entrée':'sortie'}</small></div></div>`;
        }).join('');
      }
    }
  }catch(e){
    if(!sec.querySelector('.ndf')) sec.innerHTML='<div class="ndf"><div class="ndf-empty">Night Desk : pas encore de données</div></div>';
  }
}
setInterval(nd,5000);

/* Default = Night Desk, unless user asks for Legende */
const boot=new URLSearchParams(location.hash.slice(1));
const bootq=new URLSearchParams(location.search);
const wantLeg=boot.get('tab')==='legende'||bootq.get('tab')==='legende';
if(wantLeg) sw(false); else sw(true);
})();
