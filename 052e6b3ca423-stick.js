(() => {
    const angles = {RIGHT:0, DOWN:90, LEFT:180, UP:-90};
    const direction = (x, y, previous) => {
        const angle = Math.atan2(y, x) * 180 / Math.PI;
        if (previous) {
            const difference = Math.abs((angle - angles[previous] + 540) % 360 - 180);
            if (difference <= 55) return previous;
        }
        return ['RIGHT', 'DOWN', 'LEFT', 'UP'][(Math.round(angle / 90) + 4) % 4];
    };
    class Stick {
        constructor(element, send) {
            this.element = element;
            this.send = send;
            this.enabled = false;
            this.id = null;
            this.last = null;
            element.addEventListener('pointerdown', event => {
                if (!this.enabled || this.id !== null || event.button !== 0) return;
                event.preventDefault();
                const r = element.getBoundingClientRect();
                const x = event.clientX - r.x - r.width / 2;
                const y = event.clientY - r.y - r.height / 2;
                const scale = Math.min(1, 18 / (Math.hypot(x, y) || 1));
                this.offset = {x:x * scale, y:y * scale};
                this.origin = {x:r.x + r.width / 2 + this.offset.x, y:r.y + r.height / 2 + this.offset.y};
                this.id = event.pointerId;
                try { element.setPointerCapture(event.pointerId); } catch (_) {}
                element.classList.add('dragging');
                this.move(event);
            });
            window.addEventListener('pointermove', event => {
                if (event.pointerId === this.id) this.move(event);
            });
            for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
                window.addEventListener(name, event => {
                    if (event.pointerId === this.id) this.reset();
                });
            }
        }
        move(event) {
            const x = event.clientX - this.origin.x, y = event.clientY - this.origin.y;
            const distance = Math.hypot(x, y);
            const scale = Math.min(1, 36 / (distance || 1));
            this.element.style.setProperty('--stick-x', `${this.offset.x + x * scale}px`);
            this.element.style.setProperty('--stick-y', `${this.offset.y + y * scale}px`);
            if (distance < (this.last ? 5 : 8)) {
                this.last = null;
                delete this.element.dataset.stickDirection;
                return;
            }
            const next = direction(x, y, this.last);
            if (next !== this.last) {
                this.last = next;
                this.element.dataset.stickDirection = next;
                this.send(next);
            }
        }
        reset() {
            const id = this.id;
            this.id = null;
            this.last = null;
            if (id !== null) {
                try { this.element.releasePointerCapture(id); } catch (_) {}
            }
            this.element.classList.remove('dragging');
            delete this.element.dataset.stickDirection;
            this.element.style.setProperty('--stick-x', '0px');
            this.element.style.setProperty('--stick-y', '0px');
        }
        setEnabled(enabled) {
            this.enabled = enabled;
            this.element.setAttribute('aria-disabled', String(!enabled));
            if (!enabled && this.id !== null) this.reset();
        }
    }
    Stick.direction = direction;
    window.SFStick = Stick;
})();
