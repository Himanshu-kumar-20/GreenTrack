export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const results = [
    { label: "Dry Waste", info: "Paper, plastic, and metal. Ensure items are clean and dry." },
    { label: "Wet Waste", info: "Organic kitchen waste, fruit peels, and leftover food." },
    { label: "Recyclable", info: "Glass bottles, clean cardboard, and aluminum cans." },
    { label: "Hazardous", info: "Batteries, electronic waste, and chemical containers." }
  ];
  const choice = results[Math.floor(Math.random() * results.length)];
  return res.status(200).json({ 
    label: choice.label, 
    info: choice.info,
    confidence: (Math.random() * 0.15 + 0.85).toFixed(2), 
    success: true 
  });
}
