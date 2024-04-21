;(function () {
	'use strict'

	const Test = {
		quiz: null,
		currentQuestionIndex: 1,
		questionTitleElement: null,
		optionsElement: null,
		nextButtonElement: null,
		prevButtonElement: null,
		passButtonElement: null,
		progressBarElement: null,
		userResult: [],
		passArrow: null,
		init() {
			checkUserData()
			const url = new URL(location.href)
			const testId = url.searchParams.get('id')

			if (testId) {
				const xhr = new XMLHttpRequest()
				xhr.open('GET', 'https://testologia.ru/get-quiz?id=' + testId, false)
				xhr.send()

				if (xhr.status === 200 && xhr.responseText) {
					try {
						this.quiz = JSON.parse(xhr.responseText)
					} catch (error) {
						location.href = 'index.html'
					}

					this.startQuiz()
				} else {
					location.href = 'index.html'
				}
			} else {
				location.href = 'index.html'
			}
		},
		startQuiz() {
			document.getElementById('pre-title').innerText = this.quiz.name
			this.progressBarElement = document.getElementById('progress-bar')
			this.questionTitleElement = document.getElementById('title')
			this.optionsElement = document.getElementById('options')
			this.nextButtonElement = document.getElementById('next')
			this.nextButtonElement.onclick = this.move.bind(this, 'next')
			this.prevButtonElement = document.getElementById('prev')
			this.prevButtonElement.onclick = this.move.bind(this, 'prev')
			this.passButtonElement = document.getElementById('pass')
			this.passButtonElement.onclick = this.move.bind(this, 'pass')

			this.passArrow = document.getElementById('pass-img')

			this.prepareProgressBar()
			this.showQuestion()

			const timerElement = document.getElementById('timer')
			let second = 59
			const interval = setInterval(
				function () {
					second--
					timerElement.innerText = second

					if (second === 0) {
						clearInterval(interval)
						this.complete()
					}
				}.bind(this),
				1000
			)
		},
		prepareProgressBar() {
			for (let i = 0; i < this.quiz.questions.length; i++) {
				const itemElement = document.createElement('div')
				itemElement.className =
					'progress-bar__item ' + (i === 0 ? 'progress-bar__item--active' : '')

				const itemCircleElement = document.createElement('div')
				itemCircleElement.className = 'progress-bar__item-circle'

				const itemTextElement = document.createElement('div')
				itemTextElement.className = 'progress-bar__item-text'
				itemTextElement.innerText = 'Вопрос ' + (i + 1)

				itemElement.appendChild(itemCircleElement)
				itemElement.appendChild(itemTextElement)

				this.progressBarElement.appendChild(itemElement)
			}
		},
		showQuestion() {
			const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1]
			this.questionTitleElement.innerHTML =
				'<span>Вопрос ' +
				this.currentQuestionIndex +
				':</span> ' +
				activeQuestion.question

			this.optionsElement.innerHTML = ''
			const that = this
			const chosenOption = this.userResult.find(
				item => item.questionId === activeQuestion.id
			)
			activeQuestion.answers.forEach(answer => {
				const optionElement = document.createElement('div')
				optionElement.classList = 'test__question-option'

				const inputId = 'answer-' + answer.id
				const answerInputElement = document.createElement('input')
				answerInputElement.className = 'option__answer'
				answerInputElement.setAttribute('type', 'radio')
				answerInputElement.setAttribute('name', 'answer')
				answerInputElement.setAttribute('id', inputId)
				answerInputElement.setAttribute('value', answer.id)
				if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
					answerInputElement.setAttribute('checked', 'checked')
					// this.isChecked = true
				}

				answerInputElement.onchange = function () {
					that.chooseAnswer()
				}

				const answerLabelElement = document.createElement('label')
				answerLabelElement.setAttribute('for', inputId)
				answerLabelElement.innerText = answer.answer

				optionElement.appendChild(answerInputElement)
				optionElement.appendChild(answerLabelElement)

				this.optionsElement.appendChild(optionElement)
			})

			if (chosenOption && chosenOption.chosenAnswerId) {
				this.nextButtonElement.removeAttribute('disabled')
				this.passButtonElement.classList.add('disabled')
				this.passArrow.setAttribute('src', 'assets/images/small-arrow-gray.png')
			} else {
				this.nextButtonElement.setAttribute('disabled', 'disabled')
				this.passButtonElement.classList.remove('disabled')
				this.passArrow.setAttribute('src', 'assets/images/small-arrow.png')
			}
			if (this.currentQuestionIndex === this.quiz.questions.length) {
				this.nextButtonElement.innerText = 'Завершить'
			} else {
				this.nextButtonElement.innerText = 'Далее'
			}
			if (this.currentQuestionIndex > 1) {
				this.prevButtonElement.removeAttribute('disabled')
			} else {
				this.prevButtonElement.setAttribute('disabled', 'disabled')
			}
		},
		chooseAnswer() {
			this.nextButtonElement.removeAttribute('disabled')
			this.passButtonElement.classList.add('disabled')
			this.passArrow.setAttribute('src', 'assets/images/small-arrow-gray.png')
		},
		move(action) {
			const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1]
			const chosenAnswer = Array.from(
				document.getElementsByClassName('option__answer')
			).find(element => {
				return element.checked
			})

			let chosenAnswerId = null
			if (chosenAnswer && chosenAnswer.value) {
				chosenAnswerId = Number(chosenAnswer.value)
			}

			const existResult = this.userResult.find(
				item => item.questionId === activeQuestion.id
			)
			if (existResult) {
				existResult.chosenAnswerId = chosenAnswerId
			} else {
				this.userResult.push({
					questionId: activeQuestion.id,
					chosenAnswerId: chosenAnswerId,
				})
			}

			if (action === 'next' || action === 'pass') {
				this.currentQuestionIndex++
			} else {
				this.currentQuestionIndex--
			}

			if (this.currentQuestionIndex > this.quiz.questions.length) {
				this.complete()
				return
			}

			Array.from(this.progressBarElement.children).forEach((item, index) => {
				const currentItemIndex = index + 1
				item.classList.remove('progress-bar__item--complete')
				item.classList.remove('progress-bar__item--active')

				if (this.currentQuestionIndex === currentItemIndex) {
					item.classList.add('progress-bar__item--active')
				} else if (currentItemIndex < this.currentQuestionIndex) {
					item.classList.add('progress-bar__item--complete')
				}
			})

			this.showQuestion()
		},
		complete() {
			const url = new URL(location.href)
			const id = url.searchParams.get('id')
			const name = url.searchParams.get('name')
			const lastName = url.searchParams.get('lastName')
			const email = url.searchParams.get('email')

			const xhr = new XMLHttpRequest()
			xhr.open('POST', 'https://testologia.ru/pass-quiz?id=' + id, false)
			xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
			xhr.send(
				JSON.stringify({
					name: name,
					lastName: lastName,
					email: email,
					results: this.userResult,
				})
			)

			if (xhr.status === 200 && xhr.responseText) {
				let result = null
				try {
					result = JSON.parse(xhr.responseText)
				} catch (error) {
					location.href = 'index.html'
				}

				if (result) {
					location.href =
						'result.html?' +
						url.searchParams +
						'&userResult=' +
						JSON.stringify(this.userResult) +
						'&score=' +
						result.score +
						'&total=' +
						result.total
				}
			} else {
				location.href = 'index.html'
			}
		},
	}

	Test.init()
})()
