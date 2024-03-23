import { Client } from '@notionhq/client';
import fs from 'fs';

// // Notion 클라이언트 초기화
const{ token, databaseId } = readConfig();
const notion = new Client({ auth: token });
const{ columnName, year, month } = readConfig().sequentialDate;

// // 데이터베이스의 모든 항목 가져오기
// async function getAllDatabaseItems() {
//     try {
//         const response = await notion.databases.query({
//             database_id: databaseId
//         });
//         return response.results;
//     } catch (error) {
//         console.error("에러 발생:", error.body);
//         return [];
//     }
// }

// // 데이터베이스의 모든 열 가져오기
// async function getAllDatabaseColumns() {
//     try {
//         const response = await notion.databases.retrieve({
//             database_id: databaseId
//         });
//         return response.properties;
//     } catch (error) {
//         console.error("에러 발생:", error.body);
//         return [];
//     }
// }

// // rich text 형식의 내용 가져오기
// function getRichTextContent(properties) {
//     const richTextProperty = properties["your-rich-text-column-name"];
//     if (richTextProperty && richTextProperty.rich_text) {
//         return richTextProperty.rich_text.map(text => text.text.content).join("");
//     }
//     return null;
// }

// 외부 파일에서 databaseId와 token을 읽어오는 함수
function readConfig() {
  try {
    // 외부 파일 읽기
    const configData = fs.readFileSync('config.json', 'utf8');
    const config = JSON.parse(configData);
    return config;
  } catch (error) {
    console.error('Error reading config file:', error);
    return {};
  }
}

// 데이터베이스의 모든 페이지의 ID를 가져오는 함수
async function getAllPageIds(databaseId) {
    try {
      // 데이터베이스 쿼리
      const response = await notion.databases.query({
        database_id: databaseId,
      });
  
      // 페이지 ID 목록 추출
      const pageIds = response.results.map(result => result.id);
      console.log('All page IDs:', pageIds);
      return pageIds;
    } catch (error) {
      console.error('Error fetching page IDs:', error);
      return [];
    }
  }
// 각 페이지에서 열 값을 변경하는 함수
async function updateColumnValueForPage(pageId, columnName, newValue) {
  try {
    // 페이지 정보 가져오기
    const pageResponse = await notion.pages.retrieve({
      page_id: pageId,
    });

    // 열 값 가져오기
    const columnValue = pageResponse.properties[columnName];

    // 열 값이 존재하는 경우 변경
    if (columnValue) {
      // 열 값 변경
      if (columnName === '날짜') {
        // 날짜 열인 경우 특별한 처리
        // newValue를 날짜 형식에 맞게 설정
        const newDateValue = {
          start: newValue,
          end: null,
          time_zone: null,
        };
        columnValue.date = newDateValue;
      } else {
        // 다른 열인 경우 값 직접 변경
        columnValue[columnName] = newValue;
      }

      // 페이지 업데이트
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [columnName]: columnValue,
        },
      });

      console.log(`Column "${columnName}" updated for page ID ${pageId}`);
    } else {
      console.error(`Column "${columnName}" not found for page ID ${pageId}`);
    }
  } catch (error) {
    console.error('Error updating column value:', error);
  }
}

//   // 한번씩 호출
//   async function changeDayNumber() {
//     const columnName = '날짜'; // 변경할 열의 이름
  
//     // 모든 페이지의 ID 가져오기
//     const pageIds = await getAllPageIds(databaseId);
  
//     // 각 페이지의 열 값 변경하기
//     for (let i = 0; i < pageIds.length; i++) {
//       const day = i + 1;
//       const newValue = `2024-03-${day.toString().padStart(2, '0')}`;
//       await updateColumnValueForPage(pageIds[i], columnName, newValue);
//     }
//   }

async function updateSequentialDate(columnName, year, month) {
  // 모든 페이지의 ID 가져오기
  const pageIds = await getAllPageIds(databaseId);
  // 각 페이지의 업데이트 작업을 담을 Promise 배열
  const updatePromises = [];
  // 각 페이지의 열 값 변경하기
  for (let i = 0; i < pageIds.length; i++) {
    const day = i + 1;
    const newValue = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    updatePromises.push(updateColumnValueForPage(pageIds[i], columnName, newValue));
  }

  // 모든 페이지의 업데이트가 완료될 때까지 기다리기
  await Promise.all(updatePromises);

  console.log('All pages updated successfully!');
}

updateSequentialDate(columnName, year, month);