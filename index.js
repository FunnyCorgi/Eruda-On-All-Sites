async function testInterpretGooglePage() {
    try {
        const response = await fetch("https://api.allorigins.win/get?url=https://google.com");
        const data = await response.json();
        const iframe = document.getElementById('contentFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write(data.contents); // Write the fetched HTML content into the iframe
        iframeDoc.close();

        // Inject Eruda script
        const script = iframeDoc.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/eruda';
        script.onload = () => {
            iframeDoc.defaultView.eruda.init();
        };
        iframeDoc.head.appendChild(script);
    } catch (error) {
        alert('There was a problem with the fetch operation: ' + error.message);
    }
}

export { testInterpretGooglePage };
