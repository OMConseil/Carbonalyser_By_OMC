const translations = {
  'hello': {
    'fr': 'Bonjour !',
    'en': 'Hello!'
  }
};

const defaultGeolocation = 'European Union';
const userGeolocation = defaultGeolocation;

const kWhPerByte = 0.00000000152;
const OneKWhEquivalentKmByCar = 2.7;
const OneKWhEquivalentChargedSmartphones = 90;

const carbonIntensityFactorInKgCO2ePerKWh = {
  'European Union': '0.276',
  'United States': '0.493',
  'China': '0.681',
  'Other': '0.519'
};

const language = 'fr' === navigator.language.toLowerCase().substr(0, 2) ? 'fr' : 'en';
console.log(translations.hello[language]);

let statsInterval;

handleResponse = message => {
  console.log(`Message from the background script:  ${message.response}`);
}

handleError = error => console.log(`Error: ${error}`);

parseStats = () => {
  const stats = localStorage.getItem('stats');
  return null === stats ? {} : JSON.parse(stats);
}

getStats = () => {
  const stats = parseStats();
  let total = 0;
  const sortedStats = [];

  for (let origin in stats) {
    total += stats[origin];
    sortedStats.push({ 'origin': origin, 'byte': stats[origin] });
  }

  sortedStats.sort(function(a, b) {
    return a.byte < b.byte ? 1 : a.byte > b.byte ? -1 : 0
  });

  const highestStats = sortedStats.slice(0, 10);
  let subtotal = 0;
  for (let index in highestStats) {
    subtotal += highestStats[index].byte;
  }

  if (total > 0) {
    const remaining = total - subtotal;
    if (remaining > 0) {
      highestStats.push({'origin': 'Others', 'byte': remaining});
    }

    highestStats.forEach(function (item) {
      item.percent = Math.round(100 * item.byte / total)
    });
  }

  return {
    'total': total,
    'highestStats': highestStats
  }
}

toMegaByte = (value) => (Math.round(100 * value/1024/1024) / 100) + ' Mb';

showStats = () => {
  const stats = getStats();

  let list = '';
  const labels = [];
  const series = [];

  for (let index in stats.highestStats) {
    labels.push(stats.highestStats[index].percent > 5 ? stats.highestStats[index].origin : ' ');
    series.push(stats.highestStats[index].percent);
    list += `<li>${stats.highestStats[index].percent}% ${stats.highestStats[index].origin}</li>`;
  }

  const kWhTotal = Math.round(1000 * stats.total * kWhPerByte) / 1000;
  const kmByCar = Math.round(1000 * kWhTotal * OneKWhEquivalentKmByCar) / 1000;
  const chargedSmartphones = Math.round(kWhTotal * OneKWhEquivalentChargedSmartphones);
  const kgCO2e = Math.round(1000 * kWhTotal * carbonIntensityFactorInKgCO2ePerKWh[userGeolocation]) / 1000;

  const html = `<p>Total: ${toMegaByte(stats.total)}</p>
    <div class="ct-chart ct-golden-section"></div>
    <ul>${list}</ul>
    <p>${kWhTotal} kWh | ${kgCO2e} kgCO2e</p>
    <p>${kmByCar} km by car</p>
    <p>${chargedSmartphones} charged smartphones</p>
  `;

  statsElement.innerHTML = html;

  new Chartist.Pie('.ct-chart', {
    labels: labels,
    series: series
  }, {
    donut: true,
    donutWidth: 60,
    donutSolid: true,
    startAngle: 270,
    showLabel: true
  });
}

start = () => {
  const sending = browser.runtime.sendMessage({ action: 'start' });
  sending.then(handleResponse, handleError);
  hide(startButton);
  show(stopButton);
  show(analysisInProgressMessage);
  localStorage.setItem('analysisStarted', '1');
}

stop = () => {
  const sending = browser.runtime.sendMessage({ action: 'stop' });
  sending.then(handleResponse, handleError);
  hide(stopButton);
  show(startButton);
  hide(analysisInProgressMessage);
  clearInterval(statsInterval);
  localStorage.removeItem('analysisStarted');
}

reset = () => {
  if (!confirm('Are you sure?')) {
    return;
  }

  localStorage.removeItem('stats');
  showStats();
}

init = () => {
  const stats = localStorage.getItem('stats');
  if (null === stats) {
    resetButton.style.display = 'none';
  }

  showStats();
  statsInterval = setInterval(showStats, 2000);

  if (null === localStorage.getItem('analysisStarted')) {
    return;
  }

  start();
  resetButton.style.display = 'block';
}

hide = element => element.classList.add('hidden');
show = element => element.classList.remove('hidden');

const analysisInProgressMessage = document.getElementById('analysisInProgressMessage');

const statsElement = document.getElementById('stats');

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', start);

const stopButton = document.getElementById('stopButton');
stopButton.addEventListener('click', stop);

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', reset);

init();
