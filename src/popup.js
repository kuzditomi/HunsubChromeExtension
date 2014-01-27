var blockedUsers;
document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.sync.get('blockQuotes', function(data){
		if(!data || !data.blockQuotes)
			var blockQuotes = false;
		else
			var blockQuotes = data.blockQuotes;
			
		var cbBlockQuotes = document.getElementById('blockQuotes');
		cbBlockQuotes.checked = blockQuotes;
		cbBlockQuotes.addEventListener('click',function(){
			blockQuotes = cbBlockQuotes.checked;
			chrome.storage.sync.set({'blockQuotes':blockQuotes});
		});
	});
	//alert(cbBlockQuotes.value);
  	chrome.storage.sync.get('blockedUsers', function(data){
		blockedUsers = data.blockedUsers;
		var usersdiv = document.getElementById('blockedUsers');
		for(var i in blockedUsers){
			var userDiv = document.createElement('div');
			userDiv.setAttribute('class','user');
			userDiv.setAttribute('id',blockedUsers[i]);
			
			var userNameSpan = document.createElement('span');
			userNameSpan.textContent = blockedUsers[i];
			
			var enableButton = document.createElement('input');
			enableButton.setAttribute('type','button');
			enableButton.setAttribute('class','enable');
			(function(i){
				enableButton.addEventListener('click',function() {
					var deleteDiv = document.getElementById(blockedUsers[i]);
					delete blockedUsers[i];
					chrome.storage.sync.set({'blockedUsers': blockedUsers},function(){
						deleteDiv.parentNode.removeChild(deleteDiv);
					});
				});
			})(i);
			enableButton.setAttribute('value',"unblock");

			userDiv.appendChild(userNameSpan);
			userDiv.appendChild(enableButton);
			usersdiv.appendChild(userDiv);
		}
	});	
});