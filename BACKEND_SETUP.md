# CAS STYLISH COLLECTIONS - Inventory Management System

A comprehensive inventory management system with real-time sales tracking, analytics, and audit trails.

## Features

✅ **Real-time Sales Tracking** - Record and track all sales instantly
✅ **Advanced Analytics** - View comprehensive sales and revenue analytics
✅ **Deleted Sales Audit Trail** - Track all deleted records for security
✅ **Debtor Management** - Manage credit accounts with payment tracking
✅ **Admin Dashboard** - Secure admin panel with passcode protection
✅ **Data Persistence** - All data backed up in MongoDB
✅ **Scalable Database** - Handle years of sales history

## System Architecture

### Frontend
- **index.html** - Main sales entry interface
- **admin.html** - Admin dashboard with audit trails
- **debtors.html** - Debtor management
- **analytics.html** - Advanced analytics dashboard
- **api-service.js** - API communication layer

### Backend
- **server.js** - Node.js/Express API server
- **MongoDB** - NoSQL database for data storage

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas cloud)
- Modern web browser

### Backend Setup

1. **Install Dependencies**
```bash
cd c:\Users\Kris Amoateng\OneDrive\Desktop\CAS
npm install
```

2. **Configure Environment**
Edit `.env` file:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/cas-inventory
PORT=5000
NODE_ENV=development
```

**OR** use MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cas-inventory
PORT=5000
NODE_ENV=development
```

3. **Start the Server**
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. **Install MongoDB (if using local)**
   - Download: https://www.mongodb.com/try/download/community
   - Install and ensure mongod service is running

2. **Open the Application**
   - Navigate to `index.html` in your browser
   - The system will automatically detect if the backend is available

## Database Schema

### Collections

**Stock**
```javascript
{
  name: String,
  category: String,
  quantity: Number,
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Purchases**
```javascript
{
  name: String,
  category: String,
  price: Number,
  quantity: Number,
  revenue: Number,
  timestamp: String,
  date: String,
  createdAt: Date
}
```

**DeletedSales**
```javascript
{
  name: String,
  category: String,
  price: Number,
  quantity: Number,
  revenue: Number,
  timestamp: String,
  date: String,
  deletedAt: String,
  createdAt: Date
}
```

**Debtors**
```javascript
{
  name: String,
  number: String,
  item: String,
  category: String,
  quantity: Number,
  price: Number,
  date: String,
  paidAmount: Number,
  totalAmount: Number,
  isPaid: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Analytics**
```javascript
{
  date: String,
  totalSales: Number,
  totalRevenue: Number,
  totalItems: Number,
  totalDebtors: Number,
  totalDebt: Number,
  createdAt: Date
}
```

## API Endpoints

### Stock Management
- `GET /api/stock` - Get all stock items
- `POST /api/stock` - Add new stock item
- `PUT /api/stock/:id` - Update stock item
- `DELETE /api/stock/:id` - Delete stock item

### Sales
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/date/:date` - Get sales by date
- `POST /api/purchases` - Record new sale
- `DELETE /api/purchases/:id` - Delete sale (moves to deleted sales)

### Deleted Sales Audit
- `GET /api/deleted-sales` - Get all deleted sales
- `DELETE /api/deleted-sales/clear` - Clear deleted sales history

### Debtors
- `GET /api/debtors` - Get all active debtors
- `POST /api/debtors` - Add new debtor
- `PUT /api/debtors/:id/payment` - Record payment

### Analytics
- `GET /api/analytics` - Get all analytics records
- `GET /api/analytics/summary` - Get summary statistics
- `POST /api/sync` - Sync local data with backend

## Usage

### Recording Sales
1. Open the main page
2. Fill in the "Sales Made Centre" form
3. Select category, item name, quantity, and amount
4. Click "Record Sale"
5. Sale is recorded and displayed in admin hub

### Accessing Admin Hub
1. Click the 🔐 ADMIN button in header
2. Enter your admin passcode (default: 3877)
3. View all sales, deleted records, and debtors
4. Click 📊 ANALYTICS to see detailed charts and reports

### Changing Admin Passcode
1. Click the 🔑 icon next to the profile card (bottom right)
2. Enter current and new passcode
3. Passcode is updated and secured

### Viewing Analytics
1. From admin hub, click 📊 ANALYTICS
2. View summary statistics
3. See revenue trends and category distribution
4. Review detailed daily analytics

## Security Features

🔐 **Admin Passcode** - Protect access to admin hub
🔑 **Passcode Management** - Change admin password anytime
📋 **Audit Trail** - Track all deleted sales with timestamps
🚪 **Session Management** - Automatic logout when leaving admin

## Troubleshooting

### Backend not connecting?
- Ensure MongoDB is running
- Check if server is started: `npm start`
- Verify MONGODB_URI in `.env` file
- Check port 5000 is not in use

### Data not syncing?
- Check browser console for errors
- Verify server is running
- Check network tab in DevTools
- Ensure CORS is enabled

### MongoDB connection error?
- Install MongoDB Community Edition
- Start MongoDB service
- Or use MongoDB Atlas cloud version

## Performance Notes

- **Local Storage**: Fallback when backend unavailable
- **Auto-refresh**: Admin updates every 2 seconds
- **Data Caching**: Frontend caches data locally
- **Scalability**: Database handles unlimited historical data

## Future Enhancements

- [ ] Multi-user support with individual accounts
- [ ] Export reports to PDF/Excel
- [ ] Mobile app version
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Revenue forecasting

## License

Private - CAS STYLISH COLLECTIONS

## Support

For issues or questions, refer to the system's error messages and browser console logs.
