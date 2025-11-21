// Reusable UI Components

// Create modal
function createModal(title, content, footer) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-' + Date.now();

    overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="btn btn-icon btn-ghost close-modal" aria-label="Close">
          <span>✕</span>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

    document.body.appendChild(overlay);

    // Close handlers
    overlay.querySelector('.close-modal').onclick = () => closeModal(overlay.id);
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal(overlay.id);
    };

    return overlay.id;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
}

// Create loading spinner
function showLoader(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.className = 'modal-overlay';
    loader.innerHTML = `
    <div style="text-align: center; color: white;">
      <div class="spinner" style="margin: 0 auto;"></div>
      <p style="margin-top: 1rem;">${message}</p>
    </div>
  `;
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
}

// Create data table
function createTable(headers, data, options = {}) {
    const {
        actions = [],
        emptyMessage = 'No data available',
        className = ''
    } = options;

    if (!data || data.length === 0) {
        return `<p class="text-center text-secondary">${emptyMessage}</p>`;
    }

    let html = `<div class="table-responsive"><table class="data-table ${className}">`;

    // Headers
    html += '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${header.label}</th>`;
    });
    if (actions.length > 0) {
        html += '<th>Actions</th>';
    }
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    data.forEach((row, index) => {
        html += '<tr>';
        headers.forEach(header => {
            let value = row[header.key];
            if (header.format) {
                value = header.format(value, row);
            }
            html += `<td>${value !== undefined ? value : '-'}</td>`;
        });

        if (actions.length > 0) {
            html += '<td class="table-actions">';
            actions.forEach(action => {
                html += `<button class="btn btn-sm ${action.className || 'btn-ghost'}" 
                        onclick="${action.onClick}(${row.id || index})">
                  ${action.label}
                </button>`;
            });
            html += '</td>';
        }

        html += '</tr>';
    });
    html += '</tbody></table></div>';

    return html;
}

// Create stat card
function createStatCard(title, value, icon, color = 'primary') {
    return `
    <div class="card stat-card">
      <div class="stat-icon" style="background: var(--${color});">
        ${icon}
      </div>
      <div class="stat-content">
        <div class="stat-label">${title}</div>
        <div class="stat-value">${value}</div>
      </div>
    </div>
  `;
}

// Create form field
function createFormField(config) {
    const {
        type = 'text',
        name,
        label,
        value = '',
        placeholder = '',
        required = false,
        options = [],
        hint = ''
    } = config;

    let html = `<div class="form-group">`;

    if (label) {
        html += `<label class="form-label" for="${name}">
              ${label}
              ${required ? '<span style="color: var(--error);">*</span>' : ''}
             </label>`;
    }

    if (type === 'select') {
        html += `<select class="form-select" id="${name}" name="${name}" ${required ? 'required' : ''}>`;
        html += `<option value="">Select ${label || name}</option>`;
        options.forEach(opt => {
            const selected = opt.value === value ? 'selected' : '';
            html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
        });
        html += '</select>';
    } else if (type === 'textarea') {
        html += `<textarea class="form-textarea" id="${name}" name="${name}" 
                       placeholder="${placeholder}" ${required ? 'required' : ''}>${value}</textarea>`;
    } else {
        html += `<input type="${type}" class="form-input" id="${name}" name="${name}" 
                    value="${value}" placeholder="${placeholder}" ${required ? 'required' : ''}>`;
    }

    if (hint) {
        html += `<div class="form-hint">${hint}</div>`;
    }

    html += '</div>';
    return html;
}

// Create badge
function createBadge(text, variant = 'primary') {
    return `<span class="badge badge-${variant}">${text}</span>`;
}

// Create alert
function createAlert(message, type = 'info') {
    return `
    <div class="alert alert-${type}">
      <span class="alert-icon">${getAlertIcon(type)}</span>
      <span class="alert-message">${message}</span>
    </div>
  `;
}

function getAlertIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Create tabs
function createTabs(tabs, activeTab = 0) {
    let html = '<div class="tabs">';
    html += '<div class="tab-list">';

    tabs.forEach((tab, index) => {
        const active = index === activeTab ? 'active' : '';
        html += `<button class="tab-button ${active}" data-tab="${index}">${tab.label}</button>`;
    });

    html += '</div><div class="tab-content">';

    tabs.forEach((tab, index) => {
        const active = index === activeTab ? 'active' : '';
        html += `<div class="tab-panel ${active}" data-panel="${index}">${tab.content}</div>`;
    });

    html += '</div></div>';
    return html;
}

// Initialize tab functionality
function initTabs(container) {
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanels = container.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabIndex = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            container.querySelector(`[data-panel="${tabIndex}"]`).classList.add('active');
        });
    });
}

// Add table styles
const tableStyles = `
<style>
.table-responsive {
  overflow-x: auto;
  margin: 1rem 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary { background: var(--primary); color: white; }
.badge-success { background: var(--success); color: white; }
.badge-warning { background: var(--warning); color: white; }
.badge-error { background: var(--error); color: white; }
.badge-secondary { background: var(--bg-tertiary); color: var(--text-primary); }

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin: 1rem 0;
}

.alert-success { background: #d1fae5; color: #065f46; }
.alert-error { background: #fee2e2; color: #991b1b; }
.alert-warning { background: #fef3c7; color: #92400e; }
.alert-info { background: #dbeafe; color: #1e40af; }

.tabs {
  margin: 1rem 0;
}

.tab-list {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--border);
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--primary);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}
</style>
`;

// Inject styles
if (!document.getElementById('component-styles')) {
    const style = document.createElement('div');
    style.id = 'component-styles';
    style.innerHTML = tableStyles;
    document.head.appendChild(style);
}

// Export components
window.components = {
    createModal,
    closeModal,
    showLoader,
    hideLoader,
    createTable,
    createStatCard,
    createFormField,
    createBadge,
    createAlert,
    createTabs,
    initTabs
};
