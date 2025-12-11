// main app logic (ES module)
const btnConsole = document.getElementById('btn-console');
const btnGames = document.getElementById('btn-games');
const consoleView = document.getElementById('console-view');
const gamesView = document.getElementById('games-view');

const runBtn = document.getElementById('run-code');
const clearBtn = document.getElementById('clear-output');
const codeInput = document.getElementById('code-input');
const outputEl = document.getElementById('output');
const sandboxFrame = document.getElementById('sandbox-frame');

const gamesMenu = document.getElementById('games-menu');
const gameContainer = document.getElementById('game-container');
let activeGame = null;

function showConsole(){
  consoleView.classList.add('active');
  gamesView.classList.remove('active');
  btnConsole.classList.add('active');
  btnGames.classList.remove('active');
}
function showGames(){
  gamesView.classList.add('active');
  consoleView.classList.remove('active');
  btnGames.classList.add('active');
  btnConsole.classList.remove('active');
}

btnConsole.addEventListener('click', showConsole);
btnGames.addEventListener('click', showGames);

// initialize sandbox iframe with srcdoc that listens for run messages
const sandboxSrcDoc = `
<!doctype html><html><body>
<script>
(function(){
  // capture logs
  const send = (type, payload) => parent.postMessage({type, payload}, '*');
  const logs = [];
  const origConsole = console;
  console = {
    log: function(...args){ send('log', args.map(a=>String(a))); origConsole.log(...args)},
    warn: function(...args){ send('warn', args.map(a=>String(a))); origConsole.warn(...args)},
    error: function(...args){ send('error', args.map(a=>String(a))); origConsole.error(...args)}
  };
  window.addEventListener('message', async (ev) => {
    const data = ev.data;
    if(!data || data.type!=='run') return;
    try{
      let result = await (0, eval)(data.code);
      send('result', String(result));
    }catch(err){
      send('exception', String(err));
    }
  }, false);
  // ready
  send('ready', 'sandbox ready');
})();
<\/script>
</body></html>
`;
sandboxFrame.srcdoc = sandboxSrcDoc;

// receive logs from sandbox
window.addEventListener('message', (ev) => {
  const msg = ev.data || {};
  if(msg.type === 'log') {
    msg.payload.forEach(v => appendOutput('log', v));
  } else if(msg.type === 'warn') {
    msg.payload.forEach(v => appendOutput('warn', v));
  } else if(msg.type === 'error') {
    msg.payload.forEach(v => appendOutput('error', v));
  } else if(msg.type === 'result') {
    appendOutput('result', msg.payload);
  } else if(msg.type === 'exception') {
    appendOutput('exception', msg.payload);
  } else if(msg.type === 'ready') {
    appendOutput('meta', msg.payload);
  }
});

function appendOutput(kind, text){
  const el = document.createElement('div');
  el.className = 'out-'+kind;
  el.textContent = '['+kind+'] '+text;
  outputEl.appendChild(el);
  outputEl.scrollTop = outputEl.scrollHeight;
}

runBtn.addEventListener('click', () => {
  const code = codeInput.value || '';
  appendOutput('meta', 'sending code to sandbox...');
  sandboxFrame.contentWindow.postMessage({type:'run', code}, '*');
});

clearBtn.addEventListener('click', () => {
  outputEl.innerHTML = '';
});

// Simple games loader
async function loadGame(name){
  if(activeGame && activeGame.destroy) {
    try{ await activeGame.destroy(); }catch(e){ console.warn(e) }
    activeGame = null;
    gameContainer.innerHTML = '';
  }
  if(!name) return;
  appendOutput('meta', 'loading game: '+name);
  try {
    let mod;
    if(name === 'bouncing'){
      mod = await import('./games/game-bouncing.js');
    } else if(name === 'clickcircle'){
      mod = await import('./games/game-click-circle.js');
    } else {
      gameContainer.innerHTML = '<div class="game-placeholder">Unknown game</div>';
      return;
    }
    activeGame = await mod.init(gameContainer);
  } catch (err){
    appendOutput('exception', 'failed to load game: '+err);
    gameContainer.innerHTML = '<div class="game-placeholder">Error loading game</div>';
  }
}

gamesMenu.addEventListener('click', (ev) => {
  const li = ev.target.closest('li[data-game]');
  if(!li) return;
  const name = li.getAttribute('data-game');
  // highlight
  [...gamesMenu.querySelectorAll('li')].forEach(n => n.classList.remove('active'));
  li.classList.add('active');
  loadGame(name);
});

// Bookmarklet copy helper
const copyBookmarkletBtn = document.getElementById('copy-bookmarklet');
copyBookmarkletBtn.addEventListener('click', async () => {
  // Default placeholder. Replace with your published URL after GitHub Pages enabled.
  const published = 'https://your-username.github.io/picklebox/';
  const code = `javascript:(function(){window.open('${published}','_blank','noopener');})();`;
  try{
    await navigator.clipboard.writeText(code);
    copyBookmarkletBtn.textContent = 'Copied!';
    setTimeout(()=>copyBookmarkletBtn.textContent = 'Copy Bookmarklet',1500);
  }catch(e){
    alert('Could not copy automatically. Bookmarklet:\n\n'+code);
  }
});

// initial view
showConsole();
appendOutput('meta','Picklebox ready');
