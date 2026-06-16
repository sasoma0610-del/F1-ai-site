const { useState, useEffect } = React;

function App() {
  const [drivers, setDrivers] = useState([]);
  const [predictions, setPredictions] = useState([]);

  // ===== データ取得 =====
  useEffect(() => {
    fetch("https://ergast.com/api/f1/current/driverStandings.json")
      .then(res => res.json())
      .then(data => {
        const list = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        const mapped = list.map(d => ({
          name: d.Driver.familyName,
          grid: Number(d.position),
          laps: 60,
          recent_avg: Number(d.position),
          team_strength: Number(d.position)
        }));

        setDrivers(mapped);
      });
  }, []);

  // ===== AI予測（簡易版） =====
  useEffect(() => {
    const preds = drivers.map(d => ({
      name: d.name,
      score: 100 - d.grid * 3 + Math.random() * 10
    })).sort((a,b)=> b.score - a.score);

    setPredictions(preds);
  }, [drivers]);

  return (
    <div>
      <h1>🏎️ F1 AI予測サイト</h1>

      <div className="card">
        <h2>🔮 次レース予測</h2>
        {predictions.map((d,i)=>(
          <div key={i}>{i+1}位 {d.name}（{d.score.toFixed(1)}）</div>
        ))}
      </div>

      <div className="card">
        <h2>👤 ドライバー一覧</h2>
        {drivers.map((d,i)=>(
          <button key={i}>{d.name}</button>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);