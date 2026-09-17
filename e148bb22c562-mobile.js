(() => {
    const byId = id => document.getElementById(id);
    const queue = [];
    const pointers = new Map();
    let forced = false;
    let settingsInitialized = false;
    let snapshot = {};
    const capabilities = matchMedia('(any-pointer: coarse)');
    const send = (action, value) => {
        if (window.snakeFeverReady && queue.length < 24) queue.push({action, value});
    };
    const clearPressed = () => {
        pointers.clear();
        document.querySelectorAll('.pressed').forEach(button => button.classList.remove('pressed'));
    };
    window.sfDrain = () => JSON.stringify(queue.splice(0));
    window.sfTouch = false;
    window.sfInterrupted = false;
    window.sfClear = () => { queue.length = 0; clearPressed(); };
    const layout = () => {
        window.sfTouch = forced || capabilities.matches;
        document.body.classList.toggle('touch', window.sfTouch);
        window.sfInterrupted = true;
        clearPressed();
    };
    capabilities.addEventListener('change', layout);
    matchMedia('(orientation: landscape)').addEventListener('change', layout);
    window.addEventListener('orientationchange', layout);
    window.addEventListener('blur', () => { window.sfInterrupted = true; window.sfClear(); });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { window.sfInterrupted = true; window.sfClear(); }
    });
    byId('touch-toggle').addEventListener('click', () => { forced = !forced; layout(); });
    document.querySelectorAll('[data-direction], [data-action]').forEach(button => {
        button.addEventListener('pointerdown', event => {
            if (event.button !== 0 || button.disabled) return;
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            pointers.set(event.pointerId, button);
            button.classList.add('pressed');
            send(button.dataset.direction ? 'turn' : button.dataset.action, button.dataset.direction);
        });
        const release = event => {
            pointers.delete(event.pointerId);
            if (![...pointers.values()].includes(button)) button.classList.remove('pressed');
        };
        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('lostpointercapture', release);
        button.addEventListener('click', event => {
            // Keyboard and assistive activation only; pointerdown already handled touch/mouse.
            if (event.detail === 0 && !button.disabled) send(button.dataset.direction ? 'turn' : button.dataset.action, button.dataset.direction);
        });
    });
    document.querySelectorAll('[data-setting]').forEach(input => {
        input.addEventListener('input', () => send('setting', {
            name:input.dataset.setting, value:input.type === 'checkbox' ? input.checked : Number(input.value)
        }));
    });
    try { byId('left-handed').checked = localStorage.getItem('snake-fever.swapped') === 'true'; } catch (_) {}
    const swap = () => document.body.classList.toggle('swapped', byId('left-handed').checked);
    byId('left-handed').addEventListener('change', () => {
        swap();
        try { localStorage.setItem('snake-fever.swapped', byId('left-handed').checked); } catch (_) {}
    });
    byId('mobile-settings').addEventListener('cancel', event => { event.preventDefault(); send('close_settings'); });
    window.sfRender = raw => {
        snapshot = JSON.parse(raw);
        const s = snapshot;
        const canFever = s.ready && s.status === 'playing' && !s.panel && s.countdown <= 0;
        byId('score').textContent = String(s.score).padStart(4, '0');
        byId('best').textContent = String(s.best).padStart(4, '0');
        byId('fps-readout').hidden = !s.settings.show_fps;
        byId('fps-readout').textContent = `${s.fps} FPS`;
        document.body.classList.toggle('fever', s.fever);
        document.body.classList.toggle('fever-ready', canFever);
        document.body.classList.toggle('fever-charging', !s.ready && !s.fever);
        document.body.classList.toggle('fever-recharged', canFever && s.recharged && !s.settings.reduced_motion);
        document.body.classList.toggle('fever-arrival', s.fever && s.arrival && !s.settings.reduced_motion);
        byId('fever-label').textContent = s.fever ? (s.left <= 2 ? 'FEVER ENDING' : 'FEVER TIME') : s.ready ? 'FEVER READY' : 'RECHARGING';
        byId('fever-time').textContent = s.fever ? `${s.left.toFixed(1)}s` : s.ready ? '' : `${s.cooldown.toFixed(1)}s`;
        const percent = Math.max(0, Math.min(100, s.meter * 100));
        byId('fever-fill').style.width = `${percent}%`;
        byId('fever-meter').setAttribute('aria-valuenow', Math.round(percent));
        byId('fever-meter').setAttribute('aria-label', s.fever ? 'Fever time remaining' : 'Fever charge');
        byId('fever-button').disabled = !canFever;
        byId('pause-button').disabled = !['playing','paused'].includes(s.status) || !!s.panel;
        byId('pause-button').setAttribute('aria-label', s.status === 'paused' ? 'Resume' : 'Pause');
        byId('pause-button').title = s.status === 'paused' ? 'Resume' : 'Pause';
        const overlay = byId('round-overlay');
        overlay.hidden = !window.sfTouch || (s.status === 'playing' && s.countdown <= 0) || !!s.panel;
        byId('round-title').textContent = s.countdown > 0 ? 'READY...' : ({ready:'READY?',paused:'PAUSED',over:'GAME OVER',won:'BOARD CLEAR!'}[s.status] || '');
        byId('start-button').textContent = s.status === 'ready' ? 'PLAY' : s.status === 'paused' ? 'RESUME' : 'PLAY AGAIN';
        byId('start-button').hidden = s.countdown > 0;
        byId('restart-button').hidden = s.status !== 'paused' || s.countdown > 0;
        byId('round-score').hidden = !['over','won'].includes(s.status);
        byId('round-score').textContent = `SCORE ${s.score}`;
        document.querySelectorAll('[data-direction]').forEach(button => {
            button.disabled = !!s.panel || !['ready','playing'].includes(s.status) || s.countdown > 0;
        });
        const dialog = byId('mobile-settings');
        if (s.panel && window.sfTouch) {
            if (!settingsInitialized) {
                document.querySelectorAll('[data-setting]').forEach(input => {
                    if (input.type === 'checkbox') input.checked = s.settings[input.dataset.setting];
                    else input.value = s.settings[input.dataset.setting];
                });
                settingsInitialized = true;
            }
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
            settingsInitialized = false;
        }
    };
    swap();
    layout();
    if (window.lucide) lucide.createIcons();
})();
