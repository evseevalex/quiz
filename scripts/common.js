function checkUserData() {
	const data = JSON.parse(sessionStorage.getItem('formData'))
	const name = data[0].value
	const lastName = data[1].value
	const email = data[2].value

	if (!name || !lastName || !email) {
		location.href = 'index.html'
	}
}
