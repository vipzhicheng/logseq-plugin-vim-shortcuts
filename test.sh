npm install -g pnpm
pnpm install
pnpm build
mv dist logseq-plugin-vim-shortcut
zip -r logseq-plugin-vim-shortcut.zip logseq-plugin-vim-shortcut
tar -cvzf logseq-plugin-vim-shortcut.tar.gz -C logseq-plugin-vim-shortcut .
