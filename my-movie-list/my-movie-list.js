const BASE_URL = 'https://movie-list.alphacamp.io' // 用 const 而非 let，確保如果未來網址變更，不必一個一個更新
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/' // 處理圖片檔案
const movies = [] //  容器：存放全部電影清單，裡面 80 部電影的陣列
let filteredMovies = [] // 因製作分頁器，故改寫成全域變數
const MOVIES_PER_PAGE = 12  // 新增這行，以製作分頁器


// Render Movie 到 id="data-panel" 的位置裡
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form') // 監聽 Search Bar 提交事件
const searchInput = document.querySelector('#search-input') // 取得搜尋框
const paginator = document.querySelector('#paginator') // 取得分頁器

function renderMovieList(data) { // 降低耦合性：不直接用 movies 而是用 data，是為了避免被特定一組資料綁死
  let rawHTML = '' // 為了讓一個函式只做一件事，裝解析 data 後，產生的 HTML
  data.forEach((item) => { // 因為 data 傳進來的，是電影清單的陣列
    // 需要回傳 item 中的 title, image
    // 可先用 console.log(item)，到 devTool 中，看一下 item 產出的資料長什麼樣子
    // 在電影卡片的 More button 標籤中，新增一個 data-id="${item.id}" 的屬性，以利取出特定電影的 id 資訊
    // 在電影卡片的 btn-add-favorite 中，新增一個 data-id="${item.id}" 的屬性，以利成為加入我的最愛的 id 資訊
    rawHTML += 
    `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
            >
            More
            </button>

            <button class="btn btn-info btn-add-favorite" 
            data-id="${item.id}">
            +
            </button>
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML // 把 rawHTML 放入 dataPanel 裡
} 

function renderPaginator(amount) {
  // 計算總頁數，例如 80 ÷ 12 = 6.多 → 無條件進位成 7 頁
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) 
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    // 實際點擊的是超連結，所以把 data-page="${page} 綁在 a 而非 li 上
    rawHTML += 
    `
    <li class="page-item">
      <a class="page-link" href="#" data-page="${page}">${page}</a>
    </li>
    `
  }
  paginator.innerHTML = rawHTML // 放回 HTML
}

function getMoviesByPage(page) {
  // movies 有 2 種意思，1 種是 80 部完整的電影清單 movies，另 1 種是被使用者搜尋出來的電影 filteredMovies
  // 計算起始 index
  // page 1，回傳 movies 0 - 11
  // page 2，回傳 movies 12 - 23
  // page 3，回傳 movies 24 - 35
  const data = filteredMovies.length ? filteredMovies : movies // 如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) // 原本是 movies.slice，改成 data.slice
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results     
    // console.log(data)
    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = 
    `
    <img 
      src="${POSTER_URL + data.image}" 
      alt="movie-poster" 
      class="img-fluid">
    `
  })
}

function addToFavorite(id) {
  // console.log(id) // 測試事件是否綁定成功
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // 優先回傳加入我的最愛，沒有的話，回傳空陣列
  const movie = movies.find((movie) => movie.id === id)
  // console.log(movie) // 測試
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  // console.log(JSON.stringify(list)) // 測試 
  // console.log(list) // 測試
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 監聽 data panel：新增一個事件監聽器 (event listener) 到 dataPanel，然後用 event.target.matches 來判斷點擊到的物件是否有包含 .btn-show-movie 的 class name。
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 確認點擊的元素帶有電影的 ID：console.log(event.target.dataset.id) 
    showMovieModal(Number(event.target.dataset.id)) // 呼叫函數並傳入電影的 ID 
  } else if (event.target.matches('.btn-add-favorite')) { 
    addToFavorite(Number(event.target.dataset.id)) // 使用者點擊了收藏按鈕，就會呼叫 addToFavorite() 並傳入電影的 id
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return  // 如果被點擊的不是 a 標籤，結束
  // console.log(event.target.dataset.page) // 點擊頁數時，在 console 回傳正確的頁數
  // 透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  // 更新畫面
  renderMovieList(getMoviesByPage(page))
})

// 監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event)  {
  event.preventDefault() // 預防瀏覽器預設行為，即讓頁面不會刷新 (重新導向目前頁面)
  // console.log('click!') // 測試用
  // console.log(searchInput.value) // 測試用：回傳在 search bar 輸入的 input 值
  const keyword = searchInput.value.trim().toLowerCase() // 取得搜尋關鍵字，去除空格並轉小寫
  // let filteredMovies = [] // 儲存符合篩選條件的電影資料，因製作分頁器，故改成全域變數
  // 條件篩選
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )
  // 錯誤處理：輸入無效字串
  // 一開始看到的是 if (!filteredMovies.length)
  // if (!keyword.length) { 
  //   return alert('請輸入有效字串！') // 防止空白提交
  // } 
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }  
  // 重新輸出至畫面，此時畫面上就只會出現符合搜尋結果的電影。
  
  //重製分頁器
  renderPaginator(filteredMovies.length)  // 新增這裡
  renderMovieList(getMoviesByPage(1))  // 原本是 renderMovieList(filteredMovies)，因要預設顯示第 1 頁的搜尋結果
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results) // response.data.results：有 80 個元素的陣列
    // renderMovieList(movies) // 調用函式，因為分頁器而隱藏
    renderMovieList(getMoviesByPage(1)) // 分頁器
    renderPaginator(movies.length) // 分頁器新增
  })
  .catch((err) => console.log(err))
