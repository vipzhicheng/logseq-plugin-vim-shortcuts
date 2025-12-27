#!/bin/bash

# Script to update all keybinding files to use beforeActionExecute instead of isKeyBindingEnabled

KEYBINDINGS_DIR="../src/keybindings"

# Find all .ts files in keybindings directory
find "$KEYBINDINGS_DIR" -name "*.ts" -type f | while read -r file; do
  echo "Processing: $file"

  # Replace import statement: isKeyBindingEnabled -> beforeActionExecute
  # Also keep other imports on the same line
  sed -i.bak 's/isKeyBindingEnabled/beforeActionExecute/g' "$file"

  # Remove backup files
  rm -f "${file}.bak"

  echo "Updated: $file"
done

echo "All keybinding files have been updated!"
