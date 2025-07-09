import fetch from 'node-fetch';

export default async function handler(req, res) {
  const jsonUrl = 'https://raw.githubusercontent.com/neitzelm/DomainList/main/domain-discounts.json';

  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) throw new Error(`Failed to fetch JSON: ${response.status}`);

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
