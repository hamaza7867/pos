// Customers Management Module
const customersModule = {
  customers: [],
  currentCustomer: null,
  searchTerm: '',

  async init() {
    await this.loadCustomers();
  },

  async loadCustomers() {
    this.customers = await window.db.getAll('customers');
  },

  async render(container) {
    await this.init();

    container.innerHTML = `
      <div class="customers-page">
        <div class="page-header flex justify-between items-center mb-lg">
          <h1>Customers</h1>
          <div class="flex gap-sm">
            <button class="btn btn-primary" onclick="customersModule.showAddCustomerModal()">
              ➕ Add Customer
            </button>
            <button class="btn btn-outline" onclick="customersModule.showExportOptions()">
              📥 Export
            </button>
          </div>
        </div>
        
        <!-- Search -->
        <div class="card mb-lg">
          <div class="card-body">
            <div class="grid grid-cols-1 grid-lg-cols-2 gap-md">
              <div class="form-group mb-0">
                <input type="text" 
                       class="form-input" 
                       id="customerSearch" 
                       placeholder="Search customers by name, phone, or email..."
                       onkeyup="customersModule.handleSearch(this.value)">
              </div>
              <div class="flex gap-sm">
                <button class="btn btn-outline" onclick="customersModule.exportCustomers()">
                  📥 Export
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Customers List -->
        <div id="customersContainer">
          ${this.renderCustomersList()}
        </div>
      </div>
    `;
  },

  renderCustomersList() {
    let filteredCustomers = this.customers;

    if (this.searchTerm) {
      filteredCustomers = utils.searchObjects(
        filteredCustomers,
        this.searchTerm,
        ['name', 'phone', 'email']
      );
    }

    if (filteredCustomers.length === 0) {
      return `
        <div class="card">
          <div class="card-body text-center">
            <p class="text-secondary">No customers found</p>
            <button class="btn btn-primary mt-md" onclick="customersModule.showAddCustomerModal()">
              Add Your First Customer
            </button>
          </div>
        </div>
      `;
    }

    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'totalPurchases', label: 'Total Purchases', format: (val) => utils.formatCurrency(val || 0) }
    ];

    const actions = [
      { label: '👁️', className: 'btn-ghost', onClick: 'customersModule.viewCustomer' },
      { label: '✏️', className: 'btn-primary', onClick: 'customersModule.showEditCustomerModal' },
      { label: '🗑️', className: 'btn-error', onClick: 'customersModule.deleteCustomer' }
    ];

    return components.createTable(headers, filteredCustomers, { actions });
  },

  handleSearch(term) {
    this.searchTerm = term;
    this.refreshCustomersList();
  },

  refreshCustomersList() {
    const container = document.getElementById('customersContainer');
    if (container) {
      container.innerHTML = this.renderCustomersList();
    }
  },

  showAddCustomerModal() {
    const modalContent = this.renderCustomerForm();
    const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('customerModal')">Cancel</button>
      <button class="btn btn-primary" onclick="customersModule.saveCustomer()">Save Customer</button>
    `;

    const modalId = components.createModal('Add Customer', modalContent, modalFooter);
    document.getElementById(modalId).id = 'customerModal';
  },

  async showEditCustomerModal(customerId) {
    this.currentCustomer = await window.db.get('customers', customerId);

    const modalContent = this.renderCustomerForm(this.currentCustomer);
    const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('customerModal')">Cancel</button>
      <button class="btn btn-primary" onclick="customersModule.saveCustomer()">Update Customer</button>
    `;

    const modalId = components.createModal('Edit Customer', modalContent, modalFooter);
    document.getElementById(modalId).id = 'customerModal';
  },

  renderCustomerForm(customer = {}) {
    return `
      <form id="customerForm">
        ${components.createFormField({
      type: 'text',
      name: 'name',
      label: 'Customer Name',
      value: customer.name || '',
      required: true,
      placeholder: 'Enter customer name'
    })}
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'tel',
      name: 'phone',
      label: 'Phone',
      value: customer.phone || '',
      required: true,
      placeholder: '+1234567890'
    })}
          
          ${components.createFormField({
      type: 'email',
      name: 'email',
      label: 'Email',
      value: customer.email || '',
      placeholder: 'customer@example.com'
    })}
        </div>
        
        ${components.createFormField({
      type: 'textarea',
      name: 'address',
      label: 'Address',
      value: customer.address || '',
      placeholder: 'Customer address (optional)'
    })}
        
        ${components.createFormField({
      type: 'text',
      name: 'notes',
      label: 'Notes',
      value: customer.notes || '',
      placeholder: 'Any additional notes (optional)'
    })}
      </form>
    `;
  },

  async saveCustomer() {
    const form = document.getElementById('customerForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const customerData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      notes: formData.get('notes'),
      totalPurchases: this.currentCustomer?.totalPurchases || 0,
      createdAt: this.currentCustomer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (this.currentCustomer) {
        customerData.id = this.currentCustomer.id;
        await window.db.update('customers', customerData);
        utils.showToast('Customer updated successfully', 'success');
      } else {
        await window.db.add('customers', customerData);
        utils.showToast('Customer added successfully', 'success');
      }

      components.closeModal('customerModal');
      this.currentCustomer = null;
      await this.loadCustomers();
      this.refreshCustomersList();

    } catch (error) {
      console.error('Error saving customer:', error);
      utils.showToast('Error saving customer', 'error');
    }
  },

  async deleteCustomer(customerId) {
    utils.confirm(
      'Are you sure you want to delete this customer?',
      async () => {
        try {
          await window.db.delete('customers', customerId);
          utils.showToast('Customer deleted successfully', 'success');
          await this.loadCustomers();
          this.refreshCustomersList();
        } catch (error) {
          console.error('Error deleting customer:', error);
          utils.showToast('Error deleting customer', 'error');
        }
      }
    );
  },

  async viewCustomer(customerId) {
    const customer = await window.db.get('customers', customerId);
    const sales = await window.db.getAllByIndex('sales', 'customerId', customerId);

    const modalContent = `
      <div class="customer-details">
        <div class="grid grid-cols-2 gap-md mb-lg">
          <div>
            <p class="text-sm text-secondary mb-sm"><strong>Name:</strong></p>
            <p>${customer.name}</p>
          </div>
          <div>
            <p class="text-sm text-secondary mb-sm"><strong>Phone:</strong></p>
            <p>${customer.phone}</p>
          </div>
          <div>
            <p class="text-sm text-secondary mb-sm"><strong>Email:</strong></p>
            <p>${customer.email || 'N/A'}</p>
          </div>
          <div>
            <p class="text-sm text-secondary mb-sm"><strong>Total Purchases:</strong></p>
            <p class="text-lg font-bold" style="color: var(--success);">${utils.formatCurrency(customer.totalPurchases || 0)}</p>
          </div>
        </div>
        
        ${customer.address ? `
          <div class="mb-lg">
            <p class="text-sm text-secondary mb-sm"><strong>Address:</strong></p>
            <p>${customer.address}</p>
          </div>
        ` : ''}
        
        <h3 class="mb-md">Purchase History</h3>
        ${sales.length > 0 ? `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${sales.map(sale => `
                  <tr>
                    <td>${utils.formatDate(sale.date, 'datetime')}</td>
                    <td>${sale.items.length}</td>
                    <td>${utils.formatCurrency(sale.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p class="text-center text-secondary">No purchases yet</p>'}
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-primary" onclick="components.closeModal('viewCustomerModal')">Close</button>
    `;

    const modalId = components.createModal(`Customer: ${customer.name}`, modalContent, modalFooter);
    document.getElementById(modalId).id = 'viewCustomerModal';
  },

  showExportOptions() {
    const modalContent = `
          <div class="form-group">
            <label class="form-label">Select Export Format</label>
            <p class="text-sm text-secondary mb-md">Choose the format for exporting ${this.customers.length} customers</p>
            <div class="flex gap-md">
              <button class="btn btn-primary" onclick="customersModule.exportCustomers('json')">
                📄 JSON Format
              </button>
              <button class="btn btn-primary" onclick="customersModule.exportCustomers('csv')">
                📊 CSV Format
              </button>
            </div>
          </div>
        `;

    const modalFooter = `
          <button class="btn btn-ghost" onclick="components.closeModal('exportModal')">Cancel</button>
        `;

    const modalId = components.createModal('Export Customers', modalContent, modalFooter);
    document.getElementById(modalId).id = 'exportModal';
  },

  async exportCustomers(format = 'json') {
    if (this.customers.length === 0) {
      utils.showToast('No customers to export', 'warning');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const filename = `customers_${date}.csv`;
      utils.exportToCSV(this.customers, filename);
    } else {
      const filename = `customers_${date}.json`;
      utils.exportToJSON(this.customers, filename);
    }

    components.closeModal('exportModal');
    utils.showToast(`Customers exported as ${format.toUpperCase()}`, 'success');
  }

};

// Export module
window.customersModule = customersModule;
