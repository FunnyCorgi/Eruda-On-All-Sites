// Load a page through the AllOrigins proxy and inject it into the iframe
async function loadPage(url) {
    try {
        // Fetch the page content through AllOrigins
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(allOriginsUrl);
        const data = await response.json();
        const iframe = document.getElementById('contentFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;


        // Inject Eruda into the iframe for debugging
        const erudaScript = iframeDoc.createElement('script');
        erudaScript.src = 'https://cdn.jsdelivr.net/npm/eruda';
        erudaScript.onload = () => {
            iframeDoc.defaultView.eruda.init();
        };
        iframeDoc.head.appendChild(erudaScript);

        // Intercept all network requests and modify <a> link behavior before the page is written
        const customScript = `
            (function() {
                const allOriginsUrl = 'https://api.allorigins.win/get?url=';

                // Save original functions
                const originalFetch = window.fetch;
                const originalXhrOpen = XMLHttpRequest.prototype.open;

                // Intercept fetch requests
                window.fetch = async function(url, ...args) {
                    console.log('Intercepted fetch request:', url);
                    if (url.startsWith('http')) {
                        url = allOriginsUrl + encodeURIComponent(url);
                    }
                    const response = await originalFetch(url, ...args);
                    return response;
                };

                // Intercept XMLHttpRequest requests
                XMLHttpRequest.prototype.open = function(method, url, ...args) {
                    console.log('Intercepted XMLHttpRequest:', method, url);
                    if (url.startsWith('http')) {
                        url = allOriginsUrl + encodeURIComponent(url);
                    }
                    this.addEventListener('load', function() {
                        console.log('XHR Response:', this.responseText);
                    });
                    originalXhrOpen.call(this, method, url, ...args);
                };

                // Intercept and rewrite <img>, <script>, <link> elements
                function interceptResourceTags() {
                    document.querySelectorAll('img, script, link').forEach(el => {
                        if (el.tagName.toLowerCase() === 'img' && el.src.startsWith('http')) {
                            el.src = allOriginsUrl + encodeURIComponent(el.src);
                        } else if (el.tagName.toLowerCase() === 'script' && el.src.startsWith('http')) {
                            el.src = allOriginsUrl + encodeURIComponent(el.src);
                        } else if (el.tagName.toLowerCase() === 'link' && el.href.startsWith('http')) {
                            el.href = allOriginsUrl + encodeURIComponent(el.href);
                        }
                    });
                }

                // Intercept <a> link behavior to load new pages into the iframe
                function interceptLinks() {
                    document.querySelectorAll('a').forEach(el => {
                        if (el.href && el.href.startsWith('http')) {
                            const originalHref = el.href;
                            el.removeAttribute('href');
                            el.setAttribute('onclick', 'parent.handleLinkClick("' + originalHref + '")');
                        }
                    });
                }

                // Run both resource and link interception after the document is loaded
                window.onload = function() {
                    interceptResourceTags();
                    interceptLinks();
                };
            })();
        `;

        // Inject the interception script before writing the fetched HTML content
        iframeDoc.open();
        const scriptTag = iframeDoc.createElement('script');
        scriptTag.textContent = customScript;
        iframeDoc.head.append(scriptTag);

        // Write the fetched HTML content into the iframe
        iframeDoc.write(data.contents);
        iframeDoc.close();
    } catch (error) {
        console.error('There was a problem with the fetch operation: ' + error.message);
    }
}

// Function to handle link clicks and reload the iframe with the new URL
function handleLinkClick(newUrl) {
    loadPage(newUrl); // Reload the iframe with the new page via proxy
}

// Function to start the page loading process with Google's homepage as the default
function testInterpretGooglePage() {
    loadPage("https://google.com");
}

export { testInterpretGooglePage, loadPage, handleLinkClick };
