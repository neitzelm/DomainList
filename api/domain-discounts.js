export default async function handler(req, res) {
  try {
    const response = await fetch('https://raw.githubusercontent.com/neitzelm/DomainList/main/domain-discounts.json');
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch JSON' });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
