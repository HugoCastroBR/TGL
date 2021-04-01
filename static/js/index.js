'use strict';


// general var
let games; // object from the games.json JSON
let cart = [] // store the itens of the cart
let CurrentGame = [] // store the numbers of the current game
let gameType; // store the current game type



// easy life functions
function getAboutTheGame(type){ // get infos about the game using the type of the game
    let resp; // initializing the result let
    games.types.forEach(element => { // for each element in the object from the games.json
        if(element.type == type){ 
            resp = element // if the current element matches with the type passed
        }
        else{
            return false // or pass or continue idk
        }
    })
    return resp // return the  result as an object
}

function showError(msg){  // show the msg in the page as an error
    const errorMsg = document.querySelector(".error__msg") // selecting the error field
    errorMsg.innerHTML = msg // showing a new error
}

function dynamicCss(item,attr,value = 'none'){  // just an easy way to change the css 
    item.forEach((e) => { // because it can change an array of items with an array of attributes
        attr.forEach((element) => {
            e.style[element] = value
        })
    })
}



// Refresh functions

function resetAll(){ // reset everything that i need
    const gamesList = games.types // get a games array
    showError('') // clean the error
    CurrentGame = [] // reset the current game to empty
    document.querySelector(".bet__number__select").innerHTML = '' // get all colors to original.
    gamesList.forEach((element,index) => {
        const CurrentElement = document.querySelector(`#bet_type_btn__${index}`)
        dynamicCss([CurrentElement],['color','borderColor'],CurrentElement.dataset.color)
        dynamicCss([CurrentElement],['color','borderColor'],CurrentElement.dataset.color)
        dynamicCss([CurrentElement],['backgroundColor'],'transparent')
    })
}

function refreshPrice(){ // calc the price
    const total_price = document.querySelector(".cart__total") // get the field of the price
    let currentPrice = 0 // reset de current price
    cart.forEach(element => { // for each element in cart add price to all prices
        currentPrice += element.price
    })

    total_price.innerHTML = currentPrice.toString().replace('.',',') // put the new current price into the field 
}

// initial and load functions
function init(){ // the first function to run
    loadJson() // get the JSON
    const cleargame_btn = document.querySelector(".clear__game") // get the clear game button
    cleargame_btn.addEventListener("click", event => { //           and add the event putting the function responsible for clear the game numbers
        event.preventDefault()
        clearGame()
    })

    const submitToCart = document.querySelector(".submit__to__cart") // get the add to cart button
    submitToCart.addEventListener("click",event => { //                 and add the event putting the function responsible for add to cart
        event.preventDefault()
        addToCart()
    })

    const completegame__btn = document.querySelector('.complete__game') // get the complete game button
    completegame__btn.addEventListener("click",event => { //               and add the event putting the function responsible for complete the game
        event.preventDefault()
        randomComplete()
    })
    
}


function loadJson(){ // load the json
    let ajax = new XMLHttpRequest() // create a XMLHTTPREQUEST (it's ok but i really like more the fetchAPI :c)
    ajax.open('GET','/static/games.json') // open a connection with the games.json
    ajax.onreadystatechange = () => { // wait it get ready
        if(ajax.status === 200 && ajax.readyState == 4){ // when it get ready
            games = JSON.parse(ajax.responseText) // parse the json to object and store it
            createGames() // create games
            opening() // simulate a click on the first game !
        } // if u are looking here for a error just try to change the directory of the json on line 92
    }
    ajax.send() // run ^
}

function opening(){
    document.querySelector('.bet__type__button').click() // simulate a click on the first element
}

// it's just to not show an ugly empty page 




// html generator and css mods functions

function createGames(){ // create the game options
    const gamesList = games.types // get the list of games
    gamesList.forEach((element,index) => { // for each game
        const bet__choose__container = document.querySelector('.bet__choose__container') // get the container of the games option

        const bet__type__button = ` <button class="bet__type__button" data-color="${element.color}" 
        id='bet_type_btn__${index}'>${element.type}</button>` // store the button with the infos of the game

        bet__choose__container.innerHTML += bet__type__button // add the game button into the container
        const existing_bet_type_btn = document.querySelector(`#bet_type_btn__${index}`) // get the created button
        dynamicCss([existing_bet_type_btn],['color','borderColor'],existing_bet_type_btn.dataset.color) // modify the colors of created button
    })
    addListeners_Types() // add the listeners into these buttons
    
}


function betGenerator(item){ // generate the numbers(buttons) of the bet and the description
    let Current = games.types[parseInt(item.id.match(/[0-9]+$/gmi))] // get the current game
    const bet__desc = document.querySelector('.bet__desc') // get the description field 
    bet__desc.innerHTML = Current.description // change the description for the description in json
    const numbers = ([...Array(parseInt(Current.range + 1)).keys()]) // create a list with x elements, where x is the range in json
    numbers.shift() // remove the element 0
    numbers.forEach((element,index) => { // for each element in these list create a button with the number
        document.querySelector(".bet__number__select").innerHTML += `
            <button class="bet__number__button">${element}</button>
        `
    })
    addListeners_Numbers() // add the listener intho these buttons
}



// Listeners functions

function addListeners_Types(){ // just add the listeners into buttons to select the type of the game
    const allBtn = document.querySelectorAll('.bet__type__button') // get all the buttons
    allBtn.forEach(element => {
        element.addEventListener("click", (event) => { // for each add these functions
            event.preventDefault()
            resetAll() // reset all i need
            gameType = event.target.innerHTML // change the stored game type
            dynamicCss([event.target],['backgroundColor'],event.target.dataset.color)
            dynamicCss([event.target],['color'],"white") // change the colors of the buttons using the color of json
            betGenerator(event.target)
        })
    })

    
}


function addListeners_Numbers(){ // just add listeners to the numbers buttons
    const allNumbers = document.querySelectorAll('.bet__number__button') // select all numbers buttons
    allNumbers.forEach(element => { // for each number
        element.addEventListener('click', event => { // add a function
            event.preventDefault()
            if(element.classList.contains("bet__number__button--selected")){ // toggle the selected button and store into currentGame
                element.classList.remove("bet__number__button--selected")
                CurrentGame.splice(CurrentGame.indexOf(parseInt(element.innerHTML)),1)
            }else{
                element.classList.add("bet__number__button--selected")
                CurrentGame.push(parseInt(element.innerHTML))
            }
            if(CurrentGame.length > getAboutTheGame(gameType)['max-number']){ // if selected a number == or bigger than the max-number on json
                CurrentGame.pop()                                             // show an error
                element.classList.remove("bet__number__button--selected")
                showError(`O maximo de numeros é de ${getAboutTheGame(gameType)['max-number']}`)
            }
            
            else{
                showError('') // clean the errors
            }
            
        })
    })
}

function addEventListener_remove(){ // just add listeners to the remove buttons on the cart
    const deleteBtns = document.querySelectorAll(".cart__item__remove__btn") // select all the remove buttons
    deleteBtns.forEach(element => {
        element.addEventListener("click", event => { // add an event to all
            event.preventDefault()
            deleteCartItem(event) // call the event to remove 
        })
    })
}



// features functions

function addToCart(){ // add the itens into the cart
    if(CurrentGame.length < 1){ // if you had chosen just one number show this error
        showError(`Por favor escolha ao menos um numero`)
        return
    }
    const items_container = document.querySelector(".cart__items__container") // get the items container (the cart)
    let numbers_str = CurrentGame.join(', ')  // transform the list of numbers into a string
    cart.push({ // add these infos to the cart
        'type':getAboutTheGame(gameType)['type'],
        'price':getAboutTheGame(gameType)['price'],
        'numbers':numbers_str
    }) //  it's just the infos about the bet
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
                
    ` // add an item to the cart 

    const CurrentItem = document.querySelector(`#cart_item_${cart.length - 1}_desc`) 
    dynamicCss([CurrentItem],['borderColor'],getAboutTheGame(gameType).color) // change the colors of the item border
    const CurrentItemName = document.querySelector(`#cart_item_${cart.length - 1}_gameType`)
    dynamicCss([CurrentItemName],['color'],getAboutTheGame(gameType).color) // change the colors of the item text
    clearGame() // clean the game
    addEventListener_remove() // add the remove event into these items
    refreshPrice() // calc the price
    

}

function deleteCartItem(event){
    const parent = event.target.closest(".cart__item") // get the parent item of the remove button
    const item = parent.id.match((/[0-9]+$/gmi)) // get the id of it
    
    cart.splice(parseInt(item),1) // delete the item from the cart list
    parent.remove() // delete the item (visible)
    refreshPrice()
}


function clearGame(){
    const allNumbers = document.querySelectorAll('.bet__number__button') // select all number button
    allNumbers.forEach(element => element.classList.remove("bet__number__button--selected")) // remove the selected
    CurrentGame = [] // reset the current game list
    showError('') // clean the error
}

function randomComplete(){ 
    clearGame() // clear the number buttons
    let numbers = ([...Array(parseInt(getAboutTheGame(gameType)['max-number'] + 1)).keys()]) // get all numbers
    numbers.shift() // remove the 0 of the numbers
    let randomNumbers = [] // starting a list.
    const allNumbers = document.querySelectorAll('.bet__number__button') // get all the number buttons
    
    
    while( randomNumbers.length < getAboutTheGame(gameType)['max-number']){ // while don't have the required number of numbers
        randomNumbers.push(Math.floor(Math.random() * getAboutTheGame(gameType).range + 1)) // add a random number to the list
        randomNumbers = randomNumbers.filter((element,index) => randomNumbers.indexOf(element) === index) // remove the repeated numbers
    }
    CurrentGame = randomNumbers // change the current game
    allNumbers.forEach(element => { // and select the numbers(vivible)
        if(randomNumbers.includes(parseInt(element.innerHTML))){
            element.classList.add("bet__number__button--selected")
        }
    })

    showError('') // clear the error
}


init() // easy way to init don't worry