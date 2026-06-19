import requests
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

BASE_URL = "https://api.jolpi.ca/ergast/f1"

def fetch_json(url):
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    return response.json()

def collect_race_data(start_year=2021, end_year=2025):
    rows = []

    for season in range(start_year, end_year + 1):
        print(f"{season}年のデータ取得中...")

        try:
            schedule_data = fetch_json(f"{BASE_URL}/{season}.json")
            races = schedule_data["MRData"]["RaceTable"]["Races"]
        except Exception as e:
            print(f"{season}年のスケジュール取得失敗:", e)
            continue

        for race in races:
            round_number = race["round"]
            circuit_id = race["Circuit"]["circuitId"]

            try:
                results_data = fetch_json(f"{BASE_URL}/{season}/{round_number}/results.json")
                qualifying_data = fetch_json(f"{BASE_URL}/{season}/{round_number}/qualifying.json")
            except Exception as e:
                print(f"{season} Rd.{round_number} 取得失敗:", e)
                continue

            result_races = results_data["MRData"]["RaceTable"]["Races"]
            qualifying_races = qualifying_data["MRData"]["RaceTable"]["Races"]

            if not result_races:
                continue

            race_results = result_races[0].get("Results", [])

            qualifying_map = {}
            if qualifying_races:
                qualifying_results = qualifying_races[0].get("QualifyingResults", [])
                for q in qualifying_results:
                    driver_id = q["Driver"]["driverId"]
                    qualifying_map[driver_id] = int(q["position"])

            for result in race_results:
                driver_id = result["Driver"]["driverId"]
                constructor = result["Constructor"]["constructorId"]

                try:
                    final_position = int(result["position"])
                except Exception:
                    continue

                try:
                    grid = int(result.get("grid", 20))
                    if grid <= 0:
                        grid = 20
                except Exception:
                    grid = 20

                qualifying_position = qualifying_map.get(driver_id, grid)

                rows.append({
                    "season": season,
                    "round": int(round_number),
                    "circuit_id": circuit_id,
                    "driver_id": driver_id,
                    "constructor": constructor,
                    "grid": grid,
                    "qualifying_position": qualifying_position,
                    "final_position": final_position
                })

    return pd.DataFrame(rows)

def add_features(df):
    df = df.sort_values(["driver_id", "season", "round"])

    df["driver_recent_avg"] = (
        df.groupby("driver_id")["final_position"]
        .transform(lambda x: x.shift(1).rolling(5, min_periods=1).mean())
    )

    df["team_recent_avg"] = (
        df.groupby("constructor")["final_position"]
        .transform(lambda x: x.shift(1).rolling(5, min_periods=1).mean())
    )

    df["circuit_driver_avg"] = (
        df.groupby(["driver_id", "circuit_id"])["final_position"]
        .transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean())
    )

    df["grid_score"] = 21 - df["grid"]
    df["qualifying_score"] = 21 - df["qualifying_position"]

    df = df.fillna({
        "driver_recent_avg": 10,
        "team_recent_avg": 10,
        "circuit_driver_avg": 10
    })

    return df

def train():
    df = collect_race_data()

    if df.empty:
        print("データが取得できませんでした。")
        return

    df = add_features(df)

    features = [
        "grid",
        "qualifying_position",
        "grid_score",
        "qualifying_score",
        "driver_recent_avg",
        "team_recent_avg",
        "circuit_driver_avg"
    ]

    X = df[features]
    y = df["final_position"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=8,
        random_state=42
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)

    print("学習完了")
    print("平均誤差 MAE:", mae)

    joblib.dump(model, "f1_ai_model.pkl")
    joblib.dump(features, "features.pkl")

    print("保存完了: f1_ai_model.pkl / features.pkl")

if __name__ == "__main__":
    train()