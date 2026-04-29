// 다른 파일에서 쓸 수 있게 export 키워드 추가함
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://127.0.0.1:3000/receipt/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('서버 통신 실패');
    }

    const result = await response.json(); 
    return result; // 결과값을 SidePanel로 돌려줌
  } catch (error) {
    console.error("OCR 업로드 에러:", error);
    throw error; // 에러를 발생시켜 UI에서 알림을 띄우게 함
  }
};