// POS (Point of Sale) Module
const posModule = {
    cart: [],
    selectedCustomer: null,
    products: [],
    customers: [],

    async init() {
        this.products = await window.db.getAll('products');
        this.customers = await window.db.getAll('customers');
        this.cart = [];
        this.selectedCustomer = null;
    },

    async render(container) {
        await this.init();

        container.innerHTML = `
      <div class="pos-page">
        <h1 class="mb-lg">Point of Sale</h1>
        
        <div class="grid grid-cols-1 grid-lg-cols-3 gap-lg">
          <!-- Products Section -->
          <div class="grid-col-span-2">
            <div class="card mb-lg">
              <div class="card-body">
                <input type="text" 
                       class="form-input" 
                       id="productSearchPOS" 
                       placeholder="🔍 Search products by name, SKU, or barcode..."
                       onkeyup="posModule.searchProducts(this.value)"
                       autofocus>
              </div>
            </div>
            
            <div id="posProductsGrid" class="grid grid-cols-2 grid-lg-cols-3 gap-md">
              ${this.renderProductsGrid()}
            </div>
          </div>
          
          <!-- Cart Section -->
          <div>
            <div class="card pos-cart" style="position: sticky; top: 80px;">
              <div class="card-header">
                <h3 class="card-title">Cart</h3>
                ${this.cart.length > 0 ? `
                  <button class="btn btn-sm btn-ghost" onclick="posModule.clearCart()">Clear</button>
                ` : ''}
              </div>
              
              <div class="card-body">
                <!-- Customer Selection -->
                <div class="form-group">
                  <select class="form-select" id="customerSelect" onchange="posModule.selectCustomer(this.value)">
                    <option value="">Walk-in Customer</option>
                    ${this.customers.map(c => `
                      <option value="${c.id}">${c.name} - ${c.phone}</option>
                    `).join('')}
                  </select>
                </div>
                
                <!-- Cart Items -->
                <div id="cartItems" style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
                  ${this.renderCartItems()}
                </div>
                
                <!-- Cart Summary -->
                <div id="cartSummary">
                  ${this.renderCartSummary()}
                </div>
              </div>
              
              <div class="card-footer">
                <button class="btn btn-success btn-lg" 
                        style="width: 100%;"
                        onclick="posModule.checkout()"
                        ${this.cart.length === 0 ? 'disabled' : ''}>
                  💳 Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    renderProductsGrid() {
        if (this.products.length === 0) {
            return `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-body text-center">
            <p class="text-secondary">No products available</p>
            <button class="btn btn-primary mt-md" onclick="navigateTo('products')">
              Add Products
            </button>
          </div>
        </div>
      `;
        }

        return this.products.map(product => `
      <div class="card product-card-pos" onclick="posModule.addToCart(${product.id})" style="cursor: pointer;">
        <div class="card-body">
          <h4 class="mb-sm">${product.name}</h4>
          <p class="text-sm text-secondary mb-sm">${product.sku}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold" style="color: var(--primary);">
              ${utils.formatCurrency(product.price)}
            </span>
            <span class="badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}">
              ${product.stock} ${product.unit}
            </span>
          </div>
        </div>
      </div>
    `).join('');
    },

    searchProducts(term) {
        if (!term) {
            this.init().then(() => this.refreshProductsGrid());
            return;
        }

        this.products = utils.searchObjects(
            this.products,
            term,
            ['name', 'sku', 'barcode']
        );
        this.refreshProductsGrid();
    },

    refreshProductsGrid() {
        const container = document.getElementById('posProductsGrid');
        if (container) {
            container.innerHTML = this.renderProductsGrid();
        }
    },

    async addToCart(productId) {
        const product = await window.db.get('products', productId);

        if (!product) {
            utils.showToast('Product not found', 'error');
            return;
        }

        if (product.stock <= 0) {
            utils.showToast('Product out of stock', 'error');
            return;
        }

        // Check if product already in cart
        const existingItem = this.cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                utils.showToast('Cannot add more than available stock', 'warning');
                return;
            }
            existingItem.quantity++;
        } else {
            this.cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                taxRate: product.taxRate || 0,
                unit: product.unit,
                quantity: 1,
                maxStock: product.stock
            });
        }

        this.refreshCart();
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.refreshCart();
    },

    updateQuantity(index, quantity) {
        const item = this.cart[index];
        const newQty = parseFloat(quantity);

        if (newQty <= 0) {
            this.removeFromCart(index);
            return;
        }

        if (newQty > item.maxStock) {
            utils.showToast('Cannot exceed available stock', 'warning');
            return;
        }

        item.quantity = newQty;
        this.refreshCart();
    },

    clearCart() {
        utils.confirm('Clear all items from cart?', () => {
            this.cart = [];
            this.selectedCustomer = null;
            this.refreshCart();
        });
    },

    selectCustomer(customerId) {
        this.selectedCustomer = customerId ? parseInt(customerId) : null;
    },

    renderCartItems() {
        if (this.cart.length === 0) {
            return '<p class="text-center text-secondary">Cart is empty</p>';
        }

        return this.cart.map((item, index) => `
      <div class="cart-item" style="padding: 0.75rem; border-bottom: 1px solid var(--border);">
        <div class="flex justify-between items-start mb-sm">
          <div style="flex: 1;">
            <strong>${item.name}</strong>
            <p class="text-sm text-secondary">${utils.formatCurrency(item.price)} / ${item.unit}</p>
          </div>
          <button class="btn btn-icon btn-sm btn-ghost" onclick="posModule.removeFromCart(${index})">
            ✕
          </button>
        </div>
        <div class="flex justify-between items-center">
          <input type="number" 
                 class="form-input" 
                 style="width: 80px; padding: 0.25rem 0.5rem;"
                 value="${item.quantity}"
                 min="1"
                 max="${item.maxStock}"
                 step="0.1"
                 onchange="posModule.updateQuantity(${index}, this.value)">
          <strong>${utils.formatCurrency(item.price * item.quantity)}</strong>
        </div>
      </div>
    `).join('');
    },

    renderCartSummary() {
        if (this.cart.length === 0) {
            return '';
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = this.cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            return sum + utils.calculateTax(itemTotal, item.taxRate);
        }, 0);
        const total = subtotal + tax;

        return `
      <div class="cart-summary" style="border-top: 2px solid var(--border); padding-top: 1rem;">
        <div class="flex justify-between mb-sm">
          <span>Subtotal:</span>
          <strong>${utils.formatCurrency(subtotal)}</strong>
        </div>
        <div class="flex justify-between mb-sm">
          <span>Tax:</span>
          <strong>${utils.formatCurrency(tax)}</strong>
        </div>
        <div class="flex justify-between" style="font-size: 1.25rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
          <strong>Total:</strong>
          <strong style="color: var(--success);">${utils.formatCurrency(total)}</strong>
        </div>
      </div>
    `;
    },

    refreshCart() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSummaryContainer = document.getElementById('cartSummary');

        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = this.renderCartItems();
        }

        if (cartSummaryContainer) {
            cartSummaryContainer.innerHTML = this.renderCartSummary();
        }

        // Update checkout button state
        const checkoutBtn = document.querySelector('.btn-success');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    },

    async checkout() {
        if (this.cart.length === 0) {
            utils.showToast('Cart is empty', 'warning');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = this.cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            return sum + utils.calculateTax(itemTotal, item.taxRate);
        }, 0);
        const total = subtotal + tax;

        const modalContent = `
      <div class="checkout-summary">
        <h3 class="mb-md">Order Summary</h3>
        
        <div class="mb-lg">
          ${this.cart.map(item => `
            <div class="flex justify-between mb-sm">
              <span>${item.name} x ${item.quantity}</span>
              <strong>${utils.formatCurrency(item.price * item.quantity)}</strong>
            </div>
          `).join('')}
        </div>
        
        <div class="cart-summary" style="border-top: 2px solid var(--border); padding-top: 1rem; margin-bottom: 1rem;">
          <div class="flex justify-between mb-sm">
            <span>Subtotal:</span>
            <strong>${utils.formatCurrency(subtotal)}</strong>
          </div>
          <div class="flex justify-between mb-sm">
            <span>Tax:</span>
            <strong>${utils.formatCurrency(tax)}</strong>
          </div>
          <div class="flex justify-between" style="font-size: 1.25rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
            <strong>Total:</strong>
            <strong style="color: var(--success);">${utils.formatCurrency(total)}</strong>
          </div>
        </div>
        
        ${components.createFormField({
            type: 'select',
            name: 'paymentMethod',
            label: 'Payment Method',
            required: true,
            options: [
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'other', label: 'Other' }
            ]
        })}
      </div>
    `;

        const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('checkoutModal')">Cancel</button>
      <button class="btn btn-success" onclick="posModule.completeSale()">Complete Sale</button>
    `;

        const modalId = components.createModal('Checkout', modalContent, modalFooter);
        document.getElementById(modalId).id = 'checkoutModal';
    },

    async completeSale() {
        const paymentMethod = document.querySelector('[name="paymentMethod"]').value;

        if (!paymentMethod) {
            utils.showToast('Please select payment method', 'warning');
            return;
        }

        try {
            components.showLoader('Processing sale...');

            const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = this.cart.reduce((sum, item) => {
                const itemTotal = item.price * item.quantity;
                return sum + utils.calculateTax(itemTotal, item.taxRate);
            }, 0);
            const total = subtotal + tax;

            // Create sale record
            const sale = {
                date: new Date().toISOString(),
                customerId: this.selectedCustomer,
                items: this.cart.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    taxRate: item.taxRate
                })),
                subtotal,
                tax,
                total,
                paymentMethod
            };

            const saleId = await window.db.add('sales', sale);

            // Update product stock
            for (const item of this.cart) {
                const product = await window.db.get('products', item.productId);
                product.stock -= item.quantity;
                product.updatedAt = new Date().toISOString();
                await window.db.update('products', product);
            }

            // Update customer total purchases
            if (this.selectedCustomer) {
                const customer = await window.db.get('customers', this.selectedCustomer);
                customer.totalPurchases = (customer.totalPurchases || 0) + total;
                customer.updatedAt = new Date().toISOString();
                await window.db.update('customers', customer);
            }

            components.hideLoader();
            components.closeModal('checkoutModal');

            // Show receipt
            await this.showReceipt(saleId);

            // Clear cart
            this.cart = [];
            this.selectedCustomer = null;
            await this.init();
            this.refreshCart();
            this.refreshProductsGrid();

            utils.showToast('Sale completed successfully!', 'success');

        } catch (error) {
            console.error('Error completing sale:', error);
            components.hideLoader();
            utils.showToast('Error completing sale', 'error');
        }
    },

    async showReceipt(saleId) {
        const sale = await window.db.get('sales', saleId);
        const customer = sale.customerId ? await window.db.get('customers', sale.customerId) : null;

        // Generate receipt using receipt engine
        await window.receiptEngine.showReceipt(sale, customer);
    }
};

// Export module
window.posModule = posModule;
