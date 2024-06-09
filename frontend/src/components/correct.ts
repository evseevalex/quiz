'use strict'

import config from '../../config/config'
import { Auth } from '../services/auth'
import { CustomHttp } from '../services/custom-http'
import {QuizAnswerType, QuizCorrectType, QuizQuestionType, QuizType} from "../types/quiz.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Correct {
	private quiz: QuizType | null
	readonly userInfo: UserInfoType | null
	readonly correctQuestionsElement: HTMLElement | null
	readonly correctBackButtonElement: HTMLElement | null

	private readonly testId: string | null

	constructor() {
		this.quiz = null
		this.userInfo = Auth.getUserInfo()
		this.correctQuestionsElement = null
		this.correctBackButtonElement = null

		this.testId = sessionStorage.getItem('testId')

		this.correctBackButtonElement = document.getElementById('back')
		if (this.correctBackButtonElement)
			this.correctBackButtonElement.onclick = function () {
				location.href = '#/result'
			}
		this.correctQuestionsElement = document.getElementById('correct-questions')

			this.init()
	}

	private async init(): Promise<void> {
		if (this.testId && this.userInfo) {
			try {
				const result: DefaultResponseType | QuizCorrectType = await CustomHttp.request(
					`${config.host}/tests/${this.testId}/result/details?userId=${this.userInfo.userId}`
				)

				if (result) {
					if ((result as DefaultResponseType).error) {
						throw new Error((result as DefaultResponseType).message)
					}
					this.quiz = (result as QuizCorrectType).test
					this.renderPage()
				}
			} catch (error) {
				return console.log(error)
			}
		}
	}

	private renderPage(): void {
		if(!this.quiz) return
		const nameQuizElement: HTMLElement | null = document.getElementById('name-quiz')
		const infoElement: HTMLElement | null = document.getElementById('info')
		if(nameQuizElement) {
			nameQuizElement.innerText = this.quiz.name
		}

		if(infoElement && this.userInfo)
			infoElement.innerText =
				this.userInfo.fullName + ', ' + this.userInfo.email

		this.quiz.questions.forEach((item:QuizQuestionType, index:number):void => {
			const correctQuestionElement: HTMLElement = document.createElement('div')
			correctQuestionElement.className = 'correct__question'

			const questionTitle: HTMLElement = document.createElement('div')
			questionTitle.className = 'correct__question-title'
			questionTitle.innerHTML =
				'<span>Вопрос ' + (index + 1) + ':</span> ' + item.question

			const questionOptions: HTMLElement = document.createElement('div')
			questionOptions.className = 'correct__question-options'

			item.answers.forEach((answer: QuizAnswerType): void => {
				const questionOption: HTMLElement = document.createElement('div')
				questionOption.className = 'correct__question-option'

				const inputId: string = 'answer-' + answer.id
				const answerInputElement: HTMLElement = document.createElement('input')
				answerInputElement.className = 'option-answer'
				if (answer.hasOwnProperty('correct')) {
					if (answer.correct) {
						answerInputElement.classList.add('option--right')
					} else {
						answerInputElement.classList.add('option--wrong')
					}
				}
				answerInputElement.setAttribute('type', 'radio')
				answerInputElement.setAttribute('name', 'answer-' + item.id)
				answerInputElement.setAttribute('id', inputId)
				answerInputElement.setAttribute('value', answer.id.toString())
				answerInputElement.setAttribute('disabled', 'disabled')

				const answerLabelElement: HTMLElement = document.createElement('label')
				answerLabelElement.setAttribute('for', inputId)
				answerLabelElement.innerText = answer.answer

				questionOption.appendChild(answerInputElement)
				questionOption.appendChild(answerLabelElement)

				questionOptions.appendChild(questionOption)

				correctQuestionElement.appendChild(questionTitle)
				correctQuestionElement.appendChild(questionOptions)

				if (this.correctQuestionsElement)
					this.correctQuestionsElement.appendChild(correctQuestionElement)
			})
		})
	}
}
