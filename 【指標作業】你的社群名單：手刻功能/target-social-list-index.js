const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const friends = [] //  容器：存放全部 200 個 user 陣列的資料
let filteredFriends = [] // 因製作分頁器，故改寫成全域變數
const FRIENDS_PER_PAGE = 12 // 新增這行，以製作分頁器

// Render Friend 到 id="data-panel" 的位置裡
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form') // 監聽 Search Bar 提交事件
const searchInput = document.querySelector('#search-input') // 取得搜尋框
const paginator = document.querySelector('#paginator') // 取得分頁器

function renderFriendList(data) {
  let rawHTML = ''
  data.forEach(item => { 
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img 
          src="${item.avatar}" 
          class="card-img-top" 
          alt="info-avatar"
        />
        <div class="card-body">
          <h5 class="card-title">
            ${item.name} ${item.surname}
          </h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-info" 
            data-bs-toggle="modal" 
            data-bs-target="#info-modal" 
            data-id="${item.id}">
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })  
  dataPanel.innerHTML = rawHTML
}

// 分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    // 實際點擊的是超連結，所以把 data-page="${page} 綁在 a 而非 li 上
    rawHTML += 
    `
    <li class="page-item">
      <a class="page-link" href="#" data-page="${page}">
        ${page}
      </a>
    </li>
    `
  }
  paginator.innerHTML = rawHTML // 放回 HTML
}

// 分頁器
function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function showInfoModal(id) {
  // get elements
  const modalTitle = document.querySelector('#info-modal-title')
  const modalBody = document.querySelector('#info-modal-body')

  // send request to show api
  axios.get(`${INDEX_URL}${id}`).then(response => {
    const data = response.data
    // insert data into modal ui
    modalTitle.innerText = `${data.name + ' ' + data.surname}`
    modalBody.innerHTML = 
    `
    <div class="row">
      <div class="col-sm-4" id="info-modal-image">
        <img
          src="${data.avatar}"
          alt="info-avatar" class="img-fluid" />
      </div>
      <div class="col-sm-8">
        <p id="modal-age">age: ${data.age}</p>
        <p id="modal-gender">gender: ${data.gender}</p>
        <p id="modal-region">region: ${data.region}</p>
        <p id="modal-birthday">birthday: ${data.birthday}</p>
        <p id="modal-email">email: ${data.email}</p>            
      </div>
    </div>
    `
  })
}

// 我的最愛
function addToFavorite(id) {
  // console.log(id) // 測試事件是否綁定成功
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || [] // 優先回傳加入我的最愛，沒有的話，回傳空陣列
  const friend = friends.find(friend => friend.id === id)
  if (list.some(friend => friend.id === id)) {
    return alert('此好友已經在最愛清單中！')
  }
  list.push(friend)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(Number(event.target.dataset.id))
    // 功能二: 收藏
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 分頁器的監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return // 如果被點擊的不是 a 標籤，結束
  const page = Number(event.target.dataset.page)
  renderFriendList(getFriendsByPage(page)) // 更新畫面
})

// 監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() // 預防瀏覽器預設行為，即讓頁面不會刷新 (重新導向目前頁面)
  const keyword = searchInput.value.trim().toLowerCase()

  filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(keyword) || friend.surname.toLowerCase().includes(keyword)
  )

  if (filteredFriends.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的結果`)
  }
  // 重製分頁器
  renderPaginator(filteredFriends.length)
  renderFriendList(getFriendsByPage(1)) // 預設顯示第 1 頁的搜尋結果
})


// send request to index api
axios
  .get(INDEX_URL)
  .then(response => {
    friends.push(...response.data.results)
    // 分頁器
    renderPaginator(friends.length)
    renderFriendList(getFriendsByPage(1))
  })
  .catch(err => console.log(err))