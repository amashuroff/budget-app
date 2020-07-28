

// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1, // if no values, there should be no percentages
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(element => {
            sum += element.value;
        });

        data.totals[type] = sum;
    }

    return {
        addItem: function(type, descr, val) {
            
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // create new item based on exp or inc type
            if (type === 'exp') {
                newItem = new Expense(ID, descr, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, descr, val);
            }
            // push it to the new data structure
            data.allItems[type].push(newItem);

            // return a new element(object)
            return newItem;                     
        },
        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget;
            data.budget = Math.ceil(((data.totals.inc - data.totals.exp) * 100)) / 100;

            // calculate the percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp /  data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            };
        },
        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            })
            index = ids.indexOf(id); 

            if (index !== -1) {
                data.allItems[type].splice(index, 1);  // -1 if the item is not in the array
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach((element) => {
                element.calculatePercentage(data.totals.inc);
            })
        },
        getPercentages: function() {
            var allPerc;

            allPerc = data.allItems.exp.map((element) => {
                return element.getPercentage();
            })

            return allPerc;
        },
        testing: function() {
            console.log(data);
        }
    }
})();



// USER EXPERIENCE CONTROLLER
var UIcontroller = (function() {
    
    // private data
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budget: '.budget__value',
        budgetIncome: '.budget__income--value',
        budgetExpense: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        date: '.budget__title--month',
        redClass: 'red',
        redFocusClass: 'red-focus'
    };

    var formatNumber = function(num, type) {
        var num, int, dec;

        /*
        + or - before the number
        2 decimal points
        comma, separating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2); // converted to string
        numSplit = num.split('.');  // returns an array

        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // function for loop over Node lists
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    // public data
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // select inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {

            var html, element;

            // create an html string, with replaced values
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `                        <div class="item clearfix" id="inc${formatNumber(obj.id, type)}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">${formatNumber(obj.value, type)}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;


            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = `                        <div class="item clearfix" id="exp${formatNumber(obj.id, type)}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">${formatNumber(obj.value, type)} </div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
            }

            // insert html to the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },
        deleteListItem: function(selectorID) {
            var element;
            element =  document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        clearInputFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`); // returns a list

            // convert list to an array
            fieldsArr = Array.prototype.slice.call(fields);

            // loop over fieldsArr and clear the input value using for each
            fieldsArr.forEach(element => {    // have access to the curr value, index, entire array
                element.value = '';
            });
            // set the focus to the first element of the fieldsArr(description)
            fieldsArr[0].focus();

        },
        getDOMstrings: function() {     // exposed to the public
            return DOMstrings;
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budget).innerHTML = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncome).innerHTML = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.budgetExpense).innerHTML = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {

                document.querySelector(DOMstrings.budgetPercentage).innerHTML = `${obj.percentage}%`;
            } else {
                document.querySelector(DOMstrings.budgetPercentage).innerHTML = '---';
            }
        },
        displayPercentage: function(percentages) {
            var fields;

            fields = document.querySelectorAll(DOMstrings.itemPercentage); // returns a node list



            nodeListForEach(fields, function(element, index) {

                if (percentages[index] > 0) {
                    element.innerHTML = `${percentages[index]}%`;
                } else {
                    element.innerHTML = '---';
                } 
            });
        },
        displayDate: function() {
            var now, year, month, months;               

            now = new Date() // returns the date of today


            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.date).innerHTML = months[month] + ' ' + year;


        },
        changedType: function() {
            var fields, btn;

            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            btn = document.querySelector(DOMstrings.inputBtn);

            nodeListForEach(fields, function(element) {
                element.classList.toggle(DOMstrings.redFocusClass);
            });

            btn.classList.toggle(DOMstrings.redClass);

        }
    };

})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {      //pass 2 other modules as arguments

    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // set up change events
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        var budget;

        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        budget = budgetCtrl.getBudget();

        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };

    var updatePercentages = function() {
        var percentages;

        // calculate percentages
        budgetCtrl.calculatePercentages();

        // get percentages from budget controller
        percentages = budgetCtrl.getPercentages();

        // display percentages
        UICtrl.displayPercentage(percentages);
    };
    
    var ctrlAddItem = function() {

        var input, newItem, addNewUIItem;
        // 1. get the input data
        input = UICtrl.getInput();
        
        // check if input has a value and a description 
        if (!isNaN(input.value) && input.description !== '' && input.value > 0) {
            
            // 2. add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add item to the UI
            addNewUIItem = UICtrl.addListItem(newItem, input.type);
            

            // 4. clear input fields
            UICtrl.clearInputFields();

            // 5. calculate and update budget
            updateBudget();

            // update item percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {      // works as with addEventListeners
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        // delete the item from data structure
        budgetCtrl.deleteItem(type, ID);

        // delete the item from the UI
        UICtrl.deleteListItem(itemID);

        // update and show the new budget
        updateBudget();

        // update item percentages
        updatePercentages();

    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayDate();
            UIcontroller.displayBudget({
                budget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0
            });
        }
    };
})(budgetController, UIcontroller);


controller.init();