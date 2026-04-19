export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  return res.status(200).json({ 
    orderId: `cl_order_${Math.random().toString(36).substr(2, 9)}`, 
    success: true 
  });
}
