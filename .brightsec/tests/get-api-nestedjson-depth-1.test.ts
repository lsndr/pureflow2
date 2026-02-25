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

test('GET /api/nestedJson?depth=1', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['date_manipulation', 'business_constraint_bypass', 'full_path_disclosure', 'secret_tokens'],
      attackParamLocations: [AttackParamLocation.QUERY],
      starMetadata: {
        code_source: 'lsndr/pureflow2:stable',
        databases: ['PostgreSQL'],
        user_roles: ['realm management', 'account management', 'broker interactions']
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined,
      skipStaticParams: true
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.GET,
      url: `${baseUrl}/api/nestedJson?depth=1`,
      headers: { 'Content-Type': 'application/json' }
    });
});