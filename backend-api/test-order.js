const fetch = require('node-fetch');

const testOrder = {
  orderId: `ORD-TEST-${Date.now()}`,
  customerId: 1,
  catererId: 2,
  items: [
    {
      id: 1,
      name: "Test Item",
      price: 100,
      quantity: 1,
      category: "veg"
    }
  ],
  totalAmount: 100,
  paymentMethod: "cod",
  transactionId: "N/A",
  itemCount: 1,
  orderDate: new Date().toISOString(),
  status: "pending",
  tableNumber: 5
};

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation...\n');
  console.log('Test Order Data:');
  console.log(JSON.stringify(testOrder, null, 2));
  console.log('\n');

  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ Order created successfully!');
      const data = JSON.parse(responseText);
      console.log('Created Order:', data);
    } else {
      console.log('\n❌ Failed to create order');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testOrderCreation();
