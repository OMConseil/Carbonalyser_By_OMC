goToHome = () => {
    document.location.href = 'popup.html';
}

whitelistOn = () => {
    hide(onButton);
    show(offButton);
    localStorage.setItem('whitelistState', 'ON')
}

whitelistOff = () => {
    hide(offButton);
    show(onButton);
    localStorage.setItem('whitelistState', 'OFF')
}

addWebsiteToWhitelist = () => {

    localStorage.setItem('whitelistState', 'OFF')
}

const returnButton = document.getElementById('returnButton');
returnButton.addEventListener('click', goToHome);

const onButton = document.getElementById('onButton');
onButton.addEventListener('click', whitelistOn);

const offButton = document.getElementById('offButton');
offButton.addEventListener('click', whitelistOff);

const addSiteButton = document.getElementById('addSiteButton');
addSiteButton.addEventListener('click', addWebsiteToWhitelist);

hide = element => element.classList.add('hidden');
show = element => element.classList.remove('hidden');

translate = (translationKey) => {
    return chrome.i18n.getMessage(translationKey);
}

translateText = (target, translationKey) => {
    target.appendChild(document.createTextNode(translate(translationKey)));
}

translateHref = (target, translationKey) => {
    target.href = chrome.i18n.getMessage(translationKey);
}
document.querySelectorAll('[translate]').forEach(function (element) {
    translateText(element, element.getAttribute('translate'));
});

document.querySelectorAll('[translate-href]').forEach(function (element) {
    translateHref(element, element.getAttribute('translate-href'));
});