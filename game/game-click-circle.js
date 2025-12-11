// click-the-circle game (ES module)
export async function init(container){
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 360;
  canvas.style.maxWidth = '100%';
  canvas.style.borderRadius = '6px';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let score = 0;
  let circle = {x:100,y:100,r:30};
  let running = true;
  function resize(){
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(320, Math.min(800, rect.width-24));
    canvas.height = Math.max(200, rect.height-24);
  }
  window.addEventListener('resize', resize);
  resize();

  canvas.addEventListener('click', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const my = (ev.clientY - rect.top) * (canvas.height / rect.height);
    const d = Math.hypot(mx - circle.x, my - circle.y);
    if(d <= circle.r){
      score++;
      place();
    }
  });

  function place(){
    circle.r = 16 + Math.random()*28;
    circle.x = circle.r + Math.random()*(canvas.width - circle.r*2);
    circle.y = circle.r + Math.random()*(canvas.height - circle.r*2);
  }
  place();

  function draw(){
    if(!running) return;
    ctx.fillStyle = '#001921';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI*2);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.fillStyle = '#e6eef8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Score: '+score, 12, 22);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  return {
    destroy: async () => {
      running = false;
      window.removeEventListener('resize', resize);
      try{ container.removeChild(canvas); }catch(e){}
    }
  };
}

export default { init };
