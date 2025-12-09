const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cas-inventory', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.log('❌ MongoDB connection error:', err));

// ===================== SCHEMAS =====================

// Stock Schema
const stockSchema = new mongoose.Schema({
    name: String,
    category: String,
    quantity: Number,
    price: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Purchase History Schema
const purchaseSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    quantity: Number,
    revenue: Number,
    timestamp: String,
    date: String,
    createdAt: { type: Date, default: Date.now }
});

// Deleted Sales Schema
const deletedSalesSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    quantity: Number,
    revenue: Number,
    timestamp: String,
    date: String,
    deletedAt: String,
    createdAt: { type: Date, default: Date.now }
});

// Debtors Schema
const debtorSchema = new mongoose.Schema({
    name: String,
    number: String,
    item: String,
    category: String,
    quantity: Number,
    price: Number,
    date: String,
    paidAmount: { type: Number, default: 0 },
    totalAmount: Number,
    isPaid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
    date: String,
    totalSales: Number,
    totalRevenue: Number,
    totalItems: Number,
    totalDebtors: Number,
    totalDebt: Number,
    createdAt: { type: Date, default: Date.now }
});

// Models
const Stock = mongoose.model('Stock', stockSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);
const DeletedSales = mongoose.model('DeletedSales', deletedSalesSchema);
const Debtor = mongoose.model('Debtor', debtorSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

// ===================== API ROUTES =====================

// STOCK ROUTES
app.get('/api/stock', async (req, res) => {
    try {
        const stock = await Stock.find();
        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/stock', async (req, res) => {
    try {
        const newStock = new Stock(req.body);
        await newStock.save();
        res.json(newStock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/stock/:id', async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/stock/:id', async (req, res) => {
    try {
        await Stock.findByIdAndDelete(req.params.id);
        res.json({ message: 'Stock deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PURCHASE ROUTES
app.get('/api/purchases', async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/purchases/date/:date', async (req, res) => {
    try {
        const purchases = await Purchase.find({ date: req.params.date });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/purchases', async (req, res) => {
    try {
        const newPurchase = new Purchase(req.body);
        await newPurchase.save();

        // Update analytics
        updateAnalytics();

        res.json(newPurchase);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/purchases/:id', async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);

        // Move to deleted sales
        if (purchase) {
            const deletedRecord = new DeletedSales({
                ...purchase.toObject(),
                deletedAt: new Date().toLocaleString()
            });
            await deletedRecord.save();
        }

        updateAnalytics();
        res.json({ message: 'Purchase deleted and moved to deleted sales' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETED SALES ROUTES
app.get('/api/deleted-sales', async (req, res) => {
    try {
        const deleted = await DeletedSales.find().sort({ createdAt: -1 });
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/deleted-sales/clear', async (req, res) => {
    try {
        await DeletedSales.deleteMany({});
        res.json({ message: 'Deleted sales cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DEBTORS ROUTES
app.get('/api/debtors', async (req, res) => {
    try {
        const debtors = await Debtor.find({ isPaid: false });
        res.json(debtors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/debtors', async (req, res) => {
    try {
        const newDebtor = new Debtor(req.body);
        await newDebtor.save();
        updateAnalytics();
        res.json(newDebtor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/debtors/:id/payment', async (req, res) => {
    try {
        const { amount, isFullPayment } = req.body;
        const debtor = await Debtor.findById(req.params.id);

        if (!debtor) {
            return res.status(404).json({ error: 'Debtor not found' });
        }

        debtor.paidAmount += amount;

        if (isFullPayment || debtor.paidAmount >= debtor.totalAmount) {
            debtor.isPaid = true;
        }

        await debtor.save();
        updateAnalytics();
        res.json(debtor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ANALYTICS ROUTES
app.get('/api/analytics', async (req, res) => {
    try {
        const analytics = await Analytics.find().sort({ date: -1 });
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/summary', async (req, res) => {
    try {
        const totalRevenue = await Purchase.aggregate([
            { $group: { _id: null, total: { $sum: '$revenue' } } }
        ]);

        const totalSales = await Purchase.countDocuments();
        const totalDeletedSales = await DeletedSales.countDocuments();
        const totalDebtors = await Debtor.countDocuments({ isPaid: false });
        const totalDebt = await Debtor.aggregate([
            { $match: { isPaid: false } },
            { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } }
        ]);

        res.json({
            totalRevenue: totalRevenue[0]?.total || 0,
            totalSales,
            totalDeletedSales,
            totalDebtors,
            totalDebt: totalDebt[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SYNC ROUTE - Bulk upload from localStorage
app.post('/api/sync', async (req, res) => {
    try {
        const { stock, purchases, deletedSales, debtors } = req.body;

        // You can implement smart sync logic here
        // For now, we'll just return what's in the database

        const dbStock = await Stock.find();
        const dbPurchases = await Purchase.find();
        const dbDeletedSales = await DeletedSales.find();
        const dbDebtors = await Debtor.find();

        res.json({
            stock: dbStock,
            purchases: dbPurchases,
            deletedSales: dbDeletedSales,
            debtors: dbDebtors
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================== HELPER FUNCTIONS =====================

async function updateAnalytics() {
    try {
        const today = new Date().toDateString();

        const todaysPurchases = await Purchase.find({ date: today });
        const totalSales = todaysPurchases.length;
        const totalRevenue = todaysPurchases.reduce((sum, p) => sum + p.revenue, 0);

        const stock = await Stock.find();
        const totalItems = stock.reduce((sum, s) => sum + s.quantity, 0);

        const debtors = await Debtor.find({ isPaid: false });
        const totalDebtors = debtors.length;
        const totalDebt = debtors.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

        // Update or create today's analytics
        await Analytics.findOneAndUpdate(
            { date: today },
            { totalSales, totalRevenue, totalItems, totalDebtors, totalDebt },
            { upsert: true }
        );
    } catch (error) {
        console.error('Analytics update error:', error);
    }
}

// ===================== SERVER START =====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
