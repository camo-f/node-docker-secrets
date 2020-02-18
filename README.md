# node-docker-secrets
Read Docker secrets from environment variables

## Usage
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

See `tests/index.test.ts` for more examples