/* yks-ek.js
   Kurulum: bu dosyayı index.html ile aynı klasöre koy ve index.html içinde
   ana </script> etiketinden hemen sonra, </body> öncesine şunu ekle:
   <script src="yks-ek.js"></script>
*/
(function(){
  /* ---------- CSS ---------- */
  const st=document.createElement('style');
  st.textContent='.rhero{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px;border-radius:22px;background:linear-gradient(135deg,var(--pen),#8F6BFF);color:#fff;margin-bottom:12px}.rhero p{opacity:.85;font-size:13px;margin-top:2px}.rn{font-size:22px}.rgoal{text-align:center;background:rgba(255,255,255,.18);border-radius:16px;padding:8px 12px}.rgoal b{display:block;font-size:22px}.rgoal span{font-size:11px}';
  document.head.appendChild(st);

  /* ---------- 1) YKS sayacı 10:15'te yenilensin ---------- */
  const cd=()=>Math.ceil((new Date(S.date+'T10:15:00')-Date.now())/864e5);
  const _render=render;
  render=function(){
    _render();
    const l=Math.max(0,cd());
    $('days').textContent=l;$('wd').textContent=l;$('m3').textContent=l+' gün kaldı';
    const t0=new Date('2026-09-01T00:00:00'),te=new Date(S.date+'T10:15:00'),pr=Math.min(1,Math.max(0,(Date.now()-t0)/(te-t0)));
    $('prog').style.width=pr*100+'%';
    $('progt').textContent='Hazırlık süreci: %'+Math.round(pr*100)+' tamamlandı (1 Eylül’den itibaren)';
    if(!$('hedefc')){
      const c=document.createElement('div');c.className='card';c.id='hedefc';
      c.innerHTML='<p style="font-weight:800;font-size:18px">Hedef</p><p class="mute" id="hdt" style="margin-top:6px"></p>';
      $('v-exam').appendChild(c);
    }
    $('hdt').textContent='Hedef sınav tarihi: '+new Date(S.date+'T00:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})+' ('+l+' gün kaldı). ⚠️ ÖSYM 2027 takvimini henüz açıklamadı, bu tarih tahminidir. Açıklanınca YKS sayacı sayfasından değiştir.';
  };
  let lastCd=cd();
  setInterval(()=>{const c=cd();if(c!==lastCd){lastCd=c;render()}},30000);

  /* ---------- 2) Oda hedefi ve odayı kapatma ---------- */
  let ROOM=null,unR=null,pendGoal=null;

  function closedRoom(){
    const code=S.cur,g=curG();
    if(unR){unR();unR=null}
    if(g){
      S.groups=gAll().filter(x=>x.code!==code);
      S.cur=S.groups[0]?S.groups[0].code:null;
      save();cloudSave();
      DB.doc('scores/'+code+'_'+UID).delete().catch(()=>{});
      gmsg='“'+g.name+'” odası kapatıldı.';
    }
    pick();
  }

  const _pick=pick;
  pick=function(){
    if(unR){unR();unR=null}
    ROOM=null;
    _pick();
    if(DB&&UID&&S.cur){
      unR=DB.doc('groups/'+S.cur).onSnapshot(d=>{
        if(!d.exists||d.data().closed){closedRoom();return}
        ROOM=d.data();
        if(ROOM.owner===UID&&ROOM.goal==null&&pendGoal!=null){
          const g=pendGoal;pendGoal=null;
          DB.doc('groups/'+S.cur).update({goal:g}).catch(()=>{});
        }
        if(!adding&&!profOpen&&rtab!=='chat')renderG();
      });
    }
  };

  const _renderG=renderG;
  renderG=function(){
    _renderG();
    const el=$('grp');if(!el||!DB)return;

    /* Oda kurma formuna hedef alanı */
    const gn=$('gname');
    if(gn&&!$('ggoal')){
      gn.closest('.row').insertAdjacentHTML('beforebegin','<input id="ggoal" type="number" min="0" max="16" step="0.5" inputmode="decimal" placeholder="Günlük hedef (saat), boş bırakabilirsin" style="margin-bottom:8px">');
    }
    if(adding||!curG())return;

    const td=ymd(new Date()),g=ROOM&&ROOM.goal?ROOM.goal*3600:0;
    const on=members.filter(m=>liveOf(m)).length;
    const hit=g?members.filter(m=>sumDays(m.days,td)>=g).length:0;

    /* Oda kartı */
    el.insertAdjacentHTML('afterbegin',
      '<div class="rhero"><div><b class="rn">'+esc(curG().name)+'</b><p>'+members.length+' üye · '+on+' çevrimiçi</p></div>'+
      (g?'<div class="rgoal"><b>'+hit+'/'+members.length+'</b><span>bugün '+ROOM.goal+' saate ulaştı</span></div>':'')+'</div>');

    /* Kutucuklara hedef çubuğu (Çalışma sekmesi) */
    if(g&&rtab==='live'){
      const t=members.map(m=>({ls:liveOf(m),d:sumDays(m.days,td)})).sort((a,b)=>(b.ls?1:0)-(a.ls?1:0)||b.d-a.d);
      el.querySelectorAll('.tile').forEach((tl,i)=>{
        const r=t[i];if(!r)return;
        tl.insertAdjacentHTML('beforeend','<div class="bar" style="height:5px;margin:6px 8px 0"><i style="width:'+Math.min(100,r.d/g*100)+'%;background:'+(r.d>=g?'#2F9E44':'')+'"></i></div>');
      });
    }

    /* Sadece oda sahibine: hedef değiştir + odayı kapat */
    if(ROOM&&ROOM.owner===UID){
      el.insertAdjacentHTML('beforeend','<div class="row" style="margin-top:8px"><button class="sec" data-a="setgoal" style="flex:1">Hedefi değiştir</button><button class="sec" data-a="close" style="flex:1;color:#D6336C">Odayı kapat</button></div>');
    }
  };

  $('grp').addEventListener('click',async e=>{
    const b=e.target.closest('[data-a]');if(!b||!DB)return;
    const a=b.dataset.a;
    if(a==='new'){
      const v=$('ggoal');
      pendGoal=v?Math.min(16,Math.max(0,parseFloat(v.value)||0)):0;
    }else if(a==='close'){
      if(!confirm('Oda herkes için kapatılacak. Emin misin?'))return;
      try{await DB.doc('groups/'+S.cur).update({closed:true})}catch(x){lastErr=x.code||'hata';renderG()}
    }else if(a==='setgoal'){
      const v=prompt('Günlük hedef (saat)',ROOM&&ROOM.goal||'');if(v===null)return;
      try{await DB.doc('groups/'+S.cur).update({goal:Math.min(16,Math.max(0,parseFloat(v)||0))})}catch(x){lastErr=x.code||'hata';renderG()}
    }
  },true);

  /* İlk açılışta yeniden çiz */
  if(DB&&UID)pick();
  render();
})();
