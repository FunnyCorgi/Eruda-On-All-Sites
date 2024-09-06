async function testInterpretGooglePage() {
    try {
        // Example of a CORS-friendly request (placeholder API)
        const response = await fetch("https://google.com");
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Get the response JSON
        const data = response.body;
        
        // Alert or handle the response data
        alert(JSON.stringify(data));
    } catch (error) {
        alert('There was a problem with the fetch operation:', error);
    }
}

export { testInterpretGooglePage };
