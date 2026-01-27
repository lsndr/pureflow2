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

test('POST /api/metadata', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['xxe', 'secret_tokens', 'osi'],
      attackParamLocations: [AttackParamLocation.BODY],
      starMetadata: {
        code_source: "lsndr/pureflow2:stable",
        databases: ["PostgreSQL"],
        user_roles: [
          "default-roles-pureflow",
          "offline_access",
          "uma_authorization",
          "query-users",
          "view-authorization",
          "create-client",
          "realm-admin",
          "manage-users",
          "manage-authorization",
          "query-realms",
          "view-events",
          "manage-clients",
          "view-realm",
          "manage-realm",
          "impersonation",
          "query-clients",
          "query-groups",
          "manage-events",
          "view-clients",
          "view-identity-providers",
          "view-users",
          "manage-identity-providers",
          "read-token",
          "view-profile",
          "manage-account-links",
          "manage-account",
          "manage-consent",
          "view-applications",
          "view-consent",
          "delete-account"
        ]
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.POST,
      url: `${baseUrl}/api/metadata`,
      body: "%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20viewBox%3D%220%200%20915%20585%22%3E%3Cg%20stroke-width%3D%223.45%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%23000%22%20d%3D%22M11.8%2011.8h411v411l-411%20.01v-411z%22%2F%3E%3Cpath%20stroke%3D%22%23448%22%20d%3D%22M489%2011.7h415v411H489v-411z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
      headers: { 'Content-Type': 'text/xml' }
    });
});