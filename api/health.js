export default function handler(req, res) {
  return res.status(200).json({
    status: 'Peace Royal API is live',
    time: new Date().toISOString(),
  });
}
