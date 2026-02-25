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

test('GET /api/products', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['sqli', 'date_manipulation', 'business_constraint_bypass', 'csrf'],
      attackParamLocations: [AttackParamLocation.QUERY, AttackParamLocation.HEADER],
      starMetadata: {
        code_source: 'lsndr/pureflow2:stable',
        databases: ['PostgreSQL'],
        user_roles: ['realm management', 'account management', 'broker interactions']
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined,
      skipStaticParams: false
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.GET,
      url: `${baseUrl}/api/products?date_from=02-05-2001&date_to=02-05-2024`,
      headers: { 'x-product-name': 'Amethyst' }
    });
});