(function(){
    const viewport = document.getElementById('values-carousel');
    if(!viewport) return;
    const track = document.getElementById('values-track');
    const prevBtn = document.getElementById('values-prev');
    const nextBtn = document.getElementById('values-next');

    const INTERVAL = 2000;
    const DURATION = 500;
    let timer = null;
    let isAnimating = false;
    let isPaused = false;

    function slideWidth(){
        const first = track.children[0];
        if(!first) return viewport.clientWidth;
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 24;
        return first.getBoundingClientRect().width + gap;
    }

    function doStep(){
        if(isAnimating || isPaused) return;
        isAnimating = true;
        const w = slideWidth();
        track.style.transition = `transform ${DURATION}ms ease`;
        track.style.transform = `translateX(-${w}px)`;
        setTimeout(()=>{
            track.style.transition = 'none';
            track.style.transform = 'none';
            const first = track.children[0];
            if(first) track.appendChild(first);
            void track.offsetWidth;
            isAnimating = false;
        }, DURATION + 20);
    }

    function start(){ stop(); timer = setInterval(doStep, INTERVAL); }
    function stop(){ if(timer){ clearInterval(timer); timer = null; } }

    if(nextBtn) nextBtn.addEventListener('click', ()=>{ doStep(); });
    if(prevBtn) prevBtn.addEventListener('click', ()=>{
        if(isAnimating) return;
        isAnimating = true;
        const children = track.children;
        const last = children[children.length - 1];
        const w = slideWidth();
        if(last) track.insertBefore(last, children[0]);
        track.style.transition = 'none';
        track.style.transform = `translateX(-${w}px)`;
        requestAnimationFrame(()=>{
            track.style.transition = `transform ${DURATION}ms ease`;
            track.style.transform = 'translateX(0)';
            setTimeout(()=>{
                track.style.transition = 'none';
                track.style.transform = 'none';
                isAnimating = false;
            }, DURATION + 20);
        });
    });

    viewport.addEventListener('mouseenter', ()=>{ isPaused = true; });
    viewport.addEventListener('mouseleave', ()=>{ isPaused = false; });
    viewport.addEventListener('focusin', ()=>{ isPaused = true; });
    viewport.addEventListener('focusout', ()=>{ isPaused = false; });

    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowRight') { e.preventDefault(); doStep(); }
        if(e.key === 'ArrowLeft') { e.preventDefault(); prevBtn && prevBtn.click(); }
    });

    (function ensureMany(){
        const min = 6;
        const items = Array.from(track.children);
        if(items.length === 0) return;
        while(track.children.length < min){
            for(const it of items){ track.appendChild(it.cloneNode(true)); if(track.children.length >= min) break; }
        }
    })();

    requestAnimationFrame(()=>{ setTimeout(start, 400); });
})();
