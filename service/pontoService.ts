import pontoDataSource, { type Ponto } from "@/data/pontoDataSource";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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

  async getByDateRange(startDate: string, endDate: string): Promise<Ponto[]> {
    return pontoDataSource.getByDateRange(startDate, endDate);
  },

  async exportPdf(startDate: string, endDate: string): Promise<void> {
    const records = await pontoDataSource.getByDateRange(startDate, endDate);
    const config = await pontoDataSource.getConfig();
    const workDayMinutes = timeToMinutes(config.work_day_duration);

    // Group records by date
    const grouped: Record<string, Ponto[]> = {};
    for (const r of records) {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    }

    const dates = Object.keys(grouped).sort();

    let tableRows = "";
    let grandTotalMinutes = 0;
    let grandResultMinutes = 0;
    for (const date of dates) {
      const dayRecords = grouped[date];
      const ins = dayRecords.filter((r) => r.type === "in").map((r) => r.time.slice(0, 5));
      const outs = dayRecords.filter((r) => r.type === "out").map((r) => r.time.slice(0, 5));

      // Calculate total worked time from in/out pairs
      let totalMinutes = 0;
      const pairs = Math.min(ins.length, outs.length);
      for (let i = 0; i < pairs; i++) {
        const inMin = timeToMinutes(ins[i]);
        const outMin = timeToMinutes(outs[i]);
        if (outMin > inMin) totalMinutes += outMin - inMin;
      }

      const totalTime = minutesToTime(totalMinutes);
      const diffMinutes = totalMinutes - workDayMinutes;
      const sign = diffMinutes >= 0 ? "+" : "-";
      const result = `${sign}${minutesToTime(Math.abs(diffMinutes))}`;

      grandTotalMinutes += totalMinutes;
      grandResultMinutes += diffMinutes;

      const formattedDate = date.split("-").reverse().join("/");
      const in1 = ins[0] ?? "-";
      const out1 = outs[0] ?? "-";
      const in2 = ins[1] ?? "-";
      const out2 = outs[1] ?? "-";

      tableRows += `
        <tr>
          <td>${formattedDate}</td>
          <td>${in1}</td>
          <td>${out1}</td>
          <td>${in2}</td>
          <td>${out2}</td>
          <td>${totalTime}</td>
          <td style="color: ${diffMinutes >= 0 ? "#22c55e" : "#ef4444"}">${result}</td>
        </tr>`;
    }

    const formattedStart = startDate.split("-").reverse().join("/");
    const formattedEnd = endDate.split("-").reverse().join("/");

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; color: #333; }
            p.subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background-color: #2f95dc; color: #fff; padding: 8px 6px; text-align: center; }
            td { padding: 8px 6px; text-align: center; border-bottom: 1px solid #e0e0e0; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr.totals td { font-weight: 700; border-top: 2px solid #333; background-color: #e8f4fd; }
          </style>
        </head>
        <body>
          <h2>Registro de Ponto</h2>
          <p class="subtitle">${formattedStart} a ${formattedEnd} — Jornada: ${config.work_day_duration.slice(0, 5)}</p>
          <table>
            <tr>
              <th>Data</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Total</th>
              <th>Resultado</th>
            </tr>
            ${tableRows}
            <tr class="totals">
              <td colspan="5">Total</td>
              <td>${minutesToTime(grandTotalMinutes)}</td>
              <td style="color: ${grandResultMinutes >= 0 ? "#22c55e" : "#ef4444"}">${grandResultMinutes >= 0 ? "+" : "-"}${minutesToTime(Math.abs(grandResultMinutes))}</td>
            </tr>
          </table>
        </body>
      </html>`;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  },
};

export default pontoService;