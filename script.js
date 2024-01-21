let perpage = 10;
let paginationLinks;
let userid;
let totalPages;
let prevButton;
let nextButton;
let selectedpageNo;

const perPageDropdown = document.getElementById('perPage');

// Add options for 10, 20, 30, ..., 100

for (let i = 10; i <= 100; i += 10) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    perPageDropdown.appendChild(option);
}
perPageDropdown.addEventListener('change', (event) => {
    perpage = event.target.value; // Store selected value in perpage variable
    console.log(`Per page changed: ${perpage} with page no ${selectedpageNo}`)
    fetchRepos(userid, selectedpageNo);
});

function userSearch() {
    const userInput = document.getElementById('searchInput').value.trim();
    const errorMsg = document.getElementById('searchError');
    if (userInput !== '') {
        errorMsg.textContent = '';
        console.log(`Searching for ${userInput}`);
        fetchProfile(userInput);
    }
    else {
        errorMsg.textContent = 'Please enter a valid username';
    }
}

function fetchProfile(username) {
    fetch(`http://localhost:3000/user?username=${username}`)
        .then(response => response.json())
        .then(extracteduserData => {
            displayUser(extracteduserData);
            userid = extracteduserData.id;
            fetchRepos(extracteduserData.id, 1);
        })
        .catch(error => console.error('Error: ', error));
}

function fetchRepos(userid, selectedpageNo) {
    const repoloader = document.getElementById('repoloader');
    repoloader.style.display = 'block';

    let selectedperPage = perpage || 10;
    fetch(`http://localhost:3000/repos?user=${userid}&page=${selectedpageNo}&perpage=${selectedperPage}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);

            repoloader.style.display = 'none';
            displayRepos(data.data);

            //DOM Updation
            paginationLinks = data.pagination;
            console.log(data.pagination);
            updateButtonVisibility(data.pagination);
            populatePageDropdown(data.pagination);

            // document.getElementById('prev').style.visibility = selectedpage > 1 ? 'visible' : 'hidden';
            // document.getElementById('next').style.visibility = selectedpage < data.totalPages ? 'visible' : 'hidden';
        })
        .catch(error => {
            repoloader.style.display = 'none';
            console.error('Error: ', error);
        });
}

function displayRepos(data) {
    const reposContainer = document.getElementById('reposContainer');
    reposContainer.innerHTML = ''; // Clear previous repos
    if (data) {
        data.forEach(repo => {
            const repoElement = document.createElement('div'); // Create a container for repo info

            // Create and append elements for repo name, description, and topics
            repoElement.appendChild(createTextElement('h2', repo.name));
            repoElement.appendChild(createTextElement('span', repo.desc));
            
            //grid div to hold topics
            const topicContainer = document.createElement('div');
            topicContainer.classList.add('topicContainer');
            repo.topics.forEach(topic => {
                topicContainer.appendChild(createTextElement('span', topic, 'topic')); // Add a class for styling
            });
            repoElement.appendChild(topicContainer);
            repoElement.classList.add('repo')
            // Append the repo element to the desired parent container
            reposContainer.appendChild(repoElement);
        });
    }
    else {
        const noRepo = document.createElement('div');
        noRepo.appendChild(createTextElement('h2', 'No repos to show'));
        reposContainer.appendChild(noRepo);
    }
}
function createTextElement(tagName, text, className = '') {
    const element = document.createElement(tagName);
    element.textContent = text;
    if (className) {
        element.classList.add(className);
    }
    return element;
}

function displayUser(userResponse) {
    const username = userResponse.login;
    const profileurl = userResponse.html_url;
    const profileName = userResponse.name;
    const userBio = userResponse.bio;
    const location = userResponse.location;
    const imgurl = userResponse.imgurl;

    document.getElementById('username').innerHTML = profileName;

    const linkbtn = document.getElementById('githuburl');
    linkbtn.innerHTML = profileurl;
    linkbtn.href = profileurl;
    linkbtn.rel = 'noreferrer';
    linkbtn.target = '_blank';

    document.getElementById('userImg').src = imgurl;
    document.getElementById('user-container').classList.remove('imgpulse');

    document.getElementById('bio').innerHTML = (userBio === null) ? "No bio found" : userBio;
    document.getElementById('location').innerHTML = (location === null) ? "No location set" : location;
}

function updateButtonVisibility(paginationLinks) {
    prevButton = document.getElementById('prev');
    nextButton = document.getElementById('next');

    prevButton.disabled = !paginationLinks.prev;
    nextButton.disabled = !paginationLinks.next;
}

const pageSelect = document.getElementById('pagePicker');
function populatePageDropdown(paginationLinks) {
    pageSelect.innerHTML = ''; // Clear existing options

    // if (paginationLinks.prev) {
    //     const prevOption = document.createElement('option');
    //     prevOption.value = paginationLinks.prev;
    //     prevOption.text = 'Previous';
    //     pageSelect.add(prevOption);
    // }

    if (paginationLinks.last) {
        totalPages = new URL(paginationLinks.last).searchParams.get('page');
    }
    else {
        totalPages = 0;
    }
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i; // Adjust URL structure if needed
        option.text = i;
        pageSelect.add(option);
    }

    // if (paginationLinks.next) {
    //     const nextOption = document.createElement('option');
    //     nextOption.value = paginationLinks.next;
    //     nextOption.text = 'Next';
    //     pageSelect.add(nextOption);
    // }
}
//individual elements
pageSelect.addEventListener('change', (event) => {
    selectedpageNo = event.target.value;
    console.log(`pageSelect changed: ${selectedpageNo}`);
    fetchRepos(userid, selectedpageNo);
})

document.getElementById('prev').addEventListener('click', () => {
    // if (currentPage > 1) {
    //     fetchItems(--currentPage);
    // }
    const prevPageUrl = paginationLinks.prev;
    console.log(`prev button called: ${prevPageUrl}`);
    const page = new URL(prevPageUrl).searchParams.get('page');
    const perpage = new URL(prevPageUrl).searchParams.get('per_page');
    fetch(`http://localhost:3000/repos?user=${userid}&page=${page}&perpage=${perpage}`)
    // fetch(prevPageUrl)
        .then(response => response.json())
        .then(data => {
            paginationLinks = data.pagination; // Update links for further navigation
            console.log(paginationLinks)
            displayRepos(data.data);
            updateButtonVisibility(paginationLinks);
        })
        .catch(error => {
            // Handle errors
            console.error(error.message);
        });
});

document.getElementById('next').addEventListener('click', () => {
    const nextPageUrl = paginationLinks.next; // Get URL for next page
    const page = new URL(nextPageUrl).searchParams.get('page');
    const perpage = new URL(nextPageUrl).searchParams.get('per_page');
    console.log(`next button called: ${nextPageUrl}`);
    fetch(`http://localhost:3000/repos?user=${userid}&page=${page}&perpage=${perpage}`)
        .then(response => response.json())
        .then(data => {
            // Update page options and render repos
            paginationLinks = data.pagination
            console.log(paginationLinks);
            // populatePageDropdown(data.pagination);
            displayRepos(data.data);
            updateButtonVisibility(paginationLinks);
        })
        .catch(error => {
            // Handle errors
            console.error(error.message);
        });
});

