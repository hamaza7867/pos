// Reports Module
const reportsModule = {
    sales: [],
    products: [],
    customers: [],
    dateRange: 'today',

    async init() {
        this.sales = await window.db.getAll('sales');
        this.products = await window.db.getAll('products');
        this.customers = await window.db.getAll('customers');
    },

    async render(container) {
        await this.init();

        container.innerHTML = `
      <div class="reports-page">
        <h1 class="mb-lg">Reports & Analytics</h1>
        
        <!-- Date Range Filter -->
        <div class="card mb-lg">
          <div class="card-body">
            <div class="grid grid-cols-1 grid-lg-cols-4 gap-md">
              <button class="btn ${this.dateRange === 'today' ? 'btn-primary' : 'btn-outline'}" 
                      onclick="reportsModule.setDateRange('today')">
                Today
              </button>
              <button class="btn ${this.dateRange === 'week' ? 'btn-primary' : 'btn-outline'}" 
                      onclick="reportsModule.setDateRange('week')">
                This Week
              </button>
              <button class="btn ${this.dateRange === 'month' ? 'btn-primary' : 'btn-outline'}" 
                      onclick="reportsModule.setDateRange('month')">
                This Month
              </button>
              <button class="btn ${this.dateRange === 'year' ? 'btn-primary' : 'btn-outline'}" 
                      onclick="reportsModule.setDateRange('year')">
                This Year
              </button>
            </div>
          </div>
        </div>
        
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 grid-lg-cols-4 gap-md mb-lg">
          ${this.renderStatsCards()}
        </div>
        
        <!-- Reports Tabs -->
        <div class="card">
          ${components.createTabs([
            { label: '📊 Sales Report', content: this.renderSalesReport() },
            { label: '📦 Inventory Report', content: this.renderInventoryReport() },
            { label: '👥 Customer Report', content: this.renderCustomerReport() },
            { label: '💰 Tax Report', content: this.renderTaxReport() }
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

    setDateRange(range) {
        this.dateRange = range;
        const container = document.getElementById('dynamicView');
        this.render(container);
    },

    getFilteredSales() {
        const { start, end } = utils.getDateRange(this.dateRange);
        return this.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });
    },

    renderStatsCards() {
        const filteredSales = this.getFilteredSales();

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalTransactions = filteredSales.length;
        const totalItems = filteredSales.reduce((sum, sale) =>
            sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        return `
      ${components.createStatCard('Total Revenue', utils.formatCurrency(totalRevenue), '💰', 'success')}
      ${components.createStatCard('Transactions', totalTransactions, '🛒', 'primary')}
      ${components.createStatCard('Items Sold', totalItems, '📦', 'accent')}
      ${components.createStatCard('Avg Transaction', utils.formatCurrency(avgTransaction), '📊', 'warning')}
    `;
    },

    renderSalesReport() {
        const filteredSales = this.getFilteredSales();

        if (filteredSales.length === 0) {
            return '<p class="text-center text-secondary">No sales data for selected period</p>';
        }

        const headers = [
            { key: 'id', label: 'Invoice #' },
            { key: 'date', label: 'Date', format: (val) => utils.formatDate(val, 'datetime') },
            { key: 'items', label: 'Items', format: (val) => val.length },
            { key: 'subtotal', label: 'Subtotal', format: (val) => utils.formatCurrency(val) },
            { key: 'tax', label: 'Tax', format: (val) => utils.formatCurrency(val) },
            { key: 'total', label: 'Total', format: (val) => utils.formatCurrency(val) },
            { key: 'paymentMethod', label: 'Payment' }
        ];

        const sortedSales = filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
      <div class="mb-md">
        <button class="btn btn-outline" onclick="reportsModule.exportSalesReport()">
          📥 Export Sales Report
        </button>
      </div>
      ${components.createTable(headers, sortedSales)}
    `;
    },

    renderInventoryReport() {
        const lowStock = this.products.filter(p => p.stock <= (p.lowStockThreshold || 10));
        const outOfStock = this.products.filter(p => p.stock === 0);
        const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        return `
      <div class="grid grid-cols-3 gap-md mb-lg">
        ${components.createStatCard('Total Products', this.products.length, '📦', 'primary')}
        ${components.createStatCard('Low Stock', lowStock.length, '⚠️', 'warning')}
        ${components.createStatCard('Out of Stock', outOfStock.length, '❌', 'error')}
      </div>
      
      <div class="mb-md">
        <h3>Inventory Value: ${utils.formatCurrency(totalValue)}</h3>
      </div>
      
      <h4 class="mb-md">All Products</h4>
      ${components.createTable([
            { key: 'name', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'stock', label: 'Stock', format: (val, row) => `${val} ${row.unit}` },
            { key: 'price', label: 'Price', format: (val) => utils.formatCurrency(val) },
            { key: 'stock', label: 'Value', format: (val, row) => utils.formatCurrency(val * row.price) }
        ], this.products)}
      
      <div class="mt-md">
        <button class="btn btn-outline" onclick="reportsModule.exportInventoryReport()">
          📥 Export Inventory Report
        </button>
      </div>
    `;
    },

    renderCustomerReport() {
        const topCustomers = this.customers
            .filter(c => c.totalPurchases > 0)
            .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
            .slice(0, 10);

        const totalRevenue = this.customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

        return `
      <div class="grid grid-cols-2 gap-md mb-lg">
        ${components.createStatCard('Total Customers', this.customers.length, '👥', 'primary')}
        ${components.createStatCard('Total Revenue', utils.formatCurrency(totalRevenue), '💰', 'success')}
      </div>
      
      <h4 class="mb-md">Top Customers</h4>
      ${topCustomers.length > 0 ? components.createTable([
            { key: 'name', label: 'Customer' },
            { key: 'phone', label: 'Phone' },
            { key: 'totalPurchases', label: 'Total Purchases', format: (val) => utils.formatCurrency(val || 0) }
        ], topCustomers) : '<p class="text-center text-secondary">No customer data available</p>'}
      
      <div class="mt-md">
        <button class="btn btn-outline" onclick="reportsModule.exportCustomerReport()">
          📥 Export Customer Report
        </button>
      </div>
    `;
    },

    renderTaxReport() {
        const filteredSales = this.getFilteredSales();
        const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0);
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

        return `
      <div class="grid grid-cols-2 gap-md mb-lg">
        ${components.createStatCard('Total Tax Collected', utils.formatCurrency(totalTax), '💵', 'warning')}
        ${components.createStatCard('Total Sales', utils.formatCurrency(totalSales), '💰', 'success')}
      </div>
      
      <h4 class="mb-md">Tax Breakdown</h4>
      ${filteredSales.length > 0 ? components.createTable([
            { key: 'id', label: 'Invoice #' },
            { key: 'date', label: 'Date', format: (val) => utils.formatDate(val, 'short') },
            { key: 'subtotal', label: 'Subtotal', format: (val) => utils.formatCurrency(val) },
            { key: 'tax', label: 'Tax', format: (val) => utils.formatCurrency(val) },
            { key: 'total', label: 'Total', format: (val) => utils.formatCurrency(val) }
        ], filteredSales) : '<p class="text-center text-secondary">No tax data for selected period</p>'}
      
      <div class="mt-md">
        <button class="btn btn-outline" onclick="reportsModule.exportTaxReport()">
          📥 Export Tax Report
        </button>
      </div>
    `;
    },

    exportSalesReport() {
        const filteredSales = this.getFilteredSales();
        const filename = `sales_report_${this.dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        utils.exportToCSV(filteredSales, filename);
        utils.showToast('Sales report exported', 'success');
    },

    exportInventoryReport() {
        const filename = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
        utils.exportToCSV(this.products, filename);
        utils.showToast('Inventory report exported', 'success');
    },

    exportCustomerReport() {
        const filename = `customer_report_${new Date().toISOString().split('T')[0]}.csv`;
        utils.exportToCSV(this.customers, filename);
        utils.showToast('Customer report exported', 'success');
    },

    exportTaxReport() {
        const filteredSales = this.getFilteredSales();
        const filename = `tax_report_${this.dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
        utils.exportToCSV(filteredSales, filename);
        utils.showToast('Tax report exported', 'success');
    }
};

// Export module
window.reportsModule = reportsModule;
