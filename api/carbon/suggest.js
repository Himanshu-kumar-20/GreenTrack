export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const tips = [
    "Carpool to work tomorrow and save up to 2 kg of CO2.",
    "Eat a plant-based meal today to cut your footprint by 3 kg.",
    "Turn off standby appliances to save energy.",
    "Compost your organic waste to reduce methane emissions.",
    "Use reusable bags for your next shopping trip."
  ];
  return res.status(200).json({ tips, success: true });
}
