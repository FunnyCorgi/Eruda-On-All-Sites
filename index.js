async function loadPage(url) {
    try {
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(allOriginsUrl);
        const data = await response.json();
        const iframe = document.getElementById('contentFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Write the HTML content from the response
        iframeDoc.open();
        iframeDoc.write(data.contents);
        iframeDoc.close();

        // Ensure the iframe is fully loaded before injecting Eruda
        iframeDoc.addEventListener('DOMContentLoaded', () => {
            // Inject Eruda script
            const erudaScript = iframeDoc.createElement('script');
            erudaScript.src = 'https://cdn.jsdelivr.net/npm/eruda';
            erudaScript.onload = () => {
                iframeDoc.defaultView.eruda.init();

                // Apply fetch/XHR interception after Eruda initialization
                const interceptionScript = `
                    (function() {
                        const allOriginsUrl = 'https://api.allorigins.win/get?url=';
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
                            originalXhrOpen.call(this, method, url, ...args);
                        };

                        // Intercept and rewrite resource tags
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

                        // Intercept <a> links
                        function interceptLinks() {
                            document.querySelectorAll('a').forEach(el => {
                                if (el.href && el.href.startsWith('http')) {
                                    const originalHref = el.href;
                                    el.removeAttribute('href');
                                    el.setAttribute('onclick', 'parent.handleLinkClick("' + originalHref + '")');
                                }
                            });
                        }

                        // Apply resource and link interception after page load
                        window.onload = function() {
                            interceptResourceTags();
                            interceptLinks();
                        };
                    })();
                `;

                // Inject the interception script
                const scriptTag = iframeDoc.createElement('script');
                scriptTag.textContent = interceptionScript;
                iframeDoc.head.appendChild(scriptTag);
            };
            iframeDoc.head.appendChild(erudaScript);
        });

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
