import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getCurrentBlockUUID, getNumber, getSettings, resetNumber } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-jump-internal-link',
    label: 'Jump into internal link',
    keybinding: {
      mode: 'global',
      binding: settings.jumpInto
    }
  }, async () => {
    debug('Jump into internal link');

    const number = getNumber();
    resetNumber();
    const block = await logseq.Editor.getCurrentBlock();
    if (block?.content) {
      if (/\[\[(.*?)\]\]|#([^ #]+?)/.test(block.content)) {
        const matchedAll = [...block.content.matchAll(/\[\[(.*?)\]\]|#([^ #]+?)/g)];

        if (matchedAll[number - 1]) {
          if (matchedAll[number - 1][0][0] === '#') {
            logseq.App.pushState('page', { name: matchedAll[number - 1][2] });
          } else {
            logseq.App.pushState('page', { name: matchedAll[number - 1][1] });
          }
        }
      }
    }
  });
};


