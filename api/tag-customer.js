export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, customerId } = req.body;

  try {
    // Extract domain
    const domain = email.split('@')[1].toLowerCase();

    // Fetch domain-discounts JSON
    const response = await fetch('https://raw.githubusercontent.com/neitzelm/DomainList/main/domain-discounts.json');
    const json = await response.json();

    // Convert JSON to a single object if needed
    const domainDiscountMap = Array.isArray(json) ? json[0] : json;

    // Get the discount tag
    const tagToAdd = domainDiscountMap[domain];

    if (!tagToAdd) {
      return res.status(400).json({ error: `No discount tag found for domain: ${domain}` });
    }

    const shop = process.env.SHOPIFY_STORE_URL; // ex: "yourstore.myshopify.com"
    const token = process.env.SHOPIFY_ADMIN_TOKEN; // ex: "shpat_..."

    // Extract the Shopify ID from the GID format
    const shopifyCustomerId = customerId.split('/').pop();

    const shopifyRes = await fetch(`https://${shop}/admin/api/2023-10/customers/${shopifyCustomerId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          id: shopifyCustomerId,
          tags: tagToAdd,
        },
      }),
    });

    const shopifyData = await shopifyRes.json();

    if (!shopifyRes.ok) {
      return res.status(500).json({
        error: `Shopify API error`,
        details: shopifyData,
      });
    }

    return res.status(200).json({ success: true, data: shopifyData });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error', details: err.message });
  }
}
