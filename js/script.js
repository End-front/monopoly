"use strict";

let id = 0;
let players = {}

const playersCardWrapper = document.querySelector('#players_card_wrapper')
const addButton = document.getElementById("add-button")
addButton.style.minHeight = minHeightCartPlayer() + 'px';
function Player(option = {}) {
  this.id = option.id || id;
  this.name = option.name || "Игрок " + (id + 1);
  this.totalSum = option.totalSum || 1500;
  this.prison = option.prison || false;
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
  this.cheakSum = function () {
    if (this.totalSum < 0) {
      if(confirm("У игрока " + name + " не осталось денег. Удалить его из игры?")) {

      }
    }
  }
  this.createPlayer = function () {
    if (id > 3) {
      return alert ('Игроков уже больше 4')
    }
    players[this.id] = new Player();
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
    delButton.addEventListener('click', () => {
        this.removePlayer()
       
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
    let fromStart = createButton('Прошел круг', this.id);
    fromStart.addEventListener('click', function () {
      if(players[event.target.getAttribute('data-idbutton')].prison) {
        players[event.target.getAttribute('data-idbutton')].prison = false;
      } else {
        players[event.target.getAttribute('data-idbutton')].addMoney(200)
      }
      event.target.closest('.cart-player').classList.remove('js-rotation')
    })
    let goToJail = createButton('Сел в тюрьму', this.id)
    goToJail.addEventListener('click', function () {
      players[event.target.getAttribute('data-idbutton')].prison = true;
      event.target.closest('.cart-player').classList.remove('js-rotation')
    })
    let payPlayer = createButton('Заплатить игроку', this.id)
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
    let item = buffer[key];
    new Player(item).createPlayer()
  }
}

window.addEventListener('resize', function() {
  addButton.style.minHeight = minHeightCartPlayer() + "px";
  document.querySelectorAll('.cart-player').forEach(element => {
    element.style.minHeight = minHeightCartPlayer() + "px";
  });
})

document.addEventListener('click', function () {
  // Click not cart player
  if (!event.target.closest('.js-rotation') || event.target.classList.contains('.js-rotation')) {
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

function customConfrim(text) {
  document.querySelector('.custom-confirm__window__text').innerText = text;
  document.querySelector('.custom-confirm').classList.add('active');
    // // Custom confrim button event
    // if (event.target.classList('.custom-confirm__window__true')) {
    //   document.querySelector('.custom-confirm').classList.remove('active');
    //   return true
    // } else if (event.target.classList('.custom-confirm__window__false') || ) {
    //   document.querySelector('.custom-confirm').classList.remove('active');
    //   return false
    // } 
}

addButton.addEventListener('click', function() {
  new Player().createPlayer();
})

