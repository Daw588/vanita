const InjectCheckbox = document.getElementById("inject-checkbox");

chrome.storage.sync.get(["injectionEnabled"], data => {
	InjectCheckbox.checked = data.injectionEnabled
});

InjectCheckbox.addEventListener("change", () => {
	chrome.storage.sync.set({injectionEnabled: InjectCheckbox.checked});
});