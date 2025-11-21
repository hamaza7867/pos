// Utility Functions for POS Application

// Format currency
function formatCurrency(amount, currency = 'USD') {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    const currencySymbol = settings.currencySymbol || '$';
    const decimalPlaces = settings.decimalPlaces || 2;

    return `${currencySymbol}${parseFloat(amount).toFixed(decimalPlaces)}`;
}

// Format date
function formatDate(date, format = 'short') {
    const d = new Date(date);

    if (format === 'short') {
        return d.toLocaleDateString();
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString();
    } else if (format === 'datetime') {
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }

    return d.toLocaleDateString();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate SKU
function generateSKU(prefix = 'PRD') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// Calculate tax
function calculateTax(amount, taxRate) {
    return (amount * taxRate) / 100;
}

// Calculate discount
function calculateDiscount(amount, discount, isPercentage = true) {
    if (isPercentage) {
        return (amount * discount) / 100;
    }
    return discount;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone
function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        animation: 'slideUp 0.3s ease',
        minWidth: '200px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });

    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    toast.style.background = colors[type] || colors.info;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Confirm dialog
function confirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
    <div class="modal" style="max-width: 400px;">
      <div class="modal-header">
        <h3 class="modal-title">Confirm</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
        <button class="btn btn-primary" id="confirmBtn">Confirm</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    document.getElementById('confirmBtn').onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };

    document.getElementById('cancelBtn').onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
        }
    };
}

// Export data to JSON
function exportToJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, filename);
}

// Export data to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, filename);
}

// Download file
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import JSON file
function importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            callback(data);
        } catch (error) {
            showToast('Invalid JSON file', 'error');
        }
    };
    reader.readAsText(file);
}

// Search in array of objects
function searchObjects(objects, searchTerm, fields) {
    const term = searchTerm.toLowerCase();
    return objects.filter(obj =>
        fields.some(field =>
            String(obj[field]).toLowerCase().includes(term)
        )
    );
}

// Sort array of objects
function sortObjects(objects, field, ascending = true) {
    return objects.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (typeof aVal === 'string') {
            return ascending
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return ascending ? aVal - bVal : bVal - aVal;
    });
}

// Get date range
function getDateRange(range) {
    const now = new Date();
    const start = new Date();

    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'yesterday':
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            now.setDate(now.getDate() - 1);
            now.setHours(23, 59, 59, 999);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(start.getFullYear() - 1);
            break;
        default:
            start.setHours(0, 0, 0, 0);
    }

    return { start, end: now };
}

// Print element
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="css/main.css">');
    printWindow.document.write('<link rel="stylesheet" href="css/receipt-templates.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Local storage helpers
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }
};

// Export utilities
window.utils = {
    formatCurrency,
    formatDate,
    generateId,
    generateSKU,
    calculateTax,
    calculateDiscount,
    validateEmail,
    validatePhone,
    debounce,
    showToast,
    confirm,
    exportToJSON,
    exportToCSV,
    downloadFile,
    importJSON,
    searchObjects,
    sortObjects,
    getDateRange,
    printElement,
    storage
};
