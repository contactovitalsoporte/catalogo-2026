/* ==========================================================
   Visor de capacitación – Contacto Vital
   JavaScript puro (sin librerías). Se activa con el botón
   #cv-visor-open. Para añadir/quitar imágenes edita SLIDES.
   ========================================================== */
(function () {
    'use strict';

    var SLIDES = [
        { src: 'img/capacitacion/slide-01.webp', alt: 'Eyaculación precoz: tratamientos más vendidos' },
        { src: 'img/capacitacion/slide-02.webp', alt: 'Impotencia sexual o disfunción eréctil: tratamientos más vendidos' },
        { src: 'img/capacitacion/slide-03.webp', alt: 'Crecimiento o mejorar el tamaño: tratamientos más vendidos' },
        { src: 'img/capacitacion/slide-04.webp', alt: 'Mejorar su energía: tratamientos más vendidos' }
    ];

    var ANIM_MS = 280;

    function init() {
        var openBtn = document.getElementById('cv-visor-open');
        if (!openBtn || !SLIDES.length) return;

        var index = 0;
        var busy = false;
        var lastFocus = null;
        var touchX = null;

        var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        var ICON_PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
        var ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

        var dots = SLIDES.map(function (s, i) {
            return '<button type="button" class="cv-viewer-dot" data-i="' + i + '" aria-label="Ir a la imagen ' + (i + 1) + '"></button>';
        }).join('');

        var viewer = document.createElement('div');
        viewer.className = 'cv-viewer';
        viewer.setAttribute('role', 'dialog');
        viewer.setAttribute('aria-modal', 'true');
        viewer.setAttribute('aria-label', 'Visor de imágenes de capacitación');
        viewer.innerHTML =
            '<div class="cv-viewer-top">' +
                '<p class="cv-viewer-title">Capacitación · Tratamientos más vendidos</p>' +
                '<div class="cv-viewer-top-right">' +
                    '<span class="cv-viewer-counter" aria-live="polite"></span>' +
                    '<button type="button" class="cv-viewer-close" aria-label="Cerrar visor">' + ICON_CLOSE + '</button>' +
                '</div>' +
            '</div>' +
            '<div class="cv-viewer-stage">' +
                '<button type="button" class="cv-viewer-nav cv-viewer-prev" aria-label="Imagen anterior">' + ICON_PREV + '</button>' +
                '<figure class="cv-viewer-figure"><img class="cv-viewer-img" alt="" draggable="false"></figure>' +
                '<button type="button" class="cv-viewer-nav cv-viewer-next" aria-label="Imagen siguiente">' + ICON_NEXT + '</button>' +
            '</div>' +
            '<div class="cv-viewer-bottom"><div class="cv-viewer-dots">' + dots + '</div></div>';
        document.body.appendChild(viewer);

        var img = viewer.querySelector('.cv-viewer-img');
        var counter = viewer.querySelector('.cv-viewer-counter');
        var btnClose = viewer.querySelector('.cv-viewer-close');
        var btnPrev = viewer.querySelector('.cv-viewer-prev');
        var btnNext = viewer.querySelector('.cv-viewer-next');
        var dotEls = Array.prototype.slice.call(viewer.querySelectorAll('.cv-viewer-dot'));
        var stage = viewer.querySelector('.cv-viewer-stage');

        function isOpen() { return viewer.classList.contains('cv-open'); }

        function updateUI() {
            counter.textContent = 'Imagen ' + (index + 1) + ' de ' + SLIDES.length;
            btnPrev.disabled = index === 0;
            btnNext.disabled = index === SLIDES.length - 1;
            dotEls.forEach(function (d, i) {
                d.classList.toggle('cv-active', i === index);
                if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
            });
        }

        function preload(i) {
            if (i < 0 || i >= SLIDES.length) return;
            var p = new Image();
            p.src = SLIDES[i].src;
        }

        function setImage(i) {
            img.src = SLIDES[i].src;
            img.alt = SLIDES[i].alt;
            preload(i + 1);
            preload(i - 1);
        }

        function goTo(target) {
            if (busy || target === index || target < 0 || target >= SLIDES.length) return;
            busy = true;
            var forward = target > index;
            img.classList.add(forward ? 'cv-out-left' : 'cv-out-right');

            window.setTimeout(function () {
                index = target;
                updateUI();
                img.classList.remove('cv-out-left', 'cv-out-right');
                img.classList.add(forward ? 'cv-in-right' : 'cv-in-left');
                img.onload = img.onerror = reveal;
                setImage(index);
                // Si la imagen ya está en caché, onload puede no dispararse.
                if (img.complete) reveal();
            }, ANIM_MS);

            function reveal() {
                img.onload = img.onerror = null;
                // Forzar reflow para que la transición de entrada se aplique.
                void img.offsetWidth;
                img.classList.remove('cv-in-left', 'cv-in-right');
                window.setTimeout(function () { busy = false; }, ANIM_MS);
            }
        }

        function next() { goTo(index + 1); }
        function prev() { goTo(index - 1); }

        function open() {
            lastFocus = document.activeElement;
            index = 0;
            busy = false;
            img.className = 'cv-viewer-img';
            setImage(index);
            updateUI();
            document.documentElement.classList.add('cv-lock');
            viewer.classList.add('cv-open');
            btnClose.focus({ preventScroll: true });
        }

        function close() {
            if (!isOpen()) return;
            viewer.classList.remove('cv-open');
            document.documentElement.classList.remove('cv-lock');
            // El scroll de la página nunca se modifica; el usuario vuelve al mismo punto.
            if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        }

        // Eventos
        openBtn.addEventListener('click', open);
        btnClose.addEventListener('click', close);
        btnPrev.addEventListener('click', prev);
        btnNext.addEventListener('click', next);
        dotEls.forEach(function (d) {
            d.addEventListener('click', function () { goTo(parseInt(d.getAttribute('data-i'), 10)); });
        });

        // Clic en el fondo oscuro (fuera de la imagen y los botones) cierra el visor
        stage.addEventListener('click', function (e) {
            if (e.target === stage || e.target.classList.contains('cv-viewer-figure')) close();
        });

        document.addEventListener('keydown', function (e) {
            if (!isOpen()) return;
            if (e.key === 'Escape') { e.preventDefault(); close(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
            else if (e.key === 'Tab') {
                // Mantener el foco dentro del visor
                var f = Array.prototype.slice.call(viewer.querySelectorAll('button:not(:disabled)'));
                if (!f.length) return;
                var first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });

        // Gestos táctiles (deslizar)
        viewer.addEventListener('touchstart', function (e) {
            touchX = e.touches.length === 1 ? e.touches[0].clientX : null;
        }, { passive: true });
        viewer.addEventListener('touchend', function (e) {
            if (touchX === null) return;
            var dx = e.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
        }, { passive: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
