'use strict';


// general var
let games;
let cart = []
let CurrentGame = []
let gameType;



// easy life functions
function getAboutTheGame(type){
    let resp;
    games.types.forEach(element => {
        if(element.type == type){
            resp = element
        }
        else{
            return false
        }
    })
    return resp
}

function showError(msg){
    const errorMsg = document.querySelector(".error__msg")
    errorMsg.innerHTML = msg
}

function dynamicCss(item,attr,value = 'none'){
    item.forEach((e) => {
        attr.forEach((element) => {
            e.style[element] = value
        })
    })
}



// Refresh functions

function resetAll(){
    const gamesList = games.types
    showError(' ')
    CurrentGame = []
    document.querySelector(".bet__number__select").innerHTML = ''
    gamesList.forEach((element,index) => {
        const CurrentElement = document.querySelector(`#bet_type_btn__${index}`)
        dynamicCss([CurrentElement],['color','borderColor'],CurrentElement.dataset.color)
        dynamicCss([CurrentElement],['color','borderColor'],CurrentElement.dataset.color)
        dynamicCss([CurrentElement],['backgroundColor'],'transparent')
    })
}

function refreshPrice(){
    const total_price = document.querySelector(".cart__total")
    let currentPrice = 0
    cart.forEach(element => {
        currentPrice += element.price
    })

    total_price.innerHTML = currentPrice.toString().replace('.',',')
}

// initial and load functions
function init(){
    loadJson()
    const cleargame_btn = document.querySelector(".clear__game")
    cleargame_btn.addEventListener("click", event => {
        event.preventDefault()
        clearGame()
    })

    const submitToCart = document.querySelector(".submit__to__cart")
    submitToCart.addEventListener("click",event => {
        event.preventDefault()
        addToCart()
    })

    const completegame__btn = document.querySelector('.complete__game')
    completegame__btn.addEventListener("click",event => {
        event.preventDefault()
        randomComplete()
    })
    
}


function loadJson(){
    let ajax = new XMLHttpRequest()
    ajax.open('GET','/static/games.json')
    ajax.onreadystatechange = () => {
        if(ajax.status === 200 && ajax.readyState == 4){
            games = JSON.parse(ajax.responseText)
            createGames()
            opening()
        }
    }
    ajax.send()
}

function opening(){
    document.querySelector('.bet__type__button').click()
}




// html generator and css mods functions

function createGames(){
    const gamesList = games.types
    gamesList.forEach((element,index) => {
        const bet__choose__container = document.querySelector('.bet__choose__container')
        const bet__type__button = ` <button class="bet__type__button" data-color="${element.color}" 
        id='bet_type_btn__${index}'>${element.type}</button>`
        bet__choose__container.innerHTML += bet__type__button
        const existing_bet_type_btn = document.querySelector(`#bet_type_btn__${index}`)
        dynamicCss([existing_bet_type_btn],['color','borderColor'],existing_bet_type_btn.dataset.color)
        dynamicCss([existing_bet_type_btn],['color','borderColor'],existing_bet_type_btn.dataset.color)
    })
    addListeners_Types()
    
}


function betGenerator(item){
    let Current = games.types[parseInt(item.id.match(/[0-9]+$/gmi))]
    const bet__desc = document.querySelector('.bet__desc')
    bet__desc.innerHTML = Current.description
    const numbers = ([...Array(parseInt(Current.range + 1)).keys()])
    numbers.shift()
    numbers.forEach((element,index) => {
        document.querySelector(".bet__number__select").innerHTML += `
            <button class="bet__number__button">${element}</button>
        `
    })
    addListeners_Numbers()
}



// Listeners functions

function addListeners_Types(){
    const allBtn = document.querySelectorAll('.bet__type__button')
    allBtn.forEach(element => {
        element.addEventListener("click", (event) => {
            event.preventDefault()
            resetAll()
            gameType = event.target.innerHTML
            dynamicCss([event.target],['backgroundColor'],event.target.dataset.color)
            dynamicCss([event.target],['color'],"white")
            betGenerator(event.target)
        })
    })

    
}


function addListeners_Numbers(){
    const allNumbers = document.querySelectorAll('.bet__number__button')
    allNumbers.forEach(element => {
        element.addEventListener('click', event => {
            event.preventDefault()
            if(element.classList.contains("bet__number__button--selected")){
                element.classList.remove("bet__number__button--selected")
                CurrentGame.splice(CurrentGame.indexOf(parseInt(element.innerHTML)),1)
            }else{
                element.classList.add("bet__number__button--selected")
                CurrentGame.push(parseInt(element.innerHTML))
            }
            if(CurrentGame.length > getAboutTheGame(gameType)['max-number']){
                CurrentGame.pop()
                element.classList.remove("bet__number__button--selected")
                showError(`O maximo de numeros é de ${getAboutTheGame(gameType)['max-number']}`)
            }
            
            else{
                showError('')
            }
            
        })
    })
}

function addEventListener_remove(){
    const deleteBtns = document.querySelectorAll(".cart__item__remove__btn")
    deleteBtns.forEach(element => {
        element.addEventListener("click", event => {
            event.preventDefault()
            deleteCartItem(event)
        })
    })
}



// features functions

function addToCart(){
    if(CurrentGame.length < 1){
        showError(`Por favor escolha ao menos um numero`)
        return
    }
    const items_container = document.querySelector(".cart__items__container")
    let numbers_str = CurrentGame.join(', ')
    cart.push({
        'type':getAboutTheGame(gameType)['type'],
        'price':getAboutTheGame(gameType)['price'],
        'numbers':numbers_str
    })
    items_container.innerHTML += `
                <div class="cart__item" id='cart_item_${cart.length - 1}'>
                    <div class="cart__item__remove__container">
                        <button class="cart__item__remove__btn"><img class="cart__item__remove__btn__img" src="../static/img/delete.svg" alt=""></button>
                    </div>
                    <div class="cart__item__desc " id="cart_item_${cart.length - 1}_desc"> 
                        <span class="cart__item__numbers" >${numbers_str}</span>
                        <div class="cart__item__type__price">
                            <span class="cart__item__type" id="cart_item_${cart.length - 1}_gameType">${gameType}</span>
                            <span class="cart__item__price">${getAboutTheGame(gameType).price.toString().replace('.',',')}</span>
                        </div>
                    </div>
                </div>
                
    `
    const CurrentItem = document.querySelector(`#cart_item_${cart.length - 1}_desc`)
    dynamicCss([CurrentItem],['borderColor'],getAboutTheGame(gameType).color)
    const CurrentItemName = document.querySelector(`#cart_item_${cart.length - 1}_gameType`)
    dynamicCss([CurrentItemName],['color'],getAboutTheGame(gameType).color)
    clearGame()
    addEventListener_remove()
    refreshPrice()
    // Object.keys(cart).forEach((element,index) => {
    //     console.log(element)
    // })
}

function deleteCartItem(event){
    const parent = event.target.closest(".cart__item")
    const item = parent.id.match((/[0-9]+$/gmi))
    
    cart.splice(parseInt(item),1)
    parent.remove()
    refreshPrice()
}


function clearGame(){
    const allNumbers = document.querySelectorAll('.bet__number__button')
    allNumbers.forEach(element => element.classList.remove("bet__number__button--selected"))
    CurrentGame = []
    showError('')
}

function randomComplete(){
    clearGame()
    let numbers = ([...Array(parseInt(getAboutTheGame(gameType)['max-number'] + 1)).keys()])
    let randomNumbers = []
    const allNumbers = document.querySelectorAll('.bet__number__button')
    numbers.shift()
    
    while( randomNumbers.length < getAboutTheGame(gameType)['max-number']){
        randomNumbers.push(Math.floor(Math.random() * getAboutTheGame(gameType).range + 1))
        randomNumbers = randomNumbers.filter((element,index) => randomNumbers.indexOf(element) === index)
    }
    CurrentGame = randomNumbers
    allNumbers.forEach(element => {
        if(randomNumbers.includes(parseInt(element.innerHTML))){
            element.classList.add("bet__number__button--selected")
        }
    })

    showError('')
}


init()