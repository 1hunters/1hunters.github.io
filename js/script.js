let globalRankingState = ''
let paperStates = []

function updatePaperNumbers() {
    const pItems = document.querySelectorAll('.paper');
    const pItemCount = pItems.length;
    pItems.forEach((item, index) => {
        let reverseNumber = pItemCount - index;
        item.innerHTML = item.innerHTML.replace(/<strong>\[\d+\]<\/strong>\s*/, '');
        item.innerHTML = `<strong>[${reverseNumber}]</strong> ` + item.innerHTML;
    });
}

function saveOriginalStates() {
    let paperList = document.getElementById("paperList");
    paperStates = Array.from(paperList.children);
}

function sortPapers(criteria) {
    let papers = Array.from(paperStates);

    if (criteria === 'author') {
        if (globalRankingState === 'sortByAuthor') {
            return 0;
        }

        setActiveSort('sortByAuthor');
        papers.sort((a, b) => {
            let paperA = -a.getAttribute("paper-weighting");
            let paperB = -b.getAttribute("paper-weighting");

            if (paperB - paperA !== 0) {
                return paperB - paperA;
            }

            // if (b.hasAttribute("data-first-coauthor")) {
            //     if (!a.hasAttribute("data-first-coauthor")) {
            //         return -a.getAttribute("data-year");
            //     }
            // }
            
            return b.getAttribute("data-year") - a.getAttribute("data-year");
        });
    } else if (criteria === 'year') {
        if (globalRankingState === 'sortByYear') {
            return 0;
        }
        
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
    globalRankingState = activeId;
    document.querySelectorAll('.sort-link').forEach(link => link.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

setActiveSort('sortByYear');
saveOriginalStates();
updatePaperNumbers();