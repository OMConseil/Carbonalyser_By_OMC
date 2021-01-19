extractHostname = (url) => {
  let hostname = url.indexOf("//") > -1 ? url.split('/')[2] : url.split('/')[0];

  // find & remove port number
  hostname = hostname.split(':')[0];
  // find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
};


checkWhitelist = (origin) => {

  const whitelistState = localStorage.getItem('whitelistState');
  var storedWhitlist = localStorage.getItem('whitelist');
  whitelist = null === storedWhitlist ? {} : JSON.parse(storedWhitlist);


  if (whitelistState == 'ON') {
    for (var website in whitelist) {
      if (origin !== undefined && origin.toString().includes(website)) {
        return true;
      }
    }
    return false;
  }

  return true;

}


setByteLengthPerOrigin = (origin, byteLength) => {
  if (checkWhitelist(origin)) {
    const stats = localStorage.getItem('stats');
    const statsJson = null === stats ? {} : JSON.parse(stats);

    let bytePerOrigin = undefined === statsJson[origin] ? 0 : parseInt(statsJson[origin][0]);
    let timePerOrigin = undefined === statsJson[origin] ? 0 : parseInt(statsJson[origin][1]);
    statsJson[origin] = [bytePerOrigin + byteLength, timePerOrigin];

    localStorage.setItem('stats', JSON.stringify(statsJson));
  }
};

setTimePerOrigin = (origin, time) => {
  if (checkWhitelist(origin)) {
    const stats = localStorage.getItem('stats');
    const statsJson = null === stats ? {} : JSON.parse(stats);

    let bytePerOrigin = undefined === statsJson[origin] ? 0 : parseInt(statsJson[origin][0]);
    let timePerOrigin = undefined === statsJson[origin] ? 0 : statsJson[origin][1];
    statsJson[origin] = [bytePerOrigin, timePerOrigin + time];
    localStorage.setItem('stats', JSON.stringify(statsJson));
  }
};


isChrome = () => {
  return (typeof (browser) === 'undefined');
};

headersReceivedListener = (requestDetails) => {
  if (isChrome()) {
    const origin = extractHostname(!requestDetails.initiator ? requestDetails.url : requestDetails.initiator);
    const responseHeadersContentLength = requestDetails.responseHeaders.find(element => element.name.toLowerCase() === "content-length");
    const contentLength = undefined === responseHeadersContentLength ? {
        value: 0
      } :
      responseHeadersContentLength;
    const requestSize = parseInt(contentLength.value, 10);
    setByteLengthPerOrigin(origin, requestSize);

    return {};
  }

  let filter = browser.webRequest.filterResponseData(requestDetails.requestId);

  filter.ondata = event => {
    const origin = extractHostname(!requestDetails.originUrl ? requestDetails.url : requestDetails.originUrl);
    setByteLengthPerOrigin(origin, event.data.byteLength);

    filter.write(event.data);
  };

  filter.onstop = () => {
    filter.disconnect();
  };

  return {};
};

setBrowserIcon = (type) => {
  chrome.browserAction.setIcon({
    path: `icons/icon-${type}-48.png`
  });
};

addOneMinute = () => {
  let duration = localStorage.getItem('duration');
  duration = null === duration ? 1 : 1 * duration + (intervalCheckCurrentWebsite / 60000);
  localStorage.setItem('duration', duration);

  setTimePerOrigin(lastUrl, intervalCheckCurrentWebsite / 60000);
};

let addOneMinuteInterval;
const intervalCheckCurrentWebsite = 30000;


handleMessage = (request) => {
  if ('start' === request.action) {
    setBrowserIcon('on');

    chrome.webRequest.onHeadersReceived.addListener(
      headersReceivedListener, {
        urls: ['<all_urls>']
      },
      ['responseHeaders']
    );

    if (!addOneMinuteInterval) {
      addOneMinuteInterval = setInterval(addOneMinute, intervalCheckCurrentWebsite);
    }

    return;
  }

  if ('stop' === request.action) {
    setBrowserIcon('off');
    chrome.webRequest.onHeadersReceived.removeListener(headersReceivedListener);

    if (addOneMinuteInterval) {
      clearInterval(addOneMinuteInterval);
      addOneMinuteInterval = null;
    }
  }
};

let activeTabId, lastUrl, lastTitle;

function getTabInfo(tabId) {
  chrome.tabs.get(tabId, function (tab) {
    lastUrl = extractHostname(tab.url);
    lastTitle = tab.title;
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  getTabInfo(activeTabId = activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (activeTabId == tabId) {
    getTabInfo(tabId);
  }
});

chrome.runtime.onMessage.addListener(handleMessage);