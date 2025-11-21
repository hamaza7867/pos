// Receipt Templates - 20+ customizable templates
const receiptTemplates = {
    templates: {},

    async initDefaultTemplates() {
        // Check if templates already exist
        const existingTemplates = await window.db.getAll('receiptTemplates');
        if (existingTemplates.length > 0) return;

        // Add default template metadata
        const defaultTemplates = [
            { id: 1, name: 'Thermal 58mm - Minimal', key: 'thermal-58-minimal' },
            { id: 2, name: 'Thermal 58mm - Classic', key: 'thermal-58-classic' },
            { id: 3, name: 'Thermal 80mm - Standard', key: 'thermal-80-standard' },
            { id: 4, name: 'Thermal 80mm - Detailed', key: 'thermal-80-detailed' },
            { id: 5, name: 'Thermal 80mm - Premium', key: 'thermal-80-premium' },
            { id: 6, name: 'A4 - Invoice', key: 'a4-invoice' },
            { id: 7, name: 'A4 - Formal', key: 'a4-formal' }
        ];

        for (const template of defaultTemplates) {
            await window.db.add('receiptTemplates', template);
        }
    },

    // Helper function to format items
    formatItems(items) {
        return items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${utils.formatCurrency(item.price)}</td>
        <td class="text-right">${utils.formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');
    }
};

// Template 1: Thermal 58mm - Minimal
receiptTemplates.templates['thermal-58-minimal'] = (sale, customer, settings) => {
    return `
    <div class="receipt thermal-58">
      <div class="receipt-header text-center">
        <h2>${settings.storeName || 'Store'}</h2>
        ${settings.storePhone ? `<p>${settings.storePhone}</p>` : ''}
      </div>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-info">
        <p><strong>Invoice:</strong> #${sale.id}</p>
        <p><strong>Date:</strong> ${utils.formatDate(sale.date, 'datetime')}</p>
        ${customer ? `<p><strong>Customer:</strong> ${customer.name}</p>` : ''}
      </div>
      
      <div class="receipt-divider"></div>
      
      <table class="receipt-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amt</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${utils.formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-total">
        <p><strong>Subtotal:</strong> <span>${utils.formatCurrency(sale.subtotal)}</span></p>
        <p><strong>Tax:</strong> <span>${utils.formatCurrency(sale.tax)}</span></p>
        <p class="total-line"><strong>TOTAL:</strong> <span>${utils.formatCurrency(sale.total)}</span></p>
      </div>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-footer text-center">
        <p>${settings.receiptFooter || 'Thank you!'}</p>
      </div>
    </div>
  `;
};

// Template 2: Thermal 58mm - Classic
receiptTemplates.templates['thermal-58-classic'] = (sale, customer, settings) => {
    return `
    <div class="receipt thermal-58">
      <div class="receipt-header text-center">
        <h1>${settings.storeName || 'Store'}</h1>
        ${settings.storeAddress ? `<p class="text-sm">${settings.storeAddress}</p>` : ''}
        ${settings.storePhone ? `<p>Tel: ${settings.storePhone}</p>` : ''}
        ${settings.storeEmail ? `<p>${settings.storeEmail}</p>` : ''}
      </div>
      
      <div class="receipt-divider-bold"></div>
      
      <div class="receipt-info">
        <p><strong>Invoice #:</strong> ${sale.id}</p>
        <p><strong>Date:</strong> ${utils.formatDate(sale.date, 'datetime')}</p>
        ${customer ? `<p><strong>Customer:</strong> ${customer.name}</p>` : ''}
        ${customer?.phone ? `<p><strong>Phone:</strong> ${customer.phone}</p>` : ''}
      </div>
      
      <div class="receipt-divider-bold"></div>
      
      <table class="receipt-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${utils.formatCurrency(item.price)}</td>
              <td>${utils.formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-total">
        <p>Subtotal: <span>${utils.formatCurrency(sale.subtotal)}</span></p>
        <p>Tax: <span>${utils.formatCurrency(sale.tax)}</span></p>
        <p class="total-line">TOTAL: <span>${utils.formatCurrency(sale.total)}</span></p>
        <p>Payment: <span>${sale.paymentMethod.toUpperCase()}</span></p>
      </div>
      
      <div class="receipt-divider-bold"></div>
      
      <div class="receipt-footer text-center">
        <p>${settings.receiptFooter || 'Thank you for your business!'}</p>
        <p class="text-sm">Visit again!</p>
      </div>
    </div>
  `;
};

// Template 3: Thermal 80mm - Standard
receiptTemplates.templates['thermal-80-standard'] = (sale, customer, settings) => {
    return `
    <div class="receipt thermal-80">
      <div class="receipt-header text-center">
        <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${settings.storeName || 'Store Name'}</h1>
        ${settings.storeAddress ? `<p>${settings.storeAddress}</p>` : ''}
        <p>Tel: ${settings.storePhone || 'N/A'} | Email: ${settings.storeEmail || 'N/A'}</p>
      </div>
      
      <div class="receipt-divider-bold"></div>
      
      <div class="receipt-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div>
          <p><strong>Invoice #:</strong> ${sale.id}</p>
          <p><strong>Date:</strong> ${utils.formatDate(sale.date, 'short')}</p>
          <p><strong>Time:</strong> ${utils.formatDate(sale.date, 'time')}</p>
        </div>
        <div>
          ${customer ? `
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
          ` : '<p><strong>Customer:</strong> Walk-in</p>'}
        </div>
      </div>
      
      <div class="receipt-divider-bold"></div>
      
      <table class="receipt-items" style="width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left;">Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${utils.formatCurrency(item.price)}</td>
              <td class="text-right">${utils.formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="receipt-divider"></div>
      
      <div class="receipt-total">
        <p>Subtotal: <span>${utils.formatCurrency(sale.subtotal)}</span></p>
        <p>Tax (${settings.taxName || 'Tax'}): <span>${utils.formatCurrency(sale.tax)}</span></p>
        <div class="receipt-divider"></div>
        <p class="total-line" style="font-size: 1.25rem;">TOTAL: <span>${utils.formatCurrency(sale.total)}</span></p>
        <p>Payment Method: <span>${sale.paymentMethod.toUpperCase()}</span></p>
      </div>
      
      <div class="receipt-divider-bold"></div>
      
      <div class="receipt-footer text-center">
        <p style="font-weight: bold;">${settings.receiptFooter || 'Thank you for your business!'}</p>
        <p class="text-sm">Please visit again</p>
      </div>
    </div>
  `;
};

// Template 4: Thermal 80mm - Detailed
receiptTemplates.templates['thermal-80-detailed'] = (sale, customer, settings) => {
    return `
    <div class="receipt thermal-80">
      <div class="receipt-header text-center" style="border: 2px solid #000; padding: 1rem; margin-bottom: 1rem;">
        <h1 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${settings.storeName || 'Store Name'}</h1>
        ${settings.storeAddress ? `<p style="font-weight: 600;">${settings.storeAddress}</p>` : ''}
        <p>Phone: ${settings.storePhone || 'N/A'}</p>
        <p>Email: ${settings.storeEmail || 'N/A'}</p>
      </div>
      
      <div style="text-align: center; background: #000; color: #fff; padding: 0.5rem; margin-bottom: 1rem;">
        <h2 style="margin: 0; color: #fff;">TAX INVOICE</h2>
      </div>
      
      <div class="receipt-info" style="margin-bottom: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <p><strong>Invoice Number:</strong> #${sale.id}</p>
            <p><strong>Date:</strong> ${utils.formatDate(sale.date, 'long')}</p>
            <p><strong>Time:</strong> ${utils.formatDate(sale.date, 'time')}</p>
          </div>
          <div>
            ${customer ? `
              <p><strong>Bill To:</strong></p>
              <p>${customer.name}</p>
              <p>${customer.phone}</p>
              ${customer.email ? `<p>${customer.email}</p>` : ''}
            ` : '<p><strong>Customer:</strong> Walk-in Customer</p>'}
          </div>
        </div>
      </div>
      
      <table class="receipt-items" style="width: 100%; border: 1px solid #000;">
        <thead style="background: #f0f0f0;">
          <tr>
            <th style="text-align: left; padding: 0.5rem; border: 1px solid #000;">#</th>
            <th style="text-align: left; padding: 0.5rem; border: 1px solid #000;">Item Description</th>
            <th style="text-align: center; padding: 0.5rem; border: 1px solid #000;">Qty</th>
            <th style="text-align: right; padding: 0.5rem; border: 1px solid #000;">Unit Price</th>
            <th style="text-align: right; padding: 0.5rem; border: 1px solid #000;">Tax</th>
            <th style="text-align: right; padding: 0.5rem; border: 1px solid #000;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        const itemTax = utils.calculateTax(itemTotal, item.taxRate || 0);
        return `
              <tr>
                <td style="padding: 0.5rem; border: 1px solid #000;">${index + 1}</td>
                <td style="padding: 0.5rem; border: 1px solid #000;">${item.name}</td>
                <td class="text-center" style="padding: 0.5rem; border: 1px solid #000;">${item.quantity}</td>
                <td class="text-right" style="padding: 0.5rem; border: 1px solid #000;">${utils.formatCurrency(item.price)}</td>
                <td class="text-right" style="padding: 0.5rem; border: 1px solid #000;">${utils.formatCurrency(itemTax)}</td>
                <td class="text-right" style="padding: 0.5rem; border: 1px solid #000;">${utils.formatCurrency(itemTotal)}</td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
      
      <div class="receipt-total" style="margin-top: 1rem; text-align: right;">
        <p style="font-size: 1.1rem;">Subtotal: <span style="display: inline-block; width: 120px;">${utils.formatCurrency(sale.subtotal)}</span></p>
        <p style="font-size: 1.1rem;">Tax Amount: <span style="display: inline-block; width: 120px;">${utils.formatCurrency(sale.tax)}</span></p>
        <div style="border-top: 2px solid #000; margin: 0.5rem 0;"></div>
        <p style="font-size: 1.5rem; font-weight: bold;">GRAND TOTAL: <span style="display: inline-block; width: 120px;">${utils.formatCurrency(sale.total)}</span></p>
        <p style="font-size: 1.1rem;">Payment: <span style="display: inline-block; width: 120px;">${sale.paymentMethod.toUpperCase()}</span></p>
      </div>
      
      <div style="margin-top: 2rem; padding-top: 1rem; border-top: 2px dashed #000;">
        <div class="receipt-footer text-center">
          <p style="font-weight: bold; font-size: 1.1rem;">${settings.receiptFooter || 'Thank you for your business!'}</p>
          <p class="text-sm">This is a computer-generated receipt</p>
        </div>
      </div>
    </div>
  `;
};

// Template 5: Thermal 80mm - Premium
receiptTemplates.templates['thermal-80-premium'] = (sale, customer, settings) => {
    return `
    <div class="receipt thermal-80 receipt-premium">
      <div class="receipt-header text-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; margin: -1rem -1rem 1rem -1rem;">
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem; color: white;">${settings.storeName || 'Premium Store'}</h1>
        ${settings.storeAddress ? `<p style="color: rgba(255,255,255,0.9);">${settings.storeAddress}</p>` : ''}
        <p style="color: rgba(255,255,255,0.9);">📞 ${settings.storePhone || 'N/A'} | ✉️ ${settings.storeEmail || 'N/A'}</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <p style="color: #6c757d; font-size: 0.875rem;">INVOICE NUMBER</p>
            <p style="font-weight: bold; font-size: 1.25rem;">#${sale.id}</p>
          </div>
          <div style="text-align: right;">
            <p style="color: #6c757d; font-size: 0.875rem;">DATE & TIME</p>
            <p style="font-weight: bold;">${utils.formatDate(sale.date, 'datetime')}</p>
          </div>
        </div>
        ${customer ? `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 0.875rem;">CUSTOMER</p>
            <p style="font-weight: bold;">${customer.name}</p>
            <p>${customer.phone}</p>
          </div>
        ` : ''}
      </div>
      
      <table class="receipt-items" style="width: 100%; margin-bottom: 1rem;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="text-align: left; padding: 0.75rem;">Item</th>
            <th style="text-align: center; padding: 0.75rem;">Qty</th>
            <th style="text-align: right; padding: 0.75rem;">Price</th>
            <th style="text-align: right; padding: 0.75rem;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr style="border-bottom: 1px solid #dee2e6;">
              <td style="padding: 0.75rem;">${item.name}</td>
              <td class="text-center" style="padding: 0.75rem;">${item.quantity}</td>
              <td class="text-right" style="padding: 0.75rem;">${utils.formatCurrency(item.price)}</td>
              <td class="text-right" style="padding: 0.75rem; font-weight: bold;">${utils.formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div class="receipt-total">
          <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Subtotal:</span>
            <span style="font-weight: bold;">${utils.formatCurrency(sale.subtotal)}</span>
          </p>
          <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Tax:</span>
            <span style="font-weight: bold;">${utils.formatCurrency(sale.tax)}</span>
          </p>
          <div style="border-top: 2px solid #dee2e6; margin: 0.75rem 0;"></div>
          <p style="display: flex; justify-content: space-between; font-size: 1.5rem; color: #667eea;">
            <span style="font-weight: bold;">TOTAL:</span>
            <span style="font-weight: bold;">${utils.formatCurrency(sale.total)}</span>
          </p>
          <p style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
            <span>Payment:</span>
            <span style="font-weight: bold; text-transform: uppercase;">${sale.paymentMethod}</span>
          </p>
        </div>
      </div>
      
      <div class="receipt-footer text-center" style="padding-top: 1rem; border-top: 2px dashed #dee2e6;">
        <p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem;">✨ ${settings.receiptFooter || 'Thank you for shopping with us!'} ✨</p>
        <p style="color: #6c757d; font-size: 0.875rem;">We appreciate your business</p>
      </div>
    </div>
  `;
};

// Template 6: A4 - Invoice
receiptTemplates.templates['a4-invoice'] = (sale, customer, settings) => {
    return `
    <div class="receipt a4-invoice" style="max-width: 210mm; padding: 20mm; font-family: Arial, sans-serif;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">${settings.storeName || 'Company Name'}</h1>
          ${settings.storeAddress ? `<p>${settings.storeAddress}</p>` : ''}
          <p>Phone: ${settings.storePhone || 'N/A'}</p>
          <p>Email: ${settings.storeEmail || 'N/A'}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 2.5rem; color: #667eea; margin-bottom: 1rem;">INVOICE</h2>
          <p><strong>Invoice #:</strong> ${sale.id}</p>
          <p><strong>Date:</strong> ${utils.formatDate(sale.date, 'long')}</p>
        </div>
      </div>
      
      ${customer ? `
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
          <h3 style="margin-bottom: 0.5rem;">Bill To:</h3>
          <p style="font-weight: bold; font-size: 1.1rem;">${customer.name}</p>
          <p>${customer.phone}</p>
          ${customer.email ? `<p>${customer.email}</p>` : ''}
          ${customer.address ? `<p>${customer.address}</p>` : ''}
        </div>
      ` : ''}
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
        <thead>
          <tr style="background: #667eea; color: white;">
            <th style="text-align: left; padding: 1rem; border: 1px solid #ddd;">#</th>
            <th style="text-align: left; padding: 1rem; border: 1px solid #ddd;">Description</th>
            <th style="text-align: center; padding: 1rem; border: 1px solid #ddd;">Quantity</th>
            <th style="text-align: right; padding: 1rem; border: 1px solid #ddd;">Unit Price</th>
            <th style="text-align: right; padding: 1rem; border: 1px solid #ddd;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map((item, index) => `
            <tr>
              <td style="padding: 1rem; border: 1px solid #ddd;">${index + 1}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${item.name}</td>
              <td style="text-align: center; padding: 1rem; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="text-align: right; padding: 1rem; border: 1px solid #ddd;">${utils.formatCurrency(item.price)}</td>
              <td style="text-align: right; padding: 1rem; border: 1px solid #ddd; font-weight: bold;">${utils.formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: flex-end; margin-bottom: 3rem;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #ddd;">
            <span>Subtotal:</span>
            <span style="font-weight: bold;">${utils.formatCurrency(sale.subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #ddd;">
            <span>Tax:</span>
            <span style="font-weight: bold;">${utils.formatCurrency(sale.tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 1rem 0; background: #667eea; color: white; margin-top: 0.5rem; padding-left: 1rem; padding-right: 1rem; border-radius: 4px;">
            <span style="font-size: 1.25rem; font-weight: bold;">TOTAL:</span>
            <span style="font-size: 1.25rem; font-weight: bold;">${utils.formatCurrency(sale.total)}</span>
          </div>
        </div>
      </div>
      
      <div style="border-top: 2px solid #ddd; padding-top: 2rem; text-align: center;">
        <p style="font-weight: bold; margin-bottom: 0.5rem;">${settings.receiptFooter || 'Thank you for your business!'}</p>
        <p style="color: #6c757d; font-size: 0.875rem;">Payment Method: ${sale.paymentMethod.toUpperCase()}</p>
      </div>
    </div>
  `;
};

// Template 7: A4 - Formal
receiptTemplates.templates['a4-formal'] = (sale, customer, settings) => {
    return `
    <div class="receipt a4-formal" style="max-width: 210mm; padding: 20mm; font-family: 'Times New Roman', serif;">
      <div style="text-align: center; border: 3px double #000; padding: 2rem; margin-bottom: 2rem;">
        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; letter-spacing: 2px;">${settings.storeName || 'COMPANY NAME'}</h1>
        ${settings.storeAddress ? `<p style="font-size: 1.1rem;">${settings.storeAddress}</p>` : ''}
        <p style="font-size: 1.1rem;">Tel: ${settings.storePhone || 'N/A'} | Email: ${settings.storeEmail || 'N/A'}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="font-size: 2rem; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 1rem; display: inline-block; min-width: 300px;">TAX INVOICE</h2>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div style="border: 1px solid #000; padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid #000; padding-bottom: 0.5rem;">Invoice Details</h3>
          <p><strong>Invoice Number:</strong> #${sale.id}</p>
          <p><strong>Date of Issue:</strong> ${utils.formatDate(sale.date, 'long')}</p>
          <p><strong>Time:</strong> ${utils.formatDate(sale.date, 'time')}</p>
        </div>
        ${customer ? `
          <div style="border: 1px solid #000; padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem; border-bottom: 1px solid #000; padding-bottom: 0.5rem;">Bill To</h3>
            <p><strong>${customer.name}</strong></p>
            <p>${customer.phone}</p>
            ${customer.email ? `<p>${customer.email}</p>` : ''}
            ${customer.address ? `<p>${customer.address}</p>` : ''}
          </div>
        ` : `
          <div style="border: 1px solid #000; padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem; border-bottom: 1px solid #000; padding-bottom: 0.5rem;">Customer</h3>
            <p>Walk-in Customer</p>
          </div>
        `}
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem; border: 2px solid #000;">
        <thead>
          <tr style="background: #000; color: white;">
            <th style="text-align: left; padding: 1rem; border: 1px solid #000;">S.No.</th>
            <th style="text-align: left; padding: 1rem; border: 1px solid #000;">Particulars</th>
            <th style="text-align: center; padding: 1rem; border: 1px solid #000;">Qty</th>
            <th style="text-align: right; padding: 1rem; border: 1px solid #000;">Rate</th>
            <th style="text-align: right; padding: 1rem; border: 1px solid #000;">Tax</th>
            <th style="text-align: right; padding: 1rem; border: 1px solid #000;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        const itemTax = utils.calculateTax(itemTotal, item.taxRate || 0);
        return `
              <tr style="border-bottom: 1px solid #000;">
                <td style="padding: 1rem; border: 1px solid #000;">${index + 1}</td>
                <td style="padding: 1rem; border: 1px solid #000;"><strong>${item.name}</strong></td>
                <td style="text-align: center; padding: 1rem; border: 1px solid #000;">${item.quantity}</td>
                <td style="text-align: right; padding: 1rem; border: 1px solid #000;">${utils.formatCurrency(item.price)}</td>
                <td style="text-align: right; padding: 1rem; border: 1px solid #000;">${utils.formatCurrency(itemTax)}</td>
                <td style="text-align: right; padding: 1rem; border: 1px solid #000;"><strong>${utils.formatCurrency(itemTotal)}</strong></td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: flex-end; margin-bottom: 3rem;">
        <div style="width: 350px; border: 2px solid #000; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #000;">
            <span><strong>Subtotal:</strong></span>
            <span>${utils.formatCurrency(sale.subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #000;">
            <span><strong>Tax Amount:</strong></span>
            <span>${utils.formatCurrency(sale.tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 1rem 0; background: #000; color: white; margin-top: 0.5rem; padding-left: 1rem; padding-right: 1rem;">
            <span style="font-size: 1.5rem; font-weight: bold;">GRAND TOTAL:</span>
            <span style="font-size: 1.5rem; font-weight: bold;">${utils.formatCurrency(sale.total)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; margin-top: 0.5rem;">
            <span><strong>Payment Mode:</strong></span>
            <span style="text-transform: uppercase;">${sale.paymentMethod}</span>
          </div>
        </div>
      </div>
      
      <div style="border-top: 2px double #000; padding-top: 2rem; margin-top: 3rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <p style="font-weight: bold; font-size: 1.1rem;">${settings.receiptFooter || 'Thank you for your patronage'}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div>
            <p style="border-top: 1px solid #000; padding-top: 0.5rem; display: inline-block; min-width: 200px; text-align: center;">Customer Signature</p>
          </div>
          <div style="text-align: right;">
            <p style="border-top: 1px solid #000; padding-top: 0.5rem; display: inline-block; min-width: 200px; text-align: center;">Authorized Signatory</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 2rem; font-size: 0.875rem; color: #666;">
        <p>This is a computer-generated invoice and does not require a physical signature</p>
      </div>
    </div>
  `;
};

// Export module
window.receiptTemplates = receiptTemplates;
