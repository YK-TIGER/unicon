const usedProblems = new Set();
const maxProblemCount = 3;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

// 문제 존재 여부 확인
async function checkExists(index) {
  try {
    const res = await fetch(`quiz/${index}question.txt`);
    return res.ok;
  } catch {
    return false;
  }
}

// 실제 존재하는 문제 리스트 수집
async function getAvailableProblems() {
  const checks = [];

  for (let i = 1; i <= maxProblemCount; i++) {
    checks.push(checkExists(i).then(ok => (ok ? i : null)));
  }

  const results = await Promise.all(checks);
  return results.filter(n => n !== null);
}

let availableProblems = [];

async function loadRandomQuiz() {
  if (availableProblems.length === 0) {
    availableProblems = await getAvailableProblems();
  }

  // 아직 사용되지 않은 문제 필터링
  const remaining = availableProblems.filter(n => !usedProblems.has(n));
  if (remaining.length === 0) {
    document.getElementById('quiz-question').textContent = '모든 문제를 다 풀었습니다!';
    document.getElementById('quiz-image').style.display = 'none';
    document.getElementById('show-answer-btn').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'none';
    return;
  }

  const rand = remaining[Math.floor(Math.random() * remaining.length)];
  usedProblems.add(rand);

  const question = await fetchText(`quiz/${rand}question.txt`);
  const answer = await fetchText(`quiz/${rand}answer.txt`);

  // 요소들 갱신
  document.getElementById('quiz-image').src = `quiz/${rand}.png`;
  document.getElementById('quiz-question').textContent = question;
  document.getElementById('quiz-answer').textContent = answer;

  // 상태 초기화
  document.getElementById('quiz-image').style.display = 'block';
  document.getElementById('quiz-question').style.display = 'block';
  document.getElementById('quiz-answer').style.display = 'none';
  document.getElementById('show-answer-btn').style.display = 'inline-block';
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('show-answer-btn').addEventListener('click', () => {
    document.getElementById('quiz-image').style.display = 'none';
    document.getElementById('quiz-question').style.display = 'none';
    document.getElementById('quiz-answer').style.display = 'block';
    document.getElementById('show-answer-btn').style.display = 'none';
  });

  document.getElementById('next-question-btn').addEventListener('click', () => {
    loadRandomQuiz();
  });

  loadRandomQuiz();
});
