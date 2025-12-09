// Global variables for modal functions
let purchaseHistory = [];
let deletedSales = [];

// Custom alert function (removes browser's "This page says" prefix)
window.showAlert = function (message) {
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
};

// Test function to manually save a deleted sale (for debugging)
window.testDeletedSales = function () {
    const testSale = {
        name: 'TEST ITEM',
        category: 'Test Category',
        price: 50,
        quantity: 1,
        timestamp: new Date().toLocaleString(),
        date: new Date().toDateString(),
        revenue: 50,
        deletedAt: new Date().toLocaleString()
    };

    const currentDeleted = JSON.parse(localStorage.getItem('deletedSales')) || [];
    currentDeleted.push(testSale);
    localStorage.setItem('deletedSales', JSON.stringify(currentDeleted));

    showAlert('Test deleted sale saved!\nTotal deleted sales: ' + currentDeleted.length + '\n\nGo to admin page to verify.');
    console.log('Test sale saved:', testSale);
    console.log('All deleted sales:', currentDeleted);
};

function showTodaysSalesModal() {
    const today = new Date().toDateString();
    const todaysSales = purchaseHistory.filter(item => item.date === today);
    const modal = document.getElementById('sales-modal');
    const tbody = document.getElementById('sales-list-body');
    const noSalesMsg = document.getElementById('no-sales-text');

    // Clear previous content
    tbody.innerHTML = '';

    if (todaysSales.length === 0) {
        noSalesMsg.style.display = 'block';
        document.getElementById('sales-list-table').style.display = 'none';
    } else {
        noSalesMsg.style.display = 'none';
        document.getElementById('sales-list-table').style.display = 'table';

        todaysSales.forEach((sale, index) => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #eee';

            const timeStr = sale.timestamp ? sale.timestamp.split(',')[1].trim() : 'N/A';

            row.innerHTML = `
                <td style="padding: 1rem; border: 1px solid #ddd;">${sale.name}</td>
                <td style="padding: 1rem; border: 1px solid #ddd;">${sale.category}</td>
                <td style="padding: 1rem; text-align: center; border: 1px solid #ddd;">${sale.quantity}</td>
                <td style="padding: 1rem; text-align: right; border: 1px solid #ddd;">GHS ${parseFloat(sale.revenue).toFixed(2)}</td>
                <td style="padding: 1rem; text-align: center; border: 1px solid #ddd; font-size: 0.9rem;">${timeStr}</td>
                <td style="padding: 1rem; text-align: center; border: 1px solid #ddd;">
                    <button onclick="deleteSaleByIndex(${index})" style="background: #f5576c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600;">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Show modal
    modal.style.display = 'block';
}

function closeTodaysSalesModal() {
    document.getElementById('sales-modal').style.display = 'none';
}

window.deleteSaleByIndex = function (index) {
    const today = new Date().toDateString();
    const todaysSales = purchaseHistory.filter(item => item.date === today);

    if (confirm('Are you sure you want to delete this sale?\n\nDeleted sales will appear in the admin hub.')) {
        const saleToDelete = todaysSales[index];

        if (saleToDelete) {
            // Reload deletedSales from localStorage to get latest data
            deletedSales = JSON.parse(localStorage.getItem('deletedSales')) || [];

            // Add to deleted sales with exact same format as the original sale, plus deletion timestamp
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

            // Remove from purchase history - find exact match using timestamp and name
            const purchaseIndex = purchaseHistory.findIndex(p =>
                p.name === saleToDelete.name &&
                p.timestamp === saleToDelete.timestamp
            );

            if (purchaseIndex > -1) {
                purchaseHistory.splice(purchaseIndex, 1);
            }

            // Save both arrays to localStorage
            localStorage.setItem('deletedSales', JSON.stringify(deletedSales));
            localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));

            // Verify the save worked
            const verifyDeleted = localStorage.getItem('deletedSales');
            const parsedDeleted = JSON.parse(verifyDeleted);

            console.log('=== DELETION SUCCESSFUL ===');
            console.log('Deleted item:', saleToDelete.name);
            console.log('Deleted record saved:', deletedRecord);
            console.log('Total deleted sales in memory:', deletedSales.length);
            console.log('Total deleted sales in localStorage:', parsedDeleted.length);
            console.log('localStorage raw data:', verifyDeleted);

            // Update the daily stats cards
            updateDailyStats();

            // Refresh modal to show updated list
            showTodaysSalesModal();

            // Show success message with detailed info
            showAlert(`✅ DELETION CONFIRMED!\n\n` +
                `Item: ${saleToDelete.name}\n` +
                `Category: ${saleToDelete.category}\n` +
                `Amount: GHS ${saleToDelete.revenue}\n\n` +
                `Total Deleted Sales: ${deletedSales.length}\n\n` +
                `This record is now saved and will appear in the Admin Hub under "Deleted Sales".`);
        }
    }
};

// Make updateDailyStats globally accessible
function updateDailyStats() {
    const today = new Date().toDateString();
    const todaysPurchases = purchaseHistory.filter(item => item.date === today);

    const purchaseCount = todaysPurchases.length;
    const totalRevenue = todaysPurchases.reduce((sum, item) => sum + parseFloat(item.revenue), 0).toFixed(2);

    const purchasesElement = document.getElementById('today-purchases');
    const revenueElement = document.getElementById('today-revenue');

    if (purchasesElement) {
        purchasesElement.textContent = purchaseCount;
    }
    if (revenueElement) {
        revenueElement.textContent = `GHS ${totalRevenue}`;
    }
}

function setupModalListeners() {
    const modal = document.getElementById('sales-modal');

    // Close modal when clicking outside (on the dark overlay)
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target.id === 'sales-modal') {
                closeTodaysSalesModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('sales-modal');
            if (modal && modal.style.display === 'block') {
                closeTodaysSalesModal();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const addItemForm = document.getElementById('add-item-form');
    const salesForm = document.getElementById('sales-form');
    const stockList = document.getElementById('stock-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const salesCategorySelect = document.getElementById('sales-category');
    const salesItemSelect = document.getElementById('sales-item');
    const salesQuantityInput = document.getElementById('sales-quantity');
    const salesAmountInput = document.getElementById('sales-amount');


    // Initialize with sample data if empty
    let stock = JSON.parse(localStorage.getItem('stock')) || [];
    purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory')) || [];
    let reversalHistory = JSON.parse(localStorage.getItem('reversalHistory')) || [];
    deletedSales = JSON.parse(localStorage.getItem('deletedSales')) || [];

    function initializeSampleData() {
        // Sample data removed - start with empty inventory
        return [];
    }

    function saveStock() {
        localStorage.setItem('stock', JSON.stringify(stock));
    }

    function savePurchaseHistory() {
        localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
        updateDailyStats();
    }

    function saveReversalHistory() {
        localStorage.setItem('reversalHistory', JSON.stringify(reversalHistory));
        updateDailyStats();
    }

    function saveDeletedSales() {
        localStorage.setItem('deletedSales', JSON.stringify(deletedSales));
    }

    function renderStock(items = stock) {
        stockList.innerHTML = '';
        if (items.length === 0) {
            stockList.innerHTML = '<tr><td colspan="6">No items in stock.</td></tr>';
            return;
        }

        items.forEach((item, index) => {
            const totalValue = (item.quantity * item.price).toFixed(2);
            let badgeClass = "ladies";
            let displayCategory = item.category;

            // Map old category names to new ones
            if (item.category.includes("Men")) {
                badgeClass = "mens";
                displayCategory = "Men";
            } else if (item.category.includes("Ladies") || item.category === "Women") {
                badgeClass = "ladies";
                displayCategory = "Women";
            } else if (item.category.includes("Children")) {
                badgeClass = "children";
                displayCategory = "Children";
            } else if (item.category.includes("Unisex")) {
                badgeClass = "unisex";
                displayCategory = "Unisex";
            }

            // Find the actual index in the main stock array
            const actualIndex = stock.findIndex(s => s.name === item.name && s.category === item.category && s.price === item.price);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td><span class="category-badge ${badgeClass}">${displayCategory}</span></td>
                <td>${item.quantity}</td>
                <td>GHS ${item.price.toFixed(2)}</td>
                <td class="total-value">GHS ${totalValue}</td>
                <td><button onclick="deleteItem(${actualIndex})" style="background: #ff6b6b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">Remove</button></td>
            `;
            stockList.appendChild(tr);
        });
        updateCategoryFilter();
    }

    function updateCategoryFilter() {
        const categories = ['all', ...new Set(stock.map(item => item.category))];
        categoryFilter.innerHTML = categories.map(category => `<option value="${category}">${category === 'all' ? 'All Categories' : category}</option>`).join('');
    }

    function recordManualSale(e) {
        e.preventDefault();

        const itemName = salesItemSelect.value.trim();
        const selectedCategory = salesCategorySelect.value;
        const quantity = parseInt(salesQuantityInput.value);
        const amount = parseFloat(salesAmountInput.value);

        // Validate all fields are filled
        if (!itemName || !selectedCategory || !quantity || !amount) {
            showAlert('Please fill in all fields: category, item name, quantity, and amount');
            return;
        }

        const now = new Date();

        // Create purchase records for each unit sold
        for (let i = 0; i < quantity; i++) {
            const purchase = {
                name: itemName,
                category: selectedCategory,
                price: (amount / quantity).toFixed(2),
                quantity: 1,
                timestamp: now.toLocaleString(),
                date: now.toDateString(),
                revenue: (amount / quantity).toFixed(2)
            };
            purchaseHistory.push(purchase);
        }

        savePurchaseHistory();

        // Reset form
        salesCategorySelect.value = '';
        salesItemSelect.value = '';
        salesQuantityInput.value = '';
        salesAmountInput.value = '';

        showAlert('Sale recorded successfully!');
    }

    function addItem(e) {
        e.preventDefault();
        const name = document.getElementById('item-name').value.trim();
        const category = document.getElementById('item-category').value.trim();
        const quantity = parseInt(document.getElementById('item-quantity').value);
        const price = parseFloat(document.getElementById('item-price').value);

        if (name && category && !isNaN(quantity) && !isNaN(price)) {
            stock.push({ name, category, quantity, price });
            saveStock();
            renderStock();
            addItemForm.reset();
        }
    }

    function updateItem(index, key, value) {
        stock[index][key] = value;
        saveStock();
        filterAndRender();
    }

    function deleteItem(index) {
        stock.splice(index, 1);
        saveStock();
        filterAndRender();
    }

    function clearAllStock() {
        if (confirm('⚠️ Are you sure you want to clear ALL stock items? This cannot be undone.')) {
            stock = [];
            saveStock();
            renderStock();
        }
    }

    function recordPurchase(index) {
        const item = stock[index];
        if (item.quantity > 0) {
            const now = new Date();
            const purchase = {
                name: item.name,
                category: item.category,
                price: item.price,
                quantity: 1,
                timestamp: now.toLocaleString(),
                date: now.toDateString(),
                revenue: item.price
            };
            purchaseHistory.push(purchase);
            item.quantity -= 1;
            saveStock();
            savePurchaseHistory();
            renderStock(stock);
        } else {
            showAlert('Out of stock!');
        }
    }

    function reversePurchase(index) {
        const item = stock[index];
        const lastPurchase = purchaseHistory.filter(p => p.name === item.name).pop();

        if (lastPurchase) {
            const purchaseIndex = purchaseHistory.lastIndexOf(lastPurchase);
            purchaseHistory.splice(purchaseIndex, 1);

            const reversal = {
                ...lastPurchase,
                reversedAt: new Date().toLocaleString()
            };
            reversalHistory.push(reversal);

            item.quantity += 1;
            saveStock();
            savePurchaseHistory();
            saveReversalHistory();
            renderStock(stock);
        } else {
            showAlert('No purchase found for this item.');
        }
    }

    function filterAndRender() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        let filteredStock = stock;

        if (searchTerm) {
            filteredStock = filteredStock.filter(item => item.name.toLowerCase().includes(searchTerm));
        }

        if (selectedCategory !== 'all') {
            filteredStock = filteredStock.filter(item => item.category === selectedCategory);
        }

        renderStock(filteredStock);
    }

    addItemForm.addEventListener('submit', addItem);
    salesForm.addEventListener('submit', recordManualSale);
    searchInput.addEventListener('input', filterAndRender);
    categoryFilter.addEventListener('change', filterAndRender);

    setupModalListeners();

    renderStock();
    updateDailyStats();
});

// Passcode Change Functions
window.openPasscodeChangeModal = function () {
    document.getElementById('passcode-change-modal').style.display = 'block';
    document.getElementById('current-passcode').focus();
    document.getElementById('passcode-error').style.display = 'none';
};

window.closePasscodeChangeModal = function () {
    document.getElementById('passcode-change-modal').style.display = 'none';
    document.getElementById('current-passcode').value = '';
    document.getElementById('new-passcode').value = '';
    document.getElementById('confirm-passcode').value = '';
    document.getElementById('passcode-error').style.display = 'none';
};

window.updateAdminPasscode = function () {
    const currentPasscode = document.getElementById('current-passcode').value;
    const newPasscode = document.getElementById('new-passcode').value;
    const confirmPasscode = document.getElementById('confirm-passcode').value;
    const errorDiv = document.getElementById('passcode-error');

    // Validate inputs
    if (!currentPasscode || !newPasscode || !confirmPasscode) {
        errorDiv.textContent = '❌ Please fill in all fields';
        errorDiv.style.display = 'block';
        return;
    }

    // Get current passcode from localStorage (default is 3877)
    const storedPasscode = localStorage.getItem('adminPasscode') || '3877';

    if (currentPasscode !== storedPasscode) {
        errorDiv.textContent = '❌ Current passcode is incorrect';
        errorDiv.style.display = 'block';
        return;
    }

    if (newPasscode.length < 4) {
        errorDiv.textContent = '❌ New passcode must be at least 4 characters';
        errorDiv.style.display = 'block';
        return;
    }

    if (newPasscode !== confirmPasscode) {
        errorDiv.textContent = '❌ New passcodes do not match';
        errorDiv.style.display = 'block';
        return;
    }

    // Save new passcode to localStorage
    localStorage.setItem('adminPasscode', newPasscode);

    // Show success message
    showAlert('✅ Admin passcode has been successfully updated!\n\nNew passcode: ' + newPasscode);
    closePasscodeChangeModal();
};

// Set up modal close listeners
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('passcode-change-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target.id === 'passcode-change-modal') {
                closePasscodeChangeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closePasscodeChangeModal();
            }
        });
    }
});
