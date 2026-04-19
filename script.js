const SURVEY_KEY = "ZLSH_SURVEY_STAMP_001";
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyc6gEkFfDpdaifQk2cNLdqtzgF0Nm9TZtuI0rD1NcjJSwJwwW_ZRvzXNsoC5f-432e/exec";

const QUESTIONS = [
  "面對艱難的學習內容時，我常覺得自己無法完成。",
  "即使我已經努力準備，成績卻仍不如預期。",
  "我覺得目前學校的課業難度超出了我的能力範圍。",
  "看到其他同學輕鬆取得好成績，會讓我對自己感到沮喪。",
  "在學校或補習班的小考中，我常因為挫折而想放棄這門學科。",
  "師長或家長對我成績的期待，讓我感到沉重的壓力。",
  "我相信只要我願意投入時間，我就能學會大部分的學科內容。",
  "當課業遇到問題時，我不相信自己有能力找到解決方法。",
  "我覺得自己再怎麼努力，也無法改變成績不好的現實。",
  "面對全新的學習任務時，我通常缺乏信心。",
  "只要考試題目稍微變形，我就會覺得自己一定寫不出來。",
  "我認為自己不是讀書的料，對未來的升學感到茫然。",
  "當我在課業上失敗時，我會將其歸咎於自己的能力不足。",
  "我常在截止日期（如交作業、段考）前一刻才開始趕進度。",
  "雖然知道該讀書，但我會先滑手機、看影片來逃避壓力。",
  "對於那些讓我感到挫折的學科，我會花更多時間去拖延。",
  "我習慣把困難的功課往後延，先做簡單但無關緊要的小事。",
  "我常覺得「現在心情不好」，所以推遲原定的讀書計畫。",
  "我發現自己在拖延時會感到焦慮，但仍無法立刻動手。",
  "即便我在最後期限前試圖補救，卻仍因先前的拖延而無法如期完成。"
];

const LABELS = ["從不", "很少", "有時", "經常", "總是"];

window.onload = function() {
  if(localStorage.getItem(SURVEY_KEY)) {
    showSection('alreadySubmittedPage', 100);
    document.getElementById('progressWrapper').style.display = 'none';
    return;
  }

  const container = document.getElementById('questionsContainer');
  QUESTIONS.forEach((q, index) => {
    const qIdx = index + 1;
    const html = `
      <div class="mb-4">
        <label class="question-title">${qIdx}. ${q}</label>
        <div class="scale-wrapper">
          ${[1, 2, 3, 4, 5].map((v, i) => `
            <label class="scale-point">
              <span class="scale-label">${LABELS[i]}</span>
              <input type="radio" name="q${qIdx}" value="${v}">
              <div class="scale-dot"></div>
            </label>
          `).join('')}
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
};

function nav(dir, from) {
  document.querySelectorAll('.error-hint').forEach(e => e.style.display = 'none');
  
  if (dir === 'next') {
    if (from === 1) {
      const status = document.querySelector('input[name="isStudent"]:checked');
      if (!status) { document.getElementById('err1').style.display = 'block'; return; }
      if (status.value === 'yes') { showSection('section2', 25); } 
      else { showSection('section_invalid', 100); }
    } else if (from === 2) {
      const g = document.querySelector('input[name="grade"]:checked');
      const s = document.querySelector('input[name="gender"]:checked');
      const p = document.querySelector('input[name="performance"]:checked');
      if (!g || !s || !p) { document.getElementById('err2').style.display = 'block'; return; }
      showSection('section3', 75);
    } else if (from === 3) {
      let allAnswered = true;
      for(let i=1; i<=20; i++) {
        if(!document.querySelector(`input[name="q${i}"]:checked`)) { allAnswered = false; break; }
      }
      if(!allAnswered) { document.getElementById('err3').style.display = 'block'; return; }
      showSection('section4', 90);
    }
  } else {
    if (from === 2 || from === 'invalid') showSection('section1', 0);
    if (from === 3) showSection('section2', 25);
    if (from === 4) showSection('section3', 75);
  }
}

function showSection(id, progress) {
  document.querySelectorAll('.card-base').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  const target = document.getElementById(id);
  target.classList.add('active');
  target.style.display = 'block';
  document.getElementById('progressBar').style.width = progress + '%';
  window.scrollTo(0, 0);
}

async function submitFinal() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = "提交中...";

  const formData = new FormData(document.getElementById('mainForm'));
  const data = Object.fromEntries(formData.entries());
  
  for(let i=1; i<=20; i++) {
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    data['q' + i] = checked ? checked.value : "";
  }

  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      }
    });

    localStorage.setItem(SURVEY_KEY, "done");
    finish();

  } catch (error) {
    console.error("提交失敗:", error);
    btn.disabled = false;
    btn.innerHTML = "重新送出";
    alert("提交失敗，請檢查網路連線或嘗試在一般瀏覽器開啟。");
  }
}


function finish() {
  document.getElementById('mainForm').style.display = 'none';
  document.getElementById('progressWrapper').style.display = 'none';
  showSection('successPage', 100);
}