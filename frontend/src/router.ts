import { Choice } from './components/choice'
import { Correct } from './components/correct'
import { Form } from './components/form'
import { Result } from './components/result'
import { Test } from './components/test'
import { Auth } from './services/auth'
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";

export class Router {
	readonly contentElement: HTMLElement | null;
	readonly stylesElement: HTMLElement | null;
	readonly pageTitleElement: HTMLElement | null;
	readonly profileElement: HTMLElement | null;
	readonly profileFullNameElement: HTMLElement | null;
	readonly routes: RouteType[];
	constructor() {
		this.contentElement = document.getElementById('content')
		this.stylesElement = document.getElementById('styles')
		this.pageTitleElement = document.getElementById('page-title')
		this.profileElement = document.getElementById('profile')
		this.profileFullNameElement = document.getElementById('profile-full-name')

		this.routes = [
			{
				route: '#/',
				title: 'Главная страница',
				template: 'templates/index.html',
				styles: '/css/style.min.css',
				load: () => {},
			},
			{
				route: '#/signup',
				title: 'Регистрация',
				template: 'templates/signup.html',
				styles: '/css/style.min.css',
				load: () => {
					new Form('signup')
				},
			},
			{
				route: '#/login',
				title: 'Вход в систему',
				template: 'templates/login.html',
				styles: '/css/style.min.css',
				load: () => {
					new Form('login')
				},
			},
			{
				route: '#/choice',
				title: 'Выбор теста',
				template: 'templates/choice.html',
				styles: '/css/style.min.css',
				load: () => {
					new Choice()
				},
			},
			{
				route: '#/test',
				title: 'Тест',
				template: 'templates/test.html',
				styles: '/css/style.min.css',
				load: () => {
					new Test()
				},
			},
			{
				route: '#/result',
				title: 'Результаты',
				template: 'templates/result.html',
				styles: '/css/style.min.css',
				load: () => {
					new Result()
				},
			},
			{
				route: '#/correct',
				title: 'Правильные ответы',
				template: 'templates/correct.html',
				styles: '/css/style.min.css',
				load: () => {
					new Correct()
				},
			},
		]
	}

	public async openRoute(): Promise<void> {
		const urlRoute: string = window.location.hash.split('?')[0]

		if (urlRoute === '#/logout') {
			const isLogout: boolean = await Auth.logout()
			if(isLogout) {
				window.location.href = '#/'
				return
			}else {
				//code
			}
		}

		const newRoute: RouteType | undefined = this.routes.find(item => {
			return item.route === urlRoute
		})

		if (!newRoute) {
			window.location.href = '#/'
			return
		}

		if(!this.contentElement || !this.stylesElement || !this.pageTitleElement || !this.profileElement || !this.profileFullNameElement) {
			if(urlRoute === '#/') {
				return
			}else {
				window.location.href = '#/'
				return
			}

		}

		this.contentElement.innerHTML = await fetch(newRoute.template).then(
			response => response.text()
		)

		this.stylesElement.setAttribute('href', newRoute.styles)
		this.pageTitleElement.innerText = newRoute.title

		const userInfo: UserInfoType | null = Auth.getUserInfo()
		const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey)
		if (userInfo && accessToken) {
			this.profileElement.style.display = 'flex'
			this.profileFullNameElement.innerText = userInfo.fullName
		} else {
			this.profileElement.style.display = 'none'
		}

		newRoute.load()
	}
}
