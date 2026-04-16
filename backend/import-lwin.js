require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const db = require('./db');

const CSV_PATH = './LWINdatabase.csv';
const BATCH_SIZE = 500;

async function importCSV() {
  const rl = readline.createInterface({ input: fs.createReadStream(CSV_PATH) });
  let isFirstLine = true;
  let batch = [];
  let total = 0;

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current === 'NA' ? null : current || null);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current === 'NA' ? null : current || null);
    return result;
  };

  const flushBatch = async () => {
    if (batch.length === 0) return;
    const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
    const values = batch.flat();
    await db.query(
      `INSERT IGNORE INTO lwin 
        (lwin,status,display_name,producer_title,producer_name,wine,country,region,
         sub_region,site,parcel,colour,type,sub_type,designation,classification,
         vintage_config,first_vintage,final_vintage,date_added,date_updated,reference)
       VALUES ${placeholders}`,
      values
    );
    total += batch.length;
    console.log(`Imported ${total} rows...`);
    batch = [];
  };

  for await (const line of rl) {
    if (isFirstLine) { isFirstLine = false; continue; }
    if (!line.trim()) continue;
    const cols = parseLine(line);
    if (cols.length < 22) continue;
    batch.push(cols.slice(0, 22));
    if (batch.length >= BATCH_SIZE) await flushBatch();
  }

  await flushBatch();
  console.log(`Done! Total imported: ${total} rows.`);
  process.exit(0);
}

importCSV().catch(err => { console.error(err); process.exit(1); });
