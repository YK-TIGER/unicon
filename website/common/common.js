const usedProblems = new Set();
const maxProblemCount = 8;
let availableProblems = [];

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

async function checkExists(index) {
  try {
    const res = await fetch(`quiz/${index}question.txt`);
    return res.ok;
  } catch {
    return false;
  }
}

async function getAvailableProblems() {
  const checks = [];
  for (let i = 1; i <= maxProblemCount; i++) {
    checks.push(checkExists(i).then(ok => (ok ? i : null)));
  }
  const results = await Promise.all(checks);
  return results.filter(n => n !== null);
}

// 배열 섞기 (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function loadRandomQuiz() {
  if (availableProblems.length === 0) {
    availableProblems = await getAvailableProblems();
  }

  const remaining = availableProblems.filter(n => !usedProblems.has(n));
  if (remaining.length === 0) {
    document.getElementById('quiz-question').textContent = '모든 문제를 다 풀었습니다!';
    document.getElementById('quiz-choices').innerHTML = '';
    document.getElementById('quiz-answer').style.display = 'none';
    document.getElementById('show-answer-btn').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'inline-block'; // 다시 시작 버튼 표시
    return;
  }

  const rand = remaining[Math.floor(Math.random() * remaining.length)];
  usedProblems.add(rand);

  const question = await fetchText(`quiz/${rand}question.txt`);
  const answer = await fetchText(`quiz/${rand}answer.txt`);
  const choicesRaw = await fetchText(`quiz/${rand}choose.txt`);
  let choices = choicesRaw.trim().split('\n').slice(0, 4);

  // 보기 섞기
  choices = shuffleArray(choices);

  // 알파벳 리스트 (a, b, c, d)
  const alphabets = ['a', 'b', 'c', 'd'];

  // 정답 인덱스 찾기
  const answerIndex = choices.findIndex(c => c.trim() === answer.trim());

  // 문제 텍스트 출력
  const quizQuestion = document.getElementById('quiz-question');
  quizQuestion.textContent = question;
  quizQuestion.style.display = 'block';

  // 보기 출력
  const choicesContainer = document.getElementById('quiz-choices');
  choicesContainer.innerHTML = '';
  choices.forEach((choice, i) => {
    const li = document.createElement('li');
    li.textContent = `${alphabets[i]}. ${choice}`;
    li.style.fontSize = '1.2em';
    choicesContainer.appendChild(li);
  });

  // 정답 출력 준비 (숨김)
  const quizAnswer = document.getElementById('quiz-answer');
  if (answerIndex !== -1) {
    quizAnswer.textContent = `${alphabets[answerIndex]}. ${answer}`;
  } else {
    quizAnswer.textContent = answer;
  }
  quizAnswer.style.display = 'none';

  // 버튼 조정
  document.getElementById('show-answer-btn').style.display = 'inline-block';
  document.getElementById('next-question-btn').style.display = 'none'; // ✅ 다음 문제 버튼 숨기기
  document.getElementById('reset-btn').style.display = 'none'; // 다시 시작 버튼 숨기기
}

document.addEventListener("DOMContentLoaded", () => {
  // 초기 버튼 상태
  document.getElementById('reset-btn').style.display = 'none';
  document.getElementById('next-question-btn').style.display = 'none'; // ✅ 처음부터 숨기기

  document.getElementById('show-answer-btn').addEventListener('click', () => {
    document.getElementById('quiz-question').style.display = 'none';
    document.getElementById('quiz-choices').innerHTML = '';
    document.getElementById('quiz-answer').style.display = 'block';
    document.getElementById('show-answer-btn').style.display = 'none';

    // ✅ 정답 본 이후에만 다음 문제 버튼 보이기
    document.getElementById('next-question-btn').style.display = 'inline-block';
  });

  document.getElementById('next-question-btn').addEventListener('click', () => {
    loadRandomQuiz();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    usedProblems.clear();
    document.getElementById('reset-btn').style.display = 'none';
    loadRandomQuiz();
  });

  loadRandomQuiz();
});
