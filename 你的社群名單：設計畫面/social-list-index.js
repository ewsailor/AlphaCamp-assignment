const BASE_URL = 'https://user-list.alphacamp.io' // 用 const 而非 let，確保如果未來網址變更，不必一個一個更新
const INDEX_URL = BASE_URL + '/api/v1/users/' 
const userlist = [] //  容器：存放全部 200 個 user 陣列的資料

// Render User 到 id="data-panel" 的位置裡
const dataPanel = document.querySelector('#data-panel')
function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {  
    rawHTML += `  
    <div class="col-sm-3">
      <div class="mb-2"> 
        <div class="card">
          <img 
            src="${item.avatar}" 
            class="card-img-top"
            alt="User Avatar" 
            data-bs-toggle="modal" 
            data-bs-target="#user-modal"
            data-id="${item.id}" 
          />
          <div class="card-body" data-id="${item.id}">
            <h5 class="card-title" data-id="${item.id}">
              ${item.name} ${item.surname}
            </h5>
          </div>
        </div>
      </div>
    </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showUserModal(id) { 
//   // if (!id) {
//   //   console.error('Data is undefined:', response)
//   //   return
//   // }
  const userTitle = document.querySelector('#user-modal-title')
  const userName = document.querySelector('#user-modal-name')
  const userEmail = document.querySelector('#user-modal-email')
  const userGender = document.querySelector('#user-modal-gender')
  const userAge = document.querySelector('#user-modal-age')
  const userRegion = document.querySelector('#user-modal-region')
  const userBirthday = document.querySelector('#user-modal-birthday')
  const userAvatar = document.querySelector('#user-modal-avatar') 
  // const userBody = document.querySelector('#user-modal-body') 

//   解答：先將 modal 內容清空，以免出現上一個 user 的資料殘影
//   modalTitle.textContent = ''
//   modalImage.src = ''
//   modalBody.textContent = ''

//   // send request to show api
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data 
      // 是因為這裡是 response.data，而非 response.data.results，所以 innerText 要用 = `${data.name}` 而非直接 = data.name 嗎
      // console.log(response) 
      // console.log(response.data) 
      // console.log(response.data.results)    
      userTitle.innerText = `${data.name} ${data.surname}`
      userName.innerText = `${data.name} ${data.surname}`
      userEmail.innerText = `${data.email}`
      userGender.innerText = `${data.gender}`
      userAge.innerText = `${data.age}`
      userRegion.innerText = `${data.region}`
      userBirthday.innerText = `${data.birthday}`
      // 不知為何錯誤 userBody.innerHTML = `
      // <div class="col-sm-4">
      //   <div>${data.name} ${data.surname}</div>
      //   <div>${data.email}</div>
      //   <div>"gender": "${data.gender}"</div>
      //   <div>"age": ${data.age}</div>
      //   <div>"region": "${data.region}"</div>
      //   <div>"birthday": "${data.birthday}"</div>
      // </div>
      // ` 
      userAvatar.innerHTML = `
       <img 
        src="${data.avatar}" 
        alt="User Avatar"
        class="img-fluid"> 
      ` 
    })
    .catch((err) => console.log(err))
}

// 監聽 data panel：新增一個事件監聽器 (event listener) 到 dataPanel，然後用 event.target.matches 來判斷點擊到的物件是否有包含 .card-img-top 的 class name。
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img-top')) {
    showUserModal(event.target.dataset.id) // 呼叫函數並傳入電影的 ID 
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    userlist.push(...response.data.results) // response.data.results：放入 200 個 user 陣列的資料
    renderUserList(userlist) // 調用函式
  })
  .catch((err) => console.log(err))
