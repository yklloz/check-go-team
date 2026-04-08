// 버튼 클릭하면 영수증 이미지 업로드
const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);  // 이미지 파일 담기

  const response = await fetch('http://localhost:3000/receipt/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();  // 서버 응답 받기
  console.log(result);
};