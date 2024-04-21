;(function () {
	'use strict'

	const Result = {
		init() {
			const url = new URL(location.href)
			document.getElementById('result-score').innerText =
				url.searchParams.get('score') + '/' + url.searchParams.get('total')

			document.getElementById('correct-answers').onclick = function () {
				location.href = 'correct.html?' + url.searchParams
			}
		},
	}

	Result.init()
})()
