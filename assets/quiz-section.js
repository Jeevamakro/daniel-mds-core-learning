document.addEventListener('DOMContentLoaded', function() {
  const blocks = document.querySelectorAll('.custom-solution .question-block');
  const nextbtn = document.querySelector('.custom-solution .next-button');
  const circles = document.querySelectorAll('.custom-solution .circle');
  let currentIndex = 0;
  let results = [];
  blocks.forEach((block, index) => {
    if (index !== 0) block.style.display = 'none';
  });
   circles[0].classList.add("active");
  nextbtn.addEventListener('click', function () {
    const currentBlock = blocks[currentIndex];
    const title = currentBlock.querySelector('.question-title').textContent;
    let selectedOptions = [];
    for (let opt of currentBlock.querySelectorAll('input[type="checkbox"]:checked')) {
      selectedOptions.push(opt.value);
    }
    results.push({
      question: title,
      answers: selectedOptions
    });
    currentBlock.style.display = 'none';
    currentIndex++;
    if (circles[currentIndex]) {
      circles[currentIndex].classList.add("active");
    }
    if (currentIndex < blocks.length) {
      blocks[currentIndex].style.display = 'block';
    } else {
      nextbtn.style.display = 'none';
      showSummary(results);
    }
  });

const count = circles.length;
circles.forEach((circle, index) => {
  const position = (100 / (count - 1)) * index; // 0% → 100%
  circle.style.position = "absolute";
  circle.style.left = position + "%";
});

  function showSummary(results) {
    const summaryContainer = document.createElement('div');
    summaryContainer.className = "summary-block";
    summaryContainer.style.marginTop = "20px";
    summaryContainer.innerHTML = "<h2>Selected Answers</h2>";

    results.forEach((item, i) => {
      const q = document.createElement('div');
      q.innerHTML = `
        <h4>${i+1}. ${item.question}</h4>
        <p><strong>Selected option:</strong> ${item.answers.length ? item.answers.join(' ') : "No option selected"}</p>
      `;
      summaryContainer.appendChild(q);
    });

    document.querySelector('.custom-solution').appendChild(summaryContainer);
  }
});