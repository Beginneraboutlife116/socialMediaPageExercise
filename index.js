"use strict"
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users"
const personPanel = document.querySelector("#person-panel")
const people = []

const searchBar = document.getElementById("search-bar")
const searchName = document.querySelector("#search-name")
let filterName = []
let keyword = ""

const PEOPLE_PER_PAGE = 12
const paginator = document.querySelector("#paginator")
const modalFooter = document.querySelector(".modal-footer")
// Functions
// 導入人物
function putPersonIn(items) {
  personPanel.innerHTML = ""
  let personCard = ""
  items.forEach(item => {
    personCard += `
    <div class="card mb-3" style="width: 12rem;">
      <img src="${item.avatar}" class="card-img-top rounded-circle show-detail" data-toggle="modal" data-target="#personal-modal" data-id=${item.id} alt="personal-avatar">
      <div class="card-body">
        <h5 class="name">${item.name}</h5>
        <h5 class="surname">${item.surname}</h5>
        <div class="d-flex justify-content-between">
          <div class="gender d-flex align-items-center justify-content-center" style="width: 30px;">${item.gender === "male" ? `<i class="fas fa-mars fa-lg"></i>` : `<i class="fas fa-venus fa-lg"></i>`}</div>
          <button type="button" class="btn btn-success" data-id=${item.id}>Add</button>
        </div>
      </div>
    </div>`
  })
  personPanel.innerHTML = personCard
}

// 導入該人物的modal
function renderModalPeople(id) {
  const modalPersonName = document.querySelector("#info-name")
  const modalPersonAvatar = document.querySelector("#info-avatar")
  const modalPersonDetail = document.querySelector("#info-detail")
  modalPersonName.innerText = ""
  modalPersonAvatar.innerHTML = ""
  modalPersonDetail.innerHTML = ""
  axios.get(INDEX_URL + "/" + id).then((response) => {
    const detail = response.data
    const name = `${detail.name} ${detail.surname}`
    modalPersonName.innerText += name
    modalPersonAvatar.innerHTML += `<img src=${detail.avatar} class="rounded-3" style="width: 100%;" alt=${name}>`
    modalPersonDetail.innerHTML = `
    <p>
      <i class="fas fa-venus-mars fa-lg"></i> : ${detail.gender === "male" ? `<i class="fas fa-mars fa-lg" style="color: #A65A2E;"></i>` : `<i class="fas fa-venus fa-lg" style="color: #A65A2E;"></i>`}
    </p>
    <p>
      Age: ${detail.age}
    </p>
    <p>
      <i class="fas fa-plane-arrival fa-lg"></i> : ${detail.region}
    </p>
    <p>
      <i class="fas fa-birthday-cake fa-lg"></i> : ${detail.birthday}
    </p>
    <p>
      <i class="fas fa-envelope fa-lg"></i> : ${detail.email}
    </p>`
    modalFooter.lastElementChild.dataset.id = detail.id
  }).catch((error) => {
    console.log(error)
  })
}

// 綁定點擊後改變modal資料
function bindPeopleClickToModalAndFavorite() {
  personPanel.addEventListener("click", function renderToModal(event) {
    const target = event.target
    if (target.classList.contains("show-detail")) {
      renderModalPeople(target.dataset.id)
      // 加入我的最愛
    } else if (target.matches(".btn-success")) {
      addToFavorite(Number(target.dataset.id))
    }
  })
}

function bindModalAdd () {
  modalFooter.addEventListener("click", e => {
    if (e.target.textContent === "Add") {
      addToFavorite(Number(e.target.dataset.id))
    }
  })
}

function addToFavorite(id) {
  const favoritePeople = JSON.parse(localStorage.getItem("favoritePeople")) || []
  if (favoritePeople.some(person => person.id === id)) {
    return alert("已經加入到favorite了!!")
  }
  alert("加入到Favorite清單")
  favoritePeople.push(people.find(person => person.id === id))
  localStorage.setItem("favoritePeople", JSON.stringify(favoritePeople))
}

// 分頁器
function showPaginator() {
  const data = filterName.length ? filterName : people
  let totalPage = Math.ceil(data.length / PEOPLE_PER_PAGE)
  paginator.innerHTML = ""
  let rawHTML = ""
  for (let i = 1; i < (totalPage + 1); i++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#">${i}</a></li>
    `
  }
  return paginator.innerHTML = rawHTML
}

// 決定每分頁資料
function decidePage(num) {
  const data = (filterName.length ? filterName : people) || array
  let start = (num - 1) * PEOPLE_PER_PAGE
  return data.slice(start, start + PEOPLE_PER_PAGE)
}

// 綁定分頁器
function bindPaginatorSelect() {
  paginator.addEventListener("click", function paginatorNum(e) {
    const target = e.target
    let pageNum = Number(target.textContent)
    putPersonIn(decidePage(pageNum))
  })
}

// 搜尋人名
function bindSearchPeopleEvent() {
  searchBar.addEventListener("keyup", function keySearch(e) {
    keyword = searchName.value.trim().toLowerCase()
    if (!keyword) {
      compareName()
    } else {
      searchName.classList.remove("is-invalid")
      compareName()
    }
  })
  searchBar.addEventListener("submit", function searchPeople(e) {
    e.preventDefault()
    if (!keyword) {
      searchName.classList.add("is-invalid")
    }
  })
}

// 從輸入資料比對有無該人名
function compareName() {
  filterName = people.filter(person => person.name.toLowerCase().includes(keyword) || person.surname.toLowerCase().includes(keyword))
  if (!filterName.length) {
    personPanel.innerHTML = `
      <div class="col text-center w-100">
        <h1 style="font-size: 5em;">Oops!!找不到該使用者</h1>
      </div>
    `
  } else {
    putPersonIn(decidePage(1))
    showPaginator()
  }
}

// Works
axios.get(INDEX_URL).then((response) => {
  people.push(...response.data.results)
  putPersonIn(decidePage(1))

  showPaginator()

  bindPeopleClickToModalAndFavorite()

  bindSearchPeopleEvent()

  bindPaginatorSelect()

  bindModalAdd()
}).catch((error) => {
  console.log(error)
})