const pool = require('../config/database');

// Format order from database to frontend format
const formatOrder = (order) => ({
  id: order.id,
  orderId: order.order_id,
  customerId: order.customer_id,
  catererId: order.caterer_id,
  items: order.items,
  totalAmount: parseFloat(order.total_amount),
  paymentMethod: order.payment_method,
  transactionId: order.transaction_id,
  deliveryAddress: order.delivery_address,
  itemCount: order.item_count,
  orderDate: order.order_date,
  deliveryDate: order.delivery_date,
  status: order.status,
  createdAt: order.created_at
});

// Create order
exports.createOrder = async (req, res) => {
  try {
    const {
      orderId,
      customerId,
      catererId,
      items,
      totalAmount,
      paymentMethod,
      transactionId,
      deliveryAddress,
      itemCount,
      orderDate,
      deliveryDate,
      status
    } = req.body;

    if (!orderId || !customerId || !catererId || !items || !totalAmount || !paymentMethod || !itemCount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await pool.query(
      `INSERT INTO orders
      (order_id, customer_id, caterer_id, items, total_amount, payment_method, transaction_id,
       delivery_address, item_count, order_date, delivery_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        orderId,
        customerId,
        catererId,
        JSON.stringify(items),
        totalAmount,
        paymentMethod,
        transactionId || null,
        deliveryAddress || null,
        itemCount,
        orderDate || new Date(),
        deliveryDate || null,
        status || 'pending'
      ]
    );

    res.status(201).json(formatOrder(result.rows[0]));
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get orders by customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );

    const formattedOrders = result.rows.map(formatOrder);
    res.json(formattedOrders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get orders by caterer
exports.getOrdersByCaterer = async (req, res) => {
  try {
    const { catererId } = req.query;

    if (!catererId) {
      return res.status(400).json({ error: 'Caterer ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM orders WHERE caterer_id = $1 ORDER BY created_at DESC',
      [catererId]
    );

    const formattedOrders = result.rows.map(formatOrder);
    res.json(formattedOrders);
  } catch (error) {
    console.error('Get caterer orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(formatOrder(result.rows[0]));
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(formatOrder(result.rows[0]));
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully', order: formatOrder(result.rows[0]) });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
