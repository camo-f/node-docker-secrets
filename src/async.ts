import { promises as Fs } from 'fs'; // TODO: improve as https://github.com/nodejs/node/issues/21014 is solved or update to Node 13
import { DockerSecretsMap } from './types';

export async function build(
  keys: string[] | Map<string, string> | Set<string>,
  allowSecretsFromEnv = false,
): Promise<DockerSecretsMap> {
  let map: DockerSecretsMap;
  if (keys instanceof Array && keys.length > 0) {
    map = new Map(keys.map(value => [value, value]));
  } else if ((keys instanceof Map || keys instanceof Set) && keys.size > 0) {
    map = new Map(keys.entries());
  } else {
    throw new Error('Please provide a non-empty Array, Map or Set.');
  }

  const secrets = new Map<string, string>();
  // Read all secrets in parallel
  await Promise.all(
    Array.from(map).map(async secretKeyName => {
      try {
        const secret = await readFileFromEnv(secretKeyName[1]);
        secrets.set(secretKeyName[0], secret);
      } catch (error) {
        // Fallback to env var if allowed
        if (allowSecretsFromEnv === true) {
          try {
            const secret = await readFromEnv(secretKeyName[0]);
            secrets.set(secretKeyName[0], secret);
          } catch (error2) {
            return;
          }
        }
        return;
      }
    }),
  );

  return secrets;
}

export async function getSecret(
  secrets: DockerSecretsMap,
  key: string,
): Promise<string> {
  if (secrets.has(key) === false) {
    throw new Error(`Secret ${key} does not exists`);
  }
  const secret = secrets.get(key);
  /* istanbul ignore next: https://github.com/microsoft/TypeScript/issues/9619 */
  if (typeof secret === 'undefined') {
    throw new Error(`Secret ${key} is undefined`);
  }
  return secret;
}

export async function listSecrets(
  secrets: DockerSecretsMap,
): Promise<string[]> {
  return Array.from(secrets.keys());
}

async function readFileFromEnv(key: string): Promise<string> {
  const path = process.env[key];
  if (!path) {
    throw new Error(`Missing key ${key}`);
  }
  // Read Docker secret file
  const res = await Fs.readFile(path, 'utf8');
  return res.trim();
}

async function readFromEnv(key: string): Promise<string> {
  const secret = process.env[key];
  if (!secret) {
    throw new Error(`Missing key ${key}`);
  }

  return secret;
}
