import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

export interface ReceiptItem {
  name: string;
  brand: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  lineTotal: number;
}

export interface ReceiptResult {
  shop: string;
  purchasedAt: string;
  items: ReceiptItem[];
  confidence: number;
  warnings: string[];
}

interface ReceiptImage {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === 'object' ? (value as JsonRecord) : {};

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const textOf = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  const record = asRecord(value);
  return textOf(record.text ?? record.value ?? record.name ?? '');
};

const numberOf = (value: unknown): number => {
  const parsed = Number(textOf(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeDate = (value: unknown): string => {
  const matched = textOf(value).match(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!matched) return '';

  return `${matched[1]}-${matched[2].padStart(2, '0')}-${matched[3].padStart(2, '0')}`;
};

const confidenceOf = (value: unknown): number => {
  const number = numberOf(value);
  if (!number) return 0;
  return number <= 1 ? Math.round(number * 100) : Math.round(number);
};

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    const text = textOf(value);
    if (text) return text;
  }
  return '';
};

const COSMETICS_KEYWORDS = [
  '스킨',
  '토너',
  '에센스',
  '세럼',
  '앰플',
  '로션',
  '선크림',
  '선블록',
  '파운데이션',
  '쿠션',
  '립스틱',
  '립밤',
  '틴트',
  '마스카라',
  '아이브로우',
  '클렌징',
  '핸드크림',
  '향수',
  '화장품',
];

const DAILY_SUPPLIES_KEYWORDS = [
  '휴지',
  '화장지',
  '물티슈',
  '세제',
  '섬유유연제',
  '샴푸',
  '린스',
  '트리트먼트',
  '치약',
  '칫솔',
  '비누',
  '바디워시',
  '수건',
  '생리대',
  '면도기',
  '주방세제',
  '수세미',
  '키친타월',
  '쓰레기봉투',
  '비닐봉투',
  '건전지',
  '마스크',
  '생활용품',
];

export const classifyProductCategory = (name: string) => {
  const normalizedName = name.replace(/\s+/g, '').toLowerCase();

  if (COSMETICS_KEYWORDS.some((keyword) => normalizedName.includes(keyword))) {
    return '화장품';
  }

  if (
    DAILY_SUPPLIES_KEYWORDS.some((keyword) => normalizedName.includes(keyword))
  ) {
    return '생필품';
  }

  return '식료품';
};

const parseReceiptText = (
  text: string,
): Pick<ReceiptResult, 'shop' | 'purchasedAt' | 'items'> => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const businessInfoIndex = lines.findIndex((line) =>
    /(?:\d{3}-\d{2}-\d{5}|사업자|TEL\s*:|전화\s*:)/i.test(line),
  );
  const topStoreCandidate = lines
    .slice(0, 8)
    .find(
      (line) =>
        /[가-힣A-Za-z]/.test(line) &&
        !/(주소|대표|사업자|전화|TEL|홈페이지|http|영수증|교환|환불)/i.test(
          line,
        ),
    );
  const businessStoreCandidate =
    businessInfoIndex > 0 &&
    !/(주소|대표|전화|TEL|홈페이지)/i.test(lines[businessInfoIndex - 1])
      ? lines[businessInfoIndex - 1]
      : '';
  const shop = topStoreCandidate || businessStoreCandidate || '';
  const dateMatch = text.match(
    /(?:거래\s*일시|구매\s*일자|승인\s*일시|일시)?\s*(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/,
  );
  const purchasedAt = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
    : '';
  const items: ReceiptItem[] = [];
  const itemHeaderIndex = lines.findIndex((line) => /상품\s*명/.test(line));
  const codedItemLines = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /^\d{3}\s+/.test(line));

  if (codedItemLines.length > 0) {
    for (let itemIndex = 0; itemIndex < codedItemLines.length; itemIndex += 1) {
      const current = codedItemLines[itemIndex];
      const nextIndex =
        codedItemLines[itemIndex + 1]?.index ??
        lines.findIndex(
          (line, index) => index > current.index && /판매\s*총액/.test(line),
        );
      const endIndex = nextIndex > current.index ? nextIndex : lines.length;
      const itemLines = lines.slice(current.index + 1, endIndex);
      const name = current.line
        .replace(/^\d{3}\s+/, '')
        .replace(/^P(?=[가-힣A-Za-z])/, '')
        .trim();
      const priceLine = itemLines.find(
        (line) =>
          (/^\d{2,5}$/.test(line) || /^\d{1,3}(?:,\d{3})+$/.test(line)) &&
          !/^[*#]/.test(line),
      );
      const price = numberOf(priceLine);

      if (!name || !price) continue;

      items.push({
        name,
        brand: '',
        category: classifyProductCategory(name),
        quantity: 1,
        unit: '개',
        price,
        lineTotal: price,
      });
    }
  }

  if (
    items.length === 0 &&
    itemHeaderIndex >= 0 &&
    /단가/.test(lines[itemHeaderIndex + 1] || '') &&
    /수량/.test(lines[itemHeaderIndex + 2] || '') &&
    /금액/.test(lines[itemHeaderIndex + 3] || '')
  ) {
    for (
      let index = itemHeaderIndex + 4;
      index + 3 < lines.length;
      index += 4
    ) {
      const [name, rawPrice, rawQuantity, rawLineTotal] = lines.slice(
        index,
        index + 4,
      );
      if (/(합계|결제\s*내역|공급가액|부가세|결제금액)/.test(name)) break;

      const quantity = Number(rawQuantity);
      const price = numberOf(rawPrice);
      const lineTotal = numberOf(rawLineTotal);
      if (!name || quantity <= 0 || (!price && !lineTotal)) break;

      items.push({
        name,
        brand: '',
        category: classifyProductCategory(name),
        quantity,
        unit: '개',
        price: price || Math.round(lineTotal / quantity),
        lineTotal: lineTotal || price * quantity,
      });
    }
  }

  for (const line of items.length === 0 ? lines : []) {
    if (/(합계|결제\s*내역|공급가액|부가세|결제금액)/.test(line)) break;

    const matched = line.match(
      /^(.+?)\s+([\d,.]+)\s+(\d+(?:\.\d+)?)\s+([\d,.]+)(?:\s*원)?(?:\s+.*)?$/,
    );
    if (!matched) continue;

    const quantity = Number(matched[3]);
    const price = numberOf(matched[2]);
    const lineTotal = numberOf(matched[4]);
    if (!matched[1].trim() || quantity <= 0 || (!price && !lineTotal)) continue;

    const name = matched[1].replace(/^[-*·]\s*/, '').trim();
    items.push({
      name,
      brand: '',
      category: classifyProductCategory(name),
      quantity,
      unit: '개',
      price: price || Math.round(lineTotal / quantity),
      lineTotal: lineTotal || price * quantity,
    });
  }

  return { shop, purchasedAt, items };
};

const getGeneralOcrText = (image: JsonRecord) => {
  const fields = asArray(image.fields);
  let text = '';

  for (const rawField of fields) {
    const field = asRecord(rawField);
    const value = textOf(field.inferText);
    if (!value) continue;

    text += `${value}${field.lineBreak ? '\n' : ' '}`;
  }

  return text.trim();
};

const fieldPosition = (field: JsonRecord) => {
  const vertices = asArray(asRecord(field.boundingPoly).vertices)
    .map(asRecord)
    .filter(
      (vertex) =>
        Number.isFinite(Number(vertex.x)) && Number.isFinite(Number(vertex.y)),
    );

  if (vertices.length === 0) return null;

  return {
    x:
      vertices.reduce((sum, vertex) => sum + Number(vertex.x), 0) /
      vertices.length,
    y:
      vertices.reduce((sum, vertex) => sum + Number(vertex.y), 0) /
      vertices.length,
  };
};

const parsePositionedReceiptItems = (image: JsonRecord): ReceiptItem[] => {
  const fields = asArray(image.fields)
    .map((rawField) => {
      const field = asRecord(rawField);
      const text = textOf(field.inferText);
      const position = fieldPosition(field);
      return text && position ? { text, ...position } : null;
    })
    .filter(
      (
        field,
      ): field is {
        text: string;
        x: number;
        y: number;
      } => field !== null,
    );
  const nameHeader = fields.find((field) => /상품\s*명/.test(field.text));
  const quantityHeader = fields.find((field) => /수량/.test(field.text));
  const amountHeader = fields.find((field) => /금액/.test(field.text));

  if (!nameHeader || !quantityHeader || !amountHeader) return [];

  const summaryY =
    fields
      .filter(
        (field) =>
          field.y > nameHeader.y + 20 &&
          /(과세물품|공급가액|부가세|합계|결제금액)/.test(field.text),
      )
      .sort((left, right) => left.y - right.y)[0]?.y ??
    Number.POSITIVE_INFINITY;
  const quantityColumnX = quantityHeader.x;
  const amountColumnX = amountHeader.x;
  const amountBoundaryX = (quantityColumnX + amountColumnX) / 2;
  const ignoredNamePattern =
    /^(?:행사|증정|할인|상품명|수량|금액|과세물품가액|공급가액|부가세|합계|현금)$/;
  const nameFields = fields
    .filter(
      (field) =>
        field.y > nameHeader.y + 20 &&
        field.y < summaryY &&
        field.x < quantityColumnX - 5 &&
        /[가-힣A-Za-z]/.test(field.text) &&
        !ignoredNamePattern.test(field.text) &&
        !/^[*#]?\d{6,}$/.test(field.text.replace(/\s/g, '')),
    )
    .sort((left, right) => left.y - right.y || left.x - right.x);
  const nameRows: (typeof nameFields)[] = [];

  for (const field of nameFields) {
    const currentRow = nameRows[nameRows.length - 1];
    if (currentRow && Math.abs(currentRow[0].y - field.y) <= 10) {
      currentRow.push(field);
    } else {
      nameRows.push([field]);
    }
  }

  return nameRows.flatMap((row): ReceiptItem[] => {
    const rowY = row.reduce((sum, field) => sum + field.y, 0) / row.length;
    const name = row
      .sort((left, right) => left.x - right.x)
      .map((field) => field.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const quantityField = fields
      .filter(
        (field) =>
          field.y >= rowY - 5 &&
          field.y <= rowY + 35 &&
          Math.abs(field.x - quantityColumnX) <= 40 &&
          /^\d+(?:\.\d+)?$/.test(field.text),
      )
      .sort(
        (left, right) => Math.abs(left.y - rowY) - Math.abs(right.y - rowY),
      )[0];
    const amountField = fields
      .filter(
        (field) =>
          field.y >= rowY - 5 &&
          field.y <= rowY + 35 &&
          field.x > amountBoundaryX &&
          /^[₩￦]?\s*\d[\d,]*$/.test(field.text),
      )
      .sort(
        (left, right) => Math.abs(left.y - rowY) - Math.abs(right.y - rowY),
      )[0];
    const quantity = Math.max(numberOf(quantityField?.text) || 1, 1);
    const lineTotal = numberOf(amountField?.text);

    if (!name || !lineTotal) return [];

    return [
      {
        name,
        brand: '',
        category: classifyProductCategory(name),
        quantity,
        unit: '개',
        price: Math.round(lineTotal / quantity),
        lineTotal,
      },
    ];
  });
};

export const normalizeClovaReceipt = (response: unknown): ReceiptResult => {
  const root = asRecord(response);
  const image = asRecord(asArray(root.images)[0]);
  const receipt = asRecord(image.receipt);
  const result = asRecord(receipt.result ?? image.result);
  const storeInfo = asRecord(result.storeInfo ?? result.store);
  const paymentInfo = asRecord(result.paymentInfo ?? result.payment);
  const subResults = asArray(result.subResults ?? result.items);

  const items = subResults.flatMap((subResult) => {
    const group = asRecord(subResult);
    const rawItems = asArray(group.items ?? subResult);

    return rawItems
      .map((rawItem): ReceiptItem | null => {
        const item = asRecord(rawItem);
        const quantity = Math.max(
          numberOf(item.count ?? item.quantity ?? item.qty) || 1,
          1,
        );
        const priceRecord = asRecord(item.price);
        const totalPriceRecord = asRecord(item.totalPrice);
        const price = numberOf(
          priceRecord.price ?? item.unitPrice ?? item.unit_price ?? item.price,
        );
        const lineTotal = numberOf(
          totalPriceRecord.price ??
            item.totalPrice ??
            item.total_price ??
            item.lineTotal ??
            item.line_total,
        );
        const name = firstText(item.name, item.productName, item.product_name);

        if (!name) return null;

        return {
          name,
          brand: firstText(item.brand),
          category: classifyProductCategory(name),
          quantity,
          unit: firstText(item.unit) || '개',
          price: price || (lineTotal ? Math.round(lineTotal / quantity) : 0),
          lineTotal: lineTotal || price * quantity,
        };
      })
      .filter((item): item is ReceiptItem => item !== null);
  });

  const shop = firstText(storeInfo.name, storeInfo.storeName, result.storeName);
  const purchasedAt = normalizeDate(
    paymentInfo.date ?? paymentInfo.confirmedDate ?? result.paymentDate,
  );
  const generalResult =
    !shop || !purchasedAt || items.length === 0
      ? parseReceiptText(getGeneralOcrText(image))
      : null;
  const positionedItems =
    items.length === 0 ? parsePositionedReceiptItems(image) : [];
  const normalizedShop = shop || generalResult?.shop || '';
  const normalizedPurchasedAt = purchasedAt || generalResult?.purchasedAt || '';
  const normalizedItems =
    items.length > 0
      ? items
      : positionedItems.length > 0
        ? positionedItems
        : generalResult?.items || [];
  const warnings: string[] = [];

  if (!normalizedShop) warnings.push('매장명을 찾지 못했습니다.');
  if (!normalizedPurchasedAt) warnings.push('구매 날짜를 찾지 못했습니다.');
  if (normalizedItems.length === 0)
    warnings.push('상품 내역을 찾지 못했습니다.');

  return {
    shop: normalizedShop,
    purchasedAt: normalizedPurchasedAt,
    items: normalizedItems,
    confidence: confidenceOf(
      image.inferConfidence ?? receipt.inferConfidence ?? result.confidence,
    ),
    warnings,
  };
};

const getImageFormat = (image: ReceiptImage) => {
  const mimeFormat = image.mimeType.split('/')[1]?.toLowerCase();
  if (mimeFormat === 'jpeg') return 'jpg';
  if (mimeFormat) return mimeFormat;
  return extname(image.originalName).replace('.', '').toLowerCase() || 'jpg';
};

@Injectable()
export class ReceiptService {
  constructor(private readonly configService: ConfigService) {}

  async processReceipt(image: ReceiptImage): Promise<ReceiptResult> {
    const invokeUrl = this.configService.get<string>('CLOVA_OCR_INVOKE_URL');
    const secret = this.configService.get<string>('CLOVA_OCR_SECRET');

    if (!invokeUrl || !secret) {
      throw new InternalServerErrorException(
        'CLOVA OCR 환경변수가 설정되지 않았습니다.',
      );
    }

    const format = getImageFormat(image);
    const message = {
      version: 'V2',
      requestId: randomUUID(),
      timestamp: Date.now(),
      images: [{ format, name: image.originalName || 'receipt' }],
    };
    const formData = new FormData();
    formData.append('message', JSON.stringify(message));
    formData.append(
      'file',
      new Blob([Uint8Array.from(image.buffer)], { type: image.mimeType }),
      image.originalName || `receipt.${format}`,
    );

    let response: Response;
    try {
      response = await fetch(invokeUrl, {
        method: 'POST',
        headers: { 'X-OCR-SECRET': secret },
        body: formData,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new BadGatewayException(
          'CLOVA OCR 응답 시간이 초과되었습니다. Invoke URL과 도메인 상태를 확인해주세요.',
        );
      }
      throw new BadGatewayException('CLOVA OCR 서버에 연결하지 못했습니다.');
    }

    const responseBody = (await response.json().catch(() => ({}))) as unknown;
    if (!response.ok) {
      const error = asRecord(responseBody);
      throw new BadGatewayException(
        firstText(error.message, error.error) ||
          `CLOVA OCR 요청에 실패했습니다. (${response.status})`,
      );
    }

    const imageResult = asRecord(asArray(asRecord(responseBody).images)[0]);
    if (
      imageResult.inferResult &&
      textOf(imageResult.inferResult).toUpperCase() !== 'SUCCESS'
    ) {
      throw new UnprocessableEntityException(
        firstText(imageResult.message) || '영수증을 인식하지 못했습니다.',
      );
    }

    const result = normalizeClovaReceipt(responseBody);
    if (!result.shop && !result.purchasedAt && result.items.length === 0) {
      throw new UnprocessableEntityException(
        '영수증 정보를 찾지 못했습니다. 더 선명한 사진을 사용해주세요.',
      );
    }

    return result;
  }
}
