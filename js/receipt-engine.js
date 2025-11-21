// Receipt Engine - Handles receipt generation and printing
const receiptEngine = {
    currentSale: null,
    currentCustomer: null,

    async showReceipt(sale, customer = null) {
        this.currentSale = sale;
        this.currentCustomer = customer;

        const settings = utils.storage.get('appSettings', {});
        const template = settings.defaultReceiptTemplate || 'thermal-80-standard';

        const receiptHTML = await this.generateReceipt(template);

        const modalContent = `
      <div id="receiptPreview">
        ${receiptHTML}
      </div>
    `;

        const modalFooter = `
      <button class="btn btn-ghost" onclick="components.closeModal('receiptModal')">Close</button>
      <button class="btn btn-outline" onclick="receiptEngine.downloadReceipt()">📥 Download</button>
      <button class="btn btn-primary" onclick="receiptEngine.printReceipt()">🖨️ Print</button>
    `;

        const modalId = components.createModal('Receipt', modalContent, modalFooter);
        document.getElementById(modalId).id = 'receiptModal';
    },

    async generateReceipt(templateName) {
        const settings = utils.storage.get('appSettings', {});
        const template = window.receiptTemplates.templates[templateName];

        if (!template) {
            return '<p>Template not found</p>';
        }

        return template(this.currentSale, this.currentCustomer, settings);
    },

    printReceipt() {
        const receiptContent = document.getElementById('receiptPreview').innerHTML;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${this.currentSale.id}</title>
          <link rel="stylesheet" href="css/main.css">
          <link rel="stylesheet" href="css/receipt-templates.css">
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    },

    downloadReceipt() {
        const receiptContent = document.getElementById('receiptPreview').innerHTML;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt #${this.currentSale.id}</title>
          <link rel="stylesheet" href="css/main.css">
          <link rel="stylesheet" href="css/receipt-templates.css">
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `;

        const blob = new Blob([html], { type: 'text/html' });
        const filename = `receipt_${this.currentSale.id}_${new Date().toISOString().split('T')[0]}.html`;
        utils.downloadFile(blob, filename);
    }
};

// Export module
window.receiptEngine = receiptEngine;
