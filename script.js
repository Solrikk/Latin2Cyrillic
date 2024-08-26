// ==UserScript==
// @name         Latin2Cyrillic
// @namespace    http://tampermonkey.net/
// @version      2024-08-25
// @description  Transliterate Latin letters to Cyrillic in chat input fields with a delay
// @author       Solrikk
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const latinToCyrillicMap = {
        'Sh': 'Ш', 'Ch': 'Ч', 'Zh': 'Ж', 'Ya': 'Я', 'Yu': 'Ю', 'Yo': 'Ё', 'Ye': 'Е',
        'Ts': 'Ц', 'Kh': 'Х', 'Khs': 'Кс', 'Ja': 'Я', 'Je': 'Е', 'Ju': 'Ю', 'Jo': 'Ё',
        'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д',
        'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х', 'I': 'И', 'J': 'Й', 'K': 'К', 'L': 'Л',
        'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'К', 'R': 'Р', 'S': 'С', 'T': 'Т',
        'U': 'У', 'V': 'В', 'W': 'В', 'X': 'КС', 'Y': 'Ы', 'Z': 'З', 'a': 'а', 'b': 'б',
        'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и', 'j': 'й',
        'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'к', 'r': 'р',
        's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс', 'y': 'ы', 'z': 'з'
    };

    let timeoutId;

    function transliterate(text) {
        return text
            .replace(/Ya/g, 'Я')
            .replace(/Yu/g, 'Ю')
            .replace(/Yo/g, 'Ё')
            .replace(/Ye/g, 'Е')
            .replace(/Sh/g, 'Ш')
            .replace(/Ch/g, 'Ч')
            .replace(/Zh/g, 'Ж')
            .replace(/Ts/g, 'Ц')
            .replace(/Kh/g, 'Х')
            .replace(/Khs/g, 'Кс')
            .replace(/Ja/g, 'Я')
            .replace(/Je/g, 'Е')
            .replace(/Ju/g, 'Ю')
            .replace(/Jo/g, 'Ё')
            .replace(/[A-Za-z]/g, function(char) {
                return latinToCyrillicMap[char] || char;
            });
    }

    function delayedTransliteration(target) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            const start = target.selectionStart;
            const end = target.selectionEnd;

            if (target.tagName === 'DIV' || target.tagName === 'SPAN') {
                const range = window.getSelection().getRangeAt(0);
                const selectionStart = range.startOffset;
                const selectionEnd = range.endOffset;

                target.textContent = transliterate(target.textContent);

                range.setStart(target.firstChild, selectionStart);
                range.setEnd(target.firstChild, selectionEnd);
            } else if (typeof start === 'number' && typeof end === 'number') {
                target.value = transliterate(target.value);
                target.setSelectionRange(start, end);
            }
        }, 500); // Задержка в 500 миллисекунд
    }

    function transliterationHandler(event) {
        const target = event.target;
        if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target.isContentEditable && target.getAttribute('contenteditable') === 'true')) && !target.classList.contains('no-transliterate') && !target.classList.contains('system-message')) {
            delayedTransliteration(target);
        }
    }

    function addTransliteration() {
        document.addEventListener('input', transliterationHandler);
    }

    function observeDOM() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || (node.isContentEditable && node.getAttribute('contenteditable') === 'true'))) {
                        if (!node.classList.contains('no-transliterate') && !node.classList.contains('system-message')) {
                            node.addEventListener('input', transliterationHandler);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    addTransliteration();
    observeDOM();

})();
