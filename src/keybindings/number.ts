import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, setNumber, getNumber, resetNumber } from '@/common/funcs';
import { useSearchStore } from '@/stores/search';

export default (logseq: ILSPluginUser) => {
  for (let n of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    logseq.App.registerCommandPalette({
      key: `vim-shortcut-number-${n}`,
      label: `${n}`,
      keybinding: {
        mode: 'non-editing',
        binding: `${n}`
      }
    }, async () => {
      debug(`${n}`);

      // Special handling for 0: move to line start if no previous number
      if (n === 0) {
        const currentNumber = getNumber();
        // If current number is 1 (default), it means no number has been pressed yet
        if (currentNumber === 1) {
          // Execute line start logic
          const searchStore = useSearchStore();
          await searchStore.moveLineStart();
          return;
        }
      }

      setNumber(n);
    });
  }
};
