document.addEventListener('DOMContentLoaded', () => {
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminContent = document.getElementById('admin-content');
    const adminCodeInput = document.getElementById('admin-code-input');
    const adminLoginSubmit = document.getElementById('admin-login-submit');
    const adminError = document.getElementById('admin-error');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Custom alert function
    function showAlert(message) {
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 50px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 2px solid #667eea;
        `;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            color: #333;
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
            white-space: pre-line;
        `;
        messageDiv.textContent = message;

        const button = document.createElement('button');
        button.textContent = 'OK';
        button.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.7rem 2rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        `;

        button.onmouseover = function () {
            this.style.transform = 'scale(1.05)';
        };

        button.onmouseout = function () {
            this.style.transform = 'scale(1)';
        };

        button.onclick = function () {
            overlay.remove();
            alertBox.remove();
        };

        alertBox.appendChild(messageDiv);
        alertBox.appendChild(button);

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;

        overlay.onclick = function () {
            overlay.remove();
            alertBox.remove();
        };

        document.body.appendChild(overlay);
        document.body.appendChild(alertBox);

        button.focus();
    }

    // Get admin passcode from localStorage or use default
    const ADMIN_CODE = localStorage.getItem('adminPasscode') || '3877';
    let isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';

    // Data from localStorage
    let stock = [];
    let purchaseHistory = [];
    let deletedSales = [];
    let debtors = [];

    function loadData() {
        stock = JSON.parse(localStorage.getItem('stock')) || [];
        purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
        deletedSales = JSON.parse(localStorage.getItem('deletedSales')) || [];
        debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    }

    function checkAdminLogin() {
        const code = adminCodeInput.value;
        if (code === ADMIN_CODE) {
            isAdminLoggedIn = true;
            sessionStorage.setItem('adminLoggedIn', 'true');
            adminLoginModal.style.display = 'none';
            adminContent.style.display = 'block';
            adminCodeInput.value = '';
            adminError.style.display = 'none';
            loadData();
            updateDashboard();
            setupModalListenersAdmin();
        } else {
            adminError.style.display = 'block';
            adminCodeInput.value = '';
        }
    }

    function adminLogout() {
        isAdminLoggedIn = false;
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        adminLoginModal.style.display = 'block';
        adminContent.style.display = 'none';
        adminCodeInput.value = '';
        adminError.style.display = 'none';
        showAlert('✅ You have been logged out. Please re-enter your passcode to access the admin hub.');
    }

    function showTodaysSalesModalAdmin() {
        loadData(); // Refresh data
        const today = new Date().toDateString();
        const todaysSales = purchaseHistory.filter(item => item.date === today);
        const salesModal = document.getElementById('admin-sales-modal');
        const salesModalList = document.getElementById('admin-sales-modal-list');
        const noSalesMsg = document.getElementById('admin-no-sales-msg');

        if (todaysSales.length === 0) {
            salesModalList.innerHTML = '';
            noSalesMsg.style.display = 'block';
        } else {
            noSalesMsg.style.display = 'none';
            salesModalList.innerHTML = todaysSales.map((sale, index) => {
                return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.8rem;">${sale.name}</td>
                    <td style="padding: 0.8rem;">${sale.category}</td>
                    <td style="padding: 0.8rem; text-align: center;">${sale.quantity}</td>
                    <td style="padding: 0.8rem; text-align: right;">GHS ${parseFloat(sale.price).toFixed(2)}</td>
                    <td style="padding: 0.8rem; text-align: right; font-weight: 600;">GHS ${parseFloat(sale.revenue).toFixed(2)}</td>
                    <td style="padding: 0.8rem; text-align: center; font-size: 0.85rem;">${sale.timestamp.split(',')[1].trim()}</td>
                    <td style="padding: 0.8rem; text-align: center;">
                        <button onclick="deleteAdminSaleByIndex(${index})" style="background: #f5576c; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Delete</button>
                    </td>
                </tr>
            `;
            }).join('');
        }

        salesModal.style.display = 'block';
    }

    window.deleteAdminSaleByIndex = function (index) {
        const today = new Date().toDateString();
        const todaysSales = purchaseHistory.filter(item => item.date === today);

        if (confirm('Are you sure you want to delete this sale?\n\nDeleted sales will appear in the "Deleted Sales" section.')) {
            const saleToDelete = todaysSales[index];

            if (saleToDelete) {
                // Add to deleted sales
                const deletedRecord = {
                    name: saleToDelete.name,
                    category: saleToDelete.category,
                    price: saleToDelete.price,
                    quantity: saleToDelete.quantity,
                    timestamp: saleToDelete.timestamp,
                    date: saleToDelete.date,
                    revenue: saleToDelete.revenue,
                    deletedAt: new Date().toLocaleString()
                };

                deletedSales.push(deletedRecord);
                localStorage.setItem('deletedSales', JSON.stringify(deletedSales));

                // Remove from purchase history
                const purchaseIndex = purchaseHistory.findIndex(p =>
                    p.name === saleToDelete.name &&
                    p.timestamp === saleToDelete.timestamp
                );

                if (purchaseIndex > -1) {
                    purchaseHistory.splice(purchaseIndex, 1);
                    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
                }

                showTodaysSalesModalAdmin(); // Refresh modal
                updateDashboard(); // Update dashboard
                showAlert('✅ Sale deleted successfully! It now appears in the "Deleted Sales" section.');
            }
        }
    };

    function closeTodaysSalesModalAdmin() {
        document.getElementById('admin-sales-modal').style.display = 'none';
    }

    function setupModalListenersAdmin() {
        // Modal listeners for admin page removed - Today's Purchases moved to homepage
        const salesModalClose = document.getElementById('admin-sales-modal-close');

        if (salesModalClose) {
            salesModalClose.addEventListener('click', closeTodaysSalesModalAdmin);
        }

        // Close modal when clicking outside
        const modal = document.getElementById('admin-sales-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'admin-sales-modal') {
                    closeTodaysSalesModalAdmin();
                }
            });
        }
    }

    function updateDashboard() {
        // Load fresh data from localStorage
        loadData();

        // Update stat cards
        const todayDate = new Date().toDateString();
        const todaysPurchases = purchaseHistory.filter(p => p.date === todayDate);

        document.getElementById('today-purchases').textContent = todaysPurchases.length;

        // Calculate current stock value (quantity * price for all items)
        const currentStockValue = stock.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.price)), 0).toFixed(2);
        document.getElementById('total-revenue').textContent = `GHS ${currentStockValue}`;

        // Render deleted sales
        renderDeletedSales();

        // Update analytics summary
        updateAnalyticsSummary();
    }

    function renderDeletedSales() {
        const list = document.getElementById('deleted-sales-list');

        // Debug logging
        console.log('Admin - Rendering deleted sales...');
        console.log('Admin - deletedSales array:', deletedSales);
        console.log('Admin - deletedSales length:', deletedSales.length);
        console.log('Admin - localStorage deletedSales:', localStorage.getItem('deletedSales'));

        if (deletedSales.length === 0) {
            list.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No deleted sales yet</p>';
            return;
        }

        const recentDeleted = deletedSales.slice(-15).reverse();
        list.innerHTML = recentDeleted.map(sale => `
            <div style="background: #f9f9f9; padding: 0.8rem; margin-bottom: 0.5rem; border-left: 3px solid #f5576c; border-radius: 4px;">
                <div style="font-weight: 600; color: #333; font-size: 0.95rem;">${sale.name}</div>
                <div style="font-size: 0.85rem; color: #666; margin-top: 0.3rem;">
                    ${sale.category} | Qty: ${sale.quantity} | GHS ${sale.revenue}
                </div>
                <div style="font-size: 0.8rem; color: #999; margin-top: 0.2rem;">
                    Deleted: ${sale.deletedAt}
                </div>
            </div>
        `).join('');

        console.log('Admin - Rendered', recentDeleted.length, 'deleted sales');
    }

    function updateAnalyticsSummary() {
        // Calculate total revenue
        const totalRevenue = purchaseHistory.reduce((sum, item) => sum + parseFloat(item.revenue), 0).toFixed(2);
        document.getElementById('analytics-total-revenue').textContent = `GHS ${totalRevenue}`;

        // Total sales count
        document.getElementById('analytics-total-sales').textContent = purchaseHistory.length;

        // Deleted records count
        document.getElementById('analytics-total-deleted').textContent = deletedSales.length;

        // Calculate total debt
        const debtors = JSON.parse(localStorage.getItem('debtors')) || [];
        let totalDebt = 0;
        debtors.forEach(debtor => {
            const owed = debtor.totalAmount - (debtor.paidAmount || 0);
            if (owed > 0) totalDebt += owed;
        });
        document.getElementById('analytics-total-debt').textContent = `GHS ${totalDebt.toFixed(2)}`;
    }

    function clearDeletedSalesHistory() {
        if (confirm('⚠️ Clear all deleted sales? This cannot be undone.')) {
            deletedSales = [];
            localStorage.setItem('deletedSales', JSON.stringify([]));
            updateDashboard();
            showAlert('✅ Deleted sales cleared!');
        }
    }

    function clearAllSalesRecords() {
        if (confirm('⚠️ Delete ALL sales records? This will remove all purchase history!\n\nAre you absolutely sure?')) {
            const confirm2 = confirm('This action cannot be undone. Delete all sales records?');
            if (confirm2) {
                purchaseHistory = [];
                localStorage.setItem('purchaseHistory', JSON.stringify([]));
                updateDashboard();
                showAlert('✅ All sales records have been deleted!');
            }
        }
    }

    // Event listeners
    adminLoginSubmit.addEventListener('click', checkAdminLogin);
    adminCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAdminLogin();
        }
    });
    adminLogoutBtn.addEventListener('click', adminLogout);

    document.getElementById('clear-deleted-sales-btn').addEventListener('click', clearDeletedSalesHistory);

    // Initialize
    adminCodeInput.focus();

    if (isAdminLoggedIn) {
        adminLoginModal.style.display = 'none';
        adminContent.style.display = 'block';
        loadData();
        updateDashboard();
        setupModalListenersAdmin();
    }

    // Refresh every 2 seconds
    setInterval(() => {
        if (isAdminLoggedIn) {
            updateDashboard();
        }
    }, 2000);

    // Logout when leaving admin page
    window.addEventListener('beforeunload', () => {
        if (isAdminLoggedIn) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminLoginTime');
        }
    });

    // Auto-logout if user navigates back to this page without logging in again
    window.addEventListener('pageshow', () => {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        if (!isLoggedIn) {
            adminLoginModal.style.display = 'block';
            adminContent.style.display = 'none';
            adminCodeInput.value = '';
        }
    });
});
