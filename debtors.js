document.addEventListener('DOMContentLoaded', () => {
    const addDebtorForm = document.getElementById('add-debtor-form');
    const debtorsList = document.getElementById('debtors-list');
    const searchDebtor = document.getElementById('search-debtor');
    const paymentModal = document.getElementById('payment-modal');
    const paymentModalClose = document.getElementById('payment-modal-close');
    const paymentPartBtn = document.getElementById('payment-part-btn');
    const paymentFullBtn = document.getElementById('payment-full-btn');
    const paymentAmount = document.getElementById('payment-amount');

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
    let debtors = JSON.parse(localStorage.getItem('debtors')) || [];
    let currentPaymentIndex = null;

    function saveDebtors() {
        localStorage.setItem('debtors', JSON.stringify(debtors));
        updateSummary();
    }

    function renderDebtors(items = debtors) {
        debtorsList.innerHTML = '';
        if (items.length === 0) {
            debtorsList.innerHTML = '<tr><td colspan="10" class="no-records">No debtors on record</td></tr>';
            return;
        }

        items.forEach((debtor, index) => {
            const totalPrice = (debtor.quantity * debtor.price).toFixed(2);
            const amountPaid = debtor.amountPaid || 0;
            const balance = (totalPrice - amountPaid).toFixed(2);

            // Determine item category
            let itemCategory = debtor.itemCategory || 'General';
            if (debtor.category) {
                if (debtor.category.includes('Men')) itemCategory = 'Men';
                else if (debtor.category.includes('Ladies') || debtor.category === 'Women') itemCategory = 'Women';
                else if (debtor.category.includes('Children')) itemCategory = 'Children';
                else if (debtor.category.includes('Unisex')) itemCategory = 'Unisex';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${debtor.name}</strong></td>
                <td>${debtor.number || debtor.phone}</td>
                <td>${debtor.item}</td>
                <td>${debtor.quantity}</td>
                <td><span class="category-badge" style="background: #667eea; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem;">${itemCategory}</span></td>
                <td style="font-weight: 600;">GHS ${totalPrice}</td>
                <td class="amount-paid">GHS ${amountPaid.toFixed(2)}</td>
                <td class="balance-debt" style="color: ${parseFloat(balance) > 0 ? '#f5576c' : '#43e97b'}; font-weight: 600;">GHS ${balance}</td>
                <td>${debtor.date}</td>
                <td>
                    <button class="partial-payment-btn" data-index="${index}" style="background: #4facfe; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; margin-right: 0.5rem; box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3); transition: all 0.3s ease;">
                        Part Payment
                    </button>
                    <button class="paid-btn" data-index="${index}" style="background: #43e97b; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3); transition: all 0.3s ease;">
                        Paid
                    </button>
                </td>
            `;
            debtorsList.appendChild(tr);
        });
    }

    function addDebtor(e) {
        e.preventDefault();
        const name = document.getElementById('debtor-name').value.trim();
        const number = document.getElementById('debtor-phone').value.trim();
        const category = document.getElementById('debtor-category').value;
        const item = document.getElementById('debtor-item').value.trim();
        const quantity = parseInt(document.getElementById('debtor-quantity').value);
        const price = parseFloat(document.getElementById('debtor-price').value);

        if (name && number && category && item && !isNaN(quantity) && !isNaN(price)) {
            const debtor = {
                name,
                number,
                category,
                item,
                quantity,
                price,
                amountOwed: quantity * price,
                amountPaid: 0,
                paymentHistory: [],
                date: new Date().toLocaleDateString(),
                timestamp: new Date().toLocaleString()
            };
            debtors.push(debtor);
            saveDebtors();
            renderDebtors();
            addDebtorForm.reset();
            showAlert(`✅ Debtor added: ${name} owes GHS ${(quantity * price).toFixed(2)}`);
        }
    }

    function recordPartialPayment(index) {
        currentPaymentIndex = index;
        const debtor = debtors[index];
        const totalPrice = (debtor.quantity * debtor.price).toFixed(2);
        const currentBalance = (totalPrice - (debtor.amountPaid || 0)).toFixed(2);

        document.getElementById('payment-modal-title').textContent = 'Record Payment';
        document.getElementById('payment-debtor-info').innerHTML = `
            <strong>Debtor:</strong> ${debtor.name} (${debtor.number || debtor.phone})<br>
            <strong>Item:</strong> ${debtor.item} (Qty: ${debtor.quantity})
        `;
        document.getElementById('payment-balance').textContent = `GHS ${currentBalance}`;
        paymentAmount.value = '';
        paymentAmount.placeholder = `Enter amount (max GHS ${currentBalance})`;

        paymentModal.style.display = 'block';
        paymentAmount.focus();
    }

    function processPayment(isFullPayment = false) {
        if (currentPaymentIndex === null) return;

        const debtor = debtors[currentPaymentIndex];
        const totalPrice = (debtor.quantity * debtor.price);
        const currentBalance = totalPrice - (debtor.amountPaid || 0);
        const inputAmount = parseFloat(paymentAmount.value);

        if (!inputAmount || inputAmount <= 0) {
            showAlert('Please enter a valid payment amount!');
            return;
        }

        if (inputAmount > currentBalance) {
            showAlert(`Payment cannot exceed balance of GHS ${currentBalance.toFixed(2)}!`);
            return;
        }

        if (isFullPayment && inputAmount < currentBalance) {
            showAlert('Amount does not cover full balance. Use Part Payment instead!');
            return;
        }

        // Update amount paid
        debtor.amountPaid = (debtor.amountPaid || 0) + inputAmount;

        // Record payment history
        if (!debtor.paymentHistory) {
            debtor.paymentHistory = [];
        }
        debtor.paymentHistory.push({
            amount: inputAmount,
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toLocaleString(),
            type: isFullPayment ? 'Full Payment' : 'Partial Payment'
        });

        const newBalance = (totalPrice - debtor.amountPaid).toFixed(2);

        if (isFullPayment || parseFloat(newBalance) === 0) {
            // Move to paid debtors
            let paidDebtors = JSON.parse(localStorage.getItem('paidDebtors')) || [];
            paidDebtors.push({
                ...debtor,
                totalPaid: debtor.amountPaid,
                paidDate: new Date().toLocaleDateString(),
                paidTimestamp: new Date().toLocaleString()
            });
            localStorage.setItem('paidDebtors', JSON.stringify(paidDebtors));

            // Remove from active debtors
            debtors.splice(currentPaymentIndex, 1);
            showAlert(`✅ Payment of GHS ${inputAmount.toFixed(2)} recorded!\n${debtor.name} debt has been marked as fully paid.`);
        } else {
            showAlert(`✅ Partial payment of GHS ${inputAmount.toFixed(2)} recorded!\n\nNew Balance: GHS ${newBalance}`);
        }

        saveDebtors();
        renderDebtors();
        paymentModal.style.display = 'none';
        currentPaymentIndex = null;
    }

    function markAsPaid(index) {
        recordPartialPayment(index);
    }

    function searchDebtors() {
        const searchTerm = searchDebtor.value.toLowerCase();
        let filteredDebtors = debtors;

        if (searchTerm) {
            filteredDebtors = debtors.filter(debtor =>
                debtor.name.toLowerCase().includes(searchTerm) ||
                debtor.phone.includes(searchTerm) ||
                debtor.item.toLowerCase().includes(searchTerm)
            );
        }

        renderDebtors(filteredDebtors);
    }

    function updateSummary() {
        // Total debtors
        document.getElementById('total-debtors').textContent = debtors.length;

        // Total outstanding balance (not total debt)
        const totalBalance = debtors.reduce((sum, debtor) => {
            const totalPrice = debtor.quantity * debtor.price;
            const amountPaid = debtor.amountPaid || 0;
            return sum + (totalPrice - amountPaid);
        }, 0).toFixed(2);
        document.getElementById('total-debt').textContent = 'GHS ' + totalBalance;
    }

    addDebtorForm.addEventListener('submit', addDebtor);
    searchDebtor.addEventListener('input', searchDebtors);

    // Payment modal handlers
    paymentModalClose.addEventListener('click', () => {
        paymentModal.style.display = 'none';
        currentPaymentIndex = null;
    });

    paymentPartBtn.addEventListener('click', () => {
        processPayment(false);
    });

    paymentFullBtn.addEventListener('click', () => {
        processPayment(true);
    });

    paymentAmount.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processPayment(false);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
            currentPaymentIndex = null;
        }
    });

    debtorsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('paid-btn')) {
            const index = e.target.dataset.index;
            markAsPaid(index);
        }
        if (e.target.classList.contains('partial-payment-btn')) {
            const index = e.target.dataset.index;
            recordPartialPayment(index);
        }
    });

    renderDebtors();
    updateSummary();
});
