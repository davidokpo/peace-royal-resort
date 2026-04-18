export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'Peace Royal API',
    time: new Date().toISOString(),
  });
}
