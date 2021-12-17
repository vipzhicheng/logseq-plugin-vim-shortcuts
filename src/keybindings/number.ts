import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, setNumber } from '../common/funcs';

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

      setNumber(n);
    });
  }
};
