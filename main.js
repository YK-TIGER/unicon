async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return await response.text();
}

// 파일 존재 여부 확인용 (텍스트 기준)
async function quizExists(index) {
  try {
    const res = await fetch(`quiz/${index}question.txt`);
    return res.ok;
  } catch {
    return false;
  }
}

async function loadRandomQuiz() {
  const maxIndex = 100;
  let available = [];

  // 실제 존재하는 퀴즈만 수집
  for (let i = 1; i <= maxIndex; i++) {
    const exists = await quizExists(i);
    if (exists) available.push(i);
  }

  if (available.length === 0) {
    document.getElementById('quiz-question').textContent = 'No quiz available';
    return;
  }

  // 랜덤 선택
  const randIndex = available[Math.floor(Math.random() * available.length)];
  const question = await fetchText(`quiz/${randIndex}question.txt`);
  const answer = await fetchText(`quiz/${randIndex}answer.txt`);

  document.getElementById('quiz-question').textContent = question;
  document.getElementById('quiz-answer').textContent = answer;
  document.getElementById('quiz-image').src = `quiz/${randIndex}.png`;
}

// DOM 준비 후 실행
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('show-answer-btn').addEventListener('click', () => {
    document.getElementById('quiz-answer').style.display = 'block';
  });

  loadRandomQuiz();
});
