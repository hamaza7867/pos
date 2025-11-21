// Products Management Module
const productsModule = {
  products: [],
  categories: [],
  currentProduct: null,
  searchTerm: '',
  filterCategory: 'all',

  async init() {
    await this.loadProducts();
    await this.loadCategories();
  },

  async loadProducts() {
    this.products = await window.db.getAll('products');
  },

  async loadCategories() {
    this.categories = await window.db.getAll('categories');

    // Add default categories if none exist
    if (this.categories.length === 0) {
      const defaultCategories = [
        { name: 'General' },
        { name: 'Electronics' },
        { name: 'Clothing' },
        { name: 'Food & Beverages' },
        { name: 'Books' },
        { name: 'Hardware' },
        { name: 'Pharmacy' },
        { name: 'Cosmetics' }
      ];

      for (const cat of defaultCategories) {
        await window.db.add('categories', cat);
      }

      this.categories = await window.db.getAll('categories');
    }
  },

  async render(container) {
    await this.init();

    container.innerHTML = `
      <div class="products-page">
        <div class="page-header flex justify-between items-center mb-lg">
          <h1>Products & Inventory</h1>
          <button class="btn btn-primary" onclick="productsModule.showAddProductModal()">
            ➕ Add Product
          </button>
        </div>
        
        <!-- Search and Filter -->
        <div class="card mb-lg">
          <div class="card-body">
            <div class="grid grid-cols-1 grid-lg-cols-3 gap-md">
              <div class="form-group mb-0">
                <input type="text" 
                       class="form-input" 
                       id="productSearch" 
                       placeholder="Search products..."
                       onkeyup="productsModule.handleSearch(this.value)">
              </div>
              <div class="form-group mb-0">
                <select class="form-select" 
                        id="categoryFilter"
                        onchange="productsModule.handleFilter(this.value)">
                  <option value="all">All Categories</option>
                  ${this.categories.map(cat =>
      `<option value="${cat.id}">${cat.name}</option>`
    ).join('')}
                </select>
              </div>
              <div class="flex gap-sm">
                <button class="btn btn-outline" onclick="productsModule.showExportOptions()">
                  📥 Export
                </button>
                <button class="btn btn-outline" onclick="productsModule.showImportModal()">
                  📤 Import
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Products Grid -->
        <div id="productsContainer">
          ${this.renderProductsGrid()}
        </div>
      </div>
    `;
  },

  renderProductsGrid() {
    let filteredProducts = this.products;

    // Apply search filter
    if (this.searchTerm) {
      filteredProducts = utils.searchObjects(
        filteredProducts,
        this.searchTerm,
        ['name', 'sku', 'barcode', 'description']
      );
    }

    // Apply category filter
    if (this.filterCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.categoryId == this.filterCategory);
    }

    if (filteredProducts.length === 0) {
      return `
        <div class="card">
          <div class="card-body text-center">
            <p class="text-secondary">No products found</p>
            <button class="btn btn-primary mt-md" onclick="productsModule.showAddProductModal()">
              Add Your First Product
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 grid-lg-cols-3 gap-md">
        ${filteredProducts.map(product => this.renderProductCard(product)).join('')}
      </div>
    `;
  },

  renderProductCard(product) {
    const category = this.categories.find(c => c.id === product.categoryId);
    const stockClass = product.stock <= (product.lowStockThreshold || 10) ? 'error' : 'success';

    return `
      <div class="card product-card">
        <div class="card-body">
          <div class="flex justify-between items-center mb-md">
            <h3 class="card-title mb-0">${product.name}</h3>
            <span class="badge badge-${stockClass}">${product.stock} ${product.unit}</span>
          </div>
          
          <div class="product-details">
            <p class="text-sm text-secondary mb-sm">
              <strong>SKU:</strong> ${product.sku}
            </p>
            ${product.barcode ? `
              <p class="text-sm text-secondary mb-sm">
                <strong>Barcode:</strong> ${product.barcode}
              </p>
            ` : ''}
            <p class="text-sm text-secondary mb-sm">
              <strong>Category:</strong> ${category ? category.name : 'N/A'}
            </p>
            <p class="text-sm text-secondary mb-sm">
              <strong>Price:</strong> ${utils.formatCurrency(product.price)}
            </p>
            ${product.taxRate ? `
              <p class="text-sm text-secondary mb-sm">
                <strong>Tax:</strong> ${product.taxRate}%
              </p>
            ` : ''}
          </div>
          
          <div class="card-footer mt-md" style="padding-top: 1rem; border-top: 1px solid var(--border);">
            <div class="flex gap-sm">
              <button class="btn btn-sm btn-primary" onclick="productsModule.showEditProductModal(${product.id})">
                ✏️ Edit
              </button>
              <button class="btn btn-sm btn-outline" onclick="productsModule.adjustStock(${product.id})">
                📦 Stock
              </button>
              <button class="btn btn-sm btn-error" onclick="productsModule.deleteProduct(${product.id})">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleSearch(term) {
    this.searchTerm = term;
    this.refreshProductsGrid();
  },

  handleFilter(categoryId) {
    this.filterCategory = categoryId;
    this.refreshProductsGrid();
  },

  refreshProductsGrid() {
    const container = document.getElementById('productsContainer');
    if (container) {
      container.innerHTML = this.renderProductsGrid();
    }
  },

  showAddProductModal() {
    const modalContent = this.renderProductForm();
    const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('productModal')">Cancel</button>
      <button class="btn btn-primary" onclick="productsModule.saveProduct()">Save Product</button>
    `;

    const modalId = components.createModal('Add Product', modalContent, modalFooter);
    document.getElementById(modalId).id = 'productModal';
  },

  async showEditProductModal(productId) {
    this.currentProduct = await window.db.get('products', productId);

    const modalContent = this.renderProductForm(this.currentProduct);
    const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('productModal')">Cancel</button>
      <button class="btn btn-primary" onclick="productsModule.saveProduct()">Update Product</button>
    `;

    const modalId = components.createModal('Edit Product', modalContent, modalFooter);
    document.getElementById(modalId).id = 'productModal';
  },

  renderProductForm(product = {}) {
    return `
      <form id="productForm">
        ${components.createFormField({
      type: 'text',
      name: 'name',
      label: 'Product Name',
      value: product.name || '',
      required: true,
      placeholder: 'Enter product name'
    })}
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'text',
      name: 'sku',
      label: 'SKU',
      value: product.sku || utils.generateSKU(),
      required: true
    })}
          
          ${components.createFormField({
      type: 'text',
      name: 'barcode',
      label: 'Barcode',
      value: product.barcode || '',
      placeholder: 'Optional'
    })}
        </div>
        
        ${components.createFormField({
      type: 'select',
      name: 'categoryId',
      label: 'Category',
      value: product.categoryId || '',
      required: true,
      options: this.categories.map(cat => ({ value: cat.id, label: cat.name }))
    })}
        
        ${components.createFormField({
      type: 'textarea',
      name: 'description',
      label: 'Description',
      value: product.description || '',
      placeholder: 'Product description (optional)'
    })}
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'number',
      name: 'price',
      label: 'Price',
      value: product.price || '',
      required: true,
      placeholder: '0.00'
    })}
          
          ${components.createFormField({
      type: 'number',
      name: 'cost',
      label: 'Cost Price',
      value: product.cost || '',
      placeholder: '0.00',
      hint: 'For profit calculation'
    })}
        </div>
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'number',
      name: 'stock',
      label: 'Stock Quantity',
      value: product.stock || 0,
      required: true
    })}
          
          ${components.createFormField({
      type: 'select',
      name: 'unit',
      label: 'Unit',
      value: product.unit || 'pcs',
      required: true,
      options: [
        { value: 'pcs', label: 'Pieces' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'g', label: 'Grams' },
        { value: 'l', label: 'Liters' },
        { value: 'ml', label: 'Milliliters' },
        { value: 'box', label: 'Box' },
        { value: 'pack', label: 'Pack' },
        { value: 'dozen', label: 'Dozen' }
      ]
    })}
        </div>
        
        <div class="grid grid-cols-2 gap-md">
          ${components.createFormField({
      type: 'number',
      name: 'lowStockThreshold',
      label: 'Low Stock Alert',
      value: product.lowStockThreshold || 10,
      hint: 'Alert when stock falls below this'
    })}
          
          ${components.createFormField({
      type: 'number',
      name: 'taxRate',
      label: 'Tax Rate (%)',
      value: product.taxRate || 0,
      placeholder: '0'
    })}
        </div>
      </form>
    `;
  },

  async saveProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const productData = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      barcode: formData.get('barcode'),
      categoryId: parseInt(formData.get('categoryId')),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      cost: parseFloat(formData.get('cost')) || 0,
      stock: parseFloat(formData.get('stock')),
      unit: formData.get('unit'),
      lowStockThreshold: parseInt(formData.get('lowStockThreshold')) || 10,
      taxRate: parseFloat(formData.get('taxRate')) || 0,
      createdAt: this.currentProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (this.currentProduct) {
        productData.id = this.currentProduct.id;
        await window.db.update('products', productData);
        utils.showToast('Product updated successfully', 'success');
      } else {
        await window.db.add('products', productData);
        utils.showToast('Product added successfully', 'success');
      }

      components.closeModal('productModal');
      this.currentProduct = null;
      await this.loadProducts();
      this.refreshProductsGrid();

    } catch (error) {
      console.error('Error saving product:', error);
      utils.showToast('Error saving product', 'error');
    }
  },

  async deleteProduct(productId) {
    utils.confirm(
      'Are you sure you want to delete this product?',
      async () => {
        try {
          await window.db.delete('products', productId);
          utils.showToast('Product deleted successfully', 'success');
          await this.loadProducts();
          this.refreshProductsGrid();
        } catch (error) {
          console.error('Error deleting product:', error);
          utils.showToast('Error deleting product', 'error');
        }
      }
    );
  },

  async adjustStock(productId) {
    const product = await window.db.get('products', productId);

    const modalContent = `
      <div class="form-group">
        <label class="form-label">Current Stock: <strong>${product.stock} ${product.unit}</strong></label>
      </div>
      ${components.createFormField({
      type: 'number',
      name: 'adjustment',
      label: 'Adjustment',
      placeholder: 'Enter positive to add, negative to subtract',
      hint: 'Example: +50 to add 50 units, -20 to remove 20 units'
    })}
      ${components.createFormField({
      type: 'text',
      name: 'reason',
      label: 'Reason',
      placeholder: 'Stock adjustment reason (optional)'
    })}
    `;

    const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('stockModal')">Cancel</button>
      <button class="btn btn-primary" onclick="productsModule.saveStockAdjustment(${productId})">Save</button>
    `;

    const modalId = components.createModal('Adjust Stock', modalContent, modalFooter);
    document.getElementById(modalId).id = 'stockModal';
  },

  async saveStockAdjustment(productId) {
    const adjustment = parseFloat(document.querySelector('[name="adjustment"]').value);

    if (isNaN(adjustment) || adjustment === 0) {
      utils.showToast('Please enter a valid adjustment', 'warning');
      return;
    }

    try {
      const product = await window.db.get('products', productId);
      product.stock += adjustment;
      product.updatedAt = new Date().toISOString();

      await window.db.update('products', product);
      utils.showToast('Stock adjusted successfully', 'success');
      components.closeModal('stockModal');
      await this.loadProducts();
      this.refreshProductsGrid();

    } catch (error) {
      console.error('Error adjusting stock:', error);
      utils.showToast('Error adjusting stock', 'error');
    }
  },

  showExportOptions() {
    const modalContent = `
          <div class="form-group">
            <label class="form-label">Select Export Format</label>
            <p class="text-sm text-secondary mb-md">Choose the format for exporting ${this.products.length} products</p>
            <div class="flex gap-md">
              <button class="btn btn-primary" onclick="productsModule.exportProducts('json')">
                📄 JSON Format
              </button>
              <button class="btn btn-primary" onclick="productsModule.exportProducts('csv')">
                📊 CSV Format
              </button>
            </div>
          </div>
        `;

    const modalFooter = `
          <button class="btn btn-ghost" onclick="components.closeModal('exportModal')">Cancel</button>
        `;

    const modalId = components.createModal('Export Products', modalContent, modalFooter);
    document.getElementById(modalId).id = 'exportModal';
  },

  async exportProducts(format = 'json') {
    if (this.products.length === 0) {
      utils.showToast('No products to export', 'warning');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const filename = `products_${date}.csv`;
      utils.exportToCSV(this.products, filename);
    } else {
      const filename = `products_${date}.json`;
      utils.exportToJSON(this.products, filename);
    }

    components.closeModal('exportModal');
    utils.showToast(`Products exported as ${format.toUpperCase()}`, 'success');
  },

  showImportModal() {
    const modalContent = `
      <div class="form-group">
        <label class="form-label">Select JSON file to import</label>
        <input type="file" class="form-input" id="importFile" accept=".json">
        <div class="form-hint">File should contain an array of product objects</div>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('importModal')">Cancel</button>
      <button class="btn btn-primary" onclick="productsModule.importProducts()">Import</button>
    `;

    const modalId = components.createModal('Import Products', modalContent, modalFooter);
    document.getElementById(modalId).id = 'importModal';
  },

  async importProducts() {
    const fileInput = document.getElementById('importFile');
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

        for (const product of data) {
          delete product.id; // Remove ID to create new products
          await window.db.add('products', product);
        }

        utils.showToast(`${data.length} products imported successfully`, 'success');
        components.closeModal('importModal');
        await this.loadProducts();
        this.refreshProductsGrid();

      } catch (error) {
        console.error('Error importing products:', error);
        utils.showToast('Error importing products', 'error');
      }
    });
  }
};

// Export module
window.productsModule = productsModule;
