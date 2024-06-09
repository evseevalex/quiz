'use strict'

import {CustomHttp} from '../services/custom-http'
import config from '../../config/config'
import {Auth} from '../services/auth'
import {QuizAnswerType, QuizQuestionType, QuizType} from "../types/quiz.type";
import {UserResultType} from "../types/user-result.type";
import {DefaultResponseType} from "../types/default-response.type";
import {ActionTestType} from "../types/action-test.type";
import {UserInfoType} from "../types/user-info.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Test {
	private passArrowElement: HTMLElement | null
	private currentQuestionIndex: number
	private questionTitleElement: HTMLElement | null
	private optionsElement: HTMLElement | null
	private nextButtonElement: HTMLElement | null
	private prevButtonElement: HTMLElement | null
	private passButtonElement: HTMLElement | null
	private progressBarElement: HTMLElement | null
	readonly userResult: UserResultType[]
	private quiz: QuizType | null
	private readonly testId: string | null
	private interval: number = 0

	constructor() {
		this.quiz = null
		this.currentQuestionIndex = 1
		this.questionTitleElement = null
		this.optionsElement = null
		this.nextButtonElement = null
		this.prevButtonElement = null
		this.passButtonElement = null
		this.progressBarElement = null
		this.userResult = []
		this.passArrowElement = null
		this.testId = sessionStorage.getItem('testId')

		this.init()
	}

	private async init(): Promise<void> {
		if (this.testId) {
			try {
				const result: DefaultResponseType | QuizType = await CustomHttp.request(
					config.host + '/tests/' + this.testId
				)

				if (result) {
					if ((result as DefaultResponseType).error) {
						throw new Error((result as DefaultResponseType).message)
					}
					this.quiz = result as QuizType
					this.startQuiz()
				}
			} catch (error) {
				console.log(error)
			}
		}
	}

	private startQuiz(): void {
		if (!this.quiz) return;
		let preTitleElement: HTMLElement | null = document.getElementById('pre-title')
		if (preTitleElement) {
			preTitleElement.innerText = this.quiz.name
		}

		this.progressBarElement = document.getElementById('progress-bar')
		this.questionTitleElement = document.getElementById('title')
		this.optionsElement = document.getElementById('options')
		this.nextButtonElement = document.getElementById('next')
		if (this.nextButtonElement)
			this.nextButtonElement.onclick = this.move.bind(this, ActionTestType.next)
		this.prevButtonElement = document.getElementById('prev')
		if (this.prevButtonElement)
			this.prevButtonElement.onclick = this.move.bind(this, ActionTestType.prev)
		this.passButtonElement = document.getElementById('pass')
		if (this.passButtonElement)
			this.passButtonElement.onclick = this.move.bind(this, ActionTestType.pass)

		this.passArrowElement = document.getElementById('pass-img')

		this.prepareProgressBar()
		this.showQuestion()

		const timerElement = document.getElementById('timer')
		let second = 59
		const that: Test = this
		this.interval = window.setInterval(
			function () {
				second--
				if(timerElement) {
					timerElement.innerText = second.toString()
				}

				if (second === 0) {
					clearInterval(that.interval)
					that.complete()
				}
			}.bind(this),
			1000
		)
	}

	private prepareProgressBar(): void {
		if (!this.quiz) return
		for (let i = 0; i < this.quiz.questions.length; i++) {
			const itemElement: HTMLElement | null = document.createElement('div')
			itemElement.className =
				'progress-bar__item ' + (i === 0 ? 'progress-bar__item--active' : '')

			const itemCircleElement: HTMLElement | null = document.createElement('div')
			itemCircleElement.className = 'progress-bar__item-circle'

			const itemTextElement: HTMLElement | null = document.createElement('div')
			itemTextElement.className = 'progress-bar__item-text'
			itemTextElement.innerText = 'Вопрос ' + (i + 1)

			itemElement.appendChild(itemCircleElement)
			itemElement.appendChild(itemTextElement)

			if(this.progressBarElement)
				this.progressBarElement.appendChild(itemElement)
		}
	}
	private showQuestion(): void {
		if (!this.quiz) return
		const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1]
		if(this.questionTitleElement)
			this.questionTitleElement.innerHTML =
				'<span>Вопрос ' +
				this.currentQuestionIndex +
				':</span> ' +
				activeQuestion.question

		if(this.optionsElement)
			this.optionsElement.innerHTML = ''
		const that: Test = this
		const chosenOption: UserResultType | undefined = this.userResult.find(
			(item: UserResultType) => item.questionId === activeQuestion.id
		)
		activeQuestion.answers.forEach((answer: QuizAnswerType) => {
			const optionElement: HTMLElement = document.createElement('div')
			optionElement.className = 'test__question-option'

			const inputId: string = 'answer-' + answer.id
			const answerInputElement: HTMLElement = document.createElement('input')
			answerInputElement.className = 'option__answer'
			answerInputElement.setAttribute('type', 'radio')
			answerInputElement.setAttribute('name', 'answer')
			answerInputElement.setAttribute('id', inputId)
			answerInputElement.setAttribute('value', answer.id.toString())
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

			if(this.optionsElement)
				this.optionsElement.appendChild(optionElement)
		})

		if(this.nextButtonElement && this.passButtonElement && this.passArrowElement) {
			if (chosenOption && chosenOption.chosenAnswerId) {
				this.nextButtonElement.removeAttribute('disabled')
				this.passButtonElement.classList.add('disabled')
				this.passArrowElement.setAttribute('src', 'images/small-arrow-gray.png')
			} else {
				this.nextButtonElement.setAttribute('disabled', 'disabled')
				this.passButtonElement.classList.remove('disabled')
				this.passArrowElement.setAttribute('src', 'images/small-arrow.png')
			}
			if (this.currentQuestionIndex === this.quiz.questions.length) {
				this.nextButtonElement.innerText = 'Завершить'
			} else {
				this.nextButtonElement.innerText = 'Далее'
			}
		}

		if(this.prevButtonElement) {
			if (this.currentQuestionIndex > 1) {
				this.prevButtonElement.removeAttribute('disabled')
			} else {
				this.prevButtonElement.setAttribute('disabled', 'disabled')
			}
		}
	}

	private chooseAnswer(): void {
		if(this.nextButtonElement && this.passButtonElement && this.passArrowElement) {
			this.nextButtonElement.removeAttribute('disabled')
			this.passButtonElement.classList.add('disabled')
			this.passArrowElement.setAttribute('src', 'images/small-arrow-gray.png')
		}
	}

	private move(action: ActionTestType): void {
		if(!this.quiz) return
		const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1]
		const chosenAnswer: HTMLInputElement | undefined = Array.from(
			document.getElementsByClassName('option__answer')
		).find(element => {
			return (element as HTMLInputElement).checked
		}) as HTMLInputElement

		let chosenAnswerId: number | null = null
		if (chosenAnswer && chosenAnswer.value) {
			chosenAnswerId = Number(chosenAnswer.value)
		}

		const existResult: UserResultType | undefined = this.userResult.find(
			(item: UserResultType) => item.questionId === activeQuestion.id
		)

		if(chosenAnswerId) {
			if (existResult) {
				existResult.chosenAnswerId = chosenAnswerId
			} else {
				this.userResult.push({
					questionId: activeQuestion.id,
					chosenAnswerId: chosenAnswerId,
				})
			}
		}

		if (action === ActionTestType.next || action === ActionTestType.pass) {
			this.currentQuestionIndex++
		} else {
			this.currentQuestionIndex--
		}

		if (this.currentQuestionIndex > this.quiz.questions.length) {
			clearInterval(this.interval)
			this.complete()
			return
		}

		if (this.progressBarElement) {
			Array.from(this.progressBarElement.children).forEach((item: Element, index: number): void => {
				const currentItemIndex: number = index + 1
				item.classList.remove('progress-bar__item--complete')
				item.classList.remove('progress-bar__item--active')

				if (this.currentQuestionIndex === currentItemIndex) {
					item.classList.add('progress-bar__item--active')
				} else if (currentItemIndex < this.currentQuestionIndex) {
					item.classList.add('progress-bar__item--complete')
				}
			})
		}

		this.showQuestion()
	}
	private async complete(): Promise<void> {
		const userInfo: UserInfoType | null = Auth.getUserInfo()
		if (!userInfo) {
			location.href = '#/'
			return
		}
		try {
			const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(
				config.host + '/tests/' + this.testId + '/pass',
				'POST',
				{
					userId: userInfo.userId,
					results: this.userResult,
				}
			)
			if (result) {
				if ((result as DefaultResponseType).error) {
					throw new Error((result as DefaultResponseType).message)
				}
				location.href = '#/result'
			}
		} catch (error) {
			console.log(error)
		}
	}
}
