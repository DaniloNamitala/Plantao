import type { SQLiteDatabase } from "expo-sqlite";

type Migration = {
  version: number;
  up: string;
};

const migrations: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE IF NOT EXISTS ponto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('in', 'out'))
      );
    `,
  },
  {
    version: 2,
    up: `
      CREATE TABLE IF NOT EXISTS ponto_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        work_day_duration TIME NOT NULL DEFAULT '08:00'
      );
      INSERT INTO ponto_config (work_day_duration) VALUES ('08:00');
    `,
  },
  {
    version: 3,
    up: `
      CREATE TABLE IF NOT EXISTS plantao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_time TIME NOT NULL,
        description TEXT
      );
    `,
  },
  {
    version: 4,
    up: `
      CREATE TABLE IF NOT EXISTS sob_aviso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weekday INTEGER NOT NULL UNIQUE CHECK(weekday BETWEEN 0 AND 6),
        duration TIME NOT NULL DEFAULT '00:00'
      );
      INSERT INTO sob_aviso (weekday, duration) VALUES (0, '00:00');
      INSERT INTO sob_aviso (weekday, duration) VALUES (1, '00:00');
      INSERT INTO sob_aviso (weekday, duration) VALUES (2, '00:00');
      INSERT INTO sob_aviso (weekday, duration) VALUES (3, '00:00');
      INSERT INTO sob_aviso (weekday, duration) VALUES (4, '00:00');
      INSERT INTO sob_aviso (weekday, duration) VALUES (5, '00:00');
      INSERT INTO sob_aviso (weekday, duration) VALUES (6, '00:00');
    `,
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM migrations ORDER BY version ASC"
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      await db.execAsync(migration.up);
      await db.runAsync("INSERT INTO migrations (version) VALUES (?)", migration.version);
    }
  }
}
