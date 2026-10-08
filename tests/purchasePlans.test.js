import test from 'node:test';
import assert from 'node:assert/strict';
import { PURCHASE_PLANS, resolvePurchasePlan } from '../src/lib/purchasePlans.js';
import { resolveMembership } from '../src/lib/membership.js';

test('new purchases offer only the three mentorship memberships', () => {
    assert.deepEqual(PURCHASE_PLANS.map(plan => plan.name), ['Standard Access', 'Extended Access', 'Lifetime Edition']);
});

test('retired and unsupported navigation choices cannot resolve to checkout', () => {
    for (const choice of [{ name: 'Indicators Only' }, { name: 'indicators_only' }, { name: 'Unknown Plan' }, { name: 'Lifetime Plan' }, {}, [], 'Standard Access', null, undefined]) {
        assert.equal(resolvePurchasePlan(choice), null);
    }
});

test('checkout uses catalog prices and features instead of modified browser state', () => {
    for (const plan of PURCHASE_PLANS) {
        const choice = { ...plan, price: '0', period: 'forged period', features: ['forged access'], paypalPlanId: 'retired-plan' };
        assert.equal(resolvePurchasePlan(choice), plan);
        assert.equal(resolvePurchasePlan(choice).price, plan.price);
        assert.deepEqual(resolvePurchasePlan(choice).features, plan.features);
    }
});

test('an existing purchased indicators membership retains its dashboard and tools access', () => {
    const membership = resolveMembership({ subscription_type: 'indicators_only', subscription_status: 'active' });
    assert.equal(membership.canEnterDashboard, true);
    assert.equal(membership.canWatchCourses, false);
    assert.equal(membership.label, 'Indicators Plan');
});
