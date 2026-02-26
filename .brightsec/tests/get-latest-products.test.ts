import { test, before, after } from 'node:test';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, HttpMethod } from '@sectester/scan';

const timeout = 40 * 60 * 1000;
const baseUrl = process.env.BRIGHT_TARGET_URL!;

let runner!: SecRunner;

before(async () => {
  runner = new SecRunner({
    hostname: process.env.BRIGHT_HOSTNAME!,
    projectId: process.env.BRIGHT_PROJECT_ID!
  });

  await runner.init();
});

after(() => runner.clear());

test('GET /latestProducts', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['full_path_disclosure'],
      attackParamLocations: [AttackParamLocation.HEADER],
      starMetadata: {
        code_source: 'lsndr/pureflow2:stable',
        databases: ['PostgreSQL'],
        user_roles: [
          'realm management',
          'account management',
          'broker interactions'
        ]
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.GET,
      url: `${baseUrl}/latestProducts`,
      headers: {
        authorization: process.env.BRIGHT_AUTH_ID,
        Connection: 'keep-alive',
        'User-Agent': 'Mozilla/5.0'
      },
      auth: process.env.BRIGHT_AUTH_ID
    });
});