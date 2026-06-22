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

  it('parses convenience-store columns using OCR field positions', () => {
    const field = (inferText: string, x: number, y: number) => ({
      inferText,
      lineBreak: true,
      boundingPoly: {
        vertices: [
          { x: x - 5, y: y - 5 },
          { x: x + 5, y: y - 5 },
          { x: x + 5, y: y + 5 },
          { x: x - 5, y: y + 5 },
        ],
      },
    });

    expect(
      normalizeClovaReceipt({
        images: [
          {
            inferResult: 'SUCCESS',
            receipt: {
              result: {
                storeInfo: { name: { text: '세계 1등 편의점' } },
                paymentInfo: { date: { text: '2020-06-09' } },
              },
            },
            fields: [
              field('상품명', 120, 330),
              field('수량', 300, 330),
              field('금액', 420, 330),
              field('라라스윗)바닐라파인트474', 190, 381),
              field('행사', 430, 375),
              field('1', 300, 401),
              field('6,900', 423, 399),
              field('8809599360081', 130, 408),
              field('라라스윗)초코파인트474ml', 190, 430),
              field('행사', 430, 424),
              field('1', 300, 452),
              field('6,900', 424, 449),
              field('8809599360104', 130, 456),
              field('비닐봉투', 90, 482),
              field('보증금', 190, 479),
              field('20원', 265, 477),
              field('1', 300, 500),
              field('20', 446, 496),
              field('과세물품가액', 230, 526),
            ],
          },
        ],
      }),
    ).toMatchObject({
      shop: '세계 1등 편의점',
      purchasedAt: '2020-06-09',
      items: [
        {
          name: '라라스윗)바닐라파인트474',
          quantity: 1,
          price: 6900,
          lineTotal: 6900,
        },
        {
          name: '라라스윗)초코파인트474ml',
          quantity: 1,
          price: 6900,
          lineTotal: 6900,
        },
        {
          name: '비닐봉투 보증금 20원',
          category: '생필품',
          quantity: 1,
          price: 20,
          lineTotal: 20,
        },
      ],
      warnings: [],
    });
  });

  it('parses WinPOS rows when the item-name header is split into fields', () => {
    const field = (inferText: string, x: number, y: number) => ({
      inferText,
      lineBreak: true,
      boundingPoly: {
        vertices: [
          { x: x - 5, y: y - 5 },
          { x: x + 5, y: y - 5 },
          { x: x + 5, y: y + 5 },
          { x: x - 5, y: y + 5 },
        ],
      },
    });

    expect(
      normalizeClovaReceipt({
        images: [
          {
            inferResult: 'SUCCESS',
            fields: [
              field('<<<', 168, 66),
              field('영수', 331, 66),
              field('증', 476, 65),
              field('>>>', 586, 64),
              field('아이파크할인마트', 381, 147),
              field('사업자번호:', 126, 185),
              field('506-18-43477', 309, 183),
              field('품', 56, 384),
              field('명', 98, 384),
              field('단가', 440, 383),
              field('수량', 520, 383),
              field('금액', 650, 383),
              field('말보로라이트', 135, 464),
              field('2,700', 431, 463),
              field('1', 527, 461),
              field('2,700', 639, 463),
              field('하이브리드1', 127, 504),
              field('2,700', 431, 503),
              field('1', 528, 502),
              field('2,700', 639, 503),
              field('면세합:', 96, 583),
              field('0', 672, 580),
              field('합계:', 151, 741),
              field('5,400', 599, 739),
              field('출력일시/계산시:', 168, 898),
              field('2013-11-29', 392, 897),
            ],
          },
        ],
      }),
    ).toMatchObject({
      shop: '아이파크할인마트',
      purchasedAt: '2013-11-29',
      items: [
        {
          name: '말보로라이트',
          quantity: 1,
          price: 2700,
          lineTotal: 2700,
        },
        {
          name: '하이브리드1',
          quantity: 1,
          price: 2700,
          lineTotal: 2700,
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
