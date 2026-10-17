const home=document.querySelector('#home'),gameView=document.querySelector('#gameView'),shopView=document.querySelector('#shopView');
const gameArea=document.querySelector('#gameArea'),scoreEl=document.querySelector('#score'),titleEl=document.querySelector('#gameTitle'),kickerEl=document.querySelector('#gameKicker');
let score=0,currentGame=null,toastTimer,gameWon=false,mistakes=0,coins=Number(localStorage.getItem('pixelPartyCoins')||0),inventory=JSON.parse(localStorage.getItem('pixelPartyInventory')||'{}');
if(!localStorage.getItem('pixelPartyTestGrant2000')){coins+=2000;localStorage.setItem('pixelPartyCoins',coins);localStorage.setItem('pixelPartyTestGrant2000','1')}
if(!localStorage.getItem('pixelPartyTestPassGrant')){inventory.shuffle=1;inventory.remove=1;inventory.clue=1;localStorage.setItem('pixelPartyInventory',JSON.stringify(inventory));localStorage.setItem('pixelPartyTestPassGrant','1')}
if(!localStorage.getItem('pixelPartyPatternTestKit')){inventory.clue=1;localStorage.setItem('pixelPartyInventory',JSON.stringify(inventory));localStorage.setItem('pixelPartyPatternTestKit','1')}
if(!localStorage.getItem('pixelPartyPatternOneTimeGrantSep23')){inventory.clue=1;localStorage.setItem('pixelPartyInventory',JSON.stringify(inventory));localStorage.setItem('pixelPartyPatternOneTimeGrantSep23','1');localStorage.setItem('pixelPartyPatternTestKit','1')}
// One-time testing grant: keep any existing stock, but ensure one powerup is
// available in each of the three active games on this device.
if(!localStorage.getItem('pixelPartyAllThreePowerupsGrantOct4')){
  inventory.shuffle=Math.max(1,Number(inventory.shuffle)||0);
  inventory.remove=Math.max(1,Number(inventory.remove)||0);
  inventory.clue=Math.max(1,Number(inventory.clue)||0);
  localStorage.setItem('pixelPartyInventory',JSON.stringify(inventory));
  localStorage.setItem('pixelPartyAllThreePowerupsGrantOct4','1');
}
function saveShop(){localStorage.setItem('pixelPartyCoins',coins);localStorage.setItem('pixelPartyInventory',JSON.stringify(inventory));const el=document.querySelector('#coinCount');if(el)el.textContent=coins}
function openShop(){showView(shopView);saveShop();document.title='Shop | Pixel Party'}
function buyItem(item,cost){if((inventory[item]||0)>0){toast('YOU ALREADY OWN THIS ONE-USE ITEM');return}if(coins<cost){toast(`YOU NEED ${cost-coins} MORE COINS`);return}coins-=cost;inventory[item]=1;if(item==='clue'){localStorage.setItem('patternPowerupReady','1');localStorage.setItem('pixelPartyPatternTestKit','1')}saveShop();toast('ITEM PURCHASED — USE IT IN ITS GAME')}
document.querySelector('#shopButton')?.addEventListener('click',openShop);document.querySelectorAll('.shop-buy').forEach(btn=>btn.onclick=()=>buyItem(btn.dataset.item,{shuffle:500,remove:650,clue:800}[btn.dataset.item]));saveShop();

const games={
  merge:{title:'WORD WEAVER',kicker:'GAME 01 / WORD BUILDING',start:startMerge},
  multiples:{title:'MULTIPLE HUNTER',kicker:'GAME 02 / NUMBER SENSE',start:startMultiples},
  pattern:{title:'PATTERN PULSE',kicker:'GAME 03 / LOGIC',start:startPattern}
  ,sort:{title:'QUICK SORT',kicker:'GAME 04 / NUMBER SPEED',start:startQuickSort}
  ,color:{title:'COLOR SNAP',kicker:'GAME 05 / REACTION',start:startColorSnap}
  ,light:{title:'LIGHT LOCK',kicker:'GAME 06 / GRID LOGIC',start:startLightLock}
};
document.querySelectorAll('[data-game]').forEach(btn=>btn.addEventListener('click',()=>openGame(btn.dataset.game)));
document.querySelectorAll('[data-home]').forEach(btn=>btn.addEventListener('click',()=>goHome()));
function showView(view){[home,gameView,shopView].forEach(v=>v?.classList.remove('active'));view.classList.add('active');window.scrollTo(0,0)}
function setRoute(key,value,replace=false){const url=new URL(window.location.href);url.search='';url.hash=value?`#${value}`:'';history[replace?'replaceState':'pushState']({},'',url)}
function openGame(id,updateUrl=true){if(!games[id])return goHome(updateUrl);document.querySelector('.victory-overlay')?.remove();if(updateUrl)setRoute('game',id);document.title=`${games[id].title} | Pixel Party`;currentGame=id;score=0;mistakes=0;gameWon=false;updateScore();showView(gameView);titleEl.textContent=games[id].title;kickerEl.textContent=games[id].kicker;renderMistakes();games[id].start()}
function goHome(updateUrl=true){if(updateUrl)setRoute();document.title='Pixel Party';currentGame=null;gameArea.innerHTML='';showView(home)}
function loadRoute(){const game=window.location.hash.replace('#','')||new URLSearchParams(window.location.search).get('game');if(games[game])openGame(game,false);else goHome(false)}
window.addEventListener('popstate',loadRoute);
window.addEventListener('hashchange',loadRoute);
function updateScore(){scoreEl.textContent=score;if(score>0){coins+=10;saveShop()}}
function earnCoins(amount){coins+=amount;saveShop()}
function renderMistakes(){let el=document.querySelector('#mistakes');if(!el){el=document.createElement('div');el.id='mistakes';el.className='mistakes';document.querySelector('.game-header')?.appendChild(el)}el.innerHTML=Array.from({length:3},(_,i)=>`<span class="mistake-x ${i<mistakes?'lit':''}">×</span>`).join('')}
function registerMistake(){mistakes++;renderMistakes();if(mistakes>=3){setTimeout(()=>showLose(),250);return true}return false}
function showLose(){if(gameWon)return;const lostGame=currentGame,lostWord=lostGame==='merge'?mergeTarget:'';gameWon=true;currentGame=null;document.body.insertAdjacentHTML('beforeend',`<div class="victory-overlay lose-overlay"><section class="victory-bubble"><span class="victory-kicker">RUN OVER</span><h2>YOU LOSE!</h2><p>You used all three mistakes. ${lostWord?`The word was <strong>${lostWord.toUpperCase()}</strong>. `:''}Try again or return to the game room.</p><div class="victory-actions"><button id="closeLose">TRY AGAIN</button><button id="loseHome">GAME ROOM</button></div></section></div>`);document.querySelector('#closeLose').onclick=()=>{document.querySelector('.lose-overlay')?.remove();openGame(lostGame||'merge')};document.querySelector('#loseHome').onclick=()=>{document.querySelector('.lose-overlay')?.remove();goHome()}}
function toast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2100)}
function shell(instruction,body){gameArea.innerHTML=`<div class="game-shell"><div class="instructions"><b>i</b><span>${instruction}</span></div>${body}</div>`;let strikes=document.querySelector('#mistakes');if(!strikes){renderMistakes();strikes=document.querySelector('#mistakes')}if(strikes)document.querySelector('.game-shell').prepend(strikes);if(currentGame==='merge'){const board=document.querySelector('.merge-board'),candidate=builtWord();board?.insertAdjacentHTML('beforebegin',`<div class="word-slots" aria-label="Word progress">${[...mergeTarget].map((letter,i)=>`<span class="word-slot ${mergeHinted.includes(i)?'hinted':''}">${mergeHinted.includes(i)?mergeTarget[i]:(candidate[i]||'_')}</span>`).join('')}</div>`)}if(currentGame==='merge'&&inventory.shuffle){const actions=document.querySelector('.word-actions');actions?.insertAdjacentHTML('beforeend','<button class="primary" id="shuffleLetters">SHUFFLE TILES</button>');document.querySelector('#shuffleLetters').onclick=()=>{mergeBoard=shuffleWords(mergeBoard);inventory.shuffle=0;saveShop();renderMerge()}}if(currentGame==='multiples'&&inventory.remove){const actions=document.querySelector('#checkMultiples')?.parentElement;actions?.insertAdjacentHTML('beforeend','<button class="primary" id="removeWrong">REMOVE 3 WRONG</button>');document.querySelector('#removeWrong').onclick=()=>{const wrong=[...document.querySelectorAll('[data-num]')].filter(b=>Number(b.textContent)%multipleTarget!==0).slice(0,3);wrong.forEach(b=>b.remove());inventory.remove=0;saveShop()}}if(currentGame==='pattern'&&inventory.clue){const seq=document.querySelector('.pattern-sequence');seq?.insertAdjacentHTML('beforebegin',`<p class="powerup-clue">CLUE: ${buildPattern(patternLevel).slice(0,Math.max(1,Math.floor(patternLevel/4))).map(t=>t.shape).join(' → ')}</p>`);inventory.clue=0;saveShop()}}
function showVictory(gameName,achievement,details=''){
  if(gameWon)return;gameWon=true;currentGame=null;
  const colors=['#eaf238','#ff6534','#5e80ff','#9be073','#f4f0e7'];
  const confetti=Array.from({length:55},(_,i)=>`<i class="confetti-piece" style="left:${(i*37)%100}%;--delay:-${(i%12)*.23}s;--fall:${2.7+(i%7)*.22}s;--color:${colors[i%colors.length]};--spin:${i*29}deg"></i>`).join('');
  document.body.insertAdjacentHTML('beforeend',`<div class="victory-overlay">${confetti}<section class="victory-bubble" role="dialog" aria-modal="true" aria-label="You win"><button class="victory-close" id="closeVictory">×</button><span class="victory-kicker">${gameName} COMPLETE</span><h2>YOU WIN!</h2><p>${achievement}</p><div class="victory-stats"><span><small>FINAL SCORE</small><b>${score}</b></span></div><div class="victory-actions"><button id="victoryHome">GAME ROOM</button></div><div class="victory-details" id="victoryDetails">${details||`You conquered ${gameName} with a final score of ${score}.`}</div></section></div>`);
  document.querySelector('#closeVictory').onclick=()=>{document.querySelector('.victory-overlay')?.remove();gameWon=false};
  document.querySelector('#viewVictory')?.remove();
  document.querySelector('#victoryHome').onclick=()=>{document.querySelector('.victory-overlay')?.remove();goHome()};
}

let mergeBoard,selected=[],mergeLongest=0,mergeClue='',mergeTarget='',mergeLevel=1,mergeCompleted=[],mergeHints=0,mergeHinted=[],lastMergeTarget='';
const mergeLengths=[5,7,9,11,13];
const mergeChallenges={
  5:[{word:'apple',clue:'A round fruit that grows on trees'},{word:'brain',clue:'The organ you use to think'},{word:'power',clue:'The ability or strength to do something'},{word:'smile',clue:'A happy expression on your face'},{word:'light',clue:'Brightness that lets you see'},{word:'chair',clue:'A seat with a back'},{word:'cloud',clue:'A white shape floating in the sky'},{word:'dance',clue:'Move to a rhythm'},{word:'flame',clue:'A bright part of a fire'},{word:'green',clue:'A color made by mixing blue and yellow'},{word:'house',clue:'A place where people live'},{word:'ocean',clue:'A huge body of salt water'},{word:'plant',clue:'A living thing that grows in soil'},{word:'stone',clue:'A small piece of rock'},{word:'table',clue:'Furniture with a flat top'}],
  7:[{word:'pattern',clue:'A design or order that repeats'},{word:'science',clue:'Learning how the natural world works'},{word:'mystery',clue:'Something unexplained or difficult to solve'},{word:'journey',clue:'A trip from one place to another'},{word:'picture',clue:'An image or drawing'},{word:'numbers',clue:'Symbols used for counting'},{word:'balance',clue:'An even and steady state'},{word:'library',clue:'A place filled with books'},{word:'summits',clue:'The highest points of mountains'},{word:'rainbow',clue:'Colored arc seen after rain'},{word:'teacher',clue:'A person who helps others learn'},{word:'whisper',clue:'A very quiet way to speak'},{word:'sunrise',clue:'The sun appearing in the morning'},{word:'lantern',clue:'A portable light'}],
  9:[{word:'classroom',clue:'A room where students learn'},{word:'adventure',clue:'An exciting experience or journey'},{word:'blueberry',clue:'A small blue fruit'},{word:'community',clue:'People living or working together'},{word:'discovery',clue:'Finding something for the first time'},{word:'excellent',clue:'Very good or outstanding'},{word:'knowledge',clue:'Information you understand'},{word:'rectangle',clue:'A shape with four right angles'}],
  11:[{word:'imagination',clue:'The ability to form new ideas in your mind'},{word:'celebration',clue:'A special event honoring something'},{word:'environment',clue:'The world around living things'},{word:'connections',clue:'Links between people or things'},{word:'motivations',clue:'Reasons that make you act'},{word:'friendships',clue:'Caring relationships between friends'},{word:'playgrounds',clue:'Outdoor places where children play'}],
  13:[{word:'understanding',clue:'Knowing the meaning of something'},{word:'accessibility',clue:'How easy something is to reach or use'},{word:'extraordinary',clue:'Very unusual or remarkable'},{word:'determination',clue:'The decision to keep trying'},{word:'communication',clue:'Sharing information with others'}]
};
function shuffleWords(items){return [...items].sort(()=>Math.random()-.5)}
function newMergeLevel(){const needed=mergeLengths[mergeLevel-1],choices=mergeChallenges[needed],recent=JSON.parse(localStorage.getItem('pixelPartyRecentWords')||'[]'),available=choices.filter(challenge=>challenge.word!==lastMergeTarget&&!recent.includes(challenge.word)),pool=available.length?available:choices.filter(challenge=>challenge.word!==lastMergeTarget),challenge=pool[Math.floor(Math.random()*pool.length)]||choices[0];recent.push(challenge.word);localStorage.setItem('pixelPartyRecentWords',JSON.stringify(recent.slice(-12)));const decoyLetters=shuffleWords('etaoinshrdlucmfgypwbv'.split(''));mergeTarget=challenge.word;lastMergeTarget=mergeTarget;mergeClue=challenge.clue;mergeBoard=shuffleWords([...mergeTarget,...decoyLetters.slice(0,Math.max(6,Math.min(10,30-mergeTarget.length)))]);selected=[];mergeHinted=[];renderMerge()}
function startMerge(){mergeLevel=1;mergeLongest=0;mergeCompleted=[];mergeHints=0;newMergeLevel()}
function placedLetters(){const queue=selected.map(i=>mergeBoard[i].toLowerCase());return [...mergeTarget].map((letter,i)=>mergeHinted.includes(i)?letter:(queue.shift()||''))}
function builtWord(){return placedLetters().join('')}
function renderMerge(){const candidate=builtWord(),needed=mergeLengths[mergeLevel-1],letterProgress=Math.min(100,Math.round(candidate.length/needed*100)),runProgress=Math.round((mergeLevel-1)/mergeLengths.length*100),freeHints=Math.max(0,3-mergeHints);shell(`Complete five levels by building ${mergeLengths.join(', ')}-letter words. Use the simplified definition to find each word.`,`<div class="game-status"><h3>LEVEL ${mergeLevel} / 5 · FIND THE ${needed}-LETTER WORD</h3><p>HINT: ${mergeClue}</p></div><div class="run-progress"><div class="run-progress-head merge-progress-head"><b>${letterProgress}% OF THIS WORD · ${runProgress}% OF RUN</b></div><div class="run-progress-track"><div class="run-progress-fill" style="--progress:${letterProgress}%"></div></div></div><div class="merge-board word-board">${mergeBoard.map((letter,i)=>`<button class="tile word-tile filled ${selected.includes(i)?'selected':''}" data-tile="${i}" aria-label="Letter ${letter}">${letter}</button>`).join('')}</div><div class="word-actions"><button class="primary" id="clearWord">CLEAR</button><button class="primary" id="mergeWord">CHECK WORD</button><button class="primary hint-button" id="wordHint">HINTS (${freeHints} REMAINING)</button></div><p class="dictionary-note">CLICK LETTERS OR TYPE · BACKSPACE UNDOES · 3 FREE HINTS PER RUN; EXTRA HINTS COST A STRIKE</p>`);document.querySelectorAll('[data-tile]').forEach(b=>b.onclick=()=>{const i=+b.dataset.tile;if(selected.includes(i))selected=selected.filter(x=>x!==i);else selected.push(i);renderMerge()});document.querySelector('#clearWord').onclick=()=>{selected=[];renderMerge()};document.querySelector('#mergeWord').onclick=checkMerge;document.querySelector('#wordHint').onclick=useWordHint}
function useWordHint(){const availablePositions=[...mergeTarget].map((_,i)=>i).filter(i=>!mergeHinted.includes(i));if(!availablePositions.length)return;if(mergeHints>=3&&registerMistake())return;const hintPosition=availablePositions[Math.floor(Math.random()*availablePositions.length)];mergeHinted.push(hintPosition);mergeHints++;toast(mergeHints<=3?'HINT USED':'HINT USED — STRIKE');renderMerge()}
document.addEventListener('keydown',e=>{if(currentGame!=='merge')return;if(e.key==='Enter'){e.preventDefault();checkMerge()}else if(e.key==='Backspace'){e.preventDefault();selected.pop();renderMerge()}else if(e.key==='Escape'){e.preventDefault();selected=[];renderMerge()}else if(/^[a-z]$/i.test(e.key)){e.preventDefault();const letter=e.key.toLowerCase(),i=mergeBoard.findIndex((tile,index)=>tile===letter&&!selected.includes(index));if(i<0)toast(`NO ${letter.toUpperCase()} LETTER AVAILABLE — TRY ANOTHER LETTER OR PRESS BACKSPACE`);else{selected.push(i);renderMerge()}}});
function checkMerge(){const word=builtWord(),needed=mergeLengths[mergeLevel-1];if(!word){toast('SELECT OR TYPE SOME LETTERS FIRST');return}if(word.length!==needed){toast(`THIS LEVEL NEEDS EXACTLY ${needed} LETTERS`);return}if(word!==mergeTarget){toast('NOT THE WORD DESCRIBED BY THE HINT — TRY AGAIN');return}mergeCompleted.push({level:mergeLevel,length:needed,word});mergeLongest=Math.max(mergeLongest,word.length);score+=word.length*10+mergeLevel*25;updateScore();if(mergeLevel>=mergeLengths.length){const completedList=`<h3>LEVELS COMPLETED</h3><ol class="victory-levels">${mergeCompleted.map(item=>`<li><span>LEVEL ${item.level} · ${item.length} LETTERS</span><b>${item.word.toUpperCase()}</b></li>`).join('')}</ol>`;setTimeout(()=>currentGame==='merge'&&showVictory('MERGE MAESTRO',`You cleared all five levels and finished with “${word.toUpperCase()}”!`,completedList),350)}else{mergeLevel++;toast(`CORRECT · LEVEL ${mergeLevel} UNLOCKED`);setTimeout(()=>currentGame==='merge'&&newMergeLevel(),450)}}
// Shared mistake-aware submission for Word Weaver.
function checkMerge(){const word=builtWord(),needed=mergeLengths[mergeLevel-1];if(!word){if(registerMistake())return;toast('SELECT OR TYPE SOME LETTERS FIRST');return}if(word.length!==needed){if(registerMistake())return;toast(`THIS LEVEL NEEDS EXACTLY ${needed} LETTERS`);return}if(word!==mergeTarget){if(registerMistake())return;toast('NOT THE WORD DESCRIBED BY THE HINT — TRY AGAIN');return}mergeCompleted.push({level:mergeLevel,length:needed,word});mergeLongest=Math.max(mergeLongest,word.length);score+=word.length*10+mergeLevel*25;updateScore();if(mergeLevel>=mergeLengths.length){setTimeout(()=>currentGame==='merge'&&showVictory('WORD WEAVER',`You cleared all five levels and finished with “${word.toUpperCase()}”!`),350)}else{mergeLevel++;toast(`CORRECT · LEVEL ${mergeLevel} UNLOCKED`);setTimeout(()=>currentGame==='merge'&&newMergeLevel(),450)}}
let multipleTarget,multipleNums,multipleSelected,multipleStreak=0,multipleLevel=1,multipleHints=0;
function startMultiples(){multipleLevel=1;multipleStreak=0;multipleHints=0;newMultipleRound()}
function newMultipleRound(){const min=2+(multipleLevel-1)*5;multipleTarget=min+Math.floor(Math.random()*8);multipleSelected=[];const factors=shuffleWords([1,2,3,4,5,6,7,8,9,10]).slice(0,4+Math.floor(Math.random()*3));const correct=factors.map(f=>multipleTarget*f);const candidates=[];for(let n=1;n<=multipleTarget*30;n++)if(n%multipleTarget!==0&&!correct.includes(n))candidates.push(n);const decoys=shuffleWords(candidates).slice(0,11);multipleNums=[...correct,...decoys].sort(()=>Math.random()-.5);renderMultiples()}
function renderMultiples(){const progress=multipleLevel*10,neededCount=multipleNums.filter(n=>n%multipleTarget===0).length,freeHints=Math.max(0,3-multipleHints);shell('Clear 10 rounds. Each round uses a larger randomized target.',`<div class="game-status"><div><h3>FIND MULTIPLES OF <span style="color:var(--orange)">${multipleTarget}</span></h3><p>SEARCHING FOR ${neededCount} MULTIPLES</p></div><p>${multipleSelected.length} SELECTED</p></div><div class="run-progress"><div class="run-progress-head"><span>LEVEL ${multipleLevel}</span><b>${progress}% COMPLETE</b><span>LEVEL 10</span></div><div class="run-progress-track"><div class="run-progress-fill" style="--progress:${progress}%"></div></div></div><div class="number-grid">${multipleNums.map((n,i)=>`<button class="number-choice ${multipleSelected.includes(i)?'selected':''}" data-num="${i}">${n}</button>`).join('')}</div><div style="text-align:center;margin-top:20px"><button id="checkMultiples" class="primary">CHECK PICKS</button><button id="multipleHint" class="primary hint-button">HINTS (${freeHints} REMAINING)</button></div>`);document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>{const i=+b.dataset.num;multipleSelected=multipleSelected.includes(i)?multipleSelected.filter(x=>x!==i):[...multipleSelected,i];renderMultiples()});document.querySelector('#checkMultiples').onclick=checkMultiples;document.querySelector('#multipleHint').onclick=useMultipleHint}
function useMultipleHint(){const available=multipleNums.map((n,i)=>n%multipleTarget===0&&!multipleSelected.includes(i)?i:-1).filter(i=>i>=0);if(!available.length)return;if(multipleHints>=3&&registerMistake())return;multipleSelected.push(available[Math.floor(Math.random()*available.length)]);multipleHints++;toast(multipleHints<=3?'HINT USED':'HINT USED — STRIKE');renderMultiples()}
function checkMultiples(){const right=multipleNums.map((n,i)=>n%multipleTarget===0?i:-1).filter(i=>i>=0);const perfect=right.length===multipleSelected.length&&right.every(i=>multipleSelected.includes(i));if(perfect){multipleStreak++;score+=right.length*10+multipleLevel*5;updateScore();if(multipleLevel>=10){setTimeout(()=>currentGame==='multiples'&&showVictory('MULTIPLE HUNTER','You cleared all 10 increasingly difficult hunts!'),400)}else{multipleLevel++;setTimeout(()=>currentGame==='multiples'&&newMultipleRound(),650)}}else{multipleStreak=0;if(registerMistake())return;score=Math.max(0,score-5);updateScore();toast('NOT QUITE — TRY THIS LEVEL AGAIN')}}

let patternLevel=1,patternAnswer,patternOptions=[];
const symbols=['●','▲','■','◆','★','✚'],patternColors=['#151515','#ff6534','#5e80ff','#70b94d','#8c43c7'];
function startPattern(){patternLevel=1;newPattern()}
function patternToken(shape,color='#151515',rotation=0,size=1){return{shape,color,rotation,size}}
function tokenKey(t){return`${t.shape}|${t.color}|${t.rotation}|${t.size}`}
function tokenHTML(t,tag='span',extra='',attrs=''){return`<${tag} class="pattern-symbol ${extra}" ${attrs} style="color:${t.color};transform:rotate(${t.rotation}deg) scale(${t.size})">${t.shape}</${tag}>`}
function buildPattern(level){
  const length=level<=5?5+Math.floor(level/2):level<=10?7+Math.floor((level-6)/2):level<=15?8+Math.floor((level-11)/2):level<=20?9+Math.floor((level-16)/2):11+Math.floor((level-21)/2);
  const a=symbols[level%symbols.length],b=symbols[(level+2)%symbols.length],c=symbols[(level+4)%symbols.length];const seq=[];
  for(let i=0;i<length;i++){
    if(level<=5)seq.push(patternToken(i%2?a:b));
    else if(level<=10)seq.push(patternToken([a,b,c][i%3]));
    else if(level<=15)seq.push(patternToken(i%2?a:b,patternColors[i%3]));
    else if(level<=20)seq.push(patternToken([a,b,c][i%3],patternColors[i%2],(i%4)*45));
    else seq.push(patternToken([a,b,c][i%3],patternColors[(i*2)%patternColors.length],(i%4)*45,i%2?.78:1.05));
  }
  return seq;
}
function makeDistractor(answer,n){return patternToken(symbols[(symbols.indexOf(answer.shape)+n+1)%symbols.length],patternColors[(patternColors.indexOf(answer.color)+n+1+patternColors.length)%patternColors.length],(answer.rotation+(n+1)*45)%360,answer.size===1.05?.78:1.05)}
function newPattern(){const seq=buildPattern(patternLevel);patternAnswer=seq[seq.length-1];const shown=seq.slice(0,-1);const wrongCount=3,progress=patternLevel*4;patternOptions=patternLevel<=10?[patternAnswer,...Array.from({length:wrongCount},(_,i)=>patternToken(symbols[(symbols.indexOf(patternAnswer.shape)+i+1)%symbols.length]))]:[patternAnswer,...Array.from({length:wrongCount},(_,i)=>makeDistractor(patternAnswer,i))];patternOptions.sort(()=>Math.random()-.5);shell('Patterns grow longer and more complex, but only the final shape is missing.',`<div class="game-status"><h3>LEVEL ${patternLevel} / 25</h3><p>WHAT COMES NEXT?</p></div><div class="run-progress"><div class="run-progress-head"><span>LEVEL ${patternLevel}</span><b>${progress}% COMPLETE</b><span>LEVEL 25</span></div><div class="run-progress-track"><div class="run-progress-fill" style="--progress:${progress}%"></div></div></div><div class="pattern-sequence">${shown.map(x=>tokenHTML(x)).join('')}<span class="pattern-symbol missing">?</span></div><div class="pattern-options">${patternOptions.map((x,i)=>tokenHTML(x,'button','pattern-option-choice',`data-option="${i}"`)).join('')}</div>`);document.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>checkPattern(+b.dataset.option))}
function checkPattern(choice){if(tokenKey(patternOptions[choice])===tokenKey(patternAnswer)){const completed=patternLevel;score+=completed*10;updateScore();if(completed>=25){setTimeout(()=>currentGame==='pattern'&&showVictory('PATTERN PULSE','You mastered all 25 visual patterns!'),400)}else{patternLevel++;setTimeout(()=>currentGame==='pattern'&&newPattern(),500)}}else{if(registerMistake())return;score=Math.max(0,score-5);updateScore();toast('LOOK AGAIN — CHECK EVERY PROPERTY')}}

const checkMultiplesWithEmptyGuard=checkMultiples;checkMultiples=function(){if(!multipleSelected.length){toast(`YOU NEED TO SELECT ${multipleNums.filter(n=>n%multipleTarget===0).length} NUMBERS`);return}return checkMultiplesWithEmptyGuard()};
let sortRound=1,sortNumbers=[],sortPicked=[];
function startQuickSort(){sortRound=1;sortPicked=[];newSortRound()}
function newSortRound(){sortPicked=[];sortNumbers=shuffleWords(Array.from({length:6},()=>Math.floor(Math.random()*89)+10));renderSort()}
function renderSort(){const target=[...sortNumbers].sort((a,b)=>a-b);shell('Tap the numbers from smallest to largest. Three mistakes ends the run.',`<div class="game-status"><h3>ROUND ${sortRound} / 8</h3><p>SMALLEST TO LARGEST</p></div><div class="number-grid sort-grid">${sortNumbers.map((n,i)=>`<button class="number-choice ${sortPicked.includes(i)?'selected':''}" data-sort="${i}">${n}</button>`).join('')}</div><p class="dictionary-note">PICK THE NEXT LOWEST NUMBER</p>`);document.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{const i=+b.dataset.sort,next=target[sortPicked.length];if(sortNumbers[i]!==next){if(registerMistake())return;toast('NOT THE NEXT LOWEST NUMBER');return}sortPicked.push(i);if(sortPicked.length===sortNumbers.length){score+=sortRound*15;updateScore();if(sortRound>=8)setTimeout(()=>showVictory('QUICK SORT','You ordered every round at speed!'),300);else{sortRound++;setTimeout(newSortRound,350)}}else renderSort()})}
let equationAnswer=0,equationRound=1;
function startEquationDash(){equationRound=1;newEquation()}
function newEquation(){const a=Math.floor(Math.random()*12)+2,b=Math.floor(Math.random()*12)+1,add=Math.random()>.5;equationAnswer=add?a:b+a;const prompt=add?`x + ${b} = ${equationAnswer}`:`x − ${b} = ${equationAnswer}`;shell('Solve for x. Type the answer and press Enter.',`<div class="game-status"><h3>ROUND ${equationRound} / 8</h3><p>${prompt}</p></div><div class="merge-answer"><input id="equationInput" inputmode="numeric" autocomplete="off" aria-label="Answer"><button class="primary" id="equationCheck">CHECK</button></div><p class="dictionary-note">FAST ANSWERS EARN MORE POINTS</p>`);const check=()=>{const value=Number(document.querySelector('#equationInput').value);if(value!==equationAnswer){if(registerMistake())return;toast('NOT QUITE — TRY AGAIN');return}score+=equationRound*12;updateScore();if(equationRound>=8)setTimeout(()=>showVictory('EQUATION DASH','You solved every equation!'),300);else{equationRound++;setTimeout(newEquation,350)}};document.querySelector('#equationCheck').onclick=check;document.querySelector('#equationInput').onkeydown=e=>{if(e.key==='Enter')check()};document.querySelector('#equationInput').focus()}
function newEquation(){const a=Math.floor(Math.random()*12)+2,b=Math.floor(Math.random()*12)+1,add=Math.random()>.5;equationAnswer=add?a:b+a;const prompt=add?`x + ${b} = ${equationAnswer}`:`x − ${b} = ${equationAnswer}`;shell('Solve for x. Type the answer and press Enter.',`<div class="game-status"><h3>ROUND ${equationRound} / 8</h3><p>${prompt}</p></div><div class="merge-answer"><input id="equationInput" inputmode="numeric" autocomplete="off" aria-label="Answer"><button class="primary" id="equationCheck">CHECK</button></div><p class="dictionary-note">FAST ANSWERS EARN MORE POINTS</p>`);const check=()=>{const value=Number(document.querySelector('#equationInput').value);if(value!==equationAnswer){if(registerMistake())return;toast('NOT QUITE — TRY AGAIN');return}score+=equationRound*12;updateScore();if(equationRound>=8)setTimeout(()=>showVictory('EQUATION DASH','You solved every equation!'),300);else{equationRound++;setTimeout(newEquation,350)}};document.querySelector('#equationCheck').onclick=check;document.querySelector('#equationInput').onkeydown=e=>{if(e.key==='Enter')check()};document.querySelector('#equationInput').focus()}
let colorRound=1,colorAnswer='';const colorChoices=['CORAL','LIME','VIOLET','SKY'];
function startColorSnap(){colorRound=1;newColorRound()}
function newColorRound(){colorAnswer=colorChoices[Math.floor(Math.random()*colorChoices.length)];const options=shuffleWords(colorChoices);shell('Tap the color named by the prompt before the choices shift.',`<div class="game-status"><h3>ROUND ${colorRound} / 8</h3><p>FIND <strong>${colorAnswer}</strong></p></div><div class="pattern-options color-options">${options.map(c=>`<button class="pattern-option" data-color="${c}" style="background:${c==='CORAL'?'#ff8066':c==='LIME'?'#b8e35b':c==='VIOLET'?'#b47be8':'#72c9ed'}">${c}</button>`).join('')}</div>`);document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{if(b.dataset.color!==colorAnswer){if(registerMistake())return;toast('WRONG COLOR — WATCH THE PROMPT');return}score+=colorRound*10;updateScore();if(colorRound>=8)setTimeout(()=>showVictory('COLOR SNAP','You snapped every color cue!'),300);else{colorRound++;setTimeout(newColorRound,300)}})}
const lightSize=7;let lightBlocks=[],lightSources=[],lightTarget=[],lightPlaceMode=false,lightSelected=0,lightShadowCells=new Set();
let lightLevel=1,lightLevelsCompleted=0,lightFreeSolutionUsed=false;
// Keep the generated answer separate from the player's editable board so
// Light Lock can reveal the solution without destroying the current attempt.
let lightSolutionSources=[],lightSolutionBlocks=[],lightSolutionShown=false;
let lightPreSolutionSources=[],lightPreSolutionBlocks=[];
let lightSolutionTimer=null;
function randomizeLightGoal(){
  let generated=false;
  for(let attempt=0;attempt<100&&!generated;attempt++){
    const count=lightLevel===1?1:lightLevel===2?2:3+Math.floor(Math.random()*2),occupied=new Set(),sources=[];
    while(sources.length<count){
      const r=Math.floor(Math.random()*lightSize),c=Math.floor(Math.random()*lightSize),key=`${r},${c}`;
      if(occupied.has(key))continue;
      occupied.add(key);sources.push({r,c,d:Math.floor(Math.random()*8)});
    }
    lightSources=sources;lightBlocks=[];
    const beam=new Set(lightCells()),candidates=[...beam].filter(key=>!occupied.has(key));
    if(!candidates.length)continue;
    const requestedBlocks=lightLevel===1?1+Math.floor(Math.random()*2):lightLevel===2?2:3;
    const blockCount=Math.min(requestedBlocks,candidates.length);
    lightBlocks=shuffleWords(candidates).slice(0,blockCount);
    const finalLit=lightCells();
    if(finalLit.size>=3){
      lightTarget=[...finalLit];
      lightSolutionSources=sources.map(s=>({...s}));
      lightSolutionBlocks=[...lightBlocks];
      generated=true
    }
  }
  if(!generated){
    lightSources=[{r:lightSize-1,c:Math.floor(lightSize/2),d:0}];lightBlocks=[];
    lightTarget=[...lightCells()];
    lightSolutionSources=lightSources.map(s=>({...s}));
    lightSolutionBlocks=[...lightBlocks];
  }
  // The randomized setup is used only to author the target. Players begin
  // with an empty board and recreate the white silhouette themselves.
  lightSources=[];lightBlocks=[];lightShadowCells=new Set();
}
function startLightLevel(level){
  lightLevel=Math.max(1,Math.min(3,Number(level)||1));
  if(lightSolutionTimer){clearTimeout(lightSolutionTimer);lightSolutionTimer=null}
  lightBlocks=[];lightSources=[];lightSelected=0;lightPlaceMode=false;
  lightSolutionShown=false;lightPreSolutionSources=[];lightPreSolutionBlocks=[];
  randomizeLightGoal();renderLight();
}
function startLightLock(){lightLevelsCompleted=0;lightFreeSolutionUsed=false;startLightLevel(1)}
function lightCells(){
  const lit=new Set(),shadow=new Set(),dirs=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
  lightSources.forEach(s=>{const o=((s.d||0)%8+8)%8,ang=o*Math.PI/4,co=Math.cos(ang),si=Math.sin(ang);
    for(let step=1;step<=4;step++){const width=[1,3,5,7][step-1],lo=-Math.floor((width-1)/2),hi=lo+width-1;for(let spread=lo;spread<=hi;spread++){const r=s.r+Math.round((-step)*co-spread*si),c=s.c+Math.round((-step)*si+spread*co);if(r>=0&&r<lightSize&&c>=0&&c<lightSize)lit.add(`${r},${c}`)}}
    const beamBeforeBlocks=new Set(lit);
    // Classify each obstruction by its actual angle from this source. This
    // makes in-between blocks cast their own 0°/±45° shadow quadrant.
    lightBlocks.forEach(key=>{if(!beamBeforeBlocks.has(key))return;const [br,bc]=key.split(`,`).map(Number),angle=Math.atan2(bc-s.c,-(br-s.r)),nearestRay=Math.round(angle/(Math.PI/4)),base=((Math.round(angle/(Math.PI/4))%8)+8)%8;const [dr,dc]=dirs[base],pr=-dc,pc=dr;for(let q=0;q<=4;q++){for(let spread=-q;spread<=q;spread++){const r=br+dr*q+pr*spread,c=bc+dc*q+pc*spread;if(r>=0&&r<lightSize&&c>=0&&c<lightSize)shadow.add(`${r},${c}`)}}});
  });shadow.forEach(k=>lit.delete(k));lightShadowCells=shadow;return lit;
}function renderLight(){const lit=lightCells(),target=new Set(lightTarget),same=lit.size===target.size&&[...lit].every(x=>target.has(x));shell('Place blocks and rotate flashlights until the illuminated cells match the target silhouette.',`<div class="game-status"><div><h3>LIGHT LOCK</h3><p>Target silhouette: ${target.size} tiles</p></div><p>${same?'MATCHED':'SHAPE THE BEAM'}</p></div><div class="light-layout"><div class="light-grid">${Array.from({length:49},(_,i)=>{const r=Math.floor(i/7),c=i%7,key=`${r},${c}`,src=lightSources.find(s=>s.r===r&&s.c===c);return `<button class="light-cell ${lit.has(key)?'lit':''} ${target.has(key)?'target':''} ${lightBlocks.includes(key)?'block':''}" data-light="${key}">${src?'◉':lightBlocks.includes(key)?'■':''}</button>`}).join('')}</div><div class="light-controls"><button class="primary" id="rotateLight">ROTATE FLASHLIGHT</button><button class="primary" id="checkLight">CHECK SILHOUETTE</button><p>BLOCKS LEFT: ${4-lightBlocks.length}</p></div></div>`);document.querySelectorAll('[data-light]').forEach(b=>b.onclick=()=>{const key=b.dataset.light;if(lightSources.some(s=>`${s.r},${s.c}`===key))return;if(lightBlocks.includes(key))lightBlocks=lightBlocks.filter(x=>x!==key);else if(lightBlocks.length<4)lightBlocks.push(key);renderLight()});document.querySelector('#rotateLight').onclick=()=>{lightSources[0].d=(lightSources[0].d+1)%8;renderLight()};document.querySelector('#checkLight').onclick=()=>{if(same){score+=100;updateScore();showVictory('LIGHT LOCK','You matched the illuminated beam to the target silhouette!')}else{if(registerMistake())return;toast('LIGHT SPILLS OUTSIDE THE TARGET — ADJUST THE GRID')}}}
loadRoute();
const wordWeaverRender=renderMerge;
renderMerge=function(){wordWeaverRender();if(currentGame==='merge'){document.querySelectorAll('.word-slot').forEach((slot,i)=>{slot.textContent=placedLetters()[i]||'';slot.classList.toggle('hinted',mergeHinted.includes(i))})}};
function addPowerupBar(){document.querySelector('.powerup-bar')?.remove();const key={merge:'shuffle',multiples:'remove',pattern:'clue'}[currentGame];if(!key)return;const testClue=key==='clue'&&localStorage.getItem('pixelPartyPatternTestKit');const count=inventory[key]|| (testClue?1:0),bar=document.createElement('div');bar.className=`powerup-bar ${count?'available':'empty'}`;bar.innerHTML=`<button class="powerup-use" type="button">USE POWERUP <span>(${count} AVAILABLE)</span></button>`;document.querySelector('.game-shell')?.append(bar);bar.querySelector('button').onclick=()=>{if(!count){toast('NO POWERUP AVAILABLE — VISIT THE SHOP');return}if(key==='pattern'){const seq=document.querySelector('.pattern-sequence');if(seq&&!document.querySelector('.pattern-motif-clue')){const motif=buildPattern(patternLevel).slice(0,Math.min(3,Math.max(2,Math.floor(patternLevel/3))));seq.insertAdjacentHTML('beforebegin',`<div class="pattern-motif-clue">⌒ ${motif.map(t=>t.shape).join(' · ')} REPEATING MOTIF ⌒</div>`);inventory.clue=0;saveShop();if(testClue){inventory.clue=1;saveShop()}addPowerupBar()}return}if(key==='remove'){const wrong=[...document.querySelectorAll('[data-num]')].filter(b=>Number(b.textContent)%multipleTarget!==0).slice(0,3);wrong.forEach(b=>b.remove());inventory.remove=0;saveShop();addPowerupBar();return}document.querySelector('#shuffleLetters')?.click()||toast('POWERUP READY')};}
const originalShell=shell;shell=function(instruction,body){originalShell(instruction,body);addPowerupBar()};addPowerupBar();
addPowerupBar=function(){document.querySelector('.powerup-bar')?.remove();const key={merge:'shuffle',multiples:'remove',pattern:'clue'}[currentGame];if(!key)return;const testClue=key==='clue'&&localStorage.getItem('pixelPartyPatternTestKit'),count=inventory[key]||(testClue?1:0),bar=document.createElement('div');bar.className=`powerup-bar ${count?'available':'empty'}`;bar.innerHTML=`<button class="powerup-use" type="button">USE POWERUP <span>(${count} AVAILABLE)</span></button>`;document.querySelector('.game-shell')?.append(bar);bar.querySelector('button').onclick=()=>{if(!count){toast('NO POWERUP AVAILABLE — VISIT THE SHOP');return}if(key==='pattern'){const seq=document.querySelector('.pattern-sequence');if(!seq){toast('OPEN THE PATTERN BOARD TO USE THIS POWERUP');return}document.querySelector('.pattern-motif-clue')?.remove();const motif=buildPattern(patternLevel).slice(0,3);seq.insertAdjacentHTML('beforebegin',`<div class="pattern-motif-clue">⌒ ${motif.map(t=>t.shape).join(' · ')} REPEATING MOTIF ⌒</div>`);if(!testClue){inventory.clue=0;saveShop()}return}if(key==='remove'){[...document.querySelectorAll('[data-num]')].filter(b=>Number(b.textContent)%multipleTarget!==0).slice(0,3).forEach(b=>b.remove());inventory.remove=0;saveShop();return}document.querySelector('#shuffleLetters')?.click()||toast('POWERUP READY')}};addPowerupBar();
document.addEventListener('click',e=>{if(!e.target.closest('.powerup-use')||currentGame!=='pattern')return;const seq=document.querySelector('.pattern-sequence');if(!seq)return;document.querySelector('.pattern-motif-clue')?.remove();const motif=buildPattern(patternLevel).slice(0,3);seq.insertAdjacentHTML('beforebegin',`<div class="pattern-motif-clue">⌒ ${motif.map(t=>t.shape).join(' · ')} REPEATING MOTIF ⌒</div>`);toast('PATTERN MOTIF REVEALED')});
function showCleanPatternMotif(){const seq=document.querySelector('.pattern-sequence');if(!seq)return;document.querySelectorAll('.motif-mark').forEach(el=>el.remove());const items=[...seq.querySelectorAll('.pattern-symbol')].filter(el=>!el.classList.contains('missing'));if(items.length<4)return;const vals=buildPattern(patternLevel).slice(0,items.length),add=(type,period,pos)=>{if(period<2)return;for(let start=0;start+period-1<items.length;start+=period){const first=items[start],last=items[Math.min(start+period-1,items.length-1)],m=document.createElement('i');m.className=`motif-mark ${type}`;m.style.left=`${first.offsetLeft}px`;m.style.width=`${last.offsetLeft+last.offsetWidth-first.offsetLeft}px`;m.style[pos]=type==='rotation'?'-28px':pos==='top'?'-3px':'auto';if(pos==='bottom')m.style.bottom='-8px';seq.append(m)}};const periodOf=key=>{for(let p=2;p<=5;p++){let ok=true;for(let i=p;i<vals.length;i++)if(vals[i][key]!==vals[i%p][key])ok=false;if(ok)return p}return 0};const sp=periodOf('shape'),cp=periodOf('color'),rp=periodOf('rotation');const changes=k=>new Set(vals.map(v=>String(v[k]))).size>1;if(changes('color')&&cp)add('color',cp,'top');if(changes('shape')&&sp)add('shape',sp,'bottom');if(changes('rotation')&&rp&&rp!==cp&&rp!==sp)add('rotation',rp,'top')}document.addEventListener('click',e=>{if(e.target.closest('.powerup-use')&&currentGame==='pattern'){setTimeout(showCleanPatternMotif,0)}});
document.addEventListener('click',e=>{if(!e.target.closest('.powerup-use'))return;setTimeout(()=>{const key={merge:'shuffle',multiples:'remove',pattern:'clue'}[currentGame];if(key){inventory[key]=0;if(key==='clue')localStorage.removeItem('pixelPartyPatternTestKit');saveShop();addPowerupBar()}},25)});
renderLight=function(){const lit=lightCells(),target=new Set(lightTarget),same=lit.size===target.size&&[...lit].every(x=>target.has(x));shell('Match the white goal map. The original sun is fixed; place extra suns and blocks to shape the beam.',`<div class="game-status"><div><h3>LIGHT LOCK</h3><p>Goal map: white tiles are lit, dark tiles stay dark.</p></div><p>${same?'MATCHED':'SHAPE THE BEAM'}</p></div><div class="light-layout"><div><p class="goal-label">GOAL MAP</p><div class="goal-map">${Array.from({length:49},(_,i)=>{const k=`${Math.floor(i/7)},${i%7}`;return `<i class="${target.has(k)?'goal-on':''}"></i>`}).join('')}</div></div><div class="light-grid">${Array.from({length:49},(_,i)=>{const r=Math.floor(i/7),c=i%7,key=`${r},${c}`,src=lightSources.find(s=>s.r===r&&s.c===c);return `<button class="light-cell ${lit.has(key)?'lit':''} ${target.has(key)?'target':''} ${lightBlocks.includes(key)?'block':''}" data-light="${key}">${src?'☀':lightBlocks.includes(key)?'■':''}</button>`}).join('')}</div><div class="light-controls"><button class="primary" id="placeLight">PLACE SUN</button><button class="primary" id="rotateLight">ROTATE SELECTED SUN</button><button class="primary" id="checkLight">CHECK SILHOUETTE</button><p>BLOCKS LEFT: ${4-lightBlocks.length} · SUNS LEFT: ${Math.max(0,2-(lightSources.length-1))}</p></div></div>`);document.querySelectorAll('[data-light]').forEach(b=>b.onclick=()=>{const key=b.dataset.light;if(lightPlaceMode&&!lightSources.some(s=>`${s.r},${s.c}`===key)&&lightSources.length<3){const [r,c]=key.split(',').map(Number);lightSources.push({r,c,d:0});lightSelected=lightSources.length-1;lightPlaceMode=false;renderLight();return}if(lightSources.some(s=>`${s.r},${s.c}`===key))return;if(lightBlocks.includes(key))lightBlocks=lightBlocks.filter(x=>x!==key);else if(lightBlocks.length<4)lightBlocks.push(key);renderLight()});document.querySelector('#placeLight').onclick=()=>{lightPlaceMode=true;toast('CLICK AN EMPTY CUBE TO PLACE A SUN')};document.querySelector('#rotateLight').onclick=()=>{if(lightSources.length>1){lightSelected=lightSelected===0?1:lightSelected;lightSources[lightSelected].d=(lightSources[lightSelected].d+1)%8;renderLight()}else toast('PLACE AN EXTRA SUN FIRST')};document.querySelector('#checkLight').onclick=()=>{if(same){score+=100;updateScore();showVictory('LIGHT LOCK','You matched the illuminated beams to the goal map!')}else if(registerMistake())return;else toast('LIGHT SPILLS OUTSIDE THE GOAL — ADJUST THE CUBES')}};
renderLight=function(){const lit=lightCells(),target=new Set(lightTarget),same=lit.size===target.size&&[...lit].every(x=>target.has(x));shell('Match the white goal map. Add suns and drag them across the grid to shape their solid triangular light.',`<div class="game-status"><div><h3>LIGHT LOCK</h3><p>White goal cells should be lit; black goal cells should stay dark.</p></div><p>${same?'MATCHED':'SHAPE THE BEAM'}</p></div><div class="light-layout"><div><p class="goal-label">GOAL MAP</p><div class="goal-map">${Array.from({length:49},(_,i)=>{const k=`${Math.floor(i/7)},${i%7}`;return `<i class="${target.has(k)?'goal-on':''}"></i>`}).join('')}</div></div><div class="light-grid">${Array.from({length:49},(_,i)=>{const r=Math.floor(i/7),c=i%7,key=`${r},${c}`,src=lightSources.find(s=>s.r===r&&s.c===c);return `<button class="light-cell ${lit.has(key)?'lit':''} ${target.has(key)?'target':''}" data-light="${key}" ${src&&!src.fixed?'draggable="true"':''}>${src?'☀':''}</button>`}).join('')}</div><div class="light-controls"><button class="primary" id="addSun">ADD SUN</button><button class="primary" id="addBlock" disabled>ADD BLOCK</button><button class="primary" id="rotateLight">ROTATE SELECTED SUN</button><button class="primary" id="checkLight">CHECK SILHOUETTE</button><p>EXTRA SUNS LEFT: ${Math.max(0,2-(lightSources.length-1))}</p></div></div>`);let placing=false,dragIndex=-1;document.querySelector('#addSun').onclick=()=>{placing=true;toast('CLICK A CUBE TO PLACE A SUN')};document.querySelectorAll('[data-light]').forEach(b=>{b.onpointerdown=()=>{const key=b.dataset.light;const idx=lightSources.findIndex(s=>`${s.r},${s.c}`===key);if(idx>0)dragIndex=idx};b.onpointerup=()=>{const key=b.dataset.light;if(placing&&lightSources.length<3&&!lightSources.some(s=>`${s.r},${s.c}`===key)){const [r,c]=key.split(',').map(Number);lightSources.push({r,c,d:0});lightSelected=lightSources.length-1;placing=false;renderLight();return}if(dragIndex>0&&!lightSources.some((s,i)=>i!==dragIndex&&`${s.r},${s.c}`===key)){const [r,c]=key.split(',').map(Number);lightSources[dragIndex].r=r;lightSources[dragIndex].c=c;lightSelected=dragIndex;dragIndex=-1;renderLight()}}});document.querySelector('#rotateLight').onclick=()=>{if(lightSources.length>1){lightSelected=Math.max(1,lightSelected);lightSources[lightSelected].d=(lightSources[lightSelected].d+1)%8;renderLight()}else toast('ADD AN EXTRA SUN FIRST')};document.querySelector('#checkLight').onclick=()=>{if(same){score+=100;updateScore();showVictory('LIGHT LOCK','You matched the beams to the goal map!')}else if(registerMistake())return;else toast('LIGHT SPILLS OUTSIDE THE GOAL — ADJUST THE SUNS')}};
let lightBlockMode=false,suppressNextPlacement=false,lightDeleteMode=false;
renderLight=function(){const lit=lightCells(),target=new Set(lightTarget),same=lit.size===target.size&&[...lit].every(x=>target.has(x));shell('Match the goal map. Add suns and blocks, then shape the beams.',`<div class="game-status"><div><h3>LIGHT LOCK</h3><p>White goal cells should be lit; black cells should stay dark.</p></div><p>${same?'MATCHED':'SHAPE THE BEAM'}</p></div><div class="light-layout"><div><p class="goal-label">GOAL MAP</p><div class="goal-map">${Array.from({length:49},(_,i)=>{const k=`${Math.floor(i/7)},${i%7}`;return `<i class="${target.has(k)?'goal-on':''}"></i>`}).join('')}</div></div><div class="light-grid">${Array.from({length:49},(_,i)=>{const r=Math.floor(i/7),c=i%7,key=`${r},${c}`,src=lightSources.find(s=>s.r===r&&s.c===c);return `<button class="light-cell ${lit.has(key)?'lit':''} ${target.has(key)?'target':''} ${lightBlocks.includes(key)?'block':''}" data-light="${key}" data-source="${src?lightSources.indexOf(src):-1}">${src?'☀':lightBlocks.includes(key)?'■':''}</button>`}).join('')}</div><div class="light-controls"><button class="primary" id="addSun">ADD SUN</button><button class="primary" id="addBlock">ADD BLOCK</button><button class="primary" id="checkLight">CHECK SILHOUETTE</button><p class="light-legend"><b>LEGEND</b><br>Hover over a movable sun and press <strong>R</strong> to rotate.<br>Click a block or extra sun to delete it.</p></div></div>`);let placingSun=false;document.querySelector('#addSun').onclick=()=>{placingSun=true;lightBlockMode=false;toast('CLICK A CUBE TO PLACE A SUN')};document.querySelector('#addBlock').onclick=()=>{lightBlockMode=true;placingSun=false;toast('CLICK CUBES TO PLACE BLOCKS')};document.querySelectorAll('[data-light]').forEach(b=>{b.onpointerup=()=>{const key=b.dataset.light,idx=Number(b.dataset.source);if(idx>=0){lightSources.splice(idx,1);lightSelected=Math.max(1,lightSelected-1);renderLight();return}if(placingSun&&lightSources.length<3&&!lightSources.some(s=>`${s.r},${s.c}`===key)){const [r,c]=key.split(',').map(Number);lightSources.push({r,c,d:0});lightSelected=lightSources.length-1;placingSun=false;renderLight();return}if(lightBlockMode){if(lightBlocks.includes(key))lightBlocks=lightBlocks.filter(x=>x!==key);else if(lightBlocks.length<6&&!lightSources.some(s=>`${s.r},${s.c}`===key))lightBlocks.push(key);renderLight()}};b.onmouseenter=()=>{const idx=Number(b.dataset.source);if(idx>0)lightSelected=idx}});document.onkeydown=e=>{if(e.key.toLowerCase()==='r'&&document.querySelector('.light-grid:hover')&&lightSources[lightSelected]&&!lightSources[lightSelected].fixed){lightSources[lightSelected].d=(lightSources[lightSelected].d+1)%8;renderLight()}};document.querySelector('#checkLight').onclick=()=>{if(same){score+=100;updateScore();showVictory('LIGHT LOCK','You matched the beams to the goal map!')}else if(registerMistake())return;else toast('LIGHT SPILLS OUTSIDE THE GOAL — ADJUST THE SUNS OR BLOCKS')}};
let lightDrag=null,lightRotations={};
const previousLightRender=renderLight;renderLight=function(){previousLightRender();const grid=document.querySelector('.light-grid');if(!grid)return;document.querySelectorAll('[data-light]').forEach(cell=>{const key=cell.dataset.light,src=lightSources.findIndex(s=>`${s.r},${s.c}`===key),block=lightBlocks.includes(key);cell.onpointerdown=e=>{if(e.button!==0||src<0&&!block)return;lightDrag={type:src>=0?'sun':'block',index:src>=0?src:key,originX:e.clientX,originY:e.clientY,cell};cell.setPointerCapture?.(e.pointerId)};cell.onpointermove=e=>{if(!lightDrag||lightDrag.cell!==cell)return;cell.style.transform=`translate(${e.clientX-lightDrag.originX}px,${e.clientY-lightDrag.originY}px)`};cell.onpointerup=e=>{if(!lightDrag||lightDrag.cell!==cell)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-light]');cell.style.transform='';if(target){const key2=target.dataset.light;if(lightDrag.type==='sun'&&!lightSources.some((s,i)=>i!==lightDrag.index&&`${s.r},${s.c}`===key2)){const [r,c]=key2.split(',').map(Number);lightSources[lightDrag.index].r=r;lightSources[lightDrag.index].c=c;lightSelected=lightDrag.index}if(lightDrag.type==='block'&&!lightSources.some(s=>`${s.r},${s.c}`===key2)){lightBlocks=lightBlocks.filter(x=>x!==lightDrag.index);lightBlocks.push(key2)}}lightDrag=null;renderLight()}})};
let lightHover=null;document.addEventListener('pointerover',e=>{const cell=e.target.closest?.('[data-light]');if(cell){const idx=Number(cell.dataset.source);if(idx>=0)lightHover={type:'sun',index:idx};else if(lightBlocks.includes(cell.dataset.light))lightHover={type:'block',index:cell.dataset.light}}});document.addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='r'||!lightHover)return;const id=lightHover.type==='sun'?`${lightSources[lightHover.index].r},${lightSources[lightHover.index].c}`:lightHover.index;lightRotations[id]=((lightRotations[id]||0)+1)%4;toast('ROTATED')});
// Rotate exactly the sun under the pointer. This capture-phase handler keeps
// the older selected-sun listener from rotating the wrong source when several
// suns are present, and updates the real beam direction instead of a visual
// placeholder rotation map.
document.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()!=='r'||!document.querySelector('.light-grid:hover'))return;
  if(!lightHover||lightHover.type!=='sun'){
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  const source=lightSources[lightHover.index];
  if(!source){e.preventDefault();e.stopImmediatePropagation();return}
  source.d=((source.d||0)+1)%8;
  lightSelected=lightHover.index;
  e.preventDefault();
  e.stopImmediatePropagation();
  renderLight();
  toast('ROTATED');
},true);
document.addEventListener('click',e=>{if(e.target.closest?.('#addSun')){lightPlaceMode=true;lightBlockMode=false}if(e.target.closest?.('#addBlock')){lightBlockMode=true;lightPlaceMode=false}});
document.addEventListener('pointerup',e=>{if(lightDeleteMode)return;if(suppressNextPlacement){suppressNextPlacement=false;return}if(!lightPlaceMode||lightSources.length>=3)return;const cell=e.target.closest?.('[data-light]');if(!cell)return;const key=cell.dataset.light;if(lightSources.some(s=>`${s.r},${s.c}`===key))return;const [r,c]=key.split(',').map(Number);lightSources.push({r,c,d:0});lightSelected=lightSources.length-1;lightPlaceMode=false;renderLight()});
document.addEventListener('pointerup',e=>{if(suppressNextPlacement){suppressNextPlacement=false;return}if(lightDeleteMode)return;if(!lightBlockMode)return;const grid=document.querySelector('.light-grid');if(!grid)return;const rect=grid.getBoundingClientRect(),col=Math.max(0,Math.min(6,Math.floor((e.clientX-rect.left)/rect.width*7))),row=Math.max(0,Math.min(6,Math.floor((e.clientY-rect.top)/rect.height*7))),key=`${row},${col}`;if(!lightSources.some(s=>`${s.r},${s.c}`===key)){if(lightBlocks.includes(key))lightBlocks=lightBlocks.filter(x=>x!==key);else if(lightBlocks.length<6)lightBlocks.push(key);renderLight()}});

/* Light Lock interaction: drag freely, then snap to the cell with the most
   area underneath the dragged sun/block. */
(()=>{let mode='',drag=null;
  const cellAt=(x,y)=>{const grid=document.querySelector('.light-grid');if(!grid)return null;const r=grid.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)return null;const c=Math.max(0,Math.min(6,Math.floor((x-r.left)/r.width*7))),row=Math.max(0,Math.min(6,Math.floor((y-r.top)/r.height*7)));return grid.querySelector(`[data-light="${row},${c}"]`)};
  document.addEventListener('click',e=>{if(e.target.closest?.('#addSun')){mode='sun';e.stopImmediatePropagation()}else if(e.target.closest?.('#addBlock')){mode='block';e.stopImmediatePropagation()}},true);
  document.addEventListener('pointerdown',e=>{if(e.button!==0||lightDeleteMode)return;const cell=e.target.closest?.('[data-light]');if(!cell)return;const key=cell.dataset.light,idx=lightSources.findIndex(s=>`${s.r},${s.c}`===key),isBlock=lightBlocks.includes(key);
    if(suppressNextPlacement){suppressNextPlacement=false;return}if(mode==='sun'&&idx<0&&lightSources.length<3){const [r,c]=key.split(',').map(Number);lightSources.push({r,c,d:0});lightSelected=lightSources.length-1;mode='';renderLight();return}
    if(mode==='block'&&idx<0&&!isBlock&&lightBlocks.length<6){lightBlocks.push(key);mode='';renderLight();return}
    if(idx>=0||isBlock){drag={type:idx>=0?'sun':'block',index:idx>=0?idx:key,cell,startX:e.clientX,startY:e.clientY};e.preventDefault();cell.setPointerCapture?.(e.pointerId)}
  },true);
  document.addEventListener('pointermove',e=>{if(!drag)return;drag.cell.style.transform=`translate(${e.clientX-drag.startX}px,${e.clientY-drag.startY}px)`;e.preventDefault()},true);
  document.addEventListener('pointerup',e=>{if(!drag)return;
    // The release cursor is the drop selector: choose the exact square under
    // the pointer at this moment, just like a standard grid drag/drop.
    const tr=document.querySelector('#lightTrash')?.getBoundingClientRect(),pad=28;const trash=tr&&e.clientX>=tr.left-pad&&e.clientX<=tr.right+pad&&e.clientY>=tr.top-pad&&e.clientY<=tr.bottom+pad; if(trash){if(drag.type==='sun')lightSources.splice(drag.index,1);else lightBlocks=lightBlocks.filter(k=>k!==drag.index);drag=null;renderLight();return}const target=cellAt(e.clientX,e.clientY);
    drag.cell.style.transform='';if(target){const key=target.dataset.light;if(drag.type==='sun'){const [r,c]=key.split(',').map(Number);lightSources[drag.index].r=r;lightSources[drag.index].c=c;lightSelected=drag.index}else if(!lightSources.some(s=>`${s.r},${s.c}`===key)){lightBlocks=lightBlocks.filter(k=>k!==drag.index);if(!lightBlocks.includes(key))lightBlocks.push(key)}}drag=null;e.stopImmediatePropagation();renderLight()},true);
})();

// Keep Light Lock's placement controls visible on the initial load as well as
// after a retry; rotation is intentionally handled with the R key only.
(()=>{const current=renderLight;renderLight=function(){current();document.querySelector('#rotateLight')?.remove();document.querySelector('#placeLight')?.remove()}})();

// Safety net for old render paths: always restore the direct controls whenever
// the Light Lock board is present, including the first load after navigation.
(()=>{const ensure=()=>{document.querySelectorAll(`[data-light]`).forEach(cell=>cell.classList.toggle(`shadow`,!lightSolutionShown&&lightShadowCells?.has(cell.dataset.light)));const controls=document.querySelector('.light-controls');if(!controls)return;document.querySelector('#rotateLight')?.remove();document.querySelector('#placeLight')?.remove();if(!document.querySelector('#addSun')){const b=document.createElement('button');b.id='addSun';b.className='primary';b.textContent='ADD SUN';b.onclick=()=>{lightPlaceMode=true;lightBlockMode=false};controls.prepend(b)}if(!document.querySelector('#addBlock')){const b=document.createElement('button');b.id='addBlock';b.className='primary';b.textContent='ADD BLOCK';b.onclick=()=>{lightBlockMode=true;lightPlaceMode=false};controls.insertBefore(b,document.querySelector('#checkLight'))}};new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true});setTimeout(ensure,0)})();

// Apply the reference arrangement directly after every Light Lock render,
// including the empty first board.
(()=>{const fix=()=>{const layout=document.querySelector('.light-layout'),grid=layout?.querySelector('.light-grid'),controls=layout?.querySelector('.light-controls');if(!layout||!grid||!controls)return;layout.style.cssText+=';display:grid!important;grid-template-columns:auto 214px!important;grid-template-rows:auto auto!important;gap:12px 14px!important;justify-content:start!important;align-items:center!important;padding:8px!important';grid.style.cssText+=';grid-column:1!important;grid-row:1 / span 2!important';controls.style.cssText+=';grid-column:2!important;grid-row:1!important;align-self:center!important;justify-self:start!important';const goal=layout.querySelector('.goal-map')?.parentElement;if(goal)goal.style.cssText+=';grid-column:2!important;grid-row:2!important'};new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});setTimeout(fix,0)})();

// The current deletion UI is the trash-can drop zone. Do not re-create the
// retired DELETE toggle here; its old observer caused extra DOM churn.
document.addEventListener('pointerdown',e=>{if(!lightDeleteMode||e.button!==0)return;const cell=e.target.closest?.('[data-light]');if(!cell)return;const key=cell.dataset.light,idx=lightSources.findIndex(s=>`${s.r},${s.c}`===key);if(idx>=0){lightSources.splice(idx,1);lightSelected=Math.max(0,lightSelected-1)}else if(lightBlocks.includes(key)){lightBlocks=lightBlocks.filter(k=>k!==key)}suppressNextPlacement=true;lightPlaceMode=false;lightBlockMode=false;mode='';lightDeleteMode=false;renderLight();e.preventDefault();e.stopImmediatePropagation()},true);

// The original route bootstraps before later Light Lock overrides are defined.
// Re-render once after initialization so the newest board (including GOAL MAP)
// is present on the very first visit, without needing a placement action.
setTimeout(()=>{if(location.hash==='#light'&&typeof startLightLock==='function')startLightLock()},0);

// Legacy right-click deletion is intentionally removed. Deletion is handled
// only by dragging a sun or block onto the visible trashcan drop zone.
document.addEventListener('contextmenu',e=>{if(e.target.closest?.('.light-grid'))e.preventDefault()});

// Press-and-hold deletion with a clockwise translucent white progress ring.
(()=>{let hold=null;const cancel=()=>{if(hold){clearTimeout(hold.timer);hold.ring?.remove();hold=null}};document.addEventListener('pointerdown',e=>{if(e.button!==0||!lightDeleteMode)return;const cell=e.target.closest?.('[data-light]');if(!cell)return;const key=cell.dataset.light,idx=lightSources.findIndex(s=>`${s.r},${s.c}`===key);if(idx<0&&!lightBlocks.includes(key))return;const ring=document.createElement('i');ring.className='delete-ring';cell.append(ring);let p=0;const tick=()=>{p=Math.min(100,p+4);ring.style.setProperty('--hold',`${p}%`);if(p<100)hold.tick=setTimeout(tick,24)};hold={ring,timer:setTimeout(()=>{if(idx>=0){lightSources.splice(idx,1);lightSelected=Math.max(0,lightSelected-1)}else lightBlocks=lightBlocks.filter(k=>k!==key);suppressNextPlacement=true;hold=null;renderLight()},600),tick:null};tick()},true);document.addEventListener('pointerup',cancel,true);document.addEventListener('pointercancel',cancel,true);document.addEventListener('pointermove',e=>{if(hold&&Math.hypot(e.movementX,e.movementY)>3)cancel()},true)})();

// Bind directly to each rendered tile so left-click hold works alongside drag.
(()=>{const bind=()=>document.querySelectorAll('[data-light]').forEach(cell=>{if(cell.dataset.holdBound)return;cell.dataset.holdBound='1';let timer,ring,moved=false;cell.addEventListener('pointerdown',e=>{if(e.button!==0||!lightDeleteMode)return;if(!cell.querySelector(':scope > .delete-ring')){const key=cell.dataset.light,idx=lightSources.findIndex(s=>`${s.r},${s.c}`===key);if(idx<0&&!lightBlocks.includes(key))return;ring=document.createElement('i');ring.className='delete-ring';cell.append(ring);moved=false;let p=0;const fill=()=>{p=Math.min(100,p+4);ring.style.setProperty('--hold',p+'%');if(p<100)timer=setTimeout(fill,24)};timer=setTimeout(()=>{if(!moved){if(idx>=0)lightSources.splice(idx,1);else lightBlocks=lightBlocks.filter(k=>k!==key);suppressNextPlacement=true;ring=null;renderLight()}},600);fill()}},{passive:true});cell.addEventListener('pointermove',e=>{if(Math.hypot(e.movementX,e.movementY)>3){moved=true;clearTimeout(timer);ring?.remove();ring=null}});cell.addEventListener('pointerup',()=>{clearTimeout(timer);ring?.remove();ring=null})});new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});setTimeout(bind,0)})();
// Keep the trash-can control stable with the observer below instead of
// polling/removing it every 250 ms while the player is interacting.
(()=>{const ensureTrash=()=>{const controls=document.querySelector('.light-controls');if(!controls||document.querySelector('#lightTrash'))return;const t=document.createElement('button');t.id='lightTrash';t.className='light-trash';t.textContent='🗑';t.title='Drag a sun or block here to delete it';controls.append(t)};new MutationObserver(ensureTrash).observe(document.body,{childList:true,subtree:true});setTimeout(ensureTrash,0)})();

// Latest Light Lock shadow model: an off-center block casts the filled sector
// between the block-relative 0° ray and the nearer +/-45° ray. The source's
// facing direction defines 0° for every one of the eight 45° orientations.
lightCells=function(){
  const lit=new Set(),shadow=new Set();
  const forwardDirs=[[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1]];
  const sideDirs=[[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]];
  const inGrid=(r,c)=>r>=0&&r<lightSize&&c>=0&&c<lightSize;
  lightSources.forEach(s=>{
    const o=((s.d||0)%8+8)%8,ang=o*Math.PI/4,co=Math.cos(ang),si=Math.sin(ang);
    const sourceBeam=new Set();
    for(let step=1;step<=4;step++){
      const width=[1,3,5,7][step-1],lo=-Math.floor((width-1)/2),hi=lo+width-1;
      for(let spread=lo;spread<=hi;spread++){
        const r=s.r+Math.round((-step)*co-spread*si),c=s.c+Math.round((-step)*si+spread*co);
        if(inGrid(r,c)){const key=`${r},${c}`;sourceBeam.add(key)}
      }
    }
    // Diagonal rasterization can leave enclosed checkerboard holes. Fill
    // only true holes, including holes clipped against the board edge.
    if(o%2===1){
      const holes=[];
      for(let r=0;r<lightSize;r++)for(let c=0;c<lightSize;c++){
        const key=`${r},${c}`;
        if(sourceBeam.has(key)||(r===s.r&&c===s.c))continue;
        let neighbors=0;
        for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]])if(sourceBeam.has(`${r+dr},${c+dc}`))neighbors++;
        if(neighbors>=3)holes.push(key);
      }
      holes.forEach(key=>sourceBeam.add(key));
    }
    // Evaluate obstructions against this sun's beam only. Using the union
    // from earlier suns made a block lit by one source incorrectly cast a
    // shadow for every other source.
    const beamBeforeBlocks=new Set(sourceBeam),sourceShadow=new Set(),[fr,fc]=forwardDirs[o],[sr,sc]=sideDirs[o];
    lightBlocks.forEach(key=>{
      if(!beamBeforeBlocks.has(key))return;
      const [br,bc]=key.split(',').map(Number),vr=br-s.r,vc=bc-s.c;
      const lateral=vr*sr+vc*sc,sideSign=lateral===0?0:(lateral>0?1:-1);
      // The sector boundary is the neighboring 45° ray around the source's
      // facing direction. This is important for diagonal sources: their
      // boundary rays are cardinal, not the perpendicular diagonal vector.
      const boundaries=sideSign===0?[(o+7)%8,(o+1)%8]:[sideSign>0?(o+7)%8:(o+1)%8];
      for(let depth=0;depth<lightSize;depth++)for(const boundary of boundaries){
        const [er,ec]=forwardDirs[boundary],dr=er-fr,dc=ec-fc;
        for(let offset=0;offset<=depth;offset++){
          const r=br+fr*depth+dr*offset,c=bc+fc*depth+dc*offset;
          if(inGrid(r,c))sourceShadow.add(`${r},${c}`);
        }
      }
    });
    // A second sun can still illuminate a cell shadowed by this sun, so
    // remove shadows from each source before combining their visible beams.
    sourceShadow.forEach(k=>sourceBeam.delete(k));
    sourceBeam.forEach(k=>lit.add(k));
    sourceShadow.forEach(k=>shadow.add(k));
  });
  // Only expose shadows that remain dark after all suns are combined.
  lightShadowCells=new Set([...shadow].filter(k=>!lit.has(k)));
  return lit;
};

// Use the one-time Light Lock solution assist. It places the next missing
// solution object directly on the board, including the solution rotation for
// suns, without revealing the entire answer.
function hideLightSolution(notify=true){
  if(lightSolutionTimer){clearTimeout(lightSolutionTimer);lightSolutionTimer=null}
  if(!lightSolutionShown)return;
  lightSources=lightPreSolutionSources.map(s=>({...s}));
  lightBlocks=[...lightPreSolutionBlocks];
  lightSolutionShown=false;
  lightPreSolutionSources=[];
  lightPreSolutionBlocks=[];
  if(notify)toast('SOLUTION HIDDEN');
  lightSelected=Math.min(Math.max(0,lightSelected),Math.max(0,lightSources.length-1));
  renderLight();
  setTimeout(ensureLightSolutionButton,0);
}
function toggleLightSolution(){
  if(!lightSolutionSources.length){toast('SOLUTION NOT READY');return}
  if(lightFreeSolutionUsed){toast('SOLUTION ALREADY USED THIS RUN');return}

  // Prefer placing a missing sun first so the player gets the source and its
  // exact direction before shaping the remaining beam with blocks.
  const missingSun=lightSolutionSources.find(solution=>{
    const current=lightSources.find(source=>source.r===solution.r&&source.c===solution.c);
    return !current||current.d!==solution.d;
  });
  let placed='';
  if(missingSun){
    const existingIndex=lightSources.findIndex(source=>source.r===missingSun.r&&source.c===missingSun.c);
    const corrected={...missingSun};
    if(existingIndex>=0)lightSources[existingIndex]=corrected;
    else{lightSources.push(corrected);lightSelected=lightSources.length-1}
    placed='SUN';
  }else{
    const missingBlock=lightSolutionBlocks.find(key=>!lightBlocks.includes(key)&&!lightSources.some(source=>`${source.r},${source.c}`===key));
    if(missingBlock){lightBlocks.push(missingBlock);placed='BLOCK'}
  }
  if(!placed){toast('THE SOLUTION IS ALREADY ON YOUR BOARD');return}
  lightFreeSolutionUsed=true;
  lightSolutionShown=false;
  lightPreSolutionSources=[];
  lightPreSolutionBlocks=[];
  toast(`SOLUTION PLACED — ${placed}`);
  lightSelected=Math.min(Math.max(0,lightSelected),Math.max(0,lightSources.length-1));
  renderLight();
  setTimeout(ensureLightSolutionButton,0);
}

// The Light Lock renderer is intentionally overridden in several historical
// versions of this file. Keep this control independent of those render paths
// so it is present on every fresh board and after every re-render.
function ensureLightSolutionButton(){
  const controls=document.querySelector('.light-controls');
  if(!controls)return;
  let button=document.querySelector('#showLightSolution');
  if(!button){
    button=document.createElement('button');
    button.id='showLightSolution';
    button.className='primary';
    button.onclick=toggleLightSolution;
    const check=controls.querySelector('#checkLight');
    controls.insertBefore(button,check||null);
  }
  const label=lightFreeSolutionUsed?'SOLUTION USED':'PLACE SOLUTION · 1 USE';
  if(button.textContent!==label)button.textContent=label;
  button.disabled=!lightSolutionShown&&lightFreeSolutionUsed;
  button.setAttribute('aria-disabled',String(button.disabled));
  const pressed=String(lightSolutionShown);
  if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);
}
(()=>{
  const observer=new MutationObserver(ensureLightSolutionButton);
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(ensureLightSolutionButton,0);
})();

// Make the answer board easy to read without changing the real puzzle rules:
// solution beams become a translucent glow and obstruction shadows are hidden,
// while the solution blocks themselves remain solid and visible.
const lightRenderWithSolution=renderLight;
renderLight=function(){
  lightRenderWithSolution();
  if(!lightSolutionShown)return;
  const lit=lightCells();
  document.querySelectorAll('.light-grid [data-light]').forEach(cell=>{
    const key=cell.dataset.light;
    cell.classList.toggle('solution-lit',lit.has(key)&&!lightBlocks.includes(key));
    cell.classList.remove('shadow');
  });
};

function checkLightLevel(){
  const lit=lightCells(),target=new Set(lightTarget),same=lit.size===target.size&&[...lit].every(key=>target.has(key));
  if(!same){
    if(registerMistake())return;
    toast('LIGHT SPILLS OUTSIDE THE GOAL — ADJUST THE SUNS OR BLOCKS');
    return;
  }
  const completed=lightLevel;
  lightLevelsCompleted=completed;
  updateLightProgress();
  score+=completed*100;
  updateScore();
  setTimeout(()=>{
    if(currentGame!=='light')return;
    if(completed>=3)showVictory('LIGHT LOCK','You completed all three Light Lock levels!','Every level is complete. The full three-stage beam challenge is cleared.');
    else showLightLevelVictory(completed);
  },250);
}

function showLightLevelVictory(completedLevel){
  showVictory('LIGHT LOCK',`LEVEL ${completedLevel} COMPLETE!`,`Great work. Level ${completedLevel} is cleared — continue to the next beam challenge.`);
  const heading=document.querySelector('.victory-overlay h2');
  if(heading)heading.textContent='CONGRATULATIONS!';
  const dialog=document.querySelector('.victory-overlay [role="dialog"]');
  if(dialog)dialog.setAttribute('aria-label','Congratulations');
  const next=document.querySelector('#victoryHome');
  if(!next)return;
  next.id='nextLightLevel';
  next.textContent='GO TO NEXT LEVEL';
  next.onclick=()=>{
    document.querySelector('.victory-overlay')?.remove();
    gameWon=false;
    currentGame='light';
    startLightLevel(completedLevel+1);
  };
}

function updateLightProgress(){
  const layout=document.querySelector('.light-layout');
  if(!layout)return;
  let bar=layout.parentElement.querySelector('.light-level-progress');
  if(!bar){
    bar=document.createElement('div');
    bar.className='light-level-progress';
    layout.parentElement.insertBefore(bar,layout);
  }
  bar.innerHTML=`<div class="light-level-progress-head"><span>LIGHT LOCK RUN</span><b>LEVEL ${lightLevel} / 3</b></div><div class="light-level-progress-track" aria-label="${lightLevelsCompleted} of 3 levels complete">${[1,2,3].map(level=>`<i class="${level<=lightLevelsCompleted?'filled':''}"></i>`).join('')}</div>`;
}

const lightRenderWithProgress=renderLight;
renderLight=function(){
  lightRenderWithProgress();
  updateLightProgress();
  const check=document.querySelector('#checkLight');
  if(check)check.onclick=checkLightLevel;
  const shellEl=document.querySelector('.game-shell');
  const legend=document.querySelector('.light-legend');
  if(shellEl&&legend){
    legend.innerHTML='<b>LEGEND</b><br>PRESS R TO ROTATE<br>LEFT CLICK TO SELECT ONE';
    if(legend.parentElement!==shellEl)shellEl.append(legend);
  }
  ensureLightSolutionButton();
};

