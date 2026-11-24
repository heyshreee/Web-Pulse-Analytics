import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPlanLimits } from '../src/services/usage.service.js';

test('getPlanLimits returns correct limits for canonical 5 tiers', () => {
    const nano = getPlanLimits('nano');
    assert.equal(nano.monthlyViews, 10000);
    assert.equal(nano.projectLimit, 1);
    assert.equal(nano.allowedOriginsLimit, 1);
    assert.equal(nano.retentionDays, 7);
    assert.equal(nano.refreshRate, 60);
    assert.equal(nano.amount, 0);

    const lite = getPlanLimits('lite');
    assert.equal(lite.monthlyViews, 100000);
    assert.equal(lite.projectLimit, 3);
    assert.equal(lite.allowedOriginsLimit, 3);
    assert.equal(lite.retentionDays, 30);
    assert.equal(lite.refreshRate, 15);
    assert.equal(lite.amount, 199);

    const pro = getPlanLimits('pro');
    assert.equal(pro.monthlyViews, 1000000);
    assert.equal(pro.projectLimit, 10);
    assert.equal(pro.allowedOriginsLimit, 10);
    assert.equal(pro.retentionDays, 90);
    assert.equal(pro.refreshRate, 5);
    assert.equal(pro.amount, 699);
    assert.equal(pro.liveLogs, true);

    const max = getPlanLimits('max');
    assert.equal(max.monthlyViews, 5000000);
    assert.equal(max.projectLimit, 50);
    assert.equal(max.allowedOriginsLimit, 25);
    assert.equal(max.retentionDays, 365);
    assert.equal(max.refreshRate, 1);
    assert.equal(max.amount, 1999);
    assert.equal(max.liveLogs, true);

    const enterprise = getPlanLimits('enterprise');
    assert.equal(enterprise.amount, 'custom');
    assert.equal(enterprise.liveLogs, true);
    assert.equal(enterprise.retentionDays, 730);
});

test('getPlanLimits normalizes legacy plan aliases to new tiers', () => {
    assert.equal(getPlanLimits('free').monthlyViews, 10000);
    assert.equal(getPlanLimits('basic').monthlyViews, 100000);
    assert.equal(getPlanLimits('business').monthlyViews, 5000000);
    assert.equal(getPlanLimits(null).monthlyViews, 10000);
    assert.equal(getPlanLimits('unknown_plan').monthlyViews, 10000);
});
