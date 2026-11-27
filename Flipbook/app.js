(() => {
  'use strict';
  const data = window.FLIPBOOK_DATA;
  if (!data || !window.St?.PageFlip) {
    document.getElementById('loadingScreen').innerHTML = '<b>বই লোড করা যায়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।</b>';
    return;
  }

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const strip = (html='') => { const d=document.createElement('div'); d.innerHTML=html; return d.textContent || ''; };
  const normalize = (v='') => String(v).toLocaleLowerCase().normalize('NFKC').replace(/[\s　・、。,.!！?？()（）「」『』【】\-_/／]/g,'');
  const loadingBar = $('#loadingBar');
  const bookRoot = $('#book');
  const zoomLayer = $('#zoomLayer');
  const descriptors = [];
  const firstPageByDay = new Map();
  const CHUNK_SIZE = 7;
  const TOC_PAGE_SIZE=12, tocPageCount=Math.ceil(data.days.length/TOC_PAGE_SIZE);

  function add(desc){ descriptors.push(desc); return descriptors.length-1; }
  add({type:'cover', title:data.title, density:'hard'});
  add({type:'credits', title:'এই সংস্করণ সম্পর্কে'});
  for(let i=0;i<tocPageCount;i++) add({type:'toc', title:`সূচিপত্র ${i+1}`, items:[]});

  for(const levelMeta of data.levels){
    const level=levelMeta.id;
    add({type:'level',level,title:`${level} Vocabulary`,total:levelMeta.total,weeks:levelMeta.weeks});
    for(let week=1;week<=levelMeta.weeks;week++){
      const weekDays=data.days.filter(d=>d.level===level&&d.week===week);
      const weekTotal=weekDays.reduce((n,d)=>n+d.entries.length,0);
      add({type:'week',level,week,title:`${level} · 第${week}週`,total:weekTotal});
      for(const day of weekDays){
        const key=`${level}.${week}.${day.day}`;
        if(day.mock){
          const idx=add({type:'mock',level,week,day:day.day,title:'Mock Test'});
          firstPageByDay.set(key,idx);
        }else{
          const chunks=[];
          for(let i=0;i<day.entries.length;i+=CHUNK_SIZE) chunks.push(day.entries.slice(i,i+CHUNK_SIZE));
          chunks.forEach((entries,part)=>{
            const idx=add({type:'vocab',level,week,day:day.day,title:day.title,entries,part:part+1,parts:chunks.length,
              from:part*CHUNK_SIZE+1,to:part*CHUNK_SIZE+entries.length,total:day.entries.length});
            if(part===0) firstPageByDay.set(key,idx);
          });
        }
      }
    }
  }
  if((descriptors.length+1)%2!==0) add({type:'notes',title:'নোট'});
  add({type:'back',title:data.title,density:'hard'});
  descriptors.forEach((d,i)=>{d.index=i;d.pageNo=i+1});

  const tocItems=data.days.map(day=>({
    level:day.level,week:day.week,day:day.day,title:day.mock?'Mock Test':day.title,
    count:day.entries.length,page:firstPageByDay.get(`${day.level}.${day.week}.${day.day}`)+1,mock:day.mock
  }));
  for(let i=0;i<tocPageCount;i++) descriptors[2+i].items=tocItems.slice(i*TOC_PAGE_SIZE,(i+1)*TOC_PAGE_SIZE);

  function footer(d,label='日本語総まとめ JLPT 語彙'){
    return `<div class="page-footer"><span>${esc(label)}</span><b>${d.pageNo}</b></div>`;
  }
  function renderCover(back=false){
    if(back) return `<div class="page-content cover-page back-cover"><div class="cover-wave"></div><div class="cover-main"><div class="cover-seal">語</div><div class="cover-kicker">OUR NIHONGO GAKKOU</div><div class="cover-title"><span>日本語総まとめ</span><br><b>JLPT 語彙</b></div><div class="cover-rule"></div><div class="cover-en">N3 → N2 → N1 COMPLETE EDITION</div><div class="back-contact">Md Hasanul Mobin · 01925-548059</div><div class="cover-instructor"><strong>学び続ける人が、最後に勝つ。</strong><span>যে শেখা চালিয়ে যায়, শেষ পর্যন্ত সেই জয়ী হয়।</span></div></div></div>`;
    const levelStats=data.levels.map(x=>`<span>${x.id} · ${x.total}語</span>`).join('');
    return `<div class="page-content cover-page all-level-cover"><div class="cover-wave"></div><div class="cover-topline"><span>JLPT VOCABULARY MASTER SERIES</span><span class="cover-badge">N3 → N2 → N1</span></div><div class="cover-seal">語</div><div class="cover-main"><div class="cover-kicker">日本語能力試験対策</div><div class="cover-title"><span>日本語総まとめ</span><br><b>JLPT 語彙</b></div><div class="cover-rule"></div><div class="cover-en">NIHONGO SO-MATOME · COMPLETE VOCABULARY</div><div class="cover-stats">${levelStats}<span>${data.total} TOTAL</span></div><div class="cover-instructor"><strong>${esc(data.author)}</strong><span>${esc(data.role)}</span><span class="cover-school">${esc(data.school)}</span></div></div></div>`;
  }
  function renderCredits(d){
    const levelLine=data.levels.map(x=>`${x.id}: ${x.total}語`).join(' · ');
    return `<div class="page-content paper-page"><div class="paper-heading"><div class="mini-seal">語</div><div><h2>এই সংস্করণ সম্পর্কে</h2><small>INTERACTIVE 3D MASTER EDITION</small></div></div><div class="credits-title">日本語総まとめ JLPT 語彙</div><div class="credits-sub">N3 → N2 → N1 · ${data.total} VOCABULARY</div><div class="credits-card"><div><small>Instructor</small><strong>${esc(data.author)}</strong></div><div><small>Role</small><strong>${esc(data.role)}</strong></div><div><small>Institution</small><strong>${esc(data.school)}</strong></div><div><small>Contact</small><strong>${esc(data.phone)}</strong></div><div><small>Levels</small><strong>${esc(levelLine)}</strong></div><div><small>Format</small><strong>3D Interactive Flipbook</strong></div></div><div class="credits-note">বইটি পর্যায়ক্রমে N3 থেকে শুরু হয়ে N2 এবং শেষে N1-এ পৌঁছাবে। প্রতিটি শব্দের読み方、漢字・表現、বাংলা অর্থ, জাপানি উদাহরণ এবং বাংলা ব্যাখ্যা অন্তর্ভুক্ত আছে।</div>${footer(d)}</div>`;
  }
  function renderToc(d){
    let currentLevel='',currentWeek=0,html='';
    for(const item of d.items){
      if(item.level!==currentLevel){currentLevel=item.level;currentWeek=0;html+=`<div class="toc-level-label level-${item.level.toLowerCase()}">${item.level} VOCABULARY</div>`;}
      if(item.week!==currentWeek){currentWeek=item.week;html+=`<div class="toc-week-label">第${item.week}週 · WEEK ${item.week}</div>`;}
      html+=`<button class="toc-entry" data-goto="${item.page-1}"><b>${item.level} W${item.week}-D${item.day}</b><span>${esc(item.title)}</span><em>${item.mock?'TEST':item.page}</em></button>`;
    }
    return `<div class="page-content toc-page"><div class="paper-heading"><div class="mini-seal">目</div><div><h2>সূচিপত্র</h2><small>N3 → N2 → N1 TABLE OF CONTENTS</small></div></div><div class="toc-columns">${html}</div>${footer(d)}</div>`;
  }
  function renderLevel(d){
    return `<div class="page-content level-page level-${d.level.toLowerCase()}"><div class="level-watermark">${d.level}</div><div class="level-kicker">日本語総まとめ · JLPT VOCABULARY</div><h2>${d.level}</h2><h3>語彙・表現</h3><p>${d.level} Vocabulary Master Section</p><div class="level-summary"><span>${d.total}語</span><span>${d.weeks} Weeks</span><span>${d.weeks*6} Study Days</span></div>${footer(d,`${data.author} · ${data.school}`)}</div>`;
  }
  function renderWeek(d){
    return `<div class="page-content week-page week-${d.week} level-${d.level.toLowerCase()}"><div class="week-kanji">週</div><div class="week-number">${d.level} · 日本語総まとめ</div><h2>第${d.week}週</h2><p>${d.level} · Week ${d.week} Vocabulary & Expressions</p><div class="week-summary"><span>${d.total}語</span><span>6 Study Days</span><span>1 Mock Test</span></div>${footer(d,`${d.level} · ${data.author}`)}</div>`;
  }
  function renderMock(d){
    return `<div class="page-content mock-page level-${d.level.toLowerCase()}"><div class="mock-icon">📝</div><h2>${d.level} · W${d.week}-D7</h2><h3>Mock Test & Weekly Review</h3><div class="mock-box">এই দিনে নতুন vocabulary নেই। ${d.level} Week ${d.week}-এর Day 1–6 থেকে読み方、漢字・表現、বাংলা অর্থ এবং উদাহরণ অনুশীলন করুন।</div><div class="mock-pill">0語 · 復習・実戦問題</div>${footer(d,`${d.level} Weekly Review`)}</div>`;
  }
  function renderVocab(d){
    const rows=d.entries.map((e,i)=>{
      const search=esc([e.term,e.reading,e.meaning,strip(e.exampleJp),e.exampleBn].join(' '));
      return `<article class="vocab-row" data-search="${search}" data-entry="${i}"><span class="vocab-no">${d.from+i}</span><div class="vocab-main"><div class="vocab-term"><div class="vocab-reading">${esc(e.reading)}</div><div class="vocab-word">${esc(e.term)}</div></div><div class="vocab-meaning">${esc(e.meaning)}</div><div class="vocab-examples"><div class="example-jp">${e.exampleJp}</div><div class="example-bn">→ ${esc(e.exampleBn)}</div></div></div></article>`;
    }).join('');
    return `<div class="page-content vocab-page level-${d.level.toLowerCase()}"><div class="vocab-head"><div><div class="vocab-day"><span class="level-chip">${d.level}</span> W${d.week}-D${d.day}</div><div class="vocab-topic">${esc(d.title)} · ${d.part}/${d.parts}</div></div><div class="vocab-count">${d.total}語</div></div><div class="vocab-list">${rows}</div><div class="page-footer"><span class="page-range">${d.level} · ${d.from}–${d.to} / ${d.total}</span><b>${d.pageNo}</b></div></div>`;
  }
  function renderNotes(d){
    return `<div class="page-content notes-page"><div class="notes-label">学習ノート · Study Notes</div><div class="notes-lines"></div>${footer(d)}</div>`;
  }
  function renderDescriptor(d){
    switch(d.type){
      case 'cover':return renderCover(false);case 'back':return renderCover(true);case 'credits':return renderCredits(d);
      case 'toc':return renderToc(d);case 'level':return renderLevel(d);case 'week':return renderWeek(d);case 'mock':return renderMock(d);
      case 'vocab':return renderVocab(d);case 'notes':return renderNotes(d);default:return '';
    }
  }

  descriptors.forEach((d,i)=>{
    const page=document.createElement('div');page.className=`page page-${d.type}`;page.dataset.pageIndex=i;
    if(d.density) page.dataset.density=d.density;
    page.innerHTML=renderDescriptor(d);bookRoot.appendChild(page);
    if(i%10===0) loadingBar.style.width=`${Math.min(88,14+(i/descriptors.length)*74)}%`;
  });
  bookRoot.classList.add('ready');

  const hashPage=()=>{
    const m=location.hash.match(/p=(\d+)/);return m?Math.max(0,Math.min(descriptors.length-1,Number(m[1])-1)):0;
  };
  const pageFlip=new St.PageFlip(bookRoot,{
    width:600,height:820,size:'stretch',minWidth:300,maxWidth:600,minHeight:410,maxHeight:820,
    drawShadow:true,maxShadowOpacity:.56,showCover:true,mobileScrollSupport:false,usePortrait:true,
    startPage:hashPage(),flippingTime:540,startZIndex:10,autoSize:true,clickEventForward:true,
    showPageCorners:true,disableFlipByClick:false,swipeDistance:20,useMouseEvents:true
  });
  pageFlip.loadFromHTML($$('.page',bookRoot));
  loadingBar.style.width='100%';

  const pageInput=$('#pageInput'), pageTotal=$('#pageTotal');
  const firstBtn=$('#firstBtn'),prevBtn=$('#prevBtn'),nextBtn=$('#nextBtn'),lastBtn=$('#lastBtn');
  pageTotal.textContent=descriptors.length;
  let currentPage=hashPage(),autoTimer=null,soundEnabled=true,zoom=1,toastTimer;
  let pendingDirection=1,soundPlayedForFlip=false,surfaceGesture=null;
  let panX=0,panY=0,lastSurfaceTap={time:0,x:0,y:0},singleClickTimer=null,suppressNativeDblUntil=0,wheelLock=0;
  let flipSoundBytes=null,decodedFlipSound=null;

  // Physical fore-edge stacks: completed pages grow on the left, remaining pages shrink on the right.
  const bookWrapper=bookRoot.querySelector('.stf__wrapper');
  const leftStack=document.createElement('div'),rightStack=document.createElement('div');
  leftStack.className='page-stack page-stack-left';rightStack.className='page-stack page-stack-right';
  leftStack.setAttribute('aria-hidden','true');rightStack.setAttribute('aria-hidden','true');
  bookWrapper?.append(leftStack,rightStack);
  fetch('assets/page-flip.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>{flipSoundBytes=b;}).catch(()=>{});
  const unlockFlipAudio=()=>{try{const C=window.AudioContext||window.webkitAudioContext;const ctx=flipSound.ctx||(flipSound.ctx=new C());ctx.resume();}catch(e){}};
  document.addEventListener('pointerdown',unlockFlipAudio,{once:true,passive:true});
  document.addEventListener('keydown',unlockFlipAudio,{once:true});

  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200);}
  function updatePageStacks(){
    const progress=descriptors.length>1?currentPage/(descriptors.length-1):0;
    const leftDepth=2+Math.round(progress*13),rightDepth=2+Math.round((1-progress)*13);
    if(leftStack){leftStack.style.setProperty('--stack-depth',`${leftDepth}px`);leftStack.style.setProperty('--stack-opacity',String(.28+progress*.68));}
    if(rightStack){rightStack.style.setProperty('--stack-depth',`${rightDepth}px`);rightStack.style.setProperty('--stack-opacity',String(.28+(1-progress)*.68));}
    bookWrapper?.style.setProperty('--book-progress',String(progress));
  }
  function updateControls(index){
    currentPage=Math.max(0,Math.min(descriptors.length-1,index));pageInput.value=currentPage+1;
    firstBtn.disabled=prevBtn.disabled=currentPage<=0;nextBtn.disabled=lastBtn.disabled=currentPage>=descriptors.length-1;
    history.replaceState(null,'',`${location.pathname}${location.search}#p=${currentPage+1}`);
    $$('.thumb-card').forEach((t,i)=>t.classList.toggle('active',i===currentPage));
    zoomLayer.classList.toggle('front-cover-view',currentPage===0);
    zoomLayer.classList.toggle('back-cover-view',currentPage===descriptors.length-1);
    updatePageStacks();
    const active=$(`.thumb-card[data-page="${currentPage}"]`);if(active&&$('#sideDrawer').classList.contains('open'))active.scrollIntoView({block:'nearest'});
  }
  function proceduralPaperSound(ctx,direction){
    const length=Math.floor(ctx.sampleRate*.34),buffer=ctx.createBuffer(1,length,ctx.sampleRate),out=buffer.getChannelData(0);
    for(let i=0;i<length;i++){const t=i/length;out[i]=(Math.random()*2-1)*(.25*(1-t))*(.6+.4*Math.sin(t*Math.PI));}
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    filter.type='bandpass';filter.frequency.value=1250;filter.Q.value=.62;gain.gain.setValueAtTime(.001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.34);src.buffer=buffer;
    if(ctx.createStereoPanner){const pan=ctx.createStereoPanner();pan.pan.setValueAtTime(direction*.45,ctx.currentTime);pan.pan.linearRampToValueAtTime(-direction*.45,ctx.currentTime+.32);src.connect(filter).connect(pan).connect(gain).connect(ctx.destination);}else src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  }
  async function flipSound(direction=1){
    if(!soundEnabled)return;
    try{
      const C=window.AudioContext||window.webkitAudioContext;const ctx=flipSound.ctx||(flipSound.ctx=new C());
      if(ctx.state==='suspended')await ctx.resume();
      if(!decodedFlipSound){
        if(!flipSoundBytes){const r=await fetch('assets/page-flip.mp3');flipSoundBytes=await r.arrayBuffer();}
        decodedFlipSound=await ctx.decodeAudioData(flipSoundBytes.slice(0));
      }
      const now=ctx.currentTime,src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=decodedFlipSound;src.playbackRate.value=.96+Math.random()*.07;
      gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(.72,now+.02);gain.gain.setValueAtTime(.72,now+Math.max(.08,decodedFlipSound.duration-.18));gain.gain.exponentialRampToValueAtTime(.001,now+decodedFlipSound.duration);
      if(ctx.createStereoPanner){const pan=ctx.createStereoPanner();pan.pan.setValueAtTime(direction*.62,now);pan.pan.linearRampToValueAtTime(-direction*.5,now+Math.min(.72,decodedFlipSound.duration));src.connect(pan).connect(gain).connect(ctx.destination);}else src.connect(gain).connect(ctx.destination);
      src.start(now);
      const thump=ctx.createOscillator(),thumpGain=ctx.createGain();thump.type='sine';thump.frequency.setValueAtTime(92,now);thump.frequency.exponentialRampToValueAtTime(48,now+.11);thumpGain.gain.setValueAtTime(.001,now);thumpGain.gain.exponentialRampToValueAtTime(.035,now+.015);thumpGain.gain.exponentialRampToValueAtTime(.001,now+.12);thump.connect(thumpGain).connect(ctx.destination);thump.start(now);thump.stop(now+.13);
    }catch(e){try{proceduralPaperSound(flipSound.ctx,direction);}catch(_){} }
  }
  pageFlip.on('flip',e=>updateControls(e.data));
  pageFlip.on('changeState',e=>{
    const moving=e.data==='flipping'||e.data==='user_fold';
    bookRoot.classList.toggle('is-flipping',moving);
    bookWrapper?.classList.toggle('turning-forward',moving&&pendingDirection>0);
    bookWrapper?.classList.toggle('turning-backward',moving&&pendingDirection<0);
    if(moving&&!soundPlayedForFlip){soundPlayedForFlip=true;flipSound(pendingDirection);}
    if(e.data==='read'){soundPlayedForFlip=false;bookWrapper?.classList.remove('turning-forward','turning-backward');}
  });
  updateControls(currentPage);

  function flipTo(index){pendingDirection=index>=currentPage?1:-1;pageFlip.flip(Math.max(0,Math.min(descriptors.length-1,index)));}
  function flipNext(){pendingDirection=1;pageFlip.flipNext();}
  function flipPrev(){pendingDirection=-1;pageFlip.flipPrev();}
  firstBtn.onclick=()=>flipTo(0);prevBtn.onclick=flipPrev;nextBtn.onclick=flipNext;lastBtn.onclick=()=>flipTo(descriptors.length-1);
  pageInput.addEventListener('change',()=>{const n=Math.max(1,Math.min(descriptors.length,parseInt(pageInput.value)||1));flipTo(n-1);});
  pageInput.addEventListener('keydown',e=>{if(e.key==='Enter')pageInput.dispatchEvent(new Event('change'));});
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
    if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();flipNext();}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();flipPrev();}
    if(e.key==='Home')flipTo(0);if(e.key==='End')flipTo(descriptors.length-1);
    if(e.key==='Escape'){closeDrawer();closeMenus();$('#infoModal').classList.remove('show');}
  });

  /* Full-surface book interaction: corners, fore-edge, page middle, click, pan and wheel. */
  const stage=$('#stage');
  const isInteractiveTarget=t=>t instanceof Element&&!!t.closest('button,a,input,textarea,select,label');
  const eventPoint=e=>pageFlip.getUI().getMousePos(e.clientX,e.clientY);
  const sideDirection=x=>{const r=bookRoot.getBoundingClientRect();return x>=r.left+r.width/2?1:-1;};
  function clickTurn(x){if(sideDirection(x)>0)flipNext();else flipPrev();}
  function toggleDoubleZoom(x,y){
    clearTimeout(singleClickTimer);singleClickTimer=null;
    if(zoom>1.01){zoomLayer.style.transformOrigin='center center';applyZoom(1);toast('Zoom স্বাভাবিক অবস্থায়');}
    else{
      const r=zoomLayer.getBoundingClientRect(),ox=Math.max(0,Math.min(100,(x-r.left)/r.width*100)),oy=Math.max(0,Math.min(100,(y-r.top)/r.height*100));
      zoomLayer.style.transformOrigin=`${ox}% ${oy}%`;applyZoom(1.7);toast('Zoom চালু — মাউস ধরে সরান');
    }
  }
  function handleSurfaceTap(x,y){
    const now=performance.now(),isDouble=now-lastSurfaceTap.time<330&&Math.hypot(x-lastSurfaceTap.x,y-lastSurfaceTap.y)<28;
    if(isDouble){lastSurfaceTap.time=0;suppressNativeDblUntil=now+450;toggleDoubleZoom(x,y);return;}
    lastSurfaceTap={time:now,x,y};
    if(zoom<=1.01){
      clearTimeout(singleClickTimer);
      singleClickTimer=setTimeout(()=>{singleClickTimer=null;if(zoom<=1.01)clickTurn(x);},300);
    }
  }
  function finishSurfaceGesture(e,cancel=false){
    const g=surfaceGesture;if(!g||g.id!==e.pointerId)return;
    surfaceGesture=null;bookRoot.classList.remove('is-grabbing');stage.classList.remove('is-panning');
    const point=eventPoint(e),dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(g.mode==='flip'){
      if(g.moved){
        const strong=Math.abs(dx)>Math.max(34,bookRoot.getBoundingClientRect().width*.12)&&Math.abs(dx)>Math.abs(dy)*1.08;
        const correctWay=(g.direction>0&&dx<0)||(g.direction<0&&dx>0);
        if(!cancel&&strong&&correctWay){
          pageFlip.userStop(point,true);
          const controller=pageFlip.getFlipController(),calc=controller.getCalculation();
          if(calc){
            const bounds=pageFlip.getBoundsRect(),pos=calc.getPosition(),endY=calc.getCorner()==='bottom'?bounds.height:0;
            controller.animateFlippingTo(pos,{x:-bounds.pageWidth,y:endY},true);
          }else if(g.direction>0)flipNext();else flipPrev();
        }else pageFlip.userStop(point,false);
      }else{pageFlip.userStop(point,true);handleSurfaceTap(e.clientX,e.clientY);}
    }else if(g.mode==='pan'&&!g.moved&&!cancel)handleSurfaceTap(e.clientX,e.clientY);
    else if(g.mode==='right'&&!cancel&&Math.hypot(dx,dy)<8)clickTurn(e.clientX);
    try{bookRoot.releasePointerCapture(e.pointerId);}catch(_){}
    if(e.cancelable)e.preventDefault();e.stopPropagation();
  }
  bookRoot.addEventListener('pointerdown',e=>{
    if(isInteractiveTarget(e.target)||surfaceGesture)return;
    if(e.pointerType==='mouse'&&![0,2].includes(e.button))return;
    unlockFlipAudio();if(autoTimer)stopAuto();
    const mode=zoom>1.01?'pan':(e.button===2?'right':'flip');
    const direction=sideDirection(e.clientX);
    surfaceGesture={id:e.pointerId,mode,direction,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,startPanX:panX,startPanY:panY,moved:false,lastPoint:eventPoint(e)};
    pendingDirection=direction;
    if(mode==='flip')pageFlip.startUserTouch(surfaceGesture.lastPoint);
    bookRoot.classList.add('is-grabbing');if(mode==='pan')stage.classList.add('is-panning');
    try{bookRoot.setPointerCapture(e.pointerId);}catch(_){}
    if(e.cancelable)e.preventDefault();e.stopPropagation();
  },{capture:true,passive:false});
  bookRoot.addEventListener('pointermove',e=>{
    const g=surfaceGesture;if(!g||g.id!==e.pointerId)return;
    const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.hypot(dx,dy)>4)g.moved=true;
    if(g.mode==='pan'&&g.moved){panX=g.startPanX+dx;panY=g.startPanY+dy;renderZoom();}
    else if(g.mode==='flip'&&g.moved){const p=eventPoint(e);g.lastPoint=p;pageFlip.userMove(p,false);}
    if(e.cancelable)e.preventDefault();e.stopPropagation();
  },{capture:true,passive:false});
  window.addEventListener('pointerup',e=>finishSurfaceGesture(e,false),{capture:true,passive:false});
  window.addEventListener('pointercancel',e=>finishSurfaceGesture(e,true),{capture:true,passive:false});

  // Suppress PageFlip's legacy mouse/touch handlers; the unified pointer controller above drives it directly.
  const suppressLegacy=e=>{
    if(isInteractiveTarget(e.target)){e.stopImmediatePropagation();return;}
    if(surfaceGesture||zoom>1.01||e.type==='mousedown'||e.type==='touchstart'){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();}
  };
  ['mousedown','mousemove','mouseup','touchstart','touchmove','touchend'].forEach(type=>bookRoot.addEventListener(type,suppressLegacy,{capture:true,passive:false}));
  bookRoot.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();});
  bookRoot.addEventListener('dblclick',e=>{
    if(isInteractiveTarget(e.target))return;e.preventDefault();e.stopPropagation();
    if(performance.now()<suppressNativeDblUntil)return;
    toggleDoubleZoom(e.clientX,e.clientY);
  },{capture:true});
  stage.addEventListener('wheel',e=>{
    if(e.ctrlKey)return;
    e.preventDefault();unlockFlipAudio();
    if(zoom>1.01){panX-=e.deltaX;panY-=e.deltaY;renderZoom();return;}
    const now=performance.now();if(now-wheelLock<620||Math.abs(e.deltaY)<5)return;wheelLock=now;
    if(e.deltaY>0)flipNext();else flipPrev();
  },{passive:false});

  /* Drawer */
  const drawer=$('#sideDrawer'),backdrop=$('#drawerBackdrop');
  function setTab(name){
    $$('.drawer-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
    $$('.drawer-panel').forEach(p=>p.classList.toggle('active',p.id===`${name}Panel`));
    if(name==='search')setTimeout(()=>$('#searchInput').focus(),120);
  }
  function openDrawer(tab='thumbs'){drawer.classList.add('open');backdrop.classList.add('show');setTab(tab);}
  function closeDrawer(){drawer.classList.remove('open');backdrop.classList.remove('show');}
  $('#thumbsBtn').onclick=()=>openDrawer('thumbs');$('#searchBtn').onclick=()=>openDrawer('search');$('#openThumbsTop').onclick=()=>openDrawer('thumbs');
  $('#closeDrawer').onclick=closeDrawer;backdrop.onclick=closeDrawer;$$('.drawer-tab').forEach(t=>t.onclick=()=>setTab(t.dataset.tab));

  function thumbPreview(d){
    if(['cover','back'].includes(d.type))return `<div class="thumb-preview cover">日本語総まとめ<br>JLPT 語彙</div>`;
    if(d.type==='level')return `<div class="thumb-preview level ${d.level.toLowerCase()}">${d.level}<small>${d.total}語</small></div>`;
    if(d.type==='week')return `<div class="thumb-preview week">${d.level} · 第${d.week}週</div>`;
    if(d.type==='vocab')return `<div class="thumb-preview"><div class="thumb-title">${d.level} · W${d.week}-D${d.day} · ${esc(d.title)}</div><div class="thumb-lines">${'<i></i>'.repeat(Math.min(6,d.entries.length))}</div></div>`;
    return `<div class="thumb-preview"><div class="thumb-title">${esc(d.title)}</div><div class="thumb-lines">${'<i></i>'.repeat(7)}</div></div>`;
  }
  $('#thumbnailList').innerHTML=descriptors.map(d=>`<button class="thumb-card${d.index===currentPage?' active':''}" data-page="${d.index}">${thumbPreview(d)}<div class="thumb-meta"><span>${esc(d.title||d.type)}</span><b>${d.pageNo}</b></div></button>`).join('');
  $$('.thumb-card').forEach(t=>t.onclick=()=>{flipTo(Number(t.dataset.page));if(innerWidth<700)closeDrawer();});

  const drawerToc=$('#tocList');let tocHtml='',tl='',tw=0;
  for(const item of tocItems){
    if(item.level!==tl){
      tl=item.level;tw=0;
      const levelPage=descriptors.find(d=>d.type==='level'&&d.level===tl);
      tocHtml+=`<button class="toc-level-label level-${tl.toLowerCase()}" data-goto="${levelPage.pageNo-1}"><strong>${tl} 語彙</strong><span>${levelPage.total}語</span></button>`;
    }
    if(item.week!==tw){tw=item.week;tocHtml+=`<div class="toc-week-label">${tl} · 第${tw}週 · WEEK ${tw}</div>`;}
    tocHtml+=`<button class="toc-entry" data-goto="${item.page-1}"><b>${item.level} W${item.week}-D${item.day}</b><span>${esc(item.title)}</span><em>${item.mock?'TEST':item.page}</em></button>`;
  }
  drawerToc.innerHTML=tocHtml;
  document.addEventListener('click',e=>{const b=e.target.closest('[data-goto]');if(b){flipTo(Number(b.dataset.goto));if(b.closest('#sideDrawer')&&innerWidth<700)closeDrawer();}});

  /* Search */
  const searchIndex=[];
  for(const d of descriptors){
    if(d.type!=='vocab')continue;
    d.entries.forEach((entry,row)=>searchIndex.push({entry,row,page:d.index,level:d.level,week:d.week,day:d.day,
      text:normalize([d.level,entry.term,entry.reading,entry.meaning,strip(entry.exampleJp),entry.exampleBn].join(' '))}));
  }
  let searchTimer;
  $('#searchInput').addEventListener('input',e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>runSearch(e.target.value),110);});
  function runSearch(value){
    const q=normalize(value),out=$('#searchResults'),meta=$('#searchMeta');
    if(!q){meta.textContent='অনুসন্ধান লিখুন';out.innerHTML='';return;}
    const hits=searchIndex.filter(x=>x.text.includes(q)).slice(0,100);meta.textContent=`${hits.length}${hits.length===100?'+':''}টি ফলাফল`;
    if(!hits.length){out.innerHTML='<div class="no-result">কোনো ফলাফল পাওয়া যায়নি</div>';return;}
    out.innerHTML=hits.map((h,i)=>`<button class="search-result" data-hit="${i}"><b>${esc(h.entry.term)}</b><small>${esc(h.entry.reading)} · ${h.level} W${h.week}-D${h.day} · পৃষ্ঠা ${h.page+1}</small><p>${esc(h.entry.meaning)}</p></button>`).join('');
    $$('.search-result',out).forEach((b,i)=>b.onclick=()=>{
      const h=hits[i];flipTo(h.page);setTimeout(()=>{
        const page=$(`.page[data-page-index="${h.page}"]`),row=page?.querySelector(`.vocab-row[data-entry="${h.row}"]`);
        if(row){row.classList.remove('search-hit');void row.offsetWidth;row.classList.add('search-hit');}
      },620);if(innerWidth<700)closeDrawer();
    });
  }

  /* Zoom, mouse-panning and autoplay */
  function renderZoom(){
    if(zoom<=1.01){panX=0;panY=0;stage.classList.remove('zoom-active','is-panning');bookRoot.classList.remove('zoom-pannable');}
    else{
      const maxX=Math.max(36,(zoomLayer.offsetWidth*zoom-stage.clientWidth)/2+48),maxY=Math.max(30,(zoomLayer.offsetHeight*zoom-stage.clientHeight)/2+38);
      panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));
      stage.classList.add('zoom-active');bookRoot.classList.add('zoom-pannable');
    }
    zoomLayer.style.transform=`translate3d(${panX}px,${panY}px,0) scale(${zoom})`;
    $('#zoomResetBtn').textContent=`${Math.round(zoom*100)}%`;
  }
  function applyZoom(next){
    zoom=Math.max(.7,Math.min(1.8,Math.round(next*10)/10));
    if(zoom<=1.01){panX=0;panY=0;if(Math.abs(zoom-1)<.01)zoomLayer.style.transformOrigin='center center';}
    renderZoom();toast(`Zoom ${Math.round(zoom*100)}%`);
  }
  $('#zoomInBtn').onclick=()=>applyZoom(zoom+.1);$('#zoomOutBtn').onclick=()=>applyZoom(zoom-.1);$('#zoomResetBtn').onclick=()=>applyZoom(1);
  function stopAuto(){clearInterval(autoTimer);autoTimer=null;$('#autoBtn').classList.remove('active');$('#autoBtn span').textContent='অটো';}
  $('#autoBtn').onclick=()=>{
    if(autoTimer){stopAuto();toast('Auto Flip বন্ধ');return;}
    $('#autoBtn').classList.add('active');$('#autoBtn span').textContent='বন্ধ';toast('Auto Flip চালু');
    autoTimer=setInterval(()=>{if(currentPage>=descriptors.length-1)stopAuto();else flipNext();},2600);
  };

  /* Fullscreen, menu, share, print */
  $('#fullscreenBtn').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch(e){toast('Fullscreen সমর্থিত নয়');}};
  document.addEventListener('fullscreenchange',()=>$('#fullscreenBtn').classList.toggle('active',!!document.fullscreenElement));
  const more=$('#moreMenu');function closeMenus(){more.classList.remove('show');}
  $('#moreBtn').onclick=e=>{e.stopPropagation();more.classList.toggle('show');};document.addEventListener('click',e=>{if(!e.target.closest('#moreMenu')&&!e.target.closest('#moreBtn'))closeMenus();});
  $('#soundBtn').onclick=()=>{soundEnabled=!soundEnabled;$('#soundBtn em').textContent=soundEnabled?'চালু':'বন্ধ';$('#soundBtn span').textContent=soundEnabled?'🔊':'🔇';toast(`পৃষ্ঠা ওল্টানোর শব্দ ${soundEnabled?'চালু':'বন্ধ'}`);};
  $('#shareBtn').onclick=async()=>{
    const url=`${location.href.split('#')[0]}#p=${currentPage+1}`;
    try{if(navigator.share)await navigator.share({title:data.title,text:'日本語総まとめ JLPT N3・N2・N1 語彙 — 3D Flipbook',url});else{await navigator.clipboard.writeText(url);toast('লিংক কপি হয়েছে');}}catch(e){}
  };
  $('#printBtn').onclick=()=>{closeMenus();toast('প্রিন্ট ডায়ালগ প্রস্তুত হচ্ছে…');setTimeout(()=>window.print(),120);};
  const modal=$('#infoModal');$('#infoBtn').onclick=()=>{closeMenus();modal.classList.add('show');};$('#closeInfo').onclick=()=>modal.classList.remove('show');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show');});

  window.addEventListener('hashchange',()=>{const p=hashPage();if(p!==currentPage)flipTo(p);});
  window.addEventListener('beforeunload',stopAuto);
  setTimeout(()=>$('#loadingScreen').classList.add('done'),520);
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
