function updatePaperNumbers() {
    const p_items = document.querySelectorAll('.paper');
    const p_itemCount = p_items.length;
    p_items.forEach((item, index) => {
        let reverseNumber = p_itemCount - index;
        item.innerHTML = item.innerHTML.replace(/<strong>\[\d+\]<\/strong>\s*/, '');
        item.innerHTML = `<strong>[${reverseNumber}]</strong> ` + item.innerHTML;
    });
}

function sortPapers(criteria) {
    let paperList = document.getElementById("paperList");
    let papers = Array.from(paperList.children);

    if (criteria === 'author') {
        setActiveSort('sortByAuthor');
        papers.sort((a, b) => {
            let firstAuthorA = a.getAttribute("data-first-author") === 'true' ? 1 : 0;
            let firstAuthorB = b.getAttribute("data-first-author") === 'true' ? 1 : 0;

            if (firstAuthorB - firstAuthorA !== 0) {
                return firstAuthorB - firstAuthorA;
            }

            if (b.hasAttribute("data-first-coauthor")) {
                if (!a.hasAttribute("data-first-coauthor")) {
                    return -a.getAttribute("data-year");
                }
            }
            
            return b.getAttribute("data-year") - a.getAttribute("data-year");
        });
    } else if (criteria === 'year') {
        setActiveSort('sortByYear');
        papers.sort((a, b) => {
            return b.getAttribute("data-year") - a.getAttribute("data-year");
        });
    }

    paperList.innerHTML = "";
    papers.forEach(paper => paperList.appendChild(paper));

    updatePaperNumbers();
}

function setActiveSort(activeId) {
    document.querySelectorAll('.sort-link').forEach(link => link.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

setActiveSort('sortByYear');
updatePaperNumbers();