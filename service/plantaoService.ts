import plantaoDataSource, { type Plantao, type SobAviso } from "@/data/plantaoDataSource";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

function isValidDate(date: string): boolean {
  if (!DATE_REGEX.test(date)) return false;
  const parsed = new Date(date + "T00:00:00");
  return !isNaN(parsed.getTime());
}

function isValidTime(time: string): boolean {
  if (!TIME_REGEX.test(time)) return false;
  const [h, m, s] = time.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && (s === undefined || (s >= 0 && s <= 59));
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calculateTotalTime(start_time: string, end_time: string): string {
  const startMinutes = timeToMinutes(start_time);
  const endMinutes = timeToMinutes(end_time);
  if (endMinutes <= startMinutes) {
    throw new Error("End time must be after start time.");
  }
  return minutesToTime(endMinutes - startMinutes);
}

const plantaoService = {
  async create(
    date: string,
    start_time: string,
    end_time: string,
    description: string | null
  ): Promise<void> {
    if (!isValidDate(date)) {
      throw new Error(`Invalid date format: "${date}". Expected YYYY-MM-DD.`);
    }
    if (!isValidTime(start_time)) {
      throw new Error(`Invalid start time format: "${start_time}". Expected HH:MM or HH:MM:SS.`);
    }
    if (!isValidTime(end_time)) {
      throw new Error(`Invalid end time format: "${end_time}". Expected HH:MM or HH:MM:SS.`);
    }
    const total_time = calculateTotalTime(start_time, end_time);
    await plantaoDataSource.insert(date, start_time, end_time, total_time, description);
  },

  async update(
    id: number,
    date: string,
    start_time: string,
    end_time: string,
    description: string | null
  ): Promise<void> {
    if (!isValidDate(date)) {
      throw new Error(`Invalid date format: "${date}". Expected YYYY-MM-DD.`);
    }
    if (!isValidTime(start_time)) {
      throw new Error(`Invalid start time format: "${start_time}". Expected HH:MM or HH:MM:SS.`);
    }
    if (!isValidTime(end_time)) {
      throw new Error(`Invalid end time format: "${end_time}". Expected HH:MM or HH:MM:SS.`);
    }
    const total_time = calculateTotalTime(start_time, end_time);
    await plantaoDataSource.update(id, date, start_time, end_time, total_time, description);
  },

  async delete(id: number): Promise<void> {
    await plantaoDataSource.delete(id);
  },

  async getAll(): Promise<Plantao[]> {
    return plantaoDataSource.getAll();
  },

  async getByDate(date: string): Promise<Plantao[]> {
    return plantaoDataSource.getByDate(date);
  },

  async getSobAviso(): Promise<SobAviso[]> {
    return plantaoDataSource.getSobAviso();
  },

  async updateSobAviso(weekday: number, duration: string): Promise<void> {
    if (!isValidTime(duration)) {
      throw new Error(`Invalid duration format: "${duration}". Expected HH:MM or HH:MM:SS.`);
    }
    if (weekday < 0 || weekday > 6) {
      throw new Error(`Invalid weekday: ${weekday}. Expected 0 (Sunday) to 6 (Saturday).`);
    }
    await plantaoDataSource.updateSobAviso(weekday, duration);
  },
};

export default plantaoService;