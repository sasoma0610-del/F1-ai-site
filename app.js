const fallbackDrivers = [
  { name: "Verstappen", position: 1 },
  { name: "Norris", position: 2 },
  { name: "Leclerc", position: 3 },
  { name: "Piastri", position: 4 },
  { name: "Sainz", position: 5 },
  { name: "Hamilton", position: 6 },
  { name: "Russell", position: 7 },
  { name: "Alonso", position: 8 }
];

let drivers = [];
let chart = null;

const predictionsDiv = document.getElementById("predictions");
const driversDiv = document.getElementById("drivers");
const detailCard = document.getElementById("detailCard");
const driverTitle = document.getElementById("driverTitle");
const driverInfo = document.getElementById("driverInfo");

async function loadDrivers() {
  try {
    const response = await fetch("https://ergast.com/api/f1/current/driverStandings.json");
    const data = await response.json();

    const list = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

    drivers = list.map(item => ({
      name: item.Driver.familyName,
      position: Number(item.position),
      team: item.Constructors[0].name,
      points: Number(item.points)
    }));
  } catch (error) {
    console.log("F1データ取得に失敗したため、サンプルデータを使います。", error);

    drivers = fallbackDrivers.map(driver => ({
      ...driver,
      team: "Sample Team",
      points: 0
    }));
  }

  renderPredictions();
  renderDrivers();
}

function renderPredictions() {
  const predictions = drivers
    .map(driver => ({
      ...driver,
      score: 100 - driver.position * 4 + Math.random() * 5
    }))
    .sort((a, b) => b.score - a.score);

  predictionsDiv.innerHTML = "";

  predictions.forEach((driver, index) => {
    const row = document.createElement("div");
    row.className = "prediction-row";
    row.textContent = `${index + 1}位 ${driver.name}（AIスコア: ${driver.score.toFixed(1)}）`;
    predictionsDiv.appendChild(row);
  });
}

function renderDrivers() {
  driversDiv.innerHTML = "";

  drivers.forEach(driver => {
    const button = document.createElement("button");
    button.textContent = driver.name;

    button.addEventListener("click", () => {
      showDriverDetail(driver);
    });

    driversDiv.appendChild(button);
  });
}

function showDriverDetail(driver) {
  detailCard.style.display = "block";

  driverTitle.textContent = `📊 ${driver.name} の分析`;
  driverInfo.textContent = `現在ランキング: ${driver.position}位 / チーム: ${driver.team} / ポイント: ${driver.points}`;

  const ctx = document.getElementById("driverChart");

  if (chart !== null) {
    chart.destroy();
  }

  const sampleHistory = generateSampleHistory(driver.position);

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["5戦前", "4戦前", "3戦前", "2戦前", "前戦"],
      datasets: [
        {
          label: `${driver.name} の順位推移`,
          data: sampleHistory,
          borderColor: "#ff3333",
          backgroundColor: "rgba(255, 51, 51, 0.2)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          reverse: true,
          min: 1,
          max: 20,
          title: {
            display: true,
            text: "順位"
          }
        }
      }
    }
  });
}

function generateSampleHistory(basePosition) {
  return [
    Math.min(20, Math.max(1, basePosition + 2)),
    Math.min(20, Math.max(1, basePosition + 1)),
    Math.min(20, Math.max(1, basePosition + 3)),
    Math.min(20, Math.max(1, basePosition + 1)),
    basePosition
  ];
}

loadDrivers();