// Main Application Controller
class App {
    constructor() {
        this.currentView = 'dashboard';
        this.deferredPrompt = null;
    }

    async init() {
        try {
            // Initialize database
            await window.db.init();
            console.log('Database initialized');

            // Initialize default settings
            await this.initializeDefaultSettings();

            // Load saved theme
            this.loadTheme();

            // Setup event listeners
            this.setupEventListeners();

            // Register service worker
            this.registerServiceWorker();

            // Setup PWA install prompt
            this.setupInstallPrompt();

            // Load dashboard data
            await this.loadDashboard();

            // Initialize receipt templates
            await window.receiptTemplates.initDefaultTemplates();

            console.log('App initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            utils.showToast('Error initializing app', 'error');
        }
    }

    async initializeDefaultSettings() {
        const existingSettings = await window.db.get('settings', 'appSettings');

        if (!existingSettings) {
            const defaultSettings = {
                key: 'appSettings',
                storeName: 'My Store',
                storeAddress: '',
                storePhone: '',
                storeEmail: '',
                storeLogo: '',
                currencySymbol: '$',
                currencyCode: 'USD',
                decimalPlaces: 2,
                taxEnabled: true,
                taxName: 'GST',
                taxRate: 18,
                receiptFooter: 'Thank you for your business!',
                lowStockThreshold: 10,
                theme: 'light',
                language: 'en'
            };

            await window.db.add('settings', defaultSettings);
            utils.storage.set('appSettings', defaultSettings);
        } else {
            utils.storage.set('appSettings', existingSettings);
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Back button
        document.getElementById('backButton')?.addEventListener('click', () => {
            this.goBack();
        });

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.navigateTo(view);
            });
        });
    }

    loadTheme() {
        const settings = utils.storage.get('appSettings', {});
        const theme = settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        this.updateThemeIcon(newTheme);

        // Save to settings
        const settings = utils.storage.get('appSettings', {});
        settings.theme = newTheme;
        utils.storage.set('appSettings', settings);
        window.db.update('settings', settings);
    }

    updateThemeIcon(theme) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            // Show install prompt after 3 seconds
            setTimeout(() => {
                const installPrompt = document.getElementById('installPrompt');
                if (installPrompt) {
                    installPrompt.classList.remove('hidden');
                }
            }, 3000);
        });
    }

    async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            utils.showToast('App installed successfully!', 'success');
        }

        this.deferredPrompt = null;
        document.getElementById('installPrompt')?.classList.add('hidden');
    }

    dismissInstallPrompt() {
        document.getElementById('installPrompt')?.classList.add('hidden');
    }

    async loadDashboard() {
        try {
            // Get stats
            const products = await window.db.getAll('products');
            const customers = await window.db.getAll('customers');
            const sales = await window.db.getAll('sales');

            // Calculate today's sales
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaySales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= today;
            });

            const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

            // Update stats
            document.getElementById('todaySales').textContent = utils.formatCurrency(todayTotal);
            document.getElementById('totalProducts').textContent = products.length;
            document.getElementById('totalCustomers').textContent = customers.length;
            document.getElementById('totalTransactions').textContent = sales.length;

            // Load recent sales
            this.loadRecentSales(sales);

            // Load low stock items
            this.loadLowStockItems(products);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    loadRecentSales(sales) {
        const container = document.getElementById('recentSales');
        if (!container) return;

        const recentSales = sales
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentSales.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">No sales yet</p>';
            return;
        }

        const headers = [
            { key: 'id', label: 'Invoice #' },
            { key: 'date', label: 'Date', format: (val) => utils.formatDate(val, 'datetime') },
            { key: 'items', label: 'Items', format: (val) => val.length },
            { key: 'total', label: 'Total', format: (val) => utils.formatCurrency(val) }
        ];

        container.innerHTML = components.createTable(headers, recentSales);
    }

    loadLowStockItems(products) {
        const container = document.getElementById('lowStockItems');
        if (!container) return;

        const settings = utils.storage.get('appSettings', {});
        const threshold = settings.lowStockThreshold || 10;

        const lowStock = products.filter(p => p.stock <= threshold);

        if (lowStock.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">All items in stock</p>';
            return;
        }

        const headers = [
            { key: 'name', label: 'Product' },
            { key: 'sku', label: 'SKU' },
            { key: 'stock', label: 'Stock', format: (val) => `<span style="color: var(--error); font-weight: 600;">${val}</span>` }
        ];

        container.innerHTML = components.createTable(headers, lowStock);
    }

    async navigateTo(view) {
        this.currentView = view;

        // Update back button visibility
        const backButton = document.getElementById('backButton');
        if (backButton) {
            if (view === 'dashboard') {
                backButton.style.display = 'none';
            } else {
                backButton.style.display = 'inline-flex';
            }
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) {
                item.classList.add('active');
            }
        });

        // Hide dashboard, show dynamic view
        const dashboardView = document.getElementById('dashboardView');
        const dynamicView = document.getElementById('dynamicView');

        if (view === 'dashboard') {
            dashboardView.classList.add('active');
            dynamicView.classList.remove('active');
            dynamicView.innerHTML = '';
            await this.loadDashboard();
        } else {
            dashboardView.classList.remove('active');
            dynamicView.classList.add('active');

            // Load view content
            await this.loadView(view);
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    goBack() {
        // Navigate back to dashboard
        this.navigateTo('dashboard');
    }

    async loadView(view) {
        const container = document.getElementById('dynamicView');

        try {
            switch (view) {
                case 'pos':
                    await window.posModule.render(container);
                    break;
                case 'products':
                    await window.productsModule.render(container);
                    break;
                case 'customers':
                    await window.customersModule.render(container);
                    break;
                case 'reports':
                    await window.reportsModule.render(container);
                    break;
                case 'settings':
                    await window.settingsModule.render(container);
                    break;
                default:
                    container.innerHTML = '<h1>Page not found</h1>';
            }
        } catch (error) {
            console.error(`Error loading ${view}:`, error);
            container.innerHTML = `<div class="card"><p class="text-center text-error">Error loading ${view}</p></div>`;
        }
    }
}

// Global navigation function
function navigateTo(view) {
    if (window.app) {
        window.app.navigateTo(view);
    }
}

// Global install functions
function installApp() {
    if (window.app) {
        window.app.installApp();
    }
}

function dismissInstallPrompt() {
    if (window.app) {
        window.app.dismissInstallPrompt();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new App();
    await window.app.init();
});

// Add view styles
const viewStyles = `
<style>
.view {
  display: none;
}

.view.active {
  display: block;
}

@media (min-width: 640px) {
  .app-main {
    padding-bottom: var(--space-lg);
  }
}

@media (max-width: 639px) {
  .app-main {
    padding-bottom: 80px;
  }
}
</style>
`;

if (!document.getElementById('view-styles')) {
    const style = document.createElement('div');
    style.id = 'view-styles';
    style.innerHTML = viewStyles;
    document.head.appendChild(style);
}
