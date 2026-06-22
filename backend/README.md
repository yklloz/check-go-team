# CheckGo Receipt OCR API

기존 `feat/yk-backend`를 NAVER Cloud CLOVA OCR 영수증 인식 API를 사용하는
OCR 전용 서버로 정리한 디렉터리입니다.

```bash
npm install
cp .env.example .env
npm run start:dev
```

`backend/.env`에 CLOVA OCR 콘솔에서 발급한 값을 입력합니다.

```dotenv
CLOVA_OCR_INVOKE_URL=발급받은_영수증_OCR_Invoke_URL
CLOVA_OCR_SECRET=발급받은_Secret_Key
```

## API

`POST /receipt/upload`

- Content-Type: `multipart/form-data`
- 파일 필드: `file`
- 이미지 최대 크기: 10MB

```bash
curl -F "file=@test-receipt.png" http://localhost:3000/receipt/upload
```

응답:

```json
{
  "shop": "페이히어 카페",
  "purchasedAt": "2024-08-21",
  "items": [
    {
      "name": "Americano",
      "brand": "",
      "category": "식료품",
      "quantity": 1,
      "unit": "개",
      "price": 5000,
      "lineTotal": 5000
    }
  ],
  "confidence": 83,
  "warnings": []
}
```
