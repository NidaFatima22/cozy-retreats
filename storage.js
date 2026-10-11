const fs = require('fs');
const path = require('path');
function createStore({ file = path.join(__dirname, 'data', 'db.json'), connectionString = process.env.DATABASE_URL, production = !!process.env.VERCEL, pool } = {}) {
  const readFile = () => JSON.parse(fs.readFileSync(file, 'utf8'));
  const db = pool || (connectionString ? new (require('pg').Pool)({ connectionString, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000 }) : null);
  let ready;
  async function init() {
    if (!db) { if (production) throw new Error('DATABASE_NOT_CONFIGURED'); return; }
    if (!ready) ready = (async () => {
      await db.query('CREATE TABLE IF NOT EXISTS cozy_site_data (id INTEGER PRIMARY KEY CHECK (id = 1), data JSONB NOT NULL)');
      await db.query('INSERT INTO cozy_site_data (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING', [JSON.stringify(readFile())]);
    })().catch(error => { ready = null; throw error; });
    await ready;
  }
  async function read() {
    await init();
    return db ? (await db.query('SELECT data FROM cozy_site_data WHERE id = 1')).rows[0].data : readFile();
  }
  async function edit(change) {
    await init();
    if (!db) {
      const data = readFile(), result = change(data);
      fs.writeFileSync(file + '.tmp', JSON.stringify(data, null, 1));
      fs.renameSync(file + '.tmp', file);
      return result;
    }
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const data = (await client.query('SELECT data FROM cozy_site_data WHERE id = 1 FOR UPDATE')).rows[0].data;
      const result = change(data);
      await client.query('UPDATE cozy_site_data SET data = $1::jsonb WHERE id = 1', [JSON.stringify(data)]);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }
  return { read, edit };
}
module.exports = { createStore };
