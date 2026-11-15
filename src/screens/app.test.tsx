import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('../ads/ads', () => ({
  initialiseAds: jest.fn(async () => undefined),
  showRewardedAd: jest.fn(async () => 'unavailable'),
}));

import App from '../../App';
import { GameScreen } from './GameScreen';
import { createEconomy } from '../state/economy';
import { createGame } from '../state/gameReducer';

const noop = () => undefined;
const GIVENS = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'
  .split('')
  .map(Number);
const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
  .split('')
  .map(Number);

async function render(element: React.ReactElement): Promise<ReactTestRenderer> {
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(element);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree;
}

function labelCount(tree: ReactTestRenderer, label: string): number {
  return tree.root.findAll(
    (node) => typeof node.type === 'string' && node.props.accessibilityLabel === label,
  ).length;
}

describe('app smoke test', () => {
  it('opens straight on the five-difficulty list with a sound toggle', async () => {
    const tree = await render(<App />);
    for (const label of [
      'Beginner',
      'Easy',
      'Medium',
      'Hard',
      'Expert',
    ]) {
      expect(labelCount(tree, label)).toBeGreaterThan(0);
    }
    await act(async () => tree.unmount());
  });

  it('renders the board and toolbar without an on-screen keypad', async () => {
    const state = createGame({ difficulty: 'easy', givens: GIVENS, solution: SOLUTION });
    const tree = await render(
      <GameScreen
        state={state}
        dispatch={noop}
        economy={createEconomy()}
        onEconomyChange={noop}
        onExit={noop}
        onStartNewGame={noop}
      />,
    );

    const cells = tree.root.findAll(
      (node) =>
        typeof node.type === 'string' &&
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Row '),
    );
    expect(cells).toHaveLength(81);

    for (const label of ['Back', 'Notes', 'Hint', 'Check', 'Pause']) {
      expect(labelCount(tree, label)).toBeGreaterThan(0);
    }
    expect(labelCount(tree, 'Number entry')).toBe(1);
    expect(labelCount(tree, 'Enter 5')).toBe(0);
    expect(labelCount(tree, 'Undo')).toBe(0);
    expect(labelCount(tree, 'Erase')).toBe(0);

    await act(async () => tree.unmount());
  });
});
