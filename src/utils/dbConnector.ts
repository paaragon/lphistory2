import { Client } from 'pg';

async function connect(host: string, port: string, database: string, user: string, password: string, schema: string) {
  const client = new Client({
    host,
    port: parseInt(port, 10),
    database,
    user,
    password,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  await client.query(`SET search_path TO ${schema}`);

  return client;
}

function close(client: Client) {
  client.end();
}

async function query(client: Client, q: string, params: any[]) {
  return client.query(q, params);
}

export default {
  connect,
  close,
  query,
};
