<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingsStore } from '@/stores/settings';
import { getSettings, validateKeyBinding, findDuplicateKeyBindings } from '@/common/funcs';
import { keyBindingsMeta, categoryLabels, type KeyBindingCategory } from '@/common/type';

const settingsStore = useSettingsStore();

// Local state for key bindings
const localKeyBindings = ref<Record<string, string | string[]>>({});
const disabledKeys = ref<string[]>([]);
const editingKey = ref<string | null>(null);
const editingBindingIndex = ref<number>(-1);
const editingValue = ref('');
const hasChanges = ref(false);
const showHelp = ref(false);

// Group key bindings by category
const groupedKeyBindings = computed(() => {
  const groups: Record<KeyBindingCategory, typeof keyBindingsMeta> = {
    navigation: [],
    editing: [],
    block: [],
    search: [],
    mark: [],
    visual: [],
    command: [],
  };

  keyBindingsMeta.forEach((meta) => {
    groups[meta.category as KeyBindingCategory].push(meta);
  });

  return groups;
});

// Load settings
const loadSettings = () => {
  const settings = getSettings();
  localKeyBindings.value = JSON.parse(JSON.stringify(settings.keyBindings));
  disabledKeys.value = [...(settings.disabledKeyBindings || [])];
  hasChanges.value = false;
};

onMounted(() => {
  loadSettings();
});

// Handle enable/disable toggle
const handleToggle = (key: string, enabled: boolean) => {
  if (enabled) {
    disabledKeys.value = disabledKeys.value.filter((k) => k !== key);
  } else {
    if (!disabledKeys.value.includes(key)) {
      disabledKeys.value.push(key);
    }
  }
  hasChanges.value = true;
};

// Check if a key is enabled
const isEnabled = (key: string) => {
  return !disabledKeys.value.includes(key);
};

// Get bindings as array
const getBindingsArray = (key: string): string[] => {
  const binding = localKeyBindings.value[key];
  return Array.isArray(binding) ? binding : [binding];
};

// Start editing a binding
const startEditing = (key: string, index: number) => {
  editingKey.value = key;
  editingBindingIndex.value = index;
  const bindings = getBindingsArray(key);
  editingValue.value = bindings[index] || '';
};

// Cancel editing
const cancelEditing = () => {
  editingKey.value = null;
  editingBindingIndex.value = -1;
  editingValue.value = '';
};

// Save edited binding
const saveBinding = (key: string, index: number) => {
  const trimmed = editingValue.value.trim();

  // Validate
  const validation = validateKeyBinding(trimmed);
  if (!validation.valid) {
    ElMessage.error(validation.error || 'Invalid key binding format');
    return;
  }

  const bindings = [...getBindingsArray(key)];
  bindings[index] = trimmed;

  // Update local state
  if (bindings.length === 1) {
    localKeyBindings.value[key] = bindings[0];
  } else {
    localKeyBindings.value[key] = bindings;
  }

  hasChanges.value = true;
  cancelEditing();
};

// Add a new binding
const addBinding = (key: string) => {
  const bindings = [...getBindingsArray(key), ''];
  localKeyBindings.value[key] = bindings;
  hasChanges.value = true;

  // Start editing the new binding
  setTimeout(() => {
    startEditing(key, bindings.length - 1);
  }, 100);
};

// Remove a binding
const removeBinding = (key: string, index: number) => {
  let bindings = [...getBindingsArray(key)];

  if (bindings.length === 1) {
    ElMessage.warning('At least one key binding must be kept');
    return;
  }

  bindings.splice(index, 1);

  if (bindings.length === 1) {
    localKeyBindings.value[key] = bindings[0];
  } else {
    localKeyBindings.value[key] = bindings;
  }

  hasChanges.value = true;
};

// Reset to default
const resetToDefault = (key: string) => {
  const meta = keyBindingsMeta.find((m) => m.key === key);
  if (meta) {
    localKeyBindings.value[key] = JSON.parse(JSON.stringify(meta.defaultBinding));
    hasChanges.value = true;
    ElMessage.success('Reset to default key binding');
  }
};

// Check for duplicates
const checkDuplicates = (): { key1: string; key2: string; binding: string }[] => {
  // Only check enabled key bindings
  const enabledBindings: Record<string, string | string[]> = {};
  Object.entries(localKeyBindings.value).forEach(([key, value]) => {
    if (isEnabled(key)) {
      enabledBindings[key] = value;
    }
  });

  return findDuplicateKeyBindings(enabledBindings);
};

// Save settings
const saveSettings = async () => {
  // Check for duplicates
  const duplicates = checkDuplicates();

  if (duplicates.length > 0) {
    const duplicateMessages = duplicates
      .map((d) => {
        const meta1 = keyBindingsMeta.find((m) => m.key === d.key1);
        const meta2 = keyBindingsMeta.find((m) => m.key === d.key2);
        return `"${d.binding}" - ${meta1?.label || d.key1} and ${meta2?.label || d.key2}`;
      })
      .join('\n');

    ElMessage.warning({
      message: `Duplicate key bindings detected:\n${duplicateMessages}`,
      duration: 5000,
      showClose: true,
    });
    return;
  }

  // Save to logseq settings - merge with existing settings
  // Convert proxy objects to plain objects/arrays to ensure proper serialization
  const currentSettings = logseq.settings || {};
  const plainKeyBindings = JSON.parse(JSON.stringify(localKeyBindings.value));
  const plainDisabledKeys = JSON.parse(JSON.stringify(disabledKeys.value));

  console.log('Saving settings:', {
    ...currentSettings,
    keyBindings: plainKeyBindings,
    disabledKeyBindings: plainDisabledKeys,
  });

  await logseq.updateSettings({
    ...currentSettings,
    keyBindings: plainKeyBindings,
    disabledKeyBindings: plainDisabledKeys,
  });

  hasChanges.value = false;
  ElMessage.success('Settings saved');

  // Prompt to restart
  ElMessageBox.confirm(
    'Key binding settings have been saved, but require a plugin restart to take effect. Restart the plugin now?',
    'Notice',
    {
      confirmButtonText: 'Restart Plugin',
      cancelButtonText: 'Restart Later',
      type: 'info',
    }
  )
    .then(async () => {
      // Reload the plugin
      await logseq.App.relaunch();
    })
    .catch(() => {
      ElMessage.info('You can manually restart the plugin later to apply the new key binding settings');
    });
};

// Cancel changes
const cancelChanges = () => {
  if (hasChanges.value) {
    ElMessageBox.confirm('You have unsaved changes. Are you sure you want to cancel?', 'Notice', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
      .then(() => {
        loadSettings();
        settingsStore.hide();
      })
      .catch(() => {
        // Do nothing
      });
  } else {
    settingsStore.hide();
  }
};

// Get label for a key
const getLabel = (key: string): string => {
  const meta = keyBindingsMeta.find((m) => m.key === key);
  return meta?.label || key;
};

// Get description for a key
const getDescription = (key: string): string => {
  const meta = keyBindingsMeta.find((m) => m.key === key);
  return meta?.description || '';
};

// Close help dialog
const closeHelp = () => {
  showHelp.value = false;
};
</script>

<template>
  <div v-show="settingsStore.visible">
    <el-dialog
      v-model="settingsStore.visible"
      title="Plugin Settings"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
      @close="cancelChanges"
      class="settings-dialog"
    >
      <el-tabs v-model="settingsStore.activeTab">
        <el-tab-pane label="Key Bindings" name="keybindings">
          <div class="settings-header">
            <div class="settings-description">
              <p>Configure key bindings. Supports multiple key bindings per action. Format examples: <code>shift+c</code>, <code>mod+shift+a</code>, <code>g u</code></p>
              <p>Note: <code>mod</code> means <code>Command</code> on Mac, <code>Ctrl</code> on Windows/Linux</p>
            </div>
            <el-button type="info" size="small" @click="showHelp = true">
              Help
            </el-button>
          </div>

          <div class="keybindings-container">
            <div
              v-for="(category, categoryKey) in groupedKeyBindings"
              :key="categoryKey"
              class="category-section"
            >
              <h3 class="category-title">{{ categoryLabels[categoryKey as KeyBindingCategory] }}</h3>

              <div
                v-for="meta in category"
                :key="meta.key"
                class="keybinding-item"
                :class="{ disabled: !isEnabled(meta.key) }"
              >
                <div class="keybinding-header">
                  <el-checkbox
                    :model-value="isEnabled(meta.key)"
                    @change="(val) => handleToggle(meta.key, val as boolean)"
                  />
                  <div class="keybinding-info">
                    <div class="keybinding-label">{{ meta.label }}</div>
                    <div class="keybinding-description">{{ meta.description }}</div>
                  </div>
                </div>

                <div class="keybinding-bindings">
                  <div
                    v-for="(binding, index) in getBindingsArray(meta.key)"
                    :key="index"
                    class="binding-item"
                  >
                    <el-input
                      v-if="editingKey === meta.key && editingBindingIndex === index"
                      v-model="editingValue"
                      size="small"
                      class="binding-input"
                      @keyup.enter="saveBinding(meta.key, index)"
                      @keyup.esc="cancelEditing"
                    >
                      <template #append>
                        <el-button @click="saveBinding(meta.key, index)" type="primary" size="small">
                          Save
                        </el-button>
                        <el-button @click="cancelEditing" size="small">Cancel</el-button>
                      </template>
                    </el-input>

                    <div v-else class="binding-display">
                      <el-tag class="binding-tag">{{ binding }}</el-tag>
                      <div class="binding-actions">
                        <el-button
                          size="small"
                          type="text"
                          @click="startEditing(meta.key, index)"
                        >
                          Edit
                        </el-button>
                        <el-button
                          v-if="getBindingsArray(meta.key).length > 1"
                          size="small"
                          type="text"
                          @click="removeBinding(meta.key, index)"
                        >
                          Remove
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <div class="binding-controls">
                    <el-button size="small" type="text" @click="addBinding(meta.key)">
                      + Add Key Binding
                    </el-button>
                    <el-button size="small" type="text" @click="resetToDefault(meta.key)">
                      Reset to Default
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <span v-if="hasChanges" class="changes-indicator">Unsaved changes</span>
          <el-button @click="cancelChanges">Cancel</el-button>
          <el-button type="primary" @click="saveSettings" :disabled="!hasChanges">
            Save Settings
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Help Dialog -->
    <el-dialog
      v-model="showHelp"
      title="Key Binding Settings Help"
      width="60%"
      top="10vh"
      class="help-dialog"
    >
      <div class="help-content">
        <h3>Key Binding Format</h3>
        <p>Key bindings support the following formats:</p>
        <ul>
          <li><strong>Single key:</strong> <code>j</code>, <code>k</code>, <code>h</code>, <code>l</code></li>
          <li><strong>Combination keys:</strong> <code>shift+j</code>, <code>ctrl+r</code>, <code>mod+shift+a</code></li>
          <li><strong>Sequential keys:</strong> <code>g u</code>, <code>d d</code>, <code>z c</code></li>
        </ul>

        <h3>Modifier Keys</h3>
        <ul>
          <li><code>mod</code> - Command (⌘) on Mac, Ctrl on Windows/Linux</li>
          <li><code>shift</code> - Shift key</li>
          <li><code>ctrl</code> - Control key</li>
          <li><code>alt</code> - Alt/Option key</li>
        </ul>

        <h3>Usage Instructions</h3>
        <ol>
          <li><strong>Enable/Disable:</strong> Use the checkbox to enable or disable a key binding</li>
          <li><strong>Multiple Key Bindings:</strong> Each action can have multiple key bindings - click "Add Key Binding" to add more</li>
          <li><strong>Edit Key Binding:</strong> Click the "Edit" button to modify a key binding. Press Enter to save, Esc to cancel</li>
          <li><strong>Remove Key Binding:</strong> When multiple key bindings exist, you can remove any of them</li>
          <li><strong>Reset to Default:</strong> Click "Reset to Default" to restore the default key binding</li>
          <li><strong>Save Settings:</strong> After making changes, click "Save Settings" and restart the plugin for changes to take effect</li>
        </ol>

        <h3>Important Notes</h3>
        <ul>
          <li>Duplicate key bindings will be detected automatically before saving</li>
          <li>At least one key binding must be kept for each action</li>
          <li>Changes require a plugin restart to take effect</li>
          <li>Invalid key binding formats will be rejected with error messages</li>
        </ul>
      </div>

      <template #footer>
        <el-button type="primary" @click="closeHelp">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Dialog height management */
:deep(.settings-dialog) {
  max-height: 90vh;
  overflow: auto;
}

:deep(.settings-dialog .el-dialog) {
  max-height: 90vh;
  overflow: auto;
  margin: 0 auto !important;
  display: flex;
  flex-direction: column;
}

:deep(.settings-dialog .el-dialog__header) {
  flex-shrink: 0;
}

:deep(.settings-dialog .el-dialog__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 0 20px;
}

:deep(.settings-dialog .el-dialog__footer) {
  flex-shrink: 0;
  padding: 15px 20px 20px 20px;
}

:deep(.settings-dialog .el-tabs) {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

:deep(.settings-dialog .el-tabs__header) {
  flex-shrink: 0;
}

:deep(.settings-dialog .el-tabs__content) {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

:deep(.settings-dialog .el-tab-pane) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ls-border-color);
  flex-shrink: 0;
}

.settings-description {
  flex: 1;
}

.settings-description p {
  margin: 4px 0;
  color: var(--ls-secondary-text-color);
  font-size: 14px;
}

.settings-description code {
  background: var(--ls-secondary-background-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.keybindings-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  min-height: 0;
}

.category-section {
  margin-bottom: 32px;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--ls-primary-text-color);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ls-border-color);
}

.keybinding-item {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--ls-border-color);
  border-radius: 6px;
  background: var(--ls-primary-background-color);
  transition: all 0.2s;
}

.keybinding-item:hover {
  border-color: var(--ls-link-text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.keybinding-item.disabled {
  opacity: 0.6;
  background: var(--ls-secondary-background-color);
}

.keybinding-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.keybinding-info {
  flex: 1;
}

.keybinding-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ls-primary-text-color);
  margin-bottom: 4px;
}

.keybinding-description {
  font-size: 13px;
  color: var(--ls-secondary-text-color);
}

.keybinding-bindings {
  padding-left: 32px;
}

.binding-item {
  margin-bottom: 8px;
}

.binding-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.binding-tag {
  font-family: monospace;
  font-size: 13px;
}

.binding-actions {
  display: flex;
  gap: 4px;
}

.binding-input {
  max-width: 400px;
}

.binding-controls {
  margin-top: 8px;
  display: flex;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.changes-indicator {
  color: var(--ls-link-text-color);
  font-size: 13px;
  font-weight: 500;
}

/* Help Dialog */
:deep(.help-dialog) {
  max-height: 80vh;
}

:deep(.help-dialog .el-dialog) {
  max-height: 80vh;
  margin: 0 auto !important;
  display: flex;
  flex-direction: column;
}

:deep(.help-dialog .el-dialog__body) {
  overflow-y: auto;
  overflow-x: hidden;
}

.help-content {
  padding: 0 4px;
}

.help-content h3 {
  margin-top: 20px;
  margin-bottom: 12px;
  font-size: 16px;
  color: var(--ls-primary-text-color);
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin-bottom: 12px;
  color: var(--ls-primary-text-color);
}

.help-content ul,
.help-content ol {
  padding-left: 24px;
  margin-bottom: 16px;
}

.help-content li {
  margin-bottom: 8px;
  color: var(--ls-primary-text-color);
}

.help-content code {
  background: var(--ls-secondary-background-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.help-content strong {
  font-weight: 600;
  color: var(--ls-primary-text-color);
}
</style>
