;(function () {
	'use strict'

	const Result = {
		init() {
			document.getElementById('result-score').innerText =
				sessionStorage.getItem('score') + '/' + sessionStorage.getItem('total')

			document.getElementById('correct-answers').onclick = function () {
				location.href = 'correct.html'
			}
		},
	}

	Result.init()
})()
