;(function () {
	'use strict'

	const Correct = {
		userAnswers: null,
		quiz: null,
		user: null,
		correctQuestionsElement: null,
		correctBackButtonElement: null,
		init() {
			const id = sessionStorage.getItem('testId')
			const data = JSON.parse(sessionStorage.getItem('formData'))
			this.user = {
				name: data[0].value,
				lastName: data[1].value,
				email: data[2].value,
			}
			this.userAnswers = JSON.parse(sessionStorage.getItem('userResult'))
			this.correctBackButtonElement = document.getElementById('back')
			this.correctBackButtonElement.onclick = function () {
				location.href = 'result.html'
			}

			if (id) {
				const xhr = new XMLHttpRequest()
				xhr.open('GET', 'https://testologia.ru/get-quiz?id=' + id, false)
				xhr.send()

				if (xhr.status === 200 && xhr.responseText) {
					try {
						this.quiz = JSON.parse(xhr.responseText)
					} catch (error) {
						location.href = 'index.html'
					}
				} else {
					location.href = 'index.html'
				}

				xhr.open('GET', 'https://testologia.ru/get-quiz-right?id=' + id, false)
				xhr.send()

				let rightAnswers = null
				if (xhr.status === 200 && xhr.responseText) {
					try {
						rightAnswers = JSON.parse(xhr.responseText)
					} catch (error) {
						location.href = 'index.html'
					}
				} else {
					location.href = 'index.html'
				}

				if (this.userAnswers.length === rightAnswers.length) {
					this.userAnswers.map((item, index) => {
						if (item.chosenAnswerId === rightAnswers[index]) {
							return (item.isRight = true)
						} else {
							return (item.isRight = false)
						}
					})
				} else {
					location.href = 'index.html'
				}
			} else {
				location.href = 'index.html'
			}

			this.correctQuestionsElement =
				document.getElementById('correct-questions')

			this.renderPage()
		},
		renderPage() {
			document.getElementById('name-quiz').innerText = this.quiz.name
			document.getElementById('info').innerText =
				this.user.name + ' ' + this.user.lastName + ', ' + this.user.email

			this.quiz.questions.forEach((item, index) => {
				const userAnswer =
					item.id === this.userAnswers[index].questionId
						? this.userAnswers[index]
						: null

				const correctQuestionElement = document.createElement('div')
				correctQuestionElement.className = 'correct__question'

				const questionTitle = document.createElement('div')
				questionTitle.className = 'correct__question-title'
				questionTitle.innerHTML =
					'<span>Вопрос ' + (index + 1) + ':</span> ' + item.question

				const questionOptions = document.createElement('div')
				questionOptions.className = 'correct__question-options'

				item.answers.forEach((answer, index) => {
					const questionOption = document.createElement('div')
					questionOption.className = 'correct__question-option'

					const inputId = 'answer-' + answer.id
					const answerInputElement = document.createElement('input')
					if (userAnswer && answer.id === userAnswer.chosenAnswerId) {
						if (userAnswer.isRight) {
							answerInputElement.classList.add('option--right')
						} else {
							answerInputElement.classList.add('option--wrong')
						}
					} else {
						answerInputElement.className = 'option-answer'
					}
					answerInputElement.setAttribute('type', 'radio')
					answerInputElement.setAttribute('name', 'answer-' + item.id)
					answerInputElement.setAttribute('id', inputId)
					answerInputElement.setAttribute('value', answer.id)
					answerInputElement.setAttribute('disabled', 'disabled')

					const answerLabelElement = document.createElement('label')
					answerLabelElement.setAttribute('for', inputId)
					answerLabelElement.innerText = answer.answer

					questionOption.appendChild(answerInputElement)
					questionOption.appendChild(answerLabelElement)

					questionOptions.appendChild(questionOption)

					correctQuestionElement.appendChild(questionTitle)
					correctQuestionElement.appendChild(questionOptions)

					this.correctQuestionsElement.appendChild(correctQuestionElement)
				})
			})
		},
	}

	Correct.init()
})()
