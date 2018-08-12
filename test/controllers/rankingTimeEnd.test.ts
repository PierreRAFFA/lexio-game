import controller from '../../src/amqp/controllers/rankingTimeEnd';

it("the controller should exist", () => {
  expect(controller).toBeDefined();
});

describe('the controller process', () => {
  it("should return a boolean", () => {
    return expect(controller.process({})).resolves.toBe(true);
  });
});