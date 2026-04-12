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

export type Plantao = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  total_time: string;
  description: string | null;
};

export type SobAviso = {
  id: number;
  weekday: number;
  duration: string;
};

const plantaoDataSource = {
  async insert(
    date: string,
    start_time: string,
    end_time: string,
    total_time: string,
    description: string | null
  ): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "INSERT INTO plantao (date, start_time, end_time, total_time, description) VALUES (?, ?, ?, ?, ?)",
      date,
      start_time,
      end_time,
      total_time,
      description
    );
  },

  async getAll(): Promise<Plantao[]> {
    const database = await getDatabase();
    return database.getAllAsync<Plantao>(
      "SELECT * FROM plantao ORDER BY date DESC, start_time DESC"
    );
  },

  async getByDate(date: string): Promise<Plantao[]> {
    const database = await getDatabase();
    return database.getAllAsync<Plantao>(
      "SELECT * FROM plantao WHERE date = ? ORDER BY start_time ASC",
      date
    );
  },

  async update(
    id: number,
    date: string,
    start_time: string,
    end_time: string,
    total_time: string,
    description: string | null
  ): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "UPDATE plantao SET date = ?, start_time = ?, end_time = ?, total_time = ?, description = ? WHERE id = ?",
      date,
      start_time,
      end_time,
      total_time,
      description,
      id
    );
  },

  async delete(id: number): Promise<void> {
    const database = await getDatabase();
    await database.runAsync("DELETE FROM plantao WHERE id = ?", id);
  },

  async getSobAviso(): Promise<SobAviso[]> {
    const database = await getDatabase();
    return database.getAllAsync<SobAviso>(
      "SELECT * FROM sob_aviso ORDER BY weekday ASC"
    );
  },

  async updateSobAviso(weekday: number, duration: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync(
      "UPDATE sob_aviso SET duration = ? WHERE weekday = ?",
      duration,
      weekday
    );
  },
};

export default plantaoDataSource;