import plantaoDataSource, { type Plantao, type SobAviso } from "@/data/plantaoDataSource";
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

  async getByDateRange(startDate: string, endDate: string): Promise<Plantao[]> {
    return plantaoDataSource.getByDateRange(startDate, endDate);
  },

  async exportPdf(startDate: string, endDate: string): Promise<void> {
    const records = await plantaoDataSource.getByDateRange(startDate, endDate);
    const sobAvisoConfig = await plantaoDataSource.getSobAviso();

    // Build weekday -> duration map (0=Sunday..6=Saturday)
    const sobAvisoMap: Record<number, number> = {};
    for (const sa of sobAvisoConfig) {
      sobAvisoMap[sa.weekday] = timeToMinutes(sa.duration);
    }

    // Group records by date
    const grouped: Record<string, Plantao[]> = {};
    for (const r of records) {
      if (!grouped[r.date]) grouped[r.date] = [];
      grouped[r.date].push(r);
    }

    // Generate all dates between startDate and endDate
    const allDates: string[] = [];
    const current = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      allDates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }

    const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    let tableRows = "";
    let grandTotalExtraMinutes = 0;
    let grandTotalSobAvisoMinutes = 0;

    for (const date of allDates) {
      const dayRecords = grouped[date] ?? [];
      const rowCount = Math.max(dayRecords.length, 1);

      // Get weekday (0=Sunday..6=Saturday) from date string
      const dateObj = new Date(date + "T00:00:00");
      const weekday = dateObj.getDay();
      const weekdayLabel = WEEKDAY_LABELS[weekday];
      const sobAvisoMinutes = sobAvisoMap[weekday] ?? 0;
      const sobAvisoTime = minutesToTime(sobAvisoMinutes);

      // Sum extra work for this day
      let dayExtraMinutes = 0;
      for (const r of dayRecords) {
        dayExtraMinutes += timeToMinutes(r.total_time);
      }

      grandTotalExtraMinutes += dayExtraMinutes;
      grandTotalSobAvisoMinutes += sobAvisoMinutes;

      const formattedDate = date.split("-").reverse().join("/");

      if (dayRecords.length === 0) {
        // No extra work — show date + sob aviso, blank time columns
        tableRows += `
            <tr>
              <td>${weekdayLabel}</td>
              <td>${formattedDate}</td>
              <td>${sobAvisoTime}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>`;
      } else {
        for (let i = 0; i < dayRecords.length; i++) {
          const r = dayRecords[i];
          const startTime = r.start_time.slice(0, 5);
          const endTime = r.end_time.slice(0, 5);
          const totalTime = r.total_time.slice(0, 5);

          if (i === 0) {
            tableRows += `
            <tr>
              <td${rowCount > 1 ? ` rowspan="${rowCount}"` : ""}>${weekdayLabel}</td>
              <td${rowCount > 1 ? ` rowspan="${rowCount}"` : ""}>${formattedDate}</td>
              <td${rowCount > 1 ? ` rowspan="${rowCount}"` : ""}>${sobAvisoTime}</td>
              <td>${startTime}</td>
              <td>${endTime}</td>
              <td>${totalTime}</td>
            </tr>`;
          } else {
            tableRows += `
            <tr>
              <td>${startTime}</td>
              <td>${endTime}</td>
              <td>${totalTime}</td>
            </tr>`;
          }
        }
      }
    }

    const netSobAvisoMinutes = grandTotalSobAvisoMinutes - grandTotalExtraMinutes;
    const netSign = netSobAvisoMinutes >= 0 ? "" : "-";
    const netSobAviso = `${netSign}${minutesToTime(Math.abs(netSobAvisoMinutes))}`;

    const formattedStart = startDate.split("-").reverse().join("/");
    const formattedEnd = endDate.split("-").reverse().join("/");

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 12px; }
            h2 { text-align: center; color: #333; font-size: 14px; margin-bottom: 4px; }
            p.subtitle { text-align: center; color: #666; font-size: 10px; margin-bottom: 10px; }
            table { width: 60%; border-collapse: collapse; font-size: 10px; margin: 0 auto; }
            th { background-color: #f59e0b; color: #fff; padding: 4px 3px; text-align: center; }
            td { padding: 3px 3px; text-align: center; border-bottom: 1px solid #e0e0e0; vertical-align: middle; line-height: 1.2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr.totals td { font-weight: 700; border-top: 2px solid #333; background-color: #fef3c7; }
          </style>
        </head>
        <body>
          <h2>Relatório de Plantão</h2>
          <p class="subtitle">${formattedStart} a ${formattedEnd}</p>
          <table>
            <tr>
              <th>Data</th>
              <th>Dia</th>
              <th>Sob Aviso</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Tempo Total</th>
            </tr>
            ${tableRows}
            <tr class="totals">
              <td colspan="3">Total Sob Aviso: ${netSobAviso}</td>
              <td colspan="3">Total Extra: ${minutesToTime(grandTotalExtraMinutes)}</td>
            </tr>
          </table>
        </body>
      </html>`;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  },
};

export default plantaoService;