const DEFAULT_RECEIPT_API_URL = '/api/receipt/upload';
const MAX_RECEIPT_SIZE = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 60_000;
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const MAX_REQUEST_ATTEMPTS = 3;

const parseNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  const parsed = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeDate = (value) => {
  if (!value) return '';

  const matched = String(value).match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!matched) return '';

  const [, year, month, day] = matched;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const normalizeItem = (item = {}) => {
  const quantity = Math.max(parseNumber(
    item.quantity ?? item.qty ?? item.count ?? item.amount ?? 1,
  ), 1);
  const lineTotal = parseNumber(
    item.lineTotal ?? item.line_total ?? item.totalPrice ?? item.total_price ?? item.total,
  );
  const suppliedUnitPrice = parseNumber(
    item.unitPrice ?? item.unit_price ?? item.price ?? item.salePrice ?? item.sale_price,
  );
  const unitPrice = suppliedUnitPrice || (lineTotal ? Math.round(lineTotal / quantity) : 0);

  return {
    name: String(
      item.name ?? item.productName ?? item.product_name ?? item.itemName ?? item.item_name ?? '',
    ).trim(),
    brand: String(item.brand ?? item.manufacturer ?? '').trim(),
    category: String(item.category ?? '식료품').trim() || '식료품',
    quantity,
    unit: String(item.unit ?? '개').trim() || '개',
    price: unitPrice,
    lineTotal: lineTotal || unitPrice * quantity,
  };
};

export const normalizeReceiptResponse = (response = {}) => {
  const payload = response.data ?? response.result ?? response.receipt ?? response;
  const rawItems = payload.items ?? payload.products ?? payload.lineItems ?? payload.line_items ?? [];

  return {
    shop: String(
      payload.shop ?? payload.store ?? payload.storeName ?? payload.store_name ?? payload.merchantName ?? '',
    ).trim(),
    purchasedAt: normalizeDate(
      payload.purchasedAt ?? payload.purchased_at ?? payload.date ?? payload.paymentDate,
    ),
    items: Array.isArray(rawItems)
      ? rawItems.map(normalizeItem).filter(item => item.name)
      : [],
  };
};

const readErrorMessage = async (response) => {
  try {
    const body = await response.json();
    return body.message ?? body.detail ?? body.error ?? '';
  } catch {
    return '';
  }
};

export const validateReceiptFile = (file) => {
  if (!file) throw new Error('영수증 이미지를 선택해주세요.');
  if (!file.type?.startsWith('image/')) {
    throw new Error('JPG, PNG, HEIC 등 이미지 파일만 업로드할 수 있습니다.');
  }
  if (file.size > MAX_RECEIPT_SIZE) {
    throw new Error('영수증 이미지는 4MB 이하만 업로드할 수 있습니다.');
  }
};

export const uploadReceipt = async (file) => {
  validateReceiptFile(file);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const apiUrl = import.meta.env.VITE_RECEIPT_API_URL || DEFAULT_RECEIPT_API_URL;

  try {
    let response;

    for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
      const formData = new FormData();
      formData.append('file', file);

      response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (
        !RETRYABLE_STATUS_CODES.has(response.status) ||
        attempt === MAX_REQUEST_ATTEMPTS
      ) {
        break;
      }

      await new Promise(resolve => window.setTimeout(resolve, attempt * 800));
    }

    if (!response.ok) {
      const serverMessage = await readErrorMessage(response);
      throw new Error(serverMessage || `OCR 서버 요청에 실패했습니다. (${response.status})`);
    }

    const result = normalizeReceiptResponse(await response.json());

    if (!result.shop && !result.purchasedAt && result.items.length === 0) {
      throw new Error('영수증에서 정보를 찾지 못했습니다. 더 선명한 사진으로 다시 시도해주세요.');
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('영수증 분석 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    if (error instanceof TypeError) {
      throw new Error('OCR 서버에 연결할 수 없습니다. 서버 실행 상태와 API 주소를 확인해주세요.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
