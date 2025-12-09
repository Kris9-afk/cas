// API Service for communicating with backend
class APIService {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
        this.isConnected = false;
        this.checkConnection();
    }

    // Check if API is available
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`, {
                method: 'HEAD',
                mode: 'no-cors'
            });
            this.isConnected = true;
            console.log('✅ Connected to backend API');
        } catch (error) {
            this.isConnected = false;
            console.log('⚠️ Backend API not available - using localStorage');
        }
    }

    // ===== STOCK ROUTES =====
    async getStock() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/stock`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching stock:', error);
            return null;
        }
    }

    async addStock(stockData) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stockData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding stock:', error);
            return null;
        }
    }

    async updateStock(id, stockData) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/stock/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stockData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating stock:', error);
            return null;
        }
    }

    async deleteStock(id) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/stock/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting stock:', error);
            return null;
        }
    }

    // ===== PURCHASE ROUTES =====
    async getPurchases() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/purchases`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching purchases:', error);
            return null;
        }
    }

    async getPurchasesByDate(date) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/purchases/date/${date}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching purchases by date:', error);
            return null;
        }
    }

    async addPurchase(purchaseData) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/purchases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding purchase:', error);
            return null;
        }
    }

    async deletePurchase(id) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/purchases/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting purchase:', error);
            return null;
        }
    }

    // ===== DELETED SALES ROUTES =====
    async getDeletedSales() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/deleted-sales`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching deleted sales:', error);
            return null;
        }
    }

    async clearDeletedSales() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/deleted-sales/clear`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error clearing deleted sales:', error);
            return null;
        }
    }

    // ===== DEBTORS ROUTES =====
    async getDebtors() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/debtors`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching debtors:', error);
            return null;
        }
    }

    async addDebtor(debtorData) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/debtors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(debtorData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding debtor:', error);
            return null;
        }
    }

    async recordDebtorPayment(id, amount, isFullPayment) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/debtors/${id}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, isFullPayment })
            });
            return await response.json();
        } catch (error) {
            console.error('Error recording payment:', error);
            return null;
        }
    }

    // ===== ANALYTICS ROUTES =====
    async getAnalytics() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/analytics`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return null;
        }
    }

    async getAnalyticsSummary() {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/analytics/summary`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            return null;
        }
    }

    // ===== SYNC ROUTE =====
    async syncData(localData) {
        if (!this.isConnected) return null;
        try {
            const response = await fetch(`${this.baseURL}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error syncing data:', error);
            return null;
        }
    }
}

// Create global API service instance
const apiService = new APIService();
