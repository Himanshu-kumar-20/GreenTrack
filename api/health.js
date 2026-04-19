export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    status: "GreenTrack API Online", 
    platform: "Vercel Serverless Functions",
    timestamp: new Date().toISOString() 
  });
}
