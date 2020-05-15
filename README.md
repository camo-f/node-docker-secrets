# node-docker-secrets
Read Docker secrets from environment variables

## Changelog
### v2.0.0
- Add sync functions

## Usage
### Async
```
import { build, getSecret } from 'node-docker-secrets';

const secrets = await build(
  new Map([
    ['SECRET1', 'SECRET1_PATH'],
    ['SECRET2', 'SECRET2_PATH'],
    ['SECRET3', 'SECRET3_PATH'],
  ]),
);

const secret = getSecret(secrets, 'SECRET1');
```

See `tests/async.test.ts` for more examples

### Sync
```
import { buildSync, getSecretSync } from 'node-docker-secrets';

const secrets = buildSync(
  new Map([
    ['SECRET1', 'SECRET1_PATH'],
    ['SECRET2', 'SECRET2_PATH'],
    ['SECRET3', 'SECRET3_PATH'],
  ]),
);

const secret = getSecretSync(secrets, 'SECRET1');
```

See `tests/sync.test.ts` for more examples