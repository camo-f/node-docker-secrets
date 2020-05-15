import { build, getSecret, listSecrets } from '../src/async';

beforeAll(function() {
  process.env.SECRET1_PATH = `${__dirname}/resources/secret1`;
  process.env.SECRET2_PATH = `${__dirname}/resources/secret2`;
  process.env.SECRET3_PATH = `${__dirname}/resources/secret3`;
  process.env.SECRET_ONLY_IN_ENV = 'secret4';
});

describe('Build errors', function() {
  it('should throw an error when empty array is provided', async function() {
    await expect(build([])).rejects.toThrow();
  });

  it('should throw an error when empty new Map is provided', async function() {
    await expect(build(new Map())).rejects.toThrow();
  });

  it('should throw an error when empty new Set is provided', async function() {
    await expect(build(new Set())).rejects.toThrow();
  });
});

describe('Build with array', function() {
  it('should be fulfilled when new Array with one element is provided', async function() {
    const secrets = await build(['SECRET1_PATH']);
    expect(secrets.size).toEqual(1);
    expect(await getSecret(secrets, 'SECRET1_PATH')).toEqual('');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(1);
    expect(secretsList).toContain('SECRET1_PATH');
  });

  it('should be fulfilled when new Array with multiple elements is provided', async function() {
    const secrets = await build([
      'SECRET1_PATH',
      'SECRET2_PATH',
      'SECRET3_PATH',
    ]);
    expect(secrets.size).toEqual(3);
    expect(await getSecret(secrets, 'SECRET1_PATH')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3_PATH')).toEqual('secret3');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Array with a missing key is provided', async function() {
    const secrets = await build([
      'SECRET1_PATH',
      'SECRET2_PATH',
      'SECRET3_PATH',
      'MISSING_KEY_PATH',
    ]);
    expect(secrets.size).toEqual(3);
    expect(await getSecret(secrets, 'SECRET1_PATH')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3_PATH')).toEqual('secret3');
    await expect(getSecret(secrets, 'MISSING_KEY_PATH')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Array with only missing keys is provided', async function() {
    const secrets = await build(['MISSING_KEY_PATH', 'MISSING_KEY2_PATH']);
    expect(secrets.size).toEqual(0);
    await expect(getSecret(secrets, 'MISSING_KEY_PATH')).rejects.toThrow();
    await expect(getSecret(secrets, 'MISSING_KEY_PATH2')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(0);
  });
});

describe('Build with Map', function() {
  it('should be fulfilled when new Map with one element is provided', async function() {
    const secrets = await build(new Map([['SECRET1', 'SECRET1_PATH']]));
    expect(secrets.size).toEqual(1);
    expect(await getSecret(secrets, 'SECRET1')).toEqual('');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(1);
    expect(secretsList).toContain('SECRET1');
  });

  it('should be fulfilled when new Map with multiple elements is provided', async function() {
    const secrets = await build(
      new Map([
        ['SECRET1', 'SECRET1_PATH'],
        ['SECRET2', 'SECRET2_PATH'],
        ['SECRET3', 'SECRET3_PATH'],
      ]),
    );
    expect(secrets.size).toEqual(3);
    expect(await getSecret(secrets, 'SECRET1')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3')).toEqual('secret3');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1');
    expect(secretsList).toContain('SECRET2');
    expect(secretsList).toContain('SECRET3');
  });

  it('should be fulfilled when new Map with a missing key is provided', async function() {
    const secrets = await build(
      new Map([
        ['SECRET1', 'SECRET1_PATH'],
        ['SECRET2', 'SECRET2_PATH'],
        ['SECRET3', 'SECRET3_PATH'],
        ['SECRET_ONLY_IN_ENV', 'SECRET_ONLY_IN_ENV_PATH'],
        ['MISSING_KEY', 'MISSING_KEY_PATH'],
      ]),
    );
    expect(secrets.size).toEqual(3);
    expect(await getSecret(secrets, 'SECRET1')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3')).toEqual('secret3');
    await expect(getSecret(secrets, 'MISSING_KEY')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1');
    expect(secretsList).toContain('SECRET2');
    expect(secretsList).toContain('SECRET3');
  });

  it('should be fulfilled when new Map with a missing key is provided and secret is set in env', async function() {
    const secrets = await build(
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
    expect(await getSecret(secrets, 'SECRET1')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3')).toEqual('secret3');
    expect(await getSecret(secrets, 'SECRET_ONLY_IN_ENV')).toEqual('secret4');
    await expect(getSecret(secrets, 'MISSING_KEY')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(4);
    expect(secretsList).toContain('SECRET1');
    expect(secretsList).toContain('SECRET2');
    expect(secretsList).toContain('SECRET3');
    expect(secretsList).toContain('SECRET_ONLY_IN_ENV');
  });

  it('should be fulfilled when new Map with only missing keys are provided', async function() {
    const secrets = await build(
      new Map([
        ['MISSING_KEY', 'MISSING_KEY_PATH'],
        ['MISSING_KEY2', 'MISSING_KEY2_PATH'],
      ]),
    );
    expect(secrets.size).toEqual(0);
    await expect(getSecret(secrets, 'MISSING_KEY')).rejects.toThrow();
    await expect(getSecret(secrets, 'MISSING_KEY')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(0);
  });
});

describe('Build with Set', function() {
  it('should be fulfilled when new Set with one element is provided', async function() {
    const secrets = await build(new Set(['SECRET1_PATH']));
    expect(secrets.size).toEqual(1);
    expect(await getSecret(secrets, 'SECRET1_PATH')).toEqual('');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(1);
    expect(secretsList).toContain('SECRET1_PATH');
  });

  it('should be fulfilled when new Set with multiple elements is provided', async function() {
    const secrets = await build(
      new Set(['SECRET1_PATH', 'SECRET2_PATH', 'SECRET3_PATH']),
    );
    expect(secrets.size).toEqual(3);
    expect(await getSecret(secrets, 'SECRET1_PATH')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3_PATH')).toEqual('secret3');
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Set with a missing key is provided', async function() {
    const secrets = await build(
      new Set([
        'SECRET1_PATH',
        'SECRET2_PATH',
        'SECRET3_PATH',
        'MISSING_KEY_PATH',
      ]),
    );
    expect(secrets.size).toEqual(3);
    expect(await getSecret(secrets, 'SECRET1_PATH')).toEqual('');
    expect(await getSecret(secrets, 'SECRET2_PATH')).toEqual('secret2');
    expect(await getSecret(secrets, 'SECRET3_PATH')).toEqual('secret3');
    await expect(getSecret(secrets, 'MISSING_KEY_PATH')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(3);
    expect(secretsList).toContain('SECRET1_PATH');
    expect(secretsList).toContain('SECRET2_PATH');
    expect(secretsList).toContain('SECRET3_PATH');
  });

  it('should be fulfilled when new Set with only missing keys are provided', async function() {
    const secrets = await build(
      new Set(['MISSING_KEY_PATH', 'MISSING_KEY_PATH2']),
    );
    expect(secrets.size).toEqual(0);
    await expect(getSecret(secrets, 'MISSING_KEY_PATH')).rejects.toThrow();
    await expect(getSecret(secrets, 'MISSING_KEY_PATH2')).rejects.toThrow();
    const secretsList = await listSecrets(secrets);
    expect(secretsList).toHaveLength(0);
  });
});
