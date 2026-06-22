import {
  classifyProductCategory,
  normalizeClovaReceipt,
} from './receipt.service';

const CLOVA_RECEIPT_RESPONSE = {
  images: [
    {
      inferResult: 'SUCCESS',
      receipt: {
        result: {
          storeInfo: {
            name: { text: '페이히어 카페' },
          },
          paymentInfo: {
            date: { text: '2024-08-21' },
          },
          subResults: [
            {
              items: [
                {
                  name: { text: 'Americano' },
                  count: { text: '1' },
                  price: { price: { text: '5,000' } },
                  totalPrice: { price: { text: '5,000' } },
                },
              ],
            },
          ],
        },
      },
    },
  ],
};

describe('CLOVA receipt response normalizer', () => {
  it('converts CLOVA receipt fields to the frontend contract', () => {
    expect(normalizeClovaReceipt(CLOVA_RECEIPT_RESPONSE)).toEqual({
      shop: '페이히어 카페',
      purchasedAt: '2024-08-21',
      items: [
        {
          name: 'Americano',
          brand: '',
          category: '식료품',
          quantity: 1,
          unit: '개',
          price: 5000,
          lineTotal: 5000,
        },
      ],
      confidence: 0,
      warnings: [],
    });
  });

  it('parses general OCR fields when receipt fields are unavailable', () => {
    expect(
      normalizeClovaReceipt({
        images: [
          {
            inferResult: 'SUCCESS',
            fields: [
              { inferText: '페이히어 카페', lineBreak: true },
              {
                inferText: '123-45-67890 TEL:02-1522-1902',
                lineBreak: true,
              },
              {
                inferText: '거래 일시 2024-08-21 12:00:00',
                lineBreak: true,
              },
              {
                inferText: 'Americano 5,000 1 5,000',
                lineBreak: true,
              },
              { inferText: '합계 5,000원', lineBreak: true },
            ],
          },
        ],
      }),
    ).toMatchObject({
      shop: '페이히어 카페',
      purchasedAt: '2024-08-21',
      items: [
        {
          name: 'Americano',
          quantity: 1,
          price: 5000,
          lineTotal: 5000,
        },
      ],
      warnings: [],
    });
  });

  it('parses multi-line coded grocery receipt items', () => {
    expect(
      normalizeClovaReceipt({
        images: [
          {
            inferResult: 'SUCCESS',
            fields: [
              { inferText: '농협', lineBreak: true },
              { inferText: '주소:경기 의정부시', lineBreak: true },
              { inferText: '대표: 최영*', lineBreak: true },
              {
                inferText: '사업자번호 : 127-82-*****',
                lineBreak: true,
              },
              {
                inferText: '2015-11-03 16:31:53',
                lineBreak: true,
              },
              {
                inferText: '001 P굿모닝우유 900ML',
                lineBreak: true,
              },
              { inferText: '*8801104210645', lineBreak: true },
              { inferText: '1,350', lineBreak: true },
              { inferText: '002 양파', lineBreak: true },
              { inferText: '*231973', lineBreak: true },
              { inferText: '3,300', lineBreak: true },
              { inferText: '003 P무', lineBreak: true },
              { inferText: '*231913', lineBreak: true },
              { inferText: '500', lineBreak: true },
              { inferText: '판매총액:', lineBreak: true },
              { inferText: '5,150', lineBreak: true },
            ],
          },
        ],
      }),
    ).toMatchObject({
      shop: '농협',
      purchasedAt: '2015-11-03',
      items: [
        {
          name: '굿모닝우유 900ML',
          category: '식료품',
          quantity: 1,
          price: 1350,
          lineTotal: 1350,
        },
        {
          name: '양파',
          category: '식료품',
          quantity: 1,
          price: 3300,
          lineTotal: 3300,
        },
        {
          name: '무',
          category: '식료품',
          quantity: 1,
          price: 500,
          lineTotal: 500,
        },
      ],
      warnings: [],
    });
  });
});

describe('product category classifier', () => {
  it.each([
    ['서울우유', '식료품'],
    ['진라면 매운맛', '식료품'],
    ['크리넥스 화장지', '생필품'],
    ['주방세제 리필', '생필품'],
    ['라운드랩 토너', '화장품'],
    ['립밤', '화장품'],
  ])('classifies %s as %s', (name, category) => {
    expect(classifyProductCategory(name)).toBe(category);
  });
});
