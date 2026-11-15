// Rádio Cidade 97.7 · apresentação da Cida
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const REDUZ = matchMedia('(prefers-reduced-motion: reduce)').matches;
const slides = $$('.s');
const N = slides.length;
let atual = -1, ocupado = false;

// ---------- escalonamento automático das entradas ----------
slides.forEach(s => {
  $$('.t', s).forEach(t => $$(':scope>span>i', t).forEach((i, k) => i.style.setProperty('--i', k)));
  const nT = $$('.t>span', s).length;
  $$('.a', s).forEach((el, k) => { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', k + nT); });
});

// ---------- navegação ----------
const bg = $('#bg'), wipe = $('#wipe'), barra = $('#barra'), cont = $('#cont'), secNome = $('#secNome');
const topo = $('#topo'), base = $('#base');
function irPara(n, dir = 1) {
  n = Math.max(0, Math.min(N - 1, n));
  if (n === atual || ocupado) return;
  const proximo = slides[n], anterior = slides[atual];
  const sobe = proximo.dataset.entra === 'sobe' && dir > 0;
  const troca = (semFundo) => {
    if (anterior && !semFundo) anterior.classList.remove('on');
    // reinicia as animações de entrada
    proximo.classList.remove('on'); void proximo.offsetWidth; proximo.classList.add('on');
    if (!semFundo) bg.style.backgroundColor = proximo.dataset.bg;
    const ui = proximo.dataset.ui === 'escuro' ? 'escuro' : 'claro';
    [topo, base].forEach(e => { e.classList.toggle('escuro', ui === 'escuro'); e.classList.toggle('claro', ui === 'claro'); });
    atual = n; aoEntrar(n);
  };
  barra.style.width = ((n + 1) / N * 100) + '%';
  cont.textContent = String(n + 1).padStart(2, '0') + ' / ' + N;
  secNome.textContent = proximo.dataset.nome || '';
  history.replaceState(null, '', '#' + (n + 1));
  if (atual < 0 || REDUZ) { troca(); return; }
  ocupado = true;
  if (sobe) {
    // a ficha da persona sobe por cima do card, como no app
    proximo.style.transition = 'none'; proximo.style.transform = 'translateY(100%)';
    proximo.style.background = proximo.dataset.bg; proximo.style.borderRadius = '44px 44px 0 0';
    proximo.style.boxShadow = '0 -30px 80px rgba(0,0,0,.35)';
    troca(true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      proximo.style.transition = 'transform .95s cubic-bezier(.76,0,.24,1), border-radius .95s cubic-bezier(.76,0,.24,1)'; proximo.style.transform = 'translateY(0)'; proximo.style.borderRadius = '0';
      setTimeout(() => {
        bg.style.transition = 'none'; bg.style.backgroundColor = proximo.dataset.bg; void bg.offsetWidth; bg.style.transition = '';
        anterior.classList.remove('on'); Object.assign(proximo.style, { transition: '', transform: '', background: '', borderRadius: '', boxShadow: '' }); ocupado = false;
      }, 1000);
    }));
    return;
  }
  wipe.classList.remove('go'); void wipe.offsetWidth; wipe.classList.add('go');
  setTimeout(troca, 420);
  setTimeout(() => { ocupado = false; }, 900);
}
const prox = () => irPara(atual + 1, 1), ant = () => irPara(atual - 1, -1);
$('#prox').onclick = prox; $('#ant').onclick = ant;
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input,textarea')) return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); prox(); }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); ant(); }
  else if (e.key === 'f' || e.key === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); }
  else if (e.key === 'Home') irPara(0, -1); else if (e.key === 'End') irPara(N - 1, 1);
});
let rodaT = 0;
addEventListener('wheel', e => {
  if (e.target.closest('iframe,.legenda,.full')) return;
  const now = performance.now(); if (now - rodaT < 900 || Math.abs(e.deltaY) < 24) return;
  rodaT = now; e.deltaY > 0 ? prox() : ant();
}, { passive: true });
let tx0 = null;
addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
addEventListener('touchend', e => {
  if (tx0 === null || e.target.closest('.carta,.arrasto')) return;
  const dx = e.changedTouches[0].clientX - tx0; if (Math.abs(dx) > 60) dx < 0 ? prox() : ant(); tx0 = null;
});

// ---------- ao entrar em cada slide ----------
const visitados = new Set();
function aoEntrar(n) {
  const s = slides[n];
  $$('iframe[data-src]', s).forEach(f => { if (!f.src) f.src = f.dataset.src; });
  ajustaCel();
  $('#gig').classList.toggle('on', s.id === 's6');
  document.body.classList.toggle('primeiro', n === 0);
  if (s.id === 's1') animaDial();
  if (s.classList.contains('ficha-p')) contaCompat(s);
  if (s.classList.contains('persona')) resetaCarta(s);
  cena.alvo(s.dataset['3d'] || null, !visitados.has(n));
  visitados.add(n);
}

// ---------- abertura: sintoniza 87.5 → 97.7 ----------
function sintoniza(el, de, ate, ms, fim) {
  const t0 = performance.now();
  (function f(now) {
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 4);
    el.textContent = (de + (ate - de) * e).toFixed(1);
    k < 1 ? requestAnimationFrame(f) : fim && fim();
  })(t0);
}
let s1 = '';
for (let f = 880; f <= 1080; f += 2) {
  const x = (f - 880) / 200 * 1000, big = f % 10 === 0;
  s1 += `<line x1="${x}" x2="${x}" y1="${big ? 2 : 12}" y2="30" stroke="#F7F4EB" stroke-opacity="${big ? .9 : .35}" stroke-width="${big ? 3 : 2}"/>`;
  if (f % 20 === 0) s1 += `<text x="${x}" y="46" fill="#F7F4EB" fill-opacity=".6" font-family="Mont" font-weight="700" font-size="12" text-anchor="${f === 880 ? 'start' : f === 1080 ? 'end' : 'middle'}">${f / 10}</text>`;
}
$('#dial1').innerHTML = s1;
function animaDial() {
  const ag = $('#agulha1'), pos = f => ((f - 88) / 20 * 100) + '%';
  if (REDUZ) { ag.style.setProperty('--x', pos(97.7)); return; }
  const t0 = performance.now();
  (function f(now) {
    const t = Math.max(0, (now - t0) / 1000 - .5), z = .5, w = 2 * Math.PI * .8, wd = w * Math.sqrt(1 - z * z);
    const k = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + z * w / wd * Math.sin(wd * t));
    ag.style.setProperty('--x', pos(88 + (97.7 - 88) * k));
    if (t < 3) requestAnimationFrame(f);
  })(t0);
}

// ---------- rádio ao vivo (Toca aqui) ----------
const STREAM = 'https://9158.brasilstream.com.br/stream';
const radio = new Audio(); radio.preload = 'none';
let tocando = false;
function setToca(on) {
  tocando = on; document.body.classList.toggle('tocando', on);
}
async function toca(btn) {
  if (btn) { const o = document.createElement('span'); o.className = 'onda'; btn.appendChild(o); setTimeout(() => o.remove(), 1300); }
  cena.pulo();
  if (tocando) { radio.pause(); radio.removeAttribute('src'); radio.load(); setToca(false); return; }
  setToca(true);
  radio.src = STREAM + '?t=' + Date.now();
  try { await radio.play(); } catch (e) { setToca(false); }
}
$$('.js-toca').forEach(b => b.addEventListener('click', () => toca(b)));
radio.onerror = () => { if (tocando) setToca(false); };

// celular: a página da Cida roda em 430 px e é reduzida para caber
function ajustaCel() { $$('.celular .tela').forEach(t => t.style.setProperty('--k', (t.clientWidth / 430).toFixed(4))); }
addEventListener('resize', ajustaCel); ajustaCel();

// ---------- tela cheia para site e Cida ----------
const full = $('#full'), fullFrame = $('#fullFrame');
$$('.js-abrir').forEach(b => b.onclick = () => {
  if (tocando) { radio.volume = .2; }
  fullFrame.src = b.dataset.src; full.classList.add('on');
});
const fechaFull = () => { full.classList.remove('on'); fullFrame.src = 'about:blank'; radio.volume = 1; };
$('#fullX').onclick = fechaFull; full.onclick = e => { if (e.target === full) fechaFull(); };
addEventListener('keydown', e => { if (e.key === 'Escape' && full.classList.contains('on')) fechaFull(); });

// ---------- 8 · expressões e bocas ----------
const EXP = [['feliz', 'Feliz', 'O padrão dela'], ['chocada', 'Chocada', 'Babado novo'], ['curtindo', 'Curtindo', 'Música boa'], ['desconfiada', 'Desconfiada', 'Boato no ar'], ['rindo', 'Rindo', 'Piada interna'], ['piscadinha', 'Piscadinha', 'Dica de amiga']];
$('#exps').innerHTML = EXP.map(([f, n, d], k) => `<div class="exp a gir" style="--r0:${k % 2 ? 12 : -12}deg;--i:${k + 3}"><img src="img/cida/expc-${f}.webp" alt="Cida ${n.toLowerCase()}"><b>${n}</b><small>${d}</small></div>`).join('');
const BOCAS = [['fechada', 'Fechada'], ['leve', 'Leve'], ['dentes', 'Dentes'], ['e', 'É'], ['a', 'A'], ['o', 'Ó'], ['i', 'S / I']];
$('#bocaViva').innerHTML = BOCAS.map(([b]) => `<img src="img/cida/boca-${b}.webp" alt="">`).join('');
$('#tirinha').innerHTML = BOCAS.map(([, n]) => `<span>${n}</span>`).join('');
(function () {
  const imgs = $$('#bocaViva img'), tags = $$('#tirinha span');
  const seq = [0, 1, 3, 4, 2, 6, 3, 4, 5, 1, 0, 0, 4, 3, 2, 6, 1, 5, 4, 0, 0, 0];
  let k = 0;
  setInterval(() => {
    if (!slides[atual] || slides[atual].id !== 's8') return;
    const b = seq[k++ % seq.length];
    imgs.forEach((im, j) => im.classList.toggle('v', j === b)); tags.forEach((t, j) => t.classList.toggle('v', j === b));
  }, 160);
})();

// ---------- personas: card estilo app + ficha ----------
function resetaCarta(sec) {
  const carta = $('.carta', sec); if (!carta) return;
  carta.style.transition = 'none'; carta.style.transform = ''; carta.style.opacity = 1;
  $$('.selo', carta).forEach(x => x.style.opacity = 0); $('.match', sec).classList.remove('on');
}
$$('.persona').forEach(sec => {
  const carta = $('.carta', sec), match = $('.match', sec);
  let arr = null;
  const darMatch = () => {
    carta.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1),opacity .6s'; carta.style.transform = 'translateX(140%) rotate(22deg)'; carta.style.opacity = 0;
    setTimeout(() => match.classList.add('on'), 250);
    setTimeout(() => { if (slides[atual] === sec) irPara(atual + 1, 1); }, 1500);
  };
  $('.lk', sec).onclick = darMatch; $('.st', sec).onclick = darMatch;
  $('.x', sec).onclick = () => { carta.style.transition = 'transform .35s'; carta.style.transform = 'translateX(-30px) rotate(-6deg)'; setTimeout(() => { carta.style.transform = ''; }, 300); };
  carta.addEventListener('pointerdown', e => { arr = { x: e.clientX, y: e.clientY }; carta.setPointerCapture(e.pointerId); carta.style.transition = 'none'; });
  carta.addEventListener('pointermove', e => {
    if (!arr) return; const dx = e.clientX - arr.x, dy = e.clientY - arr.y;
    carta.style.transform = `translate(${dx}px,${dy * .3}px) rotate(${dx / 18}deg)`;
    $('.selo.like', carta).style.opacity = Math.max(0, dx / 120); $('.selo.nope', carta).style.opacity = Math.max(0, -dx / 120);
  });
  carta.addEventListener('pointerup', e => {
    if (!arr) return; const dx = e.clientX - arr.x; arr = null;
    if (dx > 110) darMatch();
    else { carta.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)'; carta.style.transform = ''; $$('.selo', carta).forEach(x => x.style.opacity = 0); }
  });
});

// ---------- compatibilidade ----------
function contaCompat(sec) {
  const el = $('.pct', sec); if (!el) return; const alvo = +el.dataset.v, t0 = performance.now();
  (function f(now) { const k = Math.min(1, (now - t0 - 700) / 1600); el.textContent = (k <= 0 ? 0 : Math.round(alvo * (1 - Math.pow(1 - k, 3)))) + '%'; if (k < 1) requestAnimationFrame(f); })(t0);
}

// ---------- 12 · ondas ----------
(function () {
  let s = ''; const cs = ['#FFD60A', '#E61973', '#F24444', '#F7F4EB'];
  for (let j = 0; j < 9; j++) { let d = ''; for (let x = -10; x <= 210; x += 5) { const y = 20 + j * 22 + Math.sin(x / 18 + j) * 8; d += (x === -10 ? 'M' : 'L') + x + ' ' + y.toFixed(1); } s += `<path d="${d}" fill="none" stroke="${cs[j % 4]}" stroke-width="7" stroke-linecap="round"/>`; }
  $('#ondasSvg').innerHTML = s;
})();

// ---------- 14 · abas ----------
$$('#abas button').forEach(b => b.onclick = () => {
  const i = +b.dataset.i;
  $$('#abas button').forEach(x => x.classList.toggle('on', x === b));
  $$('#arte img').forEach((im, j) => im.classList.toggle('on', j === i));
  $$('.leg').forEach((l, j) => l.classList.toggle('on', j === i));
});

// ================= 3D =================
const cena = (function () {
  const canvas = $('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const TM = new URLSearchParams(location.search).get('tm') || 'none';
  renderer.toneMapping = TM === 'aces' ? THREE.ACESFilmicToneMapping : TM === 'agx' ? THREE.AgXToneMapping : THREE.NoToneMapping;
  renderer.toneMappingExposure = TM === 'aces' ? 1.05 : 1;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(28, 1, .05, 50);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(1.5, 2.5, 3); scene.add(key);
  const rimA = new THREE.DirectionalLight(0xffd60a, 2.2); rimA.position.set(-3, 1.5, -2); scene.add(rimA);
  const rimB = new THREE.DirectionalLight(0x2558ff, 1.6); rimB.position.set(3, .5, -2.5); scene.add(rimB);
  scene.add(new THREE.AmbientLight(0xffffff, .25));

  const raiz = new THREE.Group(); scene.add(raiz);      // posição/escala por slide
  const corpo = new THREE.Group(); raiz.add(corpo);     // dança, giro, pulo
  let modelo = null;
  const H = 1.057;                                      // altura do modelo

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load('models/cida-hd.glb', g => {
    modelo = g.scene;
    modelo.traverse(o => { if (o.isMesh) { o.material.envMapIntensity = .8; o.castShadow = false; } });
    modelo.position.y = -H / 2;            // centro do modelo na origem
    corpo.add(modelo);
  });

  // sombra suave no chão
  const sombraTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(.75, .3), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = -H / 2 + .002; raiz.add(sombra);

  // estados por slide: x em fração da largura visível, escala e giro
  const ESTADOS = {
    hero: { x: 0, y: -.02, s: 1, ry: 0, vis: 1 },
    hots: { x: .02, y: -.02, s: 1.02, ry: 0, vis: 1 },
    fecho: { x: .12, y: -.04, s: .88, ry: -.2, vis: 1 },
  };
  let alvoNome = null, vis = 0, entra = 0;
  const atualE = { x: 0, y: -1.2, s: 1, ry: 0 };
  let arrastoRy = 0, arrastoV = 0, giroExtra = 0, pulo = 0;
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; });

  // arrastar para girar (slide 6)
  const ar = $('#arrasto'); let ax = null;
  ar.addEventListener('pointerdown', e => { ax = e.clientX; ar.setPointerCapture(e.pointerId); });
  ar.addEventListener('pointermove', e => { if (ax === null) return; const d = (e.clientX - ax) / innerWidth * 6; arrastoV = d; arrastoRy += d; ax = e.clientX; });
  ar.addEventListener('pointerup', () => { ax = null; });
  ar.addEventListener('click', () => { if (Math.abs(arrastoV) < .002) cena.pulo(); });

  // rótulos dos detalhes: duas colunas fixas, linhas com cotovelo
  const HOTS = [
    ['Cachos com mechas laranja', 'O cabelo é a energia dela', [.17, .95, .08], 1],
    ['Sobrancelha descolorida', 'Atitude e tendência', [.05, .842, .165], 1],
    ['Fone de fio', 'A rádio sempre no ouvido', [.125, .76, .07], 1],
    ['Camisa e gravata', 'O toque vintage', [.009, .53, .15], 1],
    ['Bermuda cargo', 'Conforto de quem vive na rua', [.12, .22, .15], 1],
    ['Mão que acena', 'Chega cumprimentando todo mundo', [-.264, .70, .149], -1],
    ['Suéter listrado', 'Pulso, Frequência e Sol', [-.12, .45, .15], -1],
    ['Vans', 'Clássico que nunca sai de moda', [-.1, .05, .18], -1],
  ];
  const hotsEl = $('#hots'), hotSvg = $('#hotsvg');
  hotsEl.innerHTML = HOTS.map(([t, d, , l]) => `<div class="hot ${l < 0 ? 'esq' : ''}"><span class="rot">${t}<small>${d}</small></span></div>`).join('');
  hotSvg.innerHTML = HOTS.map(() => '<path/><circle r="7"/>').join('');
  const hotEls = $$('.hot', hotsEl), hotPaths = $$('path', hotSvg), hotDots = $$('circle', hotSvg);
  let hotT0 = 0;

  function tamanho() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h;
    // distância para a boneca ocupar ~78% da altura
    const fov = cam.fov * Math.PI / 180; cam.position.set(0, .02, (H / .78) / 2 / Math.tan(fov / 2)); cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }
  addEventListener('resize', tamanho); tamanho();

  const clock = new THREE.Clock(); const v3 = new THREE.Vector3();
  function loop() {
    const dt = Math.min(.12, clock.getDelta()), t = clock.elapsedTime;
    const L = r => 1 - Math.exp(-dt * r);           // suavização por tempo, não por frame
    const e = alvoNome ? ESTADOS[alvoNome] : null;
    const alvoVis = e ? 1 : 0;
    vis += (alvoVis - vis) * L(alvoVis ? 4.2 : 7);
    if (e) { atualE.x += (e.x - atualE.x) * L(4.2); atualE.y += (e.y - atualE.y) * L(3.6); atualE.s += (e.s - atualE.s) * L(4.2); atualE.ry += (e.ry - atualE.ry) * L(3.6); }
    if (!alvoNome && vis < .01) { canvas.style.opacity = 0; hotEls.forEach(el => el.classList.remove('vis')); requestAnimationFrame(loop); return; }
    const vh = 2 * Math.tan(cam.fov * Math.PI / 360) * cam.position.z, vw = vh * cam.aspect;
    raiz.position.set(atualE.x * vw, atualE.y * vh - (1 - vis) * vh * .9, 0);
    raiz.scale.setScalar(atualE.s * (.85 + .15 * vis));
    // entrada com giro
    entra += (1 - entra) * L(1.5); giroExtra *= Math.exp(-dt * 3.6);
    arrastoRy += arrastoV; arrastoV *= Math.exp(-dt * 5); if (alvoNome !== 'hero') arrastoRy *= Math.exp(-dt * 3);
    const dancando = tocando && alvoNome;
    let ry = atualE.ry + arrastoRy + (1 - entra) * Math.PI * 2.2 + giroExtra + mouse.x * .25;
    let by = Math.sin(t * 1.6) * .008, rz = 0;
    if (alvoNome === 'hots') ry = Math.sin(t * .5) * .32 + mouse.x * .15;
    if (dancando && !REDUZ) { const b = t * Math.PI * 2 * (118 / 60); by += Math.abs(Math.sin(b / 2)) * .035; rz = Math.sin(b / 2) * .06; ry += Math.sin(b / 4) * .35; }
    pulo *= Math.exp(-dt * 6); by += Math.sin((1 - pulo) * Math.PI) * pulo * .09;
    corpo.rotation.set(-mouse.y * .05, ry, rz); corpo.position.y = by;
    sombra.scale.setScalar(1 - by * 3);
    canvas.style.opacity = Math.min(1, vis * 1.4);
    renderer.render(scene, cam);
    // rótulos
    const mostraHots = alvoNome === 'hots' && vis > .9 && modelo;
    hotSvg.classList.toggle('vis', !!mostraHots);
    if (!mostraHots) { hotEls.forEach(el => el.classList.remove('vis')); hotPaths.forEach(p => p.classList.remove('on')); hotDots.forEach(c => c.classList.remove('on')); }
    else {
      const W = innerWidth, Hh = innerHeight;
      const colD = W * .745, colE = W * .255;           // bordas internas das colunas
      const slotsD = HOTS.filter(h => h[3] > 0).length, slotsE = HOTS.length - slotsD;
      let iD = 0, iE = 0;
      hotEls.forEach((el, k) => {
        const [, , p, lado] = HOTS[k];
        v3.set(p[0], p[1], p[2]); modelo.localToWorld(v3); v3.project(cam);
        const x = (v3.x + 1) / 2 * W, y = (1 - v3.y) / 2 * Hh;
        // posições verticais fixas por coluna (esquerda começa abaixo do título)
        const sy = lado > 0 ? Hh * (.17 + (iD++) * (.66 / (slotsD - 1))) : Hh * (.47 + (iE++) * (.38 / (slotsE - 1)));
        const cx = lado > 0 ? colD : colE, ex = cx - lado * 36;
        el.style.transform = lado > 0 ? `translate(${cx + 10}px,${sy}px)` : `translate(${cx - 10 - el.offsetWidth}px,${sy}px)`;
        const d = `M${x.toFixed(1)} ${y.toFixed(1)} L${ex.toFixed(1)} ${sy.toFixed(1)} L${cx.toFixed(1)} ${sy.toFixed(1)}`;
        const path = hotPaths[k]; path.setAttribute('d', d);
        const len = Math.hypot(ex - x, sy - y) + 36; path.style.setProperty('--len', len.toFixed(0));
        hotDots[k].setAttribute('cx', x.toFixed(1)); hotDots[k].setAttribute('cy', y.toFixed(1));
        if (performance.now() - hotT0 > 700 + k * 180) { hotDots[k].classList.add('on'); path.classList.add('on'); }
        if (performance.now() - hotT0 > 1100 + k * 180) el.classList.add('vis');
      });
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return {
    alvo(nome, primeira) {
      if (nome && !alvoNome && primeira) { entra = 0; }
      alvoNome = nome && ESTADOS[nome] ? nome : null;
      if (alvoNome === 'hots') hotT0 = performance.now();
      if (alvoNome && atualE.y < -1) { Object.assign(atualE, { ...ESTADOS[alvoNome] }); }
    },
    pulo() { pulo = 1; giroExtra += Math.PI * 2; },
  };
})();

// ---------- início: carregando a "sintonia" ----------
const loader = $('#loader');
const inicio = Math.max(1, Math.min(N, parseInt(location.hash.slice(1)) || 1)) - 1;
function comeca() { loader.classList.add('fora'); setTimeout(() => loader.remove(), 1100); irPara(inicio, 1); }
if (REDUZ) { $('#loaderNum').textContent = '97.7'; comeca(); }
else {
  let foi = false; const vai = () => { if (!foi) { foi = true; comeca(); } };
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(() => sintoniza($('#loaderNum'), 87.5, 97.7, 1400, () => setTimeout(vai, 250)));
  setTimeout(vai, 4200);
}
