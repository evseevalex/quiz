'use strict'

import config from '../../config/config'
import { Auth } from '../services/auth'
import { CustomHttp } from '../services/custom-http'
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Result {
	private correctAnswerElement: HTMLElement | null
	constructor() {
		this.correctAnswerElement = document.getElementById('correct-answers')
		if (this.correctAnswerElement) {
			this.correctAnswerElement.onclick = function (): void {
				location.href = '#/correct'
			}
		}


		this.init()
	}

	private async init(): Promise<void> {
		const userInfo: UserInfoType | null = Auth.getUserInfo()
		const testId: string | null = sessionStorage.getItem('testId')
		if (!userInfo) {
			location.href = '#/'
			return
		}

		if (testId) {
			try {
				const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(
					config.host + '/tests/' + testId + '/result?userId=' + userInfo.userId
				)
				if (result) {
					if ((result as DefaultResponseType).error) {
						throw new Error((result as DefaultResponseType).message)
					}
					let resultElement: HTMLElement | null = document.getElementById('result-score')
					if (resultElement) {
						resultElement.innerText =
							(result as PassTestResponseType).score + '/' + (result as PassTestResponseType).total
					}
					return
				}
			} catch (error) {
				console.log(error)
			}
		}
		location.href = '#/'
	}
}
