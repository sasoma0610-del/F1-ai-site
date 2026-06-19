const dataStatus = document.getElementById("dataStatus");const data reloadButton = document.getElementById("reloadButton");
const raceList = document.getElementById("raceList");
const raceTitle = document.getElementById("raceTitle");
const raceMeta = document.getElementById("raceMeta");
const predictionPanel = document.getElementById("predictionPanel");
const livePanel = document.getElementById("livePanel");
const detailCard = document.getElementById("detailCard");
const driverTitle = document.getElementById("driverTitle");
const driverInfo = document.getElementById("driverInfo");
const driverMetrics = document.getElementById("driverMetrics");

let selectedRace = null;
let selectedPredictions = [];
let liveTimer = null;

const drivers = [
  { id: "verstappen", code: "VER", first: "Max", last: "Verstappen", team: "Red Bull", currentRank: 1 },
  { id: "norris", code: "NOR", first: "Lando", last: "Norris", team: "McLaren", currentRank: 2 },
  { id: "leclerc", code: "LEC", first: "Charles", last: "Leclerc", team: "Ferrari", currentRank: 3 },
  { id: "piastri", code: "PIA", first: "Oscar", last: "Piastri", team: "McLaren", currentRank: 4 },
  { id: "russell", code: "RUS", first: "George", last: "Russell", team: "Mercedes", currentRank: 5 },
  { id: "hamilton", code: "HAM", first: "Lewis", last: "Hamilton", team: "Ferrari", currentRank: 6 },
  { id: "alonso", code: "ALO", first: "Fernando", last: "Alonso", team: "Aston Martin", currentRank: 7 },
  { id: "sainz", code: "SAI", first: "Carlos", last: "Sainz", team: "Williams", currentRank: 8 },
  { id: "tsunoda", code: "TSU", first: "Yuki", last: "Tsunoda", team: "Red Bull", currentRank: 9 },
  { id: "antonelli", code: "ANT", first: "Kimi", last: "Antonelli", team: "Mercedes", currentRank: 10 }
];

const races = [
  {
    name: "Chinese Grand Prix",
    circuitId: "shanghai",
    circuit: "Shanghai International Circuit",
    country: "China",
    date: "2026-03-15"
  },
  {
    name: "Japanese Grand Prix",
    circuitId: "suzuka",
    circuit: "Suzuka Circuit",
    country: "Japan",
    date: "2026-04-05"
  },
  {
    name: "Monaco Grand Prix",
    circuitId: "monaco",
    circuit: "Circuit de Monaco",
    country: "Monaco",
    date: "2026-05-25"
  },
  {
    name: "British Grand Prix",
    circuitId: "silverstone",
    circuit: "Silverstone Circuit",
    country: "United Kingdom",
    date: "2026-07-05"
  },
  {
    name: "Italian Grand Prix",
    circuitId: "monza",
    circuit: "Autodromo Nazionale di Monza",
    country: "Italy",
    date: "2026-09-06"
  }
];

const gpData = {
  shanghai: {
    race: { verstappen: 1, norris: 2, leclerc: 3, sainz: 4, russell: 5, alonso: 6, piastri: 7, hamilton: 8, tsunoda: 9, antonelli: 10 },
    qualifying: { verstappen: 1, alonso: 2, norris: 3, piastri: 4, leclerc: 5, sainz: 6, russell: 7, hamilton: 8, tsunoda: 9, antonelli: 10 },
    practice: { norris: 1, verstappen: 2, piastri: 3, leclerc: 4, russell: 5, hamilton: 6, sainz: 7, tsunoda: 8, antonelli: 9, alonso: 10 }
  },
  suzuka: {
    race: { verstappen: 1, sainz: 2, leclerc: 3, norris: 4, alonso: 5, russell: 6, piastri: 7, hamilton: 8, tsunoda: 9, antonelli: 10 },
    qualifying: { verstappen: 1, norris: 2, sainz: 3, alonso: 4, piastri: 5, hamilton: 6, leclerc: 7, russell: 8, tsunoda: 9, antonelli: 10 },
    practice: { verstappen: 1, norris: 2, piastri: 3, leclerc: 4, russell: 5, hamilton: 6, sainz: 7, tsunoda: 8, antonelli: 9, alonso: 10 }
  },
  monaco: {
    race: { leclerc: 1, piastri: 2, sainz: 3, norris: 4, russell: 5, verstappen: 6, hamilton: 7, tsunoda: 8, alonso: 9, antonelli: 10 },
    qualifying: { leclerc: 1, piastri: 2, verstappen: 3, sainz: 4, norris: 5, russell: 6, hamilton: 7, tsunoda: 8, alonso: 9, antonelli: 10 },
    practice: { leclerc: 1, piastri: 2, norris: 3, verstappen: 4, sainz: 5, russell: 6, hamilton: 7, tsunoda: 8, alonso: 9, antonelli: 10 }
  },
  silverstone: {
    race: { hamilton: 1, verstappen: 2, norris: 3, piastri: 4, russell: 5, sainz: 6, leclerc: 7, alonso: 8, tsunoda: 9, antonelli: 10 },
    qualifying: { russell: 1, hamilton: 2, norris: 3, verstappen: 4, piastri: 5, leclerc: 6, sainz: 7, alonso: 8, tsunoda: 9, antonelli: 10 },
    practice: { norris: 1, hamilton: 2, piastri: 3, russell: 4, verstappen: 5, leclerc: 6, sainz: 7, tsunoda: 8, antonelli: 9, alonso: 10 }
  },
  monza: {
    race: { leclerc: 1, piastri: 2, norris: 3, sainz: 4, hamilton: 5, verstappen: 6, russell: 7, alonso: 8, tsunoda: 9, antonelli: 10 },
    qualifying: { norris: 1, piastri: 2, russell: 3, leclerc: 4, sainz: 5, hamilton: 6, verstappen: 7, alonso: 8, tsunoda: 9, antonelli: 10 },
    practice: { leclerc: 1, norris: 2, piastri: 3, sainz: 4, hamilton: 5, russell: 6, verstappen: 7, tsunoda: 8, antonelli: 9, alonso: 10 }
  }
};

function init() {
  dataStatus.textContent = "読み込み成功：GP別AI予測を表示中";
  renderRaceList();
  selectRace(races[1]);
}

function renderRaceList() {
  raceList.innerHTML = "";

  races.forEach((race, index) => {
    const button = document.createElement("button");
    button.className = "race-button";

    if (selectedRace && selectedRace.circuitId === race.circuitId) {
      button.classList.add("selected");
    }

    button.innerHTML = `
      <span class="race-round">Rd.${index + 1}</span>
      <strong>${race.name}</strong>
      <span>${race.circuit}</span>
      <small>${race.date}</small>
    `;

    button.addEventListener("click", () => selectRace(race));
    raceList.appendChild(button);
  });
}

function selectRace(race) {
  selectedRace = race;
  clearInterval(liveTimer);
  detailCard.style.display = "none";

  renderRaceList();

  raceTitle.textContent = `🏁 ${race.name}`;
  raceMeta.textContent = `${race.date} / ${race.circuit} / ${race.country}`;

  selectedPredictions = calculatePredictions(race);

  renderPredictions();
  renderLivePanel();

  liveTimer = setInterval(renderLivePanel, 2500);

  dataStatus.textContent = `${race.name} のGP別予測を表示中`;
}

function calculatePredictions(race) {
  const data = gpData[race.circuitId];

  const teamStrength = calculateTeamStrength();

  return drivers.map(driver => {
    const previousRace = data.race[driver.id] || 12;
    const previousQualifying = data.qualifying[driver.id] || 12;
    const practiceRank = data.practice[driver.id] || 12;

    const currentScore = positionToScore(driver.currentRank);
    const raceScore = positionToScore(previousRace);
    const qualifyingScore = positionToScore(previousQualifying);
    const practiceScore = positionToScore(practiceRank);
    const teamScore = teamStrength[driver.team] || 50;

    const stabilityScore = calculateStability([
      driver.currentRank,
      previousRace,
      previousQualifying,
      practiceRank
    ]);

    const aiScore =
      currentScore * 0.2 +
      raceScore * 0.25 +
      qualifyingScore * 0.15 +
      practiceScore * 0.2 +
      teamScore * 0.1 +
      stabilityScore * 0.1;

    return {
      ...driver,
      previousRace,
      previousQualifying,
      practiceRank,
      aiScore,
      predictedPosition: scoreToPosition(aiScore)
    };
  }).sort((a, b) => b.aiScore - a.aiScore);
}

function calculateTeamStrength() {
  const teams = {};

  drivers.forEach(driver => {
    if (!teams[driver.team]) {
      teams[driver.team] = [];
    }
    teams[driver.team].push(driver.currentRank);
  });

  const result = {};

  Object.keys(teams).forEach(team => {
    const average = teams[team].reduce((sum, pos) => sum + pos, 0) / teams[team].length;
    result[team] = positionToScore(average);
  });

  return result;
}

function calculateStability(values) {
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length;
  return Math.max(0, positionToScore(average) - Math.sqrt(variance) * 4);
}

function positionToScore(position) {
  return Math.max(0, 105 - position * 5);
}

function scoreToPosition(score) {
  return Math.min(20, Math.max(1, Math.round(21 - score / 5)));
}

function renderPredictions() {
  predictionPanel.innerHTML = "";

  selectedPredictions.forEach((driver, index) => {
    const row = document.createElement("button");
    row.className = "prediction-row";

    row.innerHTML = `
      <span class="rank-badge">${index + 1}</span>
      <span class="prediction-main">
        <strong>${driver.code} ${driver.last}</strong>
        <small>${driver.team}</small>
      </span>
      <span class="score-box">
        <small>AI</small>
        <strong>${driver.aiScore.toFixed(1)}</strong>
      </span>
    `;

    row.addEventListener("click", () => showDriverDetail(driver));
    predictionPanel.appendChild(row);
  });
}

function renderLivePanel() {
  livePanel.innerHTML = "";

  selectedPredictions
    .map(driver => ({
      ...driver,
      liveScore: driver.aiScore + Math.random() * 4 - 2
    }))
    .sort((a, b) => b.liveScore - a.liveScore)
    .slice(0, 10)
    .forEach((driver, index) => {
      const row = document.createElement("div");
      row.className = "live-row";

      row.innerHTML = `
        <span class="live-position">${index + 1}</span>
        <strong>${driver.code}</strong>
        <span>${driver.last}</span>
        <small>${driver.liveScore.toFixed(1)}</small>
      `;

      livePanel.appendChild(row);
    });
}

function showDriverDetail(driver) {
  detailCard.style.display = "block";

  driverTitle.textContent = `📊 ${selectedRace.name}：${driver.last} の予測分析`;

  driverInfo.innerHTML = `
    <p><strong>${driver.first} ${driver.last}</strong> / ${driver.team}</p>
    <p>GP：${selectedRace.name} / サーキット：${selectedRace.circuit}</p>
  `;

  driverMetrics.innerHTML = `
    <div class="metric">
      <span>予測順位</span>
      <strong>${driver.predictedPosition}位</strong>
    </div>
    <div class="metric">
      <span>AIスコア</span>
      <strong>${driver.aiScore.toFixed(1)}</strong>
    </div>
    <div class="metric">
      <span>現在順位</span>
      <strong>${driver.currentRank}位</strong>
    </div>
    <div class="metric">
      <span>前年決勝</span>
      <strong>${driver.previousRace}位</strong>
    </div>
    <div class="metric">
      <span>前年予選</span>
      <strong>${driver.previousQualifying}位</strong>
    </div>
    <div class="metric">
      <span>練習相当</span>
      <strong>${driver.practiceRank}位</strong>
    </div>
  `;

  detailCard.scrollIntoView({ behavior: "smooth" });
}

reloadButton.addEventListener("click", () => {
  if (selectedRace) {
    selectRace(selectedRace);
  }
});

init();
