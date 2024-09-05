function testInterpretGooglePage(){//attempt to fetch google.com as html, then passes it to parseHtml in link-and-page-patcher.js
    request= fetch("https://google.com");
    request.text().resolve((value) => {alert(toString(value))});
};
export {testInterpretGooglePage};