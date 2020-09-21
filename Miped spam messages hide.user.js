// ==UserScript==
// @name         Miped spam messages hide
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Удаляет плохие сообщения
// @author       Andronio
// @homepage     https://github.com/Andronio2/Miped-spam-messages-hide
// @supportURL   https://github.com/Andronio2/Miped-spam-messages-hide/issues
// @updateURL    https://github.com/Andronio2/Miped-spam-messages-hide/raw/master/Miped%20spam%20messages%20hide.user.js
// @downloadURL  https://github.com/Andronio2/Miped-spam-messages-hide/raw/master/Miped%20spam%20messages%20hide.user.js
// @match        https://miped.ru/f/threads/*
// @grant        none
// @run-at       document-body
// ==/UserScript==
let mipedCounterTimeout = 200;
(function repeat() {
    'use strict';

/*
 * Здесь начинать править настройки
*/

let completeHide    = 0;     // Прятать новичка всегда - 1 или только если в сообщении есть картинка - 0
let newUserMessages = 15;    // Если меньше сообщений, то прятать сообщение при completeHide = 1 или есть картинка
let maxPics         = 2;     // Если у старичка больше 2 картинок в сообщении, то прятать
let oldUser         = 200;   // Если у пользователя больше сообщений, то его картинки прятаться не будут никогда

/*
 * Далее не трогать
*/

    let messagesBuffer = [];
    let messages = document.querySelectorAll(".message-content");
    if (!messages.length && --mipedCounterTimeout) return setTimeout(repeat, 100);
    if (!mipedCounterTimeout) return;
    let badMessageCounter = 0;
    messages.forEach(message => {
        let messagesCount = +message.closest(".message-inner").querySelectorAll(".pairs.pairs--justified dd")[3].innerText.replace(/[^\d]+/, '');  // Количество сообщений у пользователя
        if (completeHide && messagesCount < newUserMessages)
            message.closest(".message--post.message").style.display = "none";
        else {
            let messagesPics = message.querySelectorAll("img");
            let imgCount = 0;
            messagesPics.forEach(img => {
                if (!img.classList.contains('smilie') && !img.closest('.bbCodeBlock--unfurl'))
                    imgCount++;
            });
            if (imgCount > maxPics && messagesCount < oldUser || imgCount && messagesCount < newUserMessages) {
                let picsBuffer = [];
                messagesPics.forEach(img => {
                    picsBuffer.push(img.outerHTML);
                    img.outerHTML = `<span name="old-pic">Здесь была картинка</span>`;
                });
                messagesBuffer.push(picsBuffer);
                message.style.display = "none";
                let messageNew = document.createElement("div");
                messageNew.className = "message-content";
                messageNew.innerHTML = `<button name="show-bad-message" data-show="${badMessageCounter}">Показать</button><br>Обнаружено ${imgCount} картинок<br>${message.innerText.slice(0,80)}`;
                message.after(messageNew);
                badMessageCounter++;
            }
        }
    });
    let buttonShow = document.querySelectorAll('[name="show-bad-message"]');
    buttonShow.forEach(btn => btn.addEventListener("click", btnClickHandler));

    function btnClickHandler(event) {
        let elem = event.target;
        let messageContents = elem.closest(".message-inner").querySelectorAll(".message-content");
        messageContents[0].style.display = "block";
        elem.removeEventListener("click", btnClickHandler);
        messageContents[1].remove();
        let pics = messageContents[0].querySelectorAll('[name="old-pic"]');
        for (let i = 0; i < pics.length; i++) {
            pics[i].outerHTML = messagesBuffer[elem.dataset.show][i];
        }
    }

})();
