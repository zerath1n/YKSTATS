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

  /* ---------- Tahmini sıralama (ÖSYM resmi yerleştirme puanı yığınsal dağılımları) ----------
     Kaynak: ÖSYM "YKS Sayısal Bilgiler" (2024, 2025, 2026).
     Her satır: o puan ve üstü adayların sayısı → [TYT, SAY, SÖZ, EA, DİL] */
  const TH=[550,530,510,490,470,450,430,410,390,370,350,330,310,290,270,250,230,210,190,170,150,130,115];
  const DATA={
    2024:[[59,162,3,5,13],[3017,2271,31,80,321],[12996,7029,142,340,1178],[29976,14673,476,940,2695],[53253,25274,1292,1992,5048],[82281,38578,3424,4269,8698],[118095,54307,8952,11111,13904],[163769,72418,21706,24612,20646],[223427,93485,45376,46809,28657],[304035,118001,83547,79522,37488],[412255,148110,139921,126223,47044],[560622,185681,219810,191807,57009],[761711,234882,328161,287762,67510],[1017130,300531,471676,422338,78753],[1318668,392302,652313,601868,90763],[1652661,531055,860119,831379,103810],[2011925,746123,1068917,1104426,118146],[2377153,1000554,1247074,1385617,132929],[2662249,1208531,1368579,1610447,145007],[2749663,1300183,1418232,1697303,151534],[2755201,1306920,1423773,1703735,153501],[2755276,1307007,1423849,1703833,153644],[2755277,1307007,1423849,1703833,153648]],
    2025:[[14,57,1,4,12],[601,1930,7,58,151],[3648,7081,26,261,596],[11733,16140,77,742,1606],[27141,29410,254,1629,3514],[52500,46142,721,3422,6543],[88915,65449,1926,8145,11267],[137133,87117,5036,20244,17830],[201126,111498,12522,42590,25711],[286158,139619,28323,76959,34148],[397823,174355,57848,125389,43151],[545280,217778,108894,192949,52414],[737144,274252,190203,287630,62210],[976188,348397,309551,418975,72337],[1251236,449880,468930,592803,83162],[1542701,596635,658973,806796,94736],[1835041,811201,849410,1042314,107318],[2099883,1052783,1010174,1262545,120937],[2270224,1228141,1121933,1425544,132272],[2308495,1287932,1168866,1489209,138558],[2310553,1291491,1173955,1494521,140478],[2310579,1291531,1174046,1494611,140655],[2310579,1291531,1174047,1494612,140657]],
    2026:[[112,154,4,12,14],[2045,3500,14,98,231],[8638,12887,69,394,942],[22600,27402,221,1118,2252],[45313,44919,606,2482,4241],[76021,63669,1566,5299,7472],[115071,83511,4058,12363,12254],[163211,105112,10184,29700,18566],[225038,129485,22750,58772,26352],[305570,157778,45237,97839,34585],[412011,191247,82479,148570,43129],[553526,232317,140496,215631,51784],[735519,282213,223004,307918,60948],[961261,344726,333238,429479,70670],[1219171,425443,474443,585271,81109],[1499060,533920,642816,775922,92274],[1782951,681176,814264,990764,104127],[2033331,858167,953036,1196809,116152],[2166477,1019046,1040347,1347025,125789],[2186977,1117304,1078859,1412649,131233],[2187734,1135198,1085505,1421093,132714],[2187742,1135713,1085697,1421289,132825],[2187743,1135718,1085698,1421290,132826]]
  };
  function rankOf(y,k,p){
    const c=DATA[y].map(r=>r[k]),n=TH.length;
    if(p<TH[n-1])return c[n-1];
    if(p>=TH[0])return Math.max(1,Math.round(c[0]*Math.max(0,560-p)/10));
    for(let i=0;i<n-1;i++){
      if(p<TH[i]&&p>=TH[i+1]){
        const f=(TH[i]-p)/(TH[i]-TH[i+1]);
        return Math.round(Math.exp(Math.log(c[i])+f*(Math.log(c[i+1])-Math.log(c[i]))));
      }
    }
  }
  const nf=x=>x.toLocaleString('tr-TR');
  function hesapla(){
    const out=$('hres');
    const k=+$('hpt').value,m=$('hpk').value,d=parseFloat($('hd').value);
    let p=parseFloat($('hp').value);
    if(isNaN(p)||p<100||p>560){out.textContent='Puanını 100 ile 560 arasında yaz.';return}
    if(m==='s'){
      if(isNaN(d)||d<50||d>100){out.textContent='Sınav puanı girdiysen diploma notunu (50-100) da yaz.';return}
      p+=d*0.6; /* OBP = diploma × 5, yerleştirme puanına × 0.12 eklenir */
    }
    S.hedef={k,p:$('hp').value,m,d:$('hd').value};save();
    const yrs=[2024,2025,2026],r=yrs.map(y=>rankOf(y,k,p));
    const est=Math.round((r[0]+2*r[1]+3*r[2])/6);
    out.innerHTML='<p class="mute">Yerleştirme puanın: <b style="color:var(--ink)">'+p.toFixed(1)+'</b></p>'+
      yrs.map((y,i)=>'<div class="item"><span>'+y+' sınavında bu puan</span><b>'+nf(r[i])+'. sıra</b></div>').join('')+
      '<div class="item" style="background:var(--bg);border-radius:12px;padding:10px;margin-top:6px"><span><b>2027 tahmini</b></span><b>≈ '+nf(est)+'. sıra</b></div>'+
      '<p class="mute" style="margin-top:6px">2027 tahmini, son 3 yılın ağırlıklı ortalamasıdır (2026 en ağır). Aralık: '+nf(Math.min(...r))+' – '+nf(Math.max(...r))+'.</p>';
  }

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
      c.innerHTML='<p style="font-weight:800;font-size:18px">Hedef</p><p class="mute" id="hdt" style="margin-top:6px"></p>'+
        '<div style="border-top:1px solid var(--line);margin-top:12px;padding-top:12px"><p style="font-weight:800">Tahmini sıralama</p>'+
        '<p class="mute" style="margin:2px 0 8px">ÖSYM’nin 2024, 2025 ve 2026 resmi puan dağılımlarına göre hesaplanır.</p>'+
        '<select id="hpt" style="margin-bottom:8px"><option value="1">SAY</option><option value="3">EA</option><option value="2">SÖZ</option><option value="4">DİL</option><option value="0">TYT</option></select>'+
        '<div class="row" style="margin-bottom:8px"><input id="hp" type="number" inputmode="decimal" min="100" max="560" placeholder="Puanın"><select id="hpk" style="width:auto"><option value="y">Yerleştirme puanı</option><option value="s">Sınav puanı (OBP’siz)</option></select></div>'+
        '<input id="hd" type="number" inputmode="decimal" min="50" max="100" placeholder="Diploma notu (50-100), sınav puanı girdiysen gerekli" style="margin-bottom:8px">'+
        '<button id="hgo" style="width:100%">Hesapla</button><div id="hres" style="margin-top:12px"></div>'+
        '<p class="mute" style="margin-top:8px">Bu bir tahmindir, gerçek sıralama o yılın puan dağılımına bağlıdır. Bir önceki yıl bir programa yerleştiysen OBP katkısı yarıya düşer.</p></div>';
      $('v-exam').appendChild(c);
      const h=S.hedef||{};
      if(h.k!=null)$('hpt').value=h.k;
      if(h.m)$('hpk').value=h.m;
      if(h.p)$('hp').value=h.p;
      if(h.d)$('hd').value=h.d;
      $('hgo').onclick=hesapla;
      if(h.p)hesapla();
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
