(() => {
    const box = document.getElementById('infobox');
    const snake = document.getElementById('loading-snake');
    let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { reduced ||= !!JSON.parse(localStorage.getItem('snake-fever.save.v1') || '{}').settings?.reduced_motion; } catch (_) {}
    box.classList.toggle('loading-reduced', reduced);
    // Static geometry; compositor transforms animate while the runtime is loading.
    for (let i = 8; i >= 0; i--) {
        const segment = document.createElement('span');
        const angle = (-90 - i * 12) * Math.PI / 180;
        const size = i === 0 ? 18 : i > 5 ? 18 - i : 14;
        segment.className = i === 0 ? 'loading-head' : 'loading-body';
        Object.assign(segment.style, {
            left:`${80 + 56 * Math.cos(angle)}px`, top:`${80 + 56 * Math.sin(angle)}px`,
            width:`${size}px`, height:`${i === 0 ? 16 : size}px`,
            transform:`translate(-50%, -50%) rotate(${-i * 12}deg)`
        });
        snake.appendChild(segment);
    }
    const retry = document.getElementById('loading-retry');
    retry.addEventListener('click', () => location.reload());
    const timer = setTimeout(() => {
        if (!window.snakeFeverReady && box.dataset.phase === 'loading') retry.hidden = false;
    }, 45000);
    const refresh = () => {
        const stopped = document.hidden || box.classList.contains('finished') || box.dataset.phase === 'error';
        if (box.classList.contains('loading-paused') !== stopped) box.classList.toggle('loading-paused', stopped);
        if (box.dataset.phase === 'error') retry.hidden = false;
        if (box.classList.contains('finished')) {
            clearTimeout(timer);
            observer.disconnect();
            document.removeEventListener('visibilitychange', refresh);
        }
    };
    const observer = new MutationObserver(refresh);
    observer.observe(box, {attributes:true, attributeFilter:['data-phase', 'class']});
    document.addEventListener('visibilitychange', refresh);
})();
