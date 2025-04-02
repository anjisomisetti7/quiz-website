// A list of the questions to be shown in the quiz
const questions = [
    {
        question: "Which language is primarily used for developing Android applications?",
        options: ["Python", "Swift", "Java", "C++"],
        correctAnswer: "Java"
    },
    {
        question: "Which data structure uses LIFO (Last In, First Out) principle?",
        options: ["Queue", "Stack", "Linked List", "Heap"],
        correctAnswer: "Stack"
    },
    {
        question: "What does ‘O’ represent in Big-O Notation?",
        options: ["Order", "Overflow", "Object", "Optimization"],
        correctAnswer: "Order"
    },
    {
        question: "Which of the following is NOT an OOP (Object-Oriented Programming) principle?",
        options: ["Encapsulation", "Inheritance", "Compilation", "Polymorphism"],
        correctAnswer: "Compilation"
    },
    {
        question: "Which sorting algorithm has the worst-case time complexity of O(n²)?",
        options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"],
        correctAnswer: "Bubble Sort"
    },
    {
        question: "What will be the output of print(2 ** 3) in Python?",
        options: ["5", "6", "8", "9"],
        correctAnswer: "8"
    },
    {
        question: "Which SQL command is used to fetch unique records from a table?",
        options: ["DISTINCT", "UNIQUE", "SELECT UNIQUE", "SELECT DISTINCT VALUES"],
        correctAnswer: "DISTINCT"
    },
    {
        question: "What will be the output of console.log(typeof NaN) in JavaScript?",
        options: ["Undefined", "Object", "Number", "Null"],
        correctAnswer: "Number"
    },
    {
        question: "Which of the following is true about Node.js?",
        options: ["Node.js is a front-end framework", "Node.js runs on a browser", "Node.js is single-threaded but can handle asynchronous operations", "Node.js does not use JavaScript"],
        correctAnswer: "Node.js is single-threaded but can handle asynchronous operations"
    },
    {
        question: "Which method is used in Express.js to define a route that handles HTTP GET requests?",
        options: ["app.post()", "app.route()", "app.get()", "app.http()"],
        correctAnswer: "app.get()"
    }
  ];
  
  let currentQuestionIndex = 0;
  let userAnswers = [];
  
  const questionContainer = document.getElementById('question-container');
  const optionsContainer = document.getElementById('options-container');
  const submitButton = document.getElementById('submit-btn');
  
  // Display the current question and options
  function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showFinalScore();
        return;
    }
  
    const question = questions[currentQuestionIndex];
    questionContainer.textContent = question.question;
    optionsContainer.innerHTML = ''; // Clear previous options
  
    question.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'answer';
        radioInput.value = option;
        
        const label = document.createElement('label');
        label.textContent = option;
  
        optionElement.appendChild(radioInput);
        optionElement.appendChild(label);
        optionsContainer.appendChild(optionElement);
    });
  
    // Increment the question index for the next round
    currentQuestionIndex++;
  }
  
  // Function to submit the answers and calculate the final score
  submitButton.addEventListener('click', () => {
    const selectedAnswers = document.querySelectorAll('input[name="answer"]:checked');
    
    // Collect all the selected answers
    selectedAnswers.forEach(input => {
        userAnswers.push(input.value);
    });
  
    // Ensure all questions have been answered
    if (userAnswers.length !== questions.length) {
        alert('Please answer all the questions.');
        return;
    }
  
    // Send answers to the backend for scoring
    fetch('/submit-quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: userAnswers }),
    })
    .then(response => response.json())
    .then(data => {
        // Display the final score along with the Logout button
        showFinalScore(data.score);
    })
    .catch(error => {
        console.log('Error submitting quiz:', error);
    });
  });
  
  // Function to display the final score and Logout button
  function showFinalScore(score = 0) {
      document.getElementById('quiz-container').innerHTML = `
          <h2>Quiz Over!</h2>
          <p>Your score is: ${score} out of ${questions.length}</p>
          <button onclick="restartQuiz()">Restart Quiz</button>
          <button onclick="logout()">Logout</button>
      `;
  }
  
  // Function to restart the quiz
  function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    loadQuestion();
  }
  
  // Logout function
  function logout() {
      localStorage.removeItem("token");  // Clear token from localStorage
      window.location.href = "login.html";  // Redirect to login page
  }
  
  // Initialize the first question
  loadQuestion();
  
