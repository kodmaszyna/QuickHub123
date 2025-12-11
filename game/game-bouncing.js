// simple bouncing ball game (ES module)
export async function init(container){
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 360;
  canvas.style.maxWidth = '100%';
  canvas.style.borderRadius = '6px';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let running = true;
  let x = canvas.width/2, y=canvas.height/2, vx=2.5, vy=1.8, r=16;
  function resize(){
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(320, Math.min(800, rect.width-24));
    canvas.height = Math.max(200, rect.height-24);
  }
  window.addEventListener('resize', resize);
  resize();

  function step(){
    if(!running) return;
    x += vx; y+=vy;
    if(x<r || x>canvas.width-r) vx *= -1;
    if(y<r || y>canvas.height-r) vy *= -1;
    ctx.fillStyle = '#012534';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  return {
    destroy: async () => {
      running = false;
      window.removeEventListener('resize', resize);
      try{ container.removeChild(canvas); }catch(e){}
    }
  };
}

export default { init };
