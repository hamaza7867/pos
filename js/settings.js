// Settings Module
const settingsModule = {
  settings: {},

  async init() {
    const savedSettings = await window.db.get('settings', 'appSettings');
    this.settings = savedSettings || {};
  },

  async render(container) {
    await this.init();

    container.innerHTML = `
      <div class="settings-page">
        <h1 class="mb-lg">Settings</h1>
        
        <div class="card">
          ${components.createTabs([
      { label: '🏪 Store Info', content: this.renderStoreSettings() },
      { label: '💰 Tax & Pricing', content: this.renderTaxSettings() },
      { label: '🧾 Receipt Settings', content: this.renderReceiptSettings() },
      { label: '💾 Backup & Data', content: this.renderDataSettings() },
      { label: '⚙️ General', content: this.renderGeneralSettings() }
    ])}
        </div>
      </div>
    `;

    // Initialize tabs
    const tabsContainer = container.querySelector('.tabs');
    if (tabsContainer) {
      components.initTabs(tabsContainer);
    }
  },

  renderStoreSettings() {
    return `
      <form id="storeSettingsForm">
        ${components.createFormField({
      type: 'text',
      name: 'storeName',
      label: 'Store Name',
      value: this.settings.storeName || '',
      required: true,
      placeholder: 'My Store'
    })}
        
        ${components.createFormField({
      type: 'textarea',
      name: 'storeAddress',
      label: 'Store Address',
      value: this.settings.storeAddress || '',
      placeholder: 'Enter your store address'
    })}
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'tel',
      name: 'storePhone',
      label: 'Phone',
      value: this.settings.storePhone || '',
      placeholder: '+1234567890'
    })}
          
          ${components.createFormField({
      type: 'email',
      name: 'storeEmail',
      label: 'Email',
      value: this.settings.storeEmail || '',
      placeholder: 'store@example.com'
    })}
        </div>
        
        <button type="button" class="btn btn-primary" onclick="settingsModule.saveStoreSettings()">
          Save Store Info
        </button>
      </form>
    `;
  },

  renderTaxSettings() {
    return `
      <form id="taxSettingsForm">
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'text',
      name: 'currencySymbol',
      label: 'Currency Symbol',
      value: this.settings.currencySymbol || '$',
      required: true
    })}
          
          ${components.createFormField({
      type: 'text',
      name: 'currencyCode',
      label: 'Currency Code',
      value: this.settings.currencyCode || 'USD',
      required: true,
      placeholder: 'USD, EUR, INR, etc.'
    })}
        </div>
        
        ${components.createFormField({
      type: 'number',
      name: 'decimalPlaces',
      label: 'Decimal Places',
      value: this.settings.decimalPlaces || 2,
      required: true,
      hint: 'Number of decimal places for prices'
    })}
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'text',
      name: 'taxName',
      label: 'Tax Name',
      value: this.settings.taxName || 'GST',
      placeholder: 'GST, VAT, Sales Tax, etc.'
    })}
          
          ${components.createFormField({
      type: 'number',
      name: 'taxRate',
      label: 'Default Tax Rate (%)',
      value: this.settings.taxRate || 0,
      placeholder: '0'
    })}
        </div>
        
        <button type="button" class="btn btn-primary" onclick="settingsModule.saveTaxSettings()">
          Save Tax Settings
        </button>
      </form>
    `;
  },

  renderReceiptSettings() {
    return `
      <form id="receiptSettingsForm">
        ${components.createFormField({
      type: 'textarea',
      name: 'receiptHeader',
      label: 'Receipt Header',
      value: this.settings.receiptHeader || '',
      placeholder: 'Text to appear at the top of receipts (optional)',
      hint: 'Leave empty to use store name'
    })}
        
        ${components.createFormField({
      type: 'textarea',
      name: 'receiptFooter',
      label: 'Receipt Footer',
      value: this.settings.receiptFooter || 'Thank you for your business!',
      placeholder: 'Thank you message or terms'
    })}
        
        ${components.createFormField({
      type: 'select',
      name: 'defaultReceiptTemplate',
      label: 'Default Receipt Template',
      value: this.settings.defaultReceiptTemplate || 'thermal-80-standard',
      options: [
        { value: 'thermal-58-minimal', label: 'Thermal 58mm - Minimal' },
        { value: 'thermal-80-standard', label: 'Thermal 80mm - Standard' },
        { value: 'thermal-80-detailed', label: 'Thermal 80mm - Detailed' },
        { value: 'a4-invoice', label: 'A4 - Invoice' },
        { value: 'a4-formal', label: 'A4 - Formal' }
      ]
    })}
        
        <button type="button" class="btn btn-primary" onclick="settingsModule.saveReceiptSettings()">
          Save Receipt Settings
        </button>
        
        <div class="mt-lg">
          <button type="button" class="btn btn-outline" onclick="navigateTo('receipt-editor')">
            🎨 Customize Receipt Templates
          </button>
        </div>
      </form>
    `;
  },

  renderDataSettings() {
    return `
      <div class="data-settings">
        <h3 class="mb-md">Data Management</h3>
        <p class="text-secondary mb-lg">
          Export and import your data. You can export/import all data at once or individual data types.
        </p>
        
        <!-- Individual Data Export/Import -->
        <div class="card mb-lg">
          <div class="card-header">
            <h4>Individual Data Types</h4>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 gap-md">
              
              <!-- Products -->
              <div class="flex justify-between items-center p-md" style="border: 1px solid var(--border); border-radius: 8px;">
                <div>
                  <h5 class="mb-sm">📦 Products</h5>
                  <p class="text-sm text-secondary">Export or import product inventory</p>
                </div>
                <div class="flex gap-sm">
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('products', 'json')">
                    JSON
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('products', 'csv')">
                    CSV
                  </button>
                  <button class="btn btn-sm btn-primary" onclick="settingsModule.importDataType('products')">
                    Import
                  </button>
                </div>
              </div>
              
              <!-- Customers -->
              <div class="flex justify-between items-center p-md" style="border: 1px solid var(--border); border-radius: 8px;">
                <div>
                  <h5 class="mb-sm">👥 Customers</h5>
                  <p class="text-sm text-secondary">Export or import customer database</p>
                </div>
                <div class="flex gap-sm">
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('customers', 'json')">
                    JSON
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('customers', 'csv')">
                    CSV
                  </button>
                  <button class="btn btn-sm btn-primary" onclick="settingsModule.importDataType('customers')">
                    Import
                  </button>
                </div>
              </div>
              
              <!-- Sales -->
              <div class="flex justify-between items-center p-md" style="border: 1px solid var(--border); border-radius: 8px;">
                <div>
                  <h5 class="mb-sm">🛒 Sales History</h5>
                  <p class="text-sm text-secondary">Export sales transactions</p>
                </div>
                <div class="flex gap-sm">
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('sales', 'json')">
                    JSON
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('sales', 'csv')">
                    CSV
                  </button>
                  <button class="btn btn-sm btn-primary" onclick="settingsModule.importDataType('sales')">
                    Import
                  </button>
                </div>
              </div>
              
              <!-- Categories -->
              <div class="flex justify-between items-center p-md" style="border: 1px solid var(--border); border-radius: 8px;">
                <div>
                  <h5 class="mb-sm">🏷️ Categories</h5>
                  <p class="text-sm text-secondary">Export or import product categories</p>
                </div>
                <div class="flex gap-sm">
                  <button class="btn btn-sm btn-outline" onclick="settingsModule.exportDataType('categories', 'json')">
                    JSON
                  </button>
                  <button class="btn btn-sm btn-primary" onclick="settingsModule.importDataType('categories')">
                    Import
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Bulk Operations -->
        <h3 class="mb-md">Bulk Operations</h3>
        <div class="grid grid-cols-1 grid-lg-cols-2 gap-md mb-lg">
          <div class="card">
            <div class="card-body">
              <h4 class="mb-sm">📥 Export All Data</h4>
              <p class="text-sm text-secondary mb-md">
                Download all your products, customers, sales, and settings in a single file.
              </p>
              <button class="btn btn-primary" onclick="settingsModule.exportAllData()">
                Export Complete Backup
              </button>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body">
              <h4 class="mb-sm">📤 Import All Data</h4>
              <p class="text-sm text-secondary mb-md">
                Restore data from a previous complete backup file.
              </p>
              <input type="file" id="importDataFile" accept=".json" class="form-input mb-sm">
              <button class="btn btn-warning" onclick="settingsModule.importAllData()">
                Import Complete Backup
              </button>
            </div>
          </div>
        </div>
        
        <div class="card" style="border-color: var(--error);">
          <div class="card-body">
            <h4 class="mb-sm" style="color: var(--error);">⚠️ Danger Zone</h4>
            <p class="text-sm text-secondary mb-md">
              Clear all data from the application. This action cannot be undone!
            </p>
            <button class="btn btn-error" onclick="settingsModule.clearAllData()">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderGeneralSettings() {
    return `
      <form id="generalSettingsForm">
        ${components.createFormField({
      type: 'number',
      name: 'lowStockThreshold',
      label: 'Low Stock Threshold',
      value: this.settings.lowStockThreshold || 10,
      required: true,
      hint: 'Alert when product stock falls below this number'
    })}
        
        ${components.createFormField({
      type: 'select',
      name: 'theme',
      label: 'Theme',
      value: this.settings.theme || 'light',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
      ]
    })}
        
        <button type="button" class="btn btn-primary" onclick="settingsModule.saveGeneralSettings()">
          Save General Settings
        </button>
      </form>
      
      <div class="mt-lg">
        <h3 class="mb-md">About</h3>
        <p class="text-secondary">
          <strong>Universal POS</strong> - Version 1.0.0<br>
          Complete offline point of sale software for all types of stores.<br>
          Built with ❤️ using modern web technologies.
        </p>
      </div>
    `;
  },

  async saveStoreSettings() {
    const form = document.getElementById('storeSettingsForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    this.settings.storeName = formData.get('storeName');
    this.settings.storeAddress = formData.get('storeAddress');
    this.settings.storePhone = formData.get('storePhone');
    this.settings.storeEmail = formData.get('storeEmail');

    await this.saveSettings();
  },

  async saveTaxSettings() {
    const form = document.getElementById('taxSettingsForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    this.settings.currencySymbol = formData.get('currencySymbol');
    this.settings.currencyCode = formData.get('currencyCode');
    this.settings.decimalPlaces = parseInt(formData.get('decimalPlaces'));
    this.settings.taxName = formData.get('taxName');
    this.settings.taxRate = parseFloat(formData.get('taxRate'));

    await this.saveSettings();
  },

  async saveReceiptSettings() {
    const form = document.getElementById('receiptSettingsForm');
    const formData = new FormData(form);

    this.settings.receiptHeader = formData.get('receiptHeader');
    this.settings.receiptFooter = formData.get('receiptFooter');
    this.settings.defaultReceiptTemplate = formData.get('defaultReceiptTemplate');

    await this.saveSettings();
  },

  async saveGeneralSettings() {
    const form = document.getElementById('generalSettingsForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    this.settings.lowStockThreshold = parseInt(formData.get('lowStockThreshold'));
    this.settings.theme = formData.get('theme');

    // Apply theme
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    window.app.updateThemeIcon(this.settings.theme);

    await this.saveSettings();
  },

  async saveSettings() {
    try {
      this.settings.key = 'appSettings';
      this.settings.updatedAt = new Date().toISOString();

      await window.db.update('settings', this.settings);
      utils.storage.set('appSettings', this.settings);

      utils.showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      utils.showToast('Error saving settings', 'error');
    }
  },

  // Individual data type export
  async exportDataType(dataType, format = 'json') {
    try {
      const data = await window.db.getAll(dataType);

      if (data.length === 0) {
        utils.showToast(`No ${dataType} to export`, 'warning');
        return;
      }

      const date = new Date().toISOString().split('T')[0];

      if (format === 'csv') {
        const filename = `${dataType}_${date}.csv`;
        utils.exportToCSV(data, filename);
      } else {
        const filename = `${dataType}_${date}.json`;
        utils.exportToJSON(data, filename);
      }

      utils.showToast(`${dataType} exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error(`Error exporting ${dataType}:`, error);
      utils.showToast(`Error exporting ${dataType}`, 'error');
    }
  },

  // Individual data type import
  importDataType(dataType) {
    const modalContent = `
          <div class="form-group">
            <label class="form-label">Select JSON file to import ${dataType}</label>
            <input type="file" class="form-input" id="importTypeFile" accept=".json">
            <div class="form-hint">File should contain an array of ${dataType} objects</div>
          </div>
        `;

    const modalFooter = `
          <button class="btn btn-ghost" onclick="components.closeModal('importTypeModal')">Cancel</button>
          <button class="btn btn-primary" onclick="settingsModule.processDataTypeImport('${dataType}')">Import</button>
        `;

    const modalId = components.createModal(`Import ${dataType}`, modalContent, modalFooter);
    document.getElementById(modalId).id = 'importTypeModal';
  },

  async processDataTypeImport(dataType) {
    const fileInput = document.getElementById('importTypeFile');
    const file = fileInput.files[0];

    if (!file) {
      utils.showToast('Please select a file', 'warning');
      return;
    }

    utils.importJSON(file, async (data) => {
      try {
        if (!Array.isArray(data)) {
          utils.showToast('Invalid file format', 'error');
          return;
        }

        components.showLoader(`Importing ${dataType}...`);

        for (const item of data) {
          delete item.id; // Remove ID to create new items
          await window.db.add(dataType, item);
        }

        components.hideLoader();
        utils.showToast(`${data.length} ${dataType} imported successfully`, 'success');
        components.closeModal('importTypeModal');

        // Reload page to refresh data
        setTimeout(() => window.location.reload(), 1000);

      } catch (error) {
        console.error(`Error importing ${dataType}:`, error);
        components.hideLoader();
        utils.showToast(`Error importing ${dataType}`, 'error');
      }
    });
  },

  async exportAllData() {
    try {
      const data = {
        products: await window.db.getAll('products'),
        customers: await window.db.getAll('customers'),
        sales: await window.db.getAll('sales'),
        categories: await window.db.getAll('categories'),
        settings: await window.db.getAll('settings'),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      const filename = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
      utils.exportToJSON(data, filename);
      utils.showToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      utils.showToast('Error exporting data', 'error');
    }
  },

  async importAllData() {
    const fileInput = document.getElementById('importDataFile');
    const file = fileInput.files[0];

    if (!file) {
      utils.showToast('Please select a file', 'warning');
      return;
    }

    utils.confirm(
      'This will replace all existing data. Are you sure?',
      () => {
        utils.importJSON(file, async (data) => {
          try {
            components.showLoader('Importing data...');

            // Clear existing data
            await window.db.clear('products');
            await window.db.clear('customers');
            await window.db.clear('sales');
            await window.db.clear('categories');

            // Import new data
            for (const product of data.products || []) {
              await window.db.add('products', product);
            }
            for (const customer of data.customers || []) {
              await window.db.add('customers', customer);
            }
            for (const sale of data.sales || []) {
              await window.db.add('sales', sale);
            }
            for (const category of data.categories || []) {
              await window.db.add('categories', category);
            }

            components.hideLoader();
            utils.showToast('Data imported successfully', 'success');

            // Reload page
            setTimeout(() => window.location.reload(), 1000);

          } catch (error) {
            console.error('Error importing data:', error);
            components.hideLoader();
            utils.showToast('Error importing data', 'error');
          }
        });
      }
    );
  },

  clearAllData() {
    utils.confirm(
      'Are you absolutely sure? This will delete ALL data including products, customers, and sales. This cannot be undone!',
      async () => {
        try {
          components.showLoader('Clearing data...');

          await window.db.clear('products');
          await window.db.clear('customers');
          await window.db.clear('sales');
          await window.db.clear('categories');

          components.hideLoader();
          utils.showToast('All data cleared', 'success');

          // Reload page
          setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
          console.error('Error clearing data:', error);
          components.hideLoader();
          utils.showToast('Error clearing data', 'error');
        }
      }
    );
  }
};

// Export module
window.settingsModule = settingsModule;
