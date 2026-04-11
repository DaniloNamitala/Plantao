import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const DB_NAME = "plantao.db";

let db: SQLite.SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await runMigrations(db);
  }
  return db;
}

export type Ponto = {
  id: number;
  date: string;
  time: string;
  type: "in" | "out";
};

export type PontoConfig = {
  id: number;
  work_day_duration: string;
};

const pontoDataSource = {
  async insert(date: string, time: string, type: "in" | "out"): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "INSERT INTO ponto (date, time, type) VALUES (?, ?, ?)",
      date,
      time,
      type
    );
  },

  async getAll(): Promise<Ponto[]> {
    const database = await getDatabase();
    return database.getAllAsync<Ponto>(
      "SELECT * FROM ponto ORDER BY date DESC, time DESC"
    );
  },

  async getByDate(date: string): Promise<Ponto[]> {
    const database = await getDatabase();
    return database.getAllAsync<Ponto>(
      "SELECT * FROM ponto WHERE date = ? ORDER BY time ASC",
      date
    );
  },

  async delete(id: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync("DELETE FROM ponto WHERE id = ?", id);
  },

  async update(id: number, time: string, type: "in" | "out"): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "UPDATE ponto SET time = ?, type = ? WHERE id = ?",
      time,
      type,
      id
    );
  },

  async getConfig(): Promise<PontoConfig> {
    const database = await getDatabase();
    const config = await database.getFirstAsync<PontoConfig>(
      "SELECT * FROM ponto_config WHERE id = 1"
    );
    return config ?? { id: 1, work_day_duration: "08:00" };
  },

  async updateWorkDayDuration(duration: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "UPDATE ponto_config SET work_day_duration = ? WHERE id = 1",
      duration
    );
  },
};

export default pontoDataSource;