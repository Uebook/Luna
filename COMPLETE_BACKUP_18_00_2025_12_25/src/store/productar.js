const DUMMY_PRODUCTS_AR = [
  {
    id: 'p1',
    type: 'clothing',
    name: 'بنطال رياضي منسوج - رمادي',
    price: 30.0,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'
    ],
    attributes: { fit: 'واسع', fabric: 'قطن/بوليستر', gender: 'نساء' },
    detail: {
      title: 'بنطال رياضي منسوج - رمادي',
      priceText: '30.000 د.ك',
      rating: { value: 4.4, count: 202 },
      returnPolicy: { refundable: true, days: 7, text: 'قابل للإرجاع • خلال 7 أيام' },
      description: 'بنطال واسع مريح مثالي للاستخدام اليومي مع قماش قابل للتنفس وحواف ضيقة عند الكاحل.',
      specs: [
        { label: 'الرمز', value: 'CONF-588056' },
        { label: 'الخامة', value: '60% قطن، 40% بوليستر' }
      ],
      variations: [
        {
          id: 'v1',
          color: 'رمادي',
          gallery: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop'],
          sizes: [
            { id: 'v1-S', size: 'صغير', variantId: 101 },
            { id: 'v1-M', size: 'متوسط', variantId: 102 }
          ]
        }
      ],
      reviews: [
        { id: 'r1', name: 'فيرونيكا', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4, text: 'قماش ناعم ومناسب للسفر.', date: '12 أغسطس 2025' }
      ],
      similar: [
        { id: 'p2', name: 'حذاء AirFlex للجري', priceText: '59.000 د.ك', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p2',
    type: 'shoes',
    name: 'حذاء AirFlex للجري',
    price: 59.0,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1200&auto=format&fit=crop'],
    attributes: { sizeSystem: 'أوروبي', gender: 'رجال' },
    detail: {
      title: 'حذاء AirFlex للجري',
      priceText: '59.000 د.ك',
      rating: { value: 4.6, count: 128 },
      returnPolicy: { refundable: true, days: 14, text: 'قابل للإرجاع • خلال 14 يوم' },
      description: 'حذاء جري خفيف الوزن مع شبكة قابلة للتنفس وتوسيد مريح.',
      specs: [
        { label: 'الرمز', value: 'AF-2025' },
        { label: 'النعل', value: 'EVA Foam' }
      ],
      variations: [
        {
          id: 'v1',
          color: 'أزرق',
          gallery: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'],
          sizes: ['40', '41', '42'].map((eu, i) => ({ id: `v1-${eu}`, size: eu, variantId: 200 + i }))
        }
      ],
      reviews: [
        { id: 'r1', name: 'مارتا', avatar: 'https://randomuser.me/api/portraits/women/12.jpg', rating: 5, text: 'خفيف جدًا ومريح للجري اليومي.', date: '28 يوليو 2025' }
      ],
      similar: [
        { id: 'p1', name: 'بنطال رياضي منسوج - رمادي', priceText: '30.000 د.ك', thumbnail: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p3',
    type: 'electronics',
    name: 'سماعات VoltX اللاسلكية',
    price: 24.9,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1589902868073-5cdeac1c2231?q=80&w=1200&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop'],
    attributes: { warranty: '12 شهر', btVersion: '5.3' },
    detail: {
      title: 'سماعات VoltX اللاسلكية',
      priceText: '24.900 د.ك',
      rating: { value: 4.1, count: 540 },
      returnPolicy: { refundable: true, days: 15, text: 'قابلة للإرجاع • خلال 15 يوم' },
      description: 'إلغاء ضوضاء نشط مع 30 ساعة تشغيل وإعداد منخفض التأخير.',
      specs: [
        { label: 'بلوتوث', value: '5.3' },
        { label: 'إلغاء الضوضاء', value: 'نعم' }
      ],
      variations: [
        { id: 'v1', color: 'أسود', gallery: ['https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=1200&auto=format&fit=crop'], sizes: [] }
      ],
      reviews: [
        { id: 'r1', name: 'عمر', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4, text: 'إلغاء ضوضاء ممتاز وجودة صوت جيدة.', date: '10 أغسطس 2025' }
      ],
      similar: [
        { id: 'p10', name: 'عقد Aurora المعلق', priceText: '29.000 د.ك', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p4',
    type: 'grocery',
    name: 'لوز عضوي 500غ',
    price: 3.2,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=800&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1486887396153-fa416526c108?q=80&w=1200&auto=format&fit=crop'],
    attributes: { weight: '500غ', expiry: '2026-01-31' },
    detail: {
      title: 'لوز عضوي',
      priceText: '3.200 د.ك',
      rating: { value: 4.7, count: 86 },
      returnPolicy: { refundable: false, text: 'غير قابل للإرجاع (منتج غذائي)' },
      description: 'لوز عضوي عالي الجودة في عبوة قابلة لإعادة الغلق.',
      specs: [
        { label: 'الوزن', value: '500غ' },
        { label: 'المنشأ', value: 'الولايات المتحدة' }
      ],
      variations: [
        { id: 'v1', label: '250غ', priceKWD: 1.900, gallery: ['https://images.unsplash.com/photo-1486887396153-fa416526c108?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', label: '500غ', priceKWD: 3.200, gallery: ['https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1200&auto=format&fit=crop'], sizes: [] }
      ],
      reviews: [
        { id: 'r1', name: 'نورة', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', rating: 5, text: 'طازج ومقرمش.', date: '20 يوليو 2025' }
      ],
      similar: [
        { id: 'p8', name: 'مكعبات تعلم ملونة', priceText: '5.000 د.ك', thumbnail: 'https://images.unsplash.com/photo-1596495578065-8a3a5dcb4f4c?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p5',
    type: 'beauty',
    name: 'أحمر شفاه مخملي مطفي',
    price: 6.5,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1585386959984-3d92f9f1d9d5?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505575967455-40e256f73376?q=80&w=1200&auto=format&fit=crop'
    ],
    attributes: { finish: 'مطفي', ingredients: 'فيتامين E, زبدة الشيا' },
    detail: {
      title: 'أحمر شفاه مخملي مطفي',
      priceText: '6.500 د.ك',
      rating: { value: 4.3, count: 320 },
      returnPolicy: { refundable: true, days: 7, text: 'قابل للإرجاع • خلال 7 أيام (غير مستخدم)' },
      description: 'لون مطفي يدوم طويلاً مع مكونات مغذية لشفاه ناعمة.',
      specs: [
        { label: 'اللمسة', value: 'مطفي' },
        { label: 'الوزن الصافي', value: '3.5غ' }
      ],
      variations: [
        { id: 'v1', color: 'أحمر ياقوتي', gallery: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'موكا', gallery: ['https://images.unsplash.com/photo-1505575967455-40e256f73376?q=80&w=1200&auto=format&fit=crop'], sizes: [] }
      ],
      reviews: [
        { id: 'r1', name: 'ليلى', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', rating: 5, text: 'لون رائع لا يجفف الشفاه.', date: '02 أغسطس 2025' }
      ],
      similar: [
        { id: 'p10', name: 'عقد Aurora المعلق', priceText: '29.000 د.ك', thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p6',
    type: 'furniture',
    name: 'طاولة قهوة نورديك',
    price: 45.0,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505692794403-34d4982ef5b2?q=80&w=1200&auto=format&fit=crop'
    ],
    attributes: { material: 'قشرة خشب البلوط', dimensions: '120×60×45 سم' },
    detail: {
      title: 'طاولة قهوة نورديك',
      priceText: '45.000 د.ك',
      rating: { value: 4.2, count: 64 },
      returnPolicy: { refundable: true, days: 10, text: 'قابلة للإرجاع • خلال 10 أيام' },
      description: 'طاولة بسيطة بحواف مستديرة وتشطيب خشبي دافئ.',
      specs: [
        { label: 'الخامة', value: 'قشرة خشب البلوط' },
        { label: 'الأبعاد', value: '120×60×45 سم' }
      ],
      variations: [
        { id: 'v1', color: 'بلوط', gallery: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop'], sizes: [] },
        { id: 'v2', color: 'جوز', gallery: ['https://images.unsplash.com/photo-1505692794403-34d4982ef5b2?q=80&w=1200&auto=format&fit=crop'], sizes: [] }
      ],
      reviews: [
        { id: 'r1', name: 'جون', avatar: 'https://randomuser.me/api/portraits/men/7.jpg', rating: 4, text: 'تبدو فاخرة وسهلة التركيب.', date: '30 يونيو 2025' }
      ],
      similar: [
        { id: 'p9', name: 'حصيرة يوجا ProFit', priceText: '8.900 د.ك', thumbnail: 'https://images.unsplash.com/photo-1599050751695-4cda2b3c9a0b?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p7',
    type: 'book',
    name: 'فن التركيز',
    price: 3.9,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop'],
    attributes: { author: 'لينا شو', ISBN: '978-1-23456-789-7' },
    detail: {
      title: 'فن التركيز',
      priceText: '3.900 د.ك',
      rating: { value: 4.5, count: 190 },
      returnPolicy: { refundable: true, days: 7, text: 'قابل للإرجاع • خلال 7 أيام' },
      description: 'دليل عملي للعمل العميق وتنمية الانتباه.',
      specs: [
        { label: 'المؤلف', value: 'لينا شو' },
        { label: 'رقم ISBN', value: '978-1-23456-789-7' }
      ],
      variations: [
        { id: 'v1', color: 'غلاف ورقي', gallery: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop'], sizes: [] }
      ],
      reviews: [
        { id: 'r1', name: 'بريّا', avatar: 'https://randomuser.me/api/portraits/women/28.jpg', rating: 5, text: 'مختصر وعملي. أحببته.', date: '11 أغسطس 2025' }
      ],
      similar: [
        { id: 'p3', name: 'سماعات VoltX اللاسلكية', priceText: '24.900 د.ك', thumbnail: 'https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: 'p8',
    type: 'toy',
    name: 'مكعبات تعلم ملونة',
    price: 5.0,
    currency: 'د.ك',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-8a3a5dcb4f4c?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=1200&auto=format&fit=crop'
    ],
    attributes: { ageRange: '3–6 سنوات', pieces: 48 },
    detail: {
      title: 'مكعبات تعلم ملونة',
      priceText: '5.000 د.ك',
      rating: { value: 4.8, count: 73 },
      returnPolicy: { refundable: true, days: 15, text: 'قابلة للإرجاع • خلال 15 يوم' },
      description: 'مكعبات ملونة لبناء أشكال وأحرف وأرقام.',
      specs: [
        { label: 'العمر', value: '3–6 سنوات' },
        { label: 'عدد القطع', value: '48' }
      ],
      variations: [
        { id: 'v1', color: 'متعدد الألوان', gallery: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1200&auto=format&fit=crop'], sizes: [] }
      ],
      reviews: [
        { id: 'r1', name: 'أحمد', avatar: 'https://randomuser.me/api/portraits/men/81.jpg', rating: 5, text: 'طفلي يتعلم الحروف أثناء اللعب — رائع!', date: '08 أغسطس 2025' }
      ],
      similar: [
        { id: 'p4', name: 'لوز عضوي 500غ', priceText: '3.200 د.ك', thumbnail: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=800&auto=format&fit=crop' }
      ]
    }
  }
];
export default DUMMY_PRODUCTS_AR;
