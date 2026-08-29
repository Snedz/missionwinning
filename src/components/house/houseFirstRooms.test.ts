import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getHouseFirstRooms, summarizeHouseFirstRooms } from './houseFirstRooms';

test('house first rooms are three MW rows — history stays visible and locked until a finish', () => {
  const rooms = getHouseFirstRooms({
    loggedSet: false,
    weekOpened: false,
    historyOpened: false,
    hasFinish: false,
  });
  assert.deepEqual(
    rooms.map((row) => row.key),
    ['log-set', 'open-week', 'open-history']
  );
  assert.equal(rooms[0]!.kind, 'compose');
  assert.equal(rooms[0]!.href, '/active');
  assert.equal(rooms[1]!.kind, 'pane');
  assert.equal(rooms[1]!.href, '/log#today-week');
  assert.equal(rooms[2]!.kind, 'navigate');
  assert.equal(rooms[2]!.href, '/history');
  assert.equal(rooms[2]!.locked, true);
  assert.equal(rooms[2]!.done, false);
  assert.match(rooms[2]!.lockWhy ?? '', /Finish a session first/);
  assert.equal(summarizeHouseFirstRooms(rooms).done, 0);
});

test('visiting the week ticks that row; History ticks only after a finish plus a visit', () => {
  const afterWeek = getHouseFirstRooms({
    loggedSet: true,
    weekOpened: true,
    historyOpened: false,
    hasFinish: true,
  });
  assert.equal(afterWeek[0]!.done, true);
  assert.equal(afterWeek[1]!.done, true);
  assert.equal(afterWeek[2]!.locked, false);
  assert.equal(afterWeek[2]!.done, false);

  const afterHistory = getHouseFirstRooms({
    loggedSet: true,
    weekOpened: true,
    historyOpened: true,
    hasFinish: true,
  });
  assert.equal(summarizeHouseFirstRooms(afterHistory).complete, true);
});

test('a History visit without a finish does not tick or unlock', () => {
  const rooms = getHouseFirstRooms({
    loggedSet: false,
    weekOpened: false,
    historyOpened: true,
    hasFinish: false,
  });
  assert.equal(rooms[2]!.done, false);
  assert.equal(rooms[2]!.locked, true);
});
