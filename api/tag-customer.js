export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, customerId } = req.body;

  if (!email || !customerId) {
    return res.status(400).json({ error: 'Missing email or customerId' });
  }

  const domain = email.split('@')[1].toLowerCase();

  try {
    // Fetch the discount domain map
    const response = await fetch('https://domain-list-kappa.vercel.app/api/domain-discounts');
    if (!response.ok) throw new Error('Failed to fetch domain-discounts JSON');

    const domainMap = await response.json();
    const discountCode = domainMap[domain];

    if (!discountCode) {
      return res.status(200).json({ message: `No discount code for domain: ${domain}` });
    }

    // Format tag (e.g., "discount20")
    const tagToAdd = discountCode;

    // Add tag to the customer via Shopify Admin API
    const shopifyRes = await fetch(`https://${process.env.usaparts.agriaerotech.com}/admin/api/2023-10/customers/${customerId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': process.env.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,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          id: customerId,
          tags: tagToAdd,
        },
      }),
    });

    if (!shopifyRes.ok) {
      const errorText = await shopifyRes.text();
      throw new Error(`Shopify API error: ${errorText}`);
    }

    return res.status(200).json({ success: true, taggedWith: tagToAdd });
  } catch (error) {
    console.error('Error tagging customer:', error);
    return res.status(500).json({ error: error.message });
  }
}
