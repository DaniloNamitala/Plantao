import pontoDataSource, { type Ponto } from "@/data/pontoDataSource";

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

const pontoService = {
  async create(
    date: string,
    time: string,
    type: "in" | "out"
  ): Promise<void> {
    if (!isValidDate(date)) {
      throw new Error(`Invalid date format: "${date}". Expected YYYY-MM-DD.`);
    }
    if (!isValidTime(time)) {
      throw new Error(`Invalid time format: "${time}". Expected HH:MM or HH:MM:SS.`);
    }
    await pontoDataSource.insert(date, time, type);
  },

  async delete(id: number): Promise<void> {
    await pontoDataSource.delete(id);
  },

  async update(id: number, time: string, type: "in" | "out"): Promise<void> {
    if (!isValidTime(time)) {
      throw new Error(`Invalid time format: "${time}". Expected HH:MM or HH:MM:SS.`);
    }
    await pontoDataSource.update(id, time, type);
  },

  async getAll(): Promise<Ponto[]> {
    return pontoDataSource.getAll();
  },

  async getByDate(date: string): Promise<Ponto[]> {
    return pontoDataSource.getByDate(date);
  },
};

export default pontoService;