const siteOrigin = "https://aura-ecommerce15.vercel.app";

function updateMeta(selector, attributes, content) {
    let element = document.head.querySelector(selector);
    const isNew = !element;

    if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        document.head.appendChild(element);
    }

    const previousContent = element.getAttribute("content");
    element.setAttribute("content", content);

    return () => {
        if (isNew) {
            element.remove();
        } else if (previousContent === null) {
            element.removeAttribute("content");
        } else {
            element.setAttribute("content", previousContent);
        }
    };
}

function updateCanonical(url) {
    let element = document.head.querySelector('link[rel="canonical"]');
    const isNew = !element;

    if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
    }

    const previousHref = element.getAttribute("href");
    element.setAttribute("href", url);

    return () => {
        if (isNew) {
            element.remove();
        } else if (previousHref === null) {
            element.removeAttribute("href");
        } else {
            element.setAttribute("href", previousHref);
        }
    };
}

export function setPageMetadata({ title, description, keywords = [], canonicalPath, image, type = "website" }) {
    const previousTitle = document.title;
    document.title = title;

    const canonicalUrl = new URL(canonicalPath || window.location.pathname, siteOrigin).href;
    const restore = [
        updateMeta('meta[name="description"]', { name: "description" }, description),
        updateMeta('meta[name="keywords"]', { name: "keywords" }, keywords.join(", ")),
        updateMeta('meta[property="og:title"]', { property: "og:title" }, title),
        updateMeta('meta[property="og:description"]', { property: "og:description" }, description),
        updateMeta('meta[property="og:type"]', { property: "og:type" }, type),
        updateMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl),
        updateMeta('meta[property="og:image"]', { property: "og:image" }, image ? new URL(image, siteOrigin).href : ""),
        updateMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image"),
        updateMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title),
        updateMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description),
        updateMeta('meta[name="twitter:image"]', { name: "twitter:image" }, image ? new URL(image, siteOrigin).href : ""),
        updateCanonical(canonicalUrl)
    ];

    return () => {
        restore.reverse().forEach(restoreTag => restoreTag());
        document.title = previousTitle;
    };
}
