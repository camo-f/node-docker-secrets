import { buildSync, getSecretSync } from '../src/sync';
import { listSecrets } from '../src/async';

beforeAll(function() {
  process.env.SECRET1_PATH = `${__dirname}/resources/secret1`;
  process.env.SECRET2_PATH = `${__dirname}/resources/secret2`;
  process.env.SECRET3_PATH = `${__dirname}/resources/secret3`;
  process.env.SECRET_ONLY_IN_ENV = 'secret4';
});

describe('Build errors', function() {
  it('should throw an error when empty array is provided', async function() {
    expect(() => {
      buildSync([]);
    }).toThrow();
  });

  it('should throw an error when empty new Map is provided', async function() {
    expect(() => {
      buildSync(new Map());
    }).toThrow();
  });

  it('should throw an error when empty new Set is provided', async function() {
    expect(() => {
      buildSync(new Set());
    }).toThrow();
  });
});

describe('Build with array', function() {
  it('should be fulfilled when new Array with one element is provided', async function() {
    const secrets = buildSync(['SECRET1_PATH']);
    expect(secrets.size).toEqual(1);
    expect(getSecretSync(secrets, 'SECRET1_PATH')).toEqual('');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(1);
    expect(secretsList).toContain('SECRET1_PATH');
  });

  it('should be fulfilled when new Array with multiple elements is provided', async function() {
    const secrets = buildSync(['SECRET1_PATH', 'SECRET2_PATH', 'SECRET3_PATH']);
    expect(secrets.size).toEqual(3);
    expect(getSecretSync(secrets, 'SECRET1_PATH')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3_PATH')).toEqual('secret3');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Array with a missing key is provided', async function() {
    const secrets = buildSync([
      'SECRET1_PATH',
      'SECRET2_PATH',
      'SECRET3_PATH',
      'MISSING_KEY_PATH',
    ]);
    expect(secrets.size).toEqual(3);
    expect(getSecretSync(secrets, 'SECRET1_PATH')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3_PATH')).toEqual('secret3');
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Array with only missing keys is provided', async function() {
    const secrets = buildSync(['MISSING_KEY_PATH', 'MISSING_KEY2_PATH']);
    expect(secrets.size).toEqual(0);
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH');
    }).toThrow();
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH2');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(0);
  });
});

describe('Build with Map', function() {
  it('should be fulfilled when new Map with one element is provided', async function() {
    const secrets = buildSync(new Map([['SECRET1', 'SECRET1_PATH']]));
    expect(secrets.size).toEqual(1);
    expect(getSecretSync(secrets, 'SECRET1')).toEqual('');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(1);
    expect(secretsList).toContain('SECRET1');
  });

  it('should be fulfilled when new Map with multiple elements is provided', async function() {
    const secrets = buildSync(
      new Map([
        ['SECRET1', 'SECRET1_PATH'],
        ['SECRET2', 'SECRET2_PATH'],
        ['SECRET3', 'SECRET3_PATH'],
      ]),
    );
    expect(secrets.size).toEqual(3);
    expect(getSecretSync(secrets, 'SECRET1')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3')).toEqual('secret3');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1');
    expect(secretsList).toContain('SECRET2');
    expect(secretsList).toContain('SECRET3');
  });

  it('should be fulfilled when new Map with a missing key is provided', async function() {
    const secrets = buildSync(
      new Map([
        ['SECRET1', 'SECRET1_PATH'],
        ['SECRET2', 'SECRET2_PATH'],
        ['SECRET3', 'SECRET3_PATH'],
        ['SECRET_ONLY_IN_ENV', 'SECRET_ONLY_IN_ENV_PATH'],
        ['MISSING_KEY', 'MISSING_KEY_PATH'],
      ]),
    );
    expect(secrets.size).toEqual(3);
    expect(getSecretSync(secrets, 'SECRET1')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3')).toEqual('secret3');
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1');
    expect(secretsList).toContain('SECRET2');
    expect(secretsList).toContain('SECRET3');
  });

  it('should be fulfilled when new Map with a missing key is provided and secret is set in env', async function() {
    const secrets = buildSync(
      new Map([
        ['SECRET1', 'SECRET1_PATH'],
        ['SECRET2', 'SECRET2_PATH'],
        ['SECRET3', 'SECRET3_PATH'],
        ['SECRET_ONLY_IN_ENV', 'SECRET_ONLY_IN_ENV_PATH'],
        ['MISSING_KEY', 'MISSING_KEY_PATH'],
      ]),
      true,
    );
    expect(secrets.size).toEqual(4);
    expect(getSecretSync(secrets, 'SECRET1')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3')).toEqual('secret3');
    expect(getSecretSync(secrets, 'SECRET_ONLY_IN_ENV')).toEqual('secret4');
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(4);
    expect(secretsList).toContain('SECRET1');
    expect(secretsList).toContain('SECRET2');
    expect(secretsList).toContain('SECRET3');
    expect(secretsList).toContain('SECRET_ONLY_IN_ENV');
  });

  it('should be fulfilled when new Map with only missing keys are provided', async function() {
    const secrets = buildSync(
      new Map([
        ['MISSING_KEY', 'MISSING_KEY_PATH'],
        ['MISSING_KEY2', 'MISSING_KEY2_PATH'],
      ]),
    );
    expect(secrets.size).toEqual(0);
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY');
    }).toThrow();
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(0);
  });
});

describe('Build with Set', function() {
  it('should be fulfilled when new Set with one element is provided', async function() {
    const secrets = buildSync(new Set(['SECRET1_PATH']));
    expect(secrets.size).toEqual(1);
    expect(getSecretSync(secrets, 'SECRET1_PATH')).toEqual('');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(1);
    expect(secretsList).toContain('SECRET1_PATH');
  });

  it('should be fulfilled when new Set with multiple elements is provided', async function() {
    const secrets = buildSync(
      new Set(['SECRET1_PATH', 'SECRET2_PATH', 'SECRET3_PATH']),
    );
    expect(secrets.size).toEqual(3);
    expect(getSecretSync(secrets, 'SECRET1_PATH')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3_PATH')).toEqual('secret3');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Set with a missing key is provided', async function() {
    const secrets = buildSync(
      new Set([
        'SECRET1_PATH',
        'SECRET2_PATH',
        'SECRET3_PATH',
        'MISSING_KEY_PATH',
      ]),
    );
    expect(secrets.size).toEqual(3);
    expect(getSecretSync(secrets, 'SECRET1_PATH')).toEqual('');
    expect(getSecretSync(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(getSecretSync(secrets, 'SECRET3_PATH')).toEqual('secret3');
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Set with only missing keys are provided', async function() {
    const secrets = buildSync(
      new Set(['MISSING_KEY_PATH', 'MISSING_KEY_PATH2']),
    );
    expect(secrets.size).toEqual(0);
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH');
    }).toThrow();
    expect(() => {
      getSecretSync(secrets, 'MISSING_KEY_PATH2');
    }).toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(0);
  });
});
