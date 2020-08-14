"use strict";

let id = 0;
let players = {}

const playersCardWrapper = document.querySelector('#players_card_wrapper')
const addButton = document.getElementById("add-button")
addButton.style.minHeight = minHeightCartPlayer() + 'px';
function Player(option = {}) {
  this.id = option.id ? option.id : id;
  this.name = option.name ? option.name : "Игрок " + (id + 1);
  this.totalSum = option.totalSum ? option.totalSum : 1500;
  this.prison = option.prison ? option.prison : false;
  this.addMoney = function (addSum){
    this.totalSum += addSum;
    this.refreshSum()
    this.cheakSum()
    localStorage.setItem('players', JSON.stringify(players))
  };
  this.removeMoney = function (removeSum) {
    this.totalSum -= removeSum;
    this.refreshSum()
    this.cheakSum()
    localStorage.setItem('players', JSON.stringify(players))
  };
  this.refreshSum = function () {
    playersCardWrapper.querySelector('[data-idcard="' + this.id + '"] .cart-player__sum').innerText = this.totalSum + "$"
  }
  this.cheakSum = async function () {
    if (this.totalSum < 0) {
      if( await confirm("У игрока " + this.name + " не осталось денег. Удалить его из игры?")) {
        this.removePlayer()
      }
    }
  }
  this.createPlayer = function () {
    if (id > 3) {
      return alert ('Игроков уже больше 4')
    }
    players[this.id] = new Player(option);
    this.createCard()
    id = 0;
    while (players[id]) {++id};
    localStorage.setItem('players', JSON.stringify(players))
  }
  this.createCard = function () {
    if (playersCardWrapper.children.length > 3) {
      addButton.classList.add('hidden')
    } else {
      addButton.classList.remove("hidden")
    }
    let card = document.createElement('div');
    card.classList.add('cart-player', "col-lg-3");
    card.setAttribute('data-idcard', this.id);
    card.style.minHeight = minHeightCartPlayer() + "px";
    let wrapper = document.createElement('div');
    wrapper.classList.add('cart-player__content')
    let back = document.createElement('div')
    back.classList.add('cart-player__back') 
    let name = document.createElement('div');
    name.classList.add('cart-player__name');
    name.innerText = this.name;
    let sum = document.createElement('div');
    sum.classList.add('cart-player__sum');
    sum.innerHTML = this.totalSum + "$";
    let delButton = createButton('Удалить игрока', this.id)
    delButton.addEventListener('click', async () => {
        if (await confirm("Точно удалить игрока " + this.name + " из игры?")) {
          this.removePlayer()
        }
      } 
    )
    let activeButton = createButton('Активный игрок', this.id)
    activeButton.addEventListener('click', function () {
      document.querySelectorAll('.cart-player').forEach(item => {
        item.classList.remove('js-rotation')
      })
      card.classList.add('js-rotation')
    })
    let wrapperButton = document.createElement('div')
    wrapperButton.classList.add('cart-player__buttons')
    wrapperButton.append(delButton, activeButton)
    let changeSumButton = createButton('Доходы или расходы', this.id);
    changeSumButton.addEventListener('click', async function () {
      let info = await window.modalWindow({
        title: "Доходы/Расходы",
        text: 'Выберете игрока и напишите сумму, которую нужно прибавить или убрать из его суммы',
        preloader: +changeSumButton.getAttribute('data-idbutton'),
        select: 1,
        selectInfo: ['Игрок'],
        inputPlaceholder: "Любое число",
        inputInfo: 'Сумма',
        inputValue: "num"
      })
      if (info) {
        if (info.money > 0) {
          players[info.outer].addMoney(info.money);
        } else {
          players[info.outer].removeMoney(info.money)
        }
      }
    })
    let fromStart = createButton('Прошел круг', this.id);
    fromStart.addEventListener('click', function () {
      if(players[event.target.getAttribute('data-idbutton')].prison) {
        players[event.target.getAttribute('data-idbutton')].prison = false;
        document.querySelector('[data-idbutton="' + event.target.getAttribute('data-idbutton') + '"].prision').innerText = "Сел в тюрьму"
        localStorage.setItem('players', JSON.stringify(players))
      } else {
        players[event.target.getAttribute('data-idbutton')].addMoney(200)
      }
      event.target.closest('.cart-player').classList.remove('js-rotation')
    })
    let goToJail = this.prison ? createButton('Снять обвинение', this.id) : createButton('Сел в тюрьму', this.id)
    goToJail.classList.add('prision')
    goToJail.addEventListener('click', function () {
      if (players[event.target.getAttribute('data-idbutton')].prison) {
        players[event.target.getAttribute('data-idbutton')].prison = false;
        event.target.innerText = "Сел в тюрьму"
      } else {
        players[event.target.getAttribute('data-idbutton')].prison = true;
        event.target.innerText = "Снять обвинение"
      }
      localStorage.setItem('players', JSON.stringify(players))
      event.target.closest('.cart-player').classList.remove('js-rotation')
    })
    let payPlayer = createButton('Заплатить игроку', this.id)
    payPlayer.addEventListener('click', async function () {
      let info = await window.modalWindow({
        title: "Переводы",
        text: 'Выберете нужных игроков, напишите сумму и подвердите свой выбор',
        preloader: +payPlayer.getAttribute('data-idbutton'),
        select: 2,
        inputPlaceholder: "Любое число",
        selectInfo: ['Платит', "Получает"],
        inputInfo: 'Сумма',
        inputValue: "num"
      })
      if (info) {
        if (info.money > 0) {
          players[info.outer].removeMoney(info.money);
          players[info.inner].addMoney(info.money)
        } else {
          players[info.inner].removeMoney(info.money);
          players[info.outer].addMoney(info.money)
        }
      }
    })
    let wrapperButton2 = document.createElement('div')
    wrapperButton2.classList.add('cart-player__buttons')
    wrapperButton2.append(changeSumButton, fromStart, goToJail, payPlayer)
    wrapper.append(name, sum, wrapperButton)
    back.append(name.cloneNode(true), wrapperButton2)
    card.append(wrapper, back)
    addButton.before(card)
  }
  this.removePlayer = function () {
    if (id < 0) {
      return alert('Уже некого удалять')
    }
    this.removeCard()
    id = this.id;
    delete players[this.id];
    localStorage.setItem('players', JSON.stringify(players))
  }
  this.removeCard = function () {
    playersCardWrapper.querySelector('[data-idcard="' + this.id + '"]') ? playersCardWrapper.querySelector('[data-idcard="' + this.id + '"]').remove() : false;
    if (playersCardWrapper.children.length < 5) {
      addButton.classList.remove('hidden')
    } else {
      addButton.classList.add("hidden")
    }
  }
}

if (localStorage.getItem('players')) {
  let buffer =  JSON.parse(localStorage.getItem('players'))
  console.log(buffer)
  for (let key in buffer) {
    new Player(buffer[key]).createPlayer()
  }
  console.log(players)
  localStorage.setItem('players', JSON.stringify(players))
}

window.addEventListener('resize', function() {
  addButton.style.minHeight = minHeightCartPlayer() + "px";
  document.querySelectorAll('.cart-player').forEach(element => {
    element.style.minHeight = minHeightCartPlayer() + "px";
  });
})

document.addEventListener('click', function () {
  // Click not cart player
  if ((!event.target.closest('.js-rotation') || event.target.classList.contains('.js-rotation')) && !clickOnModalWindow(event.target)) {
    document.querySelectorAll('.cart-player').forEach(item => {
      item.classList.remove('js-rotation')
    })
  }
})

function minHeightCartPlayer(){
  let width = addButton.classList.contains('hidden') ? document.querySelector('.cart-player').clientWidth 
  : addButton.clientWidth;
  if (window.clientWidth < 600 && width * 1.122 > 400) width = 360
  return width
}

function createButton(inner, idbutton) {
  let button = document.createElement('button')
  button.classList.add('btn')
  button.innerText = inner;
  button.setAttribute('data-idbutton', idbutton)
  return button;
}

window.confirm = function (message) {
  document.querySelector('.custom-confirm__window__text').innerText = message;
  document.querySelector('.custom-confirm').classList.add('active');
  let confrim = false;
  document.querySelector('.custom-confirm__window__true').onclick = function () {
    confrim = true
    document.getElementById('myconfrim').dispatchEvent(new CustomEvent("close-confrim"))
    document.querySelector('.custom-confirm').classList.remove('active');
  }
  document.querySelector('.custom-confirm__window__false').onclick = function () {
    document.getElementById('myconfrim').dispatchEvent(new CustomEvent("close-confrim"))
    document.querySelector('.custom-confirm').classList.remove('active');
  }

  document.querySelector('.custom-confirm').onclick = function () {
    if(event.target.classList.contains('custom-confirm')) {
      document.getElementById('myconfrim').dispatchEvent(new CustomEvent("close-confrim"))
      event.target.classList.remove('active')
    }
  }
  
  return new Promise(function (resolve, reject) {
    document.getElementById('myconfrim').addEventListener('close-confrim', function () {
      resolve(confrim)
    })
  })
}

window.modalWindow = function (option) {
  let modal = document.querySelector('.custom-modal')
  modal.classList.add('active');
  if (option.title) {
    document.querySelector('.custom-modal__window__title').classList.add("active");
    document.querySelector('.custom-modal__window__title').innerHTML = option.title
  } else {
    document.querySelector('.custom-modal__window__title').classList.remove("active");
  }
  if (option.text) {
    document.querySelector('.custom-modal__window__text').classList.add("active");
    document.querySelector('.custom-modal__window__text').innerHTML = option.text
  } else {
    document.querySelector('.custom-modal__window__text').classList.remove("active");
  }
  if (option.inputInfo) {
    document.querySelector('.custom-modal__window__input').children[0].innerText = option.inputInfo;
  } else {
    document.querySelector('.custom-modal__window__input').children[0].innerText = "";
  }
  if (option.inputPlaceholder) {
    document.querySelector('.custom-modal__window__input input').setAttribute('placeholder', option.inputPlaceholder)
  } else {
    document.querySelector('.custom-modal__window__input input').setAttribute('placeholder', "")
  }

  let info = {};
  let users = []
  for(let key in players) {
    users.push(
      [players[key].name, players[key].id]
    )
  }
  let select;
  let select1
  if (option.select == 1) {
    select = new Select(document.getElementById("select-1"), {
      maxHeight: 3,
      preloader: option.preloader,
      atribute: 'data-outer',
      items: users,
    })
    document.getElementById("select-1").classList.add('active')
  } else if(option.select == 2) {
    select = new Select(document.getElementById("select-1"), {
      maxHeight: 3,
      preloader: option.preloader,
      atribute: 'data-outer',
      items: users,
    })
    document.getElementById("select-1").classList.add('active')
    select1 = new Select(document.getElementById("select-2"), {
      maxHeight: 3,
      preloader: 'Выберете игрока',
      atribute: 'data-inner',
      items: users,
    }) 
    document.getElementById("select-2").classList.add('active')
  }
  if (option.selectInfo) {
    option.selectInfo[0] ? document.getElementById("select-1").children[0].innerText = option.selectInfo[0] : document.getElementById("select-1").children[0].innerText = "";
    option.selectInfo[1] ? document.getElementById("select-2").children[0].innerText = option.selectInfo[1] : document.getElementById("select-2").children[0].innerText = "";
  } else {
    document.getElementById("select-1").children[0].innerText = "";
    document.getElementById("select-2").children[0].innerText = "";
  }

  document.querySelector('.custom-modal__window__true').onclick = function () {
    if(select) select.header.style.borderColor = "#000"
    if(select1) select1.header.style.borderColor = "#000"
    document.getElementById("input").style.borderColor = "#000"
    if (select && !select.header.getAttribute('data-value')) {
      select.header.style.borderColor = "red"
    } else if (select1 && !select1.header.getAttribute('data-value')) {
      select1.header.style.borderColor = "red"
    } else if (option.inputValue == "num" && (document.getElementById("input").value == "" || document.getElementById("input").value == "-" || document.getElementById("input").value.length > 5 || isNaN(document.getElementById("input").value))) {
      document.getElementById("input").style.borderColor = 'red'
    } else {
      if(option.inputValue == "str") {
        if(document.getElementById("input").value != "" && document.getElementById("input").value.length < 3) {
          console.log(document.getElementById("input").value)
          console.log(document.getElementById("input").value.length)
          document.getElementById("input").style.borderColor = 'red'
          return
        } 
      }
      if(select) info.outer = select.header.getAttribute('data-value')
      if(select1) info.inner = select1.header.getAttribute('data-value')
      if (option.inputValue == "num") {
        info.money = +document.getElementById("input").value
      } else {
        info.value = document.getElementById("input").value == "" ? false : document.getElementById("input").value
      }
      document.getElementById('myModalWidnow').dispatchEvent(new CustomEvent("close-modal"))
      document.querySelector('.custom-modal').classList.remove('active');
      if(select) select.destroy()
      if(select1) select1.destroy()
    }
  }
  document.querySelector('.custom-modal__window__false').onclick = function () {
    info = false
    document.getElementById('myModalWidnow').dispatchEvent(new CustomEvent("close-modal"))
    document.querySelector('.custom-modal').classList.remove('active');
    if(select) select.destroy()
    if(select1) select1.destroy()
  }

  modal.onclick = function () {
    if (event.target.classList.contains('custom-modal')) {
      document.getElementById('myModalWidnow').dispatchEvent(new CustomEvent("close-modal"))
      document.querySelector('.custom-modal').classList.remove('active');
      if(select) select.destroy()
      if(select1) select1.destroy()
    }
  }
  
  return new Promise(function (resolve, reject) {
    document.getElementById('myModalWidnow').addEventListener('close-modal', function () {
      resolve(info)
    })
  })
}

function clickOnModalWindow(item) {
  return item.classList.contains('custom-modal') || item.classList.contains('custom-confrim')  || !!item.closest('.custom-modal') || !!item.closest('.custom-confrim')
}

function Select(element, option = {}) {
  let wrapper = document.createElement('div');
  wrapper.classList.add('disable', 'my-select__wrapper')
  if (option.items) {
    for (let index = 0; index < option.items.length; index++) {
      const element = option.items[index];
      if (element == undefined) break;
      let item = document.createElement('div')
      item.innerText = element[0];
      item.setAttribute(option.atribute, element[1])
      wrapper.append(item)
    }
  }
  if (option.absolute) {
    wrapper.classList.add('absolute')
  }
  let header = document.createElement('div');
  header.classList.add('my-select__header');
  header.setAttribute('data-value', "")
  if (typeof option.preloader == 'number') {
    header.innerText = wrapper.querySelector('[' + option.atribute + '="'+ option.preloader +'"]').innerText
    header.setAttribute('data-value', option.preloader)
  } else {
    header.innerText = option.preloader
  }
  header.addEventListener('click', function () {
    wrapper.classList.toggle('disable')
  })
  element.append(header, wrapper)
  wrapper.onclick = function () {
    if (event.target.getAttribute(option.atribute)) {
      header.innerText = event.target.innerText
      header.setAttribute('data-value', event.target.getAttribute(option.atribute))
      wrapper.classList.add('disable')
    }
  }
  wrapper.style.top = header.clientHeight + "px";
  if (typeof option.maxHeight == 'number') {
    if(wrapper.children.length != 0) {
      let heigth = 0;
      if (wrapper.children.length == option.maxHeight) {
        wrapper.style.maxHeight = '95vh'
      } else {
        for (let index = 0; index < option.maxHeight; index++) {
          if (wrapper.children[index]) {
            heigth = heigth + wrapper.children[index].offsetHeight; 
          }
        }
        wrapper.style.maxHeight = heigth + 1 + "px"
      }
    } 
    
  } else {
    wrapper.style.maxHeight = option.maxHeigth;
  }

  return {
    element: element,
    header: header,
    wrapper: wrapper,
    destroy: function () {
      header.remove()
      wrapper.remove()
    },
  }
}

window.cardModal = function (info, items) {
  let modal = document.querySelector('.custom-cardModal')
  modal.classList.add('active');
  let select3 = new Select(document.querySelector('#select-3'), {
    maxHeight: 3,
    preloader: 'Режим',
    atribute: 'data-order',
    absolute: true,
    items: items,
  }) 
  
  let users = []
  for(let key in players) {
    users.push(
      [players[key].name, players[key].id]
    )
  }

  let select4 = new Select(document.querySelector("#select-4"), {
    maxHeight: 3,
    preloader: 'Выберете игрока',
    atribute: 'data-player',
    items: users,
  })

  document.getElementById('button-buy').onclick = function () {
    select3.header.style.borderColor = "#000";
    select4.header.style.borderColor = "#000";
    if (!select4.header.getAttribute('data-value')) {
      select4.header.style.borderColor = "red";
    } else {
      players[select4.header.getAttribute('data-value')].removeMoney(info.deposit * 2)
      modal.classList.remove('active')
      select3.destroy()
      select4.destroy()
    }
  }

  document.getElementById('button-rent').onclick = function () {
    select3.header.style.borderColor = "#000";
    select4.header.style.borderColor = "#000";
    if(!select3.header.getAttribute('data-value')) {
      select3.header.style.borderColor = "red";
    } else if (!select4.header.getAttribute('data-value')) {
      select4.header.style.borderColor = "red";
    } else {
      let rent;
      let idPlayer = select4.header.getAttribute('data-value');
      let selectValue = select3.header.getAttribute('data-value');
      if (!isNaN(selectValue)) {
        rent = info.home[+selectValue];
        players[idPlayer].removeMoney(rent)
      } else {
        players[idPlayer].removeMoney(selectValue == "x2" ? info.rent * 2 : info.rent)
      } 
      modal.classList.remove('active')
      select3.destroy()
      select4.destroy()
   }
  }

  modal.onclick = function () {
    if (event.target.classList.contains('custom-cardModal')) {
      event.target.classList.remove('active')
      select3.destroy()
      select4.destroy()
    }
  }
}


addButton.addEventListener('click', async function() {
  document.querySelector('.custom-modal__window__input input').value = "";
  let info = await window.modalWindow({
    title: "Новый игрок",
    text: 'Напишите имя нового игрока или оставьте поле пустым',
    inputPlaceholder: "Имя игрока",
    inputValue: "str"
  })
  if (info) {
    if(info.value) {
      new Player({
        name: info.value
      }).createPlayer();
    } else {
      new Player().createPlayer();
    }
    
  } 
  
})

let cards = document.querySelectorAll('.grid__card');
for (let index = 0; index < cards.length; index++) {
  const element = cards[index];
  let arr = []
  element.addEventListener('click', function () {
    let card = event.target.closest(".grid__card") ? event.target.closest(".grid__card") : event.target;
    let info = {
      rent: +card.querySelector('.order span').innerText.replace("$", ""),
      home: [],
      deposit: +card.querySelector('.deposit span').innerText.replace("$", ""),
    }
    arr.push(["$" + info.rent, 'normal']);
    arr.push(["$" + (info.rent*2), 'x2']);
    for (let index = 0; index < card.querySelectorAll('.home li .right').length; index++) {
      const element = card.querySelectorAll('.home li .right')[index];
      info.home.push(+element.innerText.replace('$', ""))
      arr.push([element.innerText, index])
    }
    window.cardModal(info, arr)
  })
}

let searcButton = document.querySelectorAll('.search__button button')
for (let index = 0; index < searcButton.length; index++) {
  const element = searcButton[index];
  
  if (element.classList.contains('all')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        element.classList.remove('disable')
      }
    })
  } else if(element.classList.contains('brown')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('brown')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('brown')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('brown')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('ligth-blue')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('light-blue')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('pink')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('pink')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('orange')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('orange')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('red')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('red')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('yellow')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('yellow')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('green')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('green')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } else if(element.classList.contains('dark-blue')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('dark-blue')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } 
  else if(element.classList.contains('train')) {
    element.addEventListener('click', function () {
      for (let index = 0; index < cards.length; index++) {
        const element = cards[index];
        (!element.classList.contains('train')) ? element.classList.add('disable') :
        element.classList.remove('disable');
      }
    })
  } 
}