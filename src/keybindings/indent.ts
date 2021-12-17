import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin';
import { debug, getNumber, getSettings, resetNumber } from '../common/funcs';

export default (logseq: ILSPluginUser) => {
  const settings = getSettings();

  logseq.App.registerCommandPalette({
    key: 'vim-shortcut-indent',
    label: 'indent',
    keybinding: {
      mode: 'non-editing',
      binding: settings.indent
    }
  }, async () => {
    debug('Indent');


    const number = getNumber();
    resetNumber();
    console.log('number', number);

    for (let i = 0; i < number; i++) {
      console.log(i);
      try {
        // @ts-ignore
        await logseq.App.invokeExternalCommand('logseq.editor/indent');

      } catch(e){}
      // await logseq.Editor.exitEditingMode(true);
    }
  });
};
