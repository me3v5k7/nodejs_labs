const calculator_max_length = 10

let setCurrentNumber = null
let setOperator = null
let eraseCurrentNumber = null
let clearScreen = null
let updateCalculatorScreen = null
let addComa = null
let toggleSign = null
let compute = null

let saveToHistory = null
let loadFromHistory = null

document.addEventListener("DOMContentLoaded", function(){
    let calculator_body = document.getElementById("calculator_body")
    let calculator_top_bar = document.getElementById("calculator_top_bar")

    

    let moveObjectTo = function (object, pageX , pageY){
        object.style.left = pageX + "px"
        object.style.top = pageY + "px"
    }

    let local_mouse_pos_x = 0
    let local_mouse_pos_y = 0
    let move = false
    calculator_top_bar.onmousedown = function(event){

        local_mouse_pos_x = event.pageX - calculator_body.offsetLeft
        local_mouse_pos_y = event.pageY - calculator_body.offsetTop
        move = true

        calculator_body.style.boxShadow = "10px 10px 15px black";
    }

    document.onmousemove = function(event){
        if (move){
            moveObjectTo(calculator_body, event.pageX - local_mouse_pos_x, event.pageY - local_mouse_pos_y)
        }
    }

    document.onmouseup = function(event){
        move = false
        calculator_body.style.boxShadow = "5px 5px 10px black";
    }

    let expand_button = document.getElementById("calculator_expand_button")
    let maximized = false

    expand_button.onclick = function(){
        if (maximized){
            calculator_body.style.width = 300 + "px"
            maximized = false
        }
        else {
            calculator_body.style.width = 700 + "px"
            maximized = true
        }
    }

    //calculator logic
    let operated_number_element = document.getElementById("calculator_operated_number");
    let current_number_element = document.getElementById("calculator_current_number");
    let operator_element = document.getElementById("calculator_operator");

    let operated_number = ""
    let current_number = ""
    let operator = null
    let is_current_negaive = false

    appendCurrentNumber = function(number){
        if (current_number.length > calculator_max_length) {
            return
        }

        if (current_number.length == 0 && number == 0) {
            current_number += number + ","
        }
        else {
            current_number += number
        }
        updateCalculatorScreen()
    }

    addComa = function(){
        if (current_number.length == 0){
            return
        }
        if (current_number.indexOf(",") > -1) {
            return
        }
        current_number += ","
        updateCalculatorScreen()
    }

    setOperator = function(opr){
        if (current_number == "" && operated_number == ""){
            return
        }
        else if (current_number != "" && operated_number == ""){
            
            if (is_current_negaive){
                operated_number = "-" + current_number
            }
            else {
                operated_number = current_number
            }

            current_number = ""
            is_current_negaive = false
        }
        else {
            compute()
            setOperator(opr)
        }
        
        operator = opr
        updateCalculatorScreen()
    }

    eraseCurrentNumber = function(){
        if (current_number.length == 0){
            is_current_negaive = false
        }
        current_number = current_number.slice(0, current_number.length - 1)
        updateCalculatorScreen()
    }

    clearScreen = function(){
        if (current_number.length > 0){
            current_number = ""
            is_current_negaive = false
        }
        else {
            operated_number = ""
            operator = null
        }
        
        updateCalculatorScreen()
    }

    toggleSign = function(){
        is_current_negaive = !is_current_negaive
        updateCalculatorScreen()
    }

    compute = function(){
        if (current_number == "") {
            current_number = operated_number
            operated_number = ""
            operator = null
        }
        else {
            let parsed_operated_number = parseFloat(operated_number.replace(",", "."))
            let parsed_current_number = parseFloat(current_number.replace(",", "."))

            if (is_current_negaive){
                parsed_current_number = -parsed_current_number
            }
            let history_string = ""
            switch(operator){
                case null:
                    history_string = parsed_current_number + " = "
                    break
                case 0:
                    current_number = (
                        parsed_operated_number
                        +
                        parsed_current_number
                        ).toString()
                        history_string = parsed_operated_number + " + " + parsed_current_number + " = "
                    break
                case 1:
                    current_number = (
                        parsed_operated_number
                        -
                        parsed_current_number
                        ).toString()
                        history_string = parsed_operated_number + " - " + parsed_current_number + " = "
                    break
                case 2:
                    current_number = (
                        parsed_operated_number
                        *
                        parsed_current_number
                        ).toString()
                        history_string = parsed_operated_number + " * " + parsed_current_number + " = "
                    break
                case 3:
                    current_number = (
                        parsed_operated_number
                        /
                        parsed_current_number
                        ).toString()
                        history_string = parsed_operated_number + " / " + parsed_current_number + " = "
                    break
                case 4:
                    current_number = (
                        parsed_operated_number
                        **
                        parsed_current_number
                        ).toString()
                        history_string = parsed_operated_number + " ^ " + parsed_current_number + " = "
                    break
            }
            history_string += current_number
            saveToHistory(history_string, current_number)

            operated_number = ""
            operator = null
        }
        

        if (current_number[0] == "-"){
            is_current_negaive = true
            current_number = current_number.slice(1)
        }
        else {
            is_current_negaive = false
        }
        current_number = current_number.slice(0, calculator_max_length + 1)
        updateCalculatorScreen()

    }

    updateCalculatorScreen = function(){
        operated_number_element.innerHTML = operated_number
        if (is_current_negaive){
            current_number_element.innerHTML = "-" + current_number
        }
        else {
            current_number_element.innerHTML = current_number
        }

        switch(operator){
            case null:
                operator_element.innerHTML = "";
                break
            case 0:
                operator_element.innerHTML = "+";
                break
            case 1:
                operator_element.innerHTML = "-";
                break
            case 2:
                operator_element.innerHTML = "*";
                break
            case 3:
                operator_element.innerHTML = "/";
                break
            case 4:
                operator_element.innerHTML = "^";
                break
            
        }
    }

    let calculator_history_element = document.getElementById("calculator_history")

    saveToHistory = function(str, reuslt){
        

        calculator_history_element.innerHTML += "<div onclick=\"loadFromHistory(" + reuslt + ")\" class=\"calculator_history_cell\">" + str +"</div>"

        if (calculator_history_element.childElementCount > 8){
            calculator_history_element.children[0].remove()
        }
    }

    loadFromHistory = function(number){
        number = number.toString()
        if (number[0] == "-"){
            is_current_negaive = true
            current_number = number.slice(1)
        }
        else {
            is_current_negaive = false
        }
        current_number = number.slice(0, calculator_max_length + 1)
        updateCalculatorScreen()
    }
})

