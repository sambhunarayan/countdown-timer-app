/**
 * Unit tests for the backend.
 * Run with: npm test
 */
const request = require('supertest');

// Mock mongoose before requiring the app
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),
    model: actual.model,
    Schema: actual.Schema,
  };
});

// We need to test validators separately since the app requires DB
const { timerSchema, updateTimerSchema } = require('../controllers/validators');

// ── Test 1: Validator accepts valid fixed timer ──────────────
describe('Timer Validator', () => {
  test('accepts a valid fixed timer', () => {
    const { error } = timerSchema.validate({
      name: 'Flash Sale',
      timerType: 'fixed',
      startTime: '2025-01-01T00:00:00Z',
      endTime: '2025-01-02T00:00:00Z',
    });
    expect(error).toBeUndefined();
  });

  // ── Test 2: Rejects fixed timer without endTime ─────────────
  test('rejects fixed timer without endTime', () => {
    const { error } = timerSchema.validate({
      name: 'Flash Sale',
      timerType: 'fixed',
      startTime: '2025-01-01T00:00:00Z',
    });
    expect(error).toBeDefined();
  });

  // ── Test 3: Rejects empty name ──────────────────────────────
  test('rejects timer with empty name', () => {
    const { error } = timerSchema.validate({
      name: '',
      timerType: 'evergreen',
      evergreenDuration: 30,
    });
    expect(error).toBeDefined();
  });

  // ── Test 4: Accepts valid evergreen timer ───────────────────
  test('accepts a valid evergreen timer', () => {
    const { error } = timerSchema.validate({
      name: 'Limited Offer',
      timerType: 'evergreen',
      evergreenDuration: 60,
    });
    expect(error).toBeUndefined();
  });

  // ── Test 5: Rejects endTime before startTime ────────────────
  test('rejects endTime before startTime', () => {
    const { error } = timerSchema.validate({
      name: 'Bad Timer',
      timerType: 'fixed',
      startTime: '2025-06-01T12:00:00Z',
      endTime: '2025-05-01T12:00:00Z',
    });
    expect(error).toBeDefined();
  });
});

// ── Test 6: Auth middleware rejects missing shop header ───────
const { authShop } = require('../middleware/authShop');

describe('authShop middleware', () => {
  test('rejects request without x-shop-id', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authShop(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts valid shop ID', () => {
    const req = { headers: { 'x-shop-id': 'test-store.myshopify.com' } };
    const res = {};
    const next = jest.fn();

    authShop(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.shopId).toBe('test-store.myshopify.com');
  });
});
