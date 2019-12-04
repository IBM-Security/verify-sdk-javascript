$( document ).ready(function() {
	const getUserInfo = () => {
		$.ajax({
				type: 'GET',
				url: 'http://localhost:3000/api/userinfo',
				success: function(result) {
					var data = result.response;
					displayName(data.name);
					$('#user-info').html(JSON.stringify(data, null, 4)).toggleClass('invisible visible');
				},
				error: function(error) {
					console.log('ERROR_STATUS', error.status);
					console.log('ERROR_RESPONSE', error);
				}
		});
	};

	const displayName = (name) => {
		$('#name').append(JSON.parse(JSON.stringify(name))).toggleClass('invisible visible');
	};

	getUserInfo();
});
