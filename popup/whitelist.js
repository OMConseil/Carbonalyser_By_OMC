init = () => {
    if (localStorage.getItem("whitelistState") == 'ON') {
        hide(offButton);
        show(onButton);
    } else {
        hide(onButton);
        show(offButton);
    }

    showWhiteListTable();
}

showWhiteListTable = () => {
    clearWhitelistTable();
    var whitelist = getWhitelist();
    var i = 0;
    const whitelistTableBody = whitelistTable.getElementsByTagName('tbody')[0];
    for (let website in whitelist) {
        if (whitelist[website] == 1) {

            var newRow = whitelistTableBody.insertRow();
            if (i % 2 == 0) {
                newRow.style.backgroundColor = "lightgrey";
            }

            var siteCell = newRow.insertCell();
            var newText = document.createTextNode(website);
            siteCell.appendChild(newText);

            var deleteCell = newRow.insertCell();
            var newButton = document.createElement("BUTTON");

            newButton.classList.add('supButton');
            var newText = document.createTextNode("X");
            newButton.appendChild(newText);
            deleteCell.appendChild(newButton);
            newButton.addEventListener('click', function () {
                removeWebsiteFromWhitelist(website)
            });


            ++i;
        }
    }
}

clearWhitelistTable = () => {
    const whitelistTableBody = whitelistTable.getElementsByTagName('tbody')[0];

    while (whitelistTableBody.childElementCount > 1) {
        whitelistTableBody.removeChild(whitelistTableBody.children[1]);
    }
}

goToHome = () => {
    document.location.href = 'popup.html';
}

whitelistOff = () => {
    show(onButton);
    hide(offButton);
    localStorage.setItem('whitelistState', 'ON')
}

whitelistOn = () => {
    show(offButton);
    hide(onButton);
    localStorage.setItem('whitelistState', 'OFF')
}

addWebsiteToWhitelist = () => {
    var website = addSiteTextBox.value;
    var whitelist = getWhitelist();

    whitelist[website] = "1";

    localStorage.setItem('whitelist', JSON.stringify(whitelist));
    addSiteTextBox.value = "";
    showWhiteListTable();

}

removeWebsiteFromWhitelist = (website) => {
    var whitelist = getWhitelist();

    delete whitelist[website];

    localStorage.setItem('whitelist', JSON.stringify(whitelist));
    showWhiteListTable();
}


getWhitelist = () => {
    const whitelist = localStorage.getItem('whitelist');
    return null === whitelist ? {} : JSON.parse(whitelist);
}

const returnButton = document.getElementById('returnButton');
returnButton.addEventListener('click', goToHome);

const onButton = document.getElementById('onButton');
onButton.addEventListener('click', whitelistOn);

const offButton = document.getElementById('offButton');
offButton.addEventListener('click', whitelistOff);

const addSiteButton = document.getElementById('addSiteButton');
addSiteButton.addEventListener('click', addWebsiteToWhitelist);

const addSiteTextBox = document.getElementById('addSiteTextBox');

const whitelistTable = document.getElementById('whitelistTable');

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

init();