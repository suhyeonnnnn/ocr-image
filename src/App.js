import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

function OCRApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [extractedData, setExtractedData] = useState({
    name: '',
    age: '',
    item: '',
    deliveryDate: ''
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = () => {
    if (!image) return;

    setIsLoading(true);
    setText('');
    setExtractedData({
      name: '',
      age: '',
      item: '',
      deliveryDate: ''
    });

    Tesseract.recognize(
      image,
      'kor+eng', // 한국어와 영어 모두 인식
      { 
        logger: m => console.log(m) 
      }
    ).then(({ data: { text } }) => {
      setText(text);
      extractInformation(text);
      setIsLoading(false);
    }).catch(err => {
      console.error('OCR 처리 중 오류 발생:', err);
      setIsLoading(false);
    });
  };

  const extractInformation = (text) => {
    // 정규 표현식을 사용하여 이름, 나이, 물건, 배송일 추출
    // 주의: 실제 입력 형식에 따라 정규식을 조정해야 할 수 있습니다.
    
    // 이름 추출 (예: "이름: 홍길동" 또는 "이름 홍길동")
    const nameMatch = text.match(/이름\s*:?\s*([^\s\d,]+)/i) || 
                      text.match(/명\s*:?\s*([^\s\d,]+)/i);
    
    // 나이 추출 (예: "나이: 30" 또는 "나이 30")
    const ageMatch = text.match(/나이\s*:?\s*(\d+)/i) || 
                     text.match(/연령\s*:?\s*(\d+)/i);
    
    // 물건 추출 (예: "물건: 노트북" 또는 "상품: 노트북")
    const itemMatch = text.match(/물건\s*:?\s*([^\n,]+)/i) || 
                      text.match(/상품\s*:?\s*([^\n,]+)/i) ||
                      text.match(/제품\s*:?\s*([^\n,]+)/i);
    
    // 배송일 추출 (예: "배송일: 2025-03-24" 또는 다양한 날짜 형식)
    const dateMatch = text.match(/배송일\s*:?\s*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i) ||
                      text.match(/배송\s*일자\s*:?\s*(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i) ||
                      text.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/); // 날짜 형식만 찾기

    setExtractedData({
      name: nameMatch ? nameMatch[1].trim() : '',
      age: ageMatch ? ageMatch[1].trim() : '',
      item: itemMatch ? itemMatch[1].trim() : '',
      deliveryDate: dateMatch ? dateMatch[1].trim() : ''
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="ocr-app" style={styles.container}>
      <h1 style={styles.title}>OCR 이미지 인식 앱</h1>
      <p style={styles.description}>
        이미지를 업로드하여 이름, 나이, 물건, 배송일 정보를 추출합니다.
      </p>

      <div style={styles.uploadSection}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={styles.fileInput}
        />
        <button 
          onClick={triggerFileInput} 
          style={styles.button}
        >
          이미지 선택
        </button>
        <button 
          onClick={processImage} 
          disabled={!image || isLoading} 
          style={{
            ...styles.button,
            opacity: !image || isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? '처리 중...' : '이미지 분석하기'}
        </button>
      </div>

      {image && (
        <div style={styles.previewContainer}>
          <h2 style={styles.sectionTitle}>업로드된 이미지</h2>
          <img src={image} alt="업로드된 이미지" style={styles.imagePreview} />
        </div>
      )}

      {isLoading && (
        <div style={styles.loadingContainer}>
          <p>이미지 처리 중입니다. 잠시만 기다려주세요...</p>
        </div>
      )}

      {text && !isLoading && (
        <div style={styles.resultsContainer}>
          <div style={styles.extractedDataContainer}>
            <h2 style={styles.sectionTitle}>추출된 정보</h2>
            <div style={styles.dataGrid}>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>이름:</span>
                <span style={styles.dataValue}>{extractedData.name || '인식되지 않음'}</span>
              </div>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>나이:</span>
                <span style={styles.dataValue}>{extractedData.age || '인식되지 않음'}</span>
              </div>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>물건:</span>
                <span style={styles.dataValue}>{extractedData.item || '인식되지 않음'}</span>
              </div>
              <div style={styles.dataRow}>
                <span style={styles.dataLabel}>배송일:</span>
                <span style={styles.dataValue}>{extractedData.deliveryDate || '인식되지 않음'}</span>
              </div>
            </div>
          </div>

          <div style={styles.rawTextContainer}>
            <h2 style={styles.sectionTitle}>전체 인식 텍스트</h2>
            <pre style={styles.rawText}>{text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// 스타일 정의
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px'
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px'
  },
  uploadSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  fileInput: {
    display: 'none'
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s'
  },
  previewContainer: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '5px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
  },
  loadingContainer: {
    textAlign: 'center',
    margin: '20px 0',
    color: '#666'
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  extractedDataContainer: {
    backgroundColor: 'white',
    borderRadius: '5px',
    padding: '20px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '15px',
    color: '#333'
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px'
  },
  dataRow: {
    display: 'flex',
    gap: '10px'
  },
  dataLabel: {
    fontWeight: 'bold',
    width: '80px',
    color: '#555'
  },
  dataValue: {
    flex: '1',
    padding: '0 10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '3px',
    minHeight: '24px',
    lineHeight: '24px'
  },
  rawTextContainer: {
    backgroundColor: 'white',
    borderRadius: '5px',
    padding: '20px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
  },
  rawText: {
    whiteSpace: 'pre-wrap',
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '14px',
    maxHeight: '200px',
    overflowY: 'auto'
  }
};

export default OCRApp;