// Saves the options to the local storage
function save_options() {
	var id = document.getElementById('appId').value;

	chrome.storage.sync.set({
		injectedChromecastId: id
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restore the options when the page is loaded, with a default
// ID of a blank value
function restore_options() {
	chrome.storage.sync.get({
		injectedChromecastId: ''
	}, function(items) {
		document.getElementById('appId').value = items.injectedChromecastId;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);