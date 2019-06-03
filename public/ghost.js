//speech recognition
	window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

	var Omega = new SpeechSynthesisUtterance();
	
	const recognition = new SpeechRecognition();

	recognition.interimResults = true;

	let listening = false;

	let p = document.createElement('p');
	const words = document.querySelector('.words'); 
	words.appendChild(p)

	let newp = document.createElement('p');
	const listeningp = document.querySelector('.listening'); 
	listeningp.appendChild(newp)
	listeningp.textContent = 'not listening'

	// let g = document.createElement('h2')
	// const ghostResponse = document.querySelector('.ghost');
	// ghostResponse.appendChild(g)
	var siriWave = new SiriWave({
		container: document.getElementById('siri-container'),
		style: "ios9",
		autostart: true, 
		width: 640,
		height: 200,
		amplitude:0.1,
		speed: .1
	});

	recognition.addEventListener('result', e => {
		let transcript = Array.from(e.results)
			.map(result => result[0])
			.map(result => result.transcript)
			.join('')
			transcript = transcript.toLowerCase();
			console.log(e.results)
			if(transcript === 'omega') {
				if(e.results[0].isFinal){
					response('yes, what do you need', 1.5)
				 listening = true;
				}
			}

			if(listening === true || transcript.includes('omega')) {
				listeningp.textContent = 'listening'

				if(transcript.includes('simon says')){
					if(e.results[0].isFinal){
						let text = transcript.split('says');
						response(text[1], 1.0)
						listeningp.textContent = 'not listening'
						listening = false
						transcript = ''
					}
				}

				if(transcript.includes('turn on the')){
					if(e.results[0].isFinal){
						$.get(`https://discovery.meethue.com/`, (data) => {
							let ip = data[0].internalipaddress;
							let url = `http://${ip}/api/pf3enyrZJz4uvwgYf90t9E2FzLM4tW2GeGSnO-ut/lights` 
							$.get(url, done => {
								let lightname = transcript.split("on the")
								lightname = lightname[1]
								let array = []
								
								for(let i = 1; i <= Object.keys(done).length; i++){
									array.push(done[i].name)
								}
								array.forEach((light, index)=> {
									if(lightname.trim() === light.toLowerCase()){
										let data = {on: true}
										$.ajax({
											url: `${url}/${index + 1}/state`,
											type: 'PUT',
											data: JSON.stringify(data), 
											success: function() {
												response('yes, doing that now', 1.0)
												
											}
									 });
									}
								})
							
							})
						})
					}
				}
				
				if(transcript.includes('is the date') || transcript.includes(`what's the date`)){
					if(e.results[0].isFinal){
						var today = new Date();
						var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
						response(`let's see, the date is... ${date}`, 1.0)
						listening = false
						listeningp.textContent = 'not listening'
						transcript = ''
					}
				}
				
				if(transcript.includes('time is it') || transcript.includes('is the time')){
					if(e.results[0].isFinal){
						var today = new Date();
						var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
						var hours = today.getHours();
						var min = today.getMinutes().toString().split('');
						if(min[0] === '0'){
							min = `o ${min[1]}`
						} else {
							min = min.join('')
						}
						listeningp.textContent = 'not listening'
						listening = false
						response(`let's see, the time is... ${hours} ${min}`, 1.0)
					}
				}
			}
			
			if(transcript.includes('stop')){
				if(e.results[0].isFinal){
					speechSynthesis.cancel()
					listening = false
					console.log(`not listening `);
					listeningp.textContent = 'not listening'
				}
			}
		p.textContent = transcript
	})
	
	const response = (text, rate,) => {
		console.log(`Speaking... ${text}`);
			siriWave.amplitude = 2
			siriWave.speed = .4

		Omega.text = text;
		Omega.lang = 'en-US';
		Omega.rate = rate;
		Omega.onend = function(event) {
			siriWave.amplitude = 0.1
			siriWave.speed = .1
			speechSynthesis.cancel() 
		}
		
		speechSynthesis.speak(Omega);

		return text
	}


	recognition.addEventListener('end', recognition.start)
	recognition.start();
