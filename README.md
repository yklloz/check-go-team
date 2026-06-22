# CheckGo Frontend

> 배포 사이트: [https://check-go-app.vercel.app](https://check-go-app.vercel.app)

## 실행

프런트:

```bash
npm install
cp .env.example .env.local
npm run dev
```

OCR 백엔드(별도 터미널):

```bash
cd backend
npm install
npm run start:dev
```

프런트는 `http://localhost:5173`, OCR 서버는 `http://localhost:3000`에서
실행됩니다. `backend/.env`에는 CLOVA OCR의 Invoke URL과 Secret Key를
설정해야 합니다.

## 영수증 OCR 연동

프런트는 `multipart/form-data`의 `file` 필드로 영수증 이미지를 전송합니다.

- 개발 기본 URL: `/api/receipt/upload`
- Vite 프록시 대상: `RECEIPT_API_PROXY_TARGET` (기본값 `http://127.0.0.1:3000`)
- 별도 배포 API: `VITE_RECEIPT_API_URL`

백엔드는 아래 형태로 응답하는 것을 권장합니다. `store_name`, `product_name`,
`unit_price`, `line_total` 같은 snake_case 응답도 프런트에서 정규화합니다.

```json
{
  "shop": "이마트",
  "purchasedAt": "2026-06-18",
  "items": [
    {
      "name": "우유",
      "brand": "서울우유",
      "quantity": 2,
      "unit": "개",
      "price": 2800,
      "lineTotal": 5600
    }
  ]
}
```

Vercel Functions의 요청 본문 제한을 고려해 이미지는 최대 4MB까지 허용하며
요청 제한 시간은 30초입니다.

백엔드는 OCR 분석만 수행합니다. 사용자가 등록 화면에서 결과를 검수한 뒤
`Supabase에 저장`을 눌렀을 때 아래 테이블에 저장됩니다.

- `stores`
- `purchase_orders`
- `purchase_order_items`
- `stock_movements`
- `inventories`

연결된 Supabase 프로젝트 URL은
`https://beiiwykdmvqoovbetjnl.supabase.co`입니다.

원본 영수증 이미지는 비공개 `receipt-images` Storage 버킷에 사용자별 경로로
저장됩니다. 최초 한 번 Supabase SQL Editor에서
`supabase/07_receipt_storage.sql`을 실행해야 합니다.

## Vercel 배포

프런트와 OCR 백엔드는 같은 저장소에서 별도 Vercel 프로젝트로 배포합니다.

1. 백엔드 프로젝트의 Root Directory를 `backend`로 설정합니다.
2. 백엔드 환경 변수에 아래 값을 등록합니다.
   - `CLOVA_OCR_INVOKE_URL`
   - `CLOVA_OCR_SECRET`
   - `FRONTEND_ORIGIN` (배포된 프런트 주소)
3. 프런트 프로젝트의 Root Directory는 저장소 루트로 설정합니다.
4. 프런트 환경 변수 `VITE_RECEIPT_API_URL`에
   `https://백엔드주소/receipt/upload`를 등록합니다.
5. 환경 변수를 변경한 뒤에는 해당 프로젝트를 다시 배포합니다.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
