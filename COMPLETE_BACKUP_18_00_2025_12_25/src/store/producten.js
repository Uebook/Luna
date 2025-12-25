const DUMMY_PRODUCTS_10 = [
  {
    id: 'p1',
    type: 'clothing',
    name: 'Unstoppable Woven Joggers - Grey',
    price: 30.0,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556306535-abdef9c5a6f5?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { fit: 'Loose', fabric: 'Poly-Cotton', gender: 'women' },
    detail: {
      title: 'Unstoppable Woven Joggers - Grey',
      priceText: '30.000 KWD',
      rating: { value: 4.4, count: 202 },
      returnPolicy: { refundable: true, days: 7, text: 'Refundable • 7-day return' },
      description: 'Relaxed-fit joggers ideal for everyday comfort with breathable fabric and tapered cuffs.',
      specs: [
        { label: 'SKU', value: 'CONF-588056' },
        { label: 'Fabric', value: '60% Cotton, 40% Polyester' },
      ],
      variations: [
        {
          id: 'v1',
          color: 'Grey',
          gallery: [
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1618354691438-25bc04584b9a?q=80&w=1200&auto=format&fit=crop',
          ],
          sizes: [
            { id: 'v1-S', size: 'S', variantId: 101 },
            { id: 'v1-M', size: 'M', variantId: 102 },
            { id: 'v1-L', size: 'L', variantId: 103 },
            { id: 'v1-XL', size: 'XL', variantId: 104 },
            { id: 'v1-2XL', size: '2XL', variantId: 105 },
          ],
        },
        {
          id: 'v2',
          color: 'Black',
          gallery: [
            'https://images.unsplash.com/photo-1618354691438-25bc04584b9a?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop',
          ],
          sizes: [
            { id: 'v2-S', size: 'S', variantId: 106 },
            { id: 'v2-M', size: 'M', variantId: 107 },
            { id: 'v2-L', size: 'L', variantId: 108 },
            { id: 'v2-XL', size: 'XL', variantId: 109 },
            { id: 'v2-2XL', size: '2XL', variantId: 110 },
          ],
        },
      ],
      reviews: [
        { id: 'r1', name: 'Veronika', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4, text: 'Soft fabric and comfy fit — perfect for travel.', date: '12 Aug 2025' },
        { id: 'r2', name: 'Aarav', avatar: 'https://randomuser.me/api/portraits/men/14.jpg', rating: 5, text: 'Great quality for the price, tapered nicely.', date: '05 Aug 2025' },
      ],
      similar: [
        { id: 'p2', name: 'AirFlex Runner', priceText: '59.000 KWD', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
        { id: 'p9', name: 'ProFit Yoga Mat', priceText: '8.900 KWD', thumbnail: 'https://images.unsplash.com/photo-1599050751695-4cda2b3c9a0b?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p2',
    type: 'shoes',
    name: 'AirFlex Runner',
    price: 59.0,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528701800489-20be3c2ea4b1?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { sizeSystem: 'EU', gender: 'men' },
    detail: {
      title: 'AirFlex Runner',
      priceText: '59.000 KWD',
      rating: { value: 4.6, count: 128 },
      returnPolicy: { refundable: true, days: 14, text: 'Refundable • 14-day return' },
      description: 'Lightweight running shoes with breathable mesh and responsive cushioning.',
      specs: [
        { label: 'SKU', value: 'AF-2025' },
        { label: 'Sole', value: 'EVA Foam' },
      ],
      variations: [
        {
          id: 'v1',
          color: 'Blue',
          gallery: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop',
          ],
          sizes: ['40', '41', '42', '43', '44'].map((eu, i) => ({ id: `v1-${eu}`, size: eu, variantId: 200 + i })),
        },
        {
          id: 'v2',
          color: 'White',
          gallery: [
            'https://images.unsplash.com/photo-1528701800489-20be3c2ea4b1?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
          ],
          sizes: ['40', '41', '42', '43', '44'].map((eu, i) => ({ id: `v2-${eu}`, size: eu, variantId: 210 + i })),
        },
      ],
      reviews: [
        { id: 'r1', name: 'Marta', avatar: 'https://randomuser.me/api/portraits/women/12.jpg', rating: 5, text: 'Very light and comfy for daily runs.', date: '28 Jul 2025' },
        { id: 'r2', name: 'Sami', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', rating: 4, text: 'Good grip on pavement, stylish too.', date: '14 Jul 2025' },
      ],
      similar: [
        { id: 'p1', name: 'Unstoppable Woven Joggers - Grey', priceText: '30.000 KWD', thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p3',
    type: 'electronics',
    name: 'VoltX Wireless Earbuds',
    price: 24.9,
    currency: 'KWD',
    thumbnail: 'https://randomuser.me/api/portraits/men/52.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1589902868073-5cdeac1c2231?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { warranty: '12 months', btVersion: '5.3' },
    detail: {
      title: 'VoltX Wireless Earbuds',
      priceText: '24.900 KWD',
      rating: { value: 4.1, count: 540 },
      returnPolicy: { refundable: true, days: 15, text: 'Refundable • 15-day return' },
      description: 'Active noise cancellation with 30h total playtime and low-latency mode.',
      specs: [
        { label: 'Bluetooth', value: '5.3' },
        { label: 'ANC', value: 'Yes' },
        { label: 'Warranty', value: '12 months' },
      ],
      variations: [
        { id: 'v1', color: 'Matte Black', gallery: ['https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'Pearl White', gallery: ['https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
      ],
      reviews: [
        { id: 'r1', name: 'Omar', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4, text: 'Great ANC, decent bass. Battery life as advertised.', date: '10 Aug 2025' },
        { id: 'r2', name: 'Sara', avatar: 'https://randomuser.me/api/portraits/women/8.jpg', rating: 4, text: 'Pairs fast with my phone. Case is compact.', date: '03 Aug 2025' },
      ],
      similar: [
        { id: 'p10', name: 'Aurora Pendant Necklace', priceText: '29.000 KWD', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  /* 4) Grocery */
  {
    id: 'p4',
    type: 'grocery',
    name: 'Organic Almonds 500g',
    price: 3.2,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1486887396153-fa416526c108?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { weight: '500g', expiry: '2026-01-31' },
    detail: {
      title: 'Organic Almonds',
      /** default to the 500g pack price */
      priceText: '3.200 KWD',
      rating: { value: 4.7, count: 86 },
      returnPolicy: { refundable: false, text: 'Non-returnable (Food item)' },
      description: 'High-quality organic almonds. Resealable pack.',
      specs: [
        { label: 'Weight', value: '500g' },
        { label: 'Country', value: 'USA' },
      ],
      /** Each variation has its own priceKWD and gallery */
      variations: [
        {
          id: 'v1',
          label: '250g Pack',
          priceKWD: 1.900,
          gallery: ['https://images.unsplash.com/photo-1486887396153-fa416526c108?q=80&w=1200&auto=format&fit=crop'],
          sizes: []
        },
        {
          id: 'v2',
          label: '500g Pack',
          priceKWD: 3.200,
          gallery: ['https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1200&auto=format&fit=crop'],
          sizes: []
        },
        {
          id: 'v3',
          label: '1kg Pack',
          priceKWD: 5.900,
          gallery: ['https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1200&auto=format&fit=crop'],
          sizes: []
        },
      ],
      reviews: [
        { id: 'r1', name: 'Nora', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', rating: 5, text: 'Fresh and crunchy. Perfect for snacks.', date: '20 Jul 2025' },
      ],
      similar: [
        {
          id: 'p8',
          name: 'Stack & Learn Blocks',
          priceText: '5.000 KWD',
          thumbnail: 'https://images.unsplash.com/photo-1596495578065-8a3a5dcb4f4c?q=80&w=800&auto=format&fit=crop',
        },
      ],
    },
  },
  {
    id: 'p5',
    type: 'beauty',
    name: 'Velvet Matte Lipstick',
    price: 6.5,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1585386959984-3d92f9f1d9d5?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505575967455-40e256f73376?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { finish: 'Matte', ingredients: 'Vitamin E, Shea Butter' },
    detail: {
      title: 'Velvet Matte Lipstick',
      priceText: '6.500 KWD',
      rating: { value: 4.3, count: 320 },
      returnPolicy: { refundable: true, days: 7, text: 'Refundable • 7-day return (unused)' },
      description: 'Long-lasting matte color infused with nourishing ingredients for smooth lips.',
      specs: [
        { label: 'Finish', value: 'Matte' },
        { label: 'Net Wt.', value: '3.5g' },
      ],
      variations: [
        { id: 'v1', color: 'Ruby Red', gallery: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'Mocha', gallery: ['https://images.unsplash.com/photo-1505575967455-40e256f73376?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
      ],
      reviews: [
        { id: 'r1', name: 'Layla', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', rating: 5, text: 'Color payoff is amazing and not drying.', date: '02 Aug 2025' },
      ],
      similar: [
        { id: 'p10', name: 'Aurora Pendant Necklace', priceText: '29.000 KWD', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p6',
    type: 'furniture',
    name: 'Nordic Coffee Table',
    price: 45.0,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505692794403-34d4982ef5b2?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { material: 'Oak veneer', dimensions: '120×60×45 cm' },
    detail: {
      title: 'Nordic Coffee Table',
      priceText: '45.000 KWD',
      rating: { value: 4.2, count: 64 },
      returnPolicy: { refundable: true, days: 10, text: 'Refundable • 10-day return' },
      description: 'Minimal table with rounded edges and a warm wood finish.',
      specs: [
        { label: 'Material', value: 'Oak veneer' },
        { label: 'Dimensions', value: '120×60×45 cm' },
      ],
      variations: [
        { id: 'v1', color: 'Oak', gallery: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'Walnut', gallery: ['https://images.unsplash.com/photo-1505692794403-34d4982ef5b2?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
      ],
      reviews: [
        { id: 'r1', name: 'Jon', avatar: 'https://randomuser.me/api/portraits/men/7.jpg', rating: 4, text: 'Looks premium and easy to assemble.', date: '30 Jun 2025' },
      ],
      similar: [
        { id: 'p9', name: 'ProFit Yoga Mat', priceText: '8.900 KWD', thumbnail: 'https://images.unsplash.com/photo-1599050751695-4cda2b3c9a0b?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p7',
    type: 'book',
    name: 'The Art of Focus',
    price: 3.9,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { author: 'Lena Shaw', ISBN: '978-1-23456-789-7' },
    detail: {
      title: 'The Art of Focus',
      priceText: '3.900 KWD',
      rating: { value: 4.5, count: 190 },
      returnPolicy: { refundable: true, days: 7, text: 'Refundable • 7-day return' },
      description: 'A practical guide to deep work and attention.',
      specs: [
        { label: 'Author', value: 'Lena Shaw' },
        { label: 'ISBN', value: '978-1-23456-789-7' },
        { label: 'Pages', value: '264' },
      ],
      variations: [{ id: 'v1', color: 'Paperback', gallery: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop'], sizes: [] }],
      reviews: [
        { id: 'r1', name: 'Priya', avatar: 'https://randomuser.me/api/portraits/women/28.jpg', rating: 5, text: 'Concise and actionable. Loved it.', date: '11 Aug 2025' },
      ],
      similar: [
        { id: 'p3', name: 'VoltX Wireless Earbuds', priceText: '24.900 KWD', thumbnail: 'https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p8',
    type: 'toy',
    name: 'Stack & Learn Blocks',
    price: 5.0,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-8a3a5dcb4f4c?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { ageRange: '3–6 yrs', pieces: 48 },
    detail: {
      title: 'Stack & Learn Blocks',
      priceText: '5.000 KWD',
      rating: { value: 4.8, count: 73 },
      returnPolicy: { refundable: true, days: 15, text: 'Refundable • 15-day return' },
      description: 'Colorful blocks to build shapes, letters and numbers.',
      specs: [
        { label: 'Age', value: '3–6 yrs' },
        { label: 'Pieces', value: '48' },
      ],
      variations: [{ id: 'v1', color: 'Multicolor', gallery: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1200&auto=format&fit=crop'], sizes: [] }],
      reviews: [
        { id: 'r1', name: 'Ahmed', avatar: 'https://randomuser.me/api/portraits/men/81.jpg', rating: 5, text: 'My kid learns letters while playing — amazing!', date: '08 Aug 2025' },
      ],
      similar: [
        { id: 'p4', name: 'Organic Almonds 500g', priceText: '3.200 KWD', thumbnail: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p9',
    type: 'sports',
    name: 'ProFit Yoga Mat',
    price: 8.9,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1599050751695-4cda2b3c9a0b?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592432678031-1f87fea7f833?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { thickness: '8mm', material: 'TPE' },
    detail: {
      title: 'ProFit Yoga Mat',
      priceText: '8.900 KWD',
      rating: { value: 4.4, count: 211 },
      returnPolicy: { refundable: true, days: 10, text: 'Refundable • 10-day return' },
      description: 'Non-slip mat with excellent cushioning and grip.',
      specs: [
        { label: 'Thickness', value: '8mm' },
        { label: 'Material', value: 'TPE' },
      ],
      variations: [
        { id: 'v1', color: 'Teal', gallery: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a8?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'Purple', gallery: ['https://images.unsplash.com/photo-1592432678031-1f87fea7f833?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
      ],
      reviews: [
        { id: 'r1', name: 'Mina', avatar: 'https://randomuser.me/api/portraits/women/85.jpg', rating: 4, text: 'Soft yet stable. Doesn’t slip on tiles.', date: '18 Jun 2025' },
      ],
      similar: [
        { id: 'p2', name: 'AirFlex Runner', priceText: '59.000 KWD', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p10',
    type: 'jewelry',
    name: 'Aurora Pendant Necklace',
    price: 29.0,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1520962918287-7448c2878f65?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516637090014-cb1ab0d08fc7?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { metal: '925 Sterling Silver', stone: 'CZ' },
    detail: {
      title: 'Aurora Pendant Necklace',
      priceText: '29.000 KWD',
      rating: { value: 4.9, count: 41 },
      returnPolicy: { refundable: true, days: 7, text: 'Refundable • 7-day return' },
      description: 'Elegant pendant with shimmering stone on an adjustable chain.',
      specs: [
        { label: 'Metal', value: '925 Sterling Silver' },
        { label: 'Stone', value: 'Cubic Zirconia' },
      ],
      variations: [
        { id: 'v1', color: 'Silver', gallery: ['https://images.unsplash.com/photo-1520962918287-7448c2878f65?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'Rose Gold', gallery: ['https://images.unsplash.com/photo-1516637090014-cb1ab0d08fc7?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
      ],
      reviews: [
        { id: 'r1', name: 'Yara', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 5, text: 'Sparkles beautifully, great gift choice.', date: '09 Aug 2025' },
      ],
      similar: [
        { id: 'p5', name: 'Velvet Matte Lipstick', priceText: '6.500 KWD', thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' },
      ],
    },
  },
  {
    id: 'p11',
    type: 'clothing',
    name: 'Classic Cotton T-Shirt',
    price: 12.0,
    currency: 'KWD',
    thumbnail: 'https://images.unsplash.com/photo-1602810318383-e2b909b19f5e?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1602810318383-e2b909b19f5e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318033-d8c5d9b8e8d1?q=80&w=1200&auto=format&fit=crop',
    ],
    attributes: { fabric: '100% Cotton', gender: 'women' },
    detail: {
      title: 'Classic Cotton T-Shirt',
      priceText: '12.000 KWD',
      rating: { value: 4.5, count: 142 },
      returnPolicy: { refundable: true, days: 14, text: 'Refundable • 14-day return' },
      description: 'Soft cotton T-shirt with a relaxed fit. Perfect for casual everyday wear.',
      specs: [
        { label: 'Fabric', value: '100% Cotton' },
        { label: 'Fit', value: 'Regular' },
      ],
      variations: [
        {
          id: 'v1',
          color: 'White',
          gallery: [
            'https://images.unsplash.com/photo-1602810318383-e2b909b19f5e?q=80&w=1200&auto=format&fit=crop',
          ],
          sizes: [
            { id: 'v1-S', size: 'S', variantId: 301 },
            { id: 'v1-M', size: 'M', variantId: 302 },
            { id: 'v1-L', size: 'L', variantId: 303 },
            { id: 'v1-XL', size: 'XL', variantId: 304 },
          ],
        },
        {
          id: 'v2',
          color: 'Black',
          gallery: [
            'https://images.unsplash.com/photo-1602810318033-d8c5d9b8e8d1?q=80&w=1200&auto=format&fit=crop',
          ],
          sizes: [
            { id: 'v2-S', size: 'S', variantId: 305 },
            { id: 'v2-M', size: 'M', variantId: 306 },
            { id: 'v2-L', size: 'L', variantId: 307 },
            { id: 'v2-XL', size: 'XL', variantId: 308 },
          ],
        },
      ],
      reviews: [
        { id: 'r1', name: 'Fatima', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', rating: 5, text: 'Soft fabric, comfortable for summer!', date: '20 Aug 2025' },
        { id: 'r2', name: 'Hussain', avatar: 'https://randomuser.me/api/portraits/men/60.jpg', rating: 4, text: 'Good quality and fits well.', date: '10 Aug 2025' },
        { id: 'r1', name: 'Fatima', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', rating: 5, text: 'Soft fabric, comfortable for summer!', date: '20 Aug 2025' },
        { id: 'r2', name: 'Hussain', avatar: 'https://randomuser.me/api/portraits/men/60.jpg', rating: 4, text: 'Good quality and fits well.', date: '10 Aug 2025' },
        { id: 'r1', name: 'Fatima', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', rating: 5, text: 'Soft fabric, comfortable for summer!', date: '20 Aug 2025' },
        { id: 'r2', name: 'Hussain', avatar: 'https://randomuser.me/api/portraits/men/60.jpg', rating: 4, text: 'Good quality and fits well.', date: '10 Aug 2025' },
        { id: 'r1', name: 'Fatima', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', rating: 5, text: 'Soft fabric, comfortable for summer!', date: '20 Aug 2025' },
        { id: 'r2', name: 'Hussain', avatar: 'https://randomuser.me/api/portraits/men/60.jpg', rating: 4, text: 'Good quality and fits well.', date: '10 Aug 2025' },
        { id: 'r1', name: 'Fatima', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', rating: 5, text: 'Soft fabric, comfortable for summer!', date: '20 Aug 2025' },
        { id: 'r2', name: 'Hussain', avatar: 'https://randomuser.me/api/portraits/men/60.jpg', rating: 4, text: 'Good quality and fits well.', date: '10 Aug 2025' },
        { id: 'r1', name: 'Fatima', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', rating: 5, text: 'Soft fabric, comfortable for summer!', date: '20 Aug 2025' },
        { id: 'r2', name: 'Hussain', avatar: 'https://randomuser.me/api/portraits/men/60.jpg', rating: 4, text: 'Good quality and fits well.', date: '10 Aug 2025' },

      ],
      similar: [
        {
          id: 'p1',
          name: 'Unstoppable Woven Joggers - Grey',
          priceText: '30.000 KWD',
          thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        },
      ],
    },
  },
];
export default DUMMY_PRODUCTS_10;
