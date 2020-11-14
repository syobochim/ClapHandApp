const EVENT_URL = new URL(window.location).searchParams.get("eventURL")
document.getElementById('url').textContent = EVENT_URL
document.getElementById('qrcode').src = "https://chart.apis.google.com/chart?chs=150x150&cht=qr&chl=" + EVENT_URL