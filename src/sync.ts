import { readFileSync } from 'fs';
import { DockerSecretsMap } from './types';

export function buildSync(
  keys: string[] | Map<string, string> | Set<string>,
  allowSecretsFromEnv = false,
): DockerSecretsMap {
  let map: DockerSecretsMap;
  if (keys instanceof Array && keys.length > 0) {
    map = new Map(keys.map(value => [value, value]));
  } else if ((keys instanceof Map || keys instanceof Set) && keys.size > 0) {
    map = new Map(keys.entries());
  } else {
    throw new Error('Please provide a non-empty Array, Map or Set.');
  }

  const secrets = new Map<string, string>();

  map.forEach((secretKeyPath, secretKeyName) => {
    try {
      const secret = readFileFromEnvSync(secretKeyPath);
      secrets.set(secretKeyName, secret);
    } catch (error) {
      // Fallback to env var if allowed
      if (allowSecretsFromEnv === true) {
        try {
          const secret = readFromEnvSync(secretKeyName);
          secrets.set(secretKeyName, secret);
        } catch (error2) {
          return;
        }
      }
      return;
    }
  });

  return secrets;
}

export function getSecretSync(secrets: DockerSecretsMap, key: string): string {
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

function readFileFromEnvSync(key: string): string {
  const path = process.env[key];
  if (!path) {
    throw new Error(`Missing key ${key}`);
  }
  // Read Docker secret file
  const res = readFileSync(path, 'utf8');
  return res.trim();
}

function readFromEnvSync(key: string): string {
  const secret = process.env[key];
  if (!secret) {
    throw new Error(`Missing key ${key}`);
  }

  return secret;
}
