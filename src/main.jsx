import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, PauseCircle, PenTool, Wind } from 'lucide-react';
import './styles.css';

const objects = [
  { id: 1, front: '國立大學社工系書卷獎獎狀', back: '憂鬱症診斷證明', text: '數字告訴你我考得很好，卻沒有告訴你我過得不好', kind: 'certificate' },
  { id: 2, front: '展翅協會服務證明', back: '諮商紀錄', text: '我很會照顧人，卻花了很久的時間才學會照顧自己', kind: 'service' },
  { id: 3, front: '名片', back: '回診紀錄', text: '我照常上班，生活卻沒有照常', kind: 'card' },
  { id: 4, front: '彩色生活照', back: '黑白照', text: '那天沒有留在我的臉上，卻留在我的身體裡。', kind: 'photo' }
];

function Paper({ dark = false, kind }) {
  return <div className={`paper ${dark ? 'paper-dark' : ''} paper-${kind}`} aria-hidden="true">
    <div className="paper-mark" />
    <div className="paper-lines"><i /><i /><i /></div>
  </div>;
}

function DrawingBoard({ onSave }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    canvas.width = bounds.width * ratio;
    canvas.height = bounds.height * ratio;
    const context = canvas.getContext('2d');
    context.scale(ratio, ratio);
    context.strokeStyle = '#e4e1d8';
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);

  const point = (event) => {
    const touch = event.touches?.[0];
    const source = touch || event;
    const bounds = canvasRef.current.getBoundingClientRect();
    return { x: source.clientX - bounds.left, y: source.clientY - bounds.top };
  };
  const start = (event) => {
    event.preventDefault();
    const { x, y } = point(event);
    const context = canvasRef.current.getContext('2d');
    context.beginPath(); context.moveTo(x, y);
    setDrawing(true); setHasDrawn(true);
  };
  const draw = (event) => {
    if (!drawing) return;
    event.preventDefault();
    const { x, y } = point(event);
    const context = canvasRef.current.getContext('2d');
    context.lineTo(x, y); context.stroke();
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };
  const save = () => { if (hasDrawn) { onSave(canvasRef.current.toDataURL()); clear(); } };

  return <div className="drawing-board">
    <div className="canvas-wrap">
      {!hasDrawn && <div className="canvas-hint"><PenTool size={17} />用滑鼠或手指在此書寫</div>}
      <canvas ref={canvasRef} onMouseDown={start} onMouseMove={draw} onMouseUp={() => setDrawing(false)} onMouseLeave={() => setDrawing(false)} onTouchStart={start} onTouchMove={draw} onTouchEnd={() => setDrawing(false)} />
    </div>
    <div className="canvas-actions"><button className="text-button" onClick={clear}>重新書寫</button><button className="solid-button small" disabled={!hasDrawn} onClick={save}>留在傘下</button></div>
  </div>;
}

export default function AfterTheJourneyApp() {
  const [view, setView] = useState('home');
  const [visible, setVisible] = useState(true);
  const [umbrellaTaken, setUmbrellaTaken] = useState(false);
  const [graffiti, setGraffiti] = useState([]);

  const changeView = (next) => {
    setVisible(false);
    window.setTimeout(() => { setView(next); setVisible(true); if (next === 'exhibition') window.scrollTo(0, 0); }, 450);
  };
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape' && view !== 'quick-exit') changeView('quick-exit'); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view]);
  useEffect(() => {
    if (view !== 'breathing') return undefined;
    const timer = window.setTimeout(() => changeView('exhibition'), 4200);
    return () => window.clearTimeout(timer);
  }, [view]);
  const saveGraffiti = (src) => setGraffiti((items) => [...items, { id: Date.now(), src, top: `${20 + Math.random() * 60}%`, left: `${20 + Math.random() * 60}%`, rotate: `${-20 + Math.random() * 40}deg` }]);

  const home = <main className="center-page home-page"><div className="reveal"><p className="eyebrow">A DIGITAL EXHIBITION</p><h1>走過之後</h1><div className="rule" /><p className="lead">每一段復元，都有自己的步伐。<br />這是一個關於經歷、選擇、重新認識自己的過程。</p></div><div className="button-row reveal delayed"><button className="solid-button" onClick={() => changeView('breathing')}>進入展覽</button><button className="outline-button" onClick={() => changeView('warning')}>了解觀看提醒</button></div></main>;
  const warning = <main className="center-page"><section className="warning-panel reveal"><p className="eyebrow">BEFORE YOU ENTER</p><h2>觀看提醒與溫柔約定</h2><div className="body-copy"><p>親愛的訪客：</p><p>本展覽包含性暴力倖存者的真實文字故事與心路歷程，記錄從創傷到復原的種種樣貌。</p><p><strong>請隨時將自己的感受放在第一位。</strong></p><ul><li>這不是一趟需要一口氣走完的旅程，您可以隨時暫停。</li><li>右上角設有「我想暫停一下」的按鈕，讓您可以喘口氣。</li><li>感到強烈不適時，按下 <kbd>ESC</kbd> 立即切換至安全的空白畫面。</li></ul></div><div className="button-row"><button className="solid-button" onClick={() => changeView('breathing')}>我了解了，準備進入</button><button className="outline-button" onClick={() => changeView('home')}>我需要再想想</button></div></section></main>;
  const breathing = <main className="center-page breathing"><div className="breath-orb"><div /><div /><Wind /></div><p>跟著圓圈，做一次深呼吸...</p><small>即將緩緩進入展區</small></main>;
  const pause = <main className="center-page"><section className="pause-content reveal"><div className="rule" /><h2>你可以在這裡停留一下。</h2><p>你不需要把展覽看完。<br />你可以選擇離開，也可以稍後再回來。</p><div className="pause-actions"><button className="solid-button" onClick={() => changeView('exhibition')}>繼續展覽</button><button className="outline-button" onClick={() => changeView('home')}>返回首頁</button><button className="text-button" onClick={() => changeView('quick-exit')}>離開（快速退出）</button></div></section></main>;
  const exit = <main className="center-page"><section className="exit-content reveal"><Heart size={46} strokeWidth={1} /><h2>您已離開展覽畫面。</h2><p>這是一個安全的空間。深呼吸，喝杯溫水。<br />沒有關係，復原的路上，隨時可以停下來休息。</p><button className="outline-button" onClick={() => changeView('home')}>回到網站首頁</button></section></main>;

  const exhibition = <main className={`exhibition ${umbrellaTaken ? 'under-umbrella' : ''}`}>
    <div className="rain-filter" />{graffiti.map((item) => <img className="graffiti" key={item.id} src={item.src} style={{ top: item.top, left: item.left, transform: `translate(-50%, -50%) rotate(${item.rotate}) scale(.55)` }} alt="觀展者留下的塗鴉" />)}
    <button className="pause-pill" onClick={() => changeView('pause')}><PauseCircle size={18} />我想暫停一下</button>
    <div className="exhibition-inner"><header className="exhibition-intro"><p className="eyebrow">AFTER THE JOURNEY / 01</p><h2>你看見的，<br />是傘外的晴天</h2><div className="vertical-rule" /><p>往下走，慢慢看</p></header>
      <div className="object-list">{objects.map((item) => <article className={`object ${umbrellaTaken ? 'flipped' : ''}`} key={item.id}><div className="object-dot" /><div className="card-face card-front"><Paper kind={item.kind} /><h3>{item.front}</h3><div className="short-rule" /><p>{item.text}</p></div><div className="card-face card-back"><Paper dark kind={item.kind} /><h3>{item.back}</h3><div className="short-rule" /><p>{item.text}</p></div></article>)}</div>
      <section className="statement"><div className="vertical-rule" /><p>這兩邊記錄著同一個人的兩個時刻<br />一邊記錄著憂鬱，一邊記錄著成就<br />它們都是真的</p></section>
      <section className="umbrella-prompt">{!umbrellaTaken ? <><p>這些晴朗的日常，是我撐起傘努力維持的模樣。<br />但在傘下，其實下著一場不會停的雨。</p><button className="solid-button" onClick={() => { setUmbrellaTaken(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>你願意短暫背負我的重量，接過這把傘嗎？</button></> : <><p>謝謝你，願意走進我的雨天。<br />這把傘保護了我，也隔離了我。</p><small>請繼續往下走</small></>}</section>
      <section className={`graffiti-panel ${umbrellaTaken ? 'active' : ''}`}><p className="eyebrow">LEAVE A TRACE</p><h2>成為傘的一部分</h2><p>請在這裡留下你想說的話，或畫下任何感受。<br />你的字跡，將成為接住下一位觀展者的力量。</p><DrawingBoard onSave={saveGraffiti} /><div className="departure"><span>這是一段漫長的歷程，但我們都在這裡。</span><button className="outline-button" onClick={() => changeView('home')}>緩緩離開展覽</button></div></section>
    </div>
  </main>;

  const content = { home, warning, breathing, exhibition, pause, 'quick-exit': exit }[view];
  return <div className={`app ${visible ? 'is-visible' : ''}`}>{content}</div>;
}

createRoot(document.getElementById('root')).render(<AfterTheJourneyApp />);
